document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');
  const header = document.getElementById('header');

  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isOpen);
      nav.classList.toggle('nav--open');
    });

    // Close menu when clicking a link
    nav.querySelectorAll('.nav__link').forEach(function(link) {
      link.addEventListener('click', function() {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('nav--open');
      });
    });
  }

  // Sticky header shadow on scroll
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 10) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    });
  }
});
