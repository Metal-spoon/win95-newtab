let hourFormat24
let showSeconds
let clockInterval

export function init () {
  chrome.storage.local.get(['hourFormat24', 'showSeconds'], (result) => {
    clearInterval(clockInterval)
    hourFormat24 = result.hourFormat24
    showSeconds = result.showSeconds
    updateClock()
    clockInterval = setInterval(updateClock, 1000)
  })
}

function updateClock () {
  const currentTime = new Date()
  let currentHours = currentTime.getHours()
  let currentMinutes = currentTime.getMinutes()
  currentMinutes = (currentMinutes < 10 ? '0' : '') + currentMinutes
  let dayTime = ''

  if (!hourFormat24) {
    dayTime = currentHours < 12 ? ' AM' : ' PM'
    currentHours = currentHours > 12 ? currentHours - 12 : currentHours
    currentHours = currentHours === 0 ? 12 : currentHours
  }
  let clockString = currentHours + ':' + currentMinutes
  if (showSeconds) {
    let currentSeconds = currentTime.getSeconds()
    if (currentSeconds < 10) {
      currentSeconds = '0' + currentSeconds
    }
    clockString = clockString + ':' + currentSeconds
  }
  if (!hourFormat24) {
    clockString = clockString + dayTime
  }

  $('.clockText').text(clockString)
}
