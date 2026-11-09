<template>
  <div
    v-if="enabled"
    ref="dot"
    :class="['cursor-dot', `is-${mode}`, { 'is-down': pressed, 'is-hidden': hidden }]"
    aria-hidden="true"
  ></div>
</template>

<script>
// elements the cursor reacts to
const INTERACTIVE = 'a, button, [role="button"], [role="tab"], label, summary, .work-card, .blog-card, .posts-item'
// interactive elements that always get the ring, never the underline (cards, icon nav, social icons)
const RING_ONLY = '.work-card, .blog-card, .posts-item, .site-nav a, .social-links a, .mobile-nav-toggle'
// elements where the normal cursor is more useful than the dot
// (iframes, e.g. the comments box, don't pass mouse moves to the page, so the dot would freeze there)
const TEXT_FIELDS = 'input, textarea, select, [contenteditable="true"], iframe'
// how long the dot keeps easing after it lets go of a link, so it glides back to the pointer
const GLIDE_MS = 320
// marks the link whose own text-decoration is hidden while the cursor draws its underline
const UNDERLINED = 'cursor-underlined'

const isTransparent = (color) => color === 'transparent' || /rgba\(.*,\s*0\)$/.test(color)

// Where the underline goes for this element, or null if it should get the ring instead.
function underlineFor(el) {
  if (el.matches(RING_ONLY) || !el.textContent.trim()) return null
  const cs = getComputedStyle(el)
  if (!isTransparent(cs.backgroundColor)) return null // filled buttons
  const box = el.getBoundingClientRect()
  if (box.height > 60) return null

  // links that already draw a hairline underline: sit exactly on it, so the cursor fills it in
  const border = parseFloat(cs.borderBottomWidth)
  if (border > 0 && cs.borderBottomStyle !== 'none') {
    return { left: box.left, top: box.bottom - border, width: box.width }
  }

  // otherwise: just under the text itself (ignoring padding)
  const range = document.createRange()
  range.selectNodeContents(el)
  const text = range.getBoundingClientRect()
  if (!text.width) return null
  if (text.height > parseFloat(cs.fontSize) * 2.4) return null // wraps onto several lines
  return { left: text.left, top: text.bottom + 1, width: text.width }
}

export default {
  name: 'CursorDot',
  data() {
    return { enabled: false, mode: 'dot', pressed: false, hidden: true }
  },
  methods: {
    place(x, y) {
      this.$refs.dot.style.translate = `${x}px ${y}px`
    },
    // ease the position (snapping on/off a link) or track 1:1 (following the pointer, scrolling).
    // Set as an inline custom property so it applies synchronously, before the next move.
    glide(on) {
      this.$refs.dot.style.setProperty('--glide', on ? `${GLIDE_MS}ms` : '0s')
    },
    onMove(e) {
      this.x = e.clientX
      this.y = e.clientY
      if (this.hidden && !e.target.closest(TEXT_FIELDS)) this.hidden = false
      if (this.mode === 'line') {
        // stay put on the link; only re-check if the link vanished (e.g. after a route change)
        if (this._target && this._target.isConnected) return
        this.evaluate(e.target)
        if (this.mode === 'line') return
      }
      // position directly on every move so the dot never lags behind the pointer
      this.place(e.clientX, e.clientY)
    },
    onOver(e) {
      this.evaluate(e.target)
    },
    // pick dot / line / ring for whatever is under the pointer
    evaluate(el) {
      if (!el || !el.closest || !this.$refs.dot) return
      const inText = !!el.closest(TEXT_FIELDS)
      this.hidden = inText
      const target = inText ? null : el.closest(INTERACTIVE)
      const line = target && underlineFor(target)
      if (line) this.setLine(target, line)
      else this.setMode(target ? 'ring' : 'dot', target)
    },
    setLine(target, { left, top, width }) {
      // a new link: glide over to it. Same link (re-measured on scroll): stay glued to it.
      const snapping = !(this.mode === 'line' && this._target === target)
      clearTimeout(this._glideTimer)
      this.glide(snapping)
      this.setTarget(target)
      target.classList.add(UNDERLINED)
      this.mode = 'line'
      this.$refs.dot.style.width = `${width}px`
      this.place(left, top)
    },
    setMode(mode, target) {
      const wasLine = this.mode === 'line'
      this.setTarget(target)
      this.mode = mode
      if (!wasLine) return
      // let go of the link: shrink back and glide to the pointer, then follow it directly again
      this.glide(true)
      this.$refs.dot.style.width = ''
      if (this.x != null) this.place(this.x, this.y)
      clearTimeout(this._glideTimer)
      this._glideTimer = setTimeout(() => this.glide(false), GLIDE_MS)
    },
    setTarget(target) {
      if (this._target && this._target !== target) this._target.classList.remove(UNDERLINED)
      this._target = target
    },
    // the page moved under a still pointer: re-check what's beneath it and re-measure the link
    onScroll() {
      if (this.x == null || this._scrollFrame) return
      this._scrollFrame = requestAnimationFrame(() => {
        this._scrollFrame = null
        this.evaluate(document.elementFromPoint(this.x, this.y))
      })
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
    this.x = null
    this.y = null
    this._target = null
    document.documentElement.classList.add('has-cursor-dot')
    window.addEventListener('mousemove', this.onMove, { passive: true })
    document.addEventListener('mouseover', this.onOver, { passive: true })
    document.addEventListener('mouseout', this.onLeaveWindow, { passive: true })
    window.addEventListener('mousedown', this.onDown, { passive: true })
    window.addEventListener('mouseup', this.onUp, { passive: true })
    window.addEventListener('scroll', this.onScroll, { passive: true, capture: true })
    window.addEventListener('resize', this.onScroll, { passive: true })
  },
  beforeUnmount() {
    if (!this.enabled) return
    clearTimeout(this._glideTimer)
    cancelAnimationFrame(this._scrollFrame)
    this.setTarget(null)
    document.documentElement.classList.remove('has-cursor-dot')
    window.removeEventListener('mousemove', this.onMove)
    document.removeEventListener('mouseover', this.onOver)
    document.removeEventListener('mouseout', this.onLeaveWindow)
    window.removeEventListener('mousedown', this.onDown)
    window.removeEventListener('mouseup', this.onUp)
    window.removeEventListener('scroll', this.onScroll, { capture: true })
    window.removeEventListener('resize', this.onScroll)
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
/* the cursor draws this link's underline, so hide its own text underline */
html.has-cursor-dot .cursor-underlined { text-decoration-color: transparent !important; }

.cursor-dot {
  --ease: cubic-bezier(0.2, 0.7, 0.2, 1);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100000;
  box-sizing: border-box;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px; /* centre on the pointer */
  border: 1px solid transparent;
  border-radius: 999px;
  background-color: var(--c-accent);
  pointer-events: none;
  /* --glide is set from JS: eased while snapping onto / off a link, 0s (1:1 with the pointer) otherwise */
  transition: translate var(--glide, 0s) var(--ease),
              width 0.3s var(--ease), height 0.3s var(--ease), margin 0.3s var(--ease),
              background-color 0.25s ease, border-color 0.25s ease, opacity 0.25s ease, scale 0.25s ease;
}

/* text links: the dot becomes the link's underline (width and position are set from JS) */
.cursor-dot.is-line {
  height: 2px;
  margin: 0;
  border: 0;
}
.cursor-dot.is-line.is-down { height: 3px; }

/* cards, icons, filled buttons: the dot hollows out into a hairline ring */
.cursor-dot.is-ring {
  width: 36px;
  height: 36px;
  margin: -18px 0 0 -18px;
  background-color: transparent;
  border-color: var(--c-accent);
}
.cursor-dot.is-ring.is-down { scale: 0.85; }

.cursor-dot.is-dot.is-down { scale: 0.7; }
.cursor-dot.is-hidden { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  /* no gliding or morphing: each state simply appears in place */
  .cursor-dot { transition: opacity 0.2s ease; }
}
</style>
