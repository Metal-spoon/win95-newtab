import { html } from '../utils/html.js'

let TrimTitles
let TopsiteOutlines
let RetroTitles
let ShowBadges

export function init (settings) {
  $('.topSiteList').empty()
  // chrome.topSites.get.length = 1 = Firefox
  // chrome.topSites.get.lenght = 0 = Chromium

  TrimTitles = settings.TrimTitles
  TopsiteOutlines = settings.TopsiteOutlines
  RetroTitles = settings.RetroTitles
  ShowBadges = settings.ShowBadges

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

const badgeValRegex = /(?<=\()[0-9.,]*(?=\))/
const trimRegex = /(?<=\)\s|^)([\p{L}\p{N}_./-]*)(?=:|\s|$)/u
const titleUrlRegex = /(?:\.|\/{2})(.*)(?:\.)/

export function parseTopsite (site, { ShowBadges, TrimTitles }) {
  let title = site.title
  if (!title) {
    // URLs without a dot (e.g. localhost) don't match, so use the host instead
    const match = titleUrlRegex.exec(site.url)
    title = (match ? match[1] : new URL(site.url).hostname || site.url)
      .replace(/^./, (str) => str.toUpperCase())
  }

  title = title.replace(/['"]/g, '')
  let badgeVal
  if (ShowBadges && badgeValRegex.test(title)) {
    badgeVal = badgeValRegex.exec(title)[0]
    badgeVal = badgeVal.replace(/\./, '')
  }

  if (TrimTitles) {
    // Keep the whole title when there is nothing sensible to trim it to
    title = trimRegex.exec(title)?.[0] || title
  }

  return { ...site, title, badgeVal }
}

export function getFaviconUrl (site) {
  if (site.favicon) {
    return site.favicon
  }
  const faviconUrl = new URL(chrome.runtime.getURL('/_favicon/'))
  faviconUrl.searchParams.set('pageUrl', site.url)
  faviconUrl.searchParams.set('size', '32')
  return faviconUrl.toString()
}

function buildTopsiteList (sites) {
  $('.topSiteList').empty()
  sites.slice(0, 10).forEach((site, index) => {
    const topSite = parseTopsite(site, { ShowBadges, TrimTitles })
    $('.topSiteList').append(html`
      <a title='${topSite.title}'class=topsite href='${topSite.url}'>
        <li class=topsiteContent>
          <div class=img-wrapper>
            <img id=topsite${index} width=32px height=32px src=/>
          </div>
          <span class=topsiteTitle>${topSite.title}</span>
        </li>
      </a>
    `)
    $(`#topsite${index}`).prop('src', getFaviconUrl(topSite))
    if (ShowBadges && topSite.badgeVal) {
      $('.topSiteList > a:last > li:last > .img-wrapper:last').append(
        `<div class="topsite-badge">${topSite.badgeVal}</div>`
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
