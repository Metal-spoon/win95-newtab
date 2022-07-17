import * as searchSettings from '../settings/search-settings.js'
import * as wallpaperSettings from '../settings/wallpaper-settings.js'

let currentDialog

export function init () {
  bindevents()
}

function bindevents () {
  $('#modal-x-button').on('click', closeModal)
  $('#modal-button-cancel').on('click', onModalCancelClick)
  $('#modal-button-save').on('click', onModalSaveClick)
  $(document).on('keydown', function (e) {
    console.log(e.code)
    switch (e.code) {
      case 'Escape':
        closeModal()
        break
    }
  })
}

function onModalCancelClick (e) {
  $('#modal-button-cancel').blur()
  closeModal()
}

function closeModal () {
  $('#settings-modal').hide()
}

function onModalSaveClick (e) {
  if (currentDialog === '#background-settings-modal') {
    wallpaperSettings.save()
    showSpeechBubble()
    closeModal()
    return
  } else if (currentDialog === '#search-settings-modal') {
    searchSettings.save()
    showSpeechBubble()
    closeModal()
    return
  } else if (currentDialog === '#credits-modal') {
    closeModal()
    $('#modal-button-cancel').show()
    $('#modal-button-save').text('Save')
    return
  }
  $(currentDialog + ' input').each(function () {
    switch (this.type) {
      case 'checkbox':
        localStorage.setItem(this.name, this.checked)
        break
      default:
        localStorage.setItem(this.name, this.value)
        break
    }
  })
  showSpeechBubble()
  closeModal()
}

export function showModal (content, type) {
  currentDialog = '#' + type + '-modal'
  $('#modal-body').load(content, function () {
    if (type === 'background-settings') {
      wallpaperSettings.init()
      return
    } else if (type === 'search-settings') {
      searchSettings.init()
      return
    } else if (type === 'credits') {
      $('#modal-button-cancel').hide()
      $('#modal-button-save').text('Close')
      $('#settings-modal').show()
      return
    }
    $(currentDialog + ' input').each(function () {
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
    $('#settings-modal').show()
  })
}

export function setCurrentDialog (currentDialog) {
  this.currentDialog = currentDialog
}

function showSpeechBubble () {
  $('.speech-bubble').fadeIn().delay(3000).fadeOut()
}
