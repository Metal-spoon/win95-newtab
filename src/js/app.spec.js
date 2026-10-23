import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flush, loadIndexHtml } from '../../test/helpers.js'
import { createChromeMock } from '../../test/mocks/chrome.js'
import { DefaultSettings } from './settings/defaults.js'

const defaults = () => structuredClone(DefaultSettings)

describe('validateSettings', () => {
  let validateSettings

  beforeEach(async () => {
    ({ validateSettings } = await import('./app.js'))
  })

  it('accepts the default settings', () => {
    expect(validateSettings(defaults())).toBe(true)
  })

  it('accepts settings in any key order', () => {
    const reversed = Object.fromEntries(Object.entries(defaults()).reverse())
    expect(validateSettings(reversed)).toBe(true)
  })

  it('accepts false values', () => {
    expect(validateSettings({ ...defaults(), ShowSeconds: false, TrimTitles: false })).toBe(true)
  })

  it('rejects empty settings', () => {
    expect(validateSettings({})).toBe(false)
  })

  it.each([null, undefined])('rejects a setting that is %s', (value) => {
    expect(validateSettings({ ...defaults(), HourFormat24: value })).toBe(false)
  })

  it('rejects settings with a missing key', () => {
    const { ShowBadges, ...settings } = defaults()
    expect(validateSettings(settings)).toBe(false)
  })

  it('rejects settings with an extra key', () => {
    expect(validateSettings({ ...defaults(), Unknown: 1 })).toBe(false)
  })
})

describe('start', () => {
  beforeEach(() => {
    loadIndexHtml()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  async function startApp () {
    const app = await import('./app.js')
    app.start()
    await flush()
  }

  it('restores the defaults when storage is empty', async () => {
    await startApp()

    expect(console.log).toHaveBeenCalledWith('Something went wrong, resetting to defaults...')
    expect(chrome._storage).toEqual(JSON.parse(JSON.stringify(DefaultSettings)))
  })

  it('restores the defaults when stored settings are incomplete', async () => {
    const { ShowSeconds, ...settings } = defaults()
    globalThis.chrome = createChromeMock({ storage: settings })

    await startApp()

    expect(chrome._storage.ShowSeconds).toBe(DefaultSettings.ShowSeconds)
  })

  it('keeps valid stored settings', async () => {
    globalThis.chrome = createChromeMock({
      storage: { ...defaults(), HourFormat24: true }
    })

    await startApp()

    expect(console.log).not.toHaveBeenCalled()
    expect(chrome.storage.local.clear).not.toHaveBeenCalled()
  })

  it('initialises every component with the stored settings', async () => {
    const settings = { ...defaults(), SelectedSearchEngine: DefaultSettings.SelectedSearchEngine }
    globalThis.chrome = createChromeMock({ storage: settings })
    const components = [
      './components/clock-component.js',
      './components/topsites-component.js',
      './components/search-component.js',
      './components/wallpaper-component.js',
      './components/modal-component.js',
      './components/startmenu-component.js'
    ]
    const spies = []
    for (const path of components) {
      spies.push(vi.spyOn(await import(path), 'init'))
    }

    await startApp()

    spies.slice(0, 5).forEach((spy) => {
      expect(spy).toHaveBeenCalledWith(settings)
    })
    expect(spies[5]).toHaveBeenCalled()
  })

  it('hides the start menu and speech bubble', async () => {
    await startApp()

    expect($('.startMenu').css('display')).toBe('none')
    expect($('.speech-bubble').css('display')).toBe('none')
  })

  it('shows the clock and the selected search engine', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })
    vi.setSystemTime(new Date(2026, 0, 1, 14, 5))
    globalThis.chrome = createChromeMock({
      storage: { ...defaults(), HourFormat24: true }
    })

    await startApp()

    expect($('.clockText').text()).toBe('14:05')
    expect($('#search-dialog-title').text()).toBe('Google search...')
  })
})
