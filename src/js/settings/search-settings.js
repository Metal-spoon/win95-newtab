import { SearchEngineList } from '../models/searchengine.js'
import * as searchComponent from '../components/search-component.js'
import * as modalComponent from '../components/modal-component.js'

let selectedSearchEngine

export function init () {
  chrome.storage.local.get(['selectedSearchEngine'], (result) => {
    selectedSearchEngine = result.selectedSearchEngine
    SearchEngineList.forEach((searchEngine) => {
      const element = buildSearchEngineOptionElement(searchEngine)
      $('#search-engine-dropdown').append(element)
    })
    $('#search-engine-dropdown').val(selectedSearchEngine.id)
    bindEvents()
    $('#settings-modal').show()
  })
}

function bindEvents () {
  $('#search-engine-dropdown').on('change', onDropdownChange)
}

function onDropdownChange () {
  const dropdownValue = parseInt($('#search-engine-dropdown').val())
  selectedSearchEngine = SearchEngineList.find((x) => x.id === dropdownValue)
  console.log(selectedSearchEngine)
}

function buildSearchEngineOptionElement (searchEngine) {
  const element =
    '<option value=' + searchEngine.id + '>' + searchEngine.name + '</option>'
  return element
}

export function save () {
  chrome.storage.local.set({ selectedSearchEngine }, () => {
    searchComponent.init()
    modalComponent.showSpeechBubble()
    modalComponent.closeModal()
  })
}
