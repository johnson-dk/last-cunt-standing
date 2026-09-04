import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCountdown } from './useCountdown'

const NOW = new Date('2026-09-04T12:00:00Z').getTime()

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

const inMs = (ms: number) => new Date(NOW + ms).toISOString()

describe('useCountdown', () => {
  it('returns empty values when deadlineIso is null', () => {
    const { result } = renderHook(() => useCountdown(null))
    expect(result.current.label).toBe('')
    expect(result.current.fullLabel).toBe('')
    expect(result.current.urgency).toBe('normal')
    expect(result.current.passed).toBe(false)
  })

  it('returns passed when deadline is in the past', () => {
    const { result } = renderHook(() => useCountdown(inMs(-1000)))
    expect(result.current.urgency).toBe('passed')
    expect(result.current.passed).toBe(true)
    expect(result.current.label).toBe('Passed')
  })

  it('critical urgency under 1 hour', () => {
    const { result } = renderHook(() => useCountdown(inMs(30 * 60 * 1000)))
    expect(result.current.urgency).toBe('critical')
  })

  it('warning urgency between 1 and 24 hours', () => {
    const { result } = renderHook(() => useCountdown(inMs(12 * 60 * 60 * 1000)))
    expect(result.current.urgency).toBe('warning')
  })

  it('normal urgency over 24 hours', () => {
    const { result } = renderHook(() => useCountdown(inMs(8 * 24 * 60 * 60 * 1000)))
    expect(result.current.urgency).toBe('normal')
  })

  it('label shows days and hours when more than 1 day remains', () => {
    const { result } = renderHook(() => useCountdown(inMs(2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)))
    expect(result.current.label).toBe('2d 3h')
    expect(result.current.fullLabel).toBe('2d 3h remaining')
  })

  it('label shows hours and minutes when under 24 hours', () => {
    const { result } = renderHook(() => useCountdown(inMs(5 * 60 * 60 * 1000 + 30 * 60 * 1000)))
    expect(result.current.label).toBe('5h 30m')
  })

  it('label shows minutes and seconds when under 1 hour', () => {
    const { result } = renderHook(() => useCountdown(inMs(15 * 60 * 1000 + 42 * 1000)))
    expect(result.current.label).toBe('15m 42s')
  })
})
