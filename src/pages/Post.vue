<template>
  <div class="post-page">
    <BlogTopbar back-to="/posts" back-label="All posts" :progress="post ? progress : null" />

    <div v-if="isLoading" class="post-wrap post-status">Loading post…</div>

    <div v-else-if="error" class="post-wrap post-status">
      <p class="post-status-error">{{ error }}</p>
      <router-link to="/posts" class="post-link">Back to all posts</router-link>
    </div>

    <article v-else-if="post" ref="article">
      <header class="post-wrap post-header">
        <p class="post-meta">
          <time :datetime="post.date">{{ post.dateLabel }}</time>
          <span aria-hidden="true">·</span>
          <span>{{ post.readTime }} min read</span>
        </p>
        <h1 class="post-title">{{ post.title }}</h1>
        <p v-if="post.excerpt" class="post-lead">{{ post.excerpt }}</p>
      </header>

      <!-- content comes from my own WordPress site -->
      <div class="post-wrap post-content" v-html="post.content"></div>

      <footer class="post-wrap post-footer">
        <div class="post-footer-author">
          <img src="/assets/img/jhed-480.webp" alt="" width="48" height="48"/>
          <div>
            <p class="post-footer-name">Written by Jhed Mendoza</p>
            <p class="post-footer-bio">I build fast, dependable websites.</p>
          </div>
        </div>
        <div class="post-footer-links">
          <router-link to="/posts" class="post-link">All posts</router-link>
          <router-link to="/#contact" class="post-link">Get in touch</router-link>
        </div>
      </footer>

      <PostComments :key="postId" :page-id="postId" />
    </article>
  </div>
</template>

<script>
import axios from 'axios'
import BlogTopbar from '../components/blog/BlogTopbar.vue'
import PostComments from '../components/blog/PostComments.vue'

const API = 'https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts/'
const WORDS_PER_MINUTE = 200

export default {
  name: 'PostPage',
  components: { BlogTopbar, PostComments },
  computed: {
    postId() {
      return String(this.$route?.params?.postId || new URLSearchParams(window.location.search).get('postId') || '')
    }
  },
  data() {
    return { post: null, isLoading: true, error: '', progress: 0 }
  },
  methods: {
    stripTags(html) { const d = document.createElement('div'); d.innerHTML = html || ''; return (d.textContent || d.innerText || '').trim() },
    setMeta(name, content, useProperty = false) {
      const selector = useProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let el = document.head.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(useProperty ? 'property' : 'name', name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content || '')
    },
    updateProgress() {
      const el = this.$refs.article
      if (!el) return
      const start = el.offsetTop
      const end = start + el.offsetHeight - window.innerHeight
      this.progress = end <= start ? 1 : Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)))
    },
    async fetchPost(id) {
      this.isLoading = true
      this.error = ''
      try {
        const { data } = await axios.get(API + encodeURIComponent(id), { timeout: 8000 })
        const date = new Date(data.date)
        const title = this.stripTags(data.title)
        const excerpt = this.stripTags(data.excerpt)
        const text = this.stripTags(data.content)
        const words = text.split(/\s+/).filter(Boolean).length
        // WordPress auto-generates excerpts from the opening text; only show a hand-written one
        const norm = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase()
        const isAutoExcerpt = norm(text).startsWith(norm(excerpt.replace(/\s*(\[…\]|\[\.\.\.\]|…)\s*$/, '')).slice(0, 60))

        this.post = {
          title,
          excerpt: isAutoExcerpt ? '' : excerpt,
          content: data.content,
          date: date.toISOString().split('T')[0],
          dateLabel: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          readTime: Math.max(1, Math.round(words / WORDS_PER_MINUTE))
        }

        document.title = `${title} | Jhed Mendoza`
        this.setMeta('description', excerpt.slice(0, 160))
        this.setMeta('og:type', 'article', true)
        this.setMeta('og:url', window.location.href, true)
        this.setMeta('og:title', title, true)
        this.setMeta('og:description', excerpt.slice(0, 160), true)
        if (data.featured_image) this.setMeta('og:image', data.featured_image, true)
      } catch (e) {
        console.error('Post fetch error', e)
        this.post = null
        this.error = "Sorry, this post couldn't be loaded. It may have been moved or removed."
      } finally {
        this.isLoading = false
        await this.$nextTick()
        this.updateProgress()
      }
    }
  },
  mounted() {
    this._originalTitle = document.title
    window.addEventListener('scroll', this.updateProgress, { passive: true })
    window.addEventListener('resize', this.updateProgress)

    // route param (SPA) with fallback to the legacy ?postId= query
    const id = this.$route?.params?.postId || new URLSearchParams(window.location.search).get('postId')
    if (id) this.fetchPost(id)
    else { this.error = 'No post specified.'; this.isLoading = false }
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.updateProgress)
    window.removeEventListener('resize', this.updateProgress)
    if (this._originalTitle) document.title = this._originalTitle
  },
  watch: {
    // react to route changes when navigating between posts
    '$route.params.postId'(newId, oldId) {
      if (newId && newId !== oldId) this.fetchPost(newId)
    }
  }
}
</script>

<style>
.post-page {
  --post-ink: var(--c-ink);
  --post-text: var(--c-body);
  --post-muted: var(--c-muted);
  --post-rule: var(--c-rule);
  --post-accent: var(--c-accent);
  min-height: 100vh;
  background: var(--c-bg);
  color: var(--post-text);
  padding-bottom: 64px;
}
.post-wrap {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 24px;
}

.post-status { padding-top: 96px; color: var(--post-muted); }
.post-status-error { color: var(--c-error); margin-bottom: 16px; }

.post-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--post-ink);
  border-bottom: 1px solid var(--post-rule);
  padding-bottom: 2px;
  transition: color 0.25s ease, border-color 0.25s ease;
}
.post-link:hover { color: var(--post-accent); border-color: var(--post-accent); text-decoration: none; }

/* header */
.post-header { padding-top: 88px; padding-bottom: 40px; }
.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--post-accent);
  margin: 0 0 18px;
}
.post-title {
  font-family: Poppins, sans-serif;
  font-size: 44px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.015em;
  color: var(--post-ink);
  margin: 0;
}
.post-lead {
  font-size: 19px;
  line-height: 1.6;
  color: var(--post-muted);
  margin: 20px 0 0;
}

/* body copy */
.post-content {
  font-size: 18px;
  line-height: 1.8;
  color: var(--post-text);
  overflow-wrap: break-word;
}
.post-content > * + * { margin-top: 1.4em; }
.post-content p { margin-bottom: 0; }
.post-content h2,
.post-content h3,
.post-content h4 {
  font-family: Poppins, sans-serif;
  font-weight: 600;
  line-height: 1.3;
  color: var(--post-ink);
  margin-top: 2em;
  margin-bottom: 0;
}
.post-content h2 { font-size: 28px; }
.post-content h3 { font-size: 22px; }
.post-content h4 { font-size: 18px; }
.post-content a {
  color: var(--post-accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
.post-content a:hover { color: var(--c-accent-hover); }
.post-content ul,
.post-content ol { padding-left: 1.4em; margin-bottom: 0; }
.post-content li + li { margin-top: 0.4em; }
.post-content blockquote {
  margin-left: 0;
  margin-right: 0;
  padding: 4px 0 4px 22px;
  border-left: 2px solid var(--post-accent);
  font-size: 20px;
  font-style: italic;
  color: var(--post-ink);
}
.post-content img,
.post-content video,
.post-content iframe {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}
.post-content figure { margin-left: 0; margin-right: 0; }
.post-content figcaption {
  font-size: 13px;
  color: var(--post-muted);
  text-align: center;
  margin-top: 10px;
}
.post-content hr {
  border: 0;
  border-top: 1px solid var(--post-rule);
  margin: 3em 0;
}
.post-content code {
  font-size: 0.88em;
  background: var(--c-code-bg);
  color: var(--post-ink);
  padding: 2px 6px;
  border-radius: 4px;
}
.post-content pre {
  background: var(--c-pre-bg);
  border: 1px solid var(--post-rule);
  border-radius: 6px;
  padding: 18px 20px;
  font-size: 14px;
  line-height: 1.6;
  overflow-x: auto;
}
.post-content pre code { background: none; padding: 0; }
.post-content table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}
.post-content th,
.post-content td {
  border-bottom: 1px solid var(--post-rule);
  padding: 10px 8px;
  text-align: left;
}

/* footer */
.post-footer {
  margin-top: 64px;
  padding-top: 32px;
  border-top: 1px solid var(--post-rule);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.post-footer-author {
  display: flex;
  align-items: center;
  gap: 14px;
}
.post-footer-author img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 20%;
  border: 1px solid var(--post-rule);
}
.post-footer-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--post-ink);
  margin: 0;
}
.post-footer-bio {
  font-size: 14px;
  color: var(--post-muted);
  margin: 2px 0 0;
}
.post-footer-links { display: flex; gap: 24px; }

@media (max-width: 767px) {
  .post-header { padding-top: 56px; padding-bottom: 32px; }
  .post-title { font-size: 32px; }
  .post-lead { font-size: 17px; }
  .post-content { font-size: 17px; }
  .post-content h2 { font-size: 24px; }
}
</style>
