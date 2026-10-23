import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createChromeMock } from '../../../test/mocks/chrome.js'
import { flush } from '../../../test/helpers.js'
import { Wallpaper } from '../models/wallpaper.js'

let wallpaperComponent

const builtIn1 = new Wallpaper('1.png', true, true, null, 0)
const builtIn2 = new Wallpaper('2.png', true, true, null, 1)
const uploaded = new Wallpaper('mine.jpg', false, true, 'WP_2', 2)
const disabled = new Wallpaper('off.png', true, false, null, 3)

beforeEach(async () => {
  document.body.innerHTML = '<div class="background"></div>'
  wallpaperComponent = await import('./wallpaper-component.js')
})

const background = () => $('.background')[0].style.backgroundImage

describe('selectWallpaper', () => {
  it('picks the only enabled wallpaper', () => {
    expect(wallpaperComponent.selectWallpaper([disabled, builtIn1])).toBe(builtIn1)
  })

  it.each([
    [0, builtIn1],
    [0.33, builtIn1],
    [0.34, builtIn2],
    [0.67, uploaded],
    [0.999, uploaded]
  ])('picks between enabled wallpapers using the random number (%s)', (random, expected) => {
    const list = [builtIn1, disabled, builtIn2, uploaded]
    expect(wallpaperComponent.selectWallpaper(list, () => random)).toBe(expected)
  })

  it('never picks a disabled wallpaper', () => {
    const list = [disabled, builtIn1, disabled, builtIn2]
    for (const random of [0, 0.25, 0.5, 0.75, 0.999]) {
      expect(wallpaperComponent.selectWallpaper(list, () => random).isEnabled).toBe(true)
    }
  })

  it('picks nothing when no wallpaper is enabled', () => {
    expect(wallpaperComponent.selectWallpaper([disabled])).toBeUndefined()
  })
})

describe('init', () => {
  it('shows a built-in wallpaper from the extension assets', () => {
    wallpaperComponent.init({ Wallpapers: [builtIn2] })

    expect(background()).toBe('url("/assets/img/bg/2.png")')
  })

  it('loads an uploaded wallpaper from storage', async () => {
    globalThis.chrome = createChromeMock({ storage: { WP_2: 'data:image/png;base64,AAA' } })

    wallpaperComponent.init({ Wallpapers: [uploaded] })
    await flush()

    expect(chrome.storage.local.get).toHaveBeenCalledWith('WP_2', expect.any(Function))
    expect(background()).toBe('url("data:image/png;base64,AAA")')
  })

  it('uses Math.random to choose between several enabled wallpapers', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9)

    wallpaperComponent.init({ Wallpapers: [builtIn1, builtIn2] })

    expect(background()).toBe('url("/assets/img/bg/2.png")')
  })
})
