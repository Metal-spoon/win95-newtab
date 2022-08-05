let HourFormat24
let ShowSeconds
let clockInterval

export function init (settings) {
  HourFormat24 = settings.HourFormat24
  ShowSeconds = settings.ShowSeconds
  clearInterval(clockInterval)

  updateClock()
  clockInterval = setInterval(updateClock, 1000)
}

function updateClock () {
  const currentTime = new Date()
  let currentHours = currentTime.getHours()
  let currentMinutes = currentTime.getMinutes()
  currentMinutes = (currentMinutes < 10 ? '0' : '') + currentMinutes
  let dayTime = ''

  if (!HourFormat24) {
    dayTime = currentHours < 12 ? ' AM' : ' PM'
    currentHours = currentHours > 12 ? currentHours - 12 : currentHours
    currentHours = currentHours === 0 ? 12 : currentHours
  }
  let clockString = currentHours + ':' + currentMinutes
  if (ShowSeconds) {
    let currentSeconds = currentTime.getSeconds()
    if (currentSeconds < 10) {
      currentSeconds = '0' + currentSeconds
    }
    clockString = clockString + ':' + currentSeconds
  }
  if (!HourFormat24) {
    clockString = clockString + dayTime
  }

  $('.clockText').text(clockString)
}
