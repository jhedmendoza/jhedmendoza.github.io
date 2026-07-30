<template>
  <div>
    <section id="hero" class="d-flex flex-column justify-content-center">
      <div id="particles-js" aria-hidden="true"></div>
      <div class="container">
        <h1>Jhed Mendoza</h1>
        <p>I'm <span class="typed">{{ typedText }}</span><span class="typed-cursor">|</span></p>
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
          <div class="row news-container">
            <div v-if="isLoadingPosts" class="col-12 text-center">Loading latest posts...</div>
            <div v-else-if="postsError" class="col-12 text-danger">{{ postsError }}</div>
              <div v-else v-for="(post, i) in posts" :key="post.post_id" class="col-md-6 d-flex align-items-stretch" data-aos="zoom-in" data-aos-delay="100">
                <router-link :to="{ name: 'post', params: { postId: post.post_id, slug: post.post_slug } }" :class="['icon-box','iconbox-'+colors[i % colors.length],'w-100','news-content']" v-bind:data-id="i" v-bind:data-color="hexColors[i % hexColors.length]">
                  <div class="icon">
                    <svg width="100" height="100" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                      <path stroke="none" stroke-width="0" fill="#f5f5f5" :d="svg[i % svg.length]"></path>
                    </svg>
                    <i :class="['bx', icons[i % icons.length]]"></i>
                  </div>
                  <p class="news-date mb-0 float-right">{{ post.post_date }}</p>
                  <h4 class="news-title mb-1">{{ post.post_title }}</h4>
                  <p>{{ post.post_exerpt }}</p>
                </router-link>
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
              <form id="contact-form" class="php-email-form" @submit.prevent="submitContact" novalidate>
                <div class="form-row">
                  <div class="col-md-6 form-group"><input name="name" v-model="contact.name" type="text" class="form-control" placeholder="Your Name"/></div>
                  <div class="col-md-6 form-group"><input name="email" v-model="contact.email" type="email" class="form-control" placeholder="Your Email"/></div>
                </div>
                <div class="form-group"><textarea name="message" v-model="contact.message" class="form-control" rows="5" placeholder="Message"></textarea></div>
                <div class="mb-3" v-if="contactFeedback"><div    
                 :class="[
                    contactStatus === 'error' ? 'error-message' : 'sent-message',
                    contactStatus == 'success' || contactStatus == 'error' ? 'show' : 'hide'
                ]">{{ contactFeedback }}</div></div>
                <div><button class="btn send-btn" :disabled="contactStatus === 'sending'">{{ contactStatus==='sending' ? 'Sending...' : 'Send' }}</button></div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'HomePage',
  data() {
    return {
      typedItems: ['a Web Developer', 'a Freelancer', 'a Dreamer', 'a Father'],
      icons: ['bxl-dribbble','bx-file','bx-tachometer'],
      colors: ['blue','orange','pink'],
      hexColors: ['#47aeff','#ffa76e','#e80368'],
      svg: [
        'M300,521.0016835830174C376.1290562159157,517.8887921683347,466.0731472004068,529.7835943286574,510.70327084640275,468.03025145048787C554.3714126377745,407.6079735673963,508.03601936045806,328.9844924480964,491.2728898941984,256.3432110539036C474.5976632858925,184.082847569629,479.9380746630129,96.60480741107993,416.23090153303,58.64404602377083C348.86323505073057,18.502131276798302,261.93793281208167,40.57373210992963,193.5410806939664,78.93577620505333C130.42746243093433,114.334589627462,98.30271207620316,179.96522072025542,76.75703585869454,249.04625023123273C51.97151888228291,328.5150500222984,13.704378332031375,421.85034740162234,66.52175969318436,486.19268352777647C119.04800174914682,550.1803526380478,217.28368757567262,524.383925680826,300,521.0016835830174',
        'M300,582.0697525312426C382.5290701553225,586.8405444964366,449.9789794690241,525.3245884688669,502.5850820975895,461.55621195738473C556.606425686781,396.0723002908107,615.8543463187945,314.28637112970534,586.6730223649479,234.56875336149918C558.9533121215079,158.8439757836574,454.9685369536778,164.00468322053177,381.49747125262974,130.76875717737553C312.15926192815925,99.40240125094834,248.97055460311594,18.661163978235184,179.8680185752513,50.54337015887873C110.5421016452524,82.52863877960104,119.82277516462835,180.83849132639028,109.12597500060166,256.43424936330496C100.08760227029461,320.3096726198365,92.17705696193138,384.0621239912766,124.79988738764834,439.7174275375508C164.83382741302287,508.01625554203684,220.96474134820875,577.5009287672846,300,582.0697525312426',
        'M300,541.5067337569781C382.14930387511276,545.0595476570109,479.8736841581634,548.3450877840088,526.4010558755058,480.5488172755941C571.5218469581645,414.80211281144784,517.5187510058486,332.0715597781072,496.52539010469104,255.14436215662573C477.37192572678356,184.95920475031193,473.57363656557914,105.61284051026155,413.0603344069578,65.22779650032875C343.27470386102294,18.654635553484475,251.2091493199835,5.337323636656869,175.0934190732945,40.62881213300186C97.87086631185822,76.43348514350839,51.98124368387456,156.15599469081315,36.44837278890362,239.84606092416172C21.716077023791087,319.22268207091537,43.775223500013084,401.1760424656574,96.891909868211,461.97329694683043C147.22146801428983,519.5804099606455,223.5754009179313,538.201503339737,300,541.5067337569781'
      ],
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
      // apply isotope filter if available, but wait for images to be loaded to avoid collapsed heights
      try {
        if (this._iso) {
          const filterVal = f === '*' ? '*' : '.' + f
          const container = document.querySelector('.portfolio-container')
          if (window.imagesLoaded && container) {
            window.imagesLoaded(container, () => {
              try { this._iso.reloadItems() } catch(e){}
              this._iso.arrange({ filter: filterVal })
              this._iso.layout()
            })
          } else {
            await this._waitForImages(container)
            try { this._iso.reloadItems() } catch(e){}
            this._iso.arrange({ filter: filterVal })
            this._iso.layout()
          }
        }
      } catch (e) {
        console.warn('Isotope arrange failed', e)
      }
    },
    stripTags(html) { const d = document.createElement('div'); d.innerHTML = html; return d.textContent || d.innerText || '' },
    async fetchPosts() {
      const WP_API_URL = 'https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts?http_envelope=1'
      this.isLoadingPosts = true
      this.postsError = ''
      try {
        const resp = await axios.get(WP_API_URL, { timeout: 8000 })
        const data = resp.data

        if (data?.body?.found > 0 && Array.isArray(data.body.posts)) {
          this.posts = data.body.posts.map((p, i) => ({
            post_id: p.ID,
            post_title: p.title,
            post_slug: p.slug,
            post_date: new Date(p.date).toISOString().split('T')[0],
            post_exerpt: this.stripTags(p.excerpt).slice(0, 100)
          }))
        } else if (Array.isArray(data?.posts) && data.posts.length > 0) {
          this.posts = data.posts.map(p => ({
            post_id: p.ID || p.id,
            post_title: p.title || p.post_title || '',
            post_slug: p.slug || p.post_name || '',
            post_date: p.date ? new Date(p.date).toISOString().split('T')[0] : '',
            post_exerpt: this.stripTags(p.excerpt || p.post_excerpt || '').slice(0, 100)
          }))
        } else {
          this.posts = []
          this.postsError = 'No posts found.'
        }

        // let AOS re-evaluate newly inserted elements (data-aos)
        if (this.$nextTick) {
          await this.$nextTick()
          if (window.AOS && typeof window.AOS.refresh === 'function') {
            window.AOS.refresh()
          }
        }
      } catch (err) {
        console.error('Axios posts fetch error', err)
        this.posts = []
        this.postsError = 'Unable to load blog posts.'
      } finally {
        this.isLoadingPosts = false
      }
    },


    validateContact() {
      // Prefer jQuery Validate if available to replicate previous behavior (email.js)
      const form = document.getElementById('contact-form')
      if (window.$ && $.fn && $.fn.validate && form) {
        // initialize validator once with rules/messages
        if (!form.__validatorInitialized) {
          $(form).validate({
            rules: {
              name: { required: true },
              email: { required: true, email: true },
              message: { required: true }
            },
            messages: {
              name: 'Please enter your name.',
              email: { required: 'Please enter your email.', email: 'Please enter a valid email address.' },
              message: 'Please write something for me.'
            },
            errorElement: 'div',
            errorClass: 'text-danger',
            errorPlacement(error, element) {
              // place error after the form control
              error.insertAfter(element)
            },
            highlight(element) { $(element).addClass('is-invalid') },
            unhighlight(element) { $(element).removeClass('is-invalid') }
          })
          form.__validatorInitialized = true
        }
        // return empty string if valid, otherwise first error message
        const valid = $(form).valid()
        if (valid) return ''
        const firstError = form.querySelector('.text-danger')
        return firstError ? firstError.textContent.trim() : 'Please fix the errors in the form.'
      }

    },
    async submitContact() {
      // Validate with jQuery Validate first if available
      const form = document.getElementById('contact-form')
      if (window.$ && $.fn && $.fn.validate && form) {
        // ensure validator initialized (in case load/init ran earlier)
        if (!form.__validatorInitialized) {
          $(form).validate({
            rules: { name: { required: true }, email: { required: true, email: true }, message: { required: true } },
            messages: { name: 'Please enter your name.', email: { required: 'Please enter your email.', email: 'Please enter a valid email address.' }, message: 'Please write something for me.' },
            errorElement: 'div', errorClass: 'text-danger', errorPlacement(error, element) { error.insertAfter(element) }, highlight(el) { $(el).addClass('is-invalid') }, unhighlight(el) { $(el).removeClass('is-invalid') }
          })
          form.__validatorInitialized = true
        }

        const valid = $(form).valid()
        if (!valid) {
          const firstError = form.querySelector('.text-danger')
          this.contactStatus = 'pending'
          this.contactFeedback = firstError ? firstError.textContent.trim() : 'Please fix the errors in the form.'
          return
        }
      } else {
        // fallback to existing manual validation
        const v = this.validateContact(); if (v) { this.contactStatus='error'; this.contactFeedback=v; return }
      }

      this.contactStatus = 'sending'
      this.contactFeedback = 'Sending...'

      try {
        const payload = { service_id: 'service_ioeych3', template_id: 'jm_xftqc27', user_id: 'rke7kU1n5NYJuQ_vk', template_params: { from_name: this.contact.name.trim(), from_email: this.contact.email.trim(), message: this.contact.message.trim() } }

        const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })

        if (!r.ok) throw new Error('fail')

        this.contactStatus = 'success'
        this.contactFeedback = 'Your message has been sent. Thank you!'
        this.contact = { name:'', email:'', message:'' }
      }
      catch (e) {
        this.contactStatus = 'error'
        this.contactFeedback = 'Something went wrong. Please try again later.'
      }
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
      console.warn('Particles failed to load', e)
    }

    // Ensure jQuery Validate plugin is available for contact form validation
    (function(){
      const loadScript = (src) => new Promise((resolve, reject) => { const s = document.createElement('script'); s.src = src; s.onload = resolve; s.onerror = reject; document.head.appendChild(s); })
      const initValidator = async () => {
        try {
          // ensure jQuery exists; if not, load it
          if (!window.$ && !window.jQuery) {
            await loadScript('https://code.jquery.com/jquery-3.6.0.min.js')
            window.$ = window.jQuery = window.jQuery || window.$
          }

          // load jquery.validate if missing
          if (window.$ && (!$.fn || !$.fn.validate)) {
            await loadScript('https://cdn.jsdelivr.net/npm/jquery-validation@1.19.5/dist/jquery.validate.min.js')
          }

          const formEl = document.getElementById('contact-form')
          if (window.$ && $.fn && $.fn.validate && formEl && !formEl.__validatorInitialized) {
            $(formEl).validate({
              rules: {
                name: { required: true },
                email: { required: true, email: true },
                message: { required: true }
              },
              messages: {
                name: 'Please enter your name.',
                email: { required: 'Please enter your email.', email: 'Please enter a valid email address.' },
                message: 'Please write something for me.'
              },
              errorElement: 'div',
              errorClass: 'text-danger',
              errorPlacement(error, element) { error.insertAfter(element) },
              highlight(element) { $(element).addClass('is-invalid') },
              unhighlight(element) { $(element).removeClass('is-invalid') }
            })
            formEl.__validatorInitialized = true
          }
        } catch (e) {
          // ignore — fallback validation still works
        }
      }
      if (document.readyState === 'complete') initValidator(); else window.addEventListener('load', initValidator, { once: true })
    })()


    // helper: wait for images to load inside a container
    this._waitForImages = (container) => {
      return new Promise((resolve) => {
        if (!container) return resolve()
        const imgs = Array.from(container.querySelectorAll('img'))
        if (!imgs.length) return resolve()
        let loaded = 0
        const check = () => {
          loaded++
          if (loaded >= imgs.length) resolve()
        }
        imgs.forEach((img) => {
          if (img.complete && img.naturalHeight !== 0) return check()
          const onLoad = () => { img.removeEventListener('load', onLoad); img.removeEventListener('error', onLoad); check() }
          img.addEventListener('load', onLoad)
          img.addEventListener('error', onLoad)
          // safety timeout per image
          setTimeout(onLoad, 3000)
        })
      })
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
      // load imagesLoaded from CDN if available for robust layout handling
      if (!window.imagesLoaded) {
        try {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script')
            s.src = 'https://unpkg.com/imagesloaded@4/imagesloaded.pkgd.min.js'
            s.onload = resolve; s.onerror = reject; document.body.appendChild(s)
          })
        } catch (e) {
          // ignore - we'll fall back to manual waiting
        }
      }

      const container = document.querySelector('.portfolio-container')
      // wait for images to load before initializing
      if (window.imagesLoaded && container) {
        await new Promise((resolve) => window.imagesLoaded(container, resolve))
      } else {
        await this._waitForImages(container)
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
              // apply initial filter
              const initialFilter = this.portfolioFilter === '*' ? '*' : '.' + this.portfolioFilter
              // use imagesLoaded to ensure layout after arrange
              const doArrange = () => {
                try { this._iso.reloadItems() } catch(e){}
                this._iso.arrange({ filter: initialFilter })
                this._iso.layout()
              }
              if (window.imagesLoaded) window.imagesLoaded(container, doArrange); else doArrange()
            }
    } catch (err) {
      console.warn('Isotope init failed', err)
    }

    // Load and initialize AOS so elements with data-aos are visible
    try {
      if (!window.AOS) {
        const base = import.meta.env.BASE_URL || '/'
        await new Promise((resolve, reject) => {
          const s = document.createElement('script')
          s.src = base + 'assets/vendor/aos/aos.js'
          s.onload = resolve; s.onerror = reject; document.body.appendChild(s)
        })
      }
      if (window.AOS && typeof window.AOS.init === 'function') {
        window.AOS.init({ duration: 1000, once: true })
      }
    } catch (e) {
      // non-fatal: AOS is decorative
    }
  }
}
</script>
