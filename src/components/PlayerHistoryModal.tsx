import { useEffect } from 'react'
import type { Player, Pick } from '../types'

interface Props {
  player: Player
  picks: Pick[]
  onClose: () => void
}

export default function PlayerHistoryModal({ player, picks, onClose }: Props) {
  const playerPicks = picks
    .filter((pk) => pk.playerId === player.id)
    .sort((a, b) => a.gameweek - b.gameweek)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <h2 className="modal__title">{player.name}</h2>
            <span className={`badge badge--${player.status}`}>{player.status}</span>
            {player.eliminatedWeek && (
              <span className="modal__elim"> · Eliminated Gameweek {player.eliminatedWeek}</span>
            )}
          </div>
          <button className="btn btn--ghost modal__close" onClick={onClose}>✕</button>
        </div>

        {playerPicks.length === 0 ? (
          <p className="modal__empty">No picks recorded yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Gameweek</th>
                <th>Team</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {playerPicks.map((pk) => (
                <tr key={pk.gameweek}>
                  <td>{pk.gameweek}</td>
                  <td>{pk.teamName}</td>
                  <td>
                    {pk.result ? (
                      <span className={`badge badge--${pk.result}`}>{pk.result}</span>
                    ) : (
                      <span className="badge" style={{ background: 'transparent', color: 'var(--color-text-muted)' }}>pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
