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
