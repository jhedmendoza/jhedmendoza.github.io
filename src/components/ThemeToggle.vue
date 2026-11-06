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
.theme-toggle i { font-size: 22px; transition: transform 0.4s ease, filter 0.4s ease; }
/* light mode: the moon stays plain, and gets a faint cool halo only on hover */
.theme-toggle .bx-moon { filter: drop-shadow(0 0 0 rgba(5, 99, 187, 0)); }
.theme-toggle:hover .bx-moon,
.theme-toggle:focus-visible .bx-moon {
  filter: drop-shadow(0 0 4px rgba(5, 99, 187, 0.45)) drop-shadow(0 0 10px rgba(5, 99, 187, 0.2));
}
.theme-toggle:hover { color: var(--c-accent); }
.theme-toggle:hover i { transform: rotate(-20deg); }
.theme-toggle:focus-visible { outline: 2px solid var(--c-accent); outline-offset: 2px; }
/* dark mode: the sun glows warmly with a slow, gentle pulse */
:root[data-theme="dark"] .theme-toggle .bx-sun {
  color: #ffd166;
  animation: sunGlow 3.2s ease-in-out infinite;
}
:root[data-theme="dark"] .theme-toggle:hover .bx-sun {
  color: #ffe08a;
  filter: drop-shadow(0 0 6px rgba(255, 209, 102, 0.95)) drop-shadow(0 0 16px rgba(255, 179, 71, 0.6));
  animation-play-state: paused;
}
@keyframes sunGlow {
  0%, 100% { filter: drop-shadow(0 0 3px rgba(255, 209, 102, 0.7)) drop-shadow(0 0 8px rgba(255, 179, 71, 0.35)); }
  50%      { filter: drop-shadow(0 0 5px rgba(255, 209, 102, 0.9)) drop-shadow(0 0 14px rgba(255, 179, 71, 0.55)); }
}
.theme-toggle.with-label { width: auto; justify-content: flex-start; }
.theme-toggle-label { font-size: 15px; font-weight: 600; color: var(--c-ink); }
@media (prefers-reduced-motion: reduce) {
  .theme-toggle i { transition: none; }
  /* keep the glow, drop the pulse */
  :root[data-theme="dark"] .theme-toggle .bx-sun {
    animation: none;
    filter: drop-shadow(0 0 4px rgba(255, 209, 102, 0.8)) drop-shadow(0 0 10px rgba(255, 179, 71, 0.45));
  }
}
</style>
