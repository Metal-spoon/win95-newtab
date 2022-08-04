import {
  SelectedSearchEngine as defaultSearchEngine,
  SetDefaultSettings
} from '../settings/defaults.js'

let SelectedSearchEngine

export function init () {
  chrome.storage.local.get(['SelectedSearchEngine'], (result) => {
    SelectedSearchEngine = result.SelectedSearchEngine
    if (!SelectedSearchEngine) {
      SelectedSearchEngine = defaultSearchEngine
      SetDefaultSettings()
    }
    $('#search-dialog-title').text(SelectedSearchEngine.name + ' search...')
    bindevents()
  })
}

function onSearchButtonClick (e) {
  $('#searchbutton').trigger('blur')
  const searchQuery = $('.searchbar').val()
  if (searchQuery !== '') {
    window.location.href = SelectedSearchEngine.url + searchQuery
  }
}

function bindevents () {
  $('.searchbar').on('keydown', (e) => {
    if (e.code === 'Enter') {
      onSearchButtonClick()
    }
  })
  $('#searchbutton').on('click', onSearchButtonClick)
}
