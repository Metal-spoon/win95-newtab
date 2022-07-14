let searchEngines
let selectedSearchEngine

export function initializeSearchSettings () {
  searchEngines = JSON.parse(localStorage.getItem('searchengines'))
  selectedSearchEngine = JSON.parse(
    localStorage.getItem('selectedsearchengine')
  )
  const element = buildSearchEngineOptionElement(selectedSearchEngine)
  $('#search-engine-dropdown').append(element)
  searchEngines
    .filter((x) => x.id !== selectedSearchEngine.id)
    .forEach((searchEngine) => {
      const element = buildSearchEngineOptionElement(searchEngine)
      $('#search-engine-dropdown').append(element)
    })

  $('#settings-modal').show()
}

function buildSearchEngineOptionElement (searchEngine) {
  const element =
    "<option value='" + searchEngine.id + "'>" + searchEngine.name + '</option>'
  return element
}

export function save () {
  localStorage.setItem('searchengines', JSON.stringify(searchEngines))
  const selectedSearchEngine = searchEngines.find(
    (x) => x.id === Number($('#search-engine-dropdown').val())
  )
  localStorage.setItem(
    'selectedsearchengine',
    JSON.stringify(selectedSearchEngine)
  )
  $('#search-dialog-title').text(selectedSearchEngine.name + ' search...')
}
