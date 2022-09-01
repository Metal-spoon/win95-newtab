import { Wallpaper } from '../models/wallpaper.js'
import * as defaultController from './default-controller.js'

let Wallpapers
let imageData = {}
const keysToDelete = []
const keyPrefix = 'WP_'
const assetPath = '../assets/img/bg/'

export function init () {
  defaultController.showSpinner()
  chrome.storage.local.get(['Wallpapers'], (result) => {
    Wallpapers = result.Wallpapers
    const keys = Wallpapers.flatMap((wallpaper) =>
      wallpaper.key ? wallpaper.key : []
    )
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
    const isEnabled = true
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

function updateWallpaperDOM () {
  if (Wallpapers.filter((x) => x.isEnabled === true).length === 0) {
    $('#modal-button-save').prop('disabled', true)
  } else {
    $('#modal-button-save').prop('disabled', false)
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
      "<img src='../assets/img/icon_delete.png'width='24px'height='24px'title='Delete wallpaper' class='delete-icon'/> "
    element = element + deleteImage
  }
  element = element + '</li>'

  return element
}

export function save () {
  defaultController.showSpinner('Saving...')
  chrome.storage.local.remove(keysToDelete, () => {
    const savedata = {
      Wallpapers
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
