import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createChromeMock } from '../../../test/mocks/chrome.js'
import { flush, loadIndexHtml, readModalHtml } from '../../../test/helpers.js'
import { SearchEngineList } from './defaults.js'

let searchSettings
let searchComponent

const ecosia = SearchEngineList.find((engine) => engine.name === 'Ecosia')

beforeEach(async () => {
  loadIndexHtml()
  $('#settings-modal').hide()
  $('#modal-body').html(readModalHtml('search-settings'))
  globalThis.chrome = createChromeMock({ storage: { SelectedSearchEngine: ecosia } })
  searchComponent = await import('../components/search-component.js')
  vi.spyOn(searchComponent, 'init')
  searchSettings = await import('./search-settings.js')
  searchSettings.init()
  await flush()
})

const dropdown = () => $('#search-engine-dropdown')

describe('init', () => {
  it('lists every search engine in order', () => {
    const options = dropdown().find('option').map((i, option) => [[option.value, option.text]]).get()

    expect(options).toEqual(SearchEngineList.map((engine) => [String(engine.id), engine.name]))
  })

  it('selects the stored search engine', () => {
    expect(dropdown().val()).toBe(String(ecosia.id))
  })

  it('opens the dialog', () => {
    expect($('#settings-modal').css('display')).not.toBe('none')
  })
})

describe('save', () => {
  it('stores the chosen search engine and updates the search box', async () => {
    const brave = SearchEngineList.find((engine) => engine.name === 'Brave')
    dropdown().val(String(brave.id)).trigger('change')

    searchSettings.save()
    await flush()

    expect(chrome._storage.SelectedSearchEngine).toEqual(brave)
    expect(searchComponent.init).toHaveBeenCalledWith({ SelectedSearchEngine: brave })
    expect($('#search-dialog-title').text()).toBe('Brave search...')
    expect($('#settings-modal').css('display')).toBe('none')
  })

  it('keeps the stored engine when nothing was changed', async () => {
    searchSettings.save()
    await flush()

    expect(chrome._storage.SelectedSearchEngine).toEqual(ecosia)
  })
})
