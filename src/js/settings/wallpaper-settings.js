import { Wallpaper } from '../models/wallpaper.js'
import * as defaultController from './default-controller.js'

let Wallpapers
let RandomWallpaper
let imageData = {}
const keysToDelete = []
const keyPrefix = 'WP_'
const assetPath = '../assets/img/bg/'

export function init () {
  defaultController.showSpinner()
  chrome.storage.local.get(['Wallpapers', 'RandomWallpaper'], (result) => {
    Wallpapers = result.Wallpapers
    RandomWallpaper = result.RandomWallpaper
    const keys = Wallpapers.flatMap((wallpaper) =>
      wallpaper.key ? wallpaper.key : []
    )
    $('#randomCheckbox')[0].checked = RandomWallpaper
    chrome.storage.local.get(keys, (storedImageData) => {
      imageData = storedImageData
      Wallpapers.forEach((wallpaper) => {
        const element = buildWallpaperListElement(wallpaper)
        $('.wallpaper-list').append(element)
      })
      updateWallpaperDOM()
      bindEvents()
      defaultController.hideSpinner()
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
    defaultController.showSpinner('Uploading...')
    const id = Wallpapers.reduce((a, b) => (a.id > b.y ? a : b)).id + 1
    const data = filereader.result
    const key = keyPrefix + id
    imageData[key] = data
    let isEnabled = true
    if (
      !RandomWallpaper &&
      Wallpapers.filter((x) => x.isEnabled === true).length === 1
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
    Wallpapers.push(wallpaperObject)
    const element = buildWallpaperListElement(wallpaperObject)
    $('.wallpaper-list').append(element)
    $('.wallpaper-image-wrapper').off('click')
    $('.wallpaper-image-wrapper').on('click', toggleWallpaper)
    $('.delete-icon').off('click')
    $('.delete-icon').on('click', deleteWallpaper)
    updateWallpaperDOM()
    defaultController.hideSpinner()
  }
  filereader.readAsDataURL(e.target.files[0])
}

function onRandomCheckboxClick (e) {
  RandomWallpaper = $('#randomCheckbox')[0].checked
  $('.wallpaper-checkbox').each(function () {
    this.checked = false
  })
  Wallpapers.forEach((wallpaper) => {
    wallpaper.isEnabled = false
  })
  updateWallpaperDOM()
}

function updateWallpaperDOM () {
  if (Wallpapers.filter((x) => x.isEnabled === true).length === 0) {
    $('#modal-button-save').prop('disabled', true)
  } else {
    $('#modal-button-save').prop('disabled', false)
  }

  if (!RandomWallpaper) {
    if (Wallpapers.filter((x) => x.isEnabled === true).length > 1) {
      $('#modal-button-save').prop('disabled', true)
      $('.wallpaper-checkbox').prop('disabled', false)
    } else if (Wallpapers.filter((x) => x.isEnabled === true).length === 1) {
      const enabledId = Wallpapers.find((x) => x.isEnabled === true).id
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
  const wallpaper = Wallpapers.find(
    (x) =>
      x.id ===
      Number(e.target.parentElement.parentElement.children[2].innerText)
  )
  wallpaper.isEnabled = !wallpaper.isEnabled
  updateWallpaperDOM()
}

function deleteWallpaper (e) {
  const id = Number(e.target.parentElement.children[2].innerText)
  const wallpaperIndex = Wallpapers.findIndex((x) => x.id === id)
  const wallpaper = Wallpapers[wallpaperIndex]
  keysToDelete.push(wallpaper.key)
  delete imageData[wallpaper.key]
  Wallpapers.splice(wallpaperIndex, 1)
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
  defaultController.showSpinner('Saving...')
  chrome.storage.local.remove(keysToDelete, () => {
    const savedata = {
      Wallpapers,
      RandomWallpaper
    }
    Wallpapers.forEach((wallpaper) => {
      if (!wallpaper.isDefault) {
        savedata[wallpaper.key] = imageData[wallpaper.key]
      }
    })
    chrome.storage.local.set(savedata, () => {
      defaultController.hideSpinner()
      defaultController.showSpeechBubble()
      defaultController.closeModal()
    })
  })
}
