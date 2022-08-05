/*
 *TODO:
 *Template based DOM elements instead of hacky inline html appends
 */

let TrimTitles
let TopsiteOutlines
let RetroTitles

export function init (settings) {
  $('.topSiteList').empty()
  // chrome.topSites.get.length = 1 = Firefox
  // chrome.topSites.get.lenght = 0 = Chromium

  TrimTitles = settings.TrimTitles
  TopsiteOutlines = settings.TopsiteOutlines
  RetroTitles = settings.RetroTitles

  if (chrome.topSites.get.length === 0) {
    chrome.topSites.get((result) => {
      buildTopsiteList(result)
      applySettings()
    })
  } else {
    chrome.topSites.get({ includeFavicon: true }, (result) => {
      buildTopsiteList(result)
      applySettings()
    })
  }
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

    if (TrimTitles) {
      const trimRegex = /(?<=\)\s|^)([a-zA-z./0-9]*)(?=\s|$)/g
      topSite.title = trimRegex.exec(topSite.title)[0]
    }
    $('.topSiteList').append(
      "<a title='" +
        topSite.title +
        "'class=topsite href='" +
        topSite.url +
        "'><li class=topsiteContent>" +
        '<img id=topsite' +
        index +
        ' width=32px height=32px src=' +
        '/></br>' +
        '<span class=topsiteTitle>' +
        topSite.title +
        '</span>' +
        '</li></a>'
    )
    if (topSite.favicon) {
      $('#topsite' + index).prop('src', topSite.favicon)
    } else {
      $('#topsite' + index).prop(
        'src',
        'chrome://favicon/size/32/' + topSite.url
      )
    }
  })
}

function applySettings () {
  if (TopsiteOutlines) {
    $('.topsiteTitle').addClass('outline')
  }
  if (RetroTitles) {
    $('.topsiteTitle').addClass('retrobg')
  }
}
