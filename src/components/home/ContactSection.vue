<template>
  <section id="contact" class="contact">
    <div class="container">
      <div class="section-title"><h2>Send me a message</h2></div>
      <div class="row mt-1">
        <div class="col-lg-4"> <div class="info"><div class="address"><i class="icofont-google-map"></i><h4>Location:</h4><p>Bacoor Cavite, 4102</p></div><div class="email"><i class="icofont-envelope"></i><h4>Email:</h4><p>jhed.adrine@gmail.com</p></div></div></div>
        <div class="col-lg-8 mt-5 mt-lg-0">
          <form id="contact-form" ref="form" class="php-email-form" @submit.prevent="submitContact" novalidate>
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
</template>

<script>
const EMAILJS_PAYLOAD = { service_id: 'service_ioeych3', template_id: 'jm_xftqc27', user_id: 'rke7kU1n5NYJuQ_vk' }

const VALIDATOR_OPTIONS = {
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
  highlight(element) { window.$(element).addClass('is-invalid') },
  unhighlight(element) { window.$(element).removeClass('is-invalid') }
}

const loadScript = (src) => new Promise((resolve, reject) => {
  const s = document.createElement('script')
  s.src = src
  s.onload = resolve
  s.onerror = reject
  document.head.appendChild(s)
})

const hasValidatePlugin = () => !!(window.$ && window.$.fn && window.$.fn.validate)

export default {
  name: 'ContactSection',
  data() {
    return {
      contact: { name: '', email: '', message: '' },
      contactStatus: 'idle',
      contactFeedback: ''
    }
  },
  methods: {
    initValidator() {
      const form = this.$refs.form
      if (hasValidatePlugin() && form && !form.__validatorInitialized) {
        window.$(form).validate(VALIDATOR_OPTIONS)
        form.__validatorInitialized = true
      }
    },
    async loadValidator() {
      try {
        // ensure jQuery exists; if not, load it
        if (!window.$ && !window.jQuery) {
          await loadScript('https://code.jquery.com/jquery-3.6.0.min.js')
          window.$ = window.jQuery = window.jQuery || window.$
        }
        // load jquery.validate if missing
        if (window.$ && !hasValidatePlugin()) {
          await loadScript('https://cdn.jsdelivr.net/npm/jquery-validation@1.19.5/dist/jquery.validate.min.js')
        }
        this.initValidator()
      } catch (e) {
        // ignore — form will submit without client-side validation
      }
    },
    async submitContact() {
      const form = this.$refs.form
      // Validate with jQuery Validate if available
      if (hasValidatePlugin() && form) {
        this.initValidator()
        if (!window.$(form).valid()) {
          const firstError = form.querySelector('.text-danger')
          this.contactStatus = 'pending'
          this.contactFeedback = firstError ? firstError.textContent.trim() : 'Please fix the errors in the form.'
          return
        }
      }

      this.contactStatus = 'sending'
      this.contactFeedback = 'Sending...'

      try {
        const payload = {
          ...EMAILJS_PAYLOAD,
          template_params: { from_name: this.contact.name.trim(), from_email: this.contact.email.trim(), message: this.contact.message.trim() }
        }

        const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })

        if (!r.ok) throw new Error('fail')

        this.contactStatus = 'success'
        this.contactFeedback = 'Your message has been sent. Thank you!'
        this.contact = { name: '', email: '', message: '' }
      } catch (e) {
        this.contactStatus = 'error'
        this.contactFeedback = 'Something went wrong. Please try again later.'
      }
    }
  },
  mounted() {
    if (document.readyState === 'complete') this.loadValidator()
    else window.addEventListener('load', () => this.loadValidator(), { once: true })
  }
}
</script>
