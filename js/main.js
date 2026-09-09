// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

// Header scroll effect
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (header) {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});

// Close mobile nav when clicking a link
document.querySelectorAll('.nav-link, .dropdown a').forEach(link => {
  link.addEventListener('click', () => {
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
    }
  });
});

// Trip planner form → WhatsApp hand-off (ready for backend later)
function handlePlanner(e) {
  e.preventDefault();
  const form = e.target;
  const dest = form.destination?.value || '';
  const date = form['travel-date']?.value || '';
  const travellers = form.travellers?.value || '';
  const type = form['trip-type']?.value || '';
  const days = form.days?.value || '';
  const budget = form.budget?.value || '';
  const notes = form.notes?.value || '';

  let msg = `Hello, I am planning a trip to ${dest} on ${date}. We are a ${travellers} and we are planning for a ${type} trip.`;
  if (days) msg += ` Duration: ${days} days.`;
  if (budget) msg += ` Budget range: ${budget}.`;
  if (notes) msg += ` Special requirements: ${notes}.`;

  const phone = '919147413941';
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

// Attach to any form with class planner-form
document.querySelectorAll('.planner-form, #tripPlannerForm').forEach(form => {
  form.addEventListener('submit', handlePlanner);
});

// Capture UTM parameters for later backend use
(function captureUTM() {
  const params = new URLSearchParams(window.location.search);
  const utm = {
    source: params.get('utm_source') || 'organic',
    medium: params.get('utm_medium') || '',
    campaign: params.get('utm_campaign') || '',
    page: window.location.pathname
  };
  // Store temporarily so forms can include them when backend is ready
  sessionStorage.setItem('tpm_utm', JSON.stringify(utm));
})();

// Package itinerary: car travels from Day 1 → last day as the user scrolls
(function itineraryCar() {
  const layout = document.querySelector('.itin-layout');
  const days = document.querySelectorAll('.itin-day');
  const car = document.querySelector('.itin-car');
  const fill = document.querySelector('.itin-road-fill');
  const stops = document.querySelectorAll('.itin-stop');
  if (!layout || !days.length || !car || !fill) return;

  const total = days.length;

  stops.forEach((stop, i) => {
    const pos = total === 1 ? '0%' : ((i / (total - 1)) * 100) + '%';
    stop.style.setProperty('--stop', pos);
    stop.addEventListener('click', () => {
      days[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  function progress() {
    const first = days[0];
    const last = days[total - 1];
    const start = first.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.45;
    const end = last.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35;
    const raw = (window.scrollY - start) / Math.max(1, end - start);
    return Math.min(1, Math.max(0, raw));
  }

  function currentDayIndex(p) {
    return Math.min(total - 1, Math.round(p * (total - 1)));
  }

  function render() {
    const p = progress();
    const idx = currentDayIndex(p);
    if (isMobile()) {
      fill.style.width = (p * 100) + '%';
      fill.style.height = '100%';
      car.style.left = (p * 100) + '%';
      car.style.top = '50%';
    } else {
      fill.style.height = (p * 100) + '%';
      fill.style.width = '100%';
      car.style.top = (p * 100) + '%';
      car.style.left = '50%';
    }
    days.forEach((day, i) => day.classList.toggle('active', i === idx));
    stops.forEach((stop, i) => stop.classList.toggle('active', i === idx));
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      render();
      ticking = false;
    });
  }, { passive: true });

  window.addEventListener('resize', render);
  render();
})();

// Soft rise-in for cards as they enter the viewport
(function scrollReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cards = document.querySelectorAll(
    '.dest-card, .fav-card, .why-card, .pkg-cat, .review-card, .guide-card, .content-card'
  );
  if (!cards.length) return;

  cards.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = ((i % 4) * 0.08) + 's';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  cards.forEach((el) => io.observe(el));
})();
