<template>
  <section id="portfolio" class="work section-bg">
    <div class="container">
      <div class="section-title"><h2>Portfolio</h2><p>Explore my web development portfolio here</p></div>

      <!-- Isotope masonry layout -->
      <div ref="grid" class="work-grid">
        <div class="work-sizer" aria-hidden="true"></div>
        <div class="work-gutter" aria-hidden="true"></div>

        <a v-for="item in portfolioItems" :key="item.title" :href="item.link" target="_blank" rel="noopener"
           class="work-card">
          <!-- real screenshot proportions, so the layout is right before the images load -->
          <div class="work-card-media" :style="{ aspectRatio: item.w + ' / ' + item.h }">
            <img :src="item.image" :alt="item.title" :width="item.w" :height="item.h" loading="lazy"/>
            <!-- project name, revealed on hover (always shown on touch screens) -->
            <div class="work-card-caption">
              <h3 class="work-card-title">{{ item.title }}</h3>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<script>
import Isotope from 'isotope-layout'

// how far (as % of the image height) a screenshot travels while its card crosses the screen
const PARALLAX_SHIFT = 20

export default {
  name: 'PortfolioSection',
  data() {
    return {
      // w/h = the screenshot's pixel size (keeps the masonry stable while images load)
      portfolioItems: [
        { title: 'Football Careers', link: 'https://www.footballcareers.com/', image: '/assets/img/portfolio/wordpress/football_careers.png', w: 1441, h: 703 },
        { title: 'What Games', link: 'https://what.games/', image: '/assets/img/portfolio/zend/what_games.png', w: 1609, h: 730 },
        { title: 'Teleta', link: 'https://www.teleta.co.uk/', image: '/assets/img/portfolio/wordpress/teleta.png', w: 490, h: 742 },
        { title: 'Blok Property', link: 'https://www.blokpropertymanagement.co.uk/', image: '/assets/img/portfolio/wordpress/blok_property.png', w: 1411, h: 703 },
        { title: 'Cameron Intellectual Property', link: 'https://cameronintellectualproperty.com/', image: '/assets/img/portfolio/wordpress/cameron.png', w: 718, h: 814 },
        { title: 'Oxford Language Club', link: 'https://oxfordlanguageclub.com/', image: '/assets/img/portfolio/codeigniter/oxford_language.jpg', w: 930, h: 1024 },
        { title: 'Scotch Galore', link: 'https://scotchgalore.com/', image: '/assets/img/portfolio/wordpress/scotchgalore.png', w: 1525, h: 745 },
        { title: 'Minion Rush', link: 'https://minionrush.com/', image: '/assets/img/portfolio/codeigniter/minion_rush.jpg', w: 1280, h: 1200 },
        { title: 'Gameloft', link: 'https://gameloft.com/', image: '/assets/img/portfolio/zend/gameloft.jpeg', w: 1609, h: 730 },
        { title: 'Asphalt Legends', link: 'https://asphaltlegendsunite.com/', image: '/assets/img/portfolio/zend/asphaltlegendsunite.jpeg', w: 1609, h: 730 },
        { title: 'Dragon Mania Legends', link: 'https://dragonmanialegends.com/', image: '/assets/img/portfolio/zend/dragonmanialegends.jpeg', w: 1280, h: 1200 },
        { title: 'Naxos Music Box', link: 'https://www.naxosmusicbox.com/', image: '/assets/img/portfolio/wordpress/naxosmusicbox.jpeg', w: 1920, h: 1080 },
        { title: 'Naxos Audiobooks', link: 'https://naxosaudiobooks.com/', image: '/assets/img/portfolio/wordpress/naxosaudiobooks.jpeg', w: 1920, h: 1080 },
        { title: 'Gameloft IN', link: '/projects/gameloft_in/', image: '/assets/img/portfolio/zend/gameloft_in.png', w: 1816, h: 867 }
      ]
    }
  },
  methods: {
    // parallax: as a card travels up the viewport, its screenshot slides up inside the frame
    requestParallax() {
      if (this.reduced || this._parallaxFrame) return
      this._parallaxFrame = requestAnimationFrame(() => {
        this._parallaxFrame = null
        this.updateParallax()
      })
    },
    updateParallax() {
      const vh = window.innerHeight
      this.$el.querySelectorAll('.work-card-media').forEach((frame) => {
        const rect = frame.getBoundingClientRect()
        if (rect.height === 0 || rect.bottom < 0 || rect.top > vh) return // hidden or off-screen
        // 0 when the frame enters at the bottom, 1 when it leaves at the top
        const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)))
        frame.style.setProperty('--parallax', (-progress * PARALLAX_SHIFT).toFixed(2) + '%')
      })
    }
  },
  mounted() {
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    this.iso = new Isotope(this.$refs.grid, {
      itemSelector: '.work-card',
      percentPosition: true,
      masonry: { columnWidth: '.work-sizer', gutter: '.work-gutter' },
      transitionDuration: this.reduced ? 0 : '0.5s'
    })
    // re-measure parallax once Isotope finishes moving things (e.g. after a resize)
    this.iso.on('layoutComplete', () => this.requestParallax())

    // caption heights can change once web fonts arrive
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this.iso && this.iso.layout())

    if (this.reduced) return
    window.addEventListener('scroll', this.requestParallax, { passive: true })
    window.addEventListener('resize', this.requestParallax)
    this.updateParallax()
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.requestParallax)
    window.removeEventListener('resize', this.requestParallax)
    cancelAnimationFrame(this._parallaxFrame)
    if (this.iso) { this.iso.destroy(); this.iso = null }
  }
}
</script>

<style>
.work {
  --work-ink: var(--c-ink);
  --work-muted: var(--c-muted);
  --work-rule: var(--c-rule);
  --work-accent: var(--c-accent);
  --work-gap: 16px;
  --work-cols: 3;
}
@media (max-width: 991px) { .work { --work-cols: 2; } }
@media (max-width: 575px) { .work { --work-cols: 1; --work-gap: 12px; } }

/* masonry grid (Isotope): column width + gutter come from these two hidden elements */
.work-grid { position: relative; }
.work-sizer,
.work-card { width: calc((100% - (var(--work-cols) - 1) * var(--work-gap)) / var(--work-cols)); }
.work-gutter { width: var(--work-gap); }

/* card: image + caption, no overlay, no shadow */
.work-card {
  display: block;
  margin-bottom: var(--work-gap);
  color: var(--work-ink);
}
.work-card:hover,
.work-card:focus-visible { color: var(--work-ink); text-decoration: none; }
.work-card:focus-visible { outline: 2px solid var(--work-accent); outline-offset: 6px; }
.work-card-media {
  position: relative;
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

/* caption overlay: hidden until hover/focus, slides up over a soft gradient */
.work-card-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 48px 18px 16px;
  text-align: left;
  background: linear-gradient(to top, rgba(10, 12, 16, 0.82), rgba(10, 12, 16, 0.45) 55%, transparent);
  opacity: 0;
  translate: 0 10px;
  transition: opacity 0.3s ease, translate 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
  pointer-events: none;
}
.work-card:hover .work-card-caption,
.work-card:focus-visible .work-card-caption { opacity: 1; translate: 0 0; }
.work-card-title {
  font-family: Poppins, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.35;
  margin: 0;
  color: #fff;
}
/* touch screens can't hover: keep the label visible */
@media (hover: none) {
  .work-card-caption { opacity: 1; translate: 0 0; }
}

@media (prefers-reduced-motion: reduce) {
  .work-card-media img,
  .work-card-caption { transition: none; }
}
</style>
