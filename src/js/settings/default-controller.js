import * as spinner from '../components/spinner-component.js'

let _currentDialog

export function init (currentDialog) {
  _currentDialog = currentDialog
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

export function save () {
  showSpinner('Saving...')
  const saveData = {}
  $('#' + _currentDialog.id + '-modal input').each((index, input) => {
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
    if (_currentDialog.component) {
      _currentDialog.component.init()
    }
    hideSpinner()
    showSpeechBubble()
    closeModal()
  })
}
export function showSpeechBubble () {
  $('.speech-bubble').fadeIn().delay(3000).fadeOut()
}

export function showSpinner (text = undefined) {
  spinner.show(text)
}

export function hideSpinner () {
  spinner.hide()
}

export function closeModal () {
  $('#settings-modal').hide()
}
