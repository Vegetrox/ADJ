/* =====================================================
   ADJ – L'Antre du Joueur · script.js
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Sticky header shadow ── */
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });

  /* ── Scroll reveal ── */
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Cascade delay for siblings inside the same parent
        const siblings = [
          ...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')
        ];
        const delay = siblings.indexOf(entry.target) * 80;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => revealObserver.observe(el));

  /* ── Smooth anchor scrolling with header offset ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── Mobile hamburger menu ── */
  const hamburger = document.getElementById('hamburger');
  const nav = document.querySelector('nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Fermer le menu au clic sur un lien
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

});
