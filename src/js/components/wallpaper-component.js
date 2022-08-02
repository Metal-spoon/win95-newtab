import { Wallpaper } from '../models/wallpaper.js'

let selectedWallpaper
const assetPath = '/assets/img/bg/'

export function init () {
  chrome.storage.local.get(['wallpapers', 'randomWallpaper'], (result) => {
    let wallpapers = result.wallpapers
    if (!wallpapers) {
      wallpapers = [
        new Wallpaper('1.png', true, true, null, 0),
        new Wallpaper('2.png', true, true, null, 1)
      ]
      chrome.storage.local.set({ wallpapers })
    }
    let randomWallpaper = result.randomWallpaper
    if (randomWallpaper == null) {
      randomWallpaper = true
      chrome.storage.local.set({ randomWallpaper })
    }
    selectedWallpaper = selectWallpaper(wallpapers, randomWallpaper)
    updateDOM(selectedWallpaper)
  })
}

function selectWallpaper (wallpapers, isRandom) {
  let wallpaper
  if (isRandom) {
    const enabledWallpapers = wallpapers.filter((x) => x.isEnabled === true)
    const index = Math.floor(Math.random() * enabledWallpapers.length)
    wallpaper = enabledWallpapers[index]
  } else {
    wallpaper = wallpapers.find((x) => x.isEnabled === true)
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
