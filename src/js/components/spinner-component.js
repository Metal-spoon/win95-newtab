export function show (text = 'Loading...') {
  IsLoading = true
  $('#spinner-text').text(text)
  $('.spinner').show()
}

export function hide () {
  IsLoading = false
  $('.spinner').hide()
}

export let IsLoading = false
