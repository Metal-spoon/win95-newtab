import { beforeEach, describe, expect, it } from 'vitest'
import { loadIndexHtml } from '../../../test/helpers.js'

let spinner

beforeEach(async () => {
  loadIndexHtml()
  spinner = await import('./spinner-component.js')
})

describe('spinner component', () => {
  it('is not loading initially', () => {
    expect(spinner.IsLoading).toBe(false)
  })

  it('shows the spinner with the default text', () => {
    spinner.show()

    expect(spinner.IsLoading).toBe(true)
    expect($('.spinner').css('display')).not.toBe('none')
    expect($('#spinner-text').text()).toBe('Loading...')
  })

  it('shows custom text', () => {
    spinner.show('Saving...')

    expect($('#spinner-text').text()).toBe('Saving...')
  })

  it('hides the spinner', () => {
    spinner.show()
    spinner.hide()

    expect(spinner.IsLoading).toBe(false)
    expect($('.spinner').css('display')).toBe('none')
  })
})
