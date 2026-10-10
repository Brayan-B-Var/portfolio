/* ==========================================================
   Brayan B Varghese – portfolio
   Mobile menu, active-section highlighting, copy email, year
   ========================================================== */

(function () {
  "use strict";

  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll("a")) : [];

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close after choosing a destination
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });

    // Escape closes the menu and returns focus to the button
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });

    // Reset when the viewport grows past the mobile breakpoint
    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) setMenu(false);
    });
  }

  /* ---------- Active section in navigation ---------- */
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href").slice(1);
      return document.getElementById(id);
    })
    .filter(Boolean);

  function setCurrent(id) {
    navLinks.forEach(function (link) {
      if (link.getAttribute("href") === "#" + id) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      },
      // A section counts as current when it crosses the upper-middle of the viewport
      { rootMargin: "-35% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach(function (section) { observer.observe(section); });

    // Clear the highlight when back in the hero
    var hero = document.querySelector(".hero");
    if (hero) {
      new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            navLinks.forEach(function (l) { l.removeAttribute("aria-current"); });
          }
        },
        { rootMargin: "-35% 0px -60% 0px", threshold: 0 }
      ).observe(hero);
    }
  }

  /* ---------- Copy email ---------- */
  var copyBtn = document.querySelector(".copy-btn");
  var status = document.querySelector(".copy-status");
  var statusTimer;

  function announce(message) {
    if (!status) return;
    status.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { status.textContent = ""; }, 3500);
  }

  function fallbackCopy(text) {
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "-1000px";
    document.body.appendChild(field);
    field.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    document.body.removeChild(field);
    return ok;
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = copyBtn.getAttribute("data-copy");

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
          function () { announce("Email address copied."); },
          function () {
            announce(fallbackCopy(text) ? "Email address copied." : "Copy failed. Select the address above instead.");
          }
        );
      } else {
        announce(fallbackCopy(text) ? "Email address copied." : "Copy failed. Select the address above instead.");
      }
    });
  }


  /* ---------- Scroll reveal ---------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  var ruleSections = Array.prototype.slice.call(document.querySelectorAll(".section"));

  // Stagger siblings and icons
  revealItems.forEach(function (el) {
    var siblings = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.hasAttribute("data-reveal");
    }) : [];
    el.style.setProperty("--i", String(Math.max(siblings.indexOf(el), 0)));
    Array.prototype.forEach.call(el.querySelectorAll(".icon-list li"), function (li, n) {
      li.querySelector(".ico").style.setProperty("--j", String(n));
    });
  });

  function show(el) { el.classList.add("is-visible"); }

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          show(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    revealItems.concat(ruleSections).forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.concat(ruleSections).forEach(show);
  }

  /* ---------- Scroll progress ---------- */
  var bar = document.querySelector(".progress span");
  var ticking = false;

  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    if (bar) bar.parentElement.style.setProperty("--p", p.toFixed(4));
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
