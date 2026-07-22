<template>
  <div id="header" class="d-flex flex-column justify-content-center">
      <nav class="nav-menu">
        <ul>
          <li><a href="/"><i class="bx bx-home"></i> <span>Home</span></a></li>
        </ul>
      </nav>
  </div>
  <!-- Page Header-->
  <header class="masthead" :style="post ? { backgroundImage: 'url(' + post.featured_image + ')' } : {}">
      <div class="container position-relative px-4 px-lg-5">
          <div class="row gx-4 gx-lg-5 justify-content-center">
              <div class="col-md-10 col-lg-8 col-xl-7">
                  <div class="post-heading">
                      <h1>{{ post ? post.title : 'Loading...' }}</h1>
                      <span class="meta">
                          <span class="date-posted">{{ post ? post.date : '' }}</span>
                      </span>
                  </div>
              </div>
          </div>
      </div>
  </header>
  <!-- Post Content-->
  <article class="mb-4">
      <div class="container px-4 px-lg-5">
          <div class="row gx-4 gx-lg-5 justify-content-center">
              <div class="col-md-10 col-lg-8 col-xl-7 main-content" v-html="post ? post.content : ''"></div>
          </div>
      </div>
  </article>

</template>

<script>
import axios from 'axios'
export default {
  data(){ return { post:null, isLoading:true, error:'' } },
  methods:{
    getPostId(){ return new URLSearchParams(window.location.search).get('postId') },
    ensureLink(href, rel = 'stylesheet'){
      if (!href) return
      const exists = Array.from(document.querySelectorAll('link')).some(l => l.href && l.href.indexOf(href) !== -1)
      if (!exists){
        const link = document.createElement('link')
        link.rel = rel
        link.href = href
        document.head.appendChild(link)
      }
    },
    ensureScript(src, opts = {}){
      if (!src) return
      const exists = Array.from(document.querySelectorAll('script')).some(s => s.src && s.src.indexOf(src) !== -1)
      if (!exists){
        const s = document.createElement('script')
        if (opts.async) s.async = true
        s.src = src
        document.head.appendChild(s)
      }
    },
    setMeta(name, content, useProperty = false){
      if (!name) return
      let selector = useProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let el = document.head.querySelector(selector)
      if (!el){
        el = document.createElement('meta')
        if (useProperty) el.setAttribute('property', name); else el.setAttribute('name', name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content || '')
    },
    async fetchPost(id){
      try{
        const res = await axios.get(`https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts/${id}`, { timeout: 8000 })
        const data = res.data
        this.post = { title: data.title, content: data.content, date: new Date(data.date).toISOString().split('T')[0], featured_image: data.featured_image, excerpt: data.excerpt || '' }
        // set document title
        document.title = data.title || document.title

        // update head metadata to match the original static head (Vue way)
        this.setMeta('description', this.stripTags(data.excerpt || '').slice(0, 160))
        this.setMeta('og:type', 'website', true)
        this.setMeta('og:url', window.location.href, true)
        this.setMeta('og:title', data.title || '', true)
        this.setMeta('og:description', this.stripTags(data.excerpt || '').slice(0, 160), true)
        this.setMeta('og:image', data.featured_image || '', true)

      } catch(e){
        console.error('Post fetch error', e)
        this.error='Unable to load this post.'
      } finally{ this.isLoading=false }
    },
        stripTags(html){ const d=document.createElement('div'); d.innerHTML=html; return d.textContent||d.innerText||'' },
        ensureLink(href, id){
          if (!href) return null
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
        } 
  },
  async mounted(){
    // ensure the head contains the same assets the original post.html expected
    // (fonts, icon fonts, vendor css). Use import.meta.env.BASE_URL to construct local paths.
    const base = import.meta.env.BASE_URL || '/'
    // external google fonts (kept as in original)
    this.ensureLink('https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic', 'stylesheet')
    this.ensureLink('https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800', 'stylesheet')
    // vendor css (icofont, boxicons)
    this.ensureLink(base + 'assets/vendor/icofont/icofont.min.css')
    this.ensureLink(base + 'assets/vendor/boxicons/css/boxicons.min.css')
    // core styles (style.css is already in index.html but ensure presence)
    this.ensureLink(base + 'assets/css/style.css')
    // inject post.css for this route and keep a reference so it can be removed on unmount
    this._postCssLink = this.ensureLink(base + 'assets/css/post.css', 'post')

    // Google Analytics snippet - ensure the gtag script is present (it may also be included in index.html)
    this.ensureScript('https://www.googletagmanager.com/gtag/js?id=G-0NLZQXYM5H', { async: true })
    // inject small config snippet only if gtag not yet configured
    if (!window.gtag){
      window.dataLayer = window.dataLayer || []
      window.gtag = function(){ window.dataLayer.push(arguments) }
      window.gtag('js', new Date())
      window.gtag('config', 'G-0NLZQXYM5H')
    }

    // prefer route param (SPA) but fall back to legacy query param
    const idFromRoute = this.$route && this.$route.params && this.$route.params.postId
    const id = idFromRoute || this.getPostId()
    if (id) {
      await this.fetchPost(id)
    } else {
      this.error = 'No post specified.'
      this.isLoading = false
    }
  },
  beforeUnmount(){
    // remove injected stylesheet to avoid leaking styles to other pages
    try{ this.removeInjectedLink && this.removeInjectedLink('post') } catch(e){}
  },
  watch: {
    // react to route changes when navigating between posts
    '$route.params.postId'(newId, oldId) {
      if (newId && newId !== oldId) {
        this.isLoading = true
        this.fetchPost(newId)
      }
    }
  }
}
</script>
