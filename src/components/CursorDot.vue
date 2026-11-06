<template>
  <div v-if="enabled" ref="dot" :class="['cursor-dot', { 'is-hover': hovering, 'is-down': pressed, 'is-hidden': hidden }]" aria-hidden="true"></div>
</template>

<script>
// elements that make the dot grow
const INTERACTIVE = 'a, button, [role="button"], [role="tab"], label, summary, .work-card, .blog-card, .posts-item'
// elements where the normal text cursor is more useful than the dot
const TEXT_FIELDS = 'input, textarea, select, [contenteditable="true"]'

export default {
  name: 'CursorDot',
  data() {
    return { enabled: false, hovering: false, pressed: false, hidden: true }
  },
  methods: {
    onMove(e) {
      // position directly on every move so the dot never lags behind the pointer
      this.$refs.dot.style.translate = `${e.clientX}px ${e.clientY}px`
      if (this.hidden && !e.target.closest(TEXT_FIELDS)) this.hidden = false
    },
    onOver(e) {
      const inText = !!e.target.closest(TEXT_FIELDS)
      this.hidden = inText
      this.hovering = !inText && !!e.target.closest(INTERACTIVE)
    },
    onLeaveWindow(e) {
      if (!e.relatedTarget) this.hidden = true
    },
    onDown() { this.pressed = true },
    onUp() { this.pressed = false }
  },
  mounted() {
    // only for a real mouse / trackpad; touch screens keep their default behaviour
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    this.enabled = true
    document.documentElement.classList.add('has-cursor-dot')
    window.addEventListener('mousemove', this.onMove, { passive: true })
    document.addEventListener('mouseover', this.onOver, { passive: true })
    document.addEventListener('mouseout', this.onLeaveWindow, { passive: true })
    window.addEventListener('mousedown', this.onDown, { passive: true })
    window.addEventListener('mouseup', this.onUp, { passive: true })
  },
  beforeUnmount() {
    if (!this.enabled) return
    document.documentElement.classList.remove('has-cursor-dot')
    window.removeEventListener('mousemove', this.onMove)
    document.removeEventListener('mouseover', this.onOver)
    document.removeEventListener('mouseout', this.onLeaveWindow)
    window.removeEventListener('mousedown', this.onDown)
    window.removeEventListener('mouseup', this.onUp)
  }
}
</script>

<style>
/* hide the system pointer while the dot is active (text fields keep their caret) */
html.has-cursor-dot,
html.has-cursor-dot * { cursor: none !important; }
html.has-cursor-dot input,
html.has-cursor-dot textarea,
html.has-cursor-dot select,
html.has-cursor-dot [contenteditable="true"] { cursor: text !important; }

.cursor-dot {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100000;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px; /* centre on the pointer */
  border-radius: 50%;
  background: var(--c-accent);
  pointer-events: none;
  transition: scale 0.25s ease, opacity 0.25s ease;
}
/* over links/buttons: grows into a soft, larger circle */
.cursor-dot.is-hover { scale: 3.2; opacity: 0.28; }
.cursor-dot.is-down { scale: 0.7; }
.cursor-dot.is-hover.is-down { scale: 2.6; }
.cursor-dot.is-hidden { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .cursor-dot { transition: opacity 0.2s ease; }
}
</style>
