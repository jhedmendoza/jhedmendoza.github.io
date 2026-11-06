<template>
  <div>
    <HeroSection />

    <main id="main">
      <StackSection />
      <BlogSection />
      <PortfolioSection />
      <ContactSection />
    </main>
  </div>
</template>

<script>
import HeroSection from '../components/home/HeroSection.vue'
import BlogSection from '../components/home/BlogSection.vue'
import PortfolioSection from '../components/home/PortfolioSection.vue'
import StackSection from '../components/home/StackSection.vue'
import ContactSection from '../components/home/ContactSection.vue'

export default {
  name: 'HomePage',
  components: { HeroSection, BlogSection, PortfolioSection, StackSection, ContactSection },
  async mounted() {
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
