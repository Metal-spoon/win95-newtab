import './lib/js/jquery.min.js'
import './lib/js/bootstrap.min.js'
import { initializeTopSites } from './topsites.js'
import * as wallpaperSettings from './wallpaper-settings.js'
import { initializeWallpapers } from './wallpapers.js'
import * as searchengines from './searchengines.js'
import * as searchSettings from './search-settings.js'
import * as clock from './clock.js'

let currentDialog = ''

function onSearchButtonClick (e) {
  $('#searchbutton').trigger('blur')
  const searchQuery = $('.searchbar').val()
  const searchEngine = JSON.parse(localStorage.getItem('selectedsearchengine'))
  if (searchQuery !== '') {
    window.location.href = searchEngine.url + searchQuery
  }
}

function onBackgroundClick (e) {
  $('#startButton').removeClass('startClick')
  $('.startMenu').hide()
}

function onStartButtonClick (e) {
  $('#startButton').trigger('blur')
  $('.startMenu').toggle()
  $('#startButton').toggleClass('startClick')
}

function onMenuItemClick (e) {
  $('#startButton').removeClass('startClick')
  $('.startMenu').hide()
  currentDialog = '#' + e.target.id + '-modal'
  let content
  let title
  switch (e.target.id) {
    case 'background-settings':
      title = 'Background settings'
      content = './modals/background-settings.html'
      break
    case 'search-settings':
      title = 'Search settings'
      content = './modals/search-settings.html'
      break
    case 'clock-settings':
      title = 'Clock settings'
      content = './modals/clock-settings.html'
      break
    case 'misc-settings':
      title = 'Miscellaneous settings'
      content = './modals/misc-settings.html'
      break
    case 'credits':
      title = 'Credits'
      content = './modals/credits.html'
      break
    default:
      return
  }
  $('#modal-title').text(title)
  showModal(content, e.target.id)
}

function showModal (content, type) {
  $('#modal-body').load(content, function () {
    if (type === 'background-settings') {
      wallpaperSettings.initializeBackgroundSettings()
      return
    } else if (type === 'search-settings') {
      searchSettings.initializeSearchSettings()
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

function onModalXClick (e) {
  closeModal()
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
  if (currentDialog === '#misc-settings-modal') {
    initializeTopSites()
  }
  showSpeechBubble()
  closeModal()
}

function showSpeechBubble () {
  $('.speech-bubble').fadeIn().delay(3000).fadeOut()
}

$(function () {
  clock.init()
  initializeTopSites()
  searchengines.initializeSearchEngines()
  initializeWallpapers()
  $(document).on('keydown', function (e) {
    console.log(e.code)
    switch (e.code) {
      case 'Escape': // escape
        closeModal()
        break
    }
  })
  $('.startMenu').hide()
  $('.speech-bubble').hide()
  $('.background').on('click', onBackgroundClick)
  $('#searchbutton').on('click', onSearchButtonClick)
  $('.searchbar').on('keydown', (e) => {
    if (e.code === 'Enter') {
      onSearchButtonClick()
    }
  })
  $('#startButton').on('click', onStartButtonClick)

  $('.menuItem').on('click', onMenuItemClick)
  $('#modal-x-button').on('click', onModalXClick)
  $('#modal-button-cancel').on('click', onModalCancelClick)
  $('#modal-button-save').on('click', onModalSaveClick)
})
