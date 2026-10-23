import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createChromeMock } from '../../../test/mocks/chrome.js'
import { flush, loadIndexHtml, readModalHtml } from '../../../test/helpers.js'

let controller

beforeEach(async () => {
  loadIndexHtml()
  $('#settings-modal').hide()
  controller = await import('./default-controller.js')
})

function openDialog (id) {
  $('#modal-body').html(readModalHtml(id))
  return { id, component: { init: vi.fn() } }
}

const checkbox = (name) => $(`input[name=${name}]`)[0]
const isVisible = (selector) => $(selector).css('display') !== 'none'

describe('init', () => {
  it('fills the inputs with the stored settings', async () => {
    globalThis.chrome = createChromeMock({ storage: { HourFormat24: true, ShowSeconds: false } })

    controller.init(openDialog('clock-settings'))
    await flush()

    expect(checkbox('HourFormat24').checked).toBe(true)
    expect(checkbox('ShowSeconds').checked).toBe(false)
  })

  it('fills every input in the shortcut settings', async () => {
    globalThis.chrome = createChromeMock({
      storage: { TrimTitles: true, TopsiteOutlines: false, RetroTitles: true, ShowBadges: true }
    })

    controller.init(openDialog('shortcut-settings'))
    await flush()

    const values = $('#shortcut-settings-modal input').map((i, input) => [[input.name, input.checked]]).get()
    expect(Object.fromEntries(values)).toEqual({
      TrimTitles: true, TopsiteOutlines: false, RetroTitles: true, ShowBadges: true
    })
  })

  it('fills non-checkbox inputs by value', async () => {
    globalThis.chrome = createChromeMock({ storage: { Name: 'abc' } })
    $('#modal-body').html('<div id="test-modal"><input type="text" name="Name"></div>')

    controller.init({ id: 'test' })
    await flush()

    expect($('input[name=Name]').val()).toBe('abc')
  })

  it('opens the dialog', () => {
    controller.init(openDialog('clock-settings'))

    expect(isVisible('#settings-modal')).toBe(true)
  })
})

describe('save', () => {
  it('stores the input values and refreshes the component', async () => {
    const dialog = openDialog('clock-settings')
    controller.init(dialog)
    await flush()
    checkbox('HourFormat24').checked = true
    checkbox('ShowSeconds').checked = false

    controller.save()
    await flush()

    expect(chrome._storage).toEqual({ HourFormat24: true, ShowSeconds: false })
    expect(dialog.component.init).toHaveBeenCalledWith({ HourFormat24: true, ShowSeconds: false })
  })

  it('stores non-checkbox inputs by value', async () => {
    $('#modal-body').html('<div id="test-modal"><input type="text" name="Name" value="xyz"></div>')
    controller.init({ id: 'test' })

    controller.save()
    await flush()

    expect(chrome._storage).toEqual({ Name: 'xyz' })
  })

  it('works for dialogs without a component', async () => {
    controller.init({ id: 'credits' })

    controller.save()
    await flush()

    expect(isVisible('#settings-modal')).toBe(false)
  })

  it('shows the spinner until saving has finished', async () => {
    controller.init(openDialog('clock-settings'))

    controller.save()
    expect(isVisible('.spinner')).toBe(true)
    expect($('#spinner-text').text()).toBe('Saving...')

    await flush()
    expect(isVisible('.spinner')).toBe(false)
  })

  it('closes the dialog and shows the speech bubble for 3 seconds', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    controller.init(openDialog('clock-settings'))
    $('.speech-bubble').hide()

    controller.save()
    await flush()

    expect(isVisible('#settings-modal')).toBe(false)
    expect(isVisible('.speech-bubble')).toBe(true)

    vi.advanceTimersByTime(3000)
    expect(isVisible('.speech-bubble')).toBe(false)
  })
})
