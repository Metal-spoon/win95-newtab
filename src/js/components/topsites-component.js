/*
 *TODO:
 *Template based DOM elements instead of hacky inline html appends
 */
import {
  TrimTitles as defaultTrimTitles,
  TopsiteOutlines as defaultTopsiteOutlines,
  RetroTitles as defaultRetroTitles,
  SetDefaultSettings
} from '../settings/defaults'

let TrimTitles
let TopsiteOutlines
let RetroTitles

export function init () {
  $('.topSiteList').empty()
  // chrome.topSites.get.length = 1 = Firefox
  // chrome.topSites.get.lenght = 0 = Chromium
  chrome.storage.local.get(
    ['Trimtitles', 'TopsiteOutlines', 'RetroTitles'],
    (result) => {
      TrimTitles = result.TrimTitles
      TopsiteOutlines = result.TopsiteOutlines
      RetroTitles = result.RetroTitles
      if (
        TrimTitles == null ||
        TopsiteOutlines == null ||
        RetroTitles == null
      ) {
        TrimTitles = defaultTrimTitles
        TopsiteOutlines = defaultTopsiteOutlines
        RetroTitles = defaultRetroTitles
        SetDefaultSettings()
      }

      if (chrome.topSites.get.length === 0) {
        chrome.topSites.get((result) => {
          buildTopsiteList(result)
        })
      } else {
        chrome.topSites.get({ includeFavicon: true }, (result) => {
          buildTopsiteList(result)
        })
      }
    }
  )
}

function buildTopsiteList (sites) {
  $('.topSiteList').empty()
  sites.slice(0, 10).forEach((topSite, index) => {
    if (!topSite.title) {
      const re = /(?:\.|\/{2})(.*)(?:\.)/g
      topSite.title = re
        .exec(topSite.url)[1]
        .replace(/^./, (str) => str.toUpperCase())
    }
    $('.topSiteList').append(
      "<a title='" +
        topSite.title +
        "'class=topsite href='" +
        topSite.url +
        "'><li class=topsiteContent>" +
        '<img id=test' +
        index +
        ' width=32px height=32px src=' +
        '/></br>' +
        '<span>' +
        topSite.title +
        '</span>' +
        '</li></a>'
    )
    if (topSite.favicon) {
      $('#test' + index).prop('src', topSite.favicon)
    } else {
      $('#test' + index).prop('src', 'chrome://favicon/size/32/' + topSite.url)
    }
  })
}
