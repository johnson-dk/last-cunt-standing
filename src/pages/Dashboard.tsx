import { useApp } from '../context/AppContext'
import type { Player } from '../types'

export default function Dashboard() {
  const { pool } = useApp()
  const { players, picks, settings } = pool

  const activePlayers = players.filter((p) => p.status === 'active')
  const eliminatedPlayers = players
    .filter((p) => p.status === 'eliminated')
    .sort((a, b) => (b.eliminatedWeek ?? 0) - (a.eliminatedWeek ?? 0))

  const sorted: Player[] = [...activePlayers, ...eliminatedPlayers]
  const pot = players.length * settings.entryFee

  const weeksSurvived = (player: Player): number => {
    return picks.filter((pk) => pk.playerId === player.id).length
  }

  const lastPick = (player: Player): string => {
    const playerPicks = picks
      .filter((pk) => pk.playerId === player.id)
      .sort((a, b) => b.gameweek - a.gameweek)
    return playerPicks[0]?.teamName ?? '—'
  }

  return (
    <div className="page">
      <div className="stats-row">
        <div className="card stat-card">
          <div className="stat-card__value">{activePlayers.length}</div>
          <div className="stat-card__label">Survivors</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card__value">£{pot.toLocaleString()}</div>
          <div className="stat-card__label">Prize Pot</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card__value">{players.length}</div>
          <div className="stat-card__label">Total Players</div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Status</th>
              <th>Weeks Survived</th>
              <th>Last Pick</th>
              <th>Eliminated GW</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No players yet — add some in Players tab
                </td>
              </tr>
            )}
            {sorted.map((player) => (
              <tr key={player.id}>
                <td>{player.name}</td>
                <td>
                  <span className={`badge badge--${player.status}`}>{player.status}</span>
                </td>
                <td>{weeksSurvived(player)}</td>
                <td>{lastPick(player)}</td>
                <td>{player.eliminatedWeek ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
