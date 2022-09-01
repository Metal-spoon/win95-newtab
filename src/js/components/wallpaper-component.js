let selectedWallpaper
let Wallpapers
const assetPath = '/assets/img/bg/'

export function init (settings) {
  Wallpapers = settings.Wallpapers
  selectedWallpaper = selectWallpaper()
  updateDOM(selectedWallpaper)
}

function selectWallpaper () {
  let wallpaper
  const enabledWallpapers = Wallpapers.filter((x) => x.isEnabled === true)
  if (enabledWallpapers.length > 1) {
    const index = Math.floor(Math.random() * enabledWallpapers.length)
    wallpaper = enabledWallpapers[index]
  } else {
    wallpaper = enabledWallpapers[0]
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
