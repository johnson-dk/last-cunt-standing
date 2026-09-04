import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { PoolData } from '../types'

const LOCAL_KEY = 'lms-pool'

const defaultPool: PoolData = {
  settings: {
    name: 'Last Man Standing',
    entryFee: 0,
    prizeStructure: [{ position: 1, percentage: 100, label: 'Winner' }],
    currentGameweek: 1,
  },
  players: [],
  picks: [],
}

export async function loadPool(userId: string | null): Promise<PoolData> {
  if (userId && db) {
    const ref = doc(db, 'pools', userId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return snap.data() as PoolData
    }
    return defaultPool
  }

  const raw = localStorage.getItem(LOCAL_KEY)
  if (!raw) return defaultPool
  try {
    return JSON.parse(raw) as PoolData
  } catch {
    return defaultPool
  }
}

export async function savePool(userId: string | null, data: PoolData): Promise<void> {
  if (userId && db) {
    const ref = doc(db, 'pools', userId)
    await setDoc(ref, data)
    return
  }
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
}

export async function migrateToFirestore(userId: string, data: PoolData): Promise<void> {
  if (!db) return
  const ref = doc(db, 'pools', userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, data)
  }
}
