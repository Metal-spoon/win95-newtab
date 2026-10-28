import { vi } from 'vitest'

// In-memory stand-in for the parts of the extension API this project uses.
// Callbacks run asynchronously like the real API; use flush() to let them settle.

const clone = (value) => (value === undefined ? undefined : structuredClone(value))

function pick (data, keys) {
  if (keys === null || keys === undefined) {
    return clone(data)
  }
  if (typeof keys === 'string') {
    keys = [keys]
  }
  if (Array.isArray(keys)) {
    const result = {}
    keys.forEach((key) => {
      if (key in data) {
        result[key] = clone(data[key])
      }
    })
    return result
  }
  const result = {}
  Object.entries(keys).forEach(([key, fallback]) => {
    result[key] = key in data ? clone(data[key]) : clone(fallback)
  })
  return result
}

const later = (callback, ...args) => {
  if (callback) {
    queueMicrotask(() => callback(...args))
  }
}

/**
 * @param {object} options
 * @param {'chrome'|'firefox'} [options.browser] which topSites.get signature to emulate
 * @param {object} [options.storage] initial contents of storage.local
 * @param {Array} [options.topSites] sites returned by topSites.get
 */
export function createChromeMock ({ browser = 'chrome', storage = {}, topSites = [] } = {}) {
  const data = clone(storage)

  const local = {
    get: vi.fn((keys, callback) => later(callback, pick(data, keys))),
    set: vi.fn((items, callback) => {
      Object.assign(data, clone(items))
      later(callback)
    }),
    remove: vi.fn((keys, callback) => {
      ;[].concat(keys).forEach((key) => delete data[key])
      later(callback)
    }),
    clear: vi.fn((callback) => {
      Object.keys(data).forEach((key) => delete data[key])
      later(callback)
    })
  }

  // The code tells the browsers apart by the arity of topSites.get:
  // Chromium's takes only a callback and never returns favicons
  const get =
    browser === 'firefox'
      ? function (options, callback) {
        const sites = clone(topSites).map((site) =>
          options && options.includeFavicon ? site : { ...site, favicon: undefined }
        )
        later(callback, sites)
      }
      : function (...args) {
        const callback = args[args.length - 1]
        later(
          callback,
          clone(topSites).map(({ favicon, ...site }) => site)
        )
      }

  const getMock = vi.fn(get)
  Object.defineProperty(getMock, 'length', { value: get.length })

  return {
    storage: { local },
    topSites: { get: getMock },
    runtime: { getURL: vi.fn((path) => `chrome-extension://test-id${path}`) },
    // Test-only handle on the raw storage contents
    _storage: data
  }
}
