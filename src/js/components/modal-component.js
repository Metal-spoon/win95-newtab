import * as searchSettings from '../settings/search-settings.js'
import * as wallpaperSettings from '../settings/wallpaper-settings.js'
import * as clockComponent from '../components/clock-component.js'

let currentDialog
let isLoading = false

const dialogs = [
  {
    id: 'background-settings',
    title: 'Background settings',
    controller: wallpaperSettings
  },
  {
    id: 'search-settings',
    title: 'Search settings',
    controller: searchSettings
  },
  {
    id: 'clock-settings',
    title: 'Clock settings',
    controller: null,
    component: clockComponent
  },
  { id: 'misc-settings', title: 'Miscellaneous settings', controller: null },
  { id: 'credits', title: 'Credits', controller: null }
]

const contentpath = '../../html/modals/'

export function init () {
  bindevents()
}

function bindevents () {
  $('#modal-x-button').on('click', closeModal)
  $('#modal-button-cancel').on('click', onModalCancelClick)
  $('#modal-button-save').on('click', onModalSaveClick)
  $(document).on('keydown', function (e) {
    switch (e.code) {
      case 'Escape':
        if (!isLoading) {
          closeModal()
        }
        break
    }
  })
}

function onModalCancelClick (e) {
  $('#modal-button-cancel').trigger('blur')
  closeModal()
}

export function closeModal () {
  $('#settings-modal').hide()
}

function onModalSaveClick (e) {
  if (currentDialog.id === 'credits') {
    closeModal()
    $('#modal-button-cancel').show()
    $('#modal-button-save').text('Save')
    return
  }
  if (currentDialog.controller) {
    currentDialog.controller.save()
  } else {
    genericSave()
  }
}

export function showModal (elementId) {
  currentDialog = dialogs.find(({ id }) => id === elementId)
  $('#modal-title').text(currentDialog.title)
  const content = contentpath + currentDialog.id + '.html'
  $('#modal-body').load(content, function () {
    if (currentDialog.id === 'credits') {
      $('#modal-button-cancel').hide()
      $('#modal-button-save').text('Close')
      $('#settings-modal').show()
    }
    if (currentDialog.controller) {
      currentDialog.controller.init()
    } else {
      genericLoad()
    }
  })
}

export function genericSave () {
  showSpinner('Saving...')
  const saveData = {}
  $('#' + currentDialog.id + '-modal input').each((index, input) => {
    switch (input.type) {
      case 'checkbox':
        saveData[input.name] = input.checked
        break
      default:
        saveData[input.name] = input.value
        break
    }
  })
  chrome.storage.local.set(saveData, () => {
    if (currentDialog.component) {
      currentDialog.component.init()
    }
    hideSpinner()
    showSpeechBubble()
    closeModal()
  })
}

export function genericLoad () {
  showSpinner()
  $('#' + currentDialog.id + '-modal input').each((index, input) => {
    chrome.storage.local.get(input.name, (result) => {
      const value = result[input.name]
      switch (input.type) {
        case 'checkbox':
          input.checked = value
          break
        default:
          input.value = value
          break
      }
    })
  })
  hideSpinner()
  $('#settings-modal').show()
}

export function showSpeechBubble () {
  $('.speech-bubble').fadeIn().delay(3000).fadeOut()
}

export function showSpinner (text = 'Loading...') {
  isLoading = true
  $('#spinner-text').text(text)
  $('.spinner').show()
}

export function hideSpinner () {
  isLoading = false
  $('.spinner').hide()
}
