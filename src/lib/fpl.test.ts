import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchCurrentGameweek, getTeamResults } from './fpl'

const mockFetch = (body: unknown, ok = true, contentType = 'application/json') => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok,
        headers: { get: () => contentType },
        json: () => Promise.resolve(body),
        text: () => Promise.resolve(''),
      }),
    ),
  )
}

afterEach(() => vi.unstubAllGlobals())

const future = new Date(Date.now() + 7 * 86_400_000).toISOString()
const nextFar = new Date(Date.now() + 14 * 86_400_000).toISOString()
const past = new Date(Date.now() - 86_400_000).toISOString()

describe('fetchCurrentGameweek', () => {
  it('returns current GW and deadline when deadline has not passed', async () => {
    mockFetch({
      events: [
        { id: 3, deadline_time: future, is_current: true, is_next: false },
        { id: 4, deadline_time: nextFar, is_current: false, is_next: true },
      ],
    })
    const result = await fetchCurrentGameweek()
    expect(result.gameweek).toBe(3)
    expect(result.deadlineTime).toBe(future)
  })

  it('advances to next GW when current deadline has passed', async () => {
    mockFetch({
      events: [
        { id: 3, deadline_time: past, is_current: true, is_next: false },
        { id: 4, deadline_time: nextFar, is_current: false, is_next: true },
      ],
    })
    const result = await fetchCurrentGameweek()
    expect(result.gameweek).toBe(4)
    expect(result.deadlineTime).toBe(nextFar)
  })

  it('returns next GW with null deadline when next has no deadline after current passes', async () => {
    mockFetch({
      events: [
        { id: 3, deadline_time: past, is_current: true, is_next: false },
      ],
    })
    const result = await fetchCurrentGameweek()
    expect(result.gameweek).toBe(3)
    expect(result.deadlineTime).toBeNull()
  })

  it('returns null on failed fetch', async () => {
    mockFetch({}, false)
    const result = await fetchCurrentGameweek()
    expect(result.gameweek).toBeNull()
    expect(result.deadlineTime).toBeNull()
  })

  it('returns null on non-JSON response', async () => {
    mockFetch('<html>', true, 'text/html')
    const result = await fetchCurrentGameweek()
    expect(result.gameweek).toBeNull()
    expect(result.deadlineTime).toBeNull()
  })
})

describe('getTeamResults', () => {
  it('home win: home gets win, away gets loss', () => {
    const r = getTeamResults([
      { id: 1, event: 3, team_h: 1, team_a: 2, team_h_score: 2, team_a_score: 0, finished: true },
    ])
    expect(r.get(1)).toBe('win')
    expect(r.get(2)).toBe('loss')
  })

  it('away win: away gets win, home gets loss', () => {
    const r = getTeamResults([
      { id: 1, event: 3, team_h: 1, team_a: 2, team_h_score: 0, team_a_score: 1, finished: true },
    ])
    expect(r.get(1)).toBe('loss')
    expect(r.get(2)).toBe('win')
  })

  it('draw: both teams get draw', () => {
    const r = getTeamResults([
      { id: 1, event: 3, team_h: 1, team_a: 2, team_h_score: 1, team_a_score: 1, finished: true },
    ])
    expect(r.get(1)).toBe('draw')
    expect(r.get(2)).toBe('draw')
  })

  it('unfinished fixture: both teams get null', () => {
    const r = getTeamResults([
      { id: 1, event: 3, team_h: 1, team_a: 2, team_h_score: null, team_a_score: null, finished: false },
    ])
    expect(r.get(1)).toBeNull()
    expect(r.get(2)).toBeNull()
  })

  it('handles multiple fixtures independently', () => {
    const r = getTeamResults([
      { id: 1, event: 3, team_h: 1, team_a: 2, team_h_score: 2, team_a_score: 0, finished: true },
      { id: 2, event: 3, team_h: 3, team_a: 4, team_h_score: 1, team_a_score: 1, finished: true },
    ])
    expect(r.get(1)).toBe('win')
    expect(r.get(3)).toBe('draw')
    expect(r.get(4)).toBe('draw')
  })
})
