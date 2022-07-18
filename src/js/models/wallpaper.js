export class Wallpaper {
  constructor (fileName, isDefault, isEnabled, imageData, id) {
    this.fileName = fileName
    this.isDefault = isDefault
    this.isEnabled = isEnabled
    this.imageData = imageData
    this.id =
      id != null ? id : JSON.parse(localStorage.getItem('wallpapers')).length
  }
}
