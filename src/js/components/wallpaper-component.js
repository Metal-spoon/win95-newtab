import {
  Wallpapers as defaultWallpapers,
  RandomWallpaper as defaultRandomWallpaper,
  SetDefaultSettings
} from '../settings/defaults.js'

let selectedWallpaper
let Wallpapers
let RandomWallpaper
const assetPath = '/assets/img/bg/'

export function init () {
  chrome.storage.local.get(['Wallpapers', 'RandomWallpaper'], (result) => {
    Wallpapers = result.Wallpapers
    RandomWallpaper = result.RandomWallpaper
    if (!Wallpapers || RandomWallpaper == null) {
      Wallpapers = defaultWallpapers
      RandomWallpaper = defaultRandomWallpaper
      SetDefaultSettings()
    }
    selectedWallpaper = selectWallpaper()
    updateDOM(selectedWallpaper)
  })
}

function selectWallpaper () {
  let wallpaper
  if (RandomWallpaper) {
    const enabledWallpapers = Wallpapers.filter((x) => x.isEnabled === true)
    const index = Math.floor(Math.random() * enabledWallpapers.length)
    wallpaper = enabledWallpapers[index]
  } else {
    wallpaper = Wallpapers.find((x) => x.isEnabled === true)
  }

  return wallpaper
}

export function updateDOM () {
  let cssValue
  if (selectedWallpaper.isDefault) {
    cssValue = 'url(' + assetPath + selectedWallpaper.fileName + ')'
    $('.background').css('background-image', cssValue)
  } else {
    chrome.storage.local.get(selectedWallpaper.key, (result) => {
      cssValue = 'url(' + result[selectedWallpaper.key] + ')'
      $('.background').css('background-image', cssValue)
    })
  }
}
