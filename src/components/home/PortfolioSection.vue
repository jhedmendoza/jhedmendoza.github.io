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
            <div>
              <h3 class="work-card-title">{{ item.title }}</h3>
              <p class="work-card-tag">{{ labelFor(item.category) }}</p>
            </div>
            <i class="bx bx-right-top-arrow-circle work-card-arrow" aria-hidden="true"></i>
          </div>
        </a>
      </TransitionGroup>
    </div>
  </section>
</template>

<script>
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
    }
  }
}
</script>

<style>
.work {
  --work-ink: #272829;
  --work-muted: #7b858f;
  --work-rule: #e4e8ec;
  --work-accent: #0563bb;
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
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 4px;
  background: var(--work-rule);
}
.work-card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* screenshots: keep the top of the site (logo / hero) in frame */
  object-position: top center;
  display: block;
  transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.work-card:hover .work-card-media img { transform: scale(1.04); }

.work-card-caption {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
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
.work-card-arrow {
  font-size: 22px;
  color: var(--work-muted);
  flex-shrink: 0;
  transition: color 0.25s ease, transform 0.25s ease;
}
.work-card:hover .work-card-title,
.work-card:hover .work-card-arrow { color: var(--work-accent); }
.work-card:hover .work-card-arrow { transform: translate(2px, -2px); }

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
