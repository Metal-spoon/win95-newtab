import { SearchEngineList } from './defaults.js'
import * as searchComponent from '../components/search-component.js'
import * as modalComponent from '../components/modal-component.js'

let SelectedSearchEngine

export function init () {
  modalComponent.showSpinner()
  chrome.storage.local.get(['SelectedSearchEngine'], (result) => {
    SelectedSearchEngine = result.SelectedSearchEngine
    SearchEngineList.forEach((searchEngine) => {
      const element = buildSearchEngineOptionElement(searchEngine)
      $('#search-engine-dropdown').append(element)
    })
    $('#search-engine-dropdown').val(SelectedSearchEngine.id)
    bindEvents()
    modalComponent.hideSpinner()
    $('#settings-modal').show()
  })
}

function bindEvents () {
  $('#search-engine-dropdown').on('change', onDropdownChange)
}

function onDropdownChange () {
  const dropdownValue = parseInt($('#search-engine-dropdown').val())
  SelectedSearchEngine = SearchEngineList.find((x) => x.id === dropdownValue)
  console.log(SelectedSearchEngine)
}

function buildSearchEngineOptionElement (searchEngine) {
  const element =
    '<option value=' + searchEngine.id + '>' + searchEngine.name + '</option>'
  return element
}

export function save () {
  modalComponent.showSpinner('Saving...')
  chrome.storage.local.set(
    { SelectedSearchEngine },
    () => {
      searchComponent.init()
      modalComponent.hideSpinner()
      modalComponent.showSpeechBubble()
      modalComponent.closeModal()
    }
  )
}
