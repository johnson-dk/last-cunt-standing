import { describe, it, expect } from 'vitest'
import { weeksSurvived, applyResults } from './poolLogic'
import type { Pick } from '../types'

const pick = (overrides: Partial<Pick> & { playerId: string; gameweek: number; teamId: number }): Pick => ({
  teamName: 'Team',
  ...overrides,
})

describe('weeksSurvived', () => {
  const picks: Pick[] = [
    pick({ playerId: 'p1', gameweek: 1, teamId: 1, result: 'win' }),
    pick({ playerId: 'p1', gameweek: 2, teamId: 2, result: 'void' }),
    pick({ playerId: 'p1', gameweek: 3, teamId: 3, result: 'loss' }),
    pick({ playerId: 'p1', gameweek: 4, teamId: 4 }),
    pick({ playerId: 'p2', gameweek: 1, teamId: 1, result: 'win' }),
  ]

  it('counts win and void picks only', () => {
    expect(weeksSurvived(picks, 'p1')).toBe(2)
  })

  it('does not count loss picks', () => {
    expect(weeksSurvived([pick({ playerId: 'p1', gameweek: 1, teamId: 1, result: 'loss' })], 'p1')).toBe(0)
  })

  it('does not count pending picks (no result)', () => {
    expect(weeksSurvived([pick({ playerId: 'p1', gameweek: 1, teamId: 1 })], 'p1')).toBe(0)
  })

  it('only counts picks for the specified player', () => {
    expect(weeksSurvived(picks, 'p2')).toBe(1)
  })

  it('returns 0 for unknown player', () => {
    expect(weeksSurvived(picks, 'unknown')).toBe(0)
  })
})

describe('applyResults', () => {
  const results = new Map<number, 'win' | 'loss' | 'draw' | null>([
    [1, 'win'],
    [2, 'draw'],
    [3, 'loss'],
    [4, null],
  ])

  const picks: Pick[] = [
    pick({ playerId: 'p1', gameweek: 3, teamId: 1 }),
    pick({ playerId: 'p2', gameweek: 3, teamId: 2 }),
    pick({ playerId: 'p3', gameweek: 3, teamId: 3 }),
    pick({ playerId: 'p4', gameweek: 3, teamId: 4 }),
    pick({ playerId: 'p5', gameweek: 2, teamId: 1 }),
  ]

  it('win team pick gets win result', () => {
    const updated = applyResults(picks, 3, results, 'survive')
    expect(updated.find((pk) => pk.playerId === 'p1')?.result).toBe('win')
  })

  it('loss team pick gets loss result', () => {
    const updated = applyResults(picks, 3, results, 'survive')
    expect(updated.find((pk) => pk.playerId === 'p3')?.result).toBe('loss')
  })

  it('unfinished fixture pick gets no result', () => {
    const updated = applyResults(picks, 3, results, 'survive')
    expect(updated.find((pk) => pk.playerId === 'p4')?.result).toBeUndefined()
  })

  it('does not modify picks from other gameweeks', () => {
    const updated = applyResults(picks, 3, results, 'survive')
    expect(updated.find((pk) => pk.playerId === 'p5')?.result).toBeUndefined()
  })

  describe('draw rule: survive', () => {
    it('draw team pick gets void result', () => {
      const updated = applyResults(picks, 3, results, 'survive')
      expect(updated.find((pk) => pk.playerId === 'p2')?.result).toBe('void')
    })
  })

  describe('draw rule: loss', () => {
    it('draw team pick gets loss result', () => {
      const updated = applyResults(picks, 3, results, 'loss')
      expect(updated.find((pk) => pk.playerId === 'p2')?.result).toBe('loss')
    })
  })

  describe('draw rule: repick', () => {
    it('draw team pick is removed from the array', () => {
      const updated = applyResults(picks, 3, results, 'repick')
      expect(updated.find((pk) => pk.playerId === 'p2')).toBeUndefined()
    })

    it('win and loss picks are preserved', () => {
      const updated = applyResults(picks, 3, results, 'repick')
      expect(updated.find((pk) => pk.playerId === 'p1')?.result).toBe('win')
      expect(updated.find((pk) => pk.playerId === 'p3')?.result).toBe('loss')
    })

    it('draw picks from other gameweeks are not removed', () => {
      const crossWeekPicks: Pick[] = [
        pick({ playerId: 'p1', gameweek: 2, teamId: 2, result: 'void' }),
        pick({ playerId: 'p2', gameweek: 3, teamId: 2 }),
      ]
      const updated = applyResults(crossWeekPicks, 3, results, 'repick')
      expect(updated.find((pk) => pk.playerId === 'p1')).toBeDefined()
    })
  })
})
