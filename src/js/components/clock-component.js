/*
 *TODO:
 *Update the format/showseconds variable when saving settings so that localstorrage does not get queried every second
 */

export function init () {
  updateClock()
  setInterval(updateClock, 1000)
}

function updateClock () {
  const hourFormat24 = JSON.parse(localStorage.getItem('24hourformat'))
  const showSeconds = JSON.parse(localStorage.getItem('showseconds'))
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
