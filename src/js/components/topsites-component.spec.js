import { beforeEach, describe, expect, it } from 'vitest'
import { createChromeMock } from '../../../test/mocks/chrome.js'
import { flush } from '../../../test/helpers.js'

let topsites

beforeEach(async () => {
  document.body.innerHTML = '<ul class="topSiteList"></ul>'
  topsites = await import('./topsites-component.js')
})

const settings = (overrides = {}) => ({
  TrimTitles: false,
  TopsiteOutlines: false,
  RetroTitles: false,
  ShowBadges: false,
  ...overrides
})

describe('parseTopsite', () => {
  const parse = (site, options = {}) => topsites.parseTopsite(site, settings(options))

  it('keeps a normal title', () => {
    expect(parse({ url: 'https://github.com/', title: 'GitHub' }).title).toBe('GitHub')
  })

  it('removes quotes from the title', () => {
    expect(parse({ url: 'https://a.org/', title: 'It\'s "quoted"' }).title).toBe('Its quoted')
  })

  it('takes a capitalised fallback title from the URL when there is none', () => {
    expect(parse({ url: 'https://github.com/x', title: '' }).title).toBe('Github')
    expect(parse({ url: 'https://www.example.com/', title: '' }).title).toBe('Www.example')
  })

  it.each([
    ['http://localhost:3000/', 'Localhost'],
    ['http://intranet/page', 'Intranet']
  ])('takes a fallback title from the host of %s, which has no dot', (url, expected) => {
    expect(parse({ url, title: '' }).title).toBe(expected)
  })

  it('takes a fallback title from the whole URL when it has no host', () => {
    expect(parse({ url: 'about:blank', title: '' }).title).toBe('About:blank')
  })

  it('keeps the other site properties', () => {
    const site = { url: 'https://a.org/', title: 'A', favicon: 'data:x' }
    expect(parse(site)).toMatchObject(site)
  })

  it('does not modify the original site', () => {
    const site = { url: 'https://a.org/', title: '' }
    parse(site)
    expect(site.title).toBe('')
  })

  describe('badges', () => {
    it.each([
      ['(3) Inbox', '3'],
      ['(12) Inbox', '12'],
      ['(1.234) Notifications', '1234'],
      ['(1,234) Notifications', '1,234'],
      ['Feed (5)', '5']
    ])('reads the badge from "%s" as %s', (title, badge) => {
      expect(parse({ url: 'https://a.org/', title }, { ShowBadges: true }).badgeVal).toBe(badge)
    })

    it('only removes the first dot from a badge', () => {
      expect(parse({ url: 'https://a.org/', title: '(1.234.567) X' }, { ShowBadges: true }).badgeVal).toBe('1234.567')
    })

    it('has no badge when the title has no number in brackets', () => {
      expect(parse({ url: 'https://a.org/', title: 'Inbox (new)' }, { ShowBadges: true }).badgeVal).toBeUndefined()
    })

    it('has no badge when badges are turned off', () => {
      expect(parse({ url: 'https://a.org/', title: '(3) Inbox' }).badgeVal).toBeUndefined()
    })
  })

  describe('trimmed titles', () => {
    it.each([
      ['(3) Inbox: mail', 'Inbox'],
      ['GitHub', 'GitHub'],
      ['YouTube - Broadcast yourself', 'YouTube'],
      ['example.com/page title', 'example.com/page'],
      ['Hello-World', 'Hello-World'],
      ['café', 'café'],
      ['Ünïcode news', 'Ünïcode'],
      ['(2) Ärzte: Termine', 'Ärzte'],
      ['snake_case docs', 'snake_case']
    ])('trims "%s" to "%s"', (title, expected) => {
      expect(parse({ url: 'https://a.org/', title }, { TrimTitles: true }).title).toBe(expected)
    })

    it('reads the badge before trimming', () => {
      const site = parse({ url: 'https://a.org/', title: '(3) Inbox: mail' }, { TrimTitles: true, ShowBadges: true })
      expect(site).toMatchObject({ title: 'Inbox', badgeVal: '3' })
    })

    it.each([
      ['(3) Hello, world'],
      ['Hello, world'],
      [' leading space'],
      ['«Quoted»']
    ])('keeps "%s" whole when there is nothing to trim it to', (title) => {
      expect(parse({ url: 'https://a.org/', title }, { TrimTitles: true }).title).toBe(title)
    })

    it('renders the remaining sites when one title cannot be trimmed', async () => {
      document.body.innerHTML = '<ul class="topSiteList"></ul>'
      globalThis.chrome = createChromeMock({
        topSites: [
          { url: 'https://a.org/', title: 'Hello, world' },
          { url: 'https://b.org/', title: 'Second: site' }
        ]
      })

      topsites.init(settings({ TrimTitles: true }))
      await flush()

      expect($('.topsiteTitle').map((i, el) => el.textContent).get()).toEqual(['Hello, world', 'Second'])
    })
  })
})

describe('getFaviconUrl', () => {
  it('uses the favicon the browser provided', () => {
    expect(topsites.getFaviconUrl({ url: 'https://a.org/', favicon: 'data:image/png;base64,AA' }))
      .toBe('data:image/png;base64,AA')
  })

  it("falls back to the extension's favicon service", () => {
    const url = new URL(topsites.getFaviconUrl({ url: 'https://a.org/?q=1&b=2' }))

    expect(url.href.split('?')[0]).toBe('chrome-extension://test-id/_favicon/')
    expect(url.searchParams.get('pageUrl')).toBe('https://a.org/?q=1&b=2')
    expect(url.searchParams.get('size')).toBe('32')
  })
})

describe('init', () => {
  const sites = [
    { url: 'https://mail.example.com/', title: '(3) Inbox: mail', favicon: 'data:mail' },
    { url: 'https://github.com/x', title: '', favicon: 'data:gh' },
    { url: 'https://news.example.org/', title: 'News' }
  ]

  async function render (options, { browser = 'chrome', topSites = sites } = {}) {
    globalThis.chrome = createChromeMock({ browser, topSites })
    topsites.init(settings(options))
    await flush()
    return $('.topSiteList > a.topsite')
  }

  it('renders a link per site with its title', async () => {
    const links = await render()

    expect(links).toHaveLength(3)
    expect(links.eq(0).attr('href')).toBe('https://mail.example.com/')
    expect(links.eq(0).attr('title')).toBe('(3) Inbox: mail')
    expect(links.eq(0).find('.topsiteTitle').text()).toBe('(3) Inbox: mail')
    expect(links.eq(1).find('.topsiteTitle').text()).toBe('Github')
  })

  it('renders the same markup as before the template refactor', async () => {
    await render({}, { topSites: [sites[2]] })

    const img = $('#topsite0')[0]
    img.removeAttribute('src')
    expect($('.topSiteList').html()).toBe(
      '<a title="News" class="topsite" href="https://news.example.org/"><li class="topsiteContent"><div class="img-wrapper"><img id="topsite0" width="32px" height="32px"></div><span class="topsiteTitle">News</span></li></a>'
    )
  })

  it('shows at most 10 sites', async () => {
    const many = Array.from({ length: 15 }, (_, i) => ({ url: `https://site${i}.com/`, title: `Site ${i}` }))
    const links = await render({}, { topSites: many })

    expect(links).toHaveLength(10)
    expect(links.last().attr('href')).toBe('https://site9.com/')
  })

  it('replaces the previous list when called again', async () => {
    await render()
    const links = await render()

    expect(links).toHaveLength(3)
  })

  it('uses the favicon service in Chrome, which provides no favicons', async () => {
    await render({}, { browser: 'chrome' })

    expect(chrome.topSites.get).toHaveBeenCalledWith(expect.any(Function))
    $('.topSiteList img').each((index, img) => {
      expect(img.src).toMatch(/^chrome-extension:\/\/test-id\/_favicon\/\?pageUrl=/)
    })
  })

  it('asks Firefox for favicons and uses them', async () => {
    await render({}, { browser: 'firefox' })

    expect(chrome.topSites.get).toHaveBeenCalledWith({ includeFavicon: true }, expect.any(Function))
    expect($('#topsite0').attr('src')).toBe('data:mail')
    expect($('#topsite1').attr('src')).toBe('data:gh')
    expect($('#topsite2').attr('src')).toMatch(/_favicon/)
  })

  it('shows badges when turned on', async () => {
    await render({ ShowBadges: true })

    expect($('.topsite-badge')).toHaveLength(1)
    expect($('.topsite').eq(0).find('.img-wrapper .topsite-badge').text()).toBe('3')
  })

  it('shows no badges when turned off', async () => {
    await render({ ShowBadges: false })

    expect($('.topsite-badge')).toHaveLength(0)
  })

  it('shows trimmed titles when turned on', async () => {
    await render({ TrimTitles: true })

    expect($('.topsiteTitle').first().text()).toBe('Inbox')
  })

  it.each([
    ['TopsiteOutlines', 'outline'],
    ['RetroTitles', 'retrobg']
  ])('adds the %s style only when turned on', async (setting, className) => {
    await render({ [setting]: true })
    expect($('.topsiteTitle').toArray().every((el) => el.classList.contains(className))).toBe(true)

    await render({ [setting]: false })
    expect($(`.topsiteTitle.${className}`)).toHaveLength(0)
  })
})
