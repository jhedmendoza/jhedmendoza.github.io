<template>
  <section id="stack" class="stack">
    <div class="container">
      <div class="section-title"><h2>Tech Stack</h2><p>Languages, frameworks and tools I work with</p></div>
    </div>

    <!-- infinite marquee: each row holds its logos twice and slides by exactly one set, so the loop is seamless -->
    <div ref="rows" class="stack-rows">
      <div v-for="(row, r) in rows" :key="r" :class="['stack-marquee', { reverse: r % 2 === 1 }]"
           :style="{ '--duration': row.length * 3.2 + 's' }">
        <div class="stack-track">
          <ul v-for="copy in 2" :key="copy" class="stack-set" :aria-hidden="copy === 2 ? 'true' : null">
            <li v-for="item in row" :key="item.name" class="stack-item" :title="item.name">
              <!-- logos only; the name is the tooltip and the alt text -->
              <img v-if="item.logo" :src="'/assets/img/stack/' + item.logo + '.svg'" :alt="copy === 1 ? item.name : ''"
                   width="60" height="60" :class="['stack-logo', { 'invert-dark': item.invertDark }]" loading="lazy"/>
              <template v-else>
                <i :class="['bx', item.icon, 'stack-icon']" aria-hidden="true"></i>
                <span v-if="copy === 1" class="sr-only">{{ item.name }}</span>
              </template>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
// logo = file in public/assets/img/stack (Devicon); icon = boxicons glyph for things without an official logo
const STACK = [
  // languages + back-end
  { name: 'PHP', logo: 'php' },
  { name: 'JavaScript', logo: 'javascript' },
  { name: 'HTML', logo: 'html5' },
  { name: 'CSS', logo: 'css3' },
  { name: 'SQL', icon: 'bx-data' },
  { name: 'Laravel', logo: 'laravel' },
  { name: 'CodeIgniter', logo: 'codeigniter' },
  { name: 'Zend', logo: 'zend' },
  { name: 'Symfony', logo: 'symfony', invertDark: true },
  { name: 'WordPress', logo: 'wordpress', invertDark: true },
  // front-end + tools
  { name: 'Vue', logo: 'vuejs' },
  { name: 'Bootstrap', logo: 'bootstrap' },
  { name: 'Tailwind', logo: 'tailwindcss' },
  { name: 'Sass', logo: 'sass' },
  { name: 'jQuery', logo: 'jquery' },
  { name: 'Git', logo: 'git' },
  { name: 'Composer', logo: 'composer' },
  { name: 'npm', logo: 'npm' },
  { name: 'Postman', logo: 'postman' },
  { name: 'Jira', logo: 'jira' }
]

export default {
  name: 'StackSection',
  data() {
    // two rows: the first half drifts left, the second drifts right
    const half = Math.ceil(STACK.length / 2)
    return { rows: [STACK.slice(0, half), STACK.slice(half)] }
  },
  mounted() {
    const el = this.$refs.rows
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      el.classList.add('is-in')
      return
    }
    // fade the rows in the first time the section scrolls into view
    this._observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      el.classList.add('is-in')
      this._observer.disconnect()
    }, { threshold: 0.25 })
    this._observer.observe(el)
  },
  beforeUnmount() {
    if (this._observer) this._observer.disconnect()
  }
}
</script>

<style>
.stack {
  padding: 60px 0 70px;
  --stack-gap: 72px;
  --stack-size: 60px;
}

.stack-rows {
  display: flex;
  flex-direction: column;
  gap: 36px;
  max-width: 1100px;
  margin: 0 auto;
}

/* each row: clipped, with soft fade-out at both edges */
.stack-marquee {
  overflow: hidden;
  padding: 10px 0; /* room for the hover hop */
  -webkit-mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
          mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
  opacity: 0;
  translate: 0 16px;
  transition: opacity 0.8s ease, translate 0.8s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.stack-marquee.reverse { transition-delay: 0.15s; }
.stack-rows.is-in .stack-marquee { opacity: 1; translate: 0 0; }

.stack-track {
  display: flex;
  width: max-content;
  animation: stackScroll var(--duration, 30s) linear infinite;
  will-change: transform;
}
.stack-marquee.reverse .stack-track { animation-direction: reverse; }
/* pause the row you're looking at */
.stack-marquee:hover .stack-track { animation-play-state: paused; }

/* the gap is also added after the last logo, so one set + its gap = exactly 50% of the track */
.stack-set {
  display: flex;
  align-items: center;
  gap: var(--stack-gap);
  padding: 0 var(--stack-gap) 0 0;
  margin: 0;
  list-style: none;
}
@keyframes stackScroll {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(-50%, 0, 0); }
}

.stack-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--stack-size);
  height: var(--stack-size);
  flex-shrink: 0;
}

/* logos sit quietly in greyscale and come to life on hover */
.stack-logo {
  --logo-on: none;
  --logo-off: grayscale(1);
  width: var(--stack-size);
  height: var(--stack-size);
  filter: var(--logo-off);
  opacity: 0.7;
}
/* near-black logos (Symfony, WordPress) would vanish on the dark background */
:root[data-theme="dark"] .stack-logo.invert-dark {
  --logo-on: invert(1);
  --logo-off: grayscale(1) invert(1);
}
.stack-icon {
  font-size: calc(var(--stack-size) - 2px);
  color: var(--c-muted);
}
.stack-logo,
.stack-icon {
  transition: filter 0.3s ease, opacity 0.3s ease, color 0.3s ease,
              transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.stack-item:hover .stack-logo { filter: var(--logo-on); opacity: 1; }
.stack-item:hover .stack-icon { color: var(--c-accent); }
.stack-item:hover .stack-logo,
.stack-item:hover .stack-icon { transform: translateY(-4px) rotate(-8deg) scale(1.15); }

@media (max-width: 767px) {
  .stack { --stack-gap: 52px; --stack-size: 50px; }
  .stack-rows { gap: 24px; }
}

/* reduced motion: no scrolling — show each row once, wrapped and centred */
@media (prefers-reduced-motion: reduce) {
  .stack-marquee { -webkit-mask-image: none; mask-image: none; opacity: 1; translate: 0 0; transition: none; }
  .stack-track { animation: none; width: auto; justify-content: center; }
  .stack-set { flex-wrap: wrap; justify-content: center; row-gap: 24px; padding: 0 16px; }
  .stack-set[aria-hidden="true"] { display: none; }
  .stack-logo, .stack-icon { transition: none; }
  .stack-item:hover .stack-logo,
  .stack-item:hover .stack-icon { transform: none; }
}
</style>
