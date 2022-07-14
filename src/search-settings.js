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
  const customEngines = searchEngines.filter((x) => x.isCustom === true)
  if (customEngines.length > 0) {
    customEngines.forEach((customEngine) => {
      const element = buildSearchEngineOptionElement(customEngine)
      $('#search-engine-delete-dropdown').append(element)
    })
  }
  $('#add-search-engine-button').on('click', addSearchEngine)
  $('#search-engine-delete-button').on('click', deleteSearchEngine)
  $('#custom-engine-name').on('change paste keyup', updateSearchEngineDOM)
  $('#custom-engine-url').on('change paste keyup', updateSearchEngineDOM)
  updateSearchEngineDOM()
  $('#settings-modal').show()
}

function buildSearchEngineOptionElement (searchEngine) {
  const element =
    "<option value='" + searchEngine.id + "'>" + searchEngine.name + '</option>'
  return element
}
function deleteSearchEngine (e) {
  const engineToDelete = $('#search-engine-delete-dropdown').val()
  const index = searchEngines.findIndex((x) => x.id === Number(engineToDelete))
  searchEngines.splice(index, 1)
  $("option[value='" + engineToDelete + "']").remove()
  updateSearchEngineDOM()
}

function addSearchEngine (e) {
  if (
    $.trim($('#custom-engine-name').val()) === '' ||
    $.trim($('#custom-engine-url').val()) === ''
  ) {
    return
  }

  const newSearchEngine = {
    id: searchEngines.length + 1,
    name: $('#custom-engine-name').val(),
    url: $('#custome-engine-url').val(),
    isCustom: true
  }
  const element = buildSearchEngineOptionElement(newSearchEngine)
  searchEngines.push(newSearchEngine)
  $('#search-engine-dropdown').append(element)
  $('#search-engine-delete-dropdown').append(element)

  updateSearchEngineDOM()
}

function updateSearchEngineDOM () {
  const customEngines = searchEngines.filter((x) => x.isCustom === true)
  if (customEngines.length === 0) {
    $('#search-engine-delete-dropdown').hide()
    $('#search-engine-delete-button').hide()
    $('#delete-search-engine-span').hide()
  } else {
    $('#search-engine-delete-dropdown').show()
    $('#search-engine-delete-button').show()
    $('#delete-search-engine-span').show()
  }
  if (
    $('#custom-engine-name').val().trim() === '' ||
    $('#custom-engine-url').val().trim() === ''
  ) {
    $('#add-search-engine-button').prop('disabled', true)
  } else {
    $('#add-search-engine-button').prop('disabled', false)
  }
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
