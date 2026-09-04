import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import type { PoolData, PrizeEntry } from '../types'

export default function Settings() {
  const { pool, setPool } = useApp()
  const [local, setLocal] = useState<PoolData>(pool)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
          <label htmlFor="current-gw">Current Gameweek</label>
          <div className="stepper">
            <button
              className="btn btn--ghost"
              onClick={() => updateSettings('currentGameweek', Math.max(1, local.settings.currentGameweek - 1))}
            >
              −
            </button>
            <input
              id="current-gw"
              type="number"
              min={1}
              max={38}
              value={local.settings.currentGameweek}
              onChange={(e) => updateSettings('currentGameweek', Number(e.target.value))}
            />
            <button
              className="btn btn--ghost"
              onClick={() => updateSettings('currentGameweek', Math.min(38, local.settings.currentGameweek + 1))}
            >
              +
            </button>
          </div>
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
    </div>
  )
}
