// Kept separate so tests can replace it; jsdom can't navigate
export function navigateTo (url) {
  window.location.href = url
}
