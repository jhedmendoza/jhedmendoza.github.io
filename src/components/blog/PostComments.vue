<template>
  <section v-if="enabled" class="post-comments" aria-labelledby="post-comments-title">
    <h2 id="post-comments-title" class="post-comments-title">Comments</h2>
    <p class="post-comments-note">Sign in with GitHub to join the conversation.</p>
    <div ref="thread" class="post-comments-thread"></div>
  </section>
</template>

<script>
import { themeState } from '../../theme.js'

/*
 * Giscus settings — comments are stored as GitHub Discussions in this repo.
 * Get CATEGORY_ID from https://giscus.app (enter the repo, pick the category, copy data-category-id).
 * Comments stay hidden until it's filled in.
 */
const GISCUS = {
  repo: 'jhedmendoza/jhedmendoza.github.io',
  repoId: 'MDEwOlJlcG9zaXRvcnkzNTU0NTMwNjQ=',
  category: 'Announcements',
  categoryId: 'DIC_kwDOFS_IiM4DKgNh'
}
const GISCUS_ORIGIN = 'https://giscus.app'
const THEMES = { light: 'noborder_light', dark: 'noborder_dark' }

export default {
  name: 'PostComments',
  props: {
    // one discussion per post, keyed by the WordPress post ID (stable even if the URL changes)
    pageId: { type: [String, Number], required: true }
  },
  computed: {
    enabled() { return !!(GISCUS.repoId && GISCUS.categoryId) },
    giscusTheme() { return THEMES[themeState.theme] || THEMES.light }
  },
  watch: {
    // keep the comments in sync with the site's light/dark toggle
    giscusTheme(theme) {
      const frame = this.$refs.thread && this.$refs.thread.querySelector('iframe.giscus-frame')
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage({ giscus: { setConfig: { theme } } }, GISCUS_ORIGIN)
      }
    }
  },
  mounted() {
    if (!this.enabled) return
    // giscus mounts its iframe next to the script tag, so inject a fresh script for each post
    const s = document.createElement('script')
    s.src = `${GISCUS_ORIGIN}/client.js`
    s.async = true
    s.crossOrigin = 'anonymous'
    const attrs = {
      'data-repo': GISCUS.repo,
      'data-repo-id': GISCUS.repoId,
      'data-category': GISCUS.category,
      'data-category-id': GISCUS.categoryId,
      'data-mapping': 'specific',
      'data-term': `post-${this.pageId}`,
      'data-strict': '1',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': this.giscusTheme,
      'data-lang': 'en',
      'data-loading': 'lazy'
    }
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v))
    this.$refs.thread.appendChild(s)
  }
}
</script>

<style>
.post-comments {
  max-width: 720px;
  margin: 64px auto 0;
  padding: 32px 24px 0;
  border-top: 1px solid var(--c-rule);
}
.post-comments-title {
  font-family: Poppins, sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: var(--c-ink);
  margin: 0 0 6px;
}
.post-comments-note {
  font-size: 14px;
  color: var(--c-muted);
  margin: 0 0 20px;
}
.post-comments-thread iframe { width: 100%; border: 0; }
</style>
