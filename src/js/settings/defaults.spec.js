import { describe, expect, it } from 'vitest'
import { flush } from '../../../test/helpers.js'
import {
  AllSettings,
  DefaultSettings,
  SearchEngineList,
  SetDefaultSettings
} from './defaults.js'

describe('defaults', () => {
  it('lists every default setting in AllSettings', () => {
    expect([...AllSettings].sort()).toEqual(Object.keys(DefaultSettings).sort())
  })

  it('gives every search engine an id equal to its position in the list', () => {
    SearchEngineList.forEach((engine, index) => {
      expect(engine.id).toBe(index)
    })
  })

  it('gives every search engine a unique name', () => {
    const names = SearchEngineList.map((engine) => engine.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('gives every search engine a URL that ends in a query parameter', () => {
    SearchEngineList.forEach((engine) => {
      expect(engine.url).toMatch(/[?&][a-z]+=$/)
    })
  })

  it('uses https for every search engine', () => {
    SearchEngineList.forEach((engine) => {
      expect(new URL(engine.url).protocol).toBe('https:')
    })
  })

  it('selects an existing search engine by default', () => {
    expect(SearchEngineList).toContain(DefaultSettings.SelectedSearchEngine)
  })

  it('enables at least one default wallpaper', () => {
    expect(DefaultSettings.Wallpapers.some((w) => w.isEnabled)).toBe(true)
    DefaultSettings.Wallpapers.forEach((wallpaper) => {
      expect(wallpaper.isDefault).toBe(true)
    })
  })

  describe('SetDefaultSettings', () => {
    it('replaces everything in storage with the defaults', async () => {
      chrome._storage.Unrelated = 'value'
      chrome._storage.HourFormat24 = true

      SetDefaultSettings()
      await flush()

      expect(chrome.storage.local.clear).toHaveBeenCalled()
      expect(chrome._storage).toEqual(JSON.parse(JSON.stringify(DefaultSettings)))
    })
  })
})
