import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useCountdown } from '../hooks/useCountdown'

export default function Layout({ children }: { children: ReactNode }) {
  const { pool, userId, resetMode, currentFplGameweek, deadlineTime } = useApp()
  const countdown = useCountdown(deadlineTime)

  return (
    <div className="app-shell">
      <header className="nav-bar">
        <span className="nav-bar__title">{pool.settings.name}</span>
        <span className="nav-bar__gw">
          Game Week {currentFplGameweek ?? pool.settings.currentGameweek}
          {countdown.label ? (
            <span className={`nav-bar__countdown nav-bar__countdown--${countdown.urgency}`}>
              {countdown.label}
            </span>
          ) : currentFplGameweek !== null && !deadlineTime ? (
            <span className="nav-bar__countdown nav-bar__countdown--normal">
              Open
            </span>
          ) : null}
        </span>
        <button className="btn btn--ghost nav-bar__auth" onClick={resetMode}>
          {userId ? 'Sign out' : 'Switch mode'}
        </button>
      </header>

      <main className="page-content">{children}</main>

      <nav className="tab-bar">
        <NavLink to="/dashboard" className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>
          Standings
        </NavLink>
        <NavLink to="/players" className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>
          Players
        </NavLink>
        <NavLink to="/picks" className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>
          Picks
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>
          History
        </NavLink>
        <NavLink to="/results" className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>
          Results
        </NavLink>
        <NavLink to="/archive" className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>
          Archive
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>
          Settings
        </NavLink>
        <NavLink to="/help" className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>
          Help
        </NavLink>
      </nav>
    </div>
  )
}
