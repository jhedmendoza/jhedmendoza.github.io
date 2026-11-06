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
  }
}
</script>
