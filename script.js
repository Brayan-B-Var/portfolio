/* ==========================================================
   Brayan B Varghese – portfolio
   Mobile menu, active-section highlighting, copy email, year
   ========================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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


  /* ---------- Section headings: split into words for the rise effect ---------- */
  if (!reduceMotion) {
    Array.prototype.forEach.call(document.querySelectorAll(".section-head h2"), function (h) {
      var words = h.textContent.trim().split(/\s+/);
      h.textContent = "";
      words.forEach(function (word, i) {
        var mask = document.createElement("span");
        var inner = document.createElement("span");
        mask.className = "w";
        inner.className = "w-in";
        inner.style.setProperty("--w", String(i));
        inner.textContent = word;
        mask.appendChild(inner);
        h.appendChild(mask);
        if (i < words.length - 1) h.appendChild(document.createTextNode(" "));
      });
      h.classList.add("split");
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

  /* ---------- Parallax, header hide on scroll ---------- */
  var hero = document.querySelector(".hero");
  var portrait = document.querySelector(".portrait");
  var nameShift = document.querySelector(".line-indent .line-inner");
  var header = document.querySelector(".site-header");
  var lastY = window.scrollY;
  var motionTicking = false;

  function motionFrame() {
    var y = window.scrollY;

    if (hero) {
      var p = Math.min(Math.max(y / hero.offsetHeight, 0), 1);
      if (portrait) portrait.style.setProperty("--py", (p * 60).toFixed(1) + "px");
      if (nameShift) nameShift.style.setProperty("--tx", (p * 70).toFixed(1) + "px");
    }

    if (header) {
      var menuOpen = toggle && toggle.getAttribute("aria-expanded") === "true";
      if (y > 160 && y > lastY + 4 && !menuOpen && !header.contains(document.activeElement)) {
        header.classList.add("is-hidden");
      } else if (y < lastY - 4 || y <= 160) {
        header.classList.remove("is-hidden");
      }
    }
    lastY = y;
    motionTicking = false;
  }

  if (!reduceMotion) {
    window.addEventListener("scroll", function () {
      if (!motionTicking) { motionTicking = true; window.requestAnimationFrame(motionFrame); }
    }, { passive: true });
    if (header) {
      header.addEventListener("focusin", function () { header.classList.remove("is-hidden"); });
    }
  }

  /* ---------- Magnetic buttons ---------- */
  if (!reduceMotion && finePointer) {
    Array.prototype.forEach.call(document.querySelectorAll(".btn, .copy-btn"), function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) / r.width;
        var y = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.translate = (x * 10).toFixed(1) + "px " + (y * 8).toFixed(1) + "px";
      });
      el.addEventListener("pointerleave", function () { el.style.translate = ""; });
    });
  }

  /* ---------- Hero name: letters respond to the cursor ---------- */
  var heroTitle = document.querySelector(".hero-title");

  if (heroTitle && !reduceMotion) {
    heroTitle.setAttribute("aria-label", heroTitle.textContent.replace(/\s+/g, " ").trim());
    var letters = [];

    Array.prototype.forEach.call(heroTitle.querySelectorAll(".line-inner"), function (line) {
      var text = line.textContent;
      line.textContent = "";
      text.split("").forEach(function (ch) {
        if (ch === " ") {
          line.appendChild(document.createTextNode(" "));
          return;
        }
        var span = document.createElement("span");
        span.className = "ch";
        span.textContent = ch;
        line.appendChild(span);
        letters.push(span);
      });
    });

    var pointer = null;
    var nameTicking = false;

    function paintLetters() {
      nameTicking = false;
      var radius = parseFloat(getComputedStyle(heroTitle).fontSize) * 1.5;
      letters.forEach(function (el) {
        var k = 0;
        if (pointer) {
          var r = el.getBoundingClientRect();
          var dx = pointer.x - (r.left + r.width / 2);
          var dy = pointer.y - (r.top + r.height / 2);
          var d = Math.sqrt(dx * dx + dy * dy);
          k = Math.max(0, 1 - d / radius);
          k = k * k * (3 - 2 * k);           // smooth falloff
        }
        el.style.setProperty("--k", k.toFixed(3));
      });
    }

    function queuePaint() {
      if (!nameTicking) { nameTicking = true; window.requestAnimationFrame(paintLetters); }
    }

    function track(e) { pointer = { x: e.clientX, y: e.clientY }; queuePaint(); }
    function release() { pointer = null; queuePaint(); }

    heroTitle.addEventListener("pointermove", track);
    heroTitle.addEventListener("pointerdown", track);
    heroTitle.addEventListener("pointerleave", release);
    heroTitle.addEventListener("pointerup", function (e) { if (e.pointerType !== "mouse") release(); });
    heroTitle.addEventListener("pointercancel", release);
  }

  /* ---------- Portrait: image drifts against the cursor for depth ---------- */
  var portraitFrame = document.querySelector(".portrait");
  var portraitImg = portraitFrame ? portraitFrame.querySelector("img") : null;

  if (portraitFrame && portraitImg && !reduceMotion && finePointer) {
    var depth = 14; // maximum shift in pixels
    portraitFrame.addEventListener("pointermove", function (e) {
      var r = portraitFrame.getBoundingClientRect();
      var nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      var ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      portraitImg.style.setProperty("--ix", (-nx * depth).toFixed(1) + "px");
      portraitImg.style.setProperty("--iy", (-ny * depth).toFixed(1) + "px");
    });
    portraitFrame.addEventListener("pointerleave", function () {
      portraitImg.style.setProperty("--ix", "0px");
      portraitImg.style.setProperty("--iy", "0px");
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
