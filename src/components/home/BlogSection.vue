<template>
  <section id="news" :class="['blog', { 'can-animate': canAnimate }]">
    <div class="container">
      <div class="section-title"><h2>Blog</h2></div>
      <div v-if="isLoadingPosts" class="text-center blog-status">Loading latest posts...</div>
      <div v-else-if="postsError" class="text-center text-danger">{{ postsError }}</div>

      <div v-else ref="slider" :class="['blog-slider', { 'is-in': inView, 'is-paging': paging }]"
           @touchstart.passive="onTouchStart" @touchend="onTouchEnd">
        <div class="blog-slider-viewport">
          <div class="blog-slider-track" :style="{ transform: `translateX(-${page * 100}%)` }">
            <div v-for="(post, i) in posts" :key="post.post_id" class="blog-slide" :style="{ flexBasis: 100 / perView + '%', '--pos': i % perView }"
                 :aria-hidden="!isVisible(i)">
              <router-link :to="{ name: 'post', params: { slug: post.post_slug || post.post_id } }"
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

      <div v-if="!isLoadingPosts" :class="['text-center', 'blog-footer', { 'is-in': inView }]">
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
      perView: 2,
      canAnimate: false, // set once we know motion is OK, so cards are never hidden without JS
      inView: false,
      paging: false
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
    },
    // replay the card cascade on the page you just switched to
    page() {
      if (!this.canAnimate) return
      this.paging = false
      requestAnimationFrame(() => requestAnimationFrame(() => { this.paging = true }))
    },
    // the slider only exists once posts have loaded: start watching it then
    isLoadingPosts(loading) {
      if (loading) return
      this.$nextTick(() => this.observeSlider())
    }
  },
  methods: {
    // cards rise in whenever the slider scrolls into view, and hide again when it leaves
    observeSlider() {
      if (!this.canAnimate || !this.$refs.slider || this._observer) return
      this._observer = new IntersectionObserver(([entry]) => {
        this.inView = entry.isIntersecting
        if (!entry.isIntersecting) this.paging = false
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 })
      this._observer.observe(this.$refs.slider)
    },
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
    this.canAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window
    this.updatePerView()
    window.addEventListener('resize', this.updatePerView)
    this.fetchPosts()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updatePerView)
    if (this._observer) this._observer.disconnect()
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
  /* revealed with clip-path, not scaleX: a transformed 1px line gets resampled and looks thinner */
  clip-path: inset(0 100% 0 0);
  transition: clip-path 0.45s ease;
  z-index: 1; /* stay above the grey divider (::after), which paints later at the same spot */
}
.blog-card:hover,
.blog-card:focus-visible { color: var(--blog-ink); text-decoration: none; }
.blog-card:hover::before,
.blog-card:focus-visible::before { clip-path: inset(0 0 0 0); }
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
/* ---- entrance animation ----
   --pos = the card's position on the current page (0, 1) for the left-to-right stagger */
.blog.can-animate .blog-card {
  border-top-color: transparent; /* the divider is drawn in by ::after instead */
  opacity: 0;
  translate: 0 48px;
  transition: opacity 0.5s ease, translate 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: calc(var(--pos, 0) * 140ms);
}
.blog.can-animate .blog-card::after {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--blog-rule);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1);
  transition-delay: calc(var(--pos, 0) * 140ms + 150ms);
}
/* date, title and excerpt follow one after another */
/* (the third transition keeps the title's hover colour change instant) */
.blog.can-animate .blog-card > * {
  opacity: 0;
  translate: 0 14px;
  transition: opacity 0.5s ease, translate 0.6s cubic-bezier(0.2, 0.7, 0.2, 1), color 0.25s ease;
  --line-delay: calc(var(--pos, 0) * 140ms + 200ms);
  transition-delay: var(--line-delay), var(--line-delay), 0s;
}
.blog.can-animate .blog-card > :nth-child(2) { --line-delay: calc(var(--pos, 0) * 140ms + 280ms); }
.blog.can-animate .blog-card > :nth-child(3) { --line-delay: calc(var(--pos, 0) * 140ms + 360ms); }

.blog-slider.is-in .blog-card { opacity: 1; translate: 0 0; }
.blog-slider.is-in .blog-card::after { transform: scaleX(1); }
.blog-slider.is-in .blog-card > * { opacity: 1; translate: 0 0; }

/* switching pages: the new page's text cascades in again */
.blog-slider.is-paging .blog-slide[aria-hidden="false"] .blog-card > * {
  animation: blogLineIn 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
}
.blog-slider.is-paging .blog-slide[aria-hidden="false"] .blog-card > :nth-child(1) { animation-delay: calc(var(--pos, 0) * 120ms + 250ms); }
.blog-slider.is-paging .blog-slide[aria-hidden="false"] .blog-card > :nth-child(2) { animation-delay: calc(var(--pos, 0) * 120ms + 330ms); }
.blog-slider.is-paging .blog-slide[aria-hidden="false"] .blog-card > :nth-child(3) { animation-delay: calc(var(--pos, 0) * 120ms + 410ms); }
@keyframes blogLineIn {
  from { opacity: 0; translate: 0 14px; }
  to   { opacity: 1; translate: 0 0; }
}

/* dots and 'View all posts' fade up last */
.blog.can-animate .blog-slider-dots,
.blog.can-animate .blog-footer {
  opacity: 0;
  translate: 0 12px;
  transition: opacity 0.5s ease 0.55s, translate 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0.55s;
}
.blog-slider.is-in .blog-slider-dots,
.blog.can-animate .blog-footer.is-in { opacity: 1; translate: 0 0; }

@media (prefers-reduced-motion: reduce) {
  .blog-slider-track,
  .blog-card::before { transition: none; }
}
</style>
