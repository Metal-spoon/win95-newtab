import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createChromeMock } from '../../../test/mocks/chrome.js'
import { flush, loadIndexHtml, readModalHtml } from '../../../test/helpers.js'
import { Wallpaper } from '../models/wallpaper.js'

let wallpaperSettings

const storedWallpapers = () => [
  new Wallpaper('1.png', true, true, null, 0),
  new Wallpaper('2.png', true, false, null, 1),
  new Wallpaper('mine.jpg', false, true, 'WP_2', 2)
]

async function openDialog () {
  $('#modal-body').html(readModalHtml('background-settings'))
  wallpaperSettings.init()
  await flush()
}

beforeEach(async () => {
  loadIndexHtml()
  $('#settings-modal').hide()
  globalThis.chrome = createChromeMock({
    storage: { Wallpapers: storedWallpapers(), WP_2: 'data:image/jpeg;base64,MINE' }
  })
  wallpaperSettings = await import('./wallpaper-settings.js')
  await openDialog()
})

const items = () => $('.wallpaper-list > .wallpaper-item')
const item = (fileName) => items().filter((i, li) => li.title === fileName)
const saveDisabled = () => $('#modal-button-save').prop('disabled')

async function save () {
  wallpaperSettings.save()
  await flush()
}

describe('nextWallpaperId', () => {
  it('follows the last id', () => {
    expect(wallpaperSettings.nextWallpaperId([{ id: 0 }, { id: 1 }, { id: 5 }])).toBe(6)
  })

  it('uses the highest id when the list is not in order', () => {
    expect(wallpaperSettings.nextWallpaperId([{ id: 0 }, { id: 5 }, { id: 1 }])).toBe(6)
  })

  it('starts at 0 for an empty list', () => {
    expect(wallpaperSettings.nextWallpaperId([])).toBe(0)
  })
})

describe('init', () => {
  it('lists every stored wallpaper', () => {
    expect(items().map((i, li) => li.title).get()).toEqual(['1.png', '2.png', 'mine.jpg'])
  })

  it('shows built-in wallpapers from the assets folder and uploaded ones from storage', () => {
    expect(item('1.png').find('img').attr('src')).toBe('../assets/img/bg/1.png')
    expect(item('mine.jpg').find('img').attr('src')).toBe('data:image/jpeg;base64,MINE')
  })

  it('ticks enabled wallpapers', () => {
    expect(item('1.png').find('.wallpaper-checkbox').prop('checked')).toBe(true)
    expect(item('2.png').find('.wallpaper-checkbox').prop('checked')).toBe(false)
  })

  it('only offers to delete uploaded wallpapers', () => {
    expect(item('1.png').find('.delete-icon')).toHaveLength(0)
    expect(item('mine.jpg').find('.delete-icon')).toHaveLength(1)
  })

  it('renders the same markup as before the template refactor', () => {
    expect(item('mine.jpg')[0].outerHTML).toBe(
      '<li title="mine.jpg" class="wallpaper-item"><div class="wallpaper-image-wrapper checkBoxContainer"><img src="data:image/jpeg;base64,MINE" width="96px" height="54px"><input class="wallpaper-checkbox" type="checkbox" checked="true"><span class="checkmark wallpaper-checkmark"></span></div><div class="wallpaper-file-name-wrapper">mine.jpg </div><span class="d-none identifier">2</span><img src="../assets/img/icon_delete.png" width="24px" height="24px" title="Delete wallpaper" class="delete-icon"> </li>'
    )
  })

  it('opens the dialog with Save enabled', () => {
    expect($('#settings-modal').css('display')).not.toBe('none')
    expect(saveDisabled()).toBe(false)
  })
})

describe('toggling', () => {
  const toggle = (fileName) => item(fileName).find('.wallpaper-image-wrapper img').trigger('click')

  it('ticks and unticks a wallpaper when it is clicked', () => {
    toggle('2.png')
    expect(item('2.png').find('.wallpaper-checkbox').prop('checked')).toBe(true)

    toggle('2.png')
    expect(item('2.png').find('.wallpaper-checkbox').prop('checked')).toBe(false)
  })

  it('disables Save when no wallpaper is enabled', () => {
    toggle('1.png')
    toggle('mine.jpg')
    expect(saveDisabled()).toBe(true)

    toggle('2.png')
    expect(saveDisabled()).toBe(false)
  })

  it('ignores clicks on a disabled checkbox', () => {
    item('2.png').find('.wallpaper-checkbox').prop('disabled', true)
    toggle('2.png')

    expect(item('2.png').find('.wallpaper-checkbox').prop('checked')).toBe(false)
  })

  it('saves the new enabled state', async () => {
    toggle('2.png')
    toggle('1.png')
    await save()

    expect(chrome._storage.Wallpapers.map((w) => w.isEnabled)).toEqual([false, true, true])
  })
})

describe('deleting', () => {
  const remove = (fileName) => item(fileName).find('.delete-icon').trigger('click')

  it('removes the wallpaper from the list', () => {
    remove('mine.jpg')

    expect(item('mine.jpg')).toHaveLength(0)
    expect(items()).toHaveLength(2)
  })

  it('removes the wallpaper and its image from storage on save', async () => {
    remove('mine.jpg')
    await save()

    expect(chrome._storage.Wallpapers.map((w) => w.fileName)).toEqual(['1.png', '2.png'])
    expect(chrome._storage).not.toHaveProperty('WP_2')
  })

  it('disables Save when the last enabled wallpaper is deleted', async () => {
    item('1.png').find('.wallpaper-image-wrapper img').trigger('click')
    remove('mine.jpg')

    expect(saveDisabled()).toBe(true)
  })

  it('keeps everything in storage until Save is clicked', () => {
    remove('mine.jpg')

    expect(chrome._storage.WP_2).toBe('data:image/jpeg;base64,MINE')
    expect(chrome._storage.Wallpapers).toHaveLength(3)
  })

  // keysToDelete is never cleared, but save() writes back the images of all
  // listed wallpapers after removing, so a cancelled delete loses nothing
  it('keeps the image of a wallpaper whose delete was cancelled', async () => {
    remove('mine.jpg')
    await openDialog()
    await save()

    expect(chrome._storage.WP_2).toBe('data:image/jpeg;base64,MINE')
  })
})

describe('uploading', () => {
  const file = new File(['png-bytes'], 'new.png', { type: 'image/png' })

  async function upload () {
    $('#file-input').trigger($.Event('change', { target: { files: [file] } }))
    await vi.waitFor(() => expect(item('new.png')).toHaveLength(1))
  }

  it('opens the file picker when Upload is clicked', () => {
    const picker = vi.fn()
    $('#file-input').on('click', picker)

    $('.upload-button').trigger('click')

    expect(picker).toHaveBeenCalled()
  })

  it('adds the image to the list as an enabled, deletable wallpaper', async () => {
    await upload()

    const added = item('new.png')
    expect(added.find('img').first().attr('src')).toMatch(/^data:image\/png;base64,/)
    expect(added.find('.wallpaper-checkbox').prop('checked')).toBe(true)
    expect(added.find('.delete-icon')).toHaveLength(1)
    expect(added.find('.identifier').text()).toBe('3')
  })

  it('saves the wallpaper and its image under a new key', async () => {
    await upload()
    await save()

    expect(chrome._storage.Wallpapers[3]).toEqual({
      fileName: 'new.png', isDefault: false, isEnabled: true, key: 'WP_3', id: 3
    })
    expect(chrome._storage.WP_3).toBe(`data:image/png;base64,${btoa('png-bytes')}`)
  })

  it('makes the new wallpaper toggleable and deletable', async () => {
    await upload()

    item('new.png').find('.wallpaper-image-wrapper img').trigger('click')
    expect(item('new.png').find('.wallpaper-checkbox').prop('checked')).toBe(false)

    item('new.png').find('.delete-icon').trigger('click')
    expect(item('new.png')).toHaveLength(0)
  })

  it('re-enables Save when every other wallpaper was disabled', async () => {
    item('1.png').find('.wallpaper-image-wrapper img').trigger('click')
    item('mine.jpg').find('.wallpaper-image-wrapper img').trigger('click')
    expect(saveDisabled()).toBe(true)

    await upload()

    expect(saveDisabled()).toBe(false)
  })
})

describe('save', () => {
  it('closes the dialog and shows the speech bubble', async () => {
    $('.speech-bubble').hide()
    await save()

    expect($('#settings-modal').css('display')).toBe('none')
    expect($('.speech-bubble').css('display')).not.toBe('none')
    expect($('.spinner').css('display')).toBe('none')
  })

  it('keeps unchanged settings as they were', async () => {
    await save()

    expect(chrome._storage.Wallpapers).toEqual(JSON.parse(JSON.stringify(storedWallpapers())))
    expect(chrome._storage.WP_2).toBe('data:image/jpeg;base64,MINE')
  })
})
