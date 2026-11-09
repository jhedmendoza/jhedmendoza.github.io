<template>
  <div class="posts-page">
    <BlogTopbar />

    <header class="posts-hero posts-wrap">
      <p class="posts-eyebrow">Blog</p>
      <h1 class="posts-title">Notes &amp; writing</h1>
      <p class="posts-lead">Thoughts on building for the web, lessons from projects, and whatever else is on my mind.</p>

      <div v-if="posts.length" class="posts-search">
        <i class="bx bx-search" aria-hidden="true"></i>
        <label for="posts-search" class="sr-only">Search posts</label>
        <input id="posts-search" v-model.trim="query" type="search" placeholder="Search posts" autocomplete="off"/>
      </div>
    </header>

    <div class="posts-wrap posts-main">
      <div v-if="isLoading" class="posts-status">Loading posts…</div>
      <div v-else-if="error" class="posts-status posts-status-error">{{ error }}</div>

      <template v-else>
        <p v-if="query && !filteredPosts.length" class="posts-status">
          No posts match “{{ query }}”.
          <button type="button" class="posts-clear" @click="query = ''">Clear search</button>
        </p>

        <section v-for="group in groupedPosts" :key="group.year" class="posts-year" :aria-label="'Posts from ' + group.year">
          <h2 class="posts-year-label">{{ group.year }}</h2>
          <ol class="posts-list">
            <li v-for="post in group.posts" :key="post.post_id">
              <router-link :to="{ name: 'post', params: { postId: post.post_id, slug: post.slug } }" class="posts-item">
                <time class="posts-item-date" :datetime="post.date">{{ post.dateLabel }}</time>
                <div class="posts-item-body">
                  <h3 class="posts-item-title">{{ post.title }}</h3>
                  <p v-if="post.excerpt" class="posts-item-excerpt">{{ post.excerpt }}</p>
                  <p class="posts-item-meta">{{ post.readTime }} min read</p>
                </div>
              </router-link>
            </li>
          </ol>
        </section>

        <div v-if="hasMore && !query" class="posts-more">
          <button type="button" class="posts-more-btn" :disabled="isLoadingMore" @click="loadMore">
            {{ isLoadingMore ? 'Loading…' : 'Load more posts' }}
          </button>
        </div>

        <p v-if="!hasMore && posts.length > 0 && !query" class="posts-end">That's everything, for now.</p>
      </template>
    </div>

    <footer class="posts-wrap posts-footer">
      <span>&copy; {{ year }} Jhed Mendoza</span>
      <router-link to="/#contact">Get in touch</router-link>
    </footer>
  </div>
</template>

<script>
import axios from 'axios'
import BlogTopbar from '../components/blog/BlogTopbar.vue'

const API = 'https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts'
const PAGE_SIZE = 10
const WORDS_PER_MINUTE = 200

export default {
  name: 'PostsPage',
  components: { BlogTopbar },
  data() {
    return {
      posts: [],
      found: 0,
      page: 1,
      query: '',
      isLoading: true,
      isLoadingMore: false,
      error: '',
      year: new Date().getFullYear()
    }
  },
  computed: {
    hasMore() {
      return this.posts.length < this.found
    },
    filteredPosts() {
      const q = this.query.toLowerCase()
      if (!q) return this.posts
      return this.posts.filter(p => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q))
    },
    groupedPosts() {
      const groups = []
      for (const post of this.filteredPosts) {
        const last = groups[groups.length - 1]
        if (last && last.year === post.year) last.posts.push(post)
        else groups.push({ year: post.year, posts: [post] })
      }
      return groups
    }
  },
  methods: {
    stripTags(html) { const d = document.createElement('div'); d.innerHTML = html || ''; return (d.textContent || d.innerText || '').trim() },
    toPost(p) {
      const date = new Date(p.date)
      const words = this.stripTags(p.content).split(/\s+/).filter(Boolean).length
      return {
        post_id: p.ID,
        title: this.stripTags(p.title),
        slug: p.slug,
        excerpt: this.stripTags(p.excerpt),
        date: date.toISOString().split('T')[0],
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        year: date.getFullYear(),
        readTime: Math.max(1, Math.round(words / WORDS_PER_MINUTE))
      }
    },
    async fetchPage(page) {
      const res = await axios.get(API, { params: { number: PAGE_SIZE, page }, timeout: 8000 })
      const data = res.data
      this.found = data.found || 0
      return Array.isArray(data.posts) ? data.posts.map(this.toPost) : []
    },
    async loadMore() {
      this.isLoadingMore = true
      try {
        const next = await this.fetchPage(this.page + 1)
        this.page++
        this.posts.push(...next)
      } catch (e) {
        console.error('Posts fetch error', e)
      } finally {
        this.isLoadingMore = false
      }
    }
  },
  async mounted() {
    try {
      this.posts = await this.fetchPage(1)
      if (!this.posts.length) this.error = 'No posts yet. Check back soon.'
    } catch (e) {
      console.error('Posts fetch error', e)
      this.error = 'Unable to load posts right now. Please try again later.'
    } finally {
      this.isLoading = false
    }
  }
}
</script>

<style>
.posts-page {
  --posts-ink: var(--c-ink);
  --posts-text: var(--c-text);
  --posts-muted: var(--c-muted);
  --posts-rule: var(--c-rule);
  --posts-accent: var(--c-accent);
  min-height: 100vh;
  background: var(--c-bg);
  color: var(--posts-text);
}
.posts-wrap {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 24px;
}

/* page header */
.posts-hero { padding-top: 88px; padding-bottom: 48px; }
.posts-eyebrow {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--posts-accent);
  margin: 0 0 14px;
}
.posts-title {
  font-family: Poppins, sans-serif;
  font-size: 48px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.015em;
  color: var(--posts-ink);
  margin: 0 0 16px;
}
.posts-lead {
  font-size: 17px;
  line-height: 1.7;
  color: var(--posts-muted);
  max-width: 560px;
  margin: 0;
}

/* search */
.posts-search {
  position: relative;
  margin-top: 40px;
  max-width: 360px;
}
.posts-search i {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--posts-muted);
  pointer-events: none;
}
.posts-search input {
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--posts-rule);
  padding: 10px 0 10px 28px;
  font-size: 15px;
  color: var(--posts-ink);
  background: transparent;
  outline: none;
  border-radius: 0;
  transition: border-color 0.25s ease;
}
.posts-search input:focus { border-bottom-color: var(--posts-accent); }
.posts-search:focus-within i { color: var(--posts-accent); }

/* list */
.posts-main { padding-bottom: 40px; }
.posts-status { color: var(--posts-muted); padding: 24px 0; }
.posts-status-error { color: var(--c-error); }
.posts-clear {
  border: 0;
  background: none;
  padding: 0;
  margin-left: 8px;
  font-weight: 600;
  color: var(--posts-accent);
  cursor: pointer;
}

.posts-year {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 0 24px;
  margin-bottom: 40px;
}
.posts-year-label {
  font-family: Poppins, sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--posts-muted);
  margin: 0;
  padding-top: 26px;
}
.posts-list { list-style: none; margin: 0; padding: 0; }
.posts-list li { border-top: 1px solid var(--posts-rule); }
.posts-list li:last-child { border-bottom: 1px solid var(--posts-rule); }

.posts-item {
  position: relative;
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 0 20px;
  padding: 24px 0;
  color: var(--posts-text);
}
.posts-item::before {
  /* accent line that draws across the row's top rule on hover */
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--posts-accent);
  /* revealed with clip-path, not scaleX: a transformed 1px line gets resampled and looks thinner */
  clip-path: inset(0 100% 0 0);
  transition: clip-path 0.45s ease;
}
.posts-item:hover,
.posts-item:focus-visible { color: var(--posts-text); text-decoration: none; }
.posts-item:hover::before,
.posts-item:focus-visible::before { clip-path: inset(0 0 0 0); }
.posts-item:focus-visible { outline: 2px solid var(--posts-accent); outline-offset: 4px; }

.posts-item-date {
  font-size: 13px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--posts-muted);
  padding-top: 4px;
}
.posts-item-title {
  font-family: Poppins, sans-serif;
  font-size: 21px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--posts-ink);
  margin: 0 0 8px;
  transition: color 0.25s ease;
}
.posts-item:hover .posts-item-title { color: var(--posts-accent); }
.posts-item-excerpt {
  font-size: 15px;
  line-height: 1.7;
  color: var(--posts-muted);
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.posts-item-meta {
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--posts-muted);
  margin: 0;
}

/* load more / end */
.posts-more { text-align: center; margin-top: 16px; }
.posts-more-btn {
  border: 1px solid var(--posts-rule);
  background: var(--c-bg);
  border-radius: 50px;
  padding: 11px 30px;
  font-size: 14px;
  font-weight: 600;
  color: var(--posts-ink);
  cursor: pointer;
  transition: border-color 0.25s ease, color 0.25s ease;
}
.posts-more-btn:hover:not(:disabled) { border-color: var(--posts-accent); color: var(--posts-accent); }
.posts-more-btn:disabled { opacity: 0.6; cursor: progress; }
.posts-end {
  text-align: center;
  font-size: 13px;
  color: var(--posts-muted);
  margin-top: 8px;
}

/* footer */
.posts-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 32px;
  padding-bottom: 40px;
  margin-top: 40px;
  border-top: 1px solid var(--posts-rule);
  font-size: 13px;
  color: var(--posts-muted);
}
.posts-footer a {
  font-weight: 600;
  color: var(--posts-ink);
  border-bottom: 1px solid var(--posts-rule);
  transition: color 0.25s ease, border-color 0.25s ease;
}
.posts-footer a:hover { color: var(--posts-accent); border-color: var(--posts-accent); text-decoration: none; }

@media (max-width: 767px) {
  .posts-hero { padding-top: 56px; padding-bottom: 32px; }
  .posts-title { font-size: 34px; }
  .posts-lead { font-size: 16px; }
  .posts-year { grid-template-columns: minmax(0, 1fr); }
  .posts-year-label { padding: 0 0 12px; }
  .posts-item { grid-template-columns: minmax(0, 1fr); gap: 6px; }
  .posts-item-date { padding-top: 0; }
  .posts-item-title { font-size: 19px; }
}
@media (prefers-reduced-motion: reduce) {
  .posts-item::before { transition: none; }
}
</style>
