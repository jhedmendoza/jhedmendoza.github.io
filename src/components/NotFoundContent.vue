<template>
  <section :class="['nf', { 'is-tracking': tracking }]" :style="{ '--lx': look.x + 'px', '--ly': look.y + 'px' }" aria-labelledby="nf-title">
    <!-- a little line-drawn robot, hovering and searching with a magnifying glass -->
    <svg class="nf-robot" viewBox="0 0 260 220" role="img" aria-label="A small robot searching with a magnifying glass">
      <line class="nf-floor" x1="50" y1="204" x2="210" y2="204"/>

      <g class="nf-bob">
        <!-- antenna -->
        <line x1="130" y1="40" x2="130" y2="24"/>
        <circle class="nf-bulb" cx="130" cy="19" r="4.5"/>

        <!-- head + visor -->
        <rect ref="head" x="94" y="40" width="72" height="50" rx="14"/>
        <rect class="nf-visor" x="105" y="52" width="50" height="25" rx="12.5"/>
        <g class="nf-look">
          <g class="nf-eyes">
            <circle class="nf-eye" cx="121" cy="64.5" r="3.6"/>
            <circle class="nf-eye" cx="139" cy="64.5" r="3.6"/>
          </g>
        </g>

        <!-- neck + body -->
        <line x1="130" y1="90" x2="130" y2="98"/>
        <rect x="100" y="98" width="60" height="54" rx="12"/>
        <line class="nf-faint" x1="114" y1="134" x2="146" y2="134"/>
        <line class="nf-faint" x1="114" y1="141" x2="136" y2="141"/>
        <circle class="nf-core" cx="130" cy="117" r="5"/>

        <!-- left arm, resting -->
        <path d="M100 110 q-18 6 -17 30"/>
        <circle cx="83" cy="143" r="3"/>

        <!-- right arm with the magnifying glass, sweeping back and forth -->
        <g class="nf-arm">
          <path d="M160 110 q20 -2 25 -22"/>
          <line x1="186" y1="86" x2="193" y2="75"/>
          <circle class="nf-lens" cx="201" cy="62" r="13"/>
          <path class="nf-faint" d="M194 57 a8 8 0 0 1 7 -5"/>
        </g>

        <!-- hover jets -->
        <g class="nf-jets">
          <line x1="120" y1="160" x2="120" y2="170"/>
          <line x1="130" y1="160" x2="130" y2="176"/>
          <line x1="140" y1="160" x2="140" y2="170"/>
        </g>
      </g>

      <!-- question marks drifting up from the lens -->
      <text class="nf-q nf-q1" x="214" y="44">?</text>
      <text class="nf-q nf-q2" x="226" y="58">?</text>
    </svg>

    <div class="nf-text">
      <p class="nf-eyebrow">Error 404</p>
      <h1 id="nf-title" class="nf-title">{{ copy.title }}</h1>
      <p class="nf-lead">{{ copy.lead }}</p>
      <p class="nf-path"><code>{{ path }}</code></p>
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
    lead: "My robot searched everywhere, but there's nothing here. The link may be broken, or the page may have moved.",
    links: [{ to: '/', label: 'Back to home' }, { to: '/posts', label: 'Read the blog' }]
  },
  post: {
    title: "This post doesn't exist.",
    lead: "My robot searched the whole blog and came back empty-handed. It may have been renamed or removed.",
    links: [{ to: '/posts', label: 'Browse all posts' }, { to: '/', label: 'Back to home' }]
  }
}
// how far the eyes can move inside the visor
const LOOK_X = 5
const LOOK_Y = 3

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
    copy() { return COPY[this.kind] || COPY.page },
    path() { return this.$route ? this.$route.fullPath : window.location.pathname }
  },
  methods: {
    // the robot's eyes follow the pointer; after a pause it goes back to looking around
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

/* ---- robot ---- */
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
.nf-robot .nf-faint { stroke: var(--c-muted); stroke-width: 1.2; }
.nf-robot .nf-floor { stroke: var(--c-rule-strong); stroke-width: 1; }
.nf-robot .nf-visor { stroke: var(--c-muted); }
.nf-robot .nf-eye,
.nf-robot .nf-bulb,
.nf-robot .nf-core { fill: var(--c-accent); stroke: none; }
.nf-robot .nf-lens { stroke: var(--c-accent); }
.nf-robot .nf-jets line { stroke: var(--c-accent); stroke-width: 1.2; stroke-dasharray: 2 3; }
.nf-robot .nf-q {
  fill: var(--c-accent);
  stroke: none;
  font: 600 15px Poppins, sans-serif;
}

/* everything that moves transforms around its own box unless told otherwise */
.nf-robot g,
.nf-robot circle,
.nf-robot text { transform-box: fill-box; transform-origin: center; }

/* hover up and down */
.nf-bob { animation: nf-bob 3.2s ease-in-out infinite; }
@keyframes nf-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}

/* antenna light: two quick blinks, then a pause */
.nf-bulb { animation: nf-bulb 2.6s ease-in-out infinite; }
@keyframes nf-bulb {
  0%, 30%, 100% { opacity: 1; }
  10%, 20% { opacity: 0.2; }
}

/* chest core breathes */
.nf-core { animation: nf-core 2.4s ease-in-out infinite; }
@keyframes nf-core {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.7); opacity: 0.55; }
}

/* the magnifying-glass arm sweeps from the shoulder */
.nf-robot .nf-arm {
  transform-box: view-box;
  transform-origin: 160px 110px;
  animation: nf-sweep 3.6s ease-in-out infinite;
}
@keyframes nf-sweep {
  0%, 100% { transform: rotate(-7deg); }
  50% { transform: rotate(9deg); }
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
  20%, 38% { transform: translateX(-5px); }
  48%, 66% { transform: translateX(5px); }
  76% { transform: translateX(0); }
}
/* blink: scale each eye flat for a moment */
.nf-eye { animation: nf-blink 4.2s ease-in-out infinite; }
@keyframes nf-blink {
  0%, 92%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

/* jets flicker */
.nf-robot .nf-jets { transform-origin: top; animation: nf-jets 0.5s ease-in-out infinite alternate; }
@keyframes nf-jets {
  from { transform: scaleY(1); opacity: 1; }
  to { transform: scaleY(0.6); opacity: 0.5; }
}

/* question marks float up and fade, one after the other */
.nf-q { opacity: 0; animation: nf-q 3.6s ease-out infinite; }
.nf-q2 { animation-delay: 1.8s; }
@keyframes nf-q {
  0% { opacity: 0; transform: translateY(6px) scale(0.6); }
  20% { opacity: 1; transform: translateY(0) scale(1); }
  70% { opacity: 0; transform: translateY(-14px) scale(1); }
  100% { opacity: 0; }
}

/* ---- text ---- */
.nf-eyebrow {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-accent);
  margin: 0 0 12px;
}
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
  margin: 0 auto 18px;
  max-width: 440px;
}
.nf-path { margin: 0 0 32px; }
.nf-path code {
  display: inline-block;
  max-width: 100%;
  overflow-wrap: anywhere;
  font-size: 13px;
  color: var(--c-muted);
  background: none;
  padding: 0 0 2px;
  border-bottom: 1px dashed var(--c-rule-strong);
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
.nf-text > :nth-child(4) { animation-delay: 0.49s; }
.nf-text > :nth-child(5) { animation-delay: 0.57s; }
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
  .nf-q { opacity: 0; }
}
</style>
