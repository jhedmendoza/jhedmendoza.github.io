<template>
  <div>
    <HeroSection />

    <main id="main">
      <ExperienceSection />
      <StackSection />
      <PortfolioSection />
      <BlogSection />
      <ContactSection />
    </main>
  </div>
</template>

<script>
import HeroSection from '../components/home/HeroSection.vue'
import BlogSection from '../components/home/BlogSection.vue'
import PortfolioSection from '../components/home/PortfolioSection.vue'
import StackSection from '../components/home/StackSection.vue'
import ExperienceSection from '../components/home/ExperienceSection.vue'
import ContactSection from '../components/home/ContactSection.vue'

// ↑ / ↓ step through the page's sections
const SECTIONS = ['hero', 'experience', 'stack', 'portfolio', 'news', 'contact']
// a long section is paged through in steps of this much of the viewport, so nothing gets skipped
const MAX_STEP = 0.85
// places where the arrow keys already mean something
const OWNS_ARROWS = 'input, textarea, select, [contenteditable="true"], iframe, video, audio, ' +
  '[role="tablist"], [role="listbox"], [role="slider"], [role="menu"], [role="menubar"], [role="grid"], [role="tree"], [role="radiogroup"]'

// document-y of each section's top, plus the very bottom of the page as the final stop
function stops() {
  const tops = SECTIONS
    .map(id => document.getElementById(id))
    .filter(Boolean)
    .map(el => Math.round(el.getBoundingClientRect().top + window.scrollY))
  tops.push(document.documentElement.scrollHeight - window.innerHeight)
  return [...new Set(tops)].sort((a, b) => a - b)
}

export default {
  name: 'HomePage',
  components: { HeroSection, BlogSection, PortfolioSection, StackSection, ExperienceSection, ContactSection },
  methods: {
    onSectionKey(e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const focused = document.activeElement
      if (focused && focused.closest && focused.closest(OWNS_ARROWS)) return
      if (document.querySelector('[aria-modal="true"]') || document.body.classList.contains('mobile-nav-active')) return

      e.preventDefault()
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      // while a previous step is still gliding, count from where it's heading, so quick presses add up
      const gliding = this._stepTarget != null && performance.now() - this._stepAt < 900 && Math.abs(window.scrollY - this._stepTarget) > 2
      const from = gliding ? this._stepTarget : window.scrollY
      const step = window.innerHeight * MAX_STEP
      const all = stops()

      let to
      if (e.key === 'ArrowDown') {
        const next = all.find(y => y > from + 2)
        to = Math.min(next == null ? maxScroll : next, from + step)
      } else {
        const prev = [...all].reverse().find(y => y < from - 2)
        to = Math.max(prev == null ? 0 : prev, from - step)
      }
      to = Math.max(0, Math.min(maxScroll, Math.round(to)))
      if (to === Math.round(from)) return

      this._stepTarget = to
      this._stepAt = performance.now()
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: to, behavior: smooth ? 'smooth' : 'auto' })
    }
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onSectionKey)
  },
  async mounted() {
    window.addEventListener('keydown', this.onSectionKey)
    // Load and initialize AOS so elements with data-aos are visible
    try {
      if (!window.AOS) {
        const base = import.meta.env.BASE_URL || '/'
        await new Promise((resolve, reject) => {
          const s = document.createElement('script')
          s.src = base + 'assets/vendor/aos/aos.js'
          s.onload = resolve; s.onerror = reject; document.body.appendChild(s)
        })
      }
      if (window.AOS && typeof window.AOS.init === 'function') {
        window.AOS.init({ duration: 1000, once: true })
      }
    } catch (e) {
      // non-fatal: AOS is decorative
    }
  }
}
</script>
