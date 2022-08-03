export class SearchEngine {
  constructor (id, name, url) {
    this.id = id
    this.name = name
    this.url = url
  }
}

export const SearchEngineList = [
  new SearchEngine(0, 'Google', 'http://www.google.com/search?q='),
  new SearchEngine(1, 'Yahoo', 'https://search.yahoo.com/search?p='),
  new SearchEngine(2, 'Bing', 'https://www.bing.com/search?q='),
  new SearchEngine(3, 'DuckDuckGo', 'https://duckduckgo.com/?q='),
  new SearchEngine(4, 'Yandex', 'https://yandex.com/search/?text='),
  new SearchEngine(5, 'Ecosia', 'https://www.ecosia.org/search?q=')
]

export const DefaultSearchEngine = SearchEngineList[0]
