import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Posts from '../pages/Posts.vue'
import Post from '../pages/Post.vue'
import PortfolioDetails from '../pages/PortfolioDetails.vue'
import Maintenance from '../pages/Maintenance.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/posts', component: Posts },
  { path: '/post', component: Post },
  { path: '/portfolio-details', component: PortfolioDetails },
  { path: '/maintenance', component: Maintenance }
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
