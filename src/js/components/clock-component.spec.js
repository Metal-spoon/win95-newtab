import { beforeEach, describe, expect, it, vi } from 'vitest'

let clock

beforeEach(async () => {
  document.body.innerHTML = '<span class="clockText"></span>'
  clock = await import('./clock-component.js')
})

const at = (hours, minutes, seconds) => new Date(2026, 0, 1, hours, minutes, seconds)

describe('formatTime', () => {
  it.each([
    // [hours, minutes, seconds, 24h, seconds?, expected]
    [0, 5, 3, true, true, '0:05:03'],
    [0, 5, 3, true, false, '0:05'],
    [0, 5, 3, false, true, '12:05:03 AM'],
    [0, 5, 3, false, false, '12:05 AM'],
    [9, 59, 59, true, true, '9:59:59'],
    [9, 59, 59, false, false, '9:59 AM'],
    [11, 0, 0, false, false, '11:00 AM'],
    [12, 0, 0, true, true, '12:00:00'],
    [12, 0, 0, false, true, '12:00:00 PM'],
    [12, 30, 0, false, false, '12:30 PM'],
    [13, 7, 10, true, true, '13:07:10'],
    [13, 7, 10, false, true, '1:07:10 PM'],
    [23, 30, 9, true, false, '23:30'],
    [23, 30, 9, false, true, '11:30:09 PM']
  ])('formats %i:%i:%i (24h: %s, seconds: %s) as %s', (h, m, s, HourFormat24, ShowSeconds, expected) => {
    expect(clock.formatTime(at(h, m, s), { HourFormat24, ShowSeconds })).toBe(expected)
  })
})

describe('init', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(at(13, 7, 58))
  })

  it('shows the current time straight away', () => {
    clock.init({ HourFormat24: true, ShowSeconds: true })

    expect($('.clockText').text()).toBe('13:07:58')
  })

  it('updates the time every second', () => {
    clock.init({ HourFormat24: true, ShowSeconds: true })

    vi.advanceTimersByTime(1000)
    expect($('.clockText').text()).toBe('13:07:59')

    vi.advanceTimersByTime(1000)
    expect($('.clockText').text()).toBe('13:08:00')
  })

  it('uses the new settings and replaces the old timer when called again', () => {
    clock.init({ HourFormat24: true, ShowSeconds: true })
    clock.init({ HourFormat24: false, ShowSeconds: false })

    expect($('.clockText').text()).toBe('1:07 PM')
    expect(vi.getTimerCount()).toBe(1)
  })
})
