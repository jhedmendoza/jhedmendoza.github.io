<template>
  <div>
    <HeaderComp v-if="showHeader" :showMainNav="showMainNav" />
    <main>
      <router-view />
    </main>
    <FooterComp v-if="showFooter" />
    <CursorInk />
    <CursorDot />
  </div>
</template>

<script>
import HeaderComp from './components/Header.vue'
import FooterComp from './components/Footer.vue'
import CursorDot from './components/CursorDot.vue'
import CursorInk from './components/CursorInk.vue'

export default {
  components: { HeaderComp, FooterComp, CursorDot, CursorInk },
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
