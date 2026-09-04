import type { FPLTeam, FPLFixture } from '../types'

export async function fetchTeams(): Promise<FPLTeam[]> {
  const res = await fetch('/fpl-api/bootstrap-static/')
  if (!res.ok) throw new Error('Failed to fetch FPL teams')
  const data = await res.json()
  return data.teams as FPLTeam[]
}

export async function fetchFixtures(gameweek: number): Promise<FPLFixture[]> {
  const res = await fetch(`/fpl-api/fixtures/?event=${gameweek}`)
  if (!res.ok) throw new Error('Failed to fetch fixtures')
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
