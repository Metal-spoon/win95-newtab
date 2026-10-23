import { afterEach, beforeEach, vi } from 'vitest'
import jQuery from '../src/js/lib/jquery.min.js'
import { createChromeMock } from './mocks/chrome.js'

// Vitest loads jQuery's UMD build as CommonJS, so it exports jQuery instead of
// setting the globals the extension relies on
globalThis.$ = globalThis.jQuery = jQuery
$.fx.off = true

// jsdom doesn't implement innerText; textContent is close enough for the
// short, unstyled text the code reads with it
if (!('innerText' in HTMLElement.prototype)) {
  Object.defineProperty(HTMLElement.prototype, 'innerText', {
    get () { return this.textContent },
    set (value) { this.textContent = value }
  })
}

beforeEach(() => {
  globalThis.chrome = createChromeMock()
  document.body.innerHTML = ''
  // Components keep their state in module scope, so every test gets fresh modules
  vi.resetModules()
})

afterEach(() => {
  $(document).off()
  vi.useRealTimers()
})
