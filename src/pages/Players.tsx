import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { PaymentStatus, Player } from '../types'

export default function Players() {
  const { pool, setPool } = useApp()
  const [newName, setNewName] = useState('')
  const [newPayment, setNewPayment] = useState<PaymentStatus>('unpaid')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const addPlayer = () => {
    const name = newName.trim()
    if (!name) return
    const player: Player = {
      id: crypto.randomUUID(),
      name,
      paymentStatus: newPayment,
      status: 'active',
    }
    setPool({ ...pool, players: [...pool.players, player] })
    setNewName('')
    setNewPayment('unpaid')
  }

  const deletePlayer = (id: string) => {
    const hasPicks = pool.picks.some((p) => p.playerId === id)
    if (hasPicks && !confirm('This player has picks. Delete anyway?')) return
    setPool({
      ...pool,
      players: pool.players.filter((p) => p.id !== id),
      picks: pool.picks.filter((p) => p.playerId !== id),
    })
  }

  const startEdit = (player: Player) => {
    setEditingId(player.id)
    setEditName(player.name)
  }

  const saveEdit = (player: Player) => {
    const name = editName.trim()
    if (!name) return
    setPool({
      ...pool,
      players: pool.players.map((p) => (p.id === player.id ? { ...p, name } : p)),
    })
    setEditingId(null)
  }

  const setPayment = (player: Player, paymentStatus: PaymentStatus) => {
    setPool({
      ...pool,
      players: pool.players.map((p) => (p.id === player.id ? { ...p, paymentStatus } : p)),
    })
  }

  return (
    <div className="page">
      <div className="card">
        <h2 className="card__title">Add Player</h2>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="player-name">Name</label>
            <input
              id="player-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
              placeholder="Player name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="player-payment">Payment</label>
            <select
              id="player-payment"
              value={newPayment}
              onChange={(e) => setNewPayment(e.target.value as PaymentStatus)}
            >
              <option value="unpaid">Unpaid</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <button className="btn btn--primary form-action" onClick={addPlayer}>
            Add
          </button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pool.players.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No players yet
                </td>
              </tr>
            )}
            {pool.players.map((player) => (
              <tr key={player.id}>
                <td>
                  {editingId === player.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(player)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      autoFocus
                    />
                  ) : (
                    player.name
                  )}
                </td>
                <td>
                  <select
                    value={player.paymentStatus}
                    onChange={(e) => setPayment(player, e.target.value as PaymentStatus)}
                    className={`payment-select payment-select--${player.paymentStatus}`}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </td>
                <td>
                  <span className={`badge badge--${player.status}`}>{player.status}</span>
                </td>
                <td className="actions-cell">
                  {editingId === player.id ? (
                    <>
                      <button className="btn btn--primary" onClick={() => saveEdit(player)}>
                        Save
                      </button>
                      <button className="btn btn--ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn--ghost" onClick={() => startEdit(player)}>
                        Edit
                      </button>
                      <button className="btn btn--danger" onClick={() => deletePlayer(player.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
