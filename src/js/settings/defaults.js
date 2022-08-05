import { Wallpaper } from '../models/wallpaper.js'
import { SearchEngine } from '../models/searchengine.js'

export const Wallpapers = [
  new Wallpaper('1.png', true, true, null, 0),
  new Wallpaper('2.png', true, true, null, 1)
]

export const SearchEngineList = [
  new SearchEngine(0, 'Google', 'http://www.google.com/search?q='),
  new SearchEngine(1, 'Yahoo', 'https://search.yahoo.com/search?p='),
  new SearchEngine(2, 'Bing', 'https://www.bing.com/search?q='),
  new SearchEngine(3, 'DuckDuckGo', 'https://duckduckgo.com/?q='),
  new SearchEngine(4, 'Yandex', 'https://yandex.com/search/?text='),
  new SearchEngine(5, 'Ecosia', 'https://www.ecosia.org/search?q=')
]

export const SelectedSearchEngine = SearchEngineList[0]

export const RandomWallpaper = true

export const HourFormat24 = false

export const ShowSeconds = false

export const TrimTitles = false

export const TopsiteOutlines = true

export const RetroTitles = false

export function SetDefaultSettings () {
  chrome.storage.local.clear(() => {
    chrome.storage.local.set({
      Wallpapers,
      SelectedSearchEngine,
      RandomWallpaper,
      HourFormat24,
      ShowSeconds
    })
  })
}
