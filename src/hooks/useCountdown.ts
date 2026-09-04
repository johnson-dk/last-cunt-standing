import { useEffect, useState } from 'react'

export type CountdownUrgency = 'normal' | 'warning' | 'critical' | 'passed'

export interface Countdown {
  label: string
  fullLabel: string
  urgency: CountdownUrgency
  passed: boolean
}

export function useCountdown(deadlineIso: string | null): Countdown {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!deadlineIso) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [deadlineIso])

  if (!deadlineIso) {
    return { label: '', fullLabel: '', urgency: 'normal', passed: false }
  }

  const diff = new Date(deadlineIso).getTime() - now

  if (diff <= 0) {
    return { label: 'Passed', fullLabel: 'Deadline passed', urgency: 'passed', passed: true }
  }

  const totalMinutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60) % 24
  const days = Math.floor(totalMinutes / 1440)

  let label: string
  let fullLabel: string

  if (days >= 1) {
    label = `${days}d ${hours}h`
    fullLabel = `${days}d ${hours}h remaining`
  } else if (hours >= 1) {
    label = `${hours}h ${minutes}m`
    fullLabel = `${hours}h ${minutes}m remaining`
  } else {
    label = `${minutes}m ${seconds}s`
    fullLabel = `${minutes}m ${seconds}s remaining`
  }

  const urgency: CountdownUrgency =
    diff < 3_600_000 ? 'critical' : diff < 86_400_000 ? 'warning' : 'normal'

  return { label, fullLabel, urgency, passed: false }
}

export function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
