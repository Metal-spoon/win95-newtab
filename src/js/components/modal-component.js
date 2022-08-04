import * as searchSettings from '../settings/search-settings.js'
import * as wallpaperSettings from '../settings/wallpaper-settings.js'
import * as clockComponent from '../components/clock-component.js'
import * as defaultController from '../settings/default-controller.js'
import { IsLoading } from '../components/spinner-component.js'

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
  {
    id: 'clock-settings',
    title: 'Clock settings',
    controller: defaultController,
    component: clockComponent
  },
  {
    id: 'misc-settings',
    title: 'Miscellaneous settings',
    controller: defaultController
  },
  { id: 'credits', title: 'Credits', controller: defaultController }
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
        if (!IsLoading) {
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

function closeModal () {
  $('#settings-modal').hide()
}

function onModalSaveClick (e) {
  if (currentDialog.id === 'credits') {
    closeModal()
    $('#modal-button-cancel').show()
    $('#modal-button-save').text('Save')
    return
  }
  currentDialog.controller.save()
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
    currentDialog.controller.init(currentDialog)
  })
}
