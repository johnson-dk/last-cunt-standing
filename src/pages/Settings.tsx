import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import type { DrawRule, PoolData, PrizeEntry } from '../types'
import { auth } from '../lib/firebase'

const DEFAULT_NEW_COMP_NAME = (existing: number) => `Season ${existing + 1}`

const DEFAULT_POOL: PoolData = {
  settings: {
    name: 'Last Man Standing',
    entryFee: 0,
    prizeStructure: [{ position: 1, percentage: 100, label: 'Winner' }],
    currentGameweek: 1,
    drawRule: 'survive',
  },
  players: [],
  picks: [],
}

export default function Settings() {
  const { pool, setPool, createCompetition, currentFplGameweek } = useApp()
  const [local, setLocal] = useState<PoolData>(pool)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [showNewComp, setShowNewComp] = useState(false)
  const [newCompName, setNewCompName] = useState('')
  const [newCompGw, setNewCompGw] = useState(1)
  const [creating, setCreating] = useState(false)

  const clearData = () => {
    setPool(DEFAULT_POOL)
    setLocal(DEFAULT_POOL)
    setConfirmClear(false)
  }

  const openNewComp = () => {
    setNewCompName(DEFAULT_NEW_COMP_NAME(1))
    setNewCompGw(currentFplGameweek ?? pool.settings.currentGameweek)
    setShowNewComp(true)
  }

  const handleCreateCompetition = async () => {
    if (!newCompName.trim()) return
    setCreating(true)
    try {
      await createCompetition(newCompName.trim(), newCompGw)
      setShowNewComp(false)
    } finally {
      setCreating(false)
    }
  }

  const persist = (updated: PoolData) => {
    setLocal(updated)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => setPool(updated), 500)
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  const updateSettings = <K extends keyof PoolData['settings']>(
    key: K,
    value: PoolData['settings'][K],
  ) => {
    persist({ ...local, settings: { ...local.settings, [key]: value } })
  }

  const totalPct = local.settings.prizeStructure.reduce((sum, e) => sum + e.percentage, 0)

  const updatePrize = (index: number, field: keyof PrizeEntry, value: string | number) => {
    const updated = local.settings.prizeStructure.map((e, i) =>
      i === index ? { ...e, [field]: field === 'percentage' ? Number(value) : value } : e,
    )
    persist({ ...local, settings: { ...local.settings, prizeStructure: updated } })
  }

  const addPrize = () => {
    const pos = local.settings.prizeStructure.length + 1
    const entry: PrizeEntry = { position: pos, percentage: 0, label: `Position ${pos}` }
    persist({
      ...local,
      settings: { ...local.settings, prizeStructure: [...local.settings.prizeStructure, entry] },
    })
  }

  const removePrize = (index: number) => {
    const updated = local.settings.prizeStructure.filter((_, i) => i !== index)
    persist({ ...local, settings: { ...local.settings, prizeStructure: updated } })
  }

  return (
    <div className="page">
      <div className="card">
        <h2 className="card__title">Pool Settings</h2>

        <div className="form-group">
          <label htmlFor="pool-name">Pool Name</label>
          <input
            id="pool-name"
            type="text"
            value={local.settings.name}
            onChange={(e) => updateSettings('name', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="entry-fee">Entry Fee (£)</label>
          <input
            id="entry-fee"
            type="number"
            min={0}
            value={local.settings.entryFee}
            onChange={(e) => updateSettings('entryFee', Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="draw-rule">Draw Rule</label>
          <select
            id="draw-rule"
            value={local.settings.drawRule ?? 'survive'}
            onChange={(e) => updateSettings('drawRule', e.target.value as DrawRule)}
          >
            <option value="survive">Survive — draw counts as a void, player continues</option>
            <option value="loss">Loss — draw eliminates the player</option>
            <option value="repick">Re-pick — draw is cleared, player picks again same week</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card__title-row">
          <h2 className="card__title">Prize Structure</h2>
          <button className="btn btn--ghost" onClick={addPrize}>
            + Add
          </button>
        </div>

        {totalPct !== 100 && (
          <div className="warning-banner">
            Total is {totalPct}% — must equal 100%
          </div>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Label</th>
              <th>% of Pot</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {local.settings.prizeStructure.map((entry, i) => (
              <tr key={i}>
                <td>{entry.position}</td>
                <td>
                  <input
                    type="text"
                    value={entry.label}
                    onChange={(e) => updatePrize(i, 'label', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={entry.percentage}
                    onChange={(e) => updatePrize(i, 'percentage', e.target.value)}
                  />
                </td>
                <td>
                  <button className="btn btn--danger" onClick={() => removePrize(i)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="prize-total" style={{ color: totalPct === 100 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
          Total: {totalPct}%
        </div>
      </div>
      <div className="card">
        <h2 className="card__title">New Competition</h2>
        <p className="danger-zone__desc">
          Start a fresh run. All current players are copied over with their status reset to active and team bans cleared.
        </p>
        <button className="btn btn--primary" onClick={openNewComp}>
          Start new competition
        </button>
      </div>

      <div className="card danger-zone">
        <h2 className="card__title">Danger Zone</h2>
        <p className="danger-zone__desc">Permanently delete all players, picks, and settings. This cannot be undone.</p>
        <button className="btn btn--danger" onClick={() => setConfirmClear(true)}>
          Clear all data
        </button>
      </div>

      {showNewComp && (
        <div className="modal-backdrop" onClick={() => setShowNewComp(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Start New Competition</h2>
              <button className="btn btn--ghost modal__close" onClick={() => setShowNewComp(false)}>✕</button>
            </div>
            <div className="form-group">
              <label htmlFor="new-comp-name">Competition Name</label>
              <input
                id="new-comp-name"
                type="text"
                value={newCompName}
                onChange={(e) => setNewCompName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-comp-gw">Starting Gameweek</label>
              <input
                id="new-comp-gw"
                type="number"
                min={1}
                max={38}
                value={newCompGw}
                onChange={(e) => setNewCompGw(Number(e.target.value))}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn--ghost" onClick={() => setShowNewComp(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleCreateCompetition} disabled={creating || !newCompName.trim()}>
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmClear && (
        <div className="modal-backdrop" onClick={() => setConfirmClear(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Clear all data?</h2>
              <button className="btn btn--ghost modal__close" onClick={() => setConfirmClear(false)}>✕</button>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              This will delete all players, picks, and reset settings to defaults. There is no undo.
              {auth?.currentUser
                ? ' Data will be cleared from both this browser and your Google account (Firebase).'
                : ' Data will be cleared from this browser only.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn--ghost" onClick={() => setConfirmClear(false)}>Cancel</button>
              <button className="btn btn--danger" onClick={clearData}>Yes, clear everything</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
