import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { loadAllCompetitions, loadCompetitionPool } from '../lib/storage'
import type { CompetitionMeta, Player, PoolData } from '../types'

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function weeksSurvived(player: Player, picks: PoolData['picks']): number {
  return picks.filter(
    (pk) => pk.playerId === player.id && (pk.result === 'win' || pk.result === 'void'),
  ).length
}

export default function Archive() {
  const { userId } = useApp()
  const [competitions, setCompetitions] = useState<CompetitionMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedPool, setSelectedPool] = useState<PoolData | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    loadAllCompetitions(userId)
      .then(setCompetitions)
      .finally(() => setLoading(false))
  }, [userId])

  const selectCompetition = async (id: string) => {
    if (selected === id) {
      setSelected(null)
      setSelectedPool(null)
      return
    }
    setSelected(id)
    setLoadingDetail(true)
    try {
      const pool = await loadCompetitionPool(userId, id)
      setSelectedPool(pool)
    } finally {
      setLoadingDetail(false)
    }
  }

  if (loading) {
    return <div className="page"><div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div></div>
  }

  if (competitions.length === 0) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No competitions yet — start one from Settings.
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {competitions.map((comp) => (
        <div key={comp.id} className="card">
          <div
            className="archive-row"
            onClick={() => selectCompetition(comp.id)}
            style={{ cursor: 'pointer' }}
          >
            <div>
              <div className="archive-row__name">{comp.name}</div>
              <div className="archive-row__meta">
                Started GW{comp.startGameweek} · {formatDate(comp.createdAt)} · {comp.playerCount} players
              </div>
            </div>
            <div className="archive-row__status">
              {comp.winner ? (
                <span className="badge badge--active">Winner: {comp.winner}</span>
              ) : (
                <span className="badge badge--eliminated">Ongoing</span>
              )}
            </div>
          </div>

          {selected === comp.id && (
            <div className="archive-detail">
              {loadingDetail || !selectedPool ? (
                <div style={{ color: 'var(--color-text-muted)', padding: '0.75rem 0' }}>Loading…</div>
              ) : (
                <table className="table" style={{ marginTop: '1rem' }}>
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Status</th>
                      <th>Weeks Survived</th>
                      <th>Eliminated GW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ...selectedPool.players.filter((p) => p.status === 'active'),
                      ...selectedPool.players
                        .filter((p) => p.status === 'eliminated')
                        .sort((a, b) => (b.eliminatedWeek ?? 0) - (a.eliminatedWeek ?? 0)),
                    ].map((player) => (
                      <tr key={player.id}>
                        <td>{player.name}</td>
                        <td>
                          <span className={`badge badge--${player.status}`}>{player.status}</span>
                        </td>
                        <td>{weeksSurvived(player, selectedPool.picks)}</td>
                        <td>{player.eliminatedWeek ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
