let selectedWallpaper
let Wallpapers
let RandomWallpaper
const assetPath = '/assets/img/bg/'

export function init (settings) {
  Wallpapers = settings.Wallpapers
  RandomWallpaper = settings.RandomWallpaper
  selectedWallpaper = selectWallpaper()
  updateDOM(selectedWallpaper)
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
