<template>
  <canvas ref="canvas" class="hero-code-field" aria-hidden="true"></canvas>
</template>

<script>
import { themeState } from '../../theme.js'

// what floats around the hero: a mix of syntax and short keywords from the stack
const TOKENS = [
  '{ }', '</>', '=>', '( )', '[ ]', ';', '&&', '||', '!==', '===', '++', '//', '/* */',
  '<?php', '?>', 'const', 'let', 'fn()', 'return', 'async', 'await', 'import', 'export',
  'if', 'else', 'null', 'true', '$var', '->', '::', '#', '0x1F', '<div>', '</div>', 'git push',
  'npm run', 'SELECT *', '@media', ':root', 'v-if', '{{ }}'
]
const FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace'
const ACCENT_SHARE = 0.18     // fraction of tokens drawn in the accent colour
const REPEL_RADIUS = 140      // px around the pointer that pushes tokens away
const MAX_TOKENS = 70

const rand = (min, max) => min + Math.random() * (max - min)
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export default {
  name: 'HeroCodeField',
  computed: {
    theme() { return themeState.theme }
  },
  watch: {
    theme() {
      this.readColors()
      if (this.reduced) this.draw()
    }
  },
  methods: {
    readColors() {
      const css = getComputedStyle(document.documentElement)
      this.colors = {
        muted: css.getPropertyValue('--c-muted').trim() || '#7b858f',
        accent: css.getPropertyValue('--c-accent').trim() || '#0563bb'
      }
    },
    makeToken(w, h, anywhere) {
      const depth = rand(0.35, 1) // nearer tokens are bigger, brighter and faster
      return {
        text: pick(TOKENS),
        x: rand(0, w),
        y: anywhere ? rand(0, h) : h + rand(10, 80),
        size: Math.round(11 + depth * 9),
        alpha: 0.12 + depth * 0.22,
        vy: -(0.12 + depth * 0.35),
        vx: rand(-0.08, 0.08),
        ox: 0, // offset from the pointer push, eases back to 0
        oy: 0,
        accent: Math.random() < ACCENT_SHARE
      }
    },
    resize() {
      const canvas = this.$refs.canvas
      if (!canvas) return
      const rect = canvas.parentElement.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      this.w = rect.width
      this.h = rect.height
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      this.ctx = canvas.getContext('2d')
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // density scales with area; fewer on small screens
      const target = Math.min(MAX_TOKENS, Math.round((this.w * this.h) / 22000))
      this.tokens = this.tokens || []
      while (this.tokens.length < target) this.tokens.push(this.makeToken(this.w, this.h, true))
      this.tokens.length = target
      if (this.reduced) this.draw()
    },
    step() {
      const { w, h, pointer } = this
      for (const t of this.tokens) {
        t.x += t.vx
        t.y += t.vy

        // pointer repel, eased so it feels soft
        if (pointer) {
          const dx = t.x + t.ox - pointer.x
          const dy = t.y + t.oy - pointer.y
          const dist = Math.hypot(dx, dy)
          if (dist < REPEL_RADIUS && dist > 0.01) {
            const force = (1 - dist / REPEL_RADIUS) * 2.2
            t.ox += (dx / dist) * force
            t.oy += (dy / dist) * force
          }
        }
        t.ox *= 0.94
        t.oy *= 0.94

        // recycle tokens that drift off the top or sides
        if (t.y < -30 || t.x < -80 || t.x > w + 80) Object.assign(t, this.makeToken(w, h, false))
      }
    },
    draw() {
      const { ctx, w, h } = this
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const t of this.tokens) {
        ctx.globalAlpha = t.alpha
        ctx.fillStyle = t.accent ? this.colors.accent : this.colors.muted
        ctx.font = `${t.size}px ${FONT}`
        ctx.fillText(t.text, t.x + t.ox, t.y + t.oy)
      }
      ctx.globalAlpha = 1
    },
    loop() {
      this.frame = requestAnimationFrame(this.loop)
      if (!this.visible) return
      this.step()
      this.draw()
    },
    onPointerMove(e) {
      const rect = this.$refs.canvas.getBoundingClientRect()
      this.pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    },
    onPointerLeave() { this.pointer = null }
  },
  mounted() {
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.visible = true
    this.readColors()
    this.resize()

    this._ro = new ResizeObserver(() => this.resize())
    this._ro.observe(this.$refs.canvas.parentElement)

    if (this.reduced) return // static field, no animation

    // pause while the hero is off-screen
    this._io = new IntersectionObserver(([entry]) => { this.visible = entry.isIntersecting })
    this._io.observe(this.$refs.canvas)

    const hero = this.$refs.canvas.closest('section') || window
    this._hero = hero
    hero.addEventListener('pointermove', this.onPointerMove, { passive: true })
    hero.addEventListener('pointerleave', this.onPointerLeave, { passive: true })
    this.loop()
  },
  beforeUnmount() {
    cancelAnimationFrame(this.frame)
    if (this._ro) this._ro.disconnect()
    if (this._io) this._io.disconnect()
    if (this._hero) {
      this._hero.removeEventListener('pointermove', this.onPointerMove)
      this._hero.removeEventListener('pointerleave', this.onPointerLeave)
    }
  }
}
</script>

<style>
.hero-code-field {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
}
</style>
