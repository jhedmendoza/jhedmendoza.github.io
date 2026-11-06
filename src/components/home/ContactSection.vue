<template>
  <section id="contact" ref="section" :class="['contact-section', { 'can-animate': canAnimate, 'is-in': inView }]">
    <div class="container">
      <div class="contact-layout">
        <div class="contact-intro">
          <p class="contact-eyebrow">Contact</p>
          <!-- split into letters for the type-in animation; screen readers get the plain sentence -->
          <h2 class="contact-heading" :aria-label="headingLines.map(l => l.text).join(' ')">
            <template v-for="(line, li) in headingLetters" :key="li">
              <br v-if="li > 0"/>
              <span :class="['contact-heading-line', { accent: line.accent }]" aria-hidden="true">
                <template v-for="(word, wi) in line.words" :key="wi">
                  <span class="contact-word"><span v-for="ch in word" :key="ch.i" class="contact-char" :style="{ '--ci': ch.i }">{{ ch.c }}</span></span>{{ wi < line.words.length - 1 ? ' ' : '' }}
                </template>
              </span>
            </template>
          </h2>
          <p class="contact-lead">Tell me a little about what you need and I'll get back to you within a day or two.</p>

          <ul class="contact-details">
            <li>
              <span class="contact-details-label">Email</span>
              <a href="mailto:jhed.adrine@gmail.com">jhed.adrine@gmail.com</a>
            </li>
            <li>
              <span class="contact-details-label">Based in</span>
              <span>Bacoor, Cavite, Philippines</span>
            </li>
          </ul>
        </div>

        <form id="contact-form" ref="form" class="contact-form" @submit.prevent="submitContact" novalidate>
          <div class="contact-row">
            <div :class="['contact-field', { filled: contact.name }]">
              <label for="contact-name">Your name</label>
              <input id="contact-name" name="name" v-model="contact.name" type="text" autocomplete="name"/>
            </div>
            <div :class="['contact-field', { filled: contact.email }]">
              <label for="contact-email">Your email</label>
              <input id="contact-email" name="email" v-model="contact.email" type="email" autocomplete="email"/>
            </div>
          </div>
          <div :class="['contact-field', { filled: contact.message }]">
            <label for="contact-message">Tell me about your project</label>
            <textarea id="contact-message" name="message" v-model="contact.message" rows="4"></textarea>
          </div>

          <div class="contact-actions">
            <button type="submit" class="contact-submit" :disabled="contactStatus === 'sending'">
              {{ contactStatus === 'sending' ? 'Sending…' : 'Send message' }}
            </button>
            <Transition name="contact-fade">
              <p v-if="contactStatus === 'success' || contactStatus === 'error'" :class="['contact-feedback', contactStatus]" role="status">
                <i :class="['bx', contactStatus === 'success' ? 'bx-check-circle' : 'bx-error-circle']" aria-hidden="true"></i>
                {{ contactFeedback }}
              </p>
            </Transition>
          </div>
        </form>
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
      contactFeedback: '',
      headingLines: [
        { text: 'Have a project in mind?' },
        { text: "Let's talk.", accent: true }
      ],
      canAnimate: false, // only hide things once we know we can animate them back in
      inView: false
    }
  },
  computed: {
    // [{ accent, words: [[{ c, i }]] }] with i = running letter index across the whole heading
    headingLetters() {
      let i = 0
      return this.headingLines.map(line => ({
        accent: !!line.accent,
        words: line.text.split(' ').map(word => [...word].map(c => ({ c, i: i++ })))
      }))
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
        this.contactFeedback = "Thanks! Your message is on its way. I'll be in touch soon."
        this.contact = { name: '', email: '', message: '' }
      } catch (e) {
        this.contactStatus = 'error'
        this.contactFeedback = 'Something went wrong. Please try again, or email me directly.'
      }
    }
  },
  mounted() {
    if (document.readyState === 'complete') this.loadValidator()
    else window.addEventListener('load', () => this.loadValidator(), { once: true })

    // animate in whenever the section scrolls into view, and reset when it leaves
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    this.canAnimate = true
    this._observer = new IntersectionObserver(([entry]) => {
      // never hide the form while someone is using it
      if (!entry.isIntersecting && this.$el.contains(document.activeElement)) return
      this.inView = entry.isIntersecting
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 })
    this._observer.observe(this.$refs.section)
  },
  beforeUnmount() {
    if (this._observer) this._observer.disconnect()
  }
}
</script>

<style>
.contact-section {
  --contact-ink: var(--c-ink);
  --contact-text: var(--c-text);
  --contact-muted: var(--c-muted);
  --contact-rule: var(--c-rule-strong);
  --contact-accent: var(--c-accent);
  --contact-error: var(--c-error);
  --contact-success: var(--c-success);
  padding: 100px 0;
}

.contact-layout {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: 80px;
  align-items: start;
}

/* intro column */
.contact-eyebrow {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--contact-accent);
  margin: 0 0 14px;
}
.contact-heading {
  font-family: Poppins, sans-serif;
  font-size: 40px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--contact-ink);
  margin: 0 0 18px;
}
.contact-heading .accent { color: var(--contact-accent); }
.contact-word { display: inline-block; white-space: nowrap; }
.contact-char { display: inline-block; }
.contact-lead {
  font-size: 16px;
  line-height: 1.7;
  color: var(--contact-muted);
  margin: 0 0 36px;
  max-width: 380px;
}
.contact-details {
  list-style: none;
  padding: 0;
  margin: 0;
}
.contact-details li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px 0;
  border-top: 1px solid var(--c-rule);
  font-size: 15px;
  color: var(--contact-text);
}
.contact-details li:last-child { border-bottom: 1px solid var(--c-rule); }
.contact-details-label {
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--contact-muted);
}
.contact-details a {
  color: var(--contact-ink);
  font-weight: 600;
  align-self: flex-start;
  border-bottom: 1px solid transparent;
  transition: color 0.25s ease, border-color 0.25s ease;
}
.contact-details a:hover { color: var(--contact-accent); border-color: var(--contact-accent); text-decoration: none; }

/* form: underline fields with floating labels */
.contact-form { padding-top: 6px; }
.contact-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
}
.contact-field {
  position: relative;
  padding-top: 22px;
  margin-bottom: 30px;
}
.contact-field label {
  position: absolute;
  left: 0;
  top: 32px;
  margin: 0;
  font-size: 16px;
  color: var(--contact-muted);
  pointer-events: none;
  transform-origin: left top;
  transition: transform 0.25s ease, color 0.25s ease;
}
.contact-field:focus-within label,
.contact-field.filled label {
  transform: translateY(-26px) scale(0.78);
  letter-spacing: 0.04em;
}
.contact-field:focus-within label { color: var(--contact-accent); }
.contact-field input,
.contact-field textarea {
  display: block;
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--contact-rule);
  border-radius: 0;
  background: transparent;
  padding: 8px 0 10px;
  font-size: 16px;
  color: var(--contact-ink);
  outline: none;
  box-shadow: none;
  resize: vertical;
  transition: border-color 0.25s ease;
}
.contact-field textarea { min-height: 120px; }
.contact-field:focus-within input,
.contact-field:focus-within textarea { border-bottom-color: var(--contact-accent); }

/* validation (jQuery Validate adds .is-invalid and a .text-danger div) */
.contact-field .is-invalid { border-bottom-color: var(--contact-error); }
.contact-field .text-danger {
  font-size: 12px;
  margin-top: 6px;
  color: var(--contact-error) !important;
}

.contact-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-top: 6px;
}
.contact-submit {
  border: 0;
  padding: 13px 34px;
  border-radius: 50px;
  background: var(--c-accent-solid);
  color: var(--c-on-accent);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.25s ease, opacity 0.25s ease;
}
.contact-submit:hover:not(:disabled) { background: var(--c-accent-solid-hover); }
.contact-submit:disabled { opacity: 0.6; cursor: progress; }
.contact-submit:focus-visible { outline: 2px solid var(--contact-accent); outline-offset: 4px; }

.contact-feedback {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
}
.contact-feedback i { font-size: 20px; }
.contact-feedback.success { color: var(--contact-success); }
.contact-feedback.error { color: var(--contact-error); }
.contact-fade-enter-active,
.contact-fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.contact-fade-enter-from,
.contact-fade-leave-to { opacity: 0; transform: translateX(-6px); }

@media (max-width: 991px) {
  .contact-section { padding: 72px 0; }
  .contact-layout { grid-template-columns: minmax(0, 1fr); gap: 48px; }
  .contact-heading { font-size: 32px; }
}
@media (max-width: 575px) {
  .contact-row { grid-template-columns: minmax(0, 1fr); }
  .contact-heading { font-size: 28px; }
}
/* ---- entrance animation (only once JS has added .can-animate) ---- */
.contact-section.can-animate .contact-eyebrow,
.contact-section.can-animate .contact-lead,
.contact-section.can-animate .contact-details li {
  opacity: 0;
  translate: 0 18px;
  transition: opacity 0.6s ease, translate 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
}
/* heading: letters rise in one by one; 'Let's talk.' letters pop up with a spring (no tilt) */
.contact-section.can-animate .contact-char {
  opacity: 0;
  translate: 0 0.45em;
  transition: opacity 0.35s ease, translate 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
  transition-delay: calc(0.1s + var(--ci) * 35ms);
}
.contact-section.can-animate .accent .contact-char {
  translate: 0 0.6em;
  transition: opacity 0.35s ease, translate 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: calc(0.25s + var(--ci) * 35ms);
}
/* (the .accent selector is repeated so it outranks the start state above) */
.contact-section.is-in .contact-char,
.contact-section.is-in .accent .contact-char { opacity: 1; translate: 0 0; }
.contact-section.can-animate .contact-lead { transition-delay: 0.85s; } /* after the heading has typed in */
/* email / location rows slide in from the left */
.contact-section.can-animate .contact-details li { translate: -18px 0; }
.contact-section.can-animate .contact-details li:nth-child(1) { transition-delay: 0.95s; }
.contact-section.can-animate .contact-details li:nth-child(2) { transition-delay: 1.05s; }

/* form: each underline draws left to right, its label fades up */
.contact-section.can-animate .contact-field input,
.contact-section.can-animate .contact-field textarea {
  clip-path: inset(0 100% 0 0);
  transition: border-color 0.25s ease, clip-path 0.8s cubic-bezier(0.65, 0, 0.35, 1);
  transition-delay: 0s, var(--field-delay, 0.25s);
}
.contact-section.can-animate .contact-field label {
  opacity: 0;
  translate: 0 10px;
  transition: transform 0.25s ease, color 0.25s ease, opacity 0.5s ease, translate 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
  transition-delay: 0s, 0s, var(--field-delay, 0.25s), var(--field-delay, 0.25s);
}
.contact-section.can-animate .contact-row .contact-field:nth-child(1) { --field-delay: 0.25s; }
.contact-section.can-animate .contact-row .contact-field:nth-child(2) { --field-delay: 0.37s; }
.contact-section.can-animate .contact-form > .contact-field { --field-delay: 0.49s; }

/* the button springs in last */
.contact-section.can-animate .contact-submit {
  opacity: 0;
  scale: 0.85;
  translate: 0 12px;
  transition: background 0.25s ease, opacity 0.5s ease 0.65s,
              scale 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.65s, translate 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.65s;
}

/* in view: everything to its resting place */
.contact-section.is-in .contact-eyebrow,
.contact-section.is-in .contact-lead,
.contact-section.is-in .contact-details li,
.contact-section.is-in .contact-field label,
.contact-section.is-in .contact-submit { opacity: 1; translate: 0 0; scale: 1; }
.contact-section.is-in .contact-field input,
.contact-section.is-in .contact-field textarea { clip-path: inset(0 0 0 0); }
/* keep the dimmed look while a message is sending */
.contact-section.is-in .contact-submit:disabled { opacity: 0.6; }

@media (prefers-reduced-motion: reduce) {
  .contact-field label { transition: none; }
}
</style>
