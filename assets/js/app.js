"use strict";
const { createApp } = Vue;
createApp({
  data() {
    return {
      typedItems: ["a Web Developer", "a Freelancer", "a Dreamer", "a Father"],
      typedText: "",
      typedIndex: 0,
      charIndex: 0,
      isDeleting: false,
      portfolioFilter: "*",
      posts: [],
      isLoadingPosts: true,
      postsError: "",
      contact: {
        name: "",
        email: "",
        message: ""
      },
      contactStatus: "idle",
      contactFeedback: "",
      showBackToTop: false,
      activeSection: "hero",
      mobileNavActive: false,
      portfolioItems: [
        {
          title: "Football Careers",
          category: "wordpress",
          link: "https://www.footballcareers.com/",
          image: "assets/img/portfolio/wordpress/football_careers.png"
        },
        {
          title: "What Games",
          category: "zend",
          link: "https://what.games/",
          image: "assets/img/portfolio/zend/what_games.png"
        },
        {
          title: "Teleta",
          category: "wordpress",
          link: "https://www.teleta.co.uk/",
          image: "assets/img/portfolio/wordpress/teleta.png"
        },
        {
          title: "Blok Property",
          category: "wordpress",
          link: "https://www.blokpropertymanagement.co.uk/",
          image: "assets/img/portfolio/wordpress/blok_property.png"
        },
        {
          title: "Cameron Intellectual Property",
          category: "wordpress",
          link: "https://cameronintellectualproperty.com/",
          image: "assets/img/portfolio/wordpress/cameron.png"
        },
        {
          title: "Oxford Language Club",
          category: "codeigniter",
          link: "https://oxfordlanguageclub.com/",
          image: "assets/img/portfolio/codeigniter/oxford_language.jpg"
        },
        {
          title: "Scotch Galore",
          category: "wordpress",
          link: "https://scotchgalore.com/",
          image: "assets/img/portfolio/wordpress/scotchgalore.png"
        },
        {
          title: "Minion Rush",
          category: "codeigniter",
          link: "https://minionrush.com/",
          image: "assets/img/portfolio/codeigniter/minion_rush.jpg"
        },
        {
          title: "Gameloft",
          category: "zend",
          link: "https://gameloft.com/",
          image: "assets/img/portfolio/zend/gameloft.jpeg"
        },
        {
          title: "Asphalt Legends",
          category: "zend",
          link: "https://asphaltlegendsunite.com/",
          image: "assets/img/portfolio/zend/asphaltlegendsunite.jpeg"
        },
        {
          title: "Dragon Mania Legends",
          category: "zend",
          link: "https://dragonmanialegends.com/",
          image: "assets/img/portfolio/zend/dragonmanialegends.jpeg"
        },
        {
          title: "Naxos Music Box",
          category: "wordpress",
          link: "https://www.naxosmusicbox.com/",
          image: "assets/img/portfolio/wordpress/naxosmusicbox.jpeg"
        },
        {
          title: "Naxos Audiobooks",
          category: "wordpress",
          link: "https://naxosaudiobooks.com/",
          image: "assets/img/portfolio/wordpress/naxosaudiobooks.jpeg"
        },
        {
          title: "Gameloft IN",
          category: "zend",
          link: "https://jhedmendoza.is-a.dev/projects/gameloft_in",
          image: "assets/img/portfolio/zend/gameloft_in.png"
        }
      ]
    };
  },
  computed: {
    filteredPortfolio() {
      return this.portfolioFilter === "*"
        ? this.portfolioItems
        : this.portfolioItems.filter((item) => item.category === this.portfolioFilter);
    }
  },
  methods: {
    startTypedEffect() {
      this.updateTypedText();
    },
    updateTypedText() {
      const current = this.typedItems[this.typedIndex];
      if (this.isDeleting) {
        if (this.charIndex > 0) {
          this.charIndex -= 1;
          this.typedText = current.slice(0, this.charIndex);
          setTimeout(() => this.updateTypedText(), 50);
        } else {
          this.isDeleting = false;
          this.typedIndex = (this.typedIndex + 1) % this.typedItems.length;
          setTimeout(() => this.updateTypedText(), 500);
        }
      } else {
        if (this.charIndex < current.length) {
          this.charIndex += 1;
          this.typedText = current.slice(0, this.charIndex);
          setTimeout(() => this.updateTypedText(), 120);
        } else {
          this.isDeleting = true;
          setTimeout(() => this.updateTypedText(), 2000);
        }
      }
    },
    async fetchPosts() {
      const API_URL = "https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts?http_envelope=1";
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.body?.found > 0) {
          this.posts = data.body.posts.map((post) => ({
            post_id: post.ID,
            post_title: post.title,
            post_slug: post.slug,
            post_date: new Date(post.date).toISOString().split("T")[0],
            post_exerpt: this.stripTags(post.excerpt).slice(0, 100)
          }));
        } else {
          this.posts = [];
        }
      } catch (error) {
        this.postsError = "Unable to load blog posts. Please refresh the page.";
        console.error(error);
      } finally {
        this.isLoadingPosts = false;
      }
    },
    stripTags(html) {
      const temporary = document.createElement("div");
      temporary.innerHTML = html;
      return temporary.textContent || temporary.innerText || "";
    },
    scrollToSection(target) {
      const element = document.querySelector(target);
      if (element) {
        const top = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top, behavior: "smooth" });
        this.activeSection = target.replace("#", "");
        this.closeMobileNav();
      }
    },
    onScroll() {
      this.showBackToTop = window.scrollY > 100;
      const sections = document.querySelectorAll("main section, #hero");
      const scrollPosition = window.scrollY + 200;
      let current = "hero";
      sections.forEach((section) => {
        if (section.offsetTop <= scrollPosition) {
          current = section.id;
        }
      });
      this.activeSection = current || "hero";
    },
    validateContact() {
      const normalizedEmail = this.contact.email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.contact.name.trim()) {
        return "Please enter your name.";
      }
      if (!normalizedEmail) {
        return "Please enter your email.";
      }
      if (!emailRegex.test(normalizedEmail)) {
        return "Please enter a valid email address.";
      }
      if (!this.contact.message.trim()) {
        return "Please write something for me.";
      }
      return "";
    },
    async submitContact() {
      const validationMessage = this.validateContact();
      if (validationMessage) {
        this.contactStatus = "error";
        this.contactFeedback = validationMessage;
        return;
      }
      this.contactStatus = "sending";
      this.contactFeedback = "Sending...";
      const API_URL = "https://api.emailjs.com/api/v1.0/email/send";
      const payload = {
        service_id: "service_ioeych3",
        template_id: "jm_xftqc27",
        user_id: "rke7kU1n5NYJuQ_vk",
        template_params: {
          from_name: this.contact.name.trim(),
          from_email: this.contact.email.trim(),
          message: this.contact.message.trim()
        }
      };
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error("Email service failed");
        }
        this.contactStatus = "success";
        this.contactFeedback = "Your message has been sent. Thank you!";
        this.contact.name = "";
        this.contact.email = "";
        this.contact.message = "";
      } catch (error) {
        console.error(error);
        this.contactStatus = "error";
        this.contactFeedback = "Something went wrong. Please try again later.";
      } finally {
        if (this.contactStatus === "sending") {
          this.contactStatus = "idle";
        }
        setTimeout(() => {
          if (this.contactStatus === "success") {
            this.contactFeedback = "";
          }
        }, 10000);
      }
    },
    toggleMobileNav() {
      this.mobileNavActive = !this.mobileNavActive;
      document.body.classList.toggle("mobile-nav-active", this.mobileNavActive);
    },
    closeMobileNav() {
      if (this.mobileNavActive) {
        this.mobileNavActive = false;
        document.body.classList.remove("mobile-nav-active");
      }
    }
  },
  mounted() {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      preloader.style.display = "none";
    }
    this.startTypedEffect();
    this.fetchPosts();
    window.addEventListener("scroll", this.onScroll);
    if (window.location.hash) {
      setTimeout(() => {
        this.scrollToSection(window.location.hash);
      }, 100);
    }
  }
}).mount("#app");
