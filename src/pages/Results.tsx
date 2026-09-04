import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { fetchFixtures } from '../lib/fpl'
import type { FPLFixture } from '../types'

export default function Results() {
  const { pool, teams, currentFplGameweek } = useApp()
  const [gameweek, setGameweek] = useState(pool.settings.currentGameweek)
  const [fixtures, setFixtures] = useState<FPLFixture[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const didInitGw = useRef(false)

  useEffect(() => {
    if (currentFplGameweek !== null && !didInitGw.current) {
      didInitGw.current = true
      setGameweek(currentFplGameweek)
    }
  }, [currentFplGameweek])

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchFixtures(gameweek)
      .then(setFixtures)
      .catch(() => setError('Failed to load fixtures. Check your connection and try again.'))
      .finally(() => setLoading(false))
  }, [gameweek])

  const teamName = (id: number) => teams.find((t) => t.id === id)?.name ?? `Team ${id}`

  const picksForTeam = (teamId: number) =>
    pool.picks
      .filter((pk) => pk.teamId === teamId && pk.gameweek === gameweek)
      .map((pk) => ({
        ...pk,
        playerName: pool.players.find((p) => p.id === pk.playerId)?.name ?? 'Unknown',
      }))

  const score = (f: FPLFixture) =>
    f.finished && f.team_h_score !== null && f.team_a_score !== null
      ? `${f.team_h_score} – ${f.team_a_score}`
      : 'vs'

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
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading fixtures…
        </div>
      ) : fixtures.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No fixtures found for Gameweek {gameweek}.
        </div>
      ) : (
        fixtures.map((f) => {
          const homePicks = picksForTeam(f.team_h)
          const awayPicks = picksForTeam(f.team_a)
          return (
            <div key={f.id} className="card fixture-card">
              <div className="fixture-teams">
                <div className="fixture-team">
                  <span className="fixture-team__name">{teamName(f.team_h)}</span>
                  <div className="fixture-picks">
                    {homePicks.map((pk) => (
                      <span key={pk.playerId} className={`fixture-pick${pk.result ? ` fixture-pick--${pk.result}` : ''}`}>
                        {pk.playerName}
                        {pk.result && <span className={`badge badge--${pk.result}`}>{pk.result}</span>}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="fixture-score">
                  {score(f)}
                  {!f.finished && f.team_h_score === null && (
                    <div className="fixture-score__status">Not played</div>
                  )}
                </div>

                <div className="fixture-team fixture-team--away">
                  <span className="fixture-team__name">{teamName(f.team_a)}</span>
                  <div className="fixture-picks fixture-picks--away">
                    {awayPicks.map((pk) => (
                      <span key={pk.playerId} className={`fixture-pick${pk.result ? ` fixture-pick--${pk.result}` : ''}`}>
                        {pk.playerName}
                        {pk.result && <span className={`badge badge--${pk.result}`}>{pk.result}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
