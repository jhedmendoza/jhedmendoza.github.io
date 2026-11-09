<template>
  <section :class="['nf', { 'is-tracking': tracking }]" :style="{ '--lx': look.x + 'px', '--ly': look.y + 'px' }" aria-labelledby="nf-title">
    <!-- a little line-drawn drone, hovering with a swinging "404" sign -->
    <svg class="nf-robot" viewBox="0 0 260 220" role="img" aria-label="A small drone carrying a sign that says 404 not found">
      <line class="nf-floor" x1="50" y1="204" x2="210" y2="204"/>

      <g class="nf-bob">
        <g class="nf-tilt">
          <!-- arms, rotor masts and spinning propellers -->
          <line x1="104" y1="62" x2="80" y2="52"/>
          <line x1="156" y1="62" x2="180" y2="52"/>
          <line x1="80" y1="52" x2="80" y2="45"/>
          <line x1="180" y1="52" x2="180" y2="45"/>
          <line class="nf-prop" x1="64" y1="44" x2="96" y2="44"/>
          <line class="nf-prop" x1="164" y1="44" x2="196" y2="44"/>

          <!-- the sign, hanging on two strings and swinging a beat behind the drone -->
          <g class="nf-sign">
            <line x1="114" y1="76" x2="104" y2="120"/>
            <line x1="146" y1="76" x2="156" y2="120"/>
            <rect class="nf-solid" x="90" y="120" width="80" height="44" rx="4"/>
            <text class="nf-404" x="130" y="146" text-anchor="middle">404</text>
            <text class="nf-sub" x="130" y="157" text-anchor="middle">NOT FOUND</text>
          </g>

          <!-- body + eyes -->
          <rect ref="head" class="nf-solid" x="104" y="56" width="52" height="22" rx="11"/>
          <g class="nf-look">
            <g class="nf-eyes">
              <circle class="nf-eye" cx="122" cy="67" r="2.8"/>
              <circle class="nf-eye" cx="138" cy="67" r="2.8"/>
            </g>
          </g>
        </g>
      </g>
    </svg>

    <div class="nf-text">
      <h1 id="nf-title" class="nf-title">{{ copy.title }}</h1>
      <p class="nf-lead">{{ copy.lead }}</p>
      <div class="nf-links">
        <router-link v-for="l in copy.links" :key="l.to" :to="l.to" class="nf-link">{{ l.label }}</router-link>
      </div>
    </div>
  </section>
</template>

<script>
const COPY = {
  page: {
    title: 'This page wandered off.',
    lead: "My drone searched everywhere, but there's nothing here. The link may be broken, or the page may have moved.",
    links: [{ to: '/', label: 'Back to home' }, { to: '/posts', label: 'Read the blog' }]
  },
  post: {
    title: "This post doesn't exist.",
    lead: "My drone searched the whole blog and came back empty-handed. It may have been renamed or removed.",
    links: [{ to: '/posts', label: 'Browse all posts' }, { to: '/', label: 'Back to home' }]
  }
}
// how far the eyes can move inside the drone's body
const LOOK_X = 4
const LOOK_Y = 2

export default {
  name: 'NotFoundContent',
  props: {
    // 'page' (unknown address) or 'post' (unknown blog post)
    kind: { type: String, default: 'page' }
  },
  data() {
    return { look: { x: 0, y: 0 }, tracking: false }
  },
  computed: {
    copy() { return COPY[this.kind] || COPY.page }
  },
  methods: {
    // the drone's eyes follow the pointer; after a pause it goes back to looking around
    onMove(e) {
      this._pointer = { x: e.clientX, y: e.clientY }
      if (this._frame) return
      this._frame = requestAnimationFrame(() => {
        this._frame = null
        const head = this.$refs.head
        if (!head) return
        const r = head.getBoundingClientRect()
        const dx = this._pointer.x - (r.left + r.width / 2)
        const dy = this._pointer.y - (r.top + r.height / 2)
        const dist = Math.hypot(dx, dy) || 1
        const pull = Math.min(1, dist / 200) // closer to the head = smaller movement
        this.look = { x: (dx / dist) * LOOK_X * pull, y: (dy / dist) * LOOK_Y * pull }
        this.tracking = true
        clearTimeout(this._idle)
        this._idle = setTimeout(() => { this.tracking = false; this.look = { x: 0, y: 0 } }, 2500)
      })
    }
  },
  mounted() {
    this._title = document.title
    document.title = 'Not found | Jhed Mendoza'
    // keep search engines from indexing the 404 page
    this._robots = document.createElement('meta')
    this._robots.name = 'robots'
    this._robots.content = 'noindex'
    document.head.appendChild(this._robots)

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (fine && !calm) window.addEventListener('mousemove', this.onMove, { passive: true })
  },
  beforeUnmount() {
    if (this._title) document.title = this._title
    if (this._robots) this._robots.remove()
    window.removeEventListener('mousemove', this.onMove)
    cancelAnimationFrame(this._frame)
    clearTimeout(this._idle)
  }
}
</script>

<style>
.nf {
  max-width: 560px;
  margin: 0 auto;
  padding: 72px 24px 96px;
  text-align: center;
}

/* ---- drone ---- */
.nf-robot {
  display: block;
  width: 100%;
  max-width: 280px;
  margin: 0 auto 28px;
  overflow: visible;
  fill: none;
  stroke: var(--c-ink);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.nf-robot .nf-solid { fill: var(--c-bg); }
.nf-robot .nf-floor { stroke: var(--c-rule-strong); stroke-width: 1; }
.nf-robot .nf-eye { fill: var(--c-accent); stroke: none; }
.nf-robot .nf-prop { stroke: var(--c-accent); }
.nf-robot text { stroke: none; }
.nf-robot .nf-404 { fill: var(--c-ink); font: 600 19px Poppins, sans-serif; letter-spacing: 0.06em; }
.nf-robot .nf-sub { fill: var(--c-muted); font: 600 7.5px 'Open Sans', sans-serif; letter-spacing: 0.16em; }

/* everything that moves transforms around its own box unless told otherwise */
.nf-robot g,
.nf-robot circle,
.nf-robot line { transform-box: fill-box; transform-origin: center; }

/* hover up and down */
.nf-bob { animation: nf-bob 3s ease-in-out infinite; }
@keyframes nf-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}

/* the whole drone rocks gently around its body */
.nf-robot .nf-tilt {
  transform-box: view-box;
  transform-origin: 130px 67px;
  animation: nf-tilt 4s ease-in-out infinite;
}
@keyframes nf-tilt {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

/* the sign swings from its strings, a beat behind the drone */
.nf-robot .nf-sign {
  transform-box: view-box;
  transform-origin: 130px 78px;
  animation: nf-swing 4s ease-in-out infinite;
  animation-delay: -0.6s;
}
@keyframes nf-swing {
  0%, 100% { transform: rotate(4deg); }
  50% { transform: rotate(-4deg); }
}

/* propellers whirr: squash them flat and back, fast */
.nf-prop { animation: nf-spin 0.14s linear infinite alternate; }
@keyframes nf-spin {
  from { transform: scaleX(1); }
  to { transform: scaleX(0.15); }
}

/* eyes: follow the pointer when there is one, otherwise glance around */
.nf-look {
  transform: translate(var(--lx, 0px), var(--ly, 0px));
  transition: transform 0.25s ease-out;
}
.nf-eyes { animation: nf-glance 6s ease-in-out infinite; }
.nf.is-tracking .nf-eyes { animation: none; }
@keyframes nf-glance {
  0%, 12%, 100% { transform: translateX(0); }
  20%, 38% { transform: translateX(-4px); }
  48%, 66% { transform: translateX(4px); }
  76% { transform: translateX(0); }
}
/* blink: scale each eye flat for a moment */
.nf-eye { animation: nf-blink 4.2s ease-in-out infinite; }
@keyframes nf-blink {
  0%, 92%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

/* ---- text ---- */
.nf-title {
  font-family: Poppins, sans-serif;
  font-size: 36px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--c-ink);
  margin: 0 0 14px;
}
.nf-lead {
  font-size: 16px;
  line-height: 1.7;
  color: var(--c-muted);
  margin: 0 auto 32px;
  max-width: 440px;
}
.nf-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px 28px;
}
.nf-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-ink);
  border-bottom: 1px solid var(--c-rule-strong);
  padding-bottom: 2px;
  transition: color 0.25s ease, border-color 0.25s ease;
}
.nf-link:hover { color: var(--c-accent); border-color: var(--c-accent); text-decoration: none; }
.nf-link:focus-visible { outline: 2px solid var(--c-accent); outline-offset: 4px; }

/* entrance: the robot drops in, then the text rises */
.nf-robot { animation: nf-drop 0.9s cubic-bezier(0.34, 1.4, 0.64, 1) both; }
.nf-text > * { animation: nf-rise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
.nf-text > :nth-child(1) { animation-delay: 0.25s; }
.nf-text > :nth-child(2) { animation-delay: 0.33s; }
.nf-text > :nth-child(3) { animation-delay: 0.41s; }
@keyframes nf-drop {
  from { opacity: 0; transform: translateY(-28px); }
  to { opacity: 1; transform: none; }
}
@keyframes nf-rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 575px) {
  .nf { padding-top: 48px; }
  .nf-title { font-size: 28px; }
  .nf-robot { max-width: 220px; }
}

@media (prefers-reduced-motion: reduce) {
  .nf-robot *,
  .nf-robot,
  .nf-text > * { animation: none !important; }
}
</style>
