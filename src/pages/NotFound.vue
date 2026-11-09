<template>
  <div class="nf-page">
    <BlogTopbar back-to="/" back-label="Home" />
    <NotFoundContent kind="page" />
  </div>
</template>

<script>
import BlogTopbar from '../components/blog/BlogTopbar.vue'
import NotFoundContent from '../components/NotFoundContent.vue'

export default {
  name: 'NotFoundPage',
  components: { BlogTopbar, NotFoundContent }
}
</script>

<style>
.nf-page {
  min-height: 100vh;
  background: var(--c-bg);
}
</style>
