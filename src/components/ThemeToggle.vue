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
.theme-toggle i {
  font-size: 22px;
  /* plain at rest; the zero-size glows let the hover glow fade in smoothly */
  filter: drop-shadow(0 0 0 transparent) drop-shadow(0 0 0 transparent);
  transition: transform 0.4s ease, filter 0.4s ease, color 0.25s ease;
}
.theme-toggle:hover i { transform: rotate(-20deg); }
.theme-toggle:focus-visible { outline: 2px solid var(--c-accent); outline-offset: 2px; }
/* the icon only lights up on hover / keyboard focus:
   light mode, the moon glows cool blue; dark mode, the sun glows warm yellow */
.theme-toggle:hover .bx-moon,
.theme-toggle:focus-visible .bx-moon {
  color: var(--c-accent);
  filter: drop-shadow(0 0 6px rgba(5, 99, 187, 0.75)) drop-shadow(0 0 16px rgba(6, 120, 227, 0.45));
}
.theme-toggle:hover .bx-sun,
.theme-toggle:focus-visible .bx-sun {
  color: #ffd166;
  filter: drop-shadow(0 0 6px rgba(255, 209, 102, 0.95)) drop-shadow(0 0 16px rgba(255, 179, 71, 0.6));
}
.theme-toggle.with-label { width: auto; justify-content: flex-start; }
.theme-toggle-label { font-size: 15px; font-weight: 600; color: var(--c-ink); }
@media (prefers-reduced-motion: reduce) {
  .theme-toggle i { transition: none; }
}
</style>
