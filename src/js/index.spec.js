import { expect, it, vi } from 'vitest'

vi.mock('./app.js', () => ({ start: vi.fn() }))

it('starts the app once the document is ready', async () => {
  const { start } = await import('./app.js')

  await import('./index.js')
  await vi.waitFor(() => expect(start).toHaveBeenCalledOnce())
})
