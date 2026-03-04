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
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Météo Valmeinier via Open-Meteo ── */
  const METEO_URL =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=45.18&longitude=6.50' +
    '&current=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m,snowfall' +
    '&daily=weathercode,temperature_2m_max,temperature_2m_min,snowfall_sum' +
    '&timezone=Europe%2FParis' +
    '&forecast_days=4';

  function weatherInfo(code) {
    const map = {
      0:  { icon: '☀️',  desc: 'Ciel dégagé' },
      1:  { icon: '🌤️', desc: 'Peu nuageux' },
      2:  { icon: '⛅',  desc: 'Partiellement nuageux' },
      3:  { icon: '☁️',  desc: 'Couvert' },
      45: { icon: '🌫️', desc: 'Brouillard' },
      48: { icon: '🌫️', desc: 'Brouillard givrant' },
      51: { icon: '🌦️', desc: 'Bruine légère' },
      53: { icon: '🌦️', desc: 'Bruine modérée' },
      55: { icon: '🌧️', desc: 'Bruine dense' },
      61: { icon: '🌧️', desc: 'Pluie légère' },
      63: { icon: '🌧️', desc: 'Pluie modérée' },
      65: { icon: '🌧️', desc: 'Pluie forte' },
      71: { icon: '❄️',  desc: 'Neige légère' },
      73: { icon: '❄️',  desc: 'Neige modérée' },
      75: { icon: '❄️',  desc: 'Neige forte' },
      77: { icon: '🌨️', desc: 'Grésil' },
      80: { icon: '🌦️', desc: 'Averses légères' },
      81: { icon: '🌧️', desc: 'Averses modérées' },
      82: { icon: '⛈️',  desc: 'Averses violentes' },
      85: { icon: '🌨️', desc: 'Averses de neige' },
      86: { icon: '❄️',  desc: 'Neige forte' },
      95: { icon: '⛈️',  desc: 'Orage' },
      99: { icon: '⛈️',  desc: 'Orage violent' },
    };
    return map[code] ?? { icon: '🌡️', desc: 'Conditions variables' };
  }

  function dayLabel(dateStr, i) {
    if (i === 0) return 'Auj.';
    if (i === 1) return 'Dem.';
    return ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][new Date(dateStr).getDay()];
  }

  async function loadMeteo() {
    const currentEl  = document.getElementById('meteo-current');
    const forecastEl = document.getElementById('meteo-forecast');
    if (!currentEl) return;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res  = await fetch(METEO_URL, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const c    = data.current;
      const d    = data.daily;
      const info = weatherInfo(c.weathercode);

      currentEl.innerHTML = `
        <div class="meteo-icon">${info.icon}</div>
        <div class="meteo-temp">${Math.round(c.temperature_2m)}°C</div>
        <div class="meteo-details">
          <span class="meteo-desc">${info.desc}</span>
          <div class="meteo-extras">
            <span>🌡️ Ressenti ${Math.round(c.apparent_temperature)}°C</span>
            <span>💨 ${Math.round(c.windspeed_10m)} km/h</span>
            ${c.snowfall > 0 ? `<span>❄️ Neige ${c.snowfall} cm/h</span>` : ''}
            ${c.precipitation > 0 && c.snowfall === 0 ? `<span>🌧️ ${c.precipitation} mm</span>` : ''}
          </div>
        </div>`;

      if (forecastEl) {
        forecastEl.innerHTML = d.time.slice(0, 4).map((date, i) => {
          const fi = weatherInfo(d.weathercode[i]);
          return `<div class="meteo-day">
            <div class="meteo-day-name">${dayLabel(date, i)}</div>
            <div class="meteo-day-icon">${fi.icon}</div>
            <div class="meteo-day-temp">${Math.round(d.temperature_2m_max[i])}° <span>/ ${Math.round(d.temperature_2m_min[i])}°</span></div>
            ${d.snowfall_sum[i] > 0 ? `<div style="font-size:.7rem;color:#a8d4f0;">❄️ ${d.snowfall_sum[i]}cm</div>` : ''}
          </div>`;
        }).join('');
      }

    } catch (err) {
      if (currentEl) currentEl.innerHTML = `<span class="meteo-error">⚠️ Météo indisponible — <a href="https://www.valmeinier.com/" target="_blank" style="color:var(--amber);">voir valmeinier.com</a></span>`;
      console.warn('Météo erreur :', err.message);
    }
  }

  loadMeteo();

});

