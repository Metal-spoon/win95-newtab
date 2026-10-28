import { describe, expect, it } from 'vitest'
import { html } from './html.js'

describe('html', () => {
  it('removes line breaks and the indentation that follows them', () => {
    const result = html`
      <div>
        <span>text</span>
      </div>
    `
    expect(result).toBe('<div><span>text</span></div>')
  })

  it('keeps spaces within a line', () => {
    expect(html`<img src='a.png' width='96px' />`).toBe("<img src='a.png' width='96px' />")
  })

  it('inserts values without modifying them', () => {
    const title = 'line\n   break'
    const result = html`
      <span>${title}</span>
    `
    expect(result).toBe('<span>line\n   break</span>')
  })

  it('inserts non-string values', () => {
    expect(html`<i>${3}</i><b>${undefined}</b>`).toBe('<i>3</i><b>undefined</b>')
  })

  it('leaves a single-line template unchanged', () => {
    expect(html`<option value=1>Google</option>`).toBe('<option value=1>Google</option>')
  })
})
