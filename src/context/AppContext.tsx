import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { loadPool, savePool, createCompetition as storageCreateCompetition } from '../lib/storage'
import { fetchTeams, fetchCurrentGameweek } from '../lib/fpl'
import type { PoolData, FPLTeam } from '../types'
import LoginScreen from '../components/LoginScreen'

const MODE_KEY = 'lms-mode'

interface AppContextValue {
  pool: PoolData
  setPool: (data: PoolData) => void
  userId: string | null
  teams: FPLTeam[]
  currentFplGameweek: number | null
  deadlineTime: string | null
  loading: boolean
  login: () => void
  logout: () => void
  resetMode: () => void
  createCompetition: (name: string, startGameweek: number) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { userId, authLoading, login, logout } = useAuth()
  const [pool, setPoolState] = useState<PoolData | null>(null)
  const [competitionId, setCompetitionId] = useState<string | null>(null)
  const [teams, setTeams] = useState<FPLTeam[]>([])
  const [currentFplGameweek, setCurrentFplGameweek] = useState<number | null>(null)
  const [deadlineTime, setDeadlineTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modeChosen, setModeChosen] = useState(() => !!localStorage.getItem(MODE_KEY))

  const chooseLocal = () => {
    localStorage.setItem(MODE_KEY, 'local')
    setModeChosen(true)
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
      .then(({ pool, competitionId }) => {
        setPoolState(pool)
        setCompetitionId(competitionId)
      })
      .finally(() => setLoading(false))
  }, [userId, authLoading, modeChosen])

  useEffect(() => {
    fetchTeams()
      .then(setTeams)
      .catch((err) => console.error('[AppContext] fetchTeams error:', err))
    fetchCurrentGameweek()
      .then(({ gameweek, deadlineTime }) => {
        setCurrentFplGameweek(gameweek)
        setDeadlineTime(deadlineTime)
        if (gameweek === null) return
        setPoolState((prev) => {
          if (!prev || prev.settings.currentGameweek === gameweek) return prev
          return { ...prev, settings: { ...prev.settings, currentGameweek: gameweek } }
        })
      })
      .catch((err) => console.error('[AppContext] fetchCurrentGameweek error:', err))
  }, [])

  const setPool = (data: PoolData) => {
    setPoolState(data)
    if (competitionId) {
      savePool(userId, competitionId, data).catch(() => {})
    }
  }

  const createCompetition = async (name: string, startGameweek: number) => {
    if (!pool) return
    const newId = await storageCreateCompetition(userId, name, startGameweek, pool)
    const newPool: PoolData = {
      settings: { ...pool.settings, currentGameweek: startGameweek },
      players: pool.players.map(({ eliminatedWeek: _ew, ...rest }) => ({
        ...rest,
        status: 'active' as const,
      })),
      picks: [],
    }
    setPoolState(newPool)
    setCompetitionId(newId)
  }

  if (!modeChosen) {
    return <LoginScreen onGoogle={login} onLocal={chooseLocal} />
  }

  if (loading || !pool) {
    return <div className="app-loading">Loading…</div>
  }

  return (
    <AppContext.Provider
      value={{ pool, setPool, userId, teams, currentFplGameweek, deadlineTime, loading, login, logout, resetMode, createCompetition }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
