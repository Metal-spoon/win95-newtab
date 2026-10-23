import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { vi } from 'vitest'

const htmlDir = resolve(import.meta.dirname, '../src/html') + '/'

// Lets queued mock API callbacks (and the callbacks they queue) run
export async function flush () {
  for (let i = 0; i < 20; i++) {
    await Promise.resolve()
  }
}

// Renders the real new tab page markup (scripts aren't executed)
export function loadIndexHtml () {
  const source = readFileSync(`${htmlDir}index.html`, 'utf8')
  const page = new DOMParser().parseFromString(source, 'text/html')
  document.body.innerHTML = page.body.innerHTML
}

export function readModalHtml (id) {
  return readFileSync(`${htmlDir}modals/${id}.html`, 'utf8')
}

// $.fn.load fetches over HTTP; serve the modal partials from disk instead
export function mockModalLoading () {
  return vi.spyOn($.fn, 'load').mockImplementation(function (url, callback) {
    const id = /([\w-]+)\.html$/.exec(url)[1]
    this.html(readModalHtml(id))
    if (callback) {
      callback.call(this)
    }
    return this
  })
}
