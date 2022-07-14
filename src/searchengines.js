import { SearchEngine } from './models/searchengine.js'

export function initializeSearchEngines () {
  let searchEngines = JSON.parse(localStorage.getItem('searchengines'))
  if (!searchEngines) {
    searchEngines = [
      new SearchEngine(0, 'Google', 'http://www.google.com/search?q=', false),
      new SearchEngine(1, 'Yahoo', 'https://search.yahoo.com/search?p=', false),
      new SearchEngine(2, 'Bing', 'https://www.bing.com/search?q=', false),
      new SearchEngine(3, 'DuckDuckGo', 'https://duckduckgo.com/?q=', false),
      new SearchEngine(4, 'Yandex', 'https://yandex.com/search/?text=', false),
      new SearchEngine(5, 'Ecosia', 'https://www.ecosia.org/search?q=', false)
    ]
    localStorage.setItem('searchengines', JSON.stringify(searchEngines))
  }
  let selectedSearchEngine = JSON.parse(
    localStorage.getItem('selectedsearchengine')
  )
  if (!selectedSearchEngine) {
    // GOOGLE
    selectedSearchEngine = searchEngines.find((x) => x.id === 0)
    localStorage.setItem(
      'selectedsearchengine',
      JSON.stringify(selectedSearchEngine)
    )
  }

  $('#search-dialog-title').text(selectedSearchEngine.name + ' search...')
}
