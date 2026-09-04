import { useApp } from '../context/AppContext'
import type { Player } from '../types'

export default function History() {
  const { pool, currentFplGameweek } = useApp()
  const { players, picks, settings } = pool

  const maxGw = picks.length > 0
    ? Math.max(currentFplGameweek ?? settings.currentGameweek, Math.max(...picks.map((p) => p.gameweek)))
    : 0
  const gameweeks = maxGw > 0 ? Array.from({ length: maxGw }, (_, i) => i + 1) : []

  const activePlayers = players.filter((p) => p.status === 'active')
  const eliminatedPlayers = players
    .filter((p) => p.status === 'eliminated')
    .sort((a, b) => (b.eliminatedWeek ?? 0) - (a.eliminatedWeek ?? 0))
  const sorted: Player[] = [...activePlayers, ...eliminatedPlayers]

  const getPick = (playerId: string, gameweek: number) =>
    picks.find((pk) => pk.playerId === playerId && pk.gameweek === gameweek)

  if (players.length === 0 || gameweeks.length === 0) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No pick history yet — add players and enter picks first.
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card history-card">
        <div className="history-scroll">
          <table className="table history-table">
            <thead>
              <tr>
                <th className="history-player-col">Player</th>
                {gameweeks.map((gw) => (
                  <th key={gw} className="history-gw-col">GW{gw}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((player) => (
                <tr key={player.id}>
                  <td className="history-player-col history-player-name">
                    <span className={`history-status-dot history-status-dot--${player.status}`} />
                    {player.name}
                  </td>
                  {gameweeks.map((gw) => {
                    const pick = getPick(player.id, gw)
                    return (
                      <td key={gw} className={`history-pick-cell${pick?.result ? ` history-pick-cell--${pick.result}` : ''}`}>
                        {pick ? pick.teamName : <span className="history-no-pick">—</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
