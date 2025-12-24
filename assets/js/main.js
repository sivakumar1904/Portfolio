(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos,
      behavior: 'smooth'
    })
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('body').classList.toggle('mobile-nav-active')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let body = select('body')
      if (body.classList.contains('mobile-nav-active')) {
        body.classList.remove('mobile-nav-active')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Preloader
   */
  let preloader = select('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove()
    });
  }

  /**
   * Hero type effect
   */
  const typed = select('.typed')
  if (typed) {
    let typed_strings = typed.getAttribute('data-typed-items')
    typed_strings = typed_strings.split(',')
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Skills animation (updated for stylish tiles)
   *
   * - Works with two patterns:
   *   1) .skill-bar-fill elements (inside skill tiles) with aria-valuenow
   *   2) fallback for older .progress .progress-bar (kept for backwards compat)
   *
   * Uses Waypoint to trigger animation when skills section scrolls into view.
   */
  let skillsSection = select('#skills');
  if (skillsSection) {
    // Use Waypoint if available, otherwise run immediately on load
    const animateSkillFills = () => {
      // animate new tile fills: .skill-bar-fill
      const fills = select('.skill-bar-fill', true) || [];
      fills.forEach((fill, idx) => {
        // value from aria-valuenow on the fill, or from nearest .skill-card data-value
        let val = parseInt(fill.getAttribute('aria-valuenow') || 0, 10);
        if (!val) {
          // fallback: ancestor .skill-card has data-value
          const card = fill.closest('.skill-card');
          if (card && card.getAttribute('data-value')) {
            val = parseInt(card.getAttribute('data-value'), 10) || 0;
          }
        }
        val = Math.max(0, Math.min(100, val || 0));
        // stagger animation
        setTimeout(() => {
          fill.style.width = val + '%';
        }, 120 + idx * 80);
      });

      // backward-compat: animate legacy .progress .progress-bar if present
      const legacy = select('.progress .progress-bar', true) || [];
      legacy.forEach((el) => {
        el.style.width = el.getAttribute('aria-valuenow') + '%'
      });
    };

    // If Waypoint library is present, use that to trigger when skills are visible
    if (typeof Waypoint !== 'undefined') {
      new Waypoint({
        element: skillsSection,
        offset: '80%',
        handler: function(direction) {
          animateSkillFills();
        }
      });
    } else {
      // fallback: animate on load and also on scroll (once)
      let animated = false;
      const tryAnimate = () => {
        if (animated) return;
        // basic check: is skills section in viewport?
        const rect = skillsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          animateSkillFills();
          animated = true;
        }
      };
      window.addEventListener('load', tryAnimate);
      window.addEventListener('scroll', tryAnimate);
      // also call immediately
      tryAnimate();
    }
  }

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        portfolioIsotope.on('arrangeComplete', function() {
          AOS.refresh()
        });
      }, true);
    }

  });

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Initiate portfolio details lightbox 
   */
  const portfolioDetailsLightbox = GLightbox({
    selector: '.portfolio-details-lightbox',
    width: '90%',
    height: '90vh'
  });

  /**
   * Portfolio details slider
   */
  new Swiper('.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Testimonials slider
   */
  new Swiper('.testimonials-slider', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  });

  /**
   * Initiate Pure Counter 
   */
  new PureCounter();

})();


/* ============================
   SMOOTH SCROLL + ACTIVE NAV
=========================== */
const navLinks = document.querySelectorAll(".nav-menu a");

navLinks.forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    const target = document.querySelector(this.getAttribute("href"));
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    // active class switch
    navLinks.forEach(l => l.classList.remove("active"));
    this.classList.add("active");
  });
});

/* Highlight on scroll */
window.addEventListener("scroll", () => {
  let scrollPos = window.scrollY + 150;

  navLinks.forEach(link => {
    const section = document.querySelector(link.getAttribute("href"));

    if (
      scrollPos >= section.offsetTop &&
      scrollPos < section.offsetTop + section.offsetHeight
    ) {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    }
  });
});




// optional: gentle overshoot then settle for premium feel
document.querySelectorAll('.skill-bar-fill').forEach((fill, idx) => {
  const val = parseInt(fill.getAttribute('aria-valuenow') || fill.closest('.skill-card')?.dataset.value || 0, 10);
  const final = Math.max(0, Math.min(100, val));
  setTimeout(() => {
    // go to final + small overshoot then back
    fill.style.width = Math.min(100, final + 6) + '%';
    setTimeout(() => { fill.style.width = final + '%'; }, 420);
  }, 120 + idx * 80);
});


// Project filter logic
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      if (filter === "all" || card.classList.contains(filter)) {
        card.classList.remove("hide");
      } else {
        card.classList.add("hide");
      }
    });
  });
});


/* ==========================================================
   FULL SITE DARK / LIGHT MODE SWITCH (FINAL WORKING VERSION)
========================================================== */
const themeBtn = document.getElementById("themeToggle");
const heroImg = document.querySelector(".hero-bg");

// Light & Dark Images (same image allowed)
const lightHero = "assets/img/hero1-bg.jpeg";
const darkHero  = "assets/img/hero1-bg.jpeg";

/* ----------------------------------------
   STEP 1: Ensure DEFAULT theme = LIGHT MODE
----------------------------------------- */
if (!localStorage.getItem("theme")) {
  localStorage.setItem("theme", "light");
}

const savedTheme = localStorage.getItem("theme");

/* -----------------------------------------------------
   STEP 2: Apply saved theme on page load
----------------------------------------------------- */
if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
  document.body.classList.remove("light-mode");

  themeBtn.innerHTML = `<i class="bx bx-sun"></i>`;
  if (heroImg) heroImg.src = darkHero;

} else {
  document.body.classList.add("light-mode");
  document.body.classList.remove("dark-mode");

  themeBtn.innerHTML = `<i class="bx bx-moon"></i>`;
  if (heroImg) heroImg.src = lightHero;
}

/* -----------------------------------------------------
   STEP 3: Toggle Theme
----------------------------------------------------- */
themeBtn.addEventListener("click", () => {
  if (document.body.classList.contains("dark-mode")) {
    
    // Switch → LIGHT MODE
    document.body.classList.add("light-mode");
    document.body.classList.remove("dark-mode");

    themeBtn.innerHTML = `<i class="bx bx-moon"></i>`;
    if (heroImg) heroImg.src = lightHero;

    localStorage.setItem("theme", "light");

  } else {

    // Switch → DARK MODE
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");

    themeBtn.innerHTML = `<i class="bx bx-sun"></i>`;
    if (heroImg) heroImg.src = darkHero;

    localStorage.setItem("theme", "dark");
  }
});

/* ======================
       PARALLAX HERO
====================== */
window.addEventListener("scroll", () => {
  const heroImg = document.querySelector(".hero-bg");
  heroImg.style.transform = `translateY(${window.scrollY * 0.25}px)`;
});



// ======================
// RESUME MODAL (CLEAN)
// ======================

function openResumeModal() {
  document.getElementById("resumeModal").style.display = "flex";
}

function closeResumeModal() {
  document.getElementById("resumeModal").style.display = "none";
}

function openResume(path) {
  window.open(path, "_blank");
}

// ===============================
// DOWNLOAD CV MODAL (FINAL FIX)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("downloadCvBtn");
  const modal = document.getElementById("resumeModal");
  const closeBtn = document.getElementById("closeResume");

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      modal.style.display = "flex";
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  document.querySelectorAll(".resume-option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const pdf = btn.getAttribute("data-pdf");
      window.open(pdf, "_blank"); // preview + download option
    });
  });
});
