<template>
  <div>
    <button v-if="showMainNav" type="button" class="mobile-nav-toggle d-lg-none" :aria-expanded="mobileNavActive"
            :aria-label="mobileNavActive ? 'Close menu' : 'Open menu'" @click="toggleMobileNav">
      <i :class="['bx', mobileNavActive ? 'bx-x' : 'bx-menu']"></i>
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
        { id: 'news', label: 'Blog', icon: 'bx-book-open' },
        { id: 'portfolio', label: 'Portfolio', icon: 'bx-briefcase-alt-2' },
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
    const sections = ['hero', 'news', 'portfolio', 'contact']
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
#header .site-nav a i { font-size: 22px; }

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

/* hamburger button */
.mobile-nav-toggle i { font-size: 28px; color: var(--c-text); transition: color 0.25s ease; }
.mobile-nav-toggle:hover i,
.mobile-nav-active .mobile-nav-toggle i { color: var(--c-accent); }

@media (prefers-reduced-motion: reduce) {
  #header .site-nav a::before,
  #header .site-nav a span { transition: none; }
}
</style>