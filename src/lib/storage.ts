import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { CompetitionMeta, Player, PoolData, PoolSettings } from '../types'

// Firestore layout:
//   pools/{userId}                          → { activeCompetitionId }
//   pools/{userId}/competitions/{id}        → { id, name, startGameweek, createdAt, settings, players, picks }
//
// localStorage layout:
//   lms-root                                → { activeCompetitionId }
//   lms-comp-{id}                           → same shape as Firestore competition doc

const LS_ROOT = 'lms-root'
const LS_COMP = (id: string) => `lms-comp-${id}`

const defaultSettings: PoolSettings = {
  name: 'Last Man Standing',
  entryFee: 0,
  prizeStructure: [{ position: 1, percentage: 100, label: 'Winner' }],
  currentGameweek: 1,
  drawRule: 'survive',
}

function newCompId(): string {
  return `comp_${Date.now()}`
}

function competitionMeta(data: Record<string, unknown>): CompetitionMeta {
  const players = (data.players as Player[]) ?? []
  const active = players.filter((p) => p.status === 'active')
  return {
    id: data.id as string,
    name: data.name as string,
    startGameweek: data.startGameweek as number,
    createdAt: data.createdAt as number,
    playerCount: players.length,
    winner: active.length === 1 ? active[0].name : null,
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function loadPool(
  userId: string | null,
): Promise<{ pool: PoolData; competitionId: string }> {
  if (userId && db) {
    const rootSnap = await getDoc(doc(db, 'pools', userId))
    const activeId: string | undefined = rootSnap.exists()
      ? (rootSnap.data().activeCompetitionId as string)
      : undefined

    if (activeId) {
      const compSnap = await getDoc(doc(db, 'pools', userId, 'competitions', activeId))
      if (compSnap.exists()) {
        const d = compSnap.data()
        return {
          pool: { settings: d.settings, players: d.players, picks: d.picks },
          competitionId: activeId,
        }
      }
    }

    // First run — create default competition
    const id = newCompId()
    const comp = { id, name: 'Season 1', startGameweek: 1, createdAt: Date.now(), settings: defaultSettings, players: [], picks: [] }
    await setDoc(doc(db, 'pools', userId, 'competitions', id), comp)
    await setDoc(doc(db, 'pools', userId), { activeCompetitionId: id }, { merge: true })
    return { pool: { settings: defaultSettings, players: [], picks: [] }, competitionId: id }
  }

  // localStorage
  const rootRaw = localStorage.getItem(LS_ROOT)
  const activeId: string | undefined = rootRaw ? JSON.parse(rootRaw).activeCompetitionId : undefined

  if (activeId) {
    const compRaw = localStorage.getItem(LS_COMP(activeId))
    if (compRaw) {
      const d = JSON.parse(compRaw)
      return { pool: { settings: d.settings, players: d.players, picks: d.picks }, competitionId: activeId }
    }
  }

  // First run
  const id = newCompId()
  const comp = { id, name: 'Season 1', startGameweek: 1, createdAt: Date.now(), settings: defaultSettings, players: [], picks: [] }
  localStorage.setItem(LS_COMP(id), JSON.stringify(comp))
  localStorage.setItem(LS_ROOT, JSON.stringify({ activeCompetitionId: id }))
  return { pool: { settings: defaultSettings, players: [], picks: [] }, competitionId: id }
}

export async function savePool(
  userId: string | null,
  competitionId: string,
  data: PoolData,
): Promise<void> {
  if (userId && db) {
    await setDoc(
      doc(db, 'pools', userId, 'competitions', competitionId),
      { settings: data.settings, players: data.players, picks: data.picks },
      { merge: true },
    )
    return
  }
  const existing = localStorage.getItem(LS_COMP(competitionId))
  const meta = existing
    ? JSON.parse(existing)
    : { id: competitionId, name: 'Season 1', startGameweek: 1, createdAt: Date.now() }
  localStorage.setItem(LS_COMP(competitionId), JSON.stringify({ ...meta, ...data }))
}

export async function createCompetition(
  userId: string | null,
  name: string,
  startGameweek: number,
  currentPool: PoolData,
): Promise<string> {
  const id = newCompId()
  const players = currentPool.players.map(({ eliminatedWeek: _ew, ...rest }) => ({
    ...rest,
    status: 'active' as const,
  }))
  const comp = {
    id,
    name,
    startGameweek,
    createdAt: Date.now(),
    settings: { ...currentPool.settings, currentGameweek: startGameweek },
    players,
    picks: [],
  }

  if (userId && db) {
    await setDoc(doc(db, 'pools', userId, 'competitions', id), comp)
    await setDoc(doc(db, 'pools', userId), { activeCompetitionId: id }, { merge: true })
  } else {
    localStorage.setItem(LS_COMP(id), JSON.stringify(comp))
    localStorage.setItem(LS_ROOT, JSON.stringify({ activeCompetitionId: id }))
  }
  return id
}

export async function loadAllCompetitions(userId: string | null): Promise<CompetitionMeta[]> {
  if (userId && db) {
    const snap = await getDocs(collection(db, 'pools', userId, 'competitions'))
    return snap.docs
      .map((d) => competitionMeta(d.data() as Record<string, unknown>))
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  const metas: CompetitionMeta[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('lms-comp-')) {
      const raw = localStorage.getItem(key)
      if (raw) metas.push(competitionMeta(JSON.parse(raw)))
    }
  }
  return metas.sort((a, b) => b.createdAt - a.createdAt)
}

export async function loadCompetitionPool(
  userId: string | null,
  competitionId: string,
): Promise<PoolData | null> {
  if (userId && db) {
    const snap = await getDoc(doc(db, 'pools', userId, 'competitions', competitionId))
    if (!snap.exists()) return null
    const d = snap.data()
    return { settings: d.settings, players: d.players, picks: d.picks }
  }
  const raw = localStorage.getItem(LS_COMP(competitionId))
  if (!raw) return null
  const d = JSON.parse(raw)
  return { settings: d.settings, players: d.players, picks: d.picks }
}
