import type { FPLTeam, FPLFixture } from '../types'

interface FPLEvent {
  id: number
  deadline_time: string
  is_current: boolean
  is_next: boolean
}

export async function fetchCurrentGameweek(): Promise<{ gameweek: number | null; deadlineTime: string | null }> {
  const res = await fetch('/fpl-api/bootstrap-static/')
  if (!res.ok) return { gameweek: null, deadlineTime: null }
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) return { gameweek: null, deadlineTime: null }
  const data = await res.json()
  const events = data.events as FPLEvent[]
  const current = events.find((e) => e.is_current)
  const next = events.find((e) => e.is_next)

  const now = Date.now()
  const currentDeadlinePassed =
    !current || new Date(current.deadline_time).getTime() < now

  // Once the current GW deadline has passed, we're in the lead-up to the next GW
  const gameweek = currentDeadlinePassed
    ? (next?.id ?? current?.id ?? null)
    : (current?.id ?? next?.id ?? null)

  const deadlineTime = currentDeadlinePassed
    ? (next?.deadline_time ?? null)
    : current!.deadline_time

  return { gameweek, deadlineTime }
}

export async function fetchTeams(): Promise<FPLTeam[]> {
  const res = await fetch('/fpl-api/bootstrap-static/')
  if (!res.ok) {
    const errorBody = await res.text().catch(() => '')
    console.error(`[FPL] fetchTeams failed: HTTP ${res.status}`, errorBody)
    throw new Error(`Failed to fetch FPL teams: HTTP ${res.status}`)
  }
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    const errorBody = await res.text().catch(() => '')
    console.error('[FPL] fetchTeams returned non-JSON response:', errorBody.slice(0, 300))
    throw new Error('FPL API returned non-JSON response (possibly index.html)')
  }
  const data = await res.json()
  return data.teams as FPLTeam[]
}

export async function fetchFixtures(gameweek: number): Promise<FPLFixture[]> {
  const res = await fetch(`/fpl-api/fixtures/?event=${gameweek}`)
  if (!res.ok) {
    const errorBody = await res.text().catch(() => '')
    console.error(`[FPL] fetchFixtures failed: HTTP ${res.status}`, errorBody)
    throw new Error(`Failed to fetch fixtures: HTTP ${res.status}`)
  }
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    const errorBody = await res.text().catch(() => '')
    console.error('[FPL] fetchFixtures returned non-JSON response:', errorBody.slice(0, 300))
    throw new Error('FPL API returned non-JSON response (possibly index.html)')
  }
  const data: FPLFixture[] = await res.json()
  return data
}

export function getTeamResults(
  fixtures: FPLFixture[],
): Map<number, 'win' | 'loss' | 'draw' | null> {
  const results = new Map<number, 'win' | 'loss' | 'draw' | null>()
  for (const f of fixtures) {
    if (!f.finished || f.team_h_score === null || f.team_a_score === null) {
      results.set(f.team_h, null)
      results.set(f.team_a, null)
      continue
    }
    if (f.team_h_score > f.team_a_score) {
      results.set(f.team_h, 'win')
      results.set(f.team_a, 'loss')
    } else if (f.team_a_score > f.team_h_score) {
      results.set(f.team_a, 'win')
      results.set(f.team_h, 'loss')
    } else {
      results.set(f.team_h, 'draw')
      results.set(f.team_a, 'draw')
    }
  }
  return results
}
