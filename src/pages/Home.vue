<template>
  <div>
    <section id="hero" class="d-flex flex-column justify-content-center">
      <div id="particles-js" aria-hidden="true"></div>
      <div class="container">
        <h1>Jhed Mendoza</h1>
        <p>I'm <span class="typed">{{ typedText }}</span></p>
        <div class="social-links">
          <a href="https://twitter.com/_jhedm" target="_blank" class="twitter"><i class="bx bxl-twitter"></i></a>
          <a href="https://www.instagram.com/jhedmendoza/" target="_blank" class="instagram"><i class="bx bxl-instagram"></i></a>
          <a href="https://www.linkedin.com/in/jhedmendoza/" target="_blank" class="linkedin"><i class="bx bxl-linkedin"></i></a>
        </div>
      </div>
    </section>

    <main id="main">
      <section id="news" class="services">
        <div class="container">
          <div class="section-title"><h2>Blog</h2></div>
          <div class="row">
            <div v-if="isLoadingPosts" class="col-12 text-center">Loading latest posts...</div>
            <div v-else-if="postsError" class="col-12 text-danger">{{ postsError }}</div>
            <div v-else class="row">
              <div v-for="post in posts" :key="post.post_id" class="col-lg-4 col-md-6 d-flex align-items-stretch" data-aos="zoom-in">
                <a :href="`/post.html?slug=${post.post_slug}&postId=${post.post_id}`" class="icon-box w-100">
                  <div class="icon"><i class="bx bx-file"></i></div>
                  <p class="news-date mb-0 float-right">{{ post.post_date }}</p>
                  <h4>{{ post.post_title }}</h4>
                  <p>{{ post.post_exerpt }}</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="portfolio" class="portfolio section-bg">
        <div class="container">
          <div class="section-title"><h2>Portfolio</h2><p>Explore my web development portfolio here</p></div>
          <div class="row">
            <div class="col-lg-12 d-flex justify-content-center">
              <ul id="portfolio-flters">
                <li :class="{ 'filter-active': portfolioFilter === '*' }" @click.prevent="setFilter('*')">All</li>
                <li :class="{ 'filter-active': portfolioFilter === 'wordpress' }" @click.prevent="setFilter('wordpress')">WordPress</li>
                <li :class="{ 'filter-active': portfolioFilter === 'codeigniter' }" @click.prevent="setFilter('codeigniter')">CodeIgniter</li>
                <li :class="{ 'filter-active': portfolioFilter === 'zend' }" @click.prevent="setFilter('zend')">Zend</li>
              </ul>
            </div>
          </div>
          <div class="row portfolio-container">
            <div v-for="item in filteredPortfolio" :key="item.title" :class="['col-lg-4 col-md-6 portfolio-item', item.category]">
              <div class="portfolio-wrap">
                <img :src="item.image" class="img-fluid" :alt="item.title"/>
                <div class="portfolio-info"><h4>{{ item.title }}</h4><div class="portfolio-links"><a :href="item.link" target="_blank"><i class="bx bx-link"></i></a></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" class="contact">
        <div class="container">
          <div class="section-title"><h2>Send me a message</h2></div>
          <div class="row mt-1">
            <div class="col-lg-4"> <div class="info"><div class="address"><i class="icofont-google-map"></i><h4>Location:</h4><p>Bacoor Cavite, 4102</p></div><div class="email"><i class="icofont-envelope"></i><h4>Email:</h4><p>jhed.adrine@gmail.com</p></div></div></div>
            <div class="col-lg-8 mt-5 mt-lg-0">
              <form @submit.prevent="submitContact">
                <div class="form-row">
                  <div class="col-md-6 form-group"><input v-model="contact.name" type="text" class="form-control" placeholder="Your Name"/></div>
                  <div class="col-md-6 form-group"><input v-model="contact.email" type="email" class="form-control" placeholder="Your Email"/></div>
                </div>
                <div class="form-group"><textarea v-model="contact.message" class="form-control" rows="5" placeholder="Message"></textarea></div>
                <div class="mb-3" v-if="contactFeedback"><div :class="contactStatus === 'error' ? 'text-danger' : 'text-success'">{{ contactFeedback }}</div></div>
                <div><button class="btn send-btn" :disabled="contactStatus==='sending'">{{ contactStatus==='sending' ? 'Sending...' : 'Send' }}</button></div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      typedItems: ['a Web Developer', 'a Freelancer', 'a Dreamer', 'a Father'],
      typedText: '',
      typedIndex: 0,
      charIndex: 0,
      isDeleting: false,
      portfolioFilter: '*',
      posts: [],
      isLoadingPosts: true,
      postsError: '',
      contact: { name: '', email: '', message: '' },
      contactStatus: 'idle',
      contactFeedback: '',
      activeSection: 'hero',
      portfolioItems: [
        { title: 'Football Careers', category: 'wordpress', link: 'https://www.footballcareers.com/', image: new URL('../../assets/img/portfolio/wordpress/football_careers.png', import.meta.url).href },
        { title: 'What Games', category: 'zend', link: 'https://what.games/', image: new URL('../../assets/img/portfolio/zend/what_games.png', import.meta.url).href },
        { title: 'Teleta', category: 'wordpress', link: 'https://www.teleta.co.uk/', image: new URL('../../assets/img/portfolio/wordpress/teleta.png', import.meta.url).href },
        { title: 'Blok Property', category: 'wordpress', link: 'https://www.blokpropertymanagement.co.uk/', image: new URL('../../assets/img/portfolio/wordpress/blok_property.png', import.meta.url).href },
        { title: 'Cameron Intellectual Property', category: 'wordpress', link: 'https://cameronintellectualproperty.com/', image: new URL('../../assets/img/portfolio/wordpress/cameron.png', import.meta.url).href },
        { title: 'Oxford Language Club', category: 'codeigniter', link: 'https://oxfordlanguageclub.com/', image: new URL('../../assets/img/portfolio/codeigniter/oxford_language.jpg', import.meta.url).href },
        { title: 'Scotch Galore', category: 'wordpress', link: 'https://scotchgalore.com/', image: new URL('../../assets/img/portfolio/wordpress/scotchgalore.png', import.meta.url).href },
        { title: 'Minion Rush', category: 'codeigniter', link: 'https://minionrush.com/', image: new URL('../../assets/img/portfolio/codeigniter/minion_rush.jpg', import.meta.url).href },
        { title: 'Gameloft', category: 'zend', link: 'https://gameloft.com/', image: new URL('../../assets/img/portfolio/zend/gameloft.jpeg', import.meta.url).href },
        { title: 'Asphalt Legends', category: 'zend', link: 'https://asphaltlegendsunite.com/', image: new URL('../../assets/img/portfolio/zend/asphaltlegendsunite.jpeg', import.meta.url).href },
        { title: 'Dragon Mania Legends', category: 'zend', link: 'https://dragonmanialegends.com/', image: new URL('../../assets/img/portfolio/zend/dragonmanialegends.jpeg', import.meta.url).href },
        { title: 'Naxos Music Box', category: 'wordpress', link: 'https://www.naxosmusicbox.com/', image: new URL('../../assets/img/portfolio/wordpress/naxosmusicbox.jpeg', import.meta.url).href },
        { title: 'Naxos Audiobooks', category: 'wordpress', link: 'https://naxosaudiobooks.com/', image: new URL('../../assets/img/portfolio/wordpress/naxosaudiobooks.jpeg', import.meta.url).href },
        { title: 'Gameloft IN', category: 'zend', link: 'https://jhedmendoza.is-a.dev/projects/gameloft_in', image: new URL('../../assets/img/portfolio/zend/gameloft_in.png', import.meta.url).href }
      ]
    }
  },
  computed: {
    filteredPortfolio() {
      return this.portfolioFilter === '*' ? this.portfolioItems : this.portfolioItems.filter(i => i.category === this.portfolioFilter)
    }
  },
  methods: {
    startTyped() { this.updateTyped() },
    updateTyped() {
      const current = this.typedItems[this.typedIndex]
      if (this.isDeleting) {
        if (this.charIndex > 0) { this.charIndex--; this.typedText = current.slice(0, this.charIndex); setTimeout(() => this.updateTyped(), 50) }
        else { this.isDeleting = false; this.typedIndex = (this.typedIndex + 1) % this.typedItems.length; setTimeout(() => this.updateTyped(), 500) }
      } else {
        if (this.charIndex < current.length) { this.charIndex++; this.typedText = current.slice(0, this.charIndex); setTimeout(() => this.updateTyped(), 120) }
        else { this.isDeleting = true; setTimeout(() => this.updateTyped(), 2000) }
      }
    },
    async setFilter(f) {
      this.portfolioFilter = f
      // apply isotope filter if available
      try {
        if (this._iso) {
          const filterVal = f === '*' ? '*' : '.' + f
          this._iso.arrange({ filter: filterVal })
        }
      } catch (e) {
        console.warn('Isotope arrange failed', e)
      }
    },
    stripTags(html) { const d = document.createElement('div'); d.innerHTML = html; return d.textContent || d.innerText || '' },
    async fetchPosts() {
      const endpoints = [
        'https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts?http_envelope=1',
        'https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts'
      ]
      this.isLoadingPosts = true
      this.postsError = ''
      let fetched = false

      for (const url of endpoints) {
        try {
          const res = await fetch(url)
          if (!res.ok) {
            console.warn('Posts fetch returned', res.status, 'for', url)
            continue
          }
          const data = await res.json()

          // Try envelope shape first
          if (data?.body?.posts && Array.isArray(data.body.posts) && data.body.posts.length > 0) {
            this.posts = data.body.posts.map(p => ({
              post_id: p.ID,
              post_title: p.title,
              post_slug: p.slug,
              post_date: new Date(p.date).toISOString().split('T')[0],
              post_exerpt: this.stripTags(p.excerpt).slice(0, 100)
            }))
            fetched = true
            break
          }

          // Try direct posts array
          if (data?.posts && Array.isArray(data.posts) && data.posts.length > 0) {
            this.posts = data.posts.map(p => ({
              post_id: p.ID || p.id,
              post_title: p.title || p.post_title || '',
              post_slug: p.slug || p.post_name || '',
              post_date: p.date ? new Date(p.date).toISOString().split('T')[0] : '',
              post_exerpt: this.stripTags(p.excerpt || p.post_excerpt || '').slice(0, 100)
            }))
            fetched = true
            break
          }

          // Some APIs return a single post or different shape — try finding posts by walking keys
          const possiblePosts = data?.posts || data?.body || null
          if (Array.isArray(possiblePosts) && possiblePosts.length > 0) {
            this.posts = possiblePosts.map(p => ({
              post_id: p.ID || p.id,
              post_title: p.title || '',
              post_slug: p.slug || '',
              post_date: p.date ? new Date(p.date).toISOString().split('T')[0] : '',
              post_exerpt: this.stripTags(p.excerpt || '').slice(0, 100)
            }))
            fetched = true
            break
          }

          // nothing found on this endpoint, continue to next
        } catch (err) {
          console.error('Error fetching posts from', url, err)
          continue
        }
      }

      if (!fetched) {
        this.posts = []
        this.postsError = 'No posts found or the blog API is unreachable.'
      }

      this.isLoadingPosts = false
    },

    validateContact() {
      const email = this.contact.email.trim(); const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!this.contact.name.trim()) return 'Please enter your name.'
      if (!email) return 'Please enter your email.'
      if (!emailRx.test(email)) return 'Please enter a valid email address.'
      if (!this.contact.message.trim()) return 'Please write something for me.'
      return ''
    },
    async submitContact() {
      const v = this.validateContact(); if (v) { this.contactStatus='error'; this.contactFeedback=v; return }
      this.contactStatus='sending'; this.contactFeedback='Sending...'
      try {
        const payload = { service_id: 'service_ioeych3', template_id: 'jm_xftqc27', user_id: 'rke7kU1n5NYJuQ_vk', template_params: { from_name: this.contact.name.trim(), from_email: this.contact.email.trim(), message: this.contact.message.trim() } }
        const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!r.ok) throw new Error('fail')
        this.contactStatus='success'; this.contactFeedback='Your message has been sent. Thank you!'; this.contact = { name:'', email:'', message:'' }
      } catch (e) { this.contactStatus='error'; this.contactFeedback='Something went wrong. Please try again later.' }
    }
  },
  async mounted() {
    // start typed effect
    this.startTyped();
    // fetch posts
    this.fetchPosts();

    // Ensure scroll tracking from earlier component behavior
    window.addEventListener('scroll', () => {
      const sections = document.querySelectorAll('main section, #hero');
      const scrollPosition = window.scrollY + 200;
      let current = 'hero';
      sections.forEach((section) => { if (section.offsetTop <= scrollPosition) current = section.id });
      this.activeSection = current || 'hero';
    });

    // dynamically load particles scripts (vendor assets) so particles effect works in dev and production
    try {
      const base = import.meta.env.BASE_URL || '/';
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = base + 'assets/vendor/particlesjs/particles.min.js';
        s.onload = resolve; s.onerror = reject; document.body.appendChild(s);
      });
      // then load the app config which calls particlesJS('particles-js', ...)
      await new Promise((resolve, reject) => {
        const s2 = document.createElement('script');
        s2.src = base + 'assets/vendor/particlesjs/app.js';
        s2.onload = resolve; s2.onerror = reject; document.body.appendChild(s2);
      });
    } catch (e) {
      // non-fatal — particles are decorative
      // console.warn('Particles failed to load', e)
    }

    // Initialize Isotope for portfolio filtering/layout
    try {
      const base = import.meta.env.BASE_URL || '/'
      if (!window.Isotope) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script')
          s.src = base + 'assets/vendor/isotope-layout/isotope.pkgd.min.js'
          s.onload = resolve; s.onerror = reject; document.body.appendChild(s)
        })
      }
      // give browser a tick to render portfolio items
      await new Promise(r => setTimeout(r, 50))
      const container = document.querySelector('.portfolio-container')
      if (container && window.Isotope) {
        this._iso = new window.Isotope(container, { itemSelector: '.portfolio-item' })
        // apply initial filter
        const initialFilter = this.portfolioFilter === '*' ? '*' : '.' + this.portfolioFilter
        this._iso.arrange({ filter: initialFilter })
      }
    } catch (err) {
      console.warn('Isotope init failed', err)
    }
  }
}
</script>
