<template>
  <div>
    <HeaderComp v-if="showHeader" :showMainNav="showMainNav" />
    <main>
      <router-view />
    </main>
    <FooterComp v-if="showFooter" />
  </div>
</template>

<script>
import HeaderComp from './components/Header.vue'
import FooterComp from './components/Footer.vue'

export default {
  components: { HeaderComp, FooterComp },
  computed: {
    showHeader() {
      return !(this.$route && this.$route.matched && this.$route.matched.some(r => r.meta && r.meta.hideHeader))
    },
    showFooter() {
      return !(this.$route && this.$route.matched && this.$route.matched.some(r => r.meta && r.meta.hideFooter))
    },
    showMainNav() {
      // show main left navigation unless a route requests hiding it
      return !(this.$route && this.$route.matched && this.$route.matched.some(r => r.meta && r.meta.hideMainNav))
    }
  },
  mounted() {
    // Show/hide back-to-top button and wire up smooth scroll
    this._onScroll = () => {
      const btn = document.querySelector('.back-to-top')
      if (!btn) return
      if (window.scrollY > 100) {
        btn.style.display = 'block'
      } else {
        btn.style.display = 'none'
      }
    }
    window.addEventListener('scroll', this._onScroll)
    // call once to set initial visibility
    this._onScroll()

    // click handler
    const btn = document.querySelector('.back-to-top')
    if (btn) {
      this._onBackClick = (e) => {
        e.preventDefault()
        // smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      btn.addEventListener('click', this._onBackClick)
    }
  },
  beforeUnmount() {
    if (this._onScroll) window.removeEventListener('scroll', this._onScroll)
    const btn = document.querySelector('.back-to-top')
    if (btn && this._onBackClick) btn.removeEventListener('click', this._onBackClick)
  }
}
</script>
