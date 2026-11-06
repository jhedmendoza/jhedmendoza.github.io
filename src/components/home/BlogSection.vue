<template>
  <section id="news" class="blog">
    <div class="container">
      <div class="section-title"><h2>Blog</h2></div>
      <div v-if="isLoadingPosts" class="text-center blog-status">Loading latest posts...</div>
      <div v-else-if="postsError" class="text-center text-danger">{{ postsError }}</div>

      <div v-else class="blog-slider" data-aos="fade-up" data-aos-delay="100"
           @touchstart.passive="onTouchStart" @touchend="onTouchEnd">
        <div class="blog-slider-viewport">
          <div class="blog-slider-track" :style="{ transform: `translateX(-${page * 100}%)` }">
            <div v-for="(post, i) in posts" :key="post.post_id" class="blog-slide" :style="{ flexBasis: 100 / perView + '%' }"
                 :aria-hidden="!isVisible(i)">
              <router-link :to="{ name: 'post', params: { postId: post.post_id, slug: post.post_slug } }"
                           :tabindex="isVisible(i) ? 0 : -1" class="blog-card">
                <p class="blog-card-meta">
                  <time :datetime="post.post_date">{{ post.post_date_label }}</time>
                  <template v-if="post.read_time"> · {{ post.read_time }} min read</template>
                </p>
                <h3 class="blog-card-title">{{ post.post_title }}</h3>
                <p class="blog-card-excerpt">{{ post.post_exerpt }}</p>
              </router-link>
            </div>
          </div>
        </div>

        <div v-if="pageCount > 1" class="blog-slider-dots">
          <button v-for="n in pageCount" :key="n" type="button" :class="['blog-slider-dot', { active: page === n - 1 }]"
                  :aria-label="`Go to page ${n}`" :aria-current="page === n - 1" @click="page = n - 1"></button>
        </div>
      </div>

      <div v-if="!isLoadingPosts" class="text-center">
        <router-link to="/posts" class="blog-view-all">View all posts</router-link>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios'

const WP_API_URL = 'https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts?http_envelope=1&number=10'
const WORDS_PER_MINUTE = 200

export default {
  name: 'BlogSection',
  data() {
    return {
      posts: [],
      isLoadingPosts: true,
      postsError: '',
      page: 0,
      perView: 2
    }
  },
  computed: {
    pageCount() {
      return Math.max(1, Math.ceil(this.posts.length / this.perView))
    }
  },
  watch: {
    // keep the current page in range when the layout switches between 1 and 2 cards
    pageCount(count) {
      if (this.page > count - 1) this.page = count - 1
    }
  },
  methods: {
    prev() { if (this.page > 0) this.page-- },
    next() { if (this.page < this.pageCount - 1) this.page++ },
    isVisible(i) { return Math.floor(i / this.perView) === this.page },
    updatePerView() { this.perView = window.innerWidth >= 768 ? 2 : 1 },
    onTouchStart(e) { this._touchX = e.changedTouches[0].clientX },
    onTouchEnd(e) {
      if (this._touchX == null) return
      const dx = e.changedTouches[0].clientX - this._touchX
      this._touchX = null
      if (Math.abs(dx) < 40) return
      if (dx < 0) this.next(); else this.prev()
    },
    stripTags(html) { const d = document.createElement('div'); d.innerHTML = html; return d.textContent || d.innerText || '' },
    toPost(p) {
      const date = p.date ? new Date(p.date) : null
      const words = this.stripTags(p.content || '').trim().split(/\s+/).filter(Boolean).length
      return {
        post_id: p.ID || p.id,
        post_title: this.stripTags(p.title || p.post_title || ''),
        post_slug: p.slug || p.post_name || '',
        post_date: date ? date.toISOString().split('T')[0] : '',
        post_date_label: date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
        read_time: words ? Math.max(1, Math.round(words / WORDS_PER_MINUTE)) : 0,
        // full excerpt; CSS clamps it to 3 lines so it never cuts mid-word
        post_exerpt: this.stripTags(p.excerpt || p.post_excerpt || '').trim()
      }
    },
    async fetchPosts() {
      this.isLoadingPosts = true
      this.postsError = ''
      try {
        const resp = await axios.get(WP_API_URL, { timeout: 8000 })
        const data = resp.data
        const list = Array.isArray(data?.body?.posts) ? data.body.posts : Array.isArray(data?.posts) ? data.posts : []

        if (list.length) {
          this.posts = list.map(this.toPost)
        } else {
          this.posts = []
          this.postsError = 'No posts found.'
        }
      } catch (err) {
        console.error('Axios posts fetch error', err)
        this.posts = []
        this.postsError = 'Unable to load blog posts.'
      } finally {
        this.isLoadingPosts = false
      }

      // let AOS re-evaluate newly inserted elements (data-aos)
      await this.$nextTick()
      if (window.AOS && typeof window.AOS.refresh === 'function') {
        window.AOS.refresh()
      }
    }
  },
  mounted() {
    this.updatePerView()
    window.addEventListener('resize', this.updatePerView)
    this.fetchPosts()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updatePerView)
  }
}
</script>

<style>
.blog {
  --blog-ink: var(--c-ink);
  --blog-muted: var(--c-muted);
  --blog-rule: var(--c-rule);
  --blog-accent: var(--c-accent);
}
.blog-status { color: var(--blog-muted); }

/* slider */
.blog-slider-viewport { overflow: hidden; }
.blog-slider-track {
  display: flex;
  transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
  will-change: transform;
}
.blog-slide {
  flex: 0 0 50%;
  min-width: 0;
  padding: 0 20px;
  display: flex;
}

/* card: no box, no shadow — just type and a hairline rule */
.blog-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 28px 0 8px;
  border-top: 1px solid var(--blog-rule);
  color: var(--blog-ink);
  text-align: left;
}
.blog-card::before {
  /* accent line that draws across the rule on hover */
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--blog-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.45s ease;
}
.blog-card:hover,
.blog-card:focus-visible { color: var(--blog-ink); text-decoration: none; }
.blog-card:hover::before,
.blog-card:focus-visible::before { transform: scaleX(1); }
.blog-card:focus-visible { outline: 2px solid var(--blog-accent); outline-offset: 6px; }

.blog-card-meta {
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--blog-muted);
  margin-bottom: 8px;
}
.blog-card-title {
  font-family: Poppins, sans-serif;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.35;
  margin: 0 0 12px;
  color: var(--blog-ink);
  transition: color 0.25s ease;
}
.blog-card:hover .blog-card-title { color: var(--blog-accent); }
.blog-card-excerpt {
  font-size: 15px;
  line-height: 1.7;
  color: var(--blog-muted);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* pagination: pill for the active page */
.blog-slider-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 32px;
}
.blog-slider-dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  border: 0;
  padding: 0;
  background: var(--blog-rule);
  cursor: pointer;
  transition: width 0.3s ease, background 0.3s ease;
}
.blog-slider-dot:hover { background: var(--blog-muted); }
.blog-slider-dot.active { width: 22px; background: var(--blog-accent); }

/* view all: quiet text link */
.blog-view-all {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 28px;
  font-size: 14px;
  font-weight: 600;
  color: var(--blog-ink);
  border-bottom: 1px solid var(--blog-rule);
  padding-bottom: 2px;
  transition: color 0.25s ease, border-color 0.25s ease;
}
.blog-view-all:hover { color: var(--blog-accent); border-color: var(--blog-accent); text-decoration: none; }

@media (max-width: 767px) {
  .blog-slide { padding: 0 15px; }
  .blog-card-title { font-size: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .blog-slider-track,
  .blog-card::before { transition: none; }
}
</style>
