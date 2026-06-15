/* ===========================================
   NAV — scrolled state
   =========================================== */

const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ===========================================
   HAMBURGER / MOBILE MENU
   =========================================== */

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  mobileMenu.classList.toggle('open', isOpen);
  mobileMenu.setAttribute('aria-hidden', !isOpen);
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
  });
});

/* ===========================================
   BOOKING MODAL
   =========================================== */

const modal      = document.getElementById('booking-modal');
const overlay    = document.getElementById('modal-overlay');
const closeBtn   = document.getElementById('modal-close');
const formView   = document.getElementById('modal-form-view');
const successView = document.getElementById('modal-success-view');
const successCloseBtn = document.getElementById('modal-success-close');

function openModal() {
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  // Focus the first input for accessibility
  setTimeout(() => {
    const first = modal.querySelector('input, button');
    if (first) first.focus();
  }, 50);
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
}

function resetModal() {
  formView.hidden = false;
  successView.hidden = true;
  document.getElementById('booking-form').reset();
  clearErrors();
}

// Open on any .js-open-booking trigger
document.querySelectorAll('.js-open-booking').forEach(el => {
  el.addEventListener('click', () => {
    resetModal();
    openModal();
  });
});

overlay.addEventListener('click', closeModal);
closeBtn.addEventListener('click', closeModal);
successCloseBtn.addEventListener('click', closeModal);

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

/* ===========================================
   FORM VALIDATION & SUBMISSION
   =========================================== */

const form       = document.getElementById('booking-form');
const nameInput  = document.getElementById('f-name');
const emailInput = document.getElementById('f-email');
const phoneInput = document.getElementById('f-phone');
const submitBtn  = document.getElementById('submit-btn');
const submitLabel   = document.getElementById('submit-label');
const submitLoading = document.getElementById('submit-loading');

function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  ['err-name', 'err-contact', 'err-global'].forEach(id => setError(id, ''));
  [nameInput, emailInput, phoneInput].forEach(el => el.classList.remove('has-error'));
}

function validate() {
  clearErrors();
  let valid = true;

  if (!nameInput.value.trim()) {
    setError('err-name', 'Please enter your name.');
    nameInput.classList.add('has-error');
    nameInput.focus();
    valid = false;
  }

  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  if (!email && !phone) {
    setError('err-contact', 'Please provide at least an email or phone number.');
    emailInput.classList.add('has-error');
    phoneInput.classList.add('has-error');
    if (valid) emailInput.focus();
    valid = false;
  }

  return valid;
}

function setLoading(on) {
  submitBtn.disabled = on;
  submitLabel.hidden = on;
  submitLoading.hidden = !on;
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!validate()) return;

  setLoading(true);

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      formView.hidden = true;
      successView.hidden = false;
      successCloseBtn.focus();
    } else {
      const data = await res.json().catch(() => ({}));
      const msg = data?.errors?.map(err => err.message).join(', ')
        || 'Something went wrong. Please email us directly.';
      setError('err-global', msg);
    }
  } catch {
    setError('err-global', 'Could not send. Please email us at hello@medpathprep.com');
  } finally {
    setLoading(false);
  }
});

// Clear inline errors as user types
[nameInput, emailInput, phoneInput].forEach(input => {
  input.addEventListener('input', () => {
    input.classList.remove('has-error');
    if (input === nameInput) setError('err-name', '');
    if (input === emailInput || input === phoneInput) setError('err-contact', '');
  });
});

/* ===========================================
   FAQ ACCORDION
   =========================================== */

document.querySelectorAll('.faq__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq__q').forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      other.nextElementSibling.classList.remove('open');
    });

    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

/* ===========================================
   SMOOTH SCROLL (offset for fixed nav)
   =========================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id === '#' || id === '#top') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 12;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

/* ===========================================
   SCROLL REVEAL
   =========================================== */

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.why__card, .service-card, .sr-card, .faq__item').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 55}ms`;
  revealObserver.observe(el);
});
