import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadIndexHtml } from '../../../test/helpers.js'

vi.mock('./modal-component.js', () => ({ showModal: vi.fn() }))

let showModal

beforeEach(async () => {
  loadIndexHtml()
  ;({ showModal } = await import('./modal-component.js'))
  const startmenu = await import('./startmenu-component.js')
  startmenu.init()
  $('.startMenu').hide()
})

const menuIsOpen = () => $('.startMenu').css('display') !== 'none'

describe('start menu', () => {
  it('opens when the start button is clicked', () => {
    $('#startButton').trigger('click')

    expect(menuIsOpen()).toBe(true)
    expect($('#startButton').hasClass('startClick')).toBe(true)
  })

  it('closes when the start button is clicked again', () => {
    $('#startButton').trigger('click')
    $('#startButton').trigger('click')

    expect(menuIsOpen()).toBe(false)
    expect($('#startButton').hasClass('startClick')).toBe(false)
  })

  it('closes when the background is clicked', () => {
    $('#startButton').trigger('click')
    $('.background').trigger('click')

    expect(menuIsOpen()).toBe(false)
    expect($('#startButton').hasClass('startClick')).toBe(false)
  })

  it('has a menu item for every settings dialog', () => {
    const ids = $('.menuItem').map((index, item) => item.id).get()

    expect(ids).toEqual(expect.arrayContaining([
      'background-settings',
      'search-settings',
      'clock-settings',
      'shortcut-settings',
      'credits'
    ]))
  })

  it('opens the matching dialog and closes the menu when an item is clicked', () => {
    $('#startButton').trigger('click')
    $('#clock-settings').trigger('click')

    expect(showModal).toHaveBeenCalledWith('clock-settings')
    expect(menuIsOpen()).toBe(false)
    expect($('#startButton').hasClass('startClick')).toBe(false)
  })
})
