<template>
  <nav class="blog-topbar" aria-label="Site">
    <div class="blog-topbar-inner">
      <router-link to="/" class="blog-topbar-brand">Jhed Mendoza</router-link>
      <div class="blog-topbar-actions">
        <router-link :to="backTo" class="blog-topbar-back"><i class="bx bx-left-arrow-alt" aria-hidden="true"></i> {{ backLabel }}</router-link>
        <ThemeToggle />
      </div>
    </div>
    <div v-if="progress !== null" class="blog-topbar-progress" :style="{ transform: `scaleX(${progress})` }" aria-hidden="true"></div>
  </nav>
</template>

<script>
import ThemeToggle from '../ThemeToggle.vue'

export default {
  name: 'BlogTopbar',
  components: { ThemeToggle },
  props: {
    backTo: { type: [String, Object], default: '/' },
    backLabel: { type: String, default: 'Home' },
    // 0–1 reading progress; null hides the bar
    progress: { type: Number, default: null }
  }
}
</script>

<style>
.blog-topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--c-topbar);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--c-rule);
}
.blog-topbar-inner {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}
.blog-topbar-brand {
  font-family: Poppins, sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: var(--c-ink);
}
.blog-topbar-brand:hover { color: var(--c-accent); text-decoration: none; }
.blog-topbar-actions { display: flex; align-items: center; gap: 12px; margin-right: -10px; }
.blog-topbar-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-muted);
  transition: color 0.25s ease;
}
.blog-topbar-back i { font-size: 18px; transition: transform 0.25s ease; }
.blog-topbar-back:hover { color: var(--c-accent); text-decoration: none; }
.blog-topbar-back:hover i { transform: translateX(-3px); }
.blog-topbar-progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: var(--c-accent);
  transform-origin: left;
}
@media (prefers-reduced-motion: reduce) {
  .blog-topbar-back i { transition: none; }
}
</style>
