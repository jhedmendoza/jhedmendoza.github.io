import { reactive } from 'vue'

const STORAGE_KEY = 'theme'
const root = document.documentElement
const systemDark = window.matchMedia('(prefers-color-scheme: dark)')

function readSaved() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch (e) {
    return null
  }
}

// index.html already set data-theme before paint; start from that
export const themeState = reactive({
  theme: root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
})

let switchTimer = null
function apply(theme) {
  // cross-fade colours just for the duration of the switch
  root.classList.add('theme-switching')
  clearTimeout(switchTimer)
  switchTimer = setTimeout(() => root.classList.remove('theme-switching'), 350)

  themeState.theme = theme
  root.setAttribute('data-theme', theme)
}

export function toggleTheme() {
  const next = themeState.theme === 'dark' ? 'light' : 'dark'
  apply(next)
  try { localStorage.setItem(STORAGE_KEY, next) } catch (e) { /* private mode: still works for this visit */ }
}

// follow the OS setting until the visitor picks a theme themselves
systemDark.addEventListener('change', (e) => {
  if (!readSaved()) apply(e.matches ? 'dark' : 'light')
})
