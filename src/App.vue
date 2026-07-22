<template>
  <div>
    <HeaderComp />
    <main>
      <router-view />
    </main>
    <FooterComp />
  </div>
</template>

<script>
import HeaderComp from './components/Header.vue'
import FooterComp from './components/Footer.vue'

export default {
  components: { HeaderComp, FooterComp }
}
</script>
