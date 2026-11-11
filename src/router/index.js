import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Posts from '../pages/Posts.vue'
import Post from '../pages/Post.vue'
import Maintenance from '../pages/Maintenance.vue'
import NotFound from '../pages/NotFound.vue'

const routes = [
  { path: '/', component: Home },
  // posts: show the header but hide the footer and the left main navigation
  { path: '/posts', component: Posts, meta: { hideFooter: true, hideMainNav: true } },
  // individual post, by slug: hide both header and footer (legacy behaviour).
  // Old numeric links (/post/123) still work; the page swaps them for the slug URL.
  { path: '/post/:slug', name: 'post', component: Post, meta: { hideHeader: true, hideFooter: true } },
  { path: '/maintenance', component: Maintenance },
  // anything else: 404 (GitHub Pages serves index.html as 404.html, so deep links land here too)
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound, meta: { hideHeader: true, hideFooter: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  }
})

export default router
