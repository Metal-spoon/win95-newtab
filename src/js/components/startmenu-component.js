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
  modalcomponent.showModal(e.target.id)
}

function bindevents () {
  $('.background').on('click', onBackgroundClick)
  $('#startButton').on('click', onStartButtonClick)
  $('.menuItem').on('click', onMenuItemClick)
}
