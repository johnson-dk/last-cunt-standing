import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Layout({ children }: { children: ReactNode }) {
  const { pool, userId, logout } = useApp()

  const handleLogout = () => {
    logout()
    localStorage.removeItem('lms-mode')
  }

  return (
    <div className="app-shell">
      <header className="nav-bar">
        <span className="nav-bar__title">{pool.settings.name}</span>
        <span className="nav-bar__gw">GW {pool.settings.currentGameweek}</span>
        <button className="btn btn--ghost nav-bar__auth" onClick={handleLogout}>
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
        <NavLink to="/settings" className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>
          Settings
        </NavLink>
      </nav>
    </div>
  )
}
