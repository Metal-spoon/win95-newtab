import { Wallpaper } from '../models/wallpaper.js'

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
    const selectedWallpaper = selectWallpaper(wallpapers, randomWallpaper)
    updateDOM(selectedWallpaper)
  })
}

function selectWallpaper (wallpapers, isRandom) {
  let selectedWallpaper
  if (isRandom) {
    const enabledWallpapers = wallpapers.filter((x) => x.isEnabled === true)
    const index = Math.floor(Math.random() * enabledWallpapers.length)
    selectedWallpaper = enabledWallpapers[index]
  } else {
    selectedWallpaper = wallpapers.find((x) => x.isEnabled === true)
  }

  return selectedWallpaper
}

function updateDOM (wallpaper) {
  const cssValue = wallpaper.imageData
    ? 'url(' + wallpaper.imageData + ')'
    : 'url(/assets/img/bg/' + wallpaper.fileName + ')'
  $('.background').css('background-image', cssValue)
}
