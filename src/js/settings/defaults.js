import { Wallpaper } from '../models/wallpaper.js'
import { SearchEngine } from '../models/searchengine.js'

const Wallpapers = [
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

const SelectedSearchEngine = SearchEngineList[0]
const HourFormat24 = false
const ShowSeconds = false
const TrimTitles = false
const TopsiteOutlines = true
const RetroTitles = false
const ShowBadges = false

export const DefaultSettings = {
  Wallpapers,
  SelectedSearchEngine,
  HourFormat24,
  ShowSeconds,
  TrimTitles,
  TopsiteOutlines,
  RetroTitles,
  ShowBadges
}

export const AllSettings = [
  'Wallpapers',
  'SelectedSearchEngine',
  'HourFormat24',
  'ShowSeconds',
  'TrimTitles',
  'TopsiteOutlines',
  'RetroTitles',
  'ShowBadges'
]

export function SetDefaultSettings () {
  chrome.storage.local.clear(() => {
    chrome.storage.local.set(DefaultSettings)
  })
}
