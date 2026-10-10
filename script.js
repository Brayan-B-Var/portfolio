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

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
