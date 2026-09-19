/* Butterfly Kindergarten — shared behaviour
   Mobile navigation, footer year and contact-form validation. */

(function () {
  "use strict";

  /* --- Mobile navigation --------------------------------------------- */

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    // Close the menu after tapping a link on small screens.
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* --- Footer year ---------------------------------------------------- */

  Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* --- Progressive web app ------------------------------------------- */

  // Registers the service worker that makes the site installable and lets it
  // work offline. Needs https:// or localhost — it is skipped on file://.
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        // Reload once when an updated worker takes over, so a returning
        // visitor is not left looking at stale pages.
        var refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", function () {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });

        reg.addEventListener("updatefound", function () {
          var next = reg.installing;
          if (!next) return;
          next.addEventListener("statechange", function () {
            if (next.state === "installed" && navigator.serviceWorker.controller) {
              next.postMessage("skip-waiting");
            }
          });
        });
      })["catch"](function (err) {
        console.warn("Service worker registration failed:", err);
      });
    });
  }

  /* --- Install banner --------------------------------------------------
     Chrome and Edge fire beforeinstallprompt; we defer it and offer our own
     button. iOS Safari has no such event, so it gets a short instruction
     instead. Either way the banner only ever shows in a browser tab. */

  var DISMISS_KEY = "butterfly-install-dismissed";

  function stored(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function remember(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function buildBanner(bodyHtml, actionsHtml) {
    var bar = document.createElement("div");
    bar.className = "install-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Install this app");
    bar.innerHTML =
      '<div class="install-bar__text">' + bodyHtml + "</div>" +
      '<div class="install-bar__actions">' + actionsHtml +
      '<button class="btn btn--ghost" type="button" data-install-dismiss>Not now</button></div>';
    document.body.appendChild(bar);

    bar.querySelector("[data-install-dismiss]").addEventListener("click", function () {
      remember(DISMISS_KEY, "1");
      bar.remove();
    });

    requestAnimationFrame(function () { bar.classList.add("is-visible"); });
    return bar;
  }

  if (!isStandalone() && stored(DISMISS_KEY) !== "1") {
    var deferredPrompt = null;

    window.addEventListener("beforeinstallprompt", function (event) {
      event.preventDefault();
      deferredPrompt = event;

      var bar = buildBanner(
        "<strong>Install Butterfly Kindergarten</strong>" +
          "<span>Add it to your home screen — it works offline.</span>",
        '<button class="btn btn--primary" type="button" data-install-go>Install</button>'
      );

      bar.querySelector("[data-install-go]").addEventListener("click", function () {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () {
          deferredPrompt = null;
          remember(DISMISS_KEY, "1");
          bar.remove();
        });
      });
    });

    window.addEventListener("appinstalled", function () {
      remember(DISMISS_KEY, "1");
      var bar = document.querySelector(".install-bar");
      if (bar) bar.remove();
    });

    // iOS: no install event exists, so explain the Share-sheet route once.
    var ua = window.navigator.userAgent;
    var isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    var isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);

    if (isIOS && isSafari) {
      window.setTimeout(function () {
        if (document.querySelector(".install-bar")) return;
        buildBanner(
          "<strong>Add to your home screen</strong>" +
            "<span>Tap Share, then &ldquo;Add to Home Screen&rdquo;.</span>",
          ""
        );
      }, 2500);
    }
  }

  /* --- Contact form ---------------------------------------------------- */

  var form = document.getElementById("enquiryForm");
  if (!form) return;

  var status = document.getElementById("formStatus");
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var phonePattern = /^[+()\d\s-]{7,20}$/;

  function setError(field, message) {
    var wrapper = field.closest(".field");
    var slot = wrapper ? wrapper.querySelector(".error-msg") : null;

    if (wrapper) wrapper.classList.toggle("has-error", Boolean(message));
    if (slot) slot.textContent = message || "";
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validate(field) {
    var value = (field.value || "").trim();
    var label = field.getAttribute("data-label") || field.id;

    if (field.hasAttribute("required") && !value) {
      switch (label) {
        case "parentName": return "Please tell us your name.";
        case "email": return "We need an email address to reply to you.";
        case "childAge": return "Please choose your child's age group.";
        case "enquiryType": return "Please choose what your enquiry is about.";
        case "message": return "Please add a short message.";
        default: return "This field is required.";
      }
    }

    if (!value) return "";

    if (field.id === "parentName" && value.length < 2) {
      return "Please enter your full name.";
    }
    if (field.id === "email" && !emailPattern.test(value)) {
      return "That email address does not look quite right.";
    }
    if (field.id === "phone" && !phonePattern.test(value)) {
      return "Please use digits, spaces and + ( ) - only.";
    }
    if (field.id === "message" && value.length < 10) {
      return "A few more words would help us answer properly.";
    }

    return "";
  }

  var fields = Array.prototype.slice.call(
    form.querySelectorAll("input, select, textarea")
  );

  fields.forEach(function (field) {
    field.setAttribute("data-label", field.id);

    // Validate on blur, then clear the error as soon as it is fixed.
    field.addEventListener("blur", function () {
      setError(field, validate(field));
    });

    field.addEventListener("input", function () {
      var wrapper = field.closest(".field");
      if (wrapper && wrapper.classList.contains("has-error")) {
        setError(field, validate(field));
      }
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var firstInvalid = null;

    fields.forEach(function (field) {
      var message = validate(field);
      setError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      if (status) status.classList.remove("is-visible");
      firstInvalid.focus();
      return;
    }

    // No backend is wired up yet — confirm locally so the page stays useful
    // as a static site. Point this at a form handler when one is available.
    if (status) {
      status.textContent =
        "Thank you, " +
        form.parentName.value.trim().split(" ")[0] +
        "! Your enquiry has been noted. We usually reply within one working day.";
      status.classList.add("is-visible");
      status.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    form.reset();
    fields.forEach(function (field) {
      setError(field, "");
    });
  });
})();
