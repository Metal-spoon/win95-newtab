import { expect, it } from 'vitest'
import { navigateTo } from './navigation.js'

it('navigates the current page', () => {
  // jsdom only supports navigating within the page
  navigateTo('#results')

  expect(window.location.hash).toBe('#results')
})
