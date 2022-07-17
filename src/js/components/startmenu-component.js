import * as modalcomponent from './modal-component.js'

export function init () {
  bindevents()
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
  let content
  let title
  switch (e.target.id) {
    case 'background-settings':
      title = 'Background settings'
      content = '../../html/modals/background-settings.html'
      break
    case 'search-settings':
      title = 'Search settings'
      content = '../../html/modals/search-settings.html'
      break
    case 'clock-settings':
      title = 'Clock settings'
      content = '../../html/modals/clock-settings.html'
      break
    case 'misc-settings':
      title = 'Miscellaneous settings'
      content = '../../html/modals/misc-settings.html'
      break
    case 'credits':
      title = 'Credits'
      content = '../../html/modals/credits.html'
      break
    default:
      return
  }
  $('#modal-title').text(title)
  modalcomponent.showModal(content, e.target.id)
}

function bindevents () {
  $('.background').on('click', onBackgroundClick)
  $('#startButton').on('click', onStartButtonClick)
  $('.menuItem').on('click', onMenuItemClick)
}
