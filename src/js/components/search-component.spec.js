import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadIndexHtml } from '../../../test/helpers.js'
import { SearchEngineList } from '../settings/defaults.js'

vi.mock('../utils/navigation.js', () => ({ navigateTo: vi.fn() }))

let search
let navigateTo

const brave = SearchEngineList.find((engine) => engine.name === 'Brave')

beforeEach(async () => {
  loadIndexHtml()
  ;({ navigateTo } = await import('../utils/navigation.js'))
  search = await import('./search-component.js')
  search.init({ SelectedSearchEngine: brave })
})

const type = (text) => $('.searchbar').val(text)
const pressKey = (code) => $('.searchbar').trigger($.Event('keydown', { code }))

describe('search component', () => {
  it('shows the selected search engine in the dialog title', () => {
    expect($('#search-dialog-title').text()).toBe('Brave search...')
  })

  it('searches with the selected engine when the button is clicked', () => {
    type('win95')
    $('#searchbutton').trigger('click')

    expect(navigateTo).toHaveBeenCalledWith('https://search.brave.com/search?q=win95')
  })

  it.each(['Enter', 'NumpadEnter'])('searches when %s is pressed', (code) => {
    type('win95')
    pressKey(code)

    expect(navigateTo).toHaveBeenCalledOnce()
  })

  it('ignores other keys', () => {
    type('win95')
    pressKey('KeyA')

    expect(navigateTo).not.toHaveBeenCalled()
  })

  it('encodes the search query', () => {
    type('a b&c/ü?')
    $('#searchbutton').trigger('click')

    expect(navigateTo).toHaveBeenCalledWith('https://search.brave.com/search?q=a%20b%26c%2F%C3%BC%3F')
  })

  it('does nothing when the search box is empty', () => {
    type('')
    $('#searchbutton').trigger('click')

    expect(navigateTo).not.toHaveBeenCalled()
  })

  it('uses the newly selected engine after being initialised again', () => {
    const google = SearchEngineList[0]
    search.init({ SelectedSearchEngine: google })
    type('x')
    $('#searchbutton').trigger('click')

    expect($('#search-dialog-title').text()).toBe('Google search...')
    expect(navigateTo).toHaveBeenLastCalledWith(`${google.url}x`)
  })

  it.each([
    ['the button is clicked', () => $('#searchbutton').trigger('click')],
    ['Enter is pressed', () => pressKey('Enter')]
  ])('searches once after being initialised again when %s', (_, submit) => {
    search.init({ SelectedSearchEngine: brave })
    search.init({ SelectedSearchEngine: brave })
    type('x')
    submit()

    expect(navigateTo).toHaveBeenCalledOnce()
  })

  it('uses the current URL of a stored search engine', () => {
    const outdatedGoogle = { id: 0, name: 'Google', url: 'http://www.google.com/search?q=' }
    search.init({ SelectedSearchEngine: outdatedGoogle })
    type('x')
    $('#searchbutton').trigger('click')

    expect(navigateTo).toHaveBeenCalledWith('https://www.google.com/search?q=x')
  })

  it('falls back to the stored search engine when its id is unknown', () => {
    const custom = { id: 99, name: 'Custom', url: 'https://custom.example/?q=' }
    search.init({ SelectedSearchEngine: custom })
    type('x')
    $('#searchbutton').trigger('click')

    expect($('#search-dialog-title').text()).toBe('Custom search...')
    expect(navigateTo).toHaveBeenCalledWith('https://custom.example/?q=x')
  })

  it('takes focus off the search button', () => {
    $('#searchbutton').trigger('focus')
    type('x')
    $('#searchbutton').trigger('click')

    expect(document.activeElement).not.toBe($('#searchbutton')[0])
  })
})
