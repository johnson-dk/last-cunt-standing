import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Layout({ children }: { children: ReactNode }) {
  const { pool, userId, resetMode } = useApp()

  return (
    <div className="app-shell">
      <header className="nav-bar">
        <span className="nav-bar__title">{pool.settings.name}</span>
        <span className="nav-bar__gw">Gameweek {pool.settings.currentGameweek}</span>
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
        <NavLink to="/settings" className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>
          Settings
        </NavLink>
      </nav>
    </div>
  )
}
