<template>
  <div>
    <button v-if="showMainNav" type="button" :class="['mobile-nav-toggle', 'd-lg-none', { 'is-open': mobileNavActive }]"
            :aria-expanded="mobileNavActive" :aria-label="mobileNavActive ? 'Close menu' : 'Open menu'" @click="toggleMobileNav">
      <!-- three bars that morph into an X (and back) -->
      <span class="burger" aria-hidden="true"><span></span><span></span><span></span></span>
    </button>

    <header id="header" class="d-flex flex-column justify-content-center">
      <nav v-if="showMainNav" class="nav-menu site-nav" aria-label="Main">
        <ul>
          <li v-for="item in navItems" :key="item.id" :class="{ active: activeSection === item.id }">
            <a :href="'#' + item.id" :aria-current="activeSection === item.id ? 'true' : null" @click.prevent="scrollToSection('#' + item.id)">
              <i :class="['bx', item.icon]" aria-hidden="true"></i>
              <span>{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  </div>
</template>

<script>
export default {
  name: 'HeaderComp',
  props: {
    showMainNav: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      mobileNavActive: false,
      activeSection: '',
      navItems: [
        { id: 'hero', label: 'Home', icon: 'bx-home-alt' },
        { id: 'experience', label: 'Experience', icon: 'bx-briefcase-alt-2' },
        { id: 'stack', label: 'Tech Stack', icon: 'bx-layer' },
        { id: 'portfolio', label: 'Portfolio', icon: 'bx-grid-alt' },
        { id: 'news', label: 'Blog', icon: 'bx-book-open' },
        { id: 'contact', label: 'Contact', icon: 'bx-envelope' }
      ]
    }
  },
  watch: {
    // style.css slides #header in when <body> has .mobile-nav-active
    mobileNavActive(active) {
      document.body.classList.toggle('mobile-nav-active', active)
    },
    $route() {
      this.mobileNavActive = false
    }
  },
  methods: {
    toggleMobileNav() {
      this.mobileNavActive = !this.mobileNavActive
    },
    scrollToSection(selector) {
      const el = document.querySelector(selector)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        this.mobileNavActive = false
      }
    }
  },
  mounted() {
    const sections = ['hero', 'experience', 'stack', 'portfolio', 'news', 'contact']
    // keep a reference so we can remove it in beforeUnmount (Vue 3 doesn't have $once)
    this._headerOnScroll = () => {
      for (const s of sections) {
        const el = document.querySelector(s.startsWith('#') ? s : `#${s}`) || document.getElementById(s)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120 && rect.bottom > 120) {
            this.activeSection = s
            return
          }
        }
      }
      this.activeSection = ''
    }
    window.addEventListener('scroll', this._headerOnScroll)
    this._headerOnScroll()
  },
  beforeUnmount() {
    if (this._headerOnScroll) window.removeEventListener('scroll', this._headerOnScroll)
    document.body.classList.remove('mobile-nav-active')
  }
}
</script>

<style>
/* Minimal nav: plain icons, accent for the active section, labels on hover.
   Scoped to .site-nav so the separate nav on the /posts page is untouched. */
.site-nav {
  --nav-ink: var(--c-ink);
  --nav-muted: var(--c-muted);
  --nav-rule: var(--c-rule);
  --nav-accent: var(--c-accent);
}
#header .site-nav ul { display: flex; flex-direction: column; gap: 6px; }
#header .site-nav a {
  position: relative;
  display: flex;
  align-items: center;
  width: 44px;
  height: 44px;
  margin: 0;
  padding: 0;
  justify-content: center;
  border-radius: 0;
  background: none;
  color: var(--nav-muted);
  overflow: visible;
  transition: color 0.25s ease;
}
#header .site-nav a i { font-size: 22px; display: inline-block; }

/* hover micro-animations, one per icon */
#header .site-nav a:hover .bx-home-alt,
#header .site-nav a:focus-visible .bx-home-alt { animation: navHop 0.55s ease; }
#header .site-nav a:hover .bx-book-open,
#header .site-nav a:focus-visible .bx-book-open { animation: navPageTurn 0.6s ease; }
#header .site-nav a:hover .bx-briefcase-alt-2,
#header .site-nav a:focus-visible .bx-briefcase-alt-2 { animation: navWiggle 0.6s ease; }
#header .site-nav a:hover .bx-layer,
#header .site-nav a:focus-visible .bx-layer { animation: navStack 0.6s ease; }
#header .site-nav a:hover .bx-grid-alt,
#header .site-nav a:focus-visible .bx-grid-alt { animation: navGrid 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
#header .site-nav a:hover .bx-envelope,
#header .site-nav a:focus-visible .bx-envelope { animation: navSend 0.6s ease; }

@keyframes navHop {
  0%, 100% { transform: translateY(0); }
  35%      { transform: translateY(-5px); }
  60%      { transform: translateY(0); }
  78%      { transform: translateY(-2px); }
}
@keyframes navPageTurn {
  0%   { transform: perspective(80px) rotateY(0); }
  50%  { transform: perspective(80px) rotateY(180deg); }
  100% { transform: perspective(80px) rotateY(360deg); }
}
@keyframes navWiggle {
  0%, 100% { transform: rotate(0); }
  20%      { transform: rotate(-12deg); }
  40%      { transform: rotate(10deg); }
  60%      { transform: rotate(-6deg); }
  80%      { transform: rotate(3deg); }
}
@keyframes navStack {
  0%, 100% { transform: scaleY(1) translateY(0); }
  30%      { transform: scaleY(0.8) translateY(2px); }
  60%      { transform: scaleY(1.12) translateY(-3px); }
}
@keyframes navGrid {
  0%   { transform: rotate(0) scale(1); }
  50%  { transform: rotate(90deg) scale(0.85); }
  100% { transform: rotate(90deg) scale(1); }
}
@keyframes navSend {
  0%   { transform: translate(0, 0) rotate(0); }
  45%  { transform: translate(3px, -4px) rotate(-12deg); }
  100% { transform: translate(0, 0) rotate(0); }
}

/* active marker: short accent bar on the left edge */
#header .site-nav a::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  width: 2px;
  height: 18px;
  margin-top: -9px;
  background: var(--nav-accent);
  border-radius: 2px;
  transform: scaleY(0);
  transition: transform 0.3s ease;
}
#header .site-nav .active > a,
#header .site-nav a:hover,
#header .site-nav li:hover > a { width: 44px; background: none; color: var(--nav-accent); }
#header .site-nav .active > a::before { transform: scaleY(1); }
#header .site-nav a:focus-visible { outline: 2px solid var(--nav-accent); outline-offset: 2px; }

/* desktop: label appears beside the icon as a quiet chip */
@media (min-width: 992px) {
  #header { padding: 15px 15px 15px 24px; overflow: visible; }
  #header .site-nav a span {
    display: block;
    position: absolute;
    left: 52px;
    top: 50%;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    white-space: nowrap;
    color: var(--nav-ink);
    background: var(--c-bg);
    border: 1px solid var(--nav-rule);
    border-radius: 4px;
    opacity: 0;
    pointer-events: none;
    transform: translate(-6px, -50%);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  #header .site-nav a:hover span,
  #header .site-nav a:focus-visible span { opacity: 1; transform: translate(0, -50%); color: var(--nav-ink); }
}

/* mobile drawer: full rows with icon + label */
@media (max-width: 991px) {
  #header { padding: 80px 24px 24px; }
  #header .site-nav ul { gap: 0; }
  #header .site-nav a,
  #header .site-nav .active > a,
  #header .site-nav a:hover,
  #header .site-nav li:hover > a {
    width: 100%;
    height: 52px;
    justify-content: flex-start;
    gap: 14px;
    border-bottom: 1px solid var(--nav-rule);
  }
  #header .site-nav a::before { left: -24px; }
  #header .site-nav a span {
    display: inline;
    padding: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--nav-ink);
  }
  #header .site-nav .active > a span,
  #header .site-nav a:hover span { color: var(--nav-accent); }
}

/* hamburger button: bars morph into an X when open, and back when closed */
.mobile-nav-toggle {
  top: 16px;
  right: 15px;
  width: 34px;
  height: 34px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.burger {
  position: relative;
  display: block;
  width: 22px;
  height: 16px;
}
.burger span {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  border-radius: 2px;
  background: var(--c-text);
  transition: top 0.25s ease 0.2s, transform 0.3s cubic-bezier(0.65, 0, 0.35, 1) 0s,
              opacity 0.2s ease 0.15s, background-color 0.25s ease;
}
.burger span:nth-child(1) { top: 0; }
.burger span:nth-child(2) { top: 7px; }
.burger span:nth-child(3) { top: 14px; }
.mobile-nav-toggle:hover .burger span { background: var(--c-accent); }
/* open: outer bars slide to the middle, then rotate into an X; the middle bar shrinks away */
.mobile-nav-toggle.is-open .burger span { background: var(--c-accent); }
.mobile-nav-toggle.is-open .burger span:nth-child(1),
.mobile-nav-toggle.is-open .burger span:nth-child(3) {
  top: 7px;
  transition: top 0.25s ease 0s, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s, background-color 0.25s ease;
}
.mobile-nav-toggle.is-open .burger span:nth-child(1) { transform: rotate(45deg); }
.mobile-nav-toggle.is-open .burger span:nth-child(3) { transform: rotate(-45deg); }
.mobile-nav-toggle.is-open .burger span:nth-child(2) { opacity: 0; transform: scaleX(0); transition: opacity 0.15s ease, transform 0.2s ease; }

/* drawer items slide in one after another when the menu opens */
@media (max-width: 991px) {
  #header .site-nav li {
    opacity: 0;
    translate: -16px 0;
    transition: opacity 0.3s ease, translate 0.4s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .mobile-nav-active #header .site-nav li { opacity: 1; translate: 0 0; }
  .mobile-nav-active #header .site-nav li:nth-child(1) { transition-delay: 0.15s; }
  .mobile-nav-active #header .site-nav li:nth-child(2) { transition-delay: 0.2s; }
  .mobile-nav-active #header .site-nav li:nth-child(3) { transition-delay: 0.25s; }
  .mobile-nav-active #header .site-nav li:nth-child(4) { transition-delay: 0.3s; }
  .mobile-nav-active #header .site-nav li:nth-child(5) { transition-delay: 0.35s; }
  .mobile-nav-active #header .site-nav li:nth-child(6) { transition-delay: 0.4s; }
}
@media (prefers-reduced-motion: reduce) {
  .burger span { transition: none !important; }
  #header .site-nav li { transition: none !important; }
}

@media (prefers-reduced-motion: reduce) {
  #header .site-nav a::before,
  #header .site-nav a span { transition: none; }
  #header .site-nav a i { animation: none !important; }
}
</style>