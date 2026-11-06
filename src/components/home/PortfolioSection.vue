<template>
  <section id="portfolio" class="work section-bg">
    <div class="container">
      <div class="section-title"><h2>Portfolio</h2><p>Explore my web development portfolio here</p></div>

      <div class="work-filters" role="tablist" aria-label="Filter projects">
        <button v-for="f in filters" :key="f.value" type="button" role="tab"
                :class="['work-filter', { active: portfolioFilter === f.value }]"
                :aria-selected="portfolioFilter === f.value" @click="portfolioFilter = f.value">
          {{ f.label }}<sup class="work-filter-count">{{ countFor(f.value) }}</sup>
        </button>
      </div>

      <TransitionGroup tag="div" name="work-item" class="work-grid">
        <a v-for="item in filteredPortfolio" :key="item.title" :href="item.link" target="_blank" rel="noopener" class="work-card">
          <div class="work-card-media">
            <img :src="item.image" :alt="item.title" loading="lazy"/>
          </div>
          <div class="work-card-caption">
            <h3 class="work-card-title">{{ item.title }}</h3>
            <p class="work-card-tag">{{ labelFor(item.category) }}</p>
          </div>
        </a>
      </TransitionGroup>
    </div>
  </section>
</template>

<script>
// how far (as % of the image height) a screenshot travels while its card crosses the screen
const PARALLAX_SHIFT = 20

export default {
  name: 'PortfolioSection',
  data() {
    return {
      portfolioFilter: '*',
      filters: [
        { label: 'All', value: '*' },
        { label: 'WordPress', value: 'wordpress' },
        { label: 'CodeIgniter', value: 'codeigniter' },
        { label: 'Zend', value: 'zend' }
      ],
      portfolioItems: [
        { title: 'Football Careers', category: 'wordpress', link: 'https://www.footballcareers.com/', image: '/assets/img/portfolio/wordpress/football_careers.png' },
        { title: 'What Games', category: 'zend', link: 'https://what.games/', image: '/assets/img/portfolio/zend/what_games.png' },
        { title: 'Teleta', category: 'wordpress', link: 'https://www.teleta.co.uk/', image: '/assets/img/portfolio/wordpress/teleta.png' },
        { title: 'Blok Property', category: 'wordpress', link: 'https://www.blokpropertymanagement.co.uk/', image: '/assets/img/portfolio/wordpress/blok_property.png' },
        { title: 'Cameron Intellectual Property', category: 'wordpress', link: 'https://cameronintellectualproperty.com/', image: '/assets/img/portfolio/wordpress/cameron.png' },
        { title: 'Oxford Language Club', category: 'codeigniter', link: 'https://oxfordlanguageclub.com/', image: '/assets/img/portfolio/codeigniter/oxford_language.jpg' },
        { title: 'Scotch Galore', category: 'wordpress', link: 'https://scotchgalore.com/', image: '/assets/img/portfolio/wordpress/scotchgalore.png' },
        { title: 'Minion Rush', category: 'codeigniter', link: 'https://minionrush.com/', image: '/assets/img/portfolio/codeigniter/minion_rush.jpg' },
        { title: 'Gameloft', category: 'zend', link: 'https://gameloft.com/', image: '/assets/img/portfolio/zend/gameloft.jpeg' },
        { title: 'Asphalt Legends', category: 'zend', link: 'https://asphaltlegendsunite.com/', image: '/assets/img/portfolio/zend/asphaltlegendsunite.jpeg' },
        { title: 'Dragon Mania Legends', category: 'zend', link: 'https://dragonmanialegends.com/', image: '/assets/img/portfolio/zend/dragonmanialegends.jpeg' },
        { title: 'Naxos Music Box', category: 'wordpress', link: 'https://www.naxosmusicbox.com/', image: '/assets/img/portfolio/wordpress/naxosmusicbox.jpeg' },
        { title: 'Naxos Audiobooks', category: 'wordpress', link: 'https://naxosaudiobooks.com/', image: '/assets/img/portfolio/wordpress/naxosaudiobooks.jpeg' },
        { title: 'Gameloft IN', category: 'zend', link: '/projects/gameloft_in/', image: '/assets/img/portfolio/zend/gameloft_in.png' }
      ]
    }
  },
  computed: {
    filteredPortfolio() {
      return this.portfolioFilter === '*' ? this.portfolioItems : this.portfolioItems.filter(i => i.category === this.portfolioFilter)
    }
  },
  methods: {
    countFor(value) {
      return value === '*' ? this.portfolioItems.length : this.portfolioItems.filter(i => i.category === value).length
    },
    labelFor(category) {
      const f = this.filters.find(f => f.value === category)
      return f ? f.label : category
    },
    // parallax: as a card travels up the viewport, its screenshot slides up inside the frame
    requestParallax() {
      if (this._parallaxFrame) return
      this._parallaxFrame = requestAnimationFrame(() => {
        this._parallaxFrame = null
        this.updateParallax()
      })
    },
    updateParallax() {
      const vh = window.innerHeight
      const frames = this.$el.querySelectorAll('.work-card-media')
      frames.forEach((frame) => {
        const rect = frame.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > vh) return // off-screen: leave as is
        // 0 when the frame enters at the bottom, 1 when it leaves at the top
        const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)))
        frame.style.setProperty('--parallax', (-progress * PARALLAX_SHIFT).toFixed(2) + '%')
      })
    }
  },
  watch: {
    // re-measure after filtering re-arranges the grid (wait for the move animation)
    portfolioFilter() {
      this.$nextTick(() => {
        this.requestParallax()
        setTimeout(() => this.requestParallax(), 550)
      })
    }
  },
  mounted() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    this._parallaxOn = true
    window.addEventListener('scroll', this.requestParallax, { passive: true })
    window.addEventListener('resize', this.requestParallax)
    this.updateParallax()
  },
  beforeUnmount() {
    if (!this._parallaxOn) return
    window.removeEventListener('scroll', this.requestParallax)
    window.removeEventListener('resize', this.requestParallax)
    cancelAnimationFrame(this._parallaxFrame)
  }
}
</script>

<style>
.work {
  --work-ink: var(--c-ink);
  --work-muted: var(--c-muted);
  --work-rule: var(--c-rule);
  --work-accent: var(--c-accent);
}

/* filters: plain text tabs with an underline for the active one */
.work-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 28px;
  margin-bottom: 40px;
}
.work-filter {
  position: relative;
  border: 0;
  background: none;
  padding: 6px 0;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--work-muted);
  cursor: pointer;
  transition: color 0.25s ease;
}
.work-filter::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: var(--work-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s ease;
}
.work-filter:hover,
.work-filter.active { color: var(--work-ink); }
.work-filter.active::after { transform: scaleX(1); }
.work-filter:focus-visible { outline: 2px solid var(--work-accent); outline-offset: 4px; }
.work-filter-count {
  font-size: 10px;
  font-weight: 500;
  margin-left: 3px;
  color: var(--work-muted);
}

/* grid */
.work-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 48px 32px;
}
@media (max-width: 991px) { .work-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 575px) { .work-grid { grid-template-columns: minmax(0, 1fr); gap: 36px; } }

/* card: image + caption, no overlay, no shadow */
.work-card {
  display: block;
  color: var(--work-ink);
}
.work-card:hover,
.work-card:focus-visible { color: var(--work-ink); text-decoration: none; }
.work-card:focus-visible { outline: 2px solid var(--work-accent); outline-offset: 6px; }
.work-card-media {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 4px;
  background: var(--work-rule);
}
.work-card-media img {
  width: 100%;
  /* taller than the frame so there is room to slide (25% extra = 20% of the image) */
  height: 125%;
  object-fit: cover;
  /* screenshots: start at the top of the site (logo / hero) */
  object-position: top center;
  display: block;
  translate: 0 var(--parallax, 0%);
  will-change: translate;
  /* only the hover zoom is animated; the parallax follows the scroll directly */
  transform-origin: center 30%;
  transition: scale 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.work-card:hover .work-card-media img { scale: 1.04; }

.work-card-caption {
  padding-top: 16px;
  text-align: left;
}
.work-card-title {
  font-family: Poppins, sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.35;
  margin: 0 0 4px;
  color: var(--work-ink);
  transition: color 0.25s ease;
}
.work-card-tag {
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--work-muted);
  margin: 0;
}
.work-card:hover .work-card-title { color: var(--work-accent); }

/* filter animation: new items fade up, remaining items glide to their new spot */
.work-item-move { transition: transform 0.5s cubic-bezier(0.65, 0, 0.35, 1); }
.work-item-enter-active { transition: opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s; }
.work-item-enter-from { opacity: 0; transform: translateY(12px); }
.work-item-leave-active { display: none; }

@media (prefers-reduced-motion: reduce) {
  .work-item-move,
  .work-item-enter-active,
  .work-card-media img,
  .work-filter::after { transition: none; }
}
</style>
