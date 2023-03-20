let SelectedSearchEngine

export function init (settings) {
  SelectedSearchEngine = settings.SelectedSearchEngine
  $('#search-dialog-title').text(SelectedSearchEngine.name + ' search...')
  bindevents()
}

function onSearchButtonClick (e) {
  $('#searchbutton').trigger('blur')
  const searchQuery = encodeURIComponent($('.searchbar').val())
  if (searchQuery !== '') {
    window.location.href = SelectedSearchEngine.url + searchQuery
  }
}

function bindevents () {
  $('.searchbar').on('keydown', (e) => {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
      onSearchButtonClick()
    }
  })
  $('#searchbutton').on('click', onSearchButtonClick)
}
