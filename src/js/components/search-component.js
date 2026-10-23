import { navigateTo } from '../utils/navigation.js'
import { SearchEngineList } from '../settings/defaults.js'

let SelectedSearchEngine

export function init (settings) {
  // Stored engines are copies, so use the current definition when there is one
  SelectedSearchEngine =
    SearchEngineList.find(({ id }) => id === settings.SelectedSearchEngine.id) ??
    settings.SelectedSearchEngine
  $('#search-dialog-title').text(`${SelectedSearchEngine.name} search...`)
  bindevents()
}

function onSearchButtonClick (e) {
  $('#searchbutton').trigger('blur')
  const searchQuery = encodeURIComponent($('.searchbar').val())
  if (searchQuery !== '') {
    navigateTo(SelectedSearchEngine.url + searchQuery)
  }
}

function onSearchbarKeydown (e) {
  if (e.code === 'Enter' || e.code === 'NumpadEnter') {
    onSearchButtonClick()
  }
}

// init() runs again after saving search settings, so unbind first
function bindevents () {
  $('.searchbar')
    .off('keydown', onSearchbarKeydown)
    .on('keydown', onSearchbarKeydown)
  $('#searchbutton')
    .off('click', onSearchButtonClick)
    .on('click', onSearchButtonClick)
}
