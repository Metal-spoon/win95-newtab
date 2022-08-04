import { Wallpaper } from '../models/wallpaper.js'
import * as modalComponent from '../components/modal-component.js'

let wallpapers
let randomWallpaper
let imageData = {}
const keysToDelete = []
const keyPrefix = 'WP_'
const assetPath = '../assets/img/bg/'

export function init () {
  modalComponent.showSpinner()
  chrome.storage.local.get(['wallpapers', 'randomWallpaper'], (result) => {
    wallpapers = result.wallpapers
    randomWallpaper = result.randomWallpaper
    const keys = wallpapers.flatMap((wallpaper) =>
      wallpaper.key ? wallpaper.key : []
    )
    $('#randomCheckbox')[0].checked = randomWallpaper
    chrome.storage.local.get(keys, (storedImageData) => {
      imageData = storedImageData
      wallpapers.forEach((wallpaper) => {
        const element = buildWallpaperListElement(wallpaper)
        $('.wallpaper-list').append(element)
      })
      updateWallpaperDOM()
      bindEvents()
      modalComponent.hideSpinner()
      $('#settings-modal').show()
    })
  })
}

function bindEvents () {
  $('.delete-icon').on('click', deleteWallpaper)
  $('.random-checkbox').on('click', onRandomCheckboxClick)
  $('.wallpaper-image-wrapper').on('click', toggleWallpaper)
  $('.upload-button').on('click', uploadWallpaper)
  $('#file-input').on('change', onFileUpload)
}

function onFileUpload (e) {
  const filereader = new FileReader()
  filereader.onload = () => {
    modalComponent.showSpinner('Uploading...')
    const id = wallpapers.reduce((a, b) => (a.id > b.y ? a : b)).id + 1
    const data = filereader.result
    const key = keyPrefix + id
    imageData[key] = data
    let isEnabled = true
    if (
      !randomWallpaper &&
      wallpapers.filter((x) => x.isEnabled === true).length === 1
    ) {
      isEnabled = false
    }
    const wallpaperObject = new Wallpaper(
      e.target.files[0].name,
      false,
      isEnabled,
      key,
      id
    )
    wallpapers.push(wallpaperObject)
    const element = buildWallpaperListElement(wallpaperObject)
    $('.wallpaper-list').append(element)
    $('.wallpaper-image-wrapper').off('click')
    $('.wallpaper-image-wrapper').on('click', toggleWallpaper)
    $('.delete-icon').off('click')
    $('.delete-icon').on('click', deleteWallpaper)
    updateWallpaperDOM()
    modalComponent.hideSpinner()
  }
  filereader.readAsDataURL(e.target.files[0])
}

function onRandomCheckboxClick (e) {
  randomWallpaper = $('#randomCheckbox')[0].checked
  $('.wallpaper-checkbox').each(function () {
    this.checked = false
  })
  wallpapers.forEach((wallpaper) => {
    wallpaper.isEnabled = false
  })
  updateWallpaperDOM()
}

function updateWallpaperDOM () {
  if (wallpapers.filter((x) => x.isEnabled === true).length === 0) {
    $('#modal-button-save').prop('disabled', true)
  } else {
    $('#modal-button-save').prop('disabled', false)
  }

  if (!randomWallpaper) {
    if (wallpapers.filter((x) => x.isEnabled === true).length > 1) {
      $('#modal-button-save').prop('disabled', true)
      $('.wallpaper-checkbox').prop('disabled', false)
    } else if (wallpapers.filter((x) => x.isEnabled === true).length === 1) {
      const enabledId = wallpapers.find((x) => x.isEnabled === true).id
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
  const wallpaper = wallpapers.find(
    (x) =>
      x.id ===
      Number(e.target.parentElement.parentElement.children[2].innerText)
  )
  wallpaper.isEnabled = !wallpaper.isEnabled
  updateWallpaperDOM()
}

function deleteWallpaper (e) {
  const id = Number(e.target.parentElement.children[2].innerText)
  const wallpaperIndex = wallpapers.findIndex((x) => x.id === id)
  const wallpaper = wallpapers[wallpaperIndex]
  keysToDelete.push(wallpaper.key)
  delete imageData[wallpaper.key]
  wallpapers.splice(wallpaperIndex, 1)
  e.target.parentElement.parentNode.removeChild(e.target.parentElement)
  updateWallpaperDOM()
}

function buildWallpaperListElement (wallpaper) {
  const imageSrc = wallpaper.isDefault
    ? assetPath + wallpaper.fileName
    : imageData[wallpaper.key]

  let element =
    "<li title='" +
    wallpaper.fileName +
    "' class='wallpaper-item'>" +
    "<div class='wallpaper-image-wrapper checkBoxContainer'>"

  element = element + "<img src='" + imageSrc

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
  modalComponent.showSpinner('Saving...')
  chrome.storage.local.remove(keysToDelete, () => {
    const savedata = {
      wallpapers,
      randomWallpaper
    }
    wallpapers.forEach((wallpaper) => {
      if (!wallpaper.isDefault) {
        savedata[wallpaper.key] = imageData[wallpaper.key]
      }
    })
    chrome.storage.local.set(savedata, () => {
      modalComponent.hideSpinner()
      modalComponent.showSpeechBubble()
      modalComponent.closeModal()
    })
  })
}
