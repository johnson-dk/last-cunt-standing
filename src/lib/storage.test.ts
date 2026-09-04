import { describe, it, expect, beforeEach } from 'vitest'
import { loadPool, savePool, createCompetition } from './storage'
import type { PoolData } from '../types'

beforeEach(() => {
  localStorage.clear()
})

const basePool = (): PoolData => ({
  settings: {
    name: 'Test Pool',
    entryFee: 10,
    prizeStructure: [],
    currentGameweek: 3,
    drawRule: 'survive',
  },
  players: [
    { id: 'p1', name: 'Alice', paymentStatus: 'paid', status: 'active' },
    { id: 'p2', name: 'Bob', paymentStatus: 'unpaid', status: 'active' },
  ],
  picks: [],
})

describe('loadPool (localStorage)', () => {
  it('creates default Season 1 competition on first run', async () => {
    const { pool, competitionId } = await loadPool(null)
    expect(pool.settings.name).toBe('Last Man Standing')
    expect(pool.players).toHaveLength(0)
    expect(pool.picks).toHaveLength(0)
    expect(competitionId).toMatch(/^comp_\d+$/)
  })

  it('persists competition id in lms-root', async () => {
    const { competitionId } = await loadPool(null)
    const root = JSON.parse(localStorage.getItem('lms-root')!)
    expect(root.activeCompetitionId).toBe(competitionId)
  })

  it('loads previously saved pool data', async () => {
    const { competitionId } = await loadPool(null)
    await savePool(null, competitionId, basePool())
    const { pool } = await loadPool(null)
    expect(pool.settings.name).toBe('Test Pool')
    expect(pool.players).toHaveLength(2)
    expect(pool.players[0].name).toBe('Alice')
  })
})

describe('savePool (localStorage)', () => {
  it('updates settings and players', async () => {
    const { competitionId } = await loadPool(null)
    const data = basePool()
    await savePool(null, competitionId, data)
    const { pool } = await loadPool(null)
    expect(pool.settings.entryFee).toBe(10)
    expect(pool.players[1].name).toBe('Bob')
  })

  it('preserves competition metadata', async () => {
    const { competitionId } = await loadPool(null)
    await savePool(null, competitionId, basePool())
    const raw = JSON.parse(localStorage.getItem(`lms-comp-${competitionId}`)!)
    expect(raw.name).toBe('Season 1')
    expect(raw.id).toBe(competitionId)
  })
})

describe('createCompetition (localStorage)', () => {
  it('resets eliminated players to active and clears eliminatedWeek', async () => {
    const pool: PoolData = {
      ...basePool(),
      players: [
        { id: 'p1', name: 'Alice', paymentStatus: 'paid', status: 'eliminated', eliminatedWeek: 5 },
      ],
    }
    await createCompetition(null, 'Season 2', 15, pool)
    const { pool: loaded } = await loadPool(null)
    expect(loaded.players[0].status).toBe('active')
    expect(loaded.players[0].eliminatedWeek).toBeUndefined()
  })

  it('clears all picks in the new competition', async () => {
    const pool: PoolData = {
      ...basePool(),
      picks: [{ playerId: 'p1', gameweek: 3, teamId: 1, teamName: 'Arsenal', result: 'win' }],
    }
    await createCompetition(null, 'Season 2', 15, pool)
    const { pool: loaded } = await loadPool(null)
    expect(loaded.picks).toHaveLength(0)
  })

  it('sets currentGameweek to the new start gameweek', async () => {
    await createCompetition(null, 'Season 2', 15, basePool())
    const { pool } = await loadPool(null)
    expect(pool.settings.currentGameweek).toBe(15)
  })

  it('sets lms-root to point to the new competition', async () => {
    const newId = await createCompetition(null, 'Season 2', 15, basePool())
    const root = JSON.parse(localStorage.getItem('lms-root')!)
    expect(root.activeCompetitionId).toBe(newId)
  })
})
