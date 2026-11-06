<template>
  <footer id="footer">
    <div class="container">
      <div class="social-links">
        <a href="https://www.linkedin.com/in/jhedmendoza/" class="linkedin" target="_blank"><i class="bx bxl-linkedin"></i></a>
        <a href="https://github.com/jhedmendoza" class="github" target="_blank"><i class="bx bxl-github"></i></a>
        <a href="https://twitter.com/_jhedm" target="_blank" class="twitter"><i class="bx bxl-twitter"></i></a>
        <a href="https://www.instagram.com/jhedmendoza/" class="instagram" target="_blank"><i class="bx bxl-instagram"></i></a>
      </div>
      <div class="copyright">
        &copy; Copyright <strong><span>jhedmendoza</span></strong>. All Rights Reserved
      </div>
    </div>
  </footer>

  <Transition name="back-to-top-fade">
    <a v-if="showBackToTop" href="#" class="back-to-top" aria-label="Back to top" @click.prevent="scrollToTop">
      <i class="bx bx-up-arrow-alt"></i>
    </a>
  </Transition>
</template>

<script>
const SCROLL_DURATION = 900 // ms

// ease in-out cubic: slow start, fast middle, gentle landing
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default {
  name: 'FooterComp',
  data() {
    return {
      showBackToTop: false
    }
  },
  methods: {
    onScroll() {
      this.showBackToTop = window.scrollY > 100
    },
    cancelScroll() {
      if (this._scrollFrame) cancelAnimationFrame(this._scrollFrame)
      this._scrollFrame = null
      window.removeEventListener('wheel', this.cancelScroll)
      window.removeEventListener('touchstart', this.cancelScroll)
    },
    scrollToTop() {
      const start = window.scrollY
      if (start <= 0) return

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.scrollTo(0, 0)
        return
      }

      this.cancelScroll()
      // stop the animation if the user starts scrolling themselves
      window.addEventListener('wheel', this.cancelScroll, { passive: true })
      window.addEventListener('touchstart', this.cancelScroll, { passive: true })

      const startTime = performance.now()
      const step = (now) => {
        const progress = Math.min((now - startTime) / SCROLL_DURATION, 1)
        window.scrollTo(0, start * (1 - easeInOutCubic(progress)))
        if (progress < 1) this._scrollFrame = requestAnimationFrame(step)
        else this.cancelScroll()
      }
      this._scrollFrame = requestAnimationFrame(step)
    }
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll, { passive: true })
    this.onScroll()
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
    this.cancelScroll()
  }
}
</script>

<style>
/* style.css hides .back-to-top by default; visibility is controlled by v-if here */
.back-to-top {
  display: block;
}
.back-to-top-fade-enter-active,
.back-to-top-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.back-to-top-fade-enter-from,
.back-to-top-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
