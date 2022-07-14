import { Wallpaper } from './models/wallpaper.js'
let wallPapers = []
let randomWallpaper

export function initializeBackgroundSettings () {
  const wallpapers = JSON.parse(localStorage.getItem('wallpapers'))
  wallPapers = wallpapers
  wallpapers.forEach((wallpaper) => {
    const element = buildWallpaperListElement(wallpaper)
    $('.wallpaper-list').append(element)
  })

  $('.wallpaper-image-wrapper').on('click', toggleWallpaper)

  $('.upload-button').on('click', uploadWallpaper)
  $('#file-input').on('change', (e) => {
    const filereader = new FileReader()
    filereader.onload = () => {
      const data = filereader.result
      let isEnabled = true
      if (
        !randomWallpaper &&
        wallPapers.filter((x) => x.isEnabled === true).length === 1
      ) {
        isEnabled = false
      }
      const wallpaperObject = new Wallpaper(
        e.target.files[0].name,
        false,
        isEnabled,
        data,
        null
      )
      wallPapers.push(wallpaperObject)
      const element = buildWallpaperListElement(wallpaperObject)
      $('.wallpaper-list').append(element)
      $('.wallpaper-image-wrapper').off('click')
      $('.wallpaper-image-wrapper').on('click', toggleWallpaper)
      $('.delete-icon').off('click')
      $('.delete-icon').on('click', deleteWallpaper)
      updateWallpaperDOM()
    }
    filereader.readAsDataURL(e.target.files[0])
  })
  $('.delete-icon').on('click', deleteWallpaper)
  randomWallpaper = JSON.parse(localStorage.getItem('randomWallpaper'))

  $('#randomCheckbox')[0].checked = randomWallpaper
  $('.random-checkbox').on('click', () => {
    randomWallpaper = $('#randomCheckbox')[0].checked
    $('.wallpaper-checkbox').each(function () {
      this.checked = false
    })
    wallPapers.forEach((wallpaper) => {
      wallpaper.isEnabled = false
    })
    updateWallpaperDOM()
  })
  updateWallpaperDOM()
  $('#settings-modal').show()
}

function updateWallpaperDOM () {
  if (wallPapers.filter((x) => x.isEnabled === true).length === 0) {
    $('#modal-button-save').prop('disabled', true)
  } else {
    $('#modal-button-save').prop('disabled', false)
  }

  if (!randomWallpaper) {
    if (wallPapers.filter((x) => x.isEnabled === true).length > 1) {
      $('#modal-button-save').prop('disabled', true)
      $('.wallpaper-checkbox').prop('disabled', false)
    } else if (wallPapers.filter((x) => x.isEnabled === true).length === 1) {
      const enabledId = wallPapers.find((x) => x.isEnabled === true).id
      $('.identifier').each(function () {
        if (Number(this.innerText) !== enabledId) {
          this.parentElement.children[0].children[1].disabled = true
          this.parentElement.children[0].classList.add('default-cursor')
        }
      })
    } else {
      $('.identifier').each(function () {
        this.parentElement.children[0].children[1].disabled = false
        this.parentElement.children[0].classList.remove('default-cursor')
      })
    }
  } else {
    $('.identifier').each(function () {
      this.parentElement.children[0].children[1].disabled = false
      this.parentElement.children[0].classList.remove('default-cursor')
    })
  }
}

function uploadWallpaper (e) {
  $('#file-input').files = []
  $('#file-input').trigger('click')
}

function toggleWallpaper (e) {
  if (e.target.parentElement.children[1].disabled) {
    return
  }
  e.target.parentElement.children[1].checked =
    !e.target.parentElement.children[1].checked
  const wallpaper = wallPapers.find(
    (x) =>
      x.id ===
      Number(e.target.parentElement.parentElement.children[2].innerText)
  )
  wallpaper.isEnabled = !wallpaper.isEnabled
  updateWallpaperDOM()
}

function deleteWallpaper (e) {
  const id = Number(e.target.parentElement.children[2].innerText)
  const wallpaperIndex = wallPapers.findIndex((x) => x.id === id)
  wallPapers.splice(wallpaperIndex, 1)
  e.target.parentElement.parentNode.removeChild(e.target.parentElement)
  updateWallpaperDOM()
}

function buildWallpaperListElement (wallpaper) {
  let element =
    "<li class='wallpaper-item'>" +
    "<div class='wallpaper-image-wrapper checkBoxContainer'>"
  if (wallpaper.imageData) {
    element = element + "<img src='" + wallpaper.imageData
  } else {
    element = element + "<img src='../assets/img/bg/" + wallpaper.fileName
  }
  element =
    element +
    "' width='96px' height='54px' />" +
    "<input class='wallpaper-checkbox' type='checkbox'"
  if (wallpaper.isEnabled) {
    element = element + "checked='true'"
  }

  element =
    element +
    '/>' +
    "<span class='checkmark wallpaper-checkmark'></span>" +
    '</div>' +
    '<div class="wallpaper-file-name-wrapper">' +
    wallpaper.fileName +
    ' </div>'

  element =
    element + "<span class='d-none identifier'>" + wallpaper.id + '</span>'

  if (!wallpaper.isDefault) {
    const deleteImage =
      "<img src='../assets/img/delete.png'width='24px'height='24px'title='Delete wallpaper' class='delete-icon'/> "
    element = element + deleteImage
  }
  element = element + '</li>'

  return element
}

export function save () {
  localStorage.setItem('wallpapers', JSON.stringify(wallPapers))
  localStorage.setItem('randomWallpaper', JSON.stringify(randomWallpaper))
}
