import { useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(auth !== null)

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null)
      setAuthLoading(false)
    })
  }, [])

  const login = () => {
    if (!auth) return Promise.resolve()
    return signInWithPopup(auth, new GoogleAuthProvider())
  }
  const logout = () => {
    if (!auth) return Promise.resolve()
    return signOut(auth)
  }

  return { userId, authLoading, login, logout }
}
