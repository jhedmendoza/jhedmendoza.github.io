<template>
  <section id="hero" class="d-flex flex-column justify-content-center">
    <div id="particles-js" aria-hidden="true"></div>
    <div class="container">
      <h1>Jhed Mendoza</h1>
      <p>I'm <span class="typed">{{ typedText }}</span><span class="typed-cursor">|</span></p>
      <div class="social-links">
        <a href="https://www.instagram.com/jhedmendoza/" target="_blank" class="instagram"><i class="bx bxl-instagram"></i></a>
        <a href="https://github.com/jhedmendoza" target="_blank" class="github"><i class="bx bxl-github"></i></a>
        <a href="https://www.linkedin.com/in/jhedmendoza/" target="_blank" class="linkedin"><i class="bx bxl-linkedin"></i></a>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HeroSection',
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
    loadScript(src) {
      return new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = src
        s.onload = resolve
        s.onerror = reject
        document.body.appendChild(s)
      })
    }
  },
  async mounted() {
    this.updateTyped()

    // dynamically load particles scripts (vendor assets) so particles effect works in dev and production
    try {
      const base = import.meta.env.BASE_URL || '/'
      await this.loadScript(base + 'assets/vendor/particlesjs/particles.min.js')
      // then load the app config which calls particlesJS('particles-js', ...)
      await this.loadScript(base + 'assets/vendor/particlesjs/app.js')
    } catch (e) {
      console.warn('Particles failed to load', e)
    }
  },
  beforeUnmount() {
    clearTimeout(this.typedTimer)
  }
}
</script>
