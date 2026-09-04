import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null)
      setAuthLoading(false)
    })
  }, [])

  const login = () => signInWithPopup(auth, new GoogleAuthProvider())
  const logout = () => signOut(auth)

  return { userId, authLoading, login, logout }
}
