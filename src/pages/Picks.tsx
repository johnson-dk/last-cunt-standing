import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { fetchFixtures, getTeamResults } from '../lib/fpl'
import { applyResults } from '../lib/poolLogic'
import { useCountdown, formatDeadline } from '../hooks/useCountdown'
import type { Pick, Player } from '../types'

export default function Picks() {
  const { pool, setPool, teams, currentFplGameweek, deadlineTime } = useApp()
  const countdown = useCountdown(deadlineTime)
  const [gameweek, setGameweek] = useState(pool.settings.currentGameweek)
  const didInitGw = useRef(false)

  useEffect(() => {
    if (currentFplGameweek !== null && !didInitGw.current) {
      didInitGw.current = true
      setGameweek(currentFplGameweek)
    }
  }, [currentFplGameweek])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFutureWeek = currentFplGameweek !== null && gameweek > currentFplGameweek
  const isAlreadyProcessed = pool.picks.some((pk) => pk.gameweek === gameweek && pk.result !== undefined)
  // Picks are locked for past weeks (deadline already passed) and for the current
  // GW once its deadline has passed (countdown.passed) - prevents last-minute changes
  const isClosed =
    currentFplGameweek !== null &&
    (gameweek < currentFplGameweek ||
      (gameweek === currentFplGameweek && countdown.passed))
  const canProcess = !processing && !isFutureWeek && !isAlreadyProcessed

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
      const drawRule = pool.settings.drawRule ?? 'survive'
      const updatedPicks = applyResults(pool.picks, gameweek, results, drawRule)

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
        <div className="gw-select-group">
          <span className="gw-select-label">GW</span>
          <select
            className="gw-select"
            value={gameweek}
            onChange={(e) => setGameweek(Number(e.target.value))}
          >
            {Array.from({ length: 38 }, (_, i) => i + 1).map((gw) => (
              <option key={gw} value={gw}>{gw}</option>
            ))}
          </select>
        </div>
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
          disabled={!canProcess}
        >
          {processing ? 'Processing…' : isFutureWeek ? 'Future week' : isAlreadyProcessed ? 'Already processed' : 'Process Results'}
        </button>
      </div>

      {gameweek === currentFplGameweek && (
        isClosed ? (
          <div className="deadline-banner deadline-banner--passed">
            <span className="deadline-banner__label">Deadline passed — picks locked</span>
          </div>
        ) : deadlineTime ? (
          <div className={`deadline-banner deadline-banner--${countdown.urgency}`}>
            <span className="deadline-banner__label">
              Pick deadline: {formatDeadline(deadlineTime)}
            </span>
            <span className="deadline-banner__countdown">
              {countdown.fullLabel}
            </span>
          </div>
        ) : (
          <div className="deadline-banner deadline-banner--normal">
            <span className="deadline-banner__label">Open for picks — deadline TBC</span>
          </div>
        )
      )}

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
                        disabled={isClosed}
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
