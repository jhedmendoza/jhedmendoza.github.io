"use strict";
const { createApp } = Vue;
createApp({
  data() {
    return {
      posts: [],
      post: null,
      isLoading: true,
      error: "",
      pageType: "list"
    };
  },
  methods: {
    stripTags(html) {
      const temporary = document.createElement("div");
      temporary.innerHTML = html;
      return temporary.textContent || temporary.innerText || "";
    },
    async fetchPosts() {
      const API_URL = "https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts";
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.posts) {
          this.posts = data.posts.map((post) => ({
            post_id: post.ID,
            title: post.title,
            slug: post.slug,
            excerpt: this.stripTags(post.excerpt),
            date: new Date(post.date).toISOString().split("T")[0]
          }));
        }
      } catch (error) {
        console.error(error);
        this.error = "Unable to load posts. Please refresh the page.";
      } finally {
        this.isLoading = false;
      }
    },
    async fetchPost(postId) {
      const API_URL = `https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts/${postId}`;
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        this.post = {
          title: data.title,
          content: data.content,
          date: new Date(data.date).toISOString().split("T")[0],
          featured_image: data.featured_image,
          excerpt: this.stripTags(data.excerpt)
        };
        document.title = data.title;
        const titleMeta = document.querySelector('meta[name="title"]');
        const descriptionMeta = document.querySelector('meta[name="description"]');
        const imageMeta = document.querySelector('meta[name="image"]');
        if (titleMeta) titleMeta.content = data.title;
        if (descriptionMeta) descriptionMeta.content = this.post.excerpt;
        if (imageMeta) imageMeta.content = data.featured_image;
      } catch (error) {
        console.error(error);
        this.error = "Unable to load this post. Please try again later.";
      } finally {
        this.isLoading = false;
      }
    },
    getPostIdFromUrl() {
      return new URLSearchParams(window.location.search).get("postId");
    }
  },
  mounted() {
    const postId = this.getPostIdFromUrl();
    if (postId) {
      this.pageType = "detail";
      this.fetchPost(postId);
    } else {
      this.pageType = "list";
      this.fetchPosts();
    }
  }
}).mount("#blog-app");
