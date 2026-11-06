<template>
  <section id="hero" class="d-flex flex-column justify-content-center">
    <div id="particles-js" aria-hidden="true"><HeroCodeField /></div>
    <div class="hero-theme">
      <ThemeToggle />
    </div>
    <div class="container">
      <div class="hero-layout">
        <div class="hero-visual">
          <div class="hero-portrait">
            <picture>
              <source type="image/webp" srcset="/assets/img/jhed-480.webp 480w, /assets/img/jhed-800.webp 800w" sizes="(max-width: 991px) 180px, 380px"/>
              <img src="/assets/img/jhed-800.jpg" width="800" height="1063" alt="Illustrated portrait of Jhed Mendoza" fetchpriority="high"/>
            </picture>
          </div>
        </div>

        <div class="hero-text">
          <p class="hero-eyebrow">Hello, I'm</p>
          <h1>Jhed Mendoza</h1>
          <p class="hero-typed">
            <span class="sr-only">{{ typedItems.join(', ') }}</span>
            <span aria-hidden="true">I'm <span class="typed">{{ typedText }}</span><span class="typed-cursor">|</span></span>
          </p>
          <p class="hero-bio">I build fast, dependable websites.</p>

          <div class="hero-actions">
            <a href="#portfolio" class="hero-btn" @click.prevent="scrollTo('#portfolio')">View my work</a>
            <a href="#contact" class="hero-link" @click.prevent="scrollTo('#contact')">Get in touch</a>
          </div>

          <div class="social-links">
            <a href="https://www.instagram.com/jhedmendoza/" target="_blank" rel="noopener" class="instagram" aria-label="Instagram"><i class="bx bxl-instagram"></i></a>
            <a href="https://github.com/jhedmendoza" target="_blank" rel="noopener" class="github" aria-label="GitHub"><i class="bx bxl-github"></i></a>
            <a href="https://www.linkedin.com/in/jhedmendoza/" target="_blank" rel="noopener" class="linkedin" aria-label="LinkedIn"><i class="bx bxl-linkedin"></i></a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import ThemeToggle from '../ThemeToggle.vue'
import HeroCodeField from './HeroCodeField.vue'

export default {
  name: 'HeroSection',
  components: { ThemeToggle, HeroCodeField },
  data() {
    return {
      typedItems: ['a Web Developer', 'a Freelancer', 'a Dreamer', 'a Father'],
      typedText: '',
      typedIndex: 0,
      charIndex: 0,
      isDeleting: false,
      typedTimer: null
    }
  },
  methods: {
    schedule(fn, ms) {
      this.typedTimer = setTimeout(fn, ms)
    },
    updateTyped() {
      const current = this.typedItems[this.typedIndex]
      if (this.isDeleting) {
        if (this.charIndex > 0) { this.charIndex--; this.typedText = current.slice(0, this.charIndex); this.schedule(() => this.updateTyped(), 50) }
        else { this.isDeleting = false; this.typedIndex = (this.typedIndex + 1) % this.typedItems.length; this.schedule(() => this.updateTyped(), 500) }
      } else {
        if (this.charIndex < current.length) { this.charIndex++; this.typedText = current.slice(0, this.charIndex); this.schedule(() => this.updateTyped(), 120) }
        else { this.isDeleting = true; this.schedule(() => this.updateTyped(), 2000) }
      }
    },
    scrollTo(selector) {
      const el = document.querySelector(selector)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  },
  mounted() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // no typing animation: show the first phrase statically
      this.typedText = this.typedItems[0]
    } else {
      this.updateTyped()
    }
  },
  beforeUnmount() {
    clearTimeout(this.typedTimer)
  }
}
</script>

<style>
#hero {
  --hero-ink: var(--c-ink);
  --hero-text: var(--c-text);
  --hero-muted: var(--c-muted);
  --hero-rule: var(--c-rule);
  --hero-accent: var(--c-accent);
}

.hero-layout {
  display: flex;
  align-items: center;
  gap: 72px;
}
.hero-text { flex: 1; min-width: 0; }

/* portrait: circle crop with a hairline ring, matching the blog/portfolio rules */
/* portrait column: theme switch sits above the picture */
.hero-visual {
  order: 2;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
/* theme switch: pinned to the top-right corner of the hero */
.hero-theme {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 2;
  animation: heroFadeIn 0.9s ease both 0.1s;
}
.hero-theme .theme-toggle {
  width: 42px;
  height: 42px;
  border: 1px solid var(--hero-rule);
  border-radius: 50%;
  background: var(--c-bg);
}
.hero-theme .theme-toggle i { font-size: 20px; }
.hero-theme .theme-toggle:hover { border-color: var(--c-accent); }

.hero-portrait {
  flex-shrink: 0;
  width: 380px;
  height: 380px;
  border-radius: 50%;
  padding: 10px;
  border: 1px solid var(--hero-rule);
  background: var(--c-bg);
  animation: heroFadeIn 0.9s ease both 0.2s;
}
.hero-portrait img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 20%;
  display: block;
}

#hero .hero-eyebrow {
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hero-accent);
  margin: 0 0 12px;
}
#hero h1 {
  color: var(--hero-ink);
  letter-spacing: -0.01em;
}
#hero .hero-typed { min-height: 1.4em; }
#hero .hero-bio {
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: var(--hero-muted);
  max-width: 440px;
  margin: 18px 0 0;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-top: 32px;
}
.hero-btn {
  display: inline-block;
  padding: 11px 28px;
  border-radius: 50px;
  background: var(--c-accent-solid);
  color: var(--c-on-accent);
  font-size: 14px;
  font-weight: 600;
  transition: background 0.25s ease;
}
.hero-btn:hover { background: var(--c-accent-solid-hover); color: var(--c-on-accent); text-decoration: none; }
.hero-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--hero-ink);
  border-bottom: 1px solid var(--hero-rule);
  padding-bottom: 2px;
  transition: color 0.25s ease, border-color 0.25s ease;
}
.hero-link:hover { color: var(--hero-accent); border-color: var(--hero-accent); text-decoration: none; }
.hero-btn:focus-visible,
.hero-link:focus-visible,
#hero .social-links a:focus-visible { outline: 2px solid var(--hero-accent); outline-offset: 4px; }

#hero .social-links { margin-top: 36px; }
#hero .social-links a { font-size: 22px; }

/* entrance */
.hero-text > * { animation: heroFadeUp 0.7s ease both; }
.hero-text > :nth-child(2) { animation-delay: 0.08s; }
.hero-text > :nth-child(3) { animation-delay: 0.16s; }
.hero-text > :nth-child(4) { animation-delay: 0.24s; }
.hero-text > :nth-child(5) { animation-delay: 0.32s; }
.hero-text > :nth-child(6) { animation-delay: 0.4s; }
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}
@keyframes heroFadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: none; }
}

/* tablet & mobile: stack, portrait on top, centred (style.css already centres the text) */
@media (max-width: 991px) {
  /* grow with the content instead of clipping it on short screens */
  #hero { height: auto; min-height: 100vh; padding: 80px 0 56px; }
  .hero-layout { flex-direction: column; gap: 28px; }
  .hero-visual { order: 0; }
  /* sit just left of the fixed menu button (top-right, 15px) */
  .hero-theme { top: 12px; right: 60px; }
  .hero-portrait { width: 180px; height: 180px; padding: 6px; }
  #hero .hero-bio { margin-left: auto; margin-right: auto; font-size: 15px; }
  .hero-actions { justify-content: center; margin-top: 26px; }
  #hero .social-links { margin-top: 28px; }
  #hero .social-links a { margin: 0 10px; }
}
@media (max-width: 991px) and (max-height: 700px) {
  .hero-portrait { width: 140px; height: 140px; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-text > *,
  .hero-theme,
  .hero-portrait { animation: none; }
}
</style>
