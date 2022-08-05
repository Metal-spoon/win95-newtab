import './lib/jquery.min.js'
import * as topsitesComponent from './components/topsites-component.js'
import * as wallpaperComponent from './components/wallpaper-component.js'
import * as searchComponent from './components/search-component.js'
import * as clockComponent from './components/clock-component.js'
import * as modalComponent from './components/modal-component.js'
import * as startmenuComponent from './components/startmenu-component.js'
import * as defaultSettings from './settings/defaults.js'

$(function () {
  chrome.storage.local.get(defaultSettings.AllSettings, (settings) => {
    if (
      JSON.stringify(Object.keys(settings)) !==
        JSON.stringify(Object.keys(defaultSettings.DefaultSettings)) ||
      Object.values(settings).some((x) => x == null)
    ) {
      console.log('Something went wrong, resetting to defaults...')
      settings = defaultSettings.DefaultSettings
      defaultSettings.SetDefaultSettings()
    }
    clockComponent.init(settings)
    topsitesComponent.init(settings)
    searchComponent.init(settings)
    wallpaperComponent.init(settings)
    modalComponent.init(settings)
    startmenuComponent.init()
    $('.startMenu').hide()
    $('.speech-bubble').hide()
  })
})
