import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { fetchFixtures, getTeamResults } from '../lib/fpl'
import type { Pick, Player } from '../types'

export default function Picks() {
  const { pool, setPool, teams } = useApp()
  const [gameweek, setGameweek] = useState(pool.settings.currentGameweek)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activePlayers = pool.players.filter((p) => p.status === 'active')

  const usedTeams = (player: Player): Set<number> => {
    return new Set(
      pool.picks.filter((pk) => pk.playerId === player.id).map((pk) => pk.teamId),
    )
  }

  const pickForPlayer = (playerId: string): Pick | undefined =>
    pool.picks.find((pk) => pk.playerId === playerId && pk.gameweek === gameweek)

  const updatePick = (player: Player, teamId: number) => {
    const team = teams.find((t) => t.id === teamId)
    const teamName = team?.name ?? `Team ${teamId}`
    const existing = pickForPlayer(player.id)

    const newPick: Pick = {
      playerId: player.id,
      gameweek,
      teamId,
      teamName,
    }

    const picks = existing
      ? pool.picks.map((pk) =>
          pk.playerId === player.id && pk.gameweek === gameweek ? newPick : pk,
        )
      : [...pool.picks, newPick]

    setPool({ ...pool, picks })
  }

  const processResults = async () => {
    setProcessing(true)
    setError(null)
    try {
      const fixtures = await fetchFixtures(gameweek)
      const results = getTeamResults(fixtures)

      const updatedPicks = pool.picks.map((pk) => {
        if (pk.gameweek !== gameweek) return pk
        const outcome = results.get(pk.teamId)
        if (outcome === null || outcome === undefined) return pk
        const result: Pick['result'] = outcome === 'win' ? 'win' : outcome === 'draw' ? 'void' : 'loss'
        return { ...pk, result }
      })

      const updatedPlayers = pool.players.map((player) => {
        const pick = updatedPicks.find(
          (pk) => pk.playerId === player.id && pk.gameweek === gameweek,
        )
        if (pick?.result === 'loss') {
          return { ...player, status: 'eliminated' as const, eliminatedWeek: gameweek }
        }
        return player
      })

      setPool({ ...pool, picks: updatedPicks, players: updatedPlayers })
    } catch {
      setError('Failed to fetch results. Check your connection or try again.')
    } finally {
      setProcessing(false)
    }
  }

  const teamName = (id: number): string => {
    return teams.find((t) => t.id === id)?.name ?? `Team ${id}`
  }

  return (
    <div className="page">
      <div className="card gameweek-header">
        <button
          className="btn btn--ghost"
          onClick={() => setGameweek((gw) => Math.max(1, gw - 1))}
          disabled={gameweek <= 1}
        >
          ←
        </button>
        <h2>Gameweek {gameweek}</h2>
        <button
          className="btn btn--ghost"
          onClick={() => setGameweek((gw) => Math.min(38, gw + 1))}
          disabled={gameweek >= 38}
        >
          →
        </button>
        <button
          className="btn btn--primary"
          onClick={processResults}
          disabled={processing}
        >
          {processing ? 'Processing…' : 'Process Results'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Pick</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {activePlayers.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No active players
                </td>
              </tr>
            )}
            {activePlayers.map((player) => {
              const pick = pickForPlayer(player.id)
              const used = usedTeams(player)

              return (
                <tr key={player.id}>
                  <td>{player.name}</td>
                  <td>
                    {teams.length > 0 ? (
                      <select
                        value={pick?.teamId ?? ''}
                        onChange={(e) => updatePick(player, Number(e.target.value))}
                      >
                        <option value="">— Select team —</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id} disabled={used.has(team.id) && team.id !== pick?.teamId}>
                            {team.name}{used.has(team.id) && team.id !== pick?.teamId ? ' (used)' : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{pick ? teamName(pick.teamId) : '—'}</span>
                    )}
                  </td>
                  <td>
                    {pick?.result ? (
                      <span className={`badge badge--${pick.result}`}>{pick.result}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
