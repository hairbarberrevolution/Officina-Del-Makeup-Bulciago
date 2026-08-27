(function () {
  "use strict";

  var contactEmail = "antonioconti@officinadelmakeup.it";
  var vatNumber = "04308400136";
  var openingHours = [
    { day: "Lunedì", intervals: [[510, 750], [870, 1140]] },
    { day: "Martedì", intervals: [[510, 750], [900, 1140]] },
    { day: "Mercoledì", intervals: [[510, 750], [900, 1140]] },
    { day: "Giovedì", intervals: [[510, 750], [900, 1140]] },
    { day: "Venerdì", intervals: [[510, 750], [900, 1140]] },
    { day: "Sabato", intervals: [[540, 750]] },
    { day: "Domenica", intervals: [] }
  ];

  function isOpenNow() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Rome",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date()).reduce(function (values, part) {
      values[part.type] = part.value;
      return values;
    }, {});
    var day = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[parts.weekday];
    var minutes = Number(parts.hour) * 60 + Number(parts.minute);
    return openingHours[day].intervals.some(function (interval) {
      return minutes >= interval[0] && minutes < interval[1];
    });
  }

  function renderFooterDetails() {
    var isOpen = isOpenNow();
    var statusText = isOpen ? "Siamo aperti" : "Siamo chiusi";
    var statusClass = isOpen ? "is-open" : "is-closed";
    var year = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Rome",
      year: "numeric"
    }).format(new Date());

    document.querySelectorAll("[data-hours-status]").forEach(function (status) {
      status.className = "hours-status " + statusClass;
      status.innerHTML = '<span class="status-dot"></span><strong>' +
        (isOpen ? "Ora siamo aperti, vieni a trovarci!" : "Ora siamo chiusi") +
        '</strong>';
    });

    document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
      link.href = "mailto:" + contactEmail;
      link.textContent = contactEmail;
    });

    document.querySelectorAll('a[href="cookie.html"]').forEach(function (link) {
      link.remove();
    });

    var contactDetails = document.querySelector(".contact-details");
    if (contactDetails && !contactDetails.querySelector(".contact-social")) {
      contactDetails.insertAdjacentHTML("beforeend",
        '<div class="contact-item"><small>P. IVA</small><span>04308400136</span></div>' +
        '<div class="contact-item contact-social"><small>Seguici</small><a href="https://www.facebook.com/officinadelmakeup" target="_blank" rel="noopener">Facebook</a><span> · </span><a href="https://www.instagram.com/officinadelmakeup" target="_blank" rel="noopener">Instagram</a></div>');
    }

    document.querySelectorAll(".site-footer").forEach(function (footer) {
      var contactList = footer.querySelectorAll(".footer-links")[1];
      if (contactList && !contactList.querySelector(".footer-vat")) {
        contactList.insertAdjacentHTML("beforeend",
          '<li class="footer-vat">P. IVA: ' + vatNumber + '</li>' +
          '<li><a href="https://www.facebook.com/officinadelmakeup" target="_blank" rel="noopener">Facebook</a></li>' +
          '<li><a href="https://www.instagram.com/officinadelmakeup" target="_blank" rel="noopener">Instagram</a></li>');
      }

      if (!footer.querySelector(".footer-hours")) {
        var hours = document.createElement("div");
        hours.className = "footer-hours";
        hours.innerHTML =
          '<p class="footer-title">Orari</p>' +
          '<div class="footer-status ' + statusClass + '"><span class="status-dot"></span><span>' + statusText + '</span></div>' +
          '<div class="footer-hours-list">' +
          '<span>Lun 08:30 - 12:30 / 14:30 - 19:00</span>' +
          '<span>Mar - Ven 08:30 - 12:30 / 15:00 - 19:00</span>' +
          '<span>Sab 09:00 - 12:30</span>' +
          '<span>Dom Chiuso</span>' +
          '</div>';
        footer.querySelector(".footer-top").appendChild(hours);
      }

      var copyright = footer.querySelector(".footer-copyright");
      if (copyright) {
        copyright.textContent = "© " + year + " Officina del Make-Up di Antonio Conti";
      }
      var legalLinks = footer.querySelector(".footer-bottom > span:last-child");
      if (legalLinks) {
        legalLinks.innerHTML = '<a href="privacy.html">Privacy Policy</a>';
      }
    });
  }

  function initBrandCarousel() {
    var carousel = document.querySelector("[data-brand-carousel]");
    if (!carousel) return;

    var viewport = carousel.querySelector(".brand-viewport");
    var cards = Array.prototype.slice.call(carousel.querySelectorAll(".brand-card"));
    var previous = carousel.querySelector("[data-brand-prev]");
    var next = carousel.querySelector("[data-brand-next]");
    var timer;

    function cardStep() {
      if (!cards.length) return 0;
      var gap = parseFloat(window.getComputedStyle(viewport.querySelector(".brand-track")).columnGap) || 16;
      return cards[0].getBoundingClientRect().width + gap;
    }

    function move(direction) {
      var step = cardStep();
      if (!step) return;
      var atStart = viewport.scrollLeft <= 4;
      var atEnd = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 4;
      if (direction > 0 && atEnd) {
        viewport.scrollTo({ left: 0, behavior: "smooth" });
      } else if (direction < 0 && atStart) {
        viewport.scrollTo({ left: viewport.scrollWidth, behavior: "smooth" });
      } else {
        viewport.scrollBy({ left: direction * step, behavior: "smooth" });
      }
    }

    function startAutoplay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () { move(1); }, 3000);
    }

    if (previous) previous.addEventListener("click", function () { move(-1); startAutoplay(); });
    if (next) next.addEventListener("click", function () { move(1); startAutoplay(); });
    carousel.addEventListener("mouseenter", function () { window.clearInterval(timer); });
    carousel.addEventListener("mouseleave", startAutoplay);
    carousel.addEventListener("focusin", function () { window.clearInterval(timer); });
    carousel.addEventListener("focusout", startAutoplay);
    startAutoplay();
  }

  function initTicker() {
    var ticker = document.querySelector(".ticker-track");
    var sequence = ticker && ticker.querySelector(".ticker-sequence");
    if (!ticker || !sequence) return;

    function setDistance() {
      var sequenceWidth = sequence.getBoundingClientRect().width;
      var viewportWidth = ticker.parentElement ? ticker.parentElement.clientWidth : window.innerWidth;

      while (ticker.scrollWidth < viewportWidth + sequenceWidth) {
        var clone = sequence.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        ticker.appendChild(clone);
      }

      ticker.style.setProperty("--ticker-end", "-" + sequenceWidth + "px");
    }

    setDistance();
    window.addEventListener("resize", setDistance);
  }

  function initReviewCounter() {
    var counter = document.querySelector("[data-review-counter]");
    if (!counter) return;

    var reducedMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      counter.textContent = "100%";
      return;
    }

    var started = false;

    function animate() {
      if (started) return;
      started = true;

      var startTime = null;
      var duration = 2000;

      function step(timestamp) {
        if (startTime === null) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        counter.textContent = Math.round(progress * 100) + "%";
        if (progress < 1) window.requestAnimationFrame(step);
      }

      window.requestAnimationFrame(step);
    }

    counter.textContent = "0%";

    if ("IntersectionObserver" in window) {
      var counterObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      counterObserver.observe(counter);
    } else {
      animate();
    }
  }

  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("open", !isOpen);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("open");
      });
    });
  }

  var revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealItems.length) {
    var observer = new IntersectionObserver(function (entries, currentObserver) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("visible");
    });
  }

  renderFooterDetails();
  initBrandCarousel();
  initTicker();
  initReviewCounter();
  window.setInterval(renderFooterDetails, 60000);
}());