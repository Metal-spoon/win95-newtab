import { DefaultSearchEngine } from '../models/searchengine.js'

let selectedSearchEngine

export function init () {
  chrome.storage.local.get(['selectedSearchEngine'], (result) => {
    selectedSearchEngine = result.selectedSearchEngine
    if (!selectedSearchEngine) {
      selectedSearchEngine = DefaultSearchEngine
      chrome.storage.local.set({ selectedSearchEngine })
    }
    $('#search-dialog-title').text(selectedSearchEngine.name + ' search...')
    bindevents()
  })
}

function onSearchButtonClick (e) {
  $('#searchbutton').trigger('blur')
  const searchQuery = $('.searchbar').val()
  if (searchQuery !== '') {
    window.location.href = selectedSearchEngine.url + searchQuery
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
