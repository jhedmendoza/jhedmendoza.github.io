<template>
  <section id="experience" ref="section" :class="['exp', { 'can-animate': canAnimate }]">
    <div class="container">
      <div class="section-title"><h2>Experience</h2><p>Where I've worked over the years</p></div>

      <!-- career at a glance: one segment per company stint, overlapping stints get their own lane -->
      <div ref="bar" :class="['exp-bar', { 'is-in': barIn }]" @mouseleave="barHover = null">
        <p class="exp-bar-caption">
          <template v-if="activeGroup">
            <strong>{{ activeGroup.company }}</strong>{{ ' ' }}<span>· {{ range(activeGroup) }} · {{ duration(activeGroup) }}</span>
          </template>
          <template v-else>{{ yearsLabel }}</template>
        </p>
        <div class="exp-bar-lanes" :style="{ '--lanes': laneCount }">
          <span class="exp-bar-track" aria-hidden="true"></span>
          <button v-for="g in groups" :key="g.first" type="button"
                  :class="['exp-bar-seg', { 'is-active': activeGroup === g, 'is-current': !g.end }]"
                  :style="{ left: g.left + '%', width: g.width + '%', '--lane': g.lane, transitionDelay: barIn && !barSettled ? g.left * 9 + 'ms' : '0ms' }"
                  :aria-label="`${g.company}, ${range(g)}. Show in timeline`"
                  @mouseenter="barHover = g" @focus="barHover = g" @blur="barHover = null"
                  @click="goTo(g)"></button>
        </div>
        <div class="exp-bar-axis" aria-hidden="true">
          <span v-for="t in ticks" :key="t.label" :style="{ left: t.left + '%' }">{{ t.label }}</span>
        </div>
      </div>

      <div ref="timeline" class="exp-timeline">
        <!-- the rail, and the blue line that fills down it as you scroll -->
        <div class="exp-rail" aria-hidden="true"><span class="exp-rail-fill" :style="{ transform: `scaleY(${progress})` }"></span></div>

        <article v-for="(job, i) in jobs" :key="job.company + job.start" ref="entries"
                 :class="['exp-entry', {
                   'is-current': !job.end, 'is-in': visible[i], 'same-company': job.continues,
                   'is-linked': activeGroup && groupOf[i] === activeGroup,
                   'is-dimmed': barHover && groupOf[i] !== barHover
                 }]"
                 @mouseenter="entryHover = groupOf[i]" @mouseleave="entryHover = null">
          <div class="exp-when">
            <p class="exp-dates">
              <time :datetime="job.start">{{ formatDate(job.start) }}</time> –
              <time v-if="job.end" :datetime="job.end">{{ formatDate(job.end) }}</time>
              <span v-else>Present</span>
            </p>
            <p class="exp-duration">{{ duration(job) }}</p>
          </div>

          <span class="exp-dot" aria-hidden="true"></span>

          <div class="exp-body">
            <h3 class="exp-role">{{ job.role }}</h3>
            <!-- Company · Location · Hybrid/Remote/On-site · Full-/Part-time (a continuing role skips the company and location) -->
            <p v-if="!job.continues" class="exp-company">{{ job.company }} <span>· {{ [job.location, job.mode, job.type].filter(Boolean).join(' · ') }}</span></p>
            <p v-else-if="job.mode || job.type" class="exp-company"><span>{{ [job.mode, job.type].filter(Boolean).join(' · ') }}</span></p>
            <p v-if="job.summary" class="exp-summary">{{ job.summary }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script>
// newest first, grouped by company; `continues` = same company as the entry above (no repeated company line);
// `monthOnly` = dates only known to the month, counted inclusively like LinkedIn (Aug–Dec = 5 mos)
// (Hybrid Anchor ran alongside Naxos in 2022, so it follows the Naxos group)
const JOBS = [
  {
    role: 'Software Engineer',
    company: 'Naxos Global Distribution Ltd. Inc (ROHQ)',
    location: 'Makati City',
    mode: 'Hybrid',
    type: 'Full-time',
    start: '2023-04-25',
    end: null,
    summary: 'I maintain legacy sites built on Laravel and Microsoft SQL Server, and build backend features and new API endpoints in ASP.NET MVC 4.0 (C#). I also create custom reports, optimise SQL stored procedures for accuracy and speed, keep the web documentation current, and support the customer service team.'
  },
  {
    role: 'Senior WordPress Developer',
    company: 'Naxos Global Distribution Ltd. Inc (ROHQ)',
    location: 'Makati City',
    mode: 'Hybrid',
    type: 'Full-time',
    start: '2020-10-05',
    end: '2023-04-25',
    continues: true,
    summary: 'Built custom WordPress plugins and themes from scratch, including integrating the WorldPay and PayPal payment gateways into bespoke plugins.'
  },
  {
    role: 'Senior Back End Developer',
    company: 'Hybrid Anchor',
    location: 'United Kingdom',
    mode: 'Remote',
    type: 'Full-time',
    start: '2022-08-01',
    end: '2022-12-01',
    monthOnly: true,
    summary: 'Built and maintained WooCommerce-powered e-commerce sites with a focus on user experience, functionality and performance, and created custom WordPress plugins from scratch to meet business requirements. I worked closely with front-end developers and the wider team on new features, integrated third-party APIs, and supported clients directly.'
  },
  {
    role: 'PHP Developer',
    company: 'Hybrid Anchor',
    location: 'United Kingdom',
    mode: 'Remote',
    type: 'Part-time',
    start: '2022-04-01',
    end: '2022-08-01',
    monthOnly: true,
    continues: true
  },
  {
    role: 'Senior Web Developer',
    company: 'Gameloft Philippines, Inc.',
    location: 'Makati City',
    mode: 'On-site',
    type: 'Full-time',
    start: '2018-07-02',
    end: '2019-12-13',
    summary: 'Turned business requirements into new websites and web apps, worked on CMS backends powered by Zend Framework 2, and built and maintained features for Gameloft Customer Care across both the in-game app and the website. Along the way I kept documentation up to date, coached junior developers, and fixed critical bugs in the phpBB-based Gameloft Forums.'
  },
  {
    role: 'Software Engineer',
    company: 'Shipadmin Philippines, Inc.',
    location: 'Makati City',
    mode: 'On-site',
    type: 'Full-time',
    start: '2017-09-27',
    end: '2018-06-30',
    summary: 'Developed websites with CodeIgniter and Bootstrap, built custom WordPress themes from scratch, and provided day-to-day support while working closely with teammates and stakeholders.'
  },
  {
    role: 'Web Developer',
    company: 'Gameloft Philippines, Inc.',
    location: 'Makati City',
    mode: 'On-site',
    type: 'Full-time',
    start: '2014-09-22',
    end: '2017-09-22',
    summary: 'Built new features and maintained and refactored PHP and MySQL websites, developed pre-registration minisites and CMSs for upcoming game launches, and created custom WordPress themes and plugins. I worked daily with front-end developers, QA testers and project managers to ship features every sprint, and coordinated with Global Network Services on server and access issues.'
  },
  {
    role: 'Junior Web Developer',
    company: 'Vibal Group of Companies',
    location: 'Quezon City',
    mode: 'On-site',
    type: 'Full-time',
    start: '2011-09-12',
    end: '2014-06-27',
    summary: 'Turned PSD designs into clean HTML and CSS layouts, developed and maintained in-house sites such as vibalpublishing.com, thepoc.net and sdmags.net on Joomla and WordPress, and built interactive e-textbooks with HTML, CSS and JavaScript, working closely with designers and project managers.'
  }
]

const toDate = (iso) => new Date(iso + 'T00:00:00')
// where a role ends on the bar: month-only dates run to the end of that month; current roles run to today
const endOf = ({ end, monthOnly }) => {
  if (!end) return new Date()
  const d = toDate(end)
  return monthOnly ? new Date(d.getFullYear(), d.getMonth() + 1, 1) : d
}

// one group per company stint: a role plus the `continues` roles that follow it
function buildCareer(jobs) {
  const groups = []
  const groupOf = jobs.map((job, i) => {
    const prev = groups[groups.length - 1]
    if (job.continues && prev) {
      if (job.start < prev.start) prev.start = job.start
      if (!job.end || !prev.end) prev.end = null
      else if (job.end > prev.end) prev.end = job.end
      return prev
    }
    const g = { first: i, company: job.company, start: job.start, end: job.end, monthOnly: job.monthOnly }
    groups.push(g)
    return g
  })

  const from = Math.min(...groups.map(g => toDate(g.start)))
  const span = Date.now() - from
  const pct = (d) => ((d - from) / span) * 100

  // oldest first; a stint that overlaps an earlier one drops to the next free lane
  const laneEnds = []
  ;[...groups].sort((a, b) => (a.start < b.start ? -1 : 1)).forEach((g) => {
    const s = toDate(g.start), e = endOf(g)
    let lane = laneEnds.findIndex(end => end <= s)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = e
    g.lane = lane
    g.left = pct(s)
    g.width = Math.max(0.6, pct(e) - g.left)
  })

  // year labels every 3 years from the first one, then "Now" (skipping a year that would crowd it)
  const firstYear = new Date(from).getFullYear()
  const ticks = []
  for (let y = firstYear; y <= new Date().getFullYear(); y += 3) {
    const left = Math.max(0, pct(new Date(y, 0, 1)))
    if (100 - left > 9) ticks.push({ label: String(y), left })
  }
  ticks.push({ label: 'Now', left: 100 })

  return { groups, groupOf, ticks, laneCount: laneEnds.length, from }
}

const CAREER = buildCareer(JOBS)

export default {
  name: 'ExperienceSection',
  data() {
    return {
      jobs: JOBS,
      visible: JOBS.map(() => false),
      progress: 0,
      canAnimate: false,
      groups: CAREER.groups,
      groupOf: CAREER.groupOf,
      ticks: CAREER.ticks,
      laneCount: CAREER.laneCount,
      barIn: false,
      barSettled: false,
      barHover: null,   // stint hovered/focused on the bar: dims the other roles
      entryHover: null  // role hovered in the timeline: lights up its stint on the bar
    }
  },
  computed: {
    activeGroup() {
      return this.barHover || this.entryHover
    },
    // whole years since the first role started, e.g. "15 years of experience"
    yearsLabel() {
      const from = new Date(CAREER.from), now = new Date()
      let years = now.getFullYear() - from.getFullYear()
      if (now.getMonth() < from.getMonth() || (now.getMonth() === from.getMonth() && now.getDate() < from.getDate())) years--
      return `${years} year${years === 1 ? '' : 's'} of experience`
    }
  },
  methods: {
    range(g) {
      return `${this.formatDate(g.start)} – ${g.end ? this.formatDate(g.end) : 'Present'}`
    },
    goTo(g) {
      const el = this.$refs.entries[g.first]
      if (!el) return
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' })
      // keep the highlight long enough to land on it (touch has no hover to clear it)
      this.barHover = g
      clearTimeout(this._clearHover)
      this._clearHover = setTimeout(() => { if (this.barHover === g) this.barHover = null }, 1600)
    },
    formatDate(iso) {
      return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    },
    // e.g. "2 yrs 7 mos"; current role counts up to today
    duration({ start, end, monthOnly }) {
      const a = new Date(start + 'T00:00:00')
      const b = end ? new Date(end + 'T00:00:00') : new Date()
      let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
      if (monthOnly) months++ // both the start and end months count
      else if (b.getDate() < a.getDate()) months--
      months = Math.max(1, months)
      const y = Math.floor(months / 12)
      const m = months % 12
      const parts = []
      if (y) parts.push(`${y} yr${y > 1 ? 's' : ''}`)
      if (m) parts.push(`${m} mo${m > 1 ? 's' : ''}`)
      return parts.join(' ')
    },
    // the rail fills as the middle of the screen travels down the timeline
    requestProgress() {
      if (this._frame) return
      this._frame = requestAnimationFrame(() => {
        this._frame = null
        const r = this.$refs.timeline.getBoundingClientRect()
        const mid = window.innerHeight * 0.6
        this.progress = Math.min(1, Math.max(0, (mid - r.top) / r.height))
      })
    }
  },
  mounted() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      this.visible = this.jobs.map(() => true)
      this.progress = 1
      this.barIn = this.barSettled = true
      return
    }
    this.canAnimate = true

    // each role animates in when it scrolls into view, and resets when it leaves;
    // the career bar draws in once, the first time it's seen
    this._observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === this.$refs.bar) {
          if (entry.isIntersecting && !this.barIn) {
            this.barIn = true
            this._settle = setTimeout(() => { this.barSettled = true }, 1600)
          }
          return
        }
        const i = this.$refs.entries.indexOf(entry.target)
        if (i > -1) this.visible[i] = entry.isIntersecting
      })
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.2 })
    this.$refs.entries.forEach(el => this._observer.observe(el))
    this._observer.observe(this.$refs.bar)

    window.addEventListener('scroll', this.requestProgress, { passive: true })
    window.addEventListener('resize', this.requestProgress)
    this.requestProgress()
  },
  beforeUnmount() {
    if (this._observer) this._observer.disconnect()
    window.removeEventListener('scroll', this.requestProgress)
    window.removeEventListener('resize', this.requestProgress)
    cancelAnimationFrame(this._frame)
    clearTimeout(this._settle)
    clearTimeout(this._clearHover)
  }
}
</script>

<style>
.exp {
  --exp-when: 170px;  /* date column */
  --exp-rail: 40px;   /* rail column */
  padding: 60px 0;
}

/* ---- career bar ---- */
.exp-bar {
  --seg-h: 6px;
  --seg-gap: 5px;
  max-width: 920px;
  margin: 0 auto 64px;
}
.exp-bar-caption {
  font-size: 14px;
  color: var(--c-muted);
  margin: 0 0 14px;
  min-height: 1.6em;
  line-height: 1.6;
}
.exp-bar-caption strong { font-weight: 600; color: var(--c-accent); }
.exp-bar-lanes {
  position: relative;
  height: calc(var(--lanes) * var(--seg-h) + (var(--lanes) - 1) * var(--seg-gap));
}
.exp-bar-track {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(var(--seg-h) / 2);
  height: 1px;
  background: var(--c-rule);
}
.exp-bar-seg {
  position: absolute;
  top: calc(var(--lane) * (var(--seg-h) + var(--seg-gap)));
  height: var(--seg-h);
  padding: 0;
  border: 0;
  border-radius: 3px;
  background: var(--c-accent);
  opacity: 0.35;
  cursor: pointer;
  transform-origin: left;
  transition: opacity 0.25s ease, transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
}
/* a taller, invisible hit area so the thin bar is easy to point at */
.exp-bar-seg::before {
  content: '';
  position: absolute;
  inset: -9px 0;
}
.exp-bar-seg.is-current { opacity: 0.6; }
.exp-bar-seg.is-active { opacity: 1; }
.exp-bar-seg:focus-visible { outline: 2px solid var(--c-accent); outline-offset: 3px; }
.exp.can-animate .exp-bar-seg { transform: scaleX(0); }
.exp.can-animate .exp-bar.is-in .exp-bar-seg { transform: scaleX(1); }

.exp-bar-axis {
  position: relative;
  height: 18px;
  margin-top: 10px;
}
.exp-bar-axis span {
  position: absolute;
  top: 0;
  translate: -50% 0;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--c-muted);
  white-space: nowrap;
}
.exp-bar-axis span:first-child { translate: 0 0; }
.exp-bar-axis span:last-child { translate: -100% 0; }

.exp-timeline {
  position: relative;
  max-width: 920px;
  margin: 0 auto;
}

/* linking the bar and the timeline */
.exp-entry { transition: opacity 0.3s ease; }
.exp-entry.is-dimmed { opacity: 0.3; }
.exp-entry.is-linked .exp-dot { background: var(--c-accent); }

/* vertical rail sits in the middle of the rail column */
.exp-rail {
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: calc(var(--exp-when) + var(--exp-rail) / 2);
  width: 1px;
  background: var(--c-rule);
  translate: -0.5px 0;
}
.exp-rail-fill {
  position: absolute;
  inset: 0;
  background: var(--c-accent);
  transform-origin: top;
  transform: scaleY(1);
}

.exp-entry {
  position: relative;
  display: grid;
  grid-template-columns: var(--exp-when) var(--exp-rail) minmax(0, 1fr);
  padding-bottom: 44px;
}
.exp-entry:last-child { padding-bottom: 0; }
/* a promotion at the same company sits a little closer to the role above */
.exp-entry.same-company { margin-top: -16px; }

.exp-when { text-align: right; padding-top: 2px; }
.exp-dates {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-ink);
  margin: 0 0 2px;
  white-space: nowrap;
}
.exp-duration {
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--c-muted);
  margin: 0;
}

.exp-dot {
  position: relative;
  justify-self: center;
  width: 11px;
  height: 11px;
  margin-top: 5px;
  border-radius: 50%;
  background: var(--c-bg);
  border: 2px solid var(--c-accent);
  z-index: 1;
}
.exp-entry.same-company .exp-dot { width: 9px; height: 9px; margin-top: 6px; }
.exp-entry.is-current .exp-dot { background: var(--c-accent); }
/* current role: soft pulse */
.exp-entry.is-current .exp-dot::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 2px solid var(--c-accent);
  animation: expPulse 2.2s ease-out infinite;
}
@keyframes expPulse {
  0%   { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.6); opacity: 0; }
}

.exp-body { text-align: left; }
.exp-role {
  font-family: Poppins, sans-serif;
  font-size: 19px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--c-ink);
  margin: 0 0 4px;
}
.exp-company {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-accent);
  margin: 0 0 12px;
}
.exp-company span { font-weight: 400; color: var(--c-muted); }
.exp-entry.same-company .exp-role { margin-bottom: 10px; }
.exp-summary {
  font-size: 15px;
  line-height: 1.75;
  color: var(--c-muted);
  margin: 0;
  max-width: 620px;
}

/* ---- animation (only once JS has added .can-animate) ---- */
.exp.can-animate .exp-rail-fill { transition: transform 0.15s linear; }
.exp.can-animate .exp-dot {
  scale: 0;
  transition: scale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.exp.can-animate .exp-when,
.exp.can-animate .exp-body {
  opacity: 0;
  transition: opacity 0.6s ease, translate 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.exp.can-animate .exp-when { translate: -24px 0; transition-delay: 0.1s; }
.exp.can-animate .exp-body { translate: 24px 0; transition-delay: 0.18s; }
.exp-entry.is-in .exp-dot { scale: 1; }
.exp-entry.is-in .exp-when,
.exp-entry.is-in .exp-body { opacity: 1; translate: 0 0; }

/* phones: rail on the left, dates above each role */
@media (max-width: 767px) {
  .exp { --exp-rail: 28px; }
  .exp-rail { left: calc(var(--exp-rail) / 2); }
  .exp-entry {
    grid-template-columns: var(--exp-rail) minmax(0, 1fr);
    grid-template-areas: 'dot when' '. body';
    padding-bottom: 36px;
  }
  .exp-entry.same-company { margin-top: -8px; }
  .exp-dot { grid-area: dot; }
  .exp-when { grid-area: when; text-align: left; display: flex; gap: 10px; align-items: baseline; margin-bottom: 6px; }
  .exp-body { grid-area: body; }
  .exp-role { font-size: 17px; }
  .exp-summary { font-size: 14px; }
  .exp-bar { margin-bottom: 48px; }
  .exp-bar-caption { min-height: 3.2em; } /* long company names wrap to two lines */
  .exp.can-animate .exp-when { translate: 24px 0; }
}

@media (prefers-reduced-motion: reduce) {
  .exp-entry.is-current .exp-dot::after { animation: none; }
  .exp-bar-seg, .exp-entry { transition: none; }
}
</style>
