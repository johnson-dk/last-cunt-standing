import type { Pick, DrawRule } from '../types'

export function weeksSurvived(picks: Pick[], playerId: string): number {
  return picks.filter(
    (pk) => pk.playerId === playerId && (pk.result === 'win' || pk.result === 'void'),
  ).length
}

export function applyResults(
  picks: Pick[],
  gameweek: number,
  results: Map<number, 'win' | 'loss' | 'draw' | null>,
  drawRule: DrawRule,
): Pick[] {
  let updated = picks.map((pk) => {
    if (pk.gameweek !== gameweek) return pk
    const outcome = results.get(pk.teamId)
    if (outcome === null || outcome === undefined) return pk
    let result: Pick['result']
    if (outcome === 'win') result = 'win'
    else if (outcome === 'draw') result = drawRule === 'loss' ? 'loss' : 'void'
    else result = 'loss'
    return { ...pk, result }
  })
  if (drawRule === 'repick') {
    updated = updated.filter(
      (pk) => !(pk.gameweek === gameweek && pk.result === 'void'),
    )
  }
  return updated
}
