<template>
  <div class="posts-page">
    <header class="masthead">
      <div class="container"><h1>Blog List</h1><span>Latest posts from my blog</span></div>
    </header>
    <div class="container">
      <div v-if="isLoading" class="text-center">Loading posts...</div>
      <div v-else-if="error" class="text-center text-danger">{{ error }}</div>
      <div v-else>
        <div v-for="post in posts" :key="post.post_id" class="post-preview">
          <a :href="`/post.html?slug=${post.slug}&postId=${post.post_id}`"><h2>{{ post.title }}</h2><p>{{ post.excerpt }}</p></a>
          <p class="post-meta">Posted on {{ post.date }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() { return { posts: [], post: null, isLoading:true, error: '' } },
  methods: {
    stripTags(html){ const d=document.createElement('div'); d.innerHTML=html; return d.textContent||d.innerText||'' },
    async fetchPosts(){ try{ const res=await fetch('https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts'); const data=await res.json(); if(data.posts) this.posts=data.posts.map(p=>({ post_id:p.ID, title:p.title, slug:p.slug, excerpt:this.stripTags(p.excerpt), date:new Date(p.date).toISOString().split('T')[0] })); }catch(e){ this.error='Unable to load posts.' } finally{ this.isLoading=false } }
  },
  mounted(){ this.fetchPosts() }
}
</script>
