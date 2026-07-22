<template>
  <div class="posts-page">


    <div id="header" class="d-flex flex-column justify-content-center">
      <nav class="nav-menu">
        <ul>
          <li><a href="/"><i class="bx bx-home"></i> <span>Home</span></a></li>
        </ul>
      </nav>
    </div>

    <header class="masthead">
        <div class="container position-relative px-4 px-lg-5">
            <div class="row gx-4 gx-lg-5 justify-content-center">
                <div class="col-md-10 col-lg-8 col-xl-7">
                    <div class="post-heading"></div>
                </div>
            </div>
        </div>
    </header>

    <div class="container px-4 px-lg-5">
      <div v-if="isLoading" class="text-center">Loading posts...</div>
      <div v-else-if="error" class="text-center text-danger">{{ error }}</div>
      <div class="row gx-4 gx-lg-5 justify-content-center" v-else>
        <div v-for="post in posts" :key="post.post_id" class="col-md-10 col-lg-8 col-xl-7 posts-contenter">
          <router-link :to="{ name: 'post', params: { postId: post.post_id, slug: post.slug } }"><h2>{{ post.title }}</h2><p>{{ post.excerpt }}</p></router-link>
          <p class="post-meta">Posted on {{ post.date }}</p>
        </div>
      </div>
    </div>
  </div>


</template>

<script>
import axios from 'axios'
export default {
  data() { return { posts: [], post: null, isLoading:true, error: '' } },
  methods: {
    stripTags(html){ const d=document.createElement('div'); d.innerHTML=html; return d.textContent||d.innerText||'' },
    ensureLink(href, id){
      if (!href) return null
      // avoid adding duplicates
      let existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(l => l.href && l.href.indexOf(href) !== -1)
      if (existing) return existing
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      if (id) link.setAttribute('data-injected-by', id)
      document.head.appendChild(link)
      return link
    },
    removeInjectedLink(id){
      if (!id) return
      const el = document.head.querySelector('link[data-injected-by="'+id+'"]')
      if (el) el.parentNode.removeChild(el)
    },
    async fetchPosts(){
      try{
        const res = await axios.get('https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts', { timeout: 8000 })
        const data = res.data
        if (Array.isArray(data.posts) && data.posts.length) {
          this.posts = data.posts.map(p => ({ post_id: p.ID, title: p.title, slug: p.slug, excerpt: this.stripTags(p.excerpt), date: new Date(p.date).toISOString().split('T')[0] }))
        } else {
          this.error = 'No posts found.'
        }
      } catch (e) {
        console.error('Posts fetch error', e)
        this.error='Unable to load posts.'
      } finally{ this.isLoading=false }
    }
  },
  async mounted() {
    this._postCssLink = this.ensureLink('/assets/css/post.css', 'posts')

    await this.fetchPosts()
  },
  beforeUnmount(){
    // remove injected stylesheet to avoid leaking styles to other pages
    this.removeInjectedLink('posts')
  }
}
</script>
