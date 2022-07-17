import * as searchSettings from '../settings/search-settings.js'
import * as wallpaperSettings from '../settings/wallpaper-settings.js'

let currentDialog
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
  { id: 'clock-settings', title: 'Clock settings', controller: null },
  { id: 'misc-settings', title: 'Miscellaneous settings', controller: null }
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
        closeModal()
        break
    }
  })
}

function onModalCancelClick (e) {
  $('#modal-button-cancel').trigger('blur')
  closeModal()
}

function closeModal () {
  $('#settings-modal').hide()
}

function onModalSaveClick (e) {
  if (currentDialog === '#credits-modal') {
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
  showSpeechBubble()
  closeModal()
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
    $('#settings-modal').show()
  })
}

function genericSave () {
  $('#' + currentDialog.id + '-modal input').each(function () {
    switch (this.type) {
      case 'checkbox':
        localStorage.setItem(this.name, this.checked)
        break
      default:
        localStorage.setItem(this.name, this.value)
        break
    }
  })
}

function genericLoad () {
  $('#' + currentDialog.id + '-modal input').each(function () {
    const value = JSON.parse(localStorage.getItem(this.name))
    switch (this.type) {
      case 'checkbox':
        this.checked = value
        break
      default:
        this.value = localStorage.getItem(this.name)
        break
    }
  })
}

function showSpeechBubble () {
  $('.speech-bubble').fadeIn().delay(3000).fadeOut()
}
