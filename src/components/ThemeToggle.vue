<template>
  <button type="button" :class="['theme-toggle', { 'with-label': label }]" :aria-label="ariaLabel" :title="ariaLabel" @click="toggleTheme">
    <i :class="['bx', isDark ? 'bx-sun' : 'bx-moon']" aria-hidden="true"></i>
    <span v-if="label" class="theme-toggle-label">{{ isDark ? 'Light mode' : 'Dark mode' }}</span>
  </button>
</template>

<script>
import { themeState, toggleTheme } from '../theme.js'

export default {
  name: 'ThemeToggle',
  props: {
    // show a text label next to the icon (used in the mobile drawer)
    label: { type: Boolean, default: false }
  },
  computed: {
    isDark() { return themeState.theme === 'dark' },
    ariaLabel() { return this.isDark ? 'Switch to light mode' : 'Switch to dark mode' }
  },
  methods: { toggleTheme }
}
</script>

<style>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--c-muted);
  cursor: pointer;
  transition: color 0.25s ease;
}
.theme-toggle i { font-size: 22px; transition: transform 0.4s ease; }
.theme-toggle:hover { color: var(--c-accent); }
.theme-toggle:hover i { transform: rotate(-20deg); }
.theme-toggle:focus-visible { outline: 2px solid var(--c-accent); outline-offset: 2px; }
.theme-toggle.with-label { width: auto; justify-content: flex-start; }
.theme-toggle-label { font-size: 15px; font-weight: 600; color: var(--c-ink); }
@media (prefers-reduced-motion: reduce) {
  .theme-toggle i { transition: none; }
}
</style>
