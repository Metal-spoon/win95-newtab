import { Wallpaper } from './models/wallpaper.js'

export function initializeWallpapers () {
  let wallpapers = JSON.parse(localStorage.getItem('wallpapers'))
  if (!wallpapers) {
    wallpapers = [
      new Wallpaper('1.png', true, true, null, 0),
      new Wallpaper('2.png', true, true, null, 1)
    ]
    localStorage.setItem('wallpapers', JSON.stringify(wallpapers))
  }
  let isRandom = localStorage.getItem('randomWallpaper')
  if (isRandom == null) {
    isRandom = true
    localStorage.setItem('randomWallpaper', isRandom)
  }
  const selectedWallpaper = selectWallpaper(wallpapers, isRandom)
  updateDOM(selectedWallpaper)
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
