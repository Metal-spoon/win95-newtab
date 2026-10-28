import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadIndexHtml, mockModalLoading } from '../../../test/helpers.js'

vi.mock('../settings/search-settings.js', () => ({ init: vi.fn(), save: vi.fn() }))
vi.mock('../settings/wallpaper-settings.js', () => ({ init: vi.fn(), save: vi.fn() }))
vi.mock('../settings/default-controller.js', () => ({ init: vi.fn(), save: vi.fn() }))

let modal
let spinner
let controllers

beforeEach(async () => {
  loadIndexHtml()
  mockModalLoading()
  controllers = {
    search: await import('../settings/search-settings.js'),
    wallpaper: await import('../settings/wallpaper-settings.js'),
    default: await import('../settings/default-controller.js')
  }
  spinner = await import('./spinner-component.js')
  modal = await import('./modal-component.js')
  modal.init()
  $('#settings-modal').hide()
})

const modalIsOpen = () => $('#settings-modal').css('display') !== 'none'
const pressKey = (code) => $(document).trigger($.Event('keydown', { code }))

describe('showModal', () => {
  it.each([
    ['background-settings', 'Background settings', 'wallpaper'],
    ['search-settings', 'Search settings', 'search'],
    ['clock-settings', 'Clock settings', 'default'],
    ['shortcut-settings', 'Shortcut settings', 'default']
  ])('opens %s with its title, content and controller', (id, title, controller) => {
    modal.showModal(id)

    expect($('#modal-title').text()).toBe(title)
    expect($(`#modal-body #${id}-modal, #modal-body .background-container`)).not.toHaveLength(0)
    expect(controllers[controller].init).toHaveBeenCalledWith(expect.objectContaining({ id, title }))
  })

  it('loads the dialog content from the modals folder', () => {
    modal.showModal('clock-settings')

    expect($.fn.load).toHaveBeenCalledWith('../../html/modals/clock-settings.html', expect.any(Function))
  })

  it('passes the component to refresh after saving', async () => {
    const clockComponent = await import('./clock-component.js')
    const topsitesComponent = await import('./topsites-component.js')

    modal.showModal('clock-settings')
    modal.showModal('shortcut-settings')

    expect(controllers.default.init.mock.calls[0][0].component).toBe(clockComponent)
    expect(controllers.default.init.mock.calls[1][0].component).toBe(topsitesComponent)
  })

  it('shows credits with only a Close button', () => {
    modal.showModal('credits')

    expect(modalIsOpen()).toBe(true)
    expect($('#modal-button-cancel').css('display')).toBe('none')
    expect($('#modal-button-save').text()).toBe('Close')
  })
})

describe('buttons', () => {
  it('saves through the dialog controller', () => {
    modal.showModal('search-settings')
    $('#modal-button-save').trigger('click')

    expect(controllers.search.save).toHaveBeenCalled()
  })

  it('closes credits and restores the buttons without saving', () => {
    modal.showModal('credits')
    $('#modal-button-save').trigger('click')

    expect(modalIsOpen()).toBe(false)
    expect(controllers.default.save).not.toHaveBeenCalled()
    expect($('#modal-button-cancel').css('display')).not.toBe('none')
    expect($('#modal-button-save').text()).toBe('Save')
  })

  it.each(['#modal-button-cancel', '#modal-x-button'])('closes without saving when %s is clicked', (button) => {
    modal.showModal('clock-settings')
    $('#settings-modal').show()
    $(button).trigger('click')

    expect(modalIsOpen()).toBe(false)
    expect(controllers.default.save).not.toHaveBeenCalled()
  })

  it.each([
    ['X', () => $('#modal-x-button').trigger('click')],
    ['Escape', () => pressKey('Escape')]
  ])('restores the buttons when credits is closed with %s', (_, close) => {
    modal.showModal('credits')
    close()
    modal.showModal('clock-settings')

    expect($('#modal-button-cancel').css('display')).not.toBe('none')
    expect($('#modal-button-save').text()).toBe('Save')
  })
})

describe('Escape key', () => {
  beforeEach(() => {
    modal.showModal('clock-settings')
    $('#settings-modal').show()
  })

  it('closes the dialog', () => {
    pressKey('Escape')

    expect(modalIsOpen()).toBe(false)
  })

  it('does nothing while the spinner is showing', () => {
    spinner.show()
    pressKey('Escape')

    expect(modalIsOpen()).toBe(true)
  })

  it('ignores other keys', () => {
    pressKey('Enter')

    expect(modalIsOpen()).toBe(true)
  })
})
