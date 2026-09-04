import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { loadPool, savePool, migrateToFirestore } from '../lib/storage'
import { fetchTeams } from '../lib/fpl'
import type { PoolData, FPLTeam } from '../types'
import LoginScreen from '../components/LoginScreen'

const MODE_KEY = 'lms-mode'

interface AppContextValue {
  pool: PoolData
  setPool: (data: PoolData) => void
  userId: string | null
  teams: FPLTeam[]
  loading: boolean
  login: () => void
  logout: () => void
  resetMode: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { userId, authLoading, login, logout } = useAuth()
  const [pool, setPoolState] = useState<PoolData | null>(null)
  const [teams, setTeams] = useState<FPLTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [modeChosen, setModeChosen] = useState(() => {
    return !!localStorage.getItem(MODE_KEY) || false
  })

  const chooseLocal = () => {
    localStorage.setItem(MODE_KEY, 'local')
    setModeChosen(true)
  }

  const handleGoogle = () => {
    login()
  }

  const resetMode = () => {
    localStorage.removeItem(MODE_KEY)
    logout()
    setModeChosen(false)
  }

  useEffect(() => {
    if (userId) {
      localStorage.setItem(MODE_KEY, 'google')
      setModeChosen(true)
    }
  }, [userId])

  useEffect(() => {
    if (authLoading || !modeChosen) return
    setLoading(true)
    loadPool(userId)
      .then((data) => setPoolState(data))
      .finally(() => setLoading(false))
  }, [userId, authLoading, modeChosen])

  useEffect(() => {
    if (!userId || !pool) return
    const localRaw = localStorage.getItem('lms-pool')
    if (localRaw) {
      try {
        const localData = JSON.parse(localRaw) as PoolData
        migrateToFirestore(userId, localData).catch(() => {})
      } catch {
        // ignore invalid local data
      }
    }
  }, [userId, pool])

  useEffect(() => {
    fetchTeams()
      .then(setTeams)
      .catch((err) => console.error('[AppContext] fetchTeams error:', err))
  }, [])

  const setPool = (data: PoolData) => {
    setPoolState(data)
    savePool(userId, data).catch(() => {})
  }

  if (!modeChosen) {
    return <LoginScreen onGoogle={handleGoogle} onLocal={chooseLocal} />
  }

  if (loading || !pool) {
    return <div className="app-loading">Loading…</div>
  }

  return (
    <AppContext.Provider value={{ pool, setPool, userId, teams, loading, login, logout, resetMode }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
