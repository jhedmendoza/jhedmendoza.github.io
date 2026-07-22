<template>
  <div>
    <button type="button" class="mobile-nav-toggle d-xl-none" @click="toggleMobileNav">
      <i :class="mobileNavActive ? 'icofont-close' : 'icofont-navigation-menu'"></i>
    </button>

    <header id="header" class="d-flex flex-column justify-content-center">
      <nav :class="['nav-menu', { 'mobile-active': mobileNavActive }]">
        <ul>
          <li :class="{ active: activeSection === 'hero' }"><a href="#hero" @click.prevent="scrollToSection('#hero')"><i class="bx bx-home"></i> <span>Home</span></a></li>
          <li :class="{ active: activeSection === 'news' }"><a href="#news" @click.prevent="scrollToSection('#news')"><i class="bx bx-news"></i> <span>Blog</span></a></li>
          <li :class="{ active: activeSection === 'portfolio' }"><a href="#portfolio" @click.prevent="scrollToSection('#portfolio')"><i class="bx bx-book-content"></i> <span>Portfolio</span></a></li>
          <li :class="{ active: activeSection === 'contact' }"><a href="#contact" @click.prevent="scrollToSection('#contact')"><i class="bx bx-envelope"></i> <span>Contact</span></a></li>
        </ul>
      </nav>
    </header>
  </div>
</template>

<script>
export default {
  name: 'HeaderComp',
  data() {
    return {
      mobileNavActive: false,
      activeSection: ''
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
  }
}
</script>