/* ══════════════════════════════════════
   COORDONNÉES — injection JS anti-scraping
   Les coordonnées ne sont jamais présentes dans le HTML.
   Remplacer par les vraies valeurs.
══════════════════════════════════════ */
(function injectContact() {
  // Séparation en morceaux pour éviter la lecture directe par les bots
  const tel   = ['+33', '6', '00', '00', '00', '00'].join('\u00A0');
  const email = ['maeva', String.fromCharCode(64), 'bienetre', '.', 'fr'].join('');
  const insta = ['@', 'maeva', '.bienetre'].join('');
  const instaHandle = 'maeva.bienetre';

  const telEl    = document.getElementById('contact-tel');
  const emailEl  = document.getElementById('contact-email');
  const instaEl  = document.getElementById('contact-instagram');
  const telLink  = document.getElementById('contact-tel-link');
  const mailLink = document.getElementById('contact-email-link');
  const instaLink= document.getElementById('contact-instagram-link');

  if (telEl)    telEl.textContent    = tel;
  if (emailEl)  emailEl.textContent  = email;
  if (instaEl)  instaEl.textContent  = insta;
  if (telLink)  telLink.href  = 'tel:' + tel.replace(/\u00A0/g, '');
  if (mailLink) mailLink.href = ['mailto:', email].join('');
  if (instaLink)instaLink.href= 'https://instagram.com/' + instaHandle;
})();

/* ══════════════════════════════════════
   CONFIG FIREBASE
   Remplacer par vos valeurs Firebase Console > Paramètres du projet
══════════════════════════════════════ */
const FIREBASE_CONFIG = {
  apiKey:            "VOTRE_API_KEY",
  authDomain:        "votre-projet.firebaseapp.com",
  projectId:         "votre-projet-id",
  storageBucket:     "votre-projet.appspot.com",
  messagingSenderId: "000000000000",
  appId:             "1:000000000000:web:0000000000000000"
};

/* ══════════════════════════════════════
   INITIALISATION FIREBASE
   Si la config est encore un placeholder, le site affiche les données par défaut.
══════════════════════════════════════ */
function initFirebase() {
  if (FIREBASE_CONFIG.apiKey === 'VOTRE_API_KEY') return;
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    loadFromFirestore(firebase.firestore());
  } catch (e) {
    console.warn('Firebase non configuré :', e.message);
  }
}

async function loadFromFirestore(db) {
  try {
    const [contactSnap, diplomaSnap, formationsSnap] = await Promise.all([
      db.collection('config').doc('contact').get(),
      db.collection('config').doc('diploma').get(),
      db.collection('config').doc('formations').get(),
    ]);
    if (contactSnap.exists)    applyContact(contactSnap.data());
    if (diplomaSnap.exists)    applyDiploma(diplomaSnap.data());
    if (formationsSnap.exists) applyFormations(formationsSnap.data().items || []);
  } catch (e) {
    console.warn('Impossible de charger les données Firestore :', e.message);
  }
}

/* ── Coordonnées ────────────────────── */
function applyContact(data) {
  const telEl    = document.getElementById('contact-tel');
  const emailEl  = document.getElementById('contact-email');
  const instaEl  = document.getElementById('contact-instagram');
  const telLink  = document.getElementById('contact-tel-link');
  const mailLink = document.getElementById('contact-email-link');
  const instaLink= document.getElementById('contact-instagram-link');

  if (data.tel) {
    if (telEl)   telEl.textContent = data.tel;
    if (telLink) telLink.href = 'tel:' + data.tel.replace(/\s/g, '');
  }
  if (data.email) {
    if (emailEl)  emailEl.textContent = data.email;
    if (mailLink) mailLink.href = 'mailto:' + data.email;
  }
  if (data.instagram) {
    if (instaEl)   instaEl.textContent = data.instagram;
    if (instaLink) instaLink.href = 'https://instagram.com/' + data.instagram.replace('@', '');
  }
}

/* ── Diplôme ────────────────────────── */
function applyDiploma(data) {
  const nameEl       = document.getElementById('diploma-name');
  const orgEl        = document.getElementById('diploma-org');
  const linkEl       = document.getElementById('diploma-link');
  const nameApropos  = document.getElementById('diploma-name-apropos');

  if (data.name) {
    if (nameEl)      nameEl.textContent      = data.name;
    if (nameApropos) nameApropos.textContent = data.name;
  }
  if (data.org  && orgEl)  orgEl.textContent = data.org;
  if (data.url  && linkEl) linkEl.href        = data.url;
}

/* ── Formules ───────────────────────── */
function applyFormations(items) {
  items.forEach(item => {
    const card = document.querySelector(`[data-formation-id="${item.id}"]`);
    if (!card) return;

    const priceEl   = card.querySelector('[data-field="price"]');
    const descEl    = card.querySelector('[data-field="description"]');
    const linkEl    = card.querySelector('[data-field="stripeLink"]');
    const link3xEl  = card.querySelector('[data-field="stripeLinkInstalment"]');
    const noteEl    = card.querySelector('[data-field="priceNote"]');

    if (item.price       && priceEl)  priceEl.textContent  = item.price;
    if (item.description && descEl)   descEl.textContent   = item.description;
    if (item.stripeLink  && linkEl)   linkEl.href          = item.stripeLink;
    if (item.stripeLinkInstalment && link3xEl) link3xEl.href = item.stripeLinkInstalment;
    if (item.priceNote   && noteEl)   noteEl.textContent   = item.priceNote;
  });
}

/* ══════════════════════════════════════
   NAV — RÉTRÉCISSEMENT AU SCROLL
══════════════════════════════════════ */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('nav--scrolled', window.scrollY > 40);
}, { passive: true });

/* ══════════════════════════════════════
   SCROLL-REVEAL (Intersection Observer)
══════════════════════════════════════ */
document.head.insertAdjacentHTML('beforeend',
  '<style>.visible { opacity: 1 !important; transform: none !important; }</style>'
);

const revealTargets = document.querySelectorAll(
  '.feature-card, .card, .step, .faq__item, .credential, .diploma__card'
);

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealTargets.forEach((el, i) => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity .5s ease ${i * 0.05}s, transform .5s ease ${i * 0.05}s`;
  observer.observe(el);
});

/* ══════════════════════════════════════
   LANCEMENT
══════════════════════════════════════ */
initFirebase();
