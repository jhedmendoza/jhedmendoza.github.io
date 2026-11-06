<template>
  <canvas v-if="enabled" ref="canvas" class="cursor-ink" aria-hidden="true"></canvas>
</template>

<script>
// hold the left mouse button and drag to draw; each stroke fades away a moment after you let go
const HOLD_MS = 2000      // how long a finished stroke stays before fading
const FADE_MS = 450       // fade-out duration
const START_DISTANCE = 4  // px the mouse must move before a press becomes drawing (so clicks stay clicks)
const LINE_WIDTH = 3

// pressing on these starts their normal behaviour instead of drawing
const NO_DRAW = 'a, button, input, textarea, select, label, [role="button"], [role="tab"], [contenteditable="true"], iframe, .work-modal'

export default {
  name: 'CursorInk',
  data() {
    return { enabled: false }
  },
  methods: {
    resize() {
      const c = this.$refs.canvas
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      c.width = Math.round(window.innerWidth * dpr)
      c.height = Math.round(window.innerHeight * dpr)
      this.ctx = c.getContext('2d')
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      this.ctx.lineCap = 'round'
      this.ctx.lineJoin = 'round'
      this.render()
    },
    readColor() {
      this.color = getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim() || '#0563bb'
    },

    onDown(e) {
      if (e.button !== 0 || e.target.closest(NO_DRAW)) return
      this.readColor()
      this.pending = { x: e.clientX, y: e.clientY }
    },
    onMove(e) {
      if (this.pending) {
        // only start drawing once the mouse has actually moved (a plain click stays a click)
        if (Math.hypot(e.clientX - this.pending.x, e.clientY - this.pending.y) < START_DISTANCE) return
        this.current = { points: [this.pending], color: this.color, endedAt: null }
        this.strokes.push(this.current)
        this.pending = null
        document.documentElement.classList.add('is-inking')
        window.getSelection && window.getSelection().removeAllRanges()
      }
      if (!this.current) return
      this.current.points.push({ x: e.clientX, y: e.clientY })
      this.kick()
    },
    onUp() {
      this.pending = null
      if (!this.current) return
      this.current.endedAt = performance.now()
      this.current = null
      document.documentElement.classList.remove('is-inking')
      this.kick()
    },
    // stop the browser's image/link drag ghost while drawing
    onDragStart(e) {
      if (this.current || this.pending) e.preventDefault()
    },

    kick() {
      if (!this.frame) this.frame = requestAnimationFrame(this.tick)
    },
    tick() {
      this.frame = null
      const now = performance.now()
      // drop strokes that have fully faded
      this.strokes = this.strokes.filter(s => !s.endedAt || now - s.endedAt < HOLD_MS + FADE_MS)
      this.render(now)
      // keep animating while anything is still on screen
      if (this.strokes.length) this.kick()
    },
    render(now = performance.now()) {
      const { ctx } = this
      if (!ctx) return
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.lineWidth = LINE_WIDTH
      for (const s of this.strokes) {
        const pts = s.points
        if (pts.length < 2) continue
        let alpha = 1
        if (s.endedAt) {
          const fade = (now - s.endedAt - HOLD_MS) / FADE_MS
          alpha = this.reduced ? (fade > 0 ? 0 : 1) : Math.max(0, Math.min(1, 1 - fade))
        }
        if (alpha <= 0) continue
        ctx.globalAlpha = alpha
        ctx.strokeStyle = s.color
        // smooth line: curve through the midpoints between samples
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2
          const my = (pts[i].y + pts[i + 1].y) / 2
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
        }
        const last = pts[pts.length - 1]
        ctx.lineTo(last.x, last.y)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
  },
  mounted() {
    // mouse / trackpad only — on touch screens a drag should keep scrolling the page
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.strokes = []
    this.enabled = true
    this.$nextTick(() => {
      this.resize()
      window.addEventListener('resize', this.resize)
      window.addEventListener('mousedown', this.onDown)
      window.addEventListener('mousemove', this.onMove, { passive: true })
      window.addEventListener('mouseup', this.onUp)
      window.addEventListener('blur', this.onUp)
      document.addEventListener('dragstart', this.onDragStart)
    })
  },
  beforeUnmount() {
    if (!this.enabled) return
    cancelAnimationFrame(this.frame)
    document.documentElement.classList.remove('is-inking')
    window.removeEventListener('resize', this.resize)
    window.removeEventListener('mousedown', this.onDown)
    window.removeEventListener('mousemove', this.onMove)
    window.removeEventListener('mouseup', this.onUp)
    window.removeEventListener('blur', this.onUp)
    document.removeEventListener('dragstart', this.onDragStart)
  }
}
</script>

<style>
.cursor-ink {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99998; /* above the page, below the cursor dot */
  pointer-events: none;
}
/* no text highlighting while drawing */
html.is-inking,
html.is-inking * {
  -webkit-user-select: none !important;
  user-select: none !important;
}
</style>
