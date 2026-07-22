<template>
  <div class="post-page">
    <header class="masthead" :style="post ? { backgroundImage: 'url(' + post.featured_image + ')' } : {}">
      <div class="container"><h1>{{ post ? post.title : 'Loading...' }}</h1><span v-if="post">{{ post.date }}</span></div>
    </header>
    <article class="mb-4 container">
      <div v-if="isLoading" class="text-center">Loading post...</div>
      <div v-else-if="error" class="text-center text-danger">{{ error }}</div>
      <div v-else v-html="post.content"></div>
    </article>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data(){ return { post:null, isLoading:true, error:'' } },
  methods:{
    getPostId(){ return new URLSearchParams(window.location.search).get('postId') },
    async fetchPost(id){
      try{
        const res = await axios.get(`https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts/${id}`, { timeout: 8000 })
        const data = res.data
        this.post = { title: data.title, content: data.content, date: new Date(data.date).toISOString().split('T')[0], featured_image: data.featured_image }
        document.title = data.title
      } catch(e){
        console.error('Post fetch error', e)
        this.error='Unable to load this post.'
      } finally{ this.isLoading=false }
    }
  },
  mounted(){ const id=this.getPostId(); if(id) this.fetchPost(id); else this.error='No post specified.' }
}
</script>
