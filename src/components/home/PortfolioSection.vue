<template>
  <section id="portfolio" class="portfolio section-bg">
    <div class="container">
      <div class="section-title"><h2>Portfolio</h2><p>Explore my web development portfolio here</p></div>
      <div class="row">
        <div class="col-lg-12 d-flex justify-content-center">
          <ul id="portfolio-flters">
            <li v-for="f in filters" :key="f.value" :class="{ 'filter-active': portfolioFilter === f.value }" @click.prevent="setFilter(f.value)">{{ f.label }}</li>
          </ul>
        </div>
      </div>
      <div ref="container" class="row portfolio-container">
        <div v-for="item in filteredPortfolio" :key="item.title" :class="['col-lg-4 col-md-6 portfolio-item', item.category]">
          <div class="portfolio-wrap">
            <img :src="item.image" class="img-fluid" :alt="item.title"/>
            <div class="portfolio-info"><h4>{{ item.title }}</h4><div class="portfolio-links"><a :href="item.link" target="_blank"><i class="bx bx-link"></i></a></div></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
const loadScript = (src) => new Promise((resolve, reject) => {
  const s = document.createElement('script')
  s.src = src
  s.onload = resolve
  s.onerror = reject
  document.body.appendChild(s)
})

// wait for all images inside a container to load (fallback when imagesLoaded is unavailable)
const waitForImages = (container) => new Promise((resolve) => {
  if (!container) return resolve()
  const imgs = Array.from(container.querySelectorAll('img'))
  if (!imgs.length) return resolve()
  let loaded = 0
  const check = () => { loaded++; if (loaded >= imgs.length) resolve() }
  imgs.forEach((img) => {
    if (img.complete && img.naturalHeight !== 0) return check()
    const onLoad = () => { img.removeEventListener('load', onLoad); img.removeEventListener('error', onLoad); check() }
    img.addEventListener('load', onLoad)
    img.addEventListener('error', onLoad)
    // safety timeout per image
    setTimeout(onLoad, 3000)
  })
})

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
        { title: 'Gameloft IN', category: 'zend', link: 'https://jhedmendoza.is-a.dev/projects/gameloft_in', image: '/assets/img/portfolio/zend/gameloft_in.png' }
      ]
    }
  },
  computed: {
    filteredPortfolio() {
      return this.portfolioFilter === '*' ? this.portfolioItems : this.portfolioItems.filter(i => i.category === this.portfolioFilter)
    }
  },
  methods: {
    arrange(filter) {
      const filterVal = filter === '*' ? '*' : '.' + filter
      try { this._iso.reloadItems() } catch (e) {}
      this._iso.arrange({ filter: filterVal })
      this._iso.layout()
    },
    async setFilter(f) {
      this.portfolioFilter = f
      // apply isotope filter if available, but wait for images to be loaded to avoid collapsed heights
      try {
        if (this._iso) {
          const container = this.$refs.container
          if (window.imagesLoaded && container) {
            window.imagesLoaded(container, () => this.arrange(f))
          } else {
            await waitForImages(container)
            this.arrange(f)
          }
        }
      } catch (e) {
        console.warn('Isotope arrange failed', e)
      }
    }
  },
  async mounted() {
    // Initialize Isotope for portfolio filtering/layout
    try {
      const base = import.meta.env.BASE_URL || '/'
      if (!window.Isotope) {
        await loadScript(base + 'assets/vendor/isotope-layout/isotope.pkgd.min.js')
      }
      // load imagesLoaded from CDN if available for robust layout handling
      if (!window.imagesLoaded) {
        try {
          await loadScript('https://unpkg.com/imagesloaded@4/imagesloaded.pkgd.min.js')
        } catch (e) {
          // ignore - we'll fall back to manual waiting
        }
      }

      const container = this.$refs.container
      // wait for images to load before initializing
      if (window.imagesLoaded && container) {
        await new Promise((resolve) => window.imagesLoaded(container, resolve))
      } else {
        await waitForImages(container)
      }

      if (container && window.Isotope) {
        this._iso = new window.Isotope(container, {
          itemSelector: '.portfolio-item',
          layoutMode: 'masonry',
          percentPosition: true,
          masonry: { columnWidth: '.portfolio-item' },
          transitionDuration: '0.45s',
          stagger: 40,
          visibleStyle: { opacity: 1, transform: 'translateY(0)' },
          hiddenStyle: { opacity: 0, transform: 'translateY(20px)' }
        })
        // apply initial filter once images are laid out
        const doArrange = () => this.arrange(this.portfolioFilter)
        if (window.imagesLoaded) window.imagesLoaded(container, doArrange); else doArrange()
      }
    } catch (err) {
      console.warn('Isotope init failed', err)
    }
  },
  beforeUnmount() {
    if (this._iso) {
      try { this._iso.destroy() } catch (e) {}
      this._iso = null
    }
  }
}
</script>
