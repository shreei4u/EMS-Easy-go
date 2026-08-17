/* ============================================================
   EMS-ExpenseEasy — Application JavaScript
   Extracted from the single-file HTML build.
   Load order matches the original <script> tag order.
   ============================================================ */

/* ---------- <script id="ee-app"> ---------- */
/**
 * ============================================================
 *  Expense Easy — Application JavaScript  v1.0.0
 *  Unified Expense, Advance, Declaration Voucher &
 *  Approval Management Console
 * ============================================================
 *
 *  TABLE OF CONTENTS
 *  -----------------
 *   1.  Configuration & Constants
 *   2.  Utility Helpers
 *   3.  Notification / Toast System
 *   4.  Login & Authentication
 *   5.  Portal Switcher (Top Nav)
 *   6.  Sidebar Navigation & View Switcher
 *   7.  Modal System
 *   8.  Group / Department Access Control
 *   9.  Company Admin — Company Switcher
 *  10.  Company Admin — Tab Toggle (Table / Card)
 *  11.  Submit Expense — Attach Bill Tabs
 *  12.  Submit Expense — Geolocation Branch Detection
 *  13.  Submit Expense — Form Submission & Voucher Number
 *  14.  Declaration Voucher — Preview / Print / Download
 *  15.  Manager / HOD Approval Workflow
 *  16.  Finance Approval & Settlement Workflow
 *  17.  Approval Limit Enforcement
 *  18.  Voucher Prefix (Company Admin Settings)
 *  19.  Dashboard Live Stats
 *  20.  Ledger — Balance Calculation
 *  21.  Tour Request — Status Update
 *  22.  Dispute Request — Submission
 *  23.  Super Admin — Platform Controls
 *  24.  Search / Filter (Tables)
 *  25.  Keyboard Shortcuts
 *  26.  Initialisation
 * ============================================================
 */

'use strict';

/* ============================================================
   1. CONFIGURATION & CONSTANTS
   ============================================================ */

/**
 * Directory of demo login accounts (UI prototype — replace with real auth in production).
 * The login screen has a single Username/Password pair; role, company and department
 * are resolved automatically from whichever account matches.
 */
const EE_CREDENTIALS = [
  {
    username: 'shreekant@shieldinfrasolutions.in',
    password: 'Shree#2425@22267',
    role: 'superadmin',
    name: 'Shreekant Sharma',
    title: 'Super Admin',
    company: 'CO-0001',
  },
  {
    username: 'sispl26@zohomail.in',
    password: 'Dk@2026',
    role: 'companyadmin',
    name: 'Deepak Kumar',
    title: 'Client Admin',
    company: 'CO-0004',
  },
  {
    username: 'stechmint@gmail.com',
    password: 'Dk@2026',
    role: 'employee',
    name: 'D Kumar',
    title: 'HOD',
    company: 'CO-0004',
    department: 'Administration',
    isGroup: false,
  },
  {
    username: 'mailme.shreekant@gmail.com',
    password: 'Dk@2026',
    role: 'employee',
    name: 'Rajiv Kumar',
    title: 'Approving Manager',
    company: 'CO-0004',
    department: 'Finance',
    isGroup: false,
  },
  {
    username: 'shreekantnulm@gmail.com',
    password: 'Dk@2026',
    role: 'employee',
    name: 'R Kumar',
    title: 'User',
    company: 'CO-0004',
    department: 'Group',
    isGroup: true,
  },
];

const EE_CONFIG = {
  /** Approval limits in INR. Synced from Masters & Policy in real backend. */
  APPROVAL_LIMITS: {
    manager : 3000,
    hod     : 25000,
    finance : 100000,
  },

  /** Default voucher prefixes. Overrideable by Company Admin → Settings. */
  VOUCHER_PREFIX: {
    expense     : 'EXP',
    declaration : 'SDV',
    advance     : 'ADV',
    tour        : 'TOR',
    bulkreport  : 'BR',
    dispatch    : 'DSP',
  },

  /** Which portals each login role may access. */
  ROLE_PORTALS: {
    employee     : ['employee'],
    companyadmin : ['companyadmin'],
    superadmin   : ['superadmin', 'companyadmin'],
  },

  ROLE_LABELS: {
    employee     : 'Employee / Manager / Finance',
    companyadmin : 'Company Admin',
    superadmin   : 'Super Admin',
  },
};

/** Company master (demo data — replaced by API in production). */
const COMPANY_DATA = {
  'CO-0001': { name: 'Shield Infra Solutions Pvt Ltd', plan: 'Enterprise Plan', prefixExpense: 'SIS-EXP', prefixDecl: 'SIS-SDV', useCustomPrefix: true  },
  'CO-0002': { name: 'Vertex Builders Pvt Ltd',         plan: 'Pro Plan',        prefixExpense: '',        prefixDecl: '',        useCustomPrefix: false },
  'CO-0003': { name: 'Nexora Tech',                     plan: 'Starter Plan',    prefixExpense: '',        prefixDecl: '',        useCustomPrefix: false },
  'CO-0004': { name: 'DK Solutions',                    plan: 'Pro Plan',        prefixExpense: '',        prefixDecl: '',        useCustomPrefix: false },
};

/** Current session state (populated on login). */
const EE_SESSION = {
  role       : null,
  department : null,
  company    : null,
  username   : null,
  isGroup    : false,
  title      : null, // 'User' | 'Approving Manager' | 'HOD' | 'Client Admin' | 'Super Admin'
  name       : null,
};

/**
 * Shared pool of the logged-in employee's own expense entries — fed by
 * Submit Expense and Declaration Voucher on submission, and consumed by
 * Bulk Report for date-wise / project-wise / manual selection. Seeded with
 * a few illustrative entries so Bulk Report isn't empty on first load.
 * Each entry: { id, no, date, project, head, amount, status, source }
 * status: 'draft' (selectable) | 'submitted' (in a bulk batch) | 'approved'
 */
const EE_EXPENSE_POOL = [
  { id: 'i1', no: 'EXP/26/0381', date: '2026-06-27', project: 'Client — Bajaj Engagement', head: 'Client Entertainment',          amount: 2200,  status: 'draft', source: 'expense' },
  { id: 'i2', no: 'SDV/26/0039', date: '2026-06-27', project: 'Internal — Admin',               head: 'Local Conveyance (Declared)', amount: 180,   status: 'draft', source: 'declaration' },
  { id: 'i3', no: 'EXP/26/0375', date: '2026-06-24', project: 'Client — TVS Rollout',        head: 'Fuel',                       amount: 1650,  status: 'draft', source: 'expense' },
  { id: 'i4', no: 'EXP/26/0368', date: '2026-06-20', project: 'Client — Bajaj Engagement',   head: 'Lodging',                    amount: 3400,  status: 'draft', source: 'expense' },
  { id: 'i5', no: 'ADV/26/0012', date: '2026-06-18', project: 'Internal — Admin',                head: 'Advance Adjustment',         amount: 24000, status: 'draft', source: 'expense' },
  { id: 'i6', no: 'EXP/26/0355', date: '2026-06-15', project: 'Client — TVS Rollout',        head: 'Courier / Postage',          amount: 340,   status: 'draft', source: 'expense' },
  { id: 'i7', no: 'EXP/26/0349', date: '2026-06-12', project: 'Client — Bajaj Engagement',   head: 'Printing & Stationery',      amount: 560,   status: 'draft', source: 'expense' },
  { id: 'i8', no: 'SDV/26/0031', date: '2026-06-08', project: 'Internal — Admin',                head: 'Toll / Parking',             amount: 120,   status: 'draft', source: 'declaration' },
];

/** Bulk report batches — filled in by initBulkReport(), read by Dispatch. */
const EE_BULK_REPORTS = [];

/** Physical courier dispatch log — filled in by initDispatch(). */
const EE_DISPATCHES = [];

/**
 * Cross-role notification log. A dispatch "Submit & Notify" pushes one
 * entry here; every role's dashboard/queue reads the same array, which is
 * how this single-page prototype simulates a notification reaching
 * User → Manager → HOD → Finance → Admin at once.
 */
const EE_NOTIFICATIONS = [];

/** Outstanding-amount alert thresholds by login title (see Dispatch menu). */
const EE_OUTSTANDING_THRESHOLDS = {
  'User': 20000,
  'Approving Manager': 40000,
  'HOD': 60000,
  'Client Admin': 80000,
  'Super Admin': 80000,
};

/**
 * Client-wise Approval Role Mapping — per employee, per company. Each entry
 * names the actual 1st/2nd/Finance approving authority and their limit,
 * more granular than the blanket company-wide limits in Approval Policy.
 * Editable from both the Super Admin panel (any client) and the Company
 * Admin panel (their own client only).
 */
const EE_APPROVAL_MAPPING = [
  {
    id: 'map-1', company: 'CO-0001', user: 'R. Sharma', userCode: 'EMP-1042',
    firstApprover: 'A. Verma', firstLimit: 3000,
    secondApprover: 'D. Kumar (HOD)', secondLimit: 25000,
    financeApprover: 'Finance Controller', financeLimit: 100000,
  },
  {
    id: 'map-2', company: 'CO-0001', user: 'P. Khanna', userCode: 'EMP-1055',
    firstApprover: 'A. Verma', firstLimit: 3000,
    secondApprover: 'D. Kumar (HOD)', secondLimit: 25000,
    financeApprover: 'Finance Controller', financeLimit: 100000,
  },
  {
    id: 'map-3', company: 'CO-0004', user: 'R Kumar', userCode: 'EMP-2001',
    firstApprover: 'Rajiv Kumar — Approving Manager', firstLimit: 5000,
    secondApprover: 'D Kumar — HOD', secondLimit: 40000,
    financeApprover: 'Finance Controller', financeLimit: 100000,
  },
];

/** Find this user's mapping for a company, falling back to the company's first mapping. */
function findApprovalMapping(company, userName) {
  return EE_APPROVAL_MAPPING.find(m => m.company === company && m.user === userName) ||
         EE_APPROVAL_MAPPING.find(m => m.company === company) ||
         null;
}

/* ============================================================
   2. UTILITY HELPERS
   ============================================================ */

/**
 * Safe element selector — returns null instead of throwing.
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {Element|null}
 */
const $ = (selector, ctx = document) => ctx.querySelector(selector);

/**
 * Safe multi-selector.
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {NodeList}
 */
const $$ = (selector, ctx = document) => ctx.querySelectorAll(selector);

/**
 * Format a number as Indian Rupee string.
 * @param {number} n
 * @returns {string}  e.g. "₹ 1,25,000"
 */
function formatINR(n) {
  return '₹ ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

/**
 * Generate a sequential-looking voucher number.
 * @param {string} prefix  e.g. 'EXP' or 'SIS-EXP'
 * @param {boolean} [draft=false]
 * @returns {string}
 */
function genVoucherNo(prefix, draft = false) {
  if (draft) return `${prefix}/26/DRAFT`;
  const seq = String(Math.floor(100 + Math.random() * 900)).padStart(4, '0');
  return `${prefix}/26/${seq}`;
}

/**
 * Resolve the correct voucher prefix based on current session company and type.
 * @param {'expense'|'declaration'|'advance'|'tour'} type
 * @returns {string}
 */
function resolvePrefix(type) {
  const co = EE_SESSION.company ? COMPANY_DATA[EE_SESSION.company] : null;
  if (co && co.useCustomPrefix) {
    if (type === 'expense'     && co.prefixExpense) return co.prefixExpense;
    if (type === 'declaration' && co.prefixDecl)    return co.prefixDecl;
  }

  // Check live Company Admin settings fields
  const prefixToggle = $('#prefixToggle');
  const useCustom    = prefixToggle && prefixToggle.value === 'yes';
  if (useCustom) {
    if (type === 'expense') {
      const v = $('#prefixExpense');
      if (v && v.value.trim()) return v.value.trim();
    }
    if (type === 'declaration') {
      const v = $('#prefixDecl');
      if (v && v.value.trim()) return v.value.trim();
    }
  }

  return EE_CONFIG.VOUCHER_PREFIX[type] || 'VCH';
}


/* ============================================================
   13b. SHARED PDF EXPORT — used by every "Download" / "Export PDF"
   button across the app (Declaration Voucher, Bulk Report, Reports
   & Audit, etc.) so every report leaves the app as a real .pdf
   rather than an HTML file.
   ============================================================ */

let _eePdfLibsPromise = null;

/** Load an external script once and resolve when ready. Shared by every lazy-loaded lib. */
function eeLoadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load ' + src));
    document.head.appendChild(s);
  });
}

/** Lazily load jsPDF + html2canvas from CDN, once, and cache the promise. */
function ensurePdfLibs() {
  if (_eePdfLibsPromise) return _eePdfLibsPromise;

  _eePdfLibsPromise = (async () => {
    if (!window.html2canvas) {
      await eeLoadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    }
    if (!window.jspdf) {
      await eeLoadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }
    if (!window.html2canvas || !window.jspdf) {
      throw new Error('PDF libraries unavailable');
    }
    return true;
  })();

  return _eePdfLibsPromise;
}

let _eePdfJsPromise = null;

/** Lazily load PDF.js (Mozilla's pdf.js) from CDN, once, and cache the promise. */
function ensurePdfJsLib() {
  if (_eePdfJsPromise) return _eePdfJsPromise;

  _eePdfJsPromise = (async () => {
    if (!window.pdfjsLib) {
      await eeLoadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    }
    if (!window.pdfjsLib) throw new Error('PDF.js unavailable');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    return true;
  })();

  return _eePdfJsPromise;
}

let _eeChartJsPromise = null;

/** Lazily load Chart.js from CDN, once, and cache the promise. */
function ensureChartJs() {
  if (_eeChartJsPromise) return _eeChartJsPromise;

  _eeChartJsPromise = (async () => {
    if (!window.Chart) {
      await eeLoadScript('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js');
    }
    if (!window.Chart) throw new Error('Chart.js unavailable');
    return true;
  })();

  return _eeChartJsPromise;
}

let _eeXlsxPromise = null;

/** Lazily load SheetJS (xlsx) from CDN, once, and cache the promise. */
function ensureXlsxLib() {
  if (_eeXlsxPromise) return _eeXlsxPromise;

  _eeXlsxPromise = (async () => {
    if (!window.XLSX) {
      await eeLoadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    }
    if (!window.XLSX) throw new Error('XLSX library unavailable');
    return true;
  })();

  return _eeXlsxPromise;
}

/**
 * Convert the first page of a PDF File into a JPEG data URL, so a PDF bill
 * can be previewed and merged into reports the same way a photo would be.
 * @param {File} file
 * @returns {Promise<{thumbSrc: string, pageCount: number}>}
 */
async function convertPdfFileToImage(file) {
  await ensurePdfJsLib();
  const buffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 1.6 });
  const canvas = document.createElement('canvas');
  canvas.width  = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

  return { thumbSrc: canvas.toDataURL('image/jpeg', 0.88), pageCount: pdf.numPages };
}

/**
 * Build the HTML for an "Attached Bills, Vouchers & Receipts" grid from a
 * list of pool-item snapshots — used to merge every bill/receipt image
 * directly into a generated report (Bulk Report, and its Manager/HOD
 * review & download), not just reference them by voucher number.
 * @param {Array} items  Pool-item snapshots, each optionally carrying `.attachment`.
 * @returns {{html: string, count: number, total: number}}
 */
function renderAttachmentsGridHTML(items) {
  const withAttachment = items.filter(it => it.attachment && (it.attachment.thumbSrc || it.attachment.type === 'pdf'));
  const html = withAttachment.map(it => {
    const att = it.attachment;
    const thumb = att.thumbSrc
      ? '<img class="thumb" src="' + att.thumbSrc + '" alt="' + (att.name || 'attachment') + '">'
      : '<div class="thumb-pdf">📄</div>';
    return (
      '<div class="v-attach-card">' + thumb +
      '<div class="cap"><span class="no">' + it.no + '</span>' +
      '<span class="meta">' + it.head + ' · ' + formatINR(it.amount) + '</span></div></div>'
    );
  }).join('');
  return { html, count: withAttachment.length, total: items.length };
}

/**
 * Render a DOM element to a paginated A4 PDF and trigger a download.
 * Renders the element to a single canvas via html2canvas, then places
 * that image into the PDF scaled to the page width — slicing it across
 * multiple pages if it's taller than one page. This avoids jsPDF's
 * built-in .html() layout engine, which mis-scales inconsistently
 * (a known source of content being cut off or not fitting the page).
 * @param {HTMLElement} el        The element to render (e.g. a .v-sheet).
 * @param {string}      filename  Filename including .pdf extension.
 * @returns {Promise<void>}
 */
async function downloadElementAsPDF(el, filename) {
  if (!el) return;
  await ensurePdfLibs();

  const canvas = await window.html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    windowWidth: el.scrollWidth || el.offsetWidth || 800,
  });

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'pt', 'a4');
  const margin      = 28;
  const pageWidth   = doc.internal.pageSize.getWidth();
  const pageHeight  = doc.internal.pageSize.getHeight();
  const usableWidth  = pageWidth  - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  // Scale factor from source canvas pixels to PDF points, fit to page width.
  const imgWidthPt = usableWidth;
  const pxToPt = imgWidthPt / canvas.width;
  const pageSlicePx = Math.floor(usableHeight / pxToPt); // how many source px fit one page tall

  let renderedPx = 0;
  let firstPage = true;

  while (renderedPx < canvas.height) {
    const sliceHeightPx = Math.min(pageSlicePx, canvas.height - renderedPx);

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width  = canvas.width;
    sliceCanvas.height = sliceHeightPx;
    sliceCanvas.getContext('2d').drawImage(
      canvas,
      0, renderedPx, canvas.width, sliceHeightPx,
      0, 0, canvas.width, sliceHeightPx
    );

    const sliceHeightPt = sliceHeightPx * pxToPt;
    if (!firstPage) doc.addPage();
    doc.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, imgWidthPt, sliceHeightPt);

    renderedPx += sliceHeightPx;
    firstPage = false;
  }

  doc.save(filename);
}

/**
 * Safely increment the text content of a counter element.
 * @param {string} id
 */
function incrementCounter(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = parseInt(el.textContent, 10) + 1;
}

/**
 * Safely decrement a badge counter, hiding it when it reaches zero.
 * @param {string} id
 */
function decrementBadge(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const n = Math.max(0, parseInt(el.textContent, 10) - 1);
  el.textContent = n;
  if (n === 0) el.style.display = 'none';
}

/**
 * Create and return a status pill element.
 * @param {string} label
 * @param {string} colour  green|amber|red|slate|purple|teal
 * @returns {HTMLElement}
 */
function makePill(label, colour = 'green') {
  const span = document.createElement('span');
  span.className = `pill ${colour}`;
  span.textContent = label;
  return span;
}


/* ============================================================
   3. NOTIFICATION / TOAST SYSTEM
   ============================================================ */

let _toastTimer = null;

/**
 * Show a brief toast notification at the bottom of the screen.
 * @param {string} message
 * @param {'success'|'error'|'info'} [type='success']
 * @param {number} [duration=3000]
 */
function showToast(message, type = 'success', duration = 3000) {
  let toast = document.getElementById('ee-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ee-toast';
    toast.style.cssText = [
      'position:fixed', 'bottom:28px', 'left:50%', 'transform:translateX(-50%) translateY(20px)',
      'background:#1B2430', 'color:#fff', 'font-family:Inter,sans-serif', 'font-size:13px',
      'font-weight:500', 'padding:10px 20px', 'border-radius:3px',
      'box-shadow:0 6px 20px rgba(0,0,0,0.3)', 'z-index:9999',
      'opacity:0', 'transition:opacity .2s, transform .2s', 'pointer-events:none',
      'max-width:420px', 'text-align:center',
    ].join(';');
    document.body.appendChild(toast);
  }

  const colours = { success: '#2F6B4F', error: '#A8412C', info: '#B8860B' };
  toast.style.borderLeft = `4px solid ${colours[type] || colours.success}`;
  toast.textContent = message;

  // Force reflow then animate in
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(-50%) translateY(20px)';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, duration);
}


/* ============================================================
   4. LOGIN & AUTHENTICATION
   ============================================================ */

/**
 * Speak a short message using the Web Speech API, preferring a female-
 * sounding voice. Falls back to whatever default voice the browser has
 * if no female voice can be identified, and no-ops silently if speech
 * synthesis isn't supported.
 */
function speakFemale(text) {
  if (!('speechSynthesis' in window)) return;

  function pickFemaleVoice(voices) {
    const nameHints = /female|zira|susan|samantha|victoria|karen|moira|tessa|fiona|serena|aria|jenny|joanna|salli|kendra|kimberly|amy|emma|ivy|google us english|google uk english female/i;
    return voices.find(v => nameHints.test(v.name)) ||
           voices.find(v => v.lang && v.lang.startsWith('en')) ||
           voices[0] || null;
  }

  function speakNow() {
    window.speechSynthesis.cancel(); // don't stack/overlap messages
    const utter = new SpeechSynthesisUtterance(text);
    const voice = pickFemaleVoice(window.speechSynthesis.getVoices());
    if (voice) utter.voice = voice;
    utter.pitch = 1.1;
    utter.rate  = 0.98;
    window.speechSynthesis.speak(utter);
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length) {
    speakNow();
  } else {
    // Voice list loads asynchronously in some browsers
    window.speechSynthesis.onvoiceschanged = speakNow;
  }
}

/**
 * Landing page — visiting-card flip between the front card and the
 * Login / Register-for-Demo form on the back.
 */
function initLandingCard() {
  const card           = document.getElementById('landingCard');
  const showRegisterBtn= document.getElementById('showRegisterBtn');
  const showLoginBtn   = document.getElementById('showLoginBtn');
  const backBtn        = document.getElementById('landingBackBtn');
  const loginPane      = document.getElementById('loginFormPane');
  const registerPane   = document.getElementById('registerFormPane');

  if (!card) return;

  function showBack(pane) {
    if (loginPane)    loginPane.style.display    = (pane === 'login')    ? '' : 'none';
    if (registerPane) registerPane.style.display = (pane === 'register') ? '' : 'none';
    card.classList.add('flipped');
    if (pane === 'login') {
      setTimeout(() => { const u = document.getElementById('loginUser'); if (u) u.focus(); }, 450);
    }
  }

  window.showLandingFront = function() { card.classList.remove('flipped'); };
  window.showLandingBack  = showBack;

  if (showLoginBtn)    showLoginBtn.addEventListener('click', () => showBack('login'));
  if (showRegisterBtn) showRegisterBtn.addEventListener('click', () => showBack('register'));
  if (backBtn)          backBtn.addEventListener('click', () => window.showLandingFront());

  // "Get Started" buttons in the Price section: scroll up to the card, then flip to Login
  document.querySelectorAll('[data-fp-scroll-login]').forEach(btn => {
    btn.addEventListener('click', () => {
      const home = document.getElementById('fpHome');
      if (home) home.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => showBack('login'), 500);
    });
  });

  // ---- Register for Demo ----
  const demoName    = document.getElementById('demoName');
  const demoCompany = document.getElementById('demoCompany');
  const demoEmail   = document.getElementById('demoEmail');
  const demoPhone   = document.getElementById('demoPhone');
  const demoError   = document.getElementById('demoError');
  const demoSubmitBtn = document.getElementById('demoSubmitBtn');

  if (demoSubmitBtn) {
    demoSubmitBtn.addEventListener('click', () => {
      demoError.classList.remove('show');

      const name  = demoName.value.trim();
      const email = demoEmail.value.trim();
      const phone = demoPhone.value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !emailOk || !phone) {
        demoError.textContent = 'Please fill in your name, a valid email and phone number.';
        demoError.classList.add('show');
        return;
      }

      showToast('Thanks, ' + name + ' — your demo request has been received.', 'success');
      speakFemale('Thanks for reaching us. We will get back to you shortly.');

      // Clear the form and return to the front of the card
      demoName.value = ''; demoCompany.value = ''; demoEmail.value = ''; demoPhone.value = '';
      setTimeout(() => window.showLandingFront(), 900);
    });
  }
}

function initLogin() {
  const loginScreen      = document.getElementById('loginScreen');
  const loginUser        = document.getElementById('loginUser');
  const loginPass        = document.getElementById('loginPass');
  const loginError       = document.getElementById('loginError');
  const loginBtn         = document.getElementById('loginBtn');
  const portalSwitcher   = document.getElementById('portalSwitcher');
  const psUser           = document.getElementById('psUser');
  const logoutBtn        = document.getElementById('logoutBtn');

  if (!loginUser || !loginBtn || !logoutBtn) return;

  /** Look up an account by username + password (case-insensitive on username). */
  function findAccount(user, pass) {
    const u = user.trim().toLowerCase();
    return EE_CREDENTIALS.find(a => a.username.toLowerCase() === u && a.password === pass) || null;
  }

  /** Validate and process login. */
  function doLogin() {
    const user = loginUser.value.trim();
    const pass = loginPass.value;

    // Clear previous error
    loginError.classList.remove('show');
    loginError.textContent = '';

    // Field validation
    if (!user || !pass) {
      loginError.textContent = 'Please enter your username and password.';
      loginError.classList.add('show');
      return;
    }

    const account = findAccount(user, pass);
    if (!account) {
      loginError.textContent = 'Incorrect username or password.';
      loginError.classList.add('show');
      loginPass.focus();
      loginPass.select();
      return;
    }

    const role = account.role;

    // ── Success ──────────────────────────────────────────────
    EE_SESSION.role       = role;
    EE_SESSION.department = account.department || '';
    EE_SESSION.company    = account.company    || 'CO-0001';
    EE_SESSION.username   = user;
    EE_SESSION.isGroup    = !!account.isGroup;
    EE_SESSION.title      = account.title || '';
    EE_SESSION.name       = account.name  || '';

    document.body.classList.add('logged-in');
    portalSwitcher.style.display = 'flex';

    // Build user label for top bar
    let userLabel = account.name + ' · ' + account.title;
    if (role === 'companyadmin') {
      const co = COMPANY_DATA[account.company];
      userLabel = account.name + (co ? ' · ' + co.name : '');
      switchCompany(account.company);
    } else if (role === 'employee') {
      const deptLabel = EE_SESSION.isGroup ? 'Group (Normal Employee)' : account.department + ' Dept.';
      userLabel = account.name + ' · ' + account.title + ' · ' + deptLabel;

      // Update dashboard meta line
      const dashMeta = document.getElementById('emp-dash-meta');
      if (dashMeta) {
        dashMeta.textContent = 'Branch: Pune · Department: ' + account.department + ' · Period: June 2026';
      }

      // Apply group / department access restrictions
      applyGroupRestriction(EE_SESSION.isGroup, account.department);
    } else if (role === 'superadmin') {
      userLabel = account.name + ' · Super Admin';
    }

    psUser.textContent = userLabel;
    applyRoleAccess(role);

    // Update approval limit display strips
    syncLimitDisplays();

    // Update dashboard KPIs
    refreshDashboardStats();

    // Check outstanding non-dispatched/non-settled amount against this role's alert threshold
    if (window.checkOutstandingAlert) window.checkOutstandingAlert();
    if (window.refreshDashboardAnalytics) window.refreshDashboardAnalytics();

    // Prefill Dispatch's Sender Name with whoever just logged in
    const dispSenderEl = document.getElementById('dispatchSenderName');
    if (dispSenderEl && !dispSenderEl.value) dispSenderEl.value = account.name;

    // Show this user's named approving authorities & limits
    if (window.renderApprovalChainCard) window.renderApprovalChainCard();

    showToast('Welcome back, ' + account.name + '!', 'success');
    speakFemale('Welcome to E M S portal.');
  }

  loginBtn.addEventListener('click', doLogin);

  // Enter key on username / password triggers login
  [loginUser, loginPass].forEach(el => {
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  });

  /** Logout — clear session and return to login screen. */
  logoutBtn.addEventListener('click', () => {
    // Reset session
    Object.assign(EE_SESSION, { role: null, department: null, company: null, username: null, isGroup: false });

    document.body.classList.remove('logged-in');
    portalSwitcher.style.display = 'none';

    // Reset form fields
    loginUser.value     = '';
    loginPass.value     = '';
    loginError.classList.remove('show');

    // Return the landing card to its front (visiting-card) face
    if (window.showLandingFront) window.showLandingFront();

    // Reset portal switcher buttons
    $$('.ps-btn[data-portal]').forEach(b => { b.style.display = ''; });

    showToast('You have been signed out.', 'info');
  });
}


/* ============================================================
   5. PORTAL SWITCHER (TOP NAV)
   ============================================================ */

function initPortalSwitcher() {
  const psButtons = $$('.ps-btn[data-portal]');
  const portals   = $$('.portal');

  /**
   * Switch the active portal panel.
   * @param {string} name  e.g. 'employee', 'companyadmin', 'superadmin'
   */
  window.gotoPortal = function(name) {
    psButtons.forEach(b => b.classList.toggle('active', b.dataset.portal === name));
    portals.forEach(p => p.classList.toggle('active', p.id === 'portal-' + name));
    window.scrollTo(0, 0);
  };

  psButtons.forEach(b => b.addEventListener('click', () => gotoPortal(b.dataset.portal)));

  // data-portal-goto="xxx" on any element triggers a cross-portal jump
  $$('[data-portal-goto]').forEach(el => {
    el.addEventListener('click', () => {
      gotoPortal(el.dataset.portalGoto);
      closeAllModals();
    });
  });
}

/**
 * Show only the portals allowed for the logged-in role and navigate there.
 * @param {string} role
 */
function applyRoleAccess(role) {
  const allowed = EE_CONFIG.ROLE_PORTALS[role] || ['employee'];

  $$('.ps-btn[data-portal]').forEach(btn => {
    btn.style.display = allowed.includes(btn.dataset.portal) ? '' : 'none';
  });

  gotoPortal(allowed[0]);
}


/* ============================================================
   6. SIDEBAR NAVIGATION & VIEW SWITCHER
   ============================================================ */

function initSidebarNav() {
  // Each portal is self-contained — scope nav/views so they don't cross-collide
  $$('.portal').forEach(portal => {
    const navItems = $$('.nav-item[data-view]', portal);
    const views    = $$('.view', portal);

    /**
     * Show the named view within this portal.
     * @param {string} viewName
     */
    function gotoView(viewName) {
      navItems.forEach(n => n.classList.toggle('active', n.dataset.view === viewName));
      views.forEach(v => v.classList.toggle('active', v.id === 'view-' + viewName));
      window.scrollTo(0, 0);
    }

    navItems.forEach(item => {
      item.addEventListener('click', () => gotoView(item.dataset.view));
    });

    // data-goto="viewName" on buttons inside the content area
    $$('[data-goto]', portal).forEach(btn => {
      btn.addEventListener('click', () => gotoView(btn.dataset.goto));
    });
  });
}


/* ============================================================
   7. MODAL SYSTEM
   ============================================================ */

function initModals() {
  /** Close every open modal. */
  window.closeAllModals = function() {
    $$('.modal-overlay').forEach(m => m.classList.remove('active'));
  };

  // data-open-modal="modalId" triggers opening
  $$('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = document.getElementById(btn.dataset.openModal);
      if (modal) modal.classList.add('active');
    });
  });

  // data-close-modal on buttons inside a modal closes it
  $$('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlay = btn.closest('.modal-overlay');
      if (overlay) overlay.classList.remove('active');
    });
  });

  // Click on overlay backdrop closes modal
  $$('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  // Escape key closes any open modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
  });
}


/* ============================================================
   8. GROUP / DEPARTMENT ACCESS CONTROL
   ============================================================ */

/**
 * Restrict the employee portal navigation based on login department.
 *
 * Elements with data-group="1" are always shown (self-service).
 * Elements with data-group="0" are hidden for Group users.
 * Elements with data-dept-only="Finance" are only shown when dept === 'Finance'.
 *
 * @param {boolean} isGroup
 * @param {string}  dept
 */
function applyGroupRestriction(isGroup, dept) {
  const empPortal = document.getElementById('portal-employee');
  if (!empPortal) return;

  // Apply group / non-group visibility
  $$('[data-group]', empPortal).forEach(el => {
    if (isGroup) {
      el.style.display = el.dataset.group === '1' ? '' : 'none';
    } else {
      el.style.display = '';
    }
  });

  // Apply department-only restrictions
  $$('[data-dept-only]', empPortal).forEach(el => {
    if (isGroup) return; // already hidden above
    el.style.display = (el.dataset.deptOnly === dept) ? '' : 'none';
  });

  // Land on Dashboard after any role change
  const navItems = $$('.nav-item[data-view]', empPortal);
  const views    = $$('.view', empPortal);
  navItems.forEach(n => n.classList.toggle('active', n.dataset.view === 'dashboard'));
  views.forEach(v   => v.classList.toggle('active',   v.id === 'view-dashboard'));
}


/* ============================================================
   9. COMPANY ADMIN — COMPANY SWITCHER
   ============================================================ */

/**
 * Update all Company Admin UI elements to reflect the chosen company.
 * @param {string} id  Company code e.g. 'CO-0001'
 */
window.switchCompany = function(id) {
  const co = COMPANY_DATA[id];
  if (!co) return;

  EE_SESSION.company = id;

  const targets = {
    coIdDisplay  : id + ' · ' + co.plan,
    'co-bar-name': co.name,
    'co-bar-id'  : id,
    'co-bar-plan': co.plan,
    'dash-meta'  : co.name + ' · ' + id + ' · June 2026',
    'emp-meta'   : co.name,
  };

  Object.entries(targets).forEach(([elId, text]) => {
    const el = document.getElementById(elId);
    if (el) el.textContent = text;
  });

  // Sync voucher prefix fields in Company Admin → Policy
  const prefixExpenseEl = document.getElementById('prefixExpense');
  const prefixDeclEl    = document.getElementById('prefixDecl');
  const prefixToggleEl  = document.getElementById('prefixToggle');

  if (prefixExpenseEl) prefixExpenseEl.value = co.prefixExpense || '';
  if (prefixDeclEl)    prefixDeclEl.value    = co.prefixDecl    || '';
  if (prefixToggleEl)  prefixToggleEl.value  = co.useCustomPrefix ? 'yes' : 'no';
};

function initCompanySwitcher() {
  const sel = document.getElementById('companySwitcher');
  if (sel) sel.addEventListener('change', () => switchCompany(sel.value));
}


/**
 * Wire up "Export PDF" buttons that export a whole report panel (as opposed
 * to a single voucher) using the same shared jsPDF/html2canvas pipeline.
 */
function initReportExports() {
  const btn     = document.getElementById('caReportsExportPdfBtn');
  const content = document.getElementById('caReportsContent');
  if (!btn || !content) return;

  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    btn.disabled = true;
    const originalLabel = btn.textContent;
    btn.textContent = 'Preparing PDF…';
    showToast('Generating PDF…', 'info');

    try {
      const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      await downloadElementAsPDF(content, 'Reports-and-Audit-' + dateStr.replace(/\s+/g, '-') + '.pdf');
      showToast('Reports & Audit exported as PDF.', 'success');
    } catch (err) {
      showToast('Could not generate PDF — check your internet connection and try again.', 'error', 5000);
    } finally {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  });
}


/* ============================================================
   10. COMPANY ADMIN — TAB TOGGLE (TABLE / CARD)
   ============================================================ */

/**
 * Toggle between table and card views for the employee list.
 * Called from inline onclick on the tab elements.
 * @param {'table'|'cards'} which
 * @param {Element} el  The clicked tab element
 */
window.setTab = function(which, el) {
  const tabBar = el.closest('.tab-bar');
  $$('.tab', tabBar).forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  const content   = tabBar.parentElement;
  const tableView = content.querySelector('#emp-table-view');
  const cardsView = content.querySelector('#emp-cards-view');

  if (tableView) tableView.style.display = (which === 'table') ? '' : 'none';
  if (cardsView) cardsView.style.display = (which === 'cards') ? '' : 'none';
};


/* ============================================================
   11. SUBMIT EXPENSE — ATTACH BILL TABS
   ============================================================ */

function initAttachTabs() {
  $$('.atab').forEach(tab => {
    tab.addEventListener('click', () => {
      const group = tab.closest('.field');
      if (!group) return;

      $$('.atab',        group).forEach(t => t.classList.remove('active'));
      $$('.attach-pane', group).forEach(p => p.classList.remove('show'));

      tab.classList.add('active');

      const pane = group.querySelector('#attach-' + tab.dataset.attach);
      if (pane) pane.classList.add('show');
    });
  });
}


/* ============================================================
   11b. SUBMIT EXPENSE — UPLOAD BILL / SCAN WITH CAMERA /
        SELECT DECLARATION VOUCHER
   ============================================================ */

function fmtBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Render an attachment preview card (thumbnail or icon + name + meta + remove button)
 * into the given container, replacing whatever was there before.
 */
function renderAttachPreview(container, box, opts, onRemove) {
  const thumb = opts.thumbSrc
    ? '<img class="ap-thumb" src="' + opts.thumbSrc + '" alt="">'
    : '<div class="ap-icon">' + (opts.icon || '📄') + '</div>';

  container.innerHTML =
    thumb +
    '<div class="ap-info">' +
      '<div class="ap-name">' + opts.name + '</div>' +
      '<div class="ap-meta">' + opts.meta + '</div>' +
    '</div>' +
    '<button type="button" class="ap-remove" title="Remove">✕</button>';

  container.style.display = 'flex';
  if (box) box.classList.add('has-file');

  container.querySelector('.ap-remove').addEventListener('click', () => {
    container.style.display = 'none';
    container.innerHTML = '';
    if (box) box.classList.remove('has-file');
    if (onRemove) onRemove();
  });
}

function initAttachments() {
  const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

  // ---------------------------------------------------------------
  // 1) UPLOAD BILL — click-to-browse + drag & drop
  // ---------------------------------------------------------------
  const uploadBox     = document.getElementById('uploadBillBox');
  const uploadInput   = document.getElementById('uploadBillInput');
  const uploadPreview = document.getElementById('uploadBillPreview');

  function handleUploadFile(file) {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isPdf   = file.type === 'application/pdf';
    if (!isImage && !isPdf) {
      showToast('Please attach an image or PDF file.', 'error');
      return;
    }
    if (file.size > MAX_BYTES) {
      showToast('That file is larger than 8 MB — please attach a smaller copy.', 'error');
      return;
    }

    const finish = (thumbSrc, meta) => {
      uploadPreview.dataset.originalType = isPdf ? 'pdf' : 'image';
      renderAttachPreview(uploadPreview, uploadBox, {
        thumbSrc,
        icon: isPdf ? '📄' : '🖼',
        name: file.name,
        meta: meta || (fmtBytes(file.size) + ' · ' + (isPdf ? 'PDF document' : 'Image')),
      }, () => { uploadInput.value = ''; delete uploadPreview.dataset.originalType; });
    };

    if (isImage) {
      const reader = new FileReader();
      reader.onload = e => {
        finish(e.target.result);
        showToast('Bill attached: ' + file.name, 'success');
      };
      reader.readAsDataURL(file);
      return;
    }

    // PDF — convert the first page to an image so it previews and merges
    // into reports the same way a photo would, instead of staying a plain icon.
    uploadBox.classList.add('has-file');
    uploadPreview.style.display = 'flex';
    uploadPreview.innerHTML = '<div class="ap-icon">⏳</div><div class="ap-info"><div class="ap-name">Converting PDF…</div><div class="ap-meta">Rendering page 1 as an image</div></div>';

    convertPdfFileToImage(file)
      .then(({ thumbSrc, pageCount }) => {
        const pageNote = pageCount > 1 ? ' · page 1 of ' + pageCount + ' shown' : '';
        finish(thumbSrc, fmtBytes(file.size) + ' · PDF, converted to image' + pageNote);
        showToast('Bill attached: ' + file.name + ' (PDF converted to image)', 'success');
      })
      .catch(err => {
        console.error('PDF-to-image conversion failed:', err);
        finish(null, fmtBytes(file.size) + ' · PDF document (preview unavailable)');
        showToast('Bill attached, but the PDF preview couldn\'t be generated — check your internet connection.', 'error', 5000);
      });
  }

  if (uploadBox && uploadInput) {
    uploadBox.addEventListener('click', () => uploadInput.click());
    uploadInput.addEventListener('change', () => handleUploadFile(uploadInput.files[0]));

    ['dragenter', 'dragover'].forEach(evt => {
      uploadBox.addEventListener(evt, e => {
        e.preventDefault(); e.stopPropagation();
        uploadBox.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(evt => {
      uploadBox.addEventListener(evt, e => {
        e.preventDefault(); e.stopPropagation();
        uploadBox.classList.remove('dragover');
      });
    });
    uploadBox.addEventListener('drop', e => {
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleUploadFile(file);
    });
  }

  // ---------------------------------------------------------------
  // 2) SCAN WITH CAMERA — live getUserMedia capture, with a graceful
  //    fallback to the device's native camera picker where live
  //    capture isn't available (no permission, no HTTPS, no webcam).
  // ---------------------------------------------------------------
  const cameraBox     = document.getElementById('cameraBox');
  const cameraInput   = document.getElementById('cameraCaptureInput');
  const cameraPreview = document.getElementById('cameraPreview');

  const camModal    = document.getElementById('modal-camera');
  const camVideo    = document.getElementById('cameraVideo');
  const camCanvas   = document.getElementById('cameraCanvas');
  const camShot     = document.getElementById('cameraShot');
  const camHint     = document.getElementById('cameraHint');
  const camCaptureBtn = document.getElementById('cameraCaptureBtn');
  const camRetakeBtn  = document.getElementById('cameraRetakeBtn');
  const camUseBtn     = document.getElementById('cameraUseBtn');

  let camStream = null;

  function stopCameraStream() {
    if (camStream) {
      camStream.getTracks().forEach(t => t.stop());
      camStream = null;
    }
  }

  function resetCameraModalUI() {
    camVideo.style.display  = '';
    camShot.style.display   = 'none';
    camCaptureBtn.style.display = '';
    camRetakeBtn.style.display  = 'none';
    camUseBtn.style.display     = 'none';
    camHint.textContent = 'Position the bill in frame, then capture.';
  }

  function acceptCameraShot(dataUrl) {
    renderAttachPreview(cameraPreview, cameraBox, {
      thumbSrc: dataUrl,
      name: 'Scanned bill — ' + new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      meta: 'Captured with camera',
    }, () => {});
    showToast('Bill scanned and attached.', 'success');
  }

  if (cameraBox) {
    cameraBox.addEventListener('click', async () => {
      // Try a live in-page camera first.
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.isSecureContext !== false) {
        try {
          camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          camVideo.srcObject = camStream;
          resetCameraModalUI();
          camModal.classList.add('active');
          return;
        } catch (err) {
          // Permission denied / no camera / blocked — fall through to file-picker fallback.
        }
      }
      // Fallback: native camera picker (works reliably on mobile browsers).
      if (cameraInput) cameraInput.click();
    });
  }

  if (cameraInput) {
    cameraInput.addEventListener('change', () => {
      const file = cameraInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => acceptCameraShot(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  if (camCaptureBtn) {
    camCaptureBtn.addEventListener('click', () => {
      if (!camStream) return;
      const w = camVideo.videoWidth  || 640;
      const h = camVideo.videoHeight || 480;
      camCanvas.width = w; camCanvas.height = h;
      camCanvas.getContext('2d').drawImage(camVideo, 0, 0, w, h);
      const dataUrl = camCanvas.toDataURL('image/jpeg', 0.92);

      camShot.src = dataUrl;
      camVideo.style.display = 'none';
      camShot.style.display  = '';
      camCaptureBtn.style.display = 'none';
      camRetakeBtn.style.display  = '';
      camUseBtn.style.display     = '';
      camHint.textContent = 'Looks good? Use this photo, or retake it.';
    });
  }

  if (camRetakeBtn) {
    camRetakeBtn.addEventListener('click', resetCameraModalUI);
  }

  if (camUseBtn) {
    camUseBtn.addEventListener('click', () => {
      acceptCameraShot(camShot.src);
      closeAllModals();
    });
  }

  // Stop the camera stream the moment the modal closes, however it closes
  // (Cancel, ×, backdrop click, or Escape — all handled generically by initModals()).
  if (camModal && window.MutationObserver) {
    new MutationObserver(() => {
      if (!camModal.classList.contains('active')) stopCameraStream();
    }).observe(camModal, { attributes: true, attributeFilter: ['class'] });
  }

  // ---------------------------------------------------------------
  // 3) SELECT DECLARATION VOUCHER — pulls amount / head / purpose
  //    straight into the claim, as the on-screen hint promises.
  // ---------------------------------------------------------------
  const declSelect  = document.getElementById('declVoucherSelect');
  const declPreview = document.getElementById('declVoucherPreview');
  const headSelect  = document.getElementById('subExpHead');
  const amountInput = document.getElementById('subExpAmount');
  const purposeInput = document.getElementById('subExpPurpose');

  if (declSelect) {
    declSelect.addEventListener('change', () => {
      const opt = declSelect.selectedOptions[0];
      if (!opt || !opt.value && !opt.dataset.amount) {
        declPreview.style.display = 'none';
        declPreview.innerHTML = '';
        return;
      }
      const head    = opt.dataset.head    || '';
      const amount  = opt.dataset.amount  || '';
      const purpose = opt.dataset.purpose || '';

      if (headSelect && head) {
        const match = Array.from(headSelect.options).find(o => o.value === head);
        if (match) headSelect.value = head;
      }
      if (amountInput && amount) amountInput.value = amount;
      if (purposeInput && purpose) purposeInput.value = purpose;

      renderAttachPreview(declPreview, null, {
        icon: '🧾',
        name: opt.textContent.trim(),
        meta: 'Linked — amount, head & purpose filled in below',
      }, () => {});

      showToast('Pulled in ' + formatINR(amount) + ' from ' + opt.textContent.split(' — ')[0] + '.', 'success');
    });
  }

  // ---------------------------------------------------------------
  // Expose the currently-attached bill (upload or camera scan) so
  // Submit Expense can save it onto the record it creates.
  // ---------------------------------------------------------------
  window.getSubmitExpenseAttachment = function () {
    if (uploadPreview && uploadPreview.style.display !== 'none' && uploadPreview.querySelector('.ap-name')) {
      const img = uploadPreview.querySelector('.ap-thumb');
      return {
        thumbSrc: img ? img.src : null,
        name: uploadPreview.querySelector('.ap-name').textContent,
        type: uploadPreview.dataset.originalType || (img ? 'image' : 'pdf'),
      };
    }
    if (cameraPreview && cameraPreview.style.display !== 'none' && cameraPreview.querySelector('.ap-name')) {
      const img = cameraPreview.querySelector('.ap-thumb');
      return {
        thumbSrc: img ? img.src : null,
        name: cameraPreview.querySelector('.ap-name').textContent,
        type: 'image',
      };
    }
    return null;
  };

  window.resetSubmitExpenseAttachments = function () {
    [uploadPreview, cameraPreview, declPreview].forEach(el => {
      if (!el) return;
      el.style.display = 'none';
      el.innerHTML = '';
      delete el.dataset.originalType;
    });
    [uploadBox, cameraBox].forEach(el => { if (el) el.classList.remove('has-file'); });
    if (uploadInput) uploadInput.value = '';
    if (cameraInput) cameraInput.value = '';
    if (declSelect)  declSelect.value  = '';
  };
}


/* ============================================================
   12. SUBMIT EXPENSE — GEOLOCATION BRANCH DETECTION
   ============================================================ */

function initGeoLocate() {
  const btn      = document.getElementById('geoLocateBtn');
  const resultEl = document.getElementById('geoLocateResult');
  const select   = document.getElementById('branchLocationSelect');

  if (!btn || !resultEl) return;

  btn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      resultEl.textContent = '⚠ Geolocation is not supported by your browser.';
      return;
    }

    resultEl.textContent = 'Detecting your location…';
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      pos => {
        btn.disabled = false;
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // Simple proximity match against known city coordinates
        const cities = [
          { name: 'Mumbai, Maharashtra',    lat: 19.076,  lon: 72.877  },
          { name: 'Pune, Maharashtra',       lat: 18.520,  lon: 73.856  },
          { name: 'Bengaluru, Karnataka',    lat: 12.972,  lon: 77.594  },
          { name: 'Delhi NCR',               lat: 28.613,  lon: 77.209  },
          { name: 'Hyderabad, Telangana',    lat: 17.385,  lon: 78.487  },
          { name: 'Chennai, Tamil Nadu',     lat: 13.083,  lon: 80.270  },
          { name: 'Kolkata, West Bengal',    lat: 22.572,  lon: 88.364  },
          { name: 'Ahmedabad, Gujarat',      lat: 23.022,  lon: 72.571  },
          { name: 'Ranchi, Jharkhand',       lat: 23.344,  lon: 85.309  },
          { name: 'Patna, Bihar',            lat: 25.593,  lon: 85.137  },
          { name: 'Lucknow, Uttar Pradesh',  lat: 26.847,  lon: 80.947  },
          { name: 'Jaipur, Rajasthan',       lat: 26.912,  lon: 75.787  },
          { name: 'Bhubaneswar, Odisha',     lat: 20.296,  lon: 85.824  },
          { name: 'Guwahati, Assam',         lat: 26.144,  lon: 91.736  },
          { name: 'Chandigarh',              lat: 30.733,  lon: 76.779  },
          { name: 'Indore, Madhya Pradesh',  lat: 22.719,  lon: 75.857  },
        ];

        // Find closest city using squared Euclidean distance
        let closest = cities[0], minDist = Infinity;
        cities.forEach(city => {
          const d = Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2);
          if (d < minDist) { minDist = d; closest = city; }
        });

        // Auto-select in dropdown
        if (select) {
          for (const opt of select.options) {
            if (opt.value === closest.name) {
              select.value = opt.value;
              break;
            }
          }
        }

        resultEl.textContent =
          `📍 Detected: ${lat.toFixed(4)}, ${lon.toFixed(4)} — nearest branch set to "${closest.name}". Confirm or change above.`;
        showToast('Location detected — ' + closest.name, 'success');
      },
      err => {
        btn.disabled = false;
        const msgs = {
          1: 'Location permission denied — please select your branch manually.',
          2: 'Location unavailable — please select your branch manually.',
          3: 'Location request timed out — please select your branch manually.',
        };
        resultEl.textContent = '⚠ ' + (msgs[err.code] || 'Could not detect location.');
        showToast('Location detection failed.', 'error');
      },
      { timeout: 8000 }
    );
  });
}


/* ============================================================
   13. SUBMIT EXPENSE — FORM SUBMISSION & VOUCHER NUMBER
   ============================================================ */

/**
 * Smart per-unit rate calculator for Submit Expense — Bike Fuel / Car Fuel
 * (Per KM), Own Arrangement (Per Day) and Car Pool / Share (Per Trip).
 * Rates are set by the Client Admin in Expense Heads → Per-Unit Rate Heads,
 * and read live here, so a rate change there applies immediately.
 */
function initRateBasedHeads() {
  const headEl  = document.getElementById('subExpHead');
  const amtEl   = document.getElementById('subExpAmount');
  const qtyField = document.getElementById('subExpQtyField');
  const qtyLabel = document.getElementById('subExpQtyLabel');
  const qtyInput = document.getElementById('subExpQty');
  const rateHint = document.getElementById('subExpRateHint');
  if (!headEl || !amtEl || !qtyField) return;

  const UNIT_LABELS = {
    km:   { label: 'Kilometers Driven', unit: 'km' },
    day:  { label: 'Number of Days',    unit: 'day(s)' },
    trip: { label: 'Number of Trips',   unit: 'trip(s)' },
  };

  function currentRate() {
    const opt = headEl.selectedOptions[0];
    const rateInputId = opt ? opt.dataset.rateInput : null;
    if (!rateInputId) return null;
    const rateEl = document.getElementById(rateInputId);
    return rateEl ? parseFloat(rateEl.value) || 0 : 0;
  }

  function recompute() {
    const opt = headEl.selectedOptions[0];
    const basis = opt ? opt.dataset.rateBasis : null;

    if (!basis) {
      qtyField.style.display = 'none';
      amtEl.readOnly = false;
      amtEl.classList.remove('mono');
      return;
    }

    const info = UNIT_LABELS[basis];
    qtyField.style.display = '';
    qtyLabel.textContent = info.label;
    amtEl.readOnly = true;

    const rate = currentRate();
    const qty  = parseFloat(qtyInput.value) || 0;
    const amount = +(rate * qty).toFixed(2);
    amtEl.value = qty ? amount : '';
    rateHint.textContent = qty
      ? formatINR(rate) + ' / ' + info.unit.replace('(s)', '') + ' × ' + qty + ' ' + info.unit + ' = ' + formatINR(amount)
      : 'Rate: ' + formatINR(rate) + ' per ' + info.unit.replace('(s)', '') + ' — set by Client Admin.';
  }

  headEl.addEventListener('change', recompute);
  qtyInput.addEventListener('input', recompute);

  recompute();
}


function initSubmitExpense() {
  const submitBtn      = document.getElementById('submitExpenseBtn');
  const cancelEditBtn  = document.getElementById('subExpCancelEditBtn');
  const tempVoucherEl  = document.getElementById('tempVoucherNo');
  const recentBody     = document.getElementById('subExpRecentBody');

  const headEl    = document.getElementById('subExpHead');
  const amountEl  = document.getElementById('subExpAmount');
  const purposeEl = document.getElementById('subExpPurpose');
  const dateEl    = document.getElementById('subExpDate');
  const projectEl = document.getElementById('subExpProject');
  const payToEl   = document.getElementById('subExpPayTo');

  // Show draft voucher number immediately on page load / portal switch
  if (tempVoucherEl) {
    const prefix = resolvePrefix('expense');
    tempVoucherEl.textContent = genVoucherNo(prefix, true);
  }

  if (!submitBtn || !recentBody) return;

  let editingId = null; // set while editing an existing 'draft' submission

  function statusPill(status) {
    if (status === 'submitted') return '<span class="pill amber">Submitted — In Bulk Report</span>';
    if (status === 'approved')  return '<span class="pill green">Approved</span>';
    return '<span class="pill slate">Draft — Available in Bulk Report</span>';
  }

  function renderRecent() {
    const mine = EE_EXPENSE_POOL.filter(it => it.source === 'expense').slice().reverse();
    if (!mine.length) {
      recentBody.innerHTML = '<tr id="subExpRecentEmptyRow"><td colspan="6" style="text-align:center;color:var(--slate);padding:18px;">No expenses submitted yet — fill in the form above and submit your first claim.</td></tr>';
      return;
    }
    recentBody.innerHTML = mine.map(it => {
      const editable = it.status === 'draft';
      const actions = editable
        ? '<button class="btn sm ghost" data-exp-action="edit" data-exp-id="' + it.id + '">Edit</button> ' +
          '<button class="btn sm danger" data-exp-action="delete" data-exp-id="' + it.id + '">Delete</button>'
        : '<span class="hint">Locked — in a submitted batch</span>';
      return '<tr><td>' + it.no + '</td><td>' + new Date(it.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) +
        '</td><td>' + it.head + '</td><td class="amt">' + formatINR(it.amount) + '</td><td>' + statusPill(it.status) +
        '</td><td class="approve-row-actions">' + actions + '</td></tr>';
    }).join('');

    recentBody.querySelectorAll('[data-exp-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = btn.dataset.expId;
        const rec = EE_EXPENSE_POOL.find(it => it.id === id);
        if (!rec) return;

        if (btn.dataset.expAction === 'edit') {
          if (rec.status !== 'draft') {
            showToast('This entry is already in a submitted batch and can\'t be edited here.', 'error');
            return;
          }
          editingId = rec.id;
          if (headEl)    headEl.value    = rec.head;
          if (amountEl)  amountEl.value  = rec.amount;
          if (purposeEl) purposeEl.value = rec.purpose || '';
          if (dateEl)    dateEl.value    = rec.date;
          if (projectEl) projectEl.value = rec.project;
          if (payToEl)   payToEl.value   = rec.payTo || 'Self (Reimbursement)';
          if (tempVoucherEl) tempVoucherEl.textContent = rec.no + ' (editing)';
          submitBtn.textContent = 'Update Submission';
          cancelEditBtn.style.display = '';

          // Re-evaluate the per-unit rate calculator for this head, and back-fill
          // quantity from the stored amount so a rate-based claim edits cleanly.
          if (headEl) {
            headEl.dispatchEvent(new Event('change'));
            const opt = headEl.selectedOptions[0];
            const qtyInput = document.getElementById('subExpQty');
            const rateInputId = opt ? opt.dataset.rateInput : null;
            if (rateInputId && qtyInput) {
              const rateEl = document.getElementById(rateInputId);
              const rate = rateEl ? parseFloat(rateEl.value) || 0 : 0;
              qtyInput.value = rate ? +(rec.amount / rate).toFixed(2) : '';
              qtyInput.dispatchEvent(new Event('input'));
            }
          }

          showToast('Editing ' + rec.no + ' — update the fields above and click Update Submission.', 'info');
          document.getElementById('view-submit').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          if (rec.status !== 'draft') {
            showToast('This entry is already in a submitted batch and can\'t be deleted here.', 'error');
            return;
          }
          const idx = EE_EXPENSE_POOL.indexOf(rec);
          if (idx > -1) EE_EXPENSE_POOL.splice(idx, 1);
          if (editingId === rec.id) resetEditState();
          renderRecent();
          if (window.refreshBulkReportItems) window.refreshBulkReportItems();
          if (window.checkOutstandingAlert) window.checkOutstandingAlert();
          if (window.refreshDashboardAnalytics) window.refreshDashboardAnalytics();
          showToast(rec.no + ' deleted.', 'success');
        }
      });
    });
  }

  function resetEditState() {
    editingId = null;
    submitBtn.textContent = 'Submit for Approval';
    cancelEditBtn.style.display = 'none';
    const prefix = resolvePrefix('expense');
    if (tempVoucherEl) tempVoucherEl.textContent = genVoucherNo(prefix, true);
    const qtyInput = document.getElementById('subExpQty');
    if (qtyInput) qtyInput.value = '';
    if (headEl) headEl.dispatchEvent(new Event('change'));
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      resetEditState();
      showToast('Edit cancelled.', 'info');
    });
  }

  submitBtn.addEventListener('click', () => {
    const amount  = amountEl  ? parseFloat(amountEl.value) : 0;
    const purpose = purposeEl ? purposeEl.value.trim()     : '';
    const head    = headEl    ? headEl.value                : '';
    const date    = dateEl    ? dateEl.value                : '2026-06-27';
    const project = projectEl ? projectEl.value              : '';
    const payTo   = payToEl   ? payToEl.value.trim()         : 'Self (Reimbursement)';

    if (!amount || amount <= 0) {
      showToast('Please enter the expense amount.', 'error');
      if (amountEl) amountEl.focus();
      return;
    }

    const limits = getLiveApprovalLimits();
    let routeMsg = 'Submitted — routed to Manager for approval.';
    if (amount > limits.manager) {
      routeMsg = `Amount ₹${amount.toLocaleString('en-IN')} exceeds Manager limit (₹${limits.manager.toLocaleString('en-IN')}) — will escalate to HOD.`;
    }

    if (editingId) {
      // ---- Update the existing record in place ----
      const rec = EE_EXPENSE_POOL.find(it => it.id === editingId);
      if (rec) {
        rec.head = head; rec.amount = amount; rec.purpose = purpose; rec.date = date; rec.project = project; rec.payTo = payTo;
        if (tempVoucherEl) tempVoucherEl.textContent = rec.no + ' (updated)';
        showToast(`${rec.no} updated. ${routeMsg}`, 'success', 5000);
      }
      resetEditState();
    } else {
      // ---- Create a new record ----
      const prefix     = resolvePrefix('expense');
      const voucherNo  = genVoucherNo(prefix);
      const attachment = window.getSubmitExpenseAttachment ? window.getSubmitExpenseAttachment() : null;
      EE_EXPENSE_POOL.push({
        id: 'exp-' + Date.now(), no: voucherNo, date, project, head, purpose, payTo,
        amount, status: 'draft', source: 'expense', attachment,
      });
      if (tempVoucherEl) tempVoucherEl.textContent = voucherNo + ' (submitted)';
      showToast(`${voucherNo} submitted. ${routeMsg} It's now available in Bulk Report.`, 'success', 5000);

      // Update dashboard pending counter
      const pending = document.getElementById('dash-pending-count');
      if (pending) pending.textContent = parseInt(pending.textContent || '0', 10) + 1;

      // Clear the attach-bill previews so the form is ready for the next claim
      if (window.resetSubmitExpenseAttachments) window.resetSubmitExpenseAttachments();

      // Clear any Per-KM / Per-Day / Per-Trip quantity so the next claim starts fresh
      const qtyInputPostSubmit = document.getElementById('subExpQty');
      if (qtyInputPostSubmit) { qtyInputPostSubmit.value = ''; qtyInputPostSubmit.dispatchEvent(new Event('input')); }
    }

    renderRecent();
    if (window.refreshBulkReportItems) window.refreshBulkReportItems();
    if (window.checkOutstandingAlert) window.checkOutstandingAlert();
    if (window.refreshDashboardAnalytics) window.refreshDashboardAnalytics();
  });

  renderRecent();
}


/* ============================================================
   14. DECLARATION VOUCHER — PREVIEW / PRINT / DOWNLOAD
   ============================================================ */

function initDeclarationVoucher() {
  const linesWrap   = document.getElementById('declLines');
  const addLineBtn  = document.getElementById('addLineBtn');
  const totalEl     = document.getElementById('declTotalAmt');
  const countEl     = document.getElementById('declLineCount');
  const declChk     = document.getElementById('declChk');
  const saveBtn     = document.getElementById('saveGenerateBtn');
  const topSaveBtn  = document.getElementById('topSaveGenerateBtn');
  const editBtn     = document.getElementById('editLinesBtn');
  const cancelEditBtn = document.getElementById('declCancelEditBtn');
  const actionHint  = document.getElementById('declActionHint');
  const previewWrap = document.getElementById('voucherPreviewWrap');
  const printBtn    = document.getElementById('printVoucherBtn');
  const downloadBtn = document.getElementById('downloadVoucherBtn');
  const tempDeclEl  = document.getElementById('tempDeclVoucherNo');
  const recentBody  = document.getElementById('declRecentBody');

  if (!linesWrap || !addLineBtn) return; // view not present on this page

  const HEAD_OPTIONS = [
    { label: 'Local Conveyance — Auto/Bus' },
    { label: 'Food & Snacks — Tea / Street Food' },
    { label: 'Toll / Parking' },
    { label: 'Bike Fuel Expense (Per KM)', basis: 'km', rateInput: 'rateBikeFuel' },
    { label: 'Car Fuel Expense (Per KM)', basis: 'km', rateInput: 'rateCarFuel' },
    { label: 'Own Arrangement Expense (Per Day)', basis: 'day', rateInput: 'rateOwnArrangement' },
    { label: 'Car Pool / Share (Per Trip)', basis: 'trip', rateInput: 'rateCarPool' },
    { label: 'Donation' },
    { label: 'Repair & Maintenance' },
    { label: 'Housekeeping Services' },
    { label: 'Tea & Milk' },
    { label: 'Toll Tax' },
    { label: 'Consultancy Fee' },
  ];
  const RATE_UNIT_LABELS = {
    km:   { unit: 'km',      short: 'km' },
    day:  { unit: 'day(s)',  short: 'day' },
    trip: { unit: 'trip(s)', short: 'trip' },
  };
  const BRANCH_OPTIONS = ['Pune', 'Mumbai'];

  let generated = false;
  let editingVoucherId = null; // set while editing a previously-generated voucher from the list
  const declarationVouchers = []; // { id, no, linesSnapshot, total, date, poolIds }

  // Show draft voucher number on load
  if (tempDeclEl) {
    tempDeclEl.textContent = genVoucherNo(resolvePrefix('declaration'), true);
  }

  function fmtINR(n) {
    return '₹ ' + (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function rows() {
    return Array.from(linesWrap.querySelectorAll('[data-decl-row]'));
  }

  function readRow(row) {
    return {
      head:    row.querySelector('.dl-head').value,
      branch:  row.querySelector('.dl-branch').value,
      date:    row.querySelector('.dl-date').value,
      amount:  parseFloat(row.querySelector('.dl-amount').value) || 0,
      purpose: row.querySelector('.dl-purpose').value.trim(),
      payTo:   row.querySelector('.dl-payto').value.trim(),
    };
  }

  function updateRemoveButtons() {
    const rs = rows();
    rs.forEach(r => { r.querySelector('.dl-remove').disabled = rs.length <= 1; });
  }

  function recalc() {
    const rs = rows();
    let total = 0;
    let allValid = rs.length > 0;
    rs.forEach(r => {
      const d = readRow(r);
      const valid = !!d.head && d.amount > 0;
      const touched = !!(d.head || d.amount || d.purpose);
      r.classList.toggle('dl-invalid', !valid && touched);
      if (!valid) allValid = false;
      total += d.amount;
    });
    if (countEl) countEl.textContent = rs.length;
    if (totalEl) totalEl.textContent = fmtINR(total);

    const ready = allValid && !!(declChk && declChk.checked);
    [saveBtn, topSaveBtn].forEach(b => { if (b) b.disabled = !ready || generated; });
    if (actionHint) {
      if (generated) {
        actionHint.textContent = 'Voucher generated — use Print or Download below, or Edit Lines to make changes.';
        actionHint.classList.add('ok');
      } else if (ready) {
        actionHint.textContent = 'Ready — click Save & Generate Voucher to create the printable copy.';
        actionHint.classList.add('ok');
      } else {
        actionHint.textContent = 'Add at least one complete line item and accept the declaration to continue.';
        actionHint.classList.remove('ok');
      }
    }
    return { total, allValid, rows: rs };
  }

  function wireRow(row) {
    row.querySelectorAll('select, input').forEach(el => {
      el.addEventListener('input', recalc);
      el.addEventListener('change', recalc);
    });
    row.querySelector('.dl-remove').addEventListener('click', () => {
      if (generated || rows().length <= 1) return;
      row.remove();
      updateRemoveButtons();
      recalc();
    });

    // Per-KM / Per-Day / Per-Trip smart calculator for this line
    const headSel   = row.querySelector('.dl-head');
    const amtInput  = row.querySelector('.dl-amount');
    const rateRow   = row.querySelector('.dl-rate-row');
    const qtyInput  = row.querySelector('.dl-qty');
    const rateHint  = row.querySelector('.dl-rate-hint');

    function currentRate(rateInputId) {
      const rateEl = rateInputId ? document.getElementById(rateInputId) : null;
      return rateEl ? parseFloat(rateEl.value) || 0 : 0;
    }

    function recomputeRate() {
      const opt   = headSel.selectedOptions[0];
      const basis = opt ? opt.dataset.rateBasis : null;

      if (!basis) {
        rateRow.style.display = 'none';
        amtInput.readOnly = false;
        return;
      }

      const info = RATE_UNIT_LABELS[basis];
      rateRow.style.display = 'flex';
      amtInput.readOnly = true;

      const rate = currentRate(opt.dataset.rateInput);
      const qty  = parseFloat(qtyInput.value) || 0;
      const amount = +(rate * qty).toFixed(2);
      amtInput.value = qty ? amount : '';
      rateHint.textContent = qty
        ? formatINR(rate) + '/' + info.short + ' × ' + qty + ' ' + info.unit + ' = ' + formatINR(amount)
        : formatINR(rate) + ' per ' + info.short + ' — set by Client Admin';
      recalc();
    }

    headSel.addEventListener('change', recomputeRate);
    qtyInput.addEventListener('input', recomputeRate);
  }

  function buildRow() {
    const row = document.createElement('div');
    row.className = 'decl-line-row';
    row.setAttribute('data-decl-row', '');
    row.innerHTML =
      '<select class="dl-head"><option value="">— Select head —</option>' +
      HEAD_OPTIONS.map(h =>
        '<option' +
        (h.basis ? ' data-rate-basis="' + h.basis + '" data-rate-input="' + h.rateInput + '"' : '') +
        '>' + h.label + '</option>'
      ).join('') +
      '</select>' +
      '<select class="dl-branch">' + BRANCH_OPTIONS.map(b => '<option>' + b + '</option>').join('') + '</select>' +
      '<input type="date" class="dl-date" value="' + new Date().toISOString().slice(0, 10) + '">' +
      '<input type="number" class="dl-amount" placeholder="0.00" min="0" step="0.01">' +
      '<input type="text" class="dl-purpose" placeholder="e.g. Auto fare — client office to site">' +
      '<input type="text" class="dl-payto" placeholder="e.g. Self" value="Self (Reimbursement)">' +
      '<button type="button" class="dl-remove" title="Remove this line">✕</button>' +
      '<div class="dl-rate-row" style="display:none;"><label>Quantity</label>' +
      '<input type="number" class="dl-qty" min="0" step="1" placeholder="0"><span class="dl-rate-hint"></span></div>';
    wireRow(row);
    return row;
  }

  // Regenerate the static first row's head options from HEAD_OPTIONS, so
  // there's a single source of truth instead of duplicating the list in HTML.
  rows().forEach(row => {
    const headSel = row.querySelector('.dl-head');
    const current = headSel.value;
    headSel.innerHTML = '<option value="">— Select head —</option>' +
      HEAD_OPTIONS.map(h =>
        '<option' +
        (h.basis ? ' data-rate-basis="' + h.basis + '" data-rate-input="' + h.rateInput + '"' : '') +
        '>' + h.label + '</option>'
      ).join('');
    headSel.value = current;
  });

  // Wire the row already present in the DOM
  rows().forEach(wireRow);
  updateRemoveButtons();

  /** Replace all current lines with the given snapshot (used by Edit). */
  function populateLines(snapshot) {
    linesWrap.querySelectorAll('[data-decl-row]').forEach(r => r.remove());
    snapshot.forEach(line => {
      const row = buildRow();
      const headSel = row.querySelector('.dl-head');
      headSel.value = line.head;
      row.querySelector('.dl-branch').value  = line.branch;
      row.querySelector('.dl-date').value    = line.date;
      row.querySelector('.dl-amount').value  = line.amount;
      row.querySelector('.dl-purpose').value = line.purpose;
      row.querySelector('.dl-payto').value   = line.payTo || 'Self (Reimbursement)';
      linesWrap.appendChild(row);

      // Re-evaluate the rate calculator for this head, and back-fill quantity
      // from the stored amount so a Per-KM/Per-Day/Per-Trip line edits cleanly.
      const opt = headSel.selectedOptions[0];
      if (opt && opt.dataset.rateBasis) {
        const rateEl = document.getElementById(opt.dataset.rateInput);
        const rate = rateEl ? parseFloat(rateEl.value) || 0 : 0;
        const qtyInput = row.querySelector('.dl-qty');
        qtyInput.value = rate ? +(line.amount / rate).toFixed(2) : '';
        headSel.dispatchEvent(new Event('change'));
      }
    });
    if (!snapshot.length) linesWrap.appendChild(buildRow());
    updateRemoveButtons();
    recalc();
  }

  addLineBtn.addEventListener('click', () => {
    if (generated) return; // locked until "Edit Lines" is used
    linesWrap.appendChild(buildRow());
    updateRemoveButtons();
    recalc();
  });

  if (declChk) declChk.addEventListener('change', recalc);

  function setLinesLocked(locked) {
    rows().forEach(r => {
      r.querySelectorAll('select, input').forEach(el => { el.disabled = locked; });
    });
    addLineBtn.disabled = locked;
    if (declChk) declChk.disabled = locked;
  }

  function buildPreview(voucherNo, total, rs) {
    if (tempDeclEl) tempDeclEl.textContent = voucherNo + ' (submitted)';

    const vsNo = document.getElementById('vsVoucherNo');
    if (vsNo) vsNo.textContent = voucherNo;

    const firstBranch = rs.length ? readRow(rs[0]).branch : '';
    const vsBranch = document.getElementById('vsBranch');
    if (vsBranch) vsBranch.textContent = firstBranch;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const vsDate = document.getElementById('vsDate');
    if (vsDate) vsDate.textContent = dateStr;
    const vsGenLine = document.getElementById('vsGenLine');
    if (vsGenLine) vsGenLine.textContent = 'Generated by Expense Easy on ' + dateStr + ', ' + timeStr;
    const vsEmpLine = document.getElementById('vsEmpLine');
    if (vsEmpLine) vsEmpLine.innerHTML = 'R. Sharma — ' + dateStr + '<div class="status ok">Declared &amp; Submitted</div>';

    const body = document.getElementById('vsItemsBody');
    if (body) {
      body.innerHTML = rs.map((r, i) => {
        const d  = readRow(r);
        const dd = d.date ? new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
        return '<tr><td>' + (i + 1) + '</td><td>' + (d.head || '—') + '</td><td>' + dd + '</td><td>' +
          d.branch + '</td><td>' + (d.purpose || '—') + '</td><td>' + (d.payTo || '—') + '</td><td class="amt">' + fmtINR(d.amount) + '</td></tr>';
      }).join('');
    }
    const vsTotalAmt = document.getElementById('vsTotalAmt');
    if (vsTotalAmt) vsTotalAmt.textContent = fmtINR(total);
  }

  /** Remove every EE_EXPENSE_POOL entry tied to a given voucher id. */
  function removePoolEntriesFor(voucherId) {
    for (let i = EE_EXPENSE_POOL.length - 1; i >= 0; i--) {
      if (EE_EXPENSE_POOL[i].parentVoucherId === voucherId) EE_EXPENSE_POOL.splice(i, 1);
    }
  }

  function renderDeclVouchers() {
    if (!recentBody) return;
    if (!declarationVouchers.length) {
      recentBody.innerHTML = '<tr id="declRecentEmptyRow"><td colspan="3" style="text-align:center;color:var(--slate);padding:18px;">No declaration vouchers yet.</td></tr>';
      return;
    }
    recentBody.innerHTML = declarationVouchers.slice().reverse().map(v =>
      '<tr><td class="voucher-id">' + v.no + '</td><td class="amt">' + fmtINR(v.total) + '</td>' +
      '<td class="approve-row-actions">' +
        '<button class="btn sm ghost" data-decl-action="edit" data-decl-id="' + v.id + '">Edit</button> ' +
        '<button class="btn sm danger" data-decl-action="delete" data-decl-id="' + v.id + '">Delete</button>' +
      '</td></tr>'
    ).join('');

    recentBody.querySelectorAll('[data-decl-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = declarationVouchers.find(x => x.id === btn.dataset.declId);
        if (!v) return;

        if (btn.dataset.declAction === 'edit') {
          editingVoucherId = v.id;
          generated = false;
          setLinesLocked(false);
          populateLines(v.linesSnapshot);
          if (declChk) declChk.checked = true;
          if (previewWrap) previewWrap.classList.remove('show');
          if (printBtn)    printBtn.disabled = true;
          if (downloadBtn) downloadBtn.disabled = true;
          if (editBtn)     editBtn.style.display = 'none';
          if (cancelEditBtn) cancelEditBtn.style.display = '';
          if (tempDeclEl) tempDeclEl.textContent = v.no + ' (editing)';
          [saveBtn, topSaveBtn].forEach(b => { if (b) b.textContent = 'Update Voucher'; });
          recalc();
          showToast('Editing ' + v.no + ' — update the lines and click Update Voucher.', 'info');
          document.getElementById('view-declare').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          const idx = declarationVouchers.indexOf(v);
          if (idx > -1) declarationVouchers.splice(idx, 1);
          removePoolEntriesFor(v.id);
          if (editingVoucherId === v.id) resetEditState();
          renderDeclVouchers();
          if (window.refreshBulkReportItems) window.refreshBulkReportItems();
          if (window.checkOutstandingAlert) window.checkOutstandingAlert();
          if (window.refreshDashboardAnalytics) window.refreshDashboardAnalytics();
          showToast(v.no + ' deleted.', 'success');
        }
      });
    });
  }

  function resetEditState() {
    editingVoucherId = null;
    generated = false;
    setLinesLocked(false);
    populateLines([]);
    if (declChk) declChk.checked = false;
    if (previewWrap) previewWrap.classList.remove('show');
    if (printBtn)    printBtn.disabled = true;
    if (downloadBtn) downloadBtn.disabled = true;
    if (editBtn)     editBtn.style.display = 'none';
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
    [saveBtn, topSaveBtn].forEach(b => { if (b) b.textContent = 'Save & Generate Voucher'; });
    if (tempDeclEl) tempDeclEl.textContent = genVoucherNo(resolvePrefix('declaration'), true);
    recalc();
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      resetEditState();
      showToast('Edit cancelled.', 'info');
    });
  }

  function doSaveAndGenerate() {
    const { total, allValid, rows: rs } = recalc();
    if (!rs.length || !allValid) {
      showToast('Please complete every line item (head + amount) before generating.', 'error');
      return;
    }
    if (!declChk || !declChk.checked) {
      showToast('Please accept the declaration statement first.', 'error');
      return;
    }

    const isEdit    = !!editingVoucherId;
    const existing  = isEdit ? declarationVouchers.find(v => v.id === editingVoucherId) : null;
    const voucherId = existing ? existing.id : 'decl-' + Date.now();
    const voucherNo = existing ? existing.no : genVoucherNo(resolvePrefix('declaration'));

    buildPreview(voucherNo, total, rs);

    // Rebuild this voucher's entries in the shared pool (used by Bulk Report)
    if (existing) removePoolEntriesFor(voucherId);
    const linesSnapshot = rs.map(r => readRow(r));
    linesSnapshot.forEach((line, i) => {
      EE_EXPENSE_POOL.push({
        id: voucherId + '-' + i,
        no: voucherNo + '-' + (i + 1),
        date: line.date || new Date().toISOString().slice(0, 10),
        project: 'Internal — Admin',
        head: line.head,
        purpose: line.purpose,
        payTo: line.payTo,
        amount: line.amount,
        status: 'draft',
        source: 'declaration',
        parentVoucherId: voucherId,
      });
    });

    const record = { id: voucherId, no: voucherNo, linesSnapshot, total, date: new Date() };
    if (existing) {
      Object.assign(existing, record);
    } else {
      declarationVouchers.push(record);
    }

    generated = true;
    editingVoucherId = null;
    setLinesLocked(true);
    if (previewWrap) previewWrap.classList.add('show');
    if (printBtn)    printBtn.disabled = false;
    if (downloadBtn) downloadBtn.disabled = false;
    if (editBtn)     editBtn.style.display = '';
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
    [saveBtn, topSaveBtn].forEach(b => { if (b) b.textContent = 'Save & Generate Voucher'; });
    recalc();
    renderDeclVouchers();
    if (window.refreshBulkReportItems) window.refreshBulkReportItems();
    if (window.checkOutstandingAlert) window.checkOutstandingAlert();
    if (window.refreshDashboardAnalytics) window.refreshDashboardAnalytics();

    showToast(
      (isEdit ? voucherNo + ' updated. ' : voucherNo + ' generated. ') +
      'Now available in Bulk Report — you can print or download it below.',
      'success', 5000
    );
    if (previewWrap) previewWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  [saveBtn, topSaveBtn].forEach(b => { if (b) b.addEventListener('click', doSaveAndGenerate); });

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      generated = false;
      setLinesLocked(false);
      if (previewWrap) previewWrap.classList.remove('show');
      if (printBtn)    printBtn.disabled = true;
      if (downloadBtn) downloadBtn.disabled = true;
      editBtn.style.display = 'none';
      recalc();
      showToast('Editing re-enabled — update your lines and generate again.', 'info');
    });
  }

  // Print
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      if (printBtn.disabled) return;
      const sheet = document.getElementById('declarationVoucherSheet');
      if (!sheet) return;
      sheet.classList.add('print-area-active');
      window.print();
      setTimeout(() => sheet.classList.remove('print-area-active'), 500);
      showToast('Printing declaration voucher…', 'info');
    });
  }

  // Download as PDF — uses the shared jsPDF/html2canvas helper so the file
  // that lands on disk is a real .pdf, matching the on-screen / printed voucher.
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      if (downloadBtn.disabled) return;
      const sheet = document.getElementById('declarationVoucherSheet');
      if (!sheet) return;

      const voucher  = document.getElementById('tempDeclVoucherNo');
      const filename = (voucher ? voucher.textContent.replace(/[^A-Z0-9\-\/]/gi, '-') : 'Declaration-Voucher') + '.pdf';

      downloadBtn.disabled = true;
      const originalLabel = downloadBtn.textContent;
      downloadBtn.textContent = 'Preparing PDF…';
      showToast('Generating PDF…', 'info');

      try {
        await downloadElementAsPDF(sheet, filename);
        showToast('Voucher downloaded as PDF.', 'success');
      } catch (err) {
        showToast('Could not generate PDF — check your internet connection and try again.', 'error', 5000);
      } finally {
        downloadBtn.disabled = false;
        downloadBtn.textContent = originalLabel;
      }
    });
  }

  recalc();
  renderDeclVouchers();
}


/* ============================================================
   15. MANAGER / HOD APPROVAL WORKFLOW
   ============================================================ */

/* ============================================================
   15b. CLIENT-WISE APPROVAL ROLE MAPPING
   ============================================================
   Names the actual 1st / 2nd / Finance approving authority (and their
   limit) per employee, per client — editable from Company Admin (their
   own client) and Super Admin (any client, via a company selector).
   Read-only on the employee side as "Your Approval Chain".
   ============================================================ */

/** Populate the employee-facing "Your Approval Chain" card, if a mapping exists. */
function renderApprovalChainCard() {
  const panel = document.getElementById('empApprovalChainPanel');
  const body  = document.getElementById('empApprovalChainBody');
  if (!panel || !body) return;

  const mapping = findApprovalMapping(EE_SESSION.company, EE_SESSION.name);
  if (!mapping) { panel.style.display = 'none'; return; }

  panel.style.display = '';
  const stages = [
    { stage: '1st Approval', name: mapping.firstApprover, limit: mapping.firstLimit },
    { stage: '2nd Approval', name: mapping.secondApprover, limit: mapping.secondLimit },
    { stage: 'Finance Approval & Settlement', name: mapping.financeApprover, limit: mapping.financeLimit },
  ];
  body.innerHTML = stages.map(s =>
    '<div class="chain-card"><div class="stage">' + s.stage + '</div><div class="name">' + s.name +
    '</div><div class="limit">Limit: <strong>' + formatINR(s.limit) + '</strong></div></div>'
  ).join('');
}
window.renderApprovalChainCard = renderApprovalChainCard;

function initApprovalMapping() {
  const caBody          = document.getElementById('caMappingBody');
  const saBody          = document.getElementById('saMappingBody');
  const finBody         = document.getElementById('finMappingBody');
  const saCompanySelect = document.getElementById('saMappingCompanySelect');
  const addCaBtn        = document.getElementById('caAddMappingBtn');
  const addSaBtn        = document.getElementById('saAddMappingBtn');
  const addFinBtn       = document.getElementById('finAddMappingBtn');
  const modal           = document.getElementById('modal-approvalmapping');
  const modalTitle      = document.getElementById('mappingModalTitle');
  const saveBtn         = document.getElementById('mappingSaveBtn');
  const fUserName       = document.getElementById('mapUserName');
  const fUserCode       = document.getElementById('mapUserCode');
  const f1Name          = document.getElementById('map1stName');
  const f1Limit         = document.getElementById('map1stLimit');
  const f2Name          = document.getElementById('map2ndName');
  const f2Limit         = document.getElementById('map2ndLimit');
  const fFName          = document.getElementById('mapFinName');
  const fFLimit         = document.getElementById('mapFinLimit');

  // Finance Team's own "Create Policy Rule" modal, on the Employee-portal
  // Policy view — a dedicated modal (rather than the shared Client Admin /
  // Super Admin one) so it isn't hidden by portal display rules when the
  // Employee portal is the active one.
  const finModal        = document.getElementById('modal-policyrule-emp');
  const finModalTitle   = document.getElementById('finMappingModalTitle');
  const finSaveBtn      = document.getElementById('finMappingSaveBtn');
  const finUserName     = document.getElementById('finMapUserName');
  const finUserCode     = document.getElementById('finMapUserCode');
  const fin1Name        = document.getElementById('finMap1stName');
  const fin1Limit       = document.getElementById('finMap1stLimit');
  const fin2Name        = document.getElementById('finMap2ndName');
  const fin2Limit       = document.getElementById('finMap2ndLimit');
  const finFName        = document.getElementById('finMapFinName');
  const finFLimit       = document.getElementById('finMapFinLimit');

  if (!caBody && !saBody && !finBody) return;

  let editingId     = null;
  let modalContext  = null; // 'ca' | 'sa' | 'fin'

  function rowHtml(m) {
    return '<tr>' +
      '<td><strong>' + m.user + '</strong><div class="hint">' + m.userCode + '</div></td>' +
      '<td>' + m.firstApprover + '<div class="hint">Limit: ' + formatINR(m.firstLimit) + '</div></td>' +
      '<td>' + m.secondApprover + '<div class="hint">Limit: ' + formatINR(m.secondLimit) + '</div></td>' +
      '<td>' + m.financeApprover + '<div class="hint">Limit: ' + formatINR(m.financeLimit) + '</div></td>' +
      '<td class="row-act">' +
        '<button class="btn sm ghost" data-map-action="edit" data-map-id="' + m.id + '">Edit</button> ' +
        '<button class="btn sm danger" data-map-action="delete" data-map-id="' + m.id + '">Delete</button>' +
      '</td></tr>';
  }

  function renderCa() {
    if (!caBody) return;
    const mine = EE_APPROVAL_MAPPING.filter(m => m.company === EE_SESSION.company);
    caBody.innerHTML = mine.length ? mine.map(rowHtml).join('') :
      '<tr id="caMappingEmptyRow"><td colspan="5" style="text-align:center;color:var(--slate);padding:18px;">No mappings yet for this company.</td></tr>';
  }

  function renderSa() {
    if (!saBody || !saCompanySelect || !saCompanySelect.value) return;
    const mine = EE_APPROVAL_MAPPING.filter(m => m.company === saCompanySelect.value);
    saBody.innerHTML = mine.length ? mine.map(rowHtml).join('') :
      '<tr id="saMappingEmptyRow"><td colspan="5" style="text-align:center;color:var(--slate);padding:18px;">No mappings yet for this client.</td></tr>';
  }

  function renderFin() {
    if (!finBody) return;
    const mine = EE_APPROVAL_MAPPING.filter(m => m.company === EE_SESSION.company);
    finBody.innerHTML = mine.length ? mine.map(rowHtml).join('') :
      '<tr id="finMappingEmptyRow"><td colspan="5" style="text-align:center;color:var(--slate);padding:18px;">No policy rules yet for this company.</td></tr>';
  }

  if (saCompanySelect) {
    saCompanySelect.innerHTML = Object.entries(COMPANY_DATA).map(([id, co]) =>
      '<option value="' + id + '">' + co.name + '</option>'
    ).join('');
    saCompanySelect.addEventListener('change', renderSa);
  }

  function openModal(context, existing) {
    modalContext = context;
    editingId = existing ? existing.id : null;
    modalTitle.textContent = existing ? 'Edit Approval Mapping' : 'Add Approval Mapping';
    fUserName.value = existing ? existing.user : '';
    fUserCode.value = existing ? existing.userCode : '';
    f1Name.value    = existing ? existing.firstApprover : '';
    f1Limit.value   = existing ? existing.firstLimit : '';
    f2Name.value    = existing ? existing.secondApprover : '';
    f2Limit.value   = existing ? existing.secondLimit : '';
    fFName.value    = existing ? existing.financeApprover : '';
    fFLimit.value   = existing ? existing.financeLimit : '';
    modal.classList.add('active');
  }

  function openFinModal(existing) {
    modalContext = 'fin';
    editingId = existing ? existing.id : null;
    finModalTitle.textContent = existing ? 'Edit Policy Rule' : 'Create Policy Rule';
    finUserName.value = existing ? existing.user : '';
    finUserCode.value = existing ? existing.userCode : '';
    fin1Name.value     = existing ? existing.firstApprover : '';
    fin1Limit.value    = existing ? existing.firstLimit : '';
    fin2Name.value     = existing ? existing.secondApprover : '';
    fin2Limit.value    = existing ? existing.secondLimit : '';
    finFName.value     = existing ? existing.financeApprover : '';
    finFLimit.value    = existing ? existing.financeLimit : '';
    finModal.classList.add('active');
  }

  if (addCaBtn)  addCaBtn.addEventListener('click', () => openModal('ca', null));
  if (addSaBtn)  addSaBtn.addEventListener('click', () => openModal('sa', null));
  if (addFinBtn) addFinBtn.addEventListener('click', () => openFinModal(null));

  function wireRowActions(body, context) {
    if (!body) return;
    body.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-map-action]');
      if (!btn) return;
      const m = EE_APPROVAL_MAPPING.find(x => x.id === btn.dataset.mapId);
      if (!m) return;

      if (btn.dataset.mapAction === 'edit') {
        if (context === 'fin') openFinModal(m); else openModal(context, m);
      } else {
        if (!window.confirm('Delete the policy rule for ' + m.user + '?')) return;
        const idx = EE_APPROVAL_MAPPING.indexOf(m);
        if (idx > -1) EE_APPROVAL_MAPPING.splice(idx, 1);
        renderCa(); renderSa(); renderFin();
        if (window.renderApprovalChainCard) window.renderApprovalChainCard();
        showToast('Policy rule deleted.', 'success');
      }
    });
  }
  wireRowActions(caBody, 'ca');
  wireRowActions(saBody, 'sa');
  wireRowActions(finBody, 'fin');

  function saveMapping(user, userCode, firstApprover, firstLimit, secondApprover, secondLimit, financeApprover, financeLimit) {
    if (!user || !firstApprover || !firstLimit || !secondApprover ||
        !secondLimit || !financeApprover || !financeLimit) {
      showToast('Please fill in every field before saving.', 'error');
      return false;
    }
    const company = modalContext === 'sa' ? saCompanySelect.value : EE_SESSION.company;

    if (editingId) {
      const m = EE_APPROVAL_MAPPING.find(x => x.id === editingId);
      Object.assign(m, {
        user, userCode,
        firstApprover,  firstLimit: parseFloat(firstLimit),
        secondApprover, secondLimit: parseFloat(secondLimit),
        financeApprover, financeLimit: parseFloat(financeLimit),
      });
      showToast('Policy rule updated for ' + user + '.', 'success');
    } else {
      EE_APPROVAL_MAPPING.push({
        id: 'map-' + Date.now(), company, user, userCode,
        firstApprover,  firstLimit: parseFloat(firstLimit),
        secondApprover, secondLimit: parseFloat(secondLimit),
        financeApprover, financeLimit: parseFloat(financeLimit),
      });
      showToast('Policy rule created for ' + user + '.', 'success');
    }

    renderCa(); renderSa(); renderFin();
    if (window.renderApprovalChainCard) window.renderApprovalChainCard();
    return true;
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const ok = saveMapping(
        fUserName.value.trim(), fUserCode.value.trim(),
        f1Name.value.trim(), f1Limit.value,
        f2Name.value.trim(), f2Limit.value,
        fFName.value.trim(), fFLimit.value
      );
      if (ok && window.closeAllModals) window.closeAllModals();
    });
  }

  if (finSaveBtn) {
    finSaveBtn.addEventListener('click', () => {
      const ok = saveMapping(
        finUserName.value.trim(), finUserCode.value.trim(),
        fin1Name.value.trim(), fin1Limit.value,
        fin2Name.value.trim(), fin2Limit.value,
        finFName.value.trim(), finFLimit.value
      );
      if (ok && window.closeAllModals) window.closeAllModals();
    });
  }

  renderCa();
  renderSa();
  renderFin();
}


function initManagerApprovals() {
  $$('#mgrApprovalsBody [data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const row      = btn.closest('tr');
      const action   = btn.dataset.action;
      const cell     = row.querySelector('.approve-row-actions');
      const badge    = btn.dataset.badge;
      const amount   = parseInt(row.dataset.amount || '0', 10);
      const empCell  = row.querySelector('td:nth-child(2)');
      const empName  = empCell ? empCell.textContent.trim() : '';

      // Prefer this employee's named approving authority & limit (Client-wise
      // Approval Role Mapping) over the blanket company-wide limit, if set.
      const mapping    = findApprovalMapping(EE_SESSION.company, empName);
      const limits     = getLiveApprovalLimits();
      const firstLimit = mapping ? mapping.firstLimit     : limits.manager;
      const nextName   = mapping ? mapping.secondApprover : 'HOD';

      if (action === 'approve' && amount > firstLimit) {
        const remarks = window.prompt(
          'Amount ' + formatINR(amount) + ' exceeds the 1st approval limit of ' + formatINR(firstLimit) +
          ' for ' + (empName || 'this employee') + '.\n\n' +
          'Remarks are required to escalate this claim to ' + nextName + ':'
        );
        if (!remarks || !remarks.trim()) {
          showToast('Remarks are required to escalate a claim over limit — approval cancelled.', 'error');
          return;
        }

        showToast(
          `Amount ${formatINR(amount)} exceeds the 1st approval limit of ${formatINR(firstLimit)}. Escalated to ${nextName}.`,
          'error', 4500
        );

        cell.innerHTML = '';
        cell.appendChild(makePill('Escalated to ' + nextName, 'amber'));
        const remarkNote = document.createElement('div');
        remarkNote.className = 'hint';
        remarkNote.style.marginTop = '4px';
        remarkNote.textContent = 'Remarks: ' + remarks.trim();
        cell.appendChild(remarkNote);

        row.style.opacity = '0.6';
        decrementBadge(badge);
        return;
      }

      if (action === 'approve') {
        cell.innerHTML = '';
        cell.appendChild(makePill('Approved — Sent to Finance', 'green'));
        showToast('Claim approved and routed to Finance.', 'success');
      } else {
        // Show reject reason textarea in the row
        const reason = window.prompt('Enter rejection reason (optional):') || '';
        cell.innerHTML = '';
        const pill = makePill('Rejected' + (reason ? ' — ' + reason : ''), 'red');
        cell.appendChild(pill);
        showToast('Claim rejected.', 'error');
      }

      row.style.opacity = '0.55';
      row.style.transition = 'opacity .3s';
      decrementBadge(badge);
    });
  });
}


/* ============================================================
   16. FINANCE APPROVAL & SETTLEMENT WORKFLOW
   ============================================================ */

function initFinanceApprovals() {
  const body = document.getElementById('finApprovalsBody');
  if (!body) return;

  // Event delegation so rows added later (e.g. an approved Bulk Report
  // handed over from Manager/HOD Approvals) work without re-wiring.
  body.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || !body.contains(btn)) return;

    const row    = btn.closest('tr');
    const action = btn.dataset.action;
    const cell   = row.querySelector('.approve-row-actions');
    const badge  = btn.dataset.badge;
    const amount = parseInt(row.dataset.amount || '0', 10);

    // Enforce Finance approval limit
    const limits = getLiveApprovalLimits();
    if (action === 'settle' && amount > limits.finance) {
      showToast(
        `Amount ${formatINR(amount)} exceeds Finance approval limit of ${formatINR(limits.finance)}. ` +
        'Escalated to Company Admin.',
        'error', 4000
      );
      cell.innerHTML = '';
      cell.appendChild(makePill('Escalated to Admin', 'amber'));
      row.style.opacity = '0.6';
      decrementBadge(badge);
      return;
    }

    if (action === 'settle') {
      // Mark row as settled
      cell.innerHTML = '';
      cell.appendChild(makePill('Settled & Posted', 'green'));
      row.style.opacity  = '0.55';
      row.style.transition = 'opacity .3s';

      // Update KPI counters
      decrementBadge(badge);
      incrementCounter('finApprovedCount');
      incrementCounter('finSettledCount');

      const pendingEl = document.getElementById('finPendingCount');
      if (pendingEl) {
        pendingEl.textContent = Math.max(0, parseInt(pendingEl.textContent, 10) - 1);
      }

      // Append to Settled table
      appendToSettledTable(row);

      showToast(
        `${row.dataset.voucher || 'Claim'} settled and posted to Tally. Ledger updated.`,
        'success', 4000
      );

    } else {
      // Reject
      const reason = window.prompt('Enter rejection reason (optional):') || '';
      cell.innerHTML = '';
      cell.appendChild(makePill('Rejected', 'red'));
      row.style.opacity   = '0.55';
      row.style.transition = 'opacity .3s';

      decrementBadge(badge);

      const pendingEl = document.getElementById('finPendingCount');
      if (pendingEl) {
        pendingEl.textContent = Math.max(0, parseInt(pendingEl.textContent, 10) - 1);
      }

      showToast('Claim rejected' + (reason ? ': ' + reason : '.'), 'error');
    }
  });
}

/**
 * Append a newly settled row into the Settled table below.
 * @param {HTMLTableRowElement} sourceRow
 */
function appendToSettledTable(sourceRow) {
  const settledBody = document.getElementById('finSettledBody');
  if (!settledBody) return;

  const amtCell = sourceRow.querySelector('.amt');
  const tr      = document.createElement('tr');

  tr.innerHTML =
    `<td class="voucher-id">${sourceRow.dataset.voucher || '—'}</td>` +
    `<td>${sourceRow.dataset.gl   || '—'}</td>`  +
    `<td>${sourceRow.dataset.cc   || '—'}</td>`  +
    `<td class="amt">${amtCell ? amtCell.textContent : '—'}</td>` +
    `<td></td>` +
    `<td></td>`;

  tr.querySelector('td:nth-child(5)').appendChild(makePill('Posted',  'green'));
  tr.querySelector('td:nth-child(6)').appendChild(makePill('Updated', 'green'));

  settledBody.prepend(tr);
}


/* ============================================================
   17. APPROVAL LIMIT ENFORCEMENT
   ============================================================ */

/**
 * Read live approval limits from Masters & Policy form fields (if changed by admin),
 * falling back to the configured defaults.
 * @returns {{ manager: number, hod: number, finance: number }}
 */
function getLiveApprovalLimits() {
  const limitManager = document.getElementById('limitManager');
  const limitHOD     = document.getElementById('limitHOD');
  const limitFinance  = document.getElementById('limitFinance');

  return {
    manager : limitManager ? parseFloat(limitManager.value) || EE_CONFIG.APPROVAL_LIMITS.manager  : EE_CONFIG.APPROVAL_LIMITS.manager,
    hod     : limitHOD     ? parseFloat(limitHOD.value)     || EE_CONFIG.APPROVAL_LIMITS.hod      : EE_CONFIG.APPROVAL_LIMITS.hod,
    finance : limitFinance  ? parseFloat(limitFinance.value) || EE_CONFIG.APPROVAL_LIMITS.finance  : EE_CONFIG.APPROVAL_LIMITS.finance,
  };
}

/**
 * Update the limit display strips (visible in the Approvals & Finance pages)
 * to reflect current policy values.
 */
function syncLimitDisplays() {
  const limits = getLiveApprovalLimits();

  const mgrDisplay = document.getElementById('mgrLimitDisplay');
  const finDisplay = document.getElementById('finLimitDisplay');

  if (mgrDisplay) mgrDisplay.textContent = formatINR(limits.manager);
  if (finDisplay) finDisplay.textContent = formatINR(limits.finance);
}

/**
 * Enforce limits on an existing approval table — disable Approve/Settle buttons
 * for rows that exceed the acting authority's limit.
 * @param {string}  bodyId        tbody element id
 * @param {number}  limit         max approvable amount
 * @param {string}  escalateLabel button label when limit is exceeded
 */
function enforceLimitsOnTable(bodyId, limit, escalateLabel) {
  $$(`#${bodyId} tr[data-amount]`).forEach(row => {
    const amt        = parseInt(row.dataset.amount, 10);
    const approveBtn = row.querySelector('[data-action="approve"], [data-action="settle"]');
    if (approveBtn && !approveBtn.disabled && amt > limit) {
      approveBtn.disabled    = true;
      approveBtn.textContent = escalateLabel;
      approveBtn.classList.remove('gold');
      approveBtn.classList.add('ghost');
      approveBtn.title = `Exceeds limit of ${formatINR(limit)}`;
    }
  });
}

function initApprovalLimits() {
  const limits = getLiveApprovalLimits();
  enforceLimitsOnTable('mgrApprovalsBody', limits.manager, 'Exceeds Limit — Escalate to HOD');
  enforceLimitsOnTable('finApprovalsBody', limits.finance, 'Exceeds Limit — Escalate to Admin');
  syncLimitDisplays();

  // Re-enforce when admin changes limit fields live
  ['limitManager', 'limitHOD', 'limitFinance'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        syncLimitDisplays();
        showToast('Approval limits updated.', 'info');
      });
    }
  });
}


/* ============================================================
   18. VOUCHER PREFIX — COMPANY ADMIN SETTINGS
   ============================================================ */

function initVoucherPrefixSettings() {
  const prefixToggle  = document.getElementById('prefixToggle');
  const prefixExpense = document.getElementById('prefixExpense');
  const prefixDecl    = document.getElementById('prefixDecl');

  if (!prefixToggle) return;

  prefixToggle.addEventListener('change', () => {
    const useCustom = prefixToggle.value === 'yes';
    if (prefixExpense) prefixExpense.disabled = !useCustom;
    if (prefixDecl)    prefixDecl.disabled    = !useCustom;

    // Refresh temp voucher number displays in employee portal
    const tempExpEl  = document.getElementById('tempVoucherNo');
    const tempDeclEl = document.getElementById('tempDeclVoucherNo');

    if (tempExpEl)  tempExpEl.textContent  = genVoucherNo(resolvePrefix('expense'),     true);
    if (tempDeclEl) tempDeclEl.textContent = genVoucherNo(resolvePrefix('declaration'), true);

    showToast(
      useCustom ? 'Custom prefix enabled.' : 'Using platform default prefix (EXP / SDV).',
      'info'
    );
  });
}


/* ============================================================
   19. DASHBOARD LIVE STATS
   ============================================================ */

/**
 * Populate employee dashboard KPI counts with illustrative values.
 * In production these come from a REST API call.
 */
function refreshDashboardStats() {
  const stats = {
    'dash-submitted-count'  : 12,
    'dash-pending-count'    :  4,
    'dash-approved-count'   :  7,
    'dash-advance-count'    :  1,
    'dash-total-amount'     : null, // formatted separately below
  };

  Object.entries(stats).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el && val !== null) el.textContent = val;
  });

  // Total submitted amount
  const totalEl = document.getElementById('dash-total-amount');
  if (totalEl) totalEl.textContent = formatINR(148340);

  // Quick-link counts in dashboard widgets
  const pendingApprEl = document.getElementById('dash-pending-approvals');
  if (pendingApprEl) pendingApprEl.textContent = 4;
}


/* ============================================================
   20. LEDGER — RUNNING BALANCE
   ============================================================ */

function initLedger() {
  // Recalculate running balance on any dynamic ledger rows
  const ledgerBody = $('#view-ledger table tbody');
  if (!ledgerBody) return;

  let balance = 0;
  let totalDebit = 0;
  let totalCredit = 0;
  $$('tr', ledgerBody).forEach(row => {
    const debit  = parseFloat((row.querySelector('td:nth-child(4)') || {}).textContent?.replace(/[₹,\s]/g, '') || 0);
    const credit = parseFloat((row.querySelector('td:nth-child(5)') || {}).textContent?.replace(/[₹,\s]/g, '') || 0);
    totalDebit  += debit;
    totalCredit += credit;
    balance += credit - debit;
    const balCell = row.querySelector('td:nth-child(6)');
    if (balCell && balCell.textContent.trim() === '—') {
      balCell.textContent = formatINR(balance);
    }
  });

  renderLedgerTotals(totalDebit, totalCredit, balance);
  initLedgerExport();
}

/**
 * Format a signed ledger amount for display: positive balances render in
 * plain dark green; negative balances render in red, wrapped in brackets
 * per standard accounting convention, e.g. (₹ 1,200).
 */
function formatLedgerAmount(n) {
  const abs = Math.abs(n);
  const text = formatINR(abs);
  if (n < 0) return { text: '(' + text + ')', color: 'var(--red)' };
  return { text: text, color: 'var(--green)' };
}

/** Populate the Transaction History footer row: Total Debit / Total Credit / Net Balance. */
function renderLedgerTotals(totalDebit, totalCredit, netBalance) {
  const debitEl  = document.getElementById('ledgerTotalDebit');
  const creditEl = document.getElementById('ledgerTotalCredit');
  const netEl    = document.getElementById('ledgerNetBalance');
  if (!debitEl || !creditEl || !netEl) return;

  debitEl.textContent  = formatINR(totalDebit);
  creditEl.textContent = formatINR(totalCredit);

  const net = formatLedgerAmount(netBalance);
  netEl.textContent = net.text;
  netEl.style.color = net.color;
  netEl.style.fontWeight = '700';
}



/** Read the on-screen ledger table + summary cards into plain data, for export. */
function readLedgerData() {
  const rows = $$('#view-ledger table tbody tr').map(row => {
    const cells = row.querySelectorAll('td');
    return {
      date: cells[0] ? cells[0].textContent.trim() : '',
      type: cells[1] ? cells[1].textContent.trim() : '',
      ref:  cells[2] ? cells[2].textContent.trim() : '',
      debit:  cells[3] ? cells[3].textContent.trim() : '',
      credit: cells[4] ? cells[4].textContent.trim() : '',
      balance: cells[5] ? cells[5].textContent.trim() : '',
    };
  });

  const summaryEls = $$('#view-ledger .ledger-summary > div');
  const summary = summaryEls.map(el => ({
    label: el.querySelector('.l') ? el.querySelector('.l').textContent.trim() : '',
    value: el.querySelector('.v') ? el.querySelector('.v').textContent.trim() : '',
  }));

  const totalDebitEl  = document.getElementById('ledgerTotalDebit');
  const totalCreditEl = document.getElementById('ledgerTotalCredit');
  const netBalanceEl  = document.getElementById('ledgerNetBalance');
  const totals = {
    debit:  totalDebitEl  ? totalDebitEl.textContent.trim()  : '',
    credit: totalCreditEl ? totalCreditEl.textContent.trim() : '',
    net:    netBalanceEl  ? netBalanceEl.textContent.trim()  : '',
    netColor: netBalanceEl ? netBalanceEl.style.color : '',
  };

  const meta = $('#view-ledger .topbar .meta');
  return { rows, summary, totals, meta: meta ? meta.textContent.trim() : '' };
}

function initLedgerExport() {
  const pdfBtn   = document.getElementById('ledgerExportPdfBtn');
  const excelBtn = document.getElementById('ledgerExportExcelBtn');
  if (!pdfBtn || !excelBtn) return;
  if (pdfBtn.dataset.wired) return; // guard against double-wiring on re-init
  pdfBtn.dataset.wired = '1';

  async function withBusyState(btn, label, fn) {
    if (btn.disabled) return;
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = label;
    try {
      await fn();
    } catch (err) {
      console.error('Ledger export failed:', err);
      showToast('Could not export — check your internet connection and try again.', 'error', 5000);
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  }

  pdfBtn.addEventListener('click', () => withBusyState(pdfBtn, 'Preparing PDF…', async () => {
    const { rows, summary, totals, meta } = readLedgerData();
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const sheet = document.createElement('div');
    sheet.className = 'v-sheet';
    sheet.style.position = 'fixed';
    sheet.style.left = '-9999px';
    sheet.style.top = '0';
    sheet.style.width = '760px';

    sheet.innerHTML =
      '<div class="v-head">' +
        '<div><div class="org">Shield Infra Solutions <span style="color:var(--gold);">Pvt. Ltd.</span></div>' +
        '<div class="org-sub">Pune · Mumbai · Bengaluru · Delhi NCR</div></div>' +
        '<div class="doc-type"><div class="label">Statement Date</div><div class="num">' + dateStr + '</div></div>' +
      '</div>' +
      '<div class="v-title">Employee Ledger Statement</div>' +
      '<div class="v-grid"><div class="row full"><div class="k">Employee</div><div class="v">' + meta + '</div></div></div>' +
      '<table class="v-items"><thead><tr><th>Date</th><th>Type</th><th>Reference</th><th class="amt">Debit</th><th class="amt">Credit</th><th class="amt">Balance</th></tr></thead>' +
      '<tbody>' + rows.map(r =>
        '<tr><td>' + r.date + '</td><td>' + r.type + '</td><td>' + r.ref + '</td><td class="amt">' +
        r.debit + '</td><td class="amt">' + r.credit + '</td><td class="amt">' + r.balance + '</td></tr>'
      ).join('') + '</tbody>' +
      '<tfoot><tr style="font-weight:700;border-top:2px solid #1B2430;">' +
        '<td colspan="3">Total</td>' +
        '<td class="amt">' + totals.debit + '</td>' +
        '<td class="amt">' + totals.credit + '</td>' +
        '<td class="amt" style="color:' + (totals.netColor || 'inherit') + ';">' + totals.net + '</td>' +
      '</tr></tfoot></table>' +
      '<div class="amount-box"><div class="label">' + (summary[2] ? summary[2].label : 'Closing Balance') +
      '</div><div class="value">' + (summary[2] ? summary[2].value : '') + '</div></div>';

    document.body.appendChild(sheet);
    try {
      await downloadElementAsPDF(sheet, 'Ledger-Statement-' + dateStr.replace(/\s+/g, '-') + '.pdf');
      showToast('Ledger exported as PDF.', 'success');
    } finally {
      document.body.removeChild(sheet);
    }
  }));

  excelBtn.addEventListener('click', () => withBusyState(excelBtn, 'Preparing Excel…', async () => {
    await ensureXlsxLib();
    const { rows, summary, totals, meta } = readLedgerData();
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const aoa = [
      ['Shield Infra Solutions Pvt. Ltd. — Employee Ledger Statement'],
      [meta],
      ['Statement Date', dateStr],
      [],
      ['Date', 'Type', 'Reference', 'Debit', 'Credit', 'Balance'],
      ...rows.map(r => [r.date, r.type, r.ref, r.debit, r.credit, r.balance]),
      ['Total', '', '', totals.debit, totals.credit, totals.net],
      [],
      ...summary.map(s => [s.label, s.value]),
    ];

    const ws = window.XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{ wch: 10 }, { wch: 24 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
    window.XLSX.writeFile(wb, 'Ledger-Statement-' + dateStr.replace(/\s+/g, '-') + '.xlsx');
    showToast('Ledger exported as Excel.', 'success');
  }));
}


/* ============================================================
   21. TOUR REQUEST — STATUS UPDATE
   ============================================================ */

function initTourRequest() {
  const tourForm = $('#view-tourapproval .panel-body.pad');
  if (!tourForm) return;

  // "New Tour Request" button clears and focuses the form
  $$('#view-tourapproval .actions .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const inputs = $$('input, select, textarea', tourForm);
      inputs.forEach(el => {
        if (el.tagName === 'SELECT') el.selectedIndex = 0;
        else el.value = '';
      });
      const first = tourForm.querySelector('input, select');
      if (first) first.focus();
      showToast('Tour request form cleared — fill in your details.', 'info');
    });
  });

  // Submit tour request
  const submitTourBtn = tourForm.querySelector('.btn.gold, button[type="submit"]');
  if (submitTourBtn) {
    submitTourBtn.addEventListener('click', () => {
      const destination = tourForm.querySelector('input[placeholder*="City"], input[placeholder*="Site"]');
      if (!destination || !destination.value.trim()) {
        showToast('Please enter your tour destination.', 'error');
        if (destination) destination.focus();
        return;
      }
      showToast('Tour request submitted — awaiting Manager approval.', 'success');
    });
  }
}


/* ============================================================
   22. DISPUTE REQUEST — SUBMISSION
   ============================================================ */

function initDisputeRequest() {
  const disputePane = $('#view-dispute .panel-body.pad');
  if (!disputePane) return;

  $$('#view-dispute .actions .btn', document).forEach(btn => {
    if (btn.classList.contains('gold')) {
      btn.addEventListener('click', () => {
        const desc = disputePane.querySelector('textarea');
        if (!desc || !desc.value.trim()) {
          showToast('Please describe your dispute in the description field.', 'error');
          if (desc) desc.focus();
          return;
        }
        showToast('Dispute raised — reference assigned and routed to Finance team.', 'success', 4000);
        if (desc) desc.value = '';
      });
    }
  });
}


/* ============================================================
   22b. BULK REPORT — SELECT · MERGE · SUBMIT · APPROVE
   ============================================================
   A self-contained mini module: employee picks any combination of
   date-range, project-wise, and manually-ticked expense entries,
   merges them (by date or serial) into one report, and submits it
   for approval. The same batch then appears in the Manager / HOD
   Approvals view (both live in the same employee-portal DOM, toggled
   only by the "Viewing as" role switch) — approving it there flips
   the status back here to Approved.
   ============================================================ */

/* ============================================================
   22c. OUTSTANDING-AMOUNT ALERTS + CROSS-ROLE NOTIFICATIONS
   ============================================================
   Backs the Dispatch menu: a "Submit & Notify" pushes one entry into
   EE_NOTIFICATIONS, which every role's dashboard/queue reads from — this
   is how a single-page prototype simulates a notice reaching every level
   at once. checkOutstandingAlert() compares the pool's non-dispatched /
   non-settled total against the currently logged-in role's threshold.
   ============================================================ */

/** Sum of pool amounts not yet approved/settled — i.e. still outstanding. */
function computeOutstandingAmount() {
  return EE_EXPENSE_POOL.reduce((sum, it) => {
    return (it.status === 'draft' || it.status === 'submitted') ? sum + it.amount : sum;
  }, 0);
}

function getOutstandingThreshold() {
  return EE_OUTSTANDING_THRESHOLDS[EE_SESSION.title] || EE_OUTSTANDING_THRESHOLDS['User'];
}

/** Re-check the outstanding total against this role's threshold and refresh every alert banner in the DOM. */
function checkOutstandingAlert() {
  const outstanding = computeOutstandingAmount();
  const threshold   = getOutstandingThreshold();
  const exceeded    = outstanding > threshold;
  const roleLabel   = EE_SESSION.title || 'your';

  ['outstandingAlert-dashboard', 'outstandingAlert-approvals', 'outstandingAlert-financeapproval'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (exceeded) {
      el.style.display = 'flex';
      el.innerHTML =
        '<span class="icon">⚠</span><span>Outstanding non-dispatched / non-receipted expenses total <strong>' +
        formatINR(outstanding) + '</strong>, which exceeds the ' + roleLabel + ' alert limit of <strong>' +
        formatINR(threshold) + '</strong>. Please settle, submit or dispatch pending bills. ' +
        '<span class="link" data-outstanding-goto-dispatch>Go to Dispatch →</span></span>';
    } else {
      el.style.display = 'none';
      el.innerHTML = '';
    }
  });

  // Admin banners (Company Admin / Super Admin) never link into the employee
  // portal's Dispatch menu, since it doesn't exist there — text only.
  ['outstandingAlert-ca', 'outstandingAlert-sa'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (exceeded) {
      el.style.display = 'flex';
      el.innerHTML =
        '<span class="icon">⚠</span><span>Outstanding non-dispatched / non-receipted expenses total <strong>' +
        formatINR(outstanding) + '</strong>, which exceeds the ' + roleLabel + ' alert limit of <strong>' +
        formatINR(threshold) + '</strong>.</span>';
    } else {
      el.style.display = 'none';
      el.innerHTML = '';
    }
  });

  return { outstanding, threshold, exceeded };
}
window.checkOutstandingAlert = checkOutstandingAlert;

// One delegated listener handles every "Go to Dispatch →" link, wherever it appears.
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-outstanding-goto-dispatch]')) {
    const dispatchNav = document.querySelector('#portal-employee [data-view="dispatch"]');
    if (dispatchNav) dispatchNav.click();
  }
});

/** Refresh every "🔔 Recent Notifications" panel from EE_NOTIFICATIONS. */
function renderNotifications() {
  const pairs = [
    ['notifPanel-dashboard',       'notifList-dashboard'],
    ['notifPanel-approvals',       'notifList-approvals'],
    ['notifPanel-financeapproval', 'notifList-financeapproval'],
    ['notifPanel-ca',              'notifList-ca'],
    ['notifPanel-sa',              'notifList-sa'],
  ];
  const recent = EE_NOTIFICATIONS.slice().reverse().slice(0, 5);

  pairs.forEach(([panelId, listId]) => {
    const panel = document.getElementById(panelId);
    const list  = document.getElementById(listId);
    if (!panel || !list) return;
    if (!recent.length) {
      panel.style.display = 'none';
      list.innerHTML = '';
      return;
    }
    panel.style.display = '';
    list.innerHTML = recent.map(n =>
      '<li>' + n.message + '<span class="when">' + n.when + ' · <span class="levels">Notified: ' +
      n.levels.join(' → ') + '</span></span></li>'
    ).join('');
  });
}
window.renderNotifications = renderNotifications;


/* ============================================================
   22e. DASHBOARD ANALYTICS — charts + smart insights
   ============================================================
   Every number here is computed live from EE_EXPENSE_POOL /
   EE_BULK_REPORTS / EE_DISPATCHES — nothing is hand-typed, so the
   dashboard genuinely reflects whatever's been submitted this session.
   ============================================================ */

const EE_CHART_COLORS = ['#B8860B', '#2F6B4F', '#1B2430', '#9A6A14', '#5C6B7A', '#7A9BAE', '#C54444', '#8C99A6'];
let _eeCharts = {}; // keyed by canvas id, so re-renders destroy the old instance first

function computeWeeklyTrend() {
  const buckets = {}; // 'W1'..'W5' -> total
  EE_EXPENSE_POOL.forEach(it => {
    const day = new Date(it.date).getDate();
    const week = 'Week ' + Math.min(5, Math.ceil(day / 7));
    buckets[week] = (buckets[week] || 0) + it.amount;
  });
  const labels = Object.keys(buckets).sort();
  return { labels, values: labels.map(l => buckets[l]) };
}

function computeCategoryBreakdown() {
  const byHead = {};
  EE_EXPENSE_POOL.forEach(it => { byHead[it.head] = (byHead[it.head] || 0) + it.amount; });
  const sorted = Object.entries(byHead).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 5);
  const rest = sorted.slice(5).reduce((s, [, v]) => s + v, 0);
  const labels = top.map(([h]) => h);
  const values = top.map(([, v]) => v);
  if (rest > 0) { labels.push('Other'); values.push(rest); }
  return { labels, values };
}

function computeProjectBreakdown() {
  const byProject = {};
  EE_EXPENSE_POOL.forEach(it => { byProject[it.project] = (byProject[it.project] || 0) + it.amount; });
  const sorted = Object.entries(byProject).sort((a, b) => b[1] - a[1]);
  return { labels: sorted.map(([p]) => p), values: sorted.map(([, v]) => v) };
}

function eeChartFonts() {
  return { family: 'Inter, sans-serif', size: 11, color: '#5C6B7A' };
}

/** Create (or replace) a Chart.js instance on a canvas by id. */
function eeRenderChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (_eeCharts[canvasId]) { _eeCharts[canvasId].destroy(); delete _eeCharts[canvasId]; }
  _eeCharts[canvasId] = new window.Chart(canvas.getContext('2d'), config);
}

function eeShowChartEmpty(canvasId, message) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (_eeCharts[canvasId]) { _eeCharts[canvasId].destroy(); delete _eeCharts[canvasId]; }
  const wrap = canvas.closest('.chart-wrap');
  if (wrap) wrap.innerHTML = '<div class="chart-empty">' + message + '</div>';
}

async function renderDashboardCharts() {
  const trend    = computeWeeklyTrend();
  const category = computeCategoryBreakdown();
  const project  = computeProjectBreakdown();

  if (!EE_EXPENSE_POOL.length) {
    eeShowChartEmpty('dashChartTrend', 'No expenses yet — submit your first claim to see trends here.');
    eeShowChartEmpty('dashChartCategory', 'No category data yet.');
    eeShowChartEmpty('dashChartProject', 'No project data yet.');
    return;
  }

  try {
    await ensureChartJs();
  } catch (err) {
    console.error('Chart.js failed to load:', err);
    ['dashChartTrend', 'dashChartCategory', 'dashChartProject'].forEach(id =>
      eeShowChartEmpty(id, 'Charts need an internet connection to load the first time.')
    );
    return;
  }

  const fonts = eeChartFonts();
  window.Chart.defaults.font.family = fonts.family;
  window.Chart.defaults.color = fonts.color;

  // ---- Weekly spend trend (bar) ----
  eeRenderChart('dashChartTrend', {
    type: 'bar',
    data: {
      labels: trend.labels,
      datasets: [{
        label: 'Spend',
        data: trend.values,
        backgroundColor: '#B8860B',
        borderRadius: 2,
        maxBarThickness: 46,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1B2430', padding: 10, cornerRadius: 2,
          callbacks: { label: ctx => '₹ ' + ctx.parsed.y.toLocaleString('en-IN') },
        },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: '#EFEBE2' }, ticks: { callback: v => '₹' + (v >= 1000 ? (v / 1000) + 'k' : v) } },
        x: { grid: { display: false } },
      },
    },
  });

  // ---- Category breakdown (doughnut) ----
  eeRenderChart('dashChartCategory', {
    type: 'doughnut',
    data: {
      labels: category.labels,
      datasets: [{ data: category.values, backgroundColor: EE_CHART_COLORS, borderColor: '#F7F5F0', borderWidth: 2 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '62%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10, font: { size: 10.5 } } },
        tooltip: {
          backgroundColor: '#1B2430', padding: 10, cornerRadius: 2,
          callbacks: { label: ctx => ctx.label + ': ₹ ' + ctx.parsed.toLocaleString('en-IN') },
        },
      },
    },
  });

  // ---- Project breakdown (horizontal bar) ----
  eeRenderChart('dashChartProject', {
    type: 'bar',
    data: {
      labels: project.labels,
      datasets: [{
        data: project.values,
        backgroundColor: '#2F6B4F',
        borderRadius: 2,
        maxBarThickness: 28,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1B2430', padding: 10, cornerRadius: 2,
          callbacks: { label: ctx => '₹ ' + ctx.parsed.x.toLocaleString('en-IN') },
        },
      },
      scales: {
        x: { beginAtZero: true, grid: { color: '#EFEBE2' }, ticks: { callback: v => '₹' + (v >= 1000 ? (v / 1000) + 'k' : v) } },
        y: { grid: { display: false }, ticks: { font: { size: 10.5 } } },
      },
    },
  });
}

/** Build the "Smart Insights" list — every line is a real computation, not a placeholder. */
function renderSmartInsights() {
  const list = document.getElementById('dashInsightList');
  if (!list) return;

  if (!EE_EXPENSE_POOL.length) {
    list.innerHTML = '<li class="insight muted">Submit your first expense to start seeing insights here.</li>';
    return;
  }

  const insights = [];

  // Top category
  const category = computeCategoryBreakdown();
  if (category.labels.length) {
    insights.push({
      cls: 'good', icon: '★',
      html: 'Top category this month is <strong>' + category.labels[0] + '</strong> at <strong>' +
        formatINR(category.values[0]) + '</strong>.',
    });
  }

  // Outstanding vs threshold
  const { outstanding, threshold, exceeded } = (window.checkOutstandingAlert ? { outstanding: computeOutstandingAmount(), threshold: getOutstandingThreshold(), exceeded: computeOutstandingAmount() > getOutstandingThreshold() } : { outstanding: 0, threshold: 0, exceeded: false });
  insights.push({
    cls: exceeded ? 'bad' : 'good',
    icon: exceeded ? '⚠' : '✓',
    html: exceeded
      ? 'Outstanding non-dispatched expenses (<strong>' + formatINR(outstanding) + '</strong>) exceed your ' +
        (EE_SESSION.title || 'role') + ' limit of <strong>' + formatINR(threshold) + '</strong> — consider a Dispatch.'
      : 'Outstanding non-dispatched expenses (<strong>' + formatINR(outstanding) + '</strong>) are within your ' +
        (EE_SESSION.title || 'role') + ' limit of <strong>' + formatINR(threshold) + '</strong>.',
  });

  // Attachment compliance
  const withAtt = EE_EXPENSE_POOL.filter(it => it.attachment && it.attachment.thumbSrc).length;
  const pct = Math.round((withAtt / EE_EXPENSE_POOL.length) * 100);
  insights.push({
    cls: pct >= 60 ? 'good' : 'warn', icon: '📎',
    html: '<strong>' + pct + '%</strong> of your entries (' + withAtt + ' of ' + EE_EXPENSE_POOL.length +
      ') have a bill or receipt attached.',
  });

  // Declaration ratio (no-bill claims as a share of total)
  const declTotal = EE_EXPENSE_POOL.filter(it => it.source === 'declaration').reduce((s, it) => s + it.amount, 0);
  const grandTotal = EE_EXPENSE_POOL.reduce((s, it) => s + it.amount, 0);
  const declPct = grandTotal ? Math.round((declTotal / grandTotal) * 100) : 0;
  insights.push({
    cls: declPct <= 30 ? 'good' : 'warn', icon: '≡',
    html: 'Declaration (no-bill) claims are <strong>' + declPct + '%</strong> of total spend — policy cap is 30%.',
  });

  // Bulk reports pending
  const pendingBatches = EE_BULK_REPORTS.filter(b => b.status === 'pending').length;
  if (pendingBatches > 0) {
    insights.push({
      cls: 'warn', icon: '⏳',
      html: '<strong>' + pendingBatches + '</strong> Bulk Report' + (pendingBatches > 1 ? 's are' : ' is') +
        ' still awaiting Manager/HOD approval.',
    });
  }

  // Undispatched approved reports
  const undispatched = EE_BULK_REPORTS.filter(b => b.status === 'approved' && !b.dispatched).length;
  if (undispatched > 0) {
    insights.push({
      cls: 'warn', icon: '📮',
      html: '<strong>' + undispatched + '</strong> approved report' + (undispatched > 1 ? 's are' : ' is') +
        ' approved but not yet dispatched.',
    });
  }

  list.innerHTML = insights.map(i =>
    '<li class="insight ' + i.cls + '"><span class="ic">' + i.icon + '</span><span>' + i.html + '</span></li>'
  ).join('');
}

function refreshDashboardAnalytics() {
  renderSmartInsights();
  renderDashboardCharts();
}
window.refreshDashboardAnalytics = refreshDashboardAnalytics;


/* ============================================================
   22d. DISPATCH — LOG COURIER OF PHYSICAL BILLS & REPORTS
   ============================================================ */

function initDispatch() {
  const reportSelect       = document.getElementById('dispatchReportSelect');
  const courierDate        = document.getElementById('dispatchCourierDate');
  const courierProvider    = document.getElementById('dispatchCourierProvider');
  const docketNo           = document.getElementById('dispatchDocketNo');
  const docketDate         = document.getElementById('dispatchDocketDate');
  const senderName         = document.getElementById('dispatchSenderName');
  const senderLocation     = document.getElementById('dispatchSenderLocation');
  const receiverName       = document.getElementById('dispatchReceiverName');
  const receiverLocation   = document.getElementById('dispatchReceiverLocation');
  const submitBtn          = document.getElementById('dispatchSubmitBtn');
  const actionHint         = document.getElementById('dispatchActionHint');
  const logBody            = document.getElementById('dispatchLogBody');
  const outstandingPanel   = document.getElementById('dispatchOutstandingPanel');
  const outstandingBody    = document.getElementById('dispatchOutstandingBody');

  if (!reportSelect || !submitBtn) return; // view not present on this page

  // Prefill the sender with whoever is logged in, so it's one less field to type.
  if (senderName && !senderName.value) senderName.value = EE_SESSION.name || '';

  function refreshReportOptions() {
    const current = reportSelect.value;
    const options = EE_BULK_REPORTS
      .filter(b => !b.dispatched)
      .map(b => '<option value="' + b.id + '">' + b.no + ' — ' + b.itemsSnapshot.length + ' item(s), ' +
        formatINR(b.total) + ' (' + b.status + ')</option>')
      .join('');
    reportSelect.innerHTML = '<option value="">— Select a Bulk Report to dispatch —</option>' + options;
    if (current && EE_BULK_REPORTS.some(b => b.id === current && !b.dispatched)) reportSelect.value = current;
  }

  function refreshOutstandingPanel() {
    const { outstanding, threshold, exceeded } = checkOutstandingAlert();
    if (!outstandingPanel || !outstandingBody) return;
    if (exceeded) {
      outstandingPanel.style.display = '';
      outstandingBody.innerHTML =
        '<div class="ee-alert-banner" style="margin:0;"><span class="icon">⚠</span><span>' +
        'Outstanding non-dispatched / non-receipted expenses total <strong>' + formatINR(outstanding) +
        '</strong> — over your ' + (EE_SESSION.title || 'role') + ' limit of <strong>' + formatINR(threshold) +
        '</strong>. Dispatch or settle pending bills to clear this alert.</span></div>';
    } else {
      outstandingPanel.style.display = 'none';
      outstandingBody.innerHTML = '';
    }
  }

  function updateHint() {
    const ready = reportSelect.value && courierDate.value && courierProvider.value &&
      docketNo.value.trim() && docketDate.value &&
      senderName.value.trim() && senderLocation.value && receiverName.value.trim() && receiverLocation.value.trim();
    submitBtn.disabled = !ready;
    actionHint.textContent = ready
      ? 'Ready — click Submit & Notify to log this dispatch.'
      : 'Select a report and fill in the courier, sender &amp; receiver details to continue.';
    actionHint.classList.toggle('ok', !!ready);
  }

  [reportSelect, courierDate, courierProvider, docketNo, docketDate, senderName, senderLocation, receiverName, receiverLocation].forEach(el => {
    el.addEventListener('input', updateHint);
    el.addEventListener('change', updateHint);
  });

  function renderLog() {
    if (!EE_DISPATCHES.length) {
      logBody.innerHTML = '<tr id="dispatchLogEmptyRow"><td colspan="9" style="text-align:center;color:var(--slate);padding:18px;">No dispatches logged yet.</td></tr>';
      return;
    }
    logBody.innerHTML = EE_DISPATCHES.slice().reverse().map(d =>
      '<tr><td>' + d.no + '</td><td>' + d.reportNo + '</td><td>' +
      new Date(d.courierDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + '</td><td>' +
      d.courierProvider + '</td><td class="mono">' + d.docketNo + '</td><td>' +
      new Date(d.docketDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + '</td><td>' +
      '<div>' + d.senderName + '</div><div class="hint">' + d.senderLocation + '</div></td><td>' +
      '<div>' + d.receiverName + '</div><div class="hint">' + d.receiverLocation + '</div></td><td>' +
      '<span class="pill green">' + d.levels.join(' → ') + '</span></td></tr>'
    ).join('');
  }

  submitBtn.addEventListener('click', () => {
    const batch = EE_BULK_REPORTS.find(b => b.id === reportSelect.value);
    if (!batch || !courierDate.value || !courierProvider.value || !docketNo.value.trim() || !docketDate.value ||
        !senderName.value.trim() || !senderLocation.value || !receiverName.value.trim() || !receiverLocation.value.trim()) {
      showToast('Please complete every field, including sender & receiver, before submitting.', 'error');
      return;
    }

    const dispatchNo = genVoucherNo(resolvePrefix('dispatch'));
    const levels = ['User', 'Manager', 'HOD', 'Finance', 'Admin'];
    const record = {
      id: 'dsp-' + Date.now(), no: dispatchNo, reportNo: batch.no,
      courierDate: courierDate.value, courierProvider: courierProvider.value,
      docketNo: docketNo.value.trim(), docketDate: docketDate.value,
      senderName: senderName.value.trim(), senderLocation: senderLocation.value,
      receiverName: receiverName.value.trim(), receiverLocation: receiverLocation.value.trim(),
      levels, submittedAt: new Date(),
    };
    EE_DISPATCHES.push(record);
    batch.dispatched = true;
    batch.dispatchInfo = record;

    EE_NOTIFICATIONS.push({
      id: 'notif-' + Date.now(),
      message: dispatchNo + ' — ' + batch.no + ' dispatched via ' + record.courierProvider +
        ' (Docket ' + record.docketNo + ') from ' + record.senderName + ' (' + record.senderLocation +
        ') to ' + record.receiverName + ' (' + record.receiverLocation + ').',
      when: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      levels,
    });

    renderLog();
    refreshReportOptions();
    refreshOutstandingPanel();
    renderNotifications();
    checkOutstandingAlert();

    reportSelect.value = '';
    docketNo.value = '';
    receiverName.value = '';
    updateHint();

    showToast(dispatchNo + ' submitted — User, Manager, HOD, Finance & Admin notified.', 'success', 5000);
  });

  refreshReportOptions();
  refreshOutstandingPanel();
  renderLog();
  updateHint();

  // Let Bulk Report refresh the dropdown the moment a new batch is submitted/approved.
  window.refreshDispatchReports = () => { refreshReportOptions(); refreshOutstandingPanel(); };
}


function initBulkReport() {
  const itemsBody   = document.getElementById('brItemsBody');
  if (!itemsBody) return; // view not present on this page

  const fromDateEl  = document.getElementById('brFromDate');
  const toDateEl     = document.getElementById('brToDate');
  const projectEl    = document.getElementById('brProjectFilter');
  const applyBtn      = document.getElementById('brApplyFilterBtn');
  const selectAllBtn  = document.getElementById('brSelectAllBtn');
  const clearSelBtn   = document.getElementById('brClearSelBtn');
  const selCountEl    = document.getElementById('brSelCount');
  const selTotalEl    = document.getElementById('brSelTotal');
  const sortOrderEl   = document.getElementById('brSortOrder');
  const submitBtn      = document.getElementById('brSubmitBtn');
  const actionHint     = document.getElementById('brActionHint');
  const previewWrap    = document.getElementById('brPreviewWrap');
  const printBtn        = document.getElementById('brPrintBtn');
  const downloadBtn     = document.getElementById('brDownloadBtn');
  const batchesBody     = document.getElementById('brBatchesBody');
  const mgrBulkBody     = document.getElementById('mgrBulkReportsBody');

  // ---- Shared pool of the employee's own not-yet-batched expense entries.
  // Submit Expense and Declaration Voucher push new entries into this same
  // array on submission, so they show up here automatically. Advance
  // Adjustment entries are settlements against a prior advance, not
  // reimbursable expenses, so they're excluded from Bulk Report entirely. ----
  const SOURCE_ITEMS = EE_EXPENSE_POOL.filter(it => it.head !== 'Advance Adjustment');

  const checkedIds = new Set();
  const bulkReports = EE_BULK_REPORTS; // shared globally so Dispatch can read submitted batches

  function fmt(n) { return formatINR(n); }

  function statusPill(status) {
    if (status === 'submitted') return '<span class="pill amber">Submitted — Pending Approval</span>';
    if (status === 'approved')  return '<span class="pill green">Approved</span>';
    return '<span class="pill slate">Not Submitted</span>';
  }

  function batchPill(status) {
    if (status === 'approved') return '<span class="pill green">Approved</span>';
    if (status === 'rejected') return '<span class="pill red">Rejected — Returned to Draft</span>';
    return '<span class="pill amber">Pending Approval</span>';
  }

  function fmtDateShort(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  // ---- Render the selectable source table (respects current filter) ----
  function renderItemsTable() {
    const from = fromDateEl.value, to = toDateEl.value, proj = projectEl.value;
    itemsBody.innerHTML = SOURCE_ITEMS.map(it => {
      const inRange   = (!from || it.date >= from) && (!to || it.date <= to);
      const inProject = !proj || it.project === proj;
      if (!inRange || !inProject) return '';
      const locked   = it.status !== 'draft';
      const checked  = checkedIds.has(it.id) && !locked;
      if (locked) checkedIds.delete(it.id);
      return (
        '<tr data-id="' + it.id + '"' + (locked ? ' style="opacity:.55;"' : '') + '>' +
        '<td><input type="checkbox" class="br-chk" ' + (checked ? 'checked' : '') + (locked ? ' disabled' : '') + '></td>' +
        '<td>' + it.no + '</td>' +
        '<td>' + fmtDateShort(it.date) + '</td>' +
        '<td>' + it.project + '</td>' +
        '<td>' + it.head + '</td>' +
        '<td class="amt">' + fmt(it.amount) + '</td>' +
        '<td>' + statusPill(it.status) + '</td>' +
        '</tr>'
      );
    }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--slate);padding:18px;">No entries match this filter.</td></tr>';

    itemsBody.querySelectorAll('.br-chk').forEach(chk => {
      chk.addEventListener('change', () => {
        const id = chk.closest('tr').dataset.id;
        if (chk.checked) checkedIds.add(id); else checkedIds.delete(id);
        recalcSelection();
      });
    });
    recalcSelection();
  }

  function visibleRows() {
    return Array.from(itemsBody.querySelectorAll('tr[data-id]'));
  }

  function recalcSelection() {
    const selected = SOURCE_ITEMS.filter(it => checkedIds.has(it.id) && it.status === 'draft');
    const total = selected.reduce((s, it) => s + it.amount, 0);
    selCountEl.textContent = selected.length;
    selTotalEl.textContent = fmt(total);
    submitBtn.disabled = selected.length === 0;
    actionHint.textContent = selected.length
      ? selected.length + ' item(s) selected, totalling ' + fmt(total) + ' — ready to submit.'
      : 'Select at least one expense entry to continue.';
    actionHint.classList.toggle('ok', selected.length > 0);
  }

  // ---- Filters ----
  applyBtn.addEventListener('click', renderItemsTable);
  projectEl.addEventListener('change', renderItemsTable);

  selectAllBtn.addEventListener('click', () => {
    visibleRows().forEach(row => {
      const chk = row.querySelector('.br-chk');
      if (chk && !chk.disabled) { chk.checked = true; checkedIds.add(row.dataset.id); }
    });
    recalcSelection();
    showToast('All filtered entries selected.', 'info');
  });

  clearSelBtn.addEventListener('click', () => {
    checkedIds.clear();
    renderItemsTable();
    showToast('Selection cleared.', 'info');
  });

  // ---- Build the merged preview sheet ----
  function buildPreview(batch, sortLabel) {
    document.getElementById('brVoucherNo').textContent = batch.no;
    document.getElementById('brItemCount').textContent = batch.itemsSnapshot.length;
    document.getElementById('brMergeOrder').textContent = sortLabel;

    const dateStr = batch.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = batch.date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('brGenDate').textContent = dateStr;
    document.getElementById('brGenLine').textContent = 'Generated by Expense Easy on ' + dateStr + ', ' + timeStr;
    document.getElementById('brEmpLine').innerHTML = 'R. Sharma — ' + dateStr + '<div class="status ok">Submitted</div>';
    document.getElementById('brMgrLine').innerHTML = 'Awaiting Manager / HOD<div class="status pending">Pending</div>';

    const body = document.getElementById('brMergedItemsBody');
    body.innerHTML = batch.itemsSnapshot.map((it, i) =>
      '<tr><td>' + (i + 1) + '</td><td>' + it.no + '</td><td>' + fmtDateShort(it.date) + '</td><td>' +
      it.project + '</td><td>' + it.head + '</td><td class="amt">' + fmt(it.amount) + '</td></tr>'
    ).join('');

    document.getElementById('brFootTotal').textContent = fmt(batch.total);
    document.getElementById('brTotalAmt').textContent = fmt(batch.total);

    // Merge every bill/receipt image directly into the report, not just a reference.
    const attSection = document.getElementById('brAttachmentsSection');
    const attGrid    = document.getElementById('brAttachmentsGrid');
    if (attSection && attGrid) {
      const { html: attHtml, count, total } = renderAttachmentsGridHTML(batch.itemsSnapshot);
      if (count > 0) {
        attGrid.innerHTML = attHtml;
        const head = attSection.querySelector('.v-attachments-head');
        if (head) head.textContent = 'Attached Bills, Vouchers & Receipts (' + count + ' of ' + total + ' items)';
        attSection.style.display = '';
      } else {
        attGrid.innerHTML = '';
        attSection.style.display = 'none';
      }
    }
  }

  // ---- Submit ----
  submitBtn.addEventListener('click', () => {
    const selected = SOURCE_ITEMS.filter(it => checkedIds.has(it.id) && it.status === 'draft');
    if (!selected.length) {
      showToast('Select at least one expense entry before submitting.', 'error');
      return;
    }
    const sortMode  = sortOrderEl.value;
    const sortLabel = sortMode === 'serial' ? 'By Serial No.' : 'By Date';
    const ordered = selected.slice().sort((a, b) =>
      sortMode === 'serial' ? a.no.localeCompare(b.no) : new Date(a.date) - new Date(b.date)
    );
    const total = ordered.reduce((s, it) => s + it.amount, 0);
    const batch = {
      id: 'batch-' + Date.now(),
      no: genVoucherNo(resolvePrefix('bulkreport')),
      itemIds: ordered.map(it => it.id),
      itemsSnapshot: ordered.map(it => ({ ...it })),
      total,
      date: new Date(),
      status: 'pending',
      reviewed: false,
      mergeOrder: sortLabel,
    };
    bulkReports.push(batch);
    ordered.forEach(it => { it.status = 'submitted'; });
    checkedIds.clear();

    buildPreview(batch, sortLabel);
    renderItemsTable();
    renderBatchTables();
    previewWrap.classList.add('show');
    printBtn.disabled = false;
    downloadBtn.disabled = false;
    incrementCounter('badge-approvals');
    const badgeEl = document.getElementById('badge-approvals');
    if (badgeEl) badgeEl.style.display = '';
    if (window.refreshDispatchReports) window.refreshDispatchReports();
    if (window.checkOutstandingAlert) window.checkOutstandingAlert();
    if (window.refreshDashboardAnalytics) window.refreshDashboardAnalytics();

    showToast(batch.no + ' submitted for approval — ' + ordered.length + ' item(s) merged, ' + fmt(total) + '.', 'success', 5000);
    previewWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // ---- Print ----
  printBtn.addEventListener('click', () => {
    if (printBtn.disabled) return;
    const sheet = document.getElementById('bulkReportSheet');
    if (!sheet) return;
    sheet.classList.add('print-area-active');
    window.print();
    setTimeout(() => sheet.classList.remove('print-area-active'), 500);
    showToast('Printing merged report…', 'info');
  });

  // ---- Download as PDF (shared jsPDF/html2canvas helper) ----
  downloadBtn.addEventListener('click', async () => {
    if (downloadBtn.disabled) return;
    const sheet = document.getElementById('bulkReportSheet');
    if (!sheet) return;

    const no = document.getElementById('brVoucherNo').textContent.replace(/[^A-Z0-9\-\/]/gi, '-');
    const filename = (no || 'Bulk-Report') + '.pdf';

    downloadBtn.disabled = true;
    const originalLabel = downloadBtn.textContent;
    downloadBtn.textContent = 'Preparing PDF…';
    showToast('Generating PDF…', 'info');

    try {
      await downloadElementAsPDF(sheet, filename);
      showToast('Merged report downloaded as PDF.', 'success');
    } catch (err) {
      showToast('Could not generate PDF — check your internet connection and try again.', 'error', 5000);
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.textContent = originalLabel;
    }
  });

  // ---- My Submitted Batches (employee) + Bulk Reports Awaiting Approval (manager) ----
  /** Build a standalone (detached) printable sheet for a batch — used by
   *  both the Review modal and the row-level Download button, independent
   *  of whichever batch is currently shown in the employee's own preview. */
  function buildBatchSheetElement(batch) {
    const el = document.createElement('div');
    el.className = 'v-sheet';
    const dateStr = batch.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = batch.date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const rowsHtml = batch.itemsSnapshot.map((it, i) =>
      '<tr><td>' + (i + 1) + '</td><td>' + it.no + '</td><td>' +
      new Date(it.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + '</td><td>' +
      it.project + '</td><td>' + it.head + '</td><td class="amt">' + fmt(it.amount) + '</td></tr>'
    ).join('');

    const { html: attHtml, count: attCount, total: attTotal } = renderAttachmentsGridHTML(batch.itemsSnapshot);
    const attachmentsSectionHtml = attCount > 0
      ? '<div class="v-attachments"><div class="v-attachments-head">Attached Bills, Vouchers &amp; Receipts (' +
        attCount + ' of ' + attTotal + ' items)</div><div class="v-attachments-grid">' + attHtml + '</div></div>'
      : '<div class="v-attach-none" style="margin-bottom:14px;">No bill images were attached to any item in this report.</div>';

    // Manager/HOD stage reflects the batch's real status; Finance stays
    // "Pending" until settled there, same as the live on-screen sheet.
    let mgrLine = 'Awaiting Manager / HOD<div class="status pending">Pending</div>';
    let finLine = 'Finance Controller<div class="status pending">Pending</div>';
    if (batch.status === 'approved') {
      mgrLine = 'Approved<div class="status ok">Approved</div>';
    } else if (batch.status === 'rejected') {
      mgrLine = 'Rejected<div class="status" style="background:#FCEBEA;color:#C54444;">Rejected</div>';
      finLine = 'Finance Controller<div class="status" style="background:var(--paper-dim);color:var(--slate);">N/A</div>';
    }

    el.innerHTML =
      '<div class="v-head">' +
        '<div><div class="org">Shield Infra Solutions <span style="color:var(--gold);">Pvt. Ltd.</span></div>' +
        '<div class="org-sub">Pune · Mumbai · Bengaluru · Delhi NCR</div></div>' +
        '<div class="doc-type"><div class="label">Batch / Report No.</div><div class="num">' + batch.no + '</div></div>' +
      '</div>' +
      '<div class="v-title">Bulk Expense Report — Combined Submission</div>' +
      '<div class="v-grid">' +
        '<div class="row"><div class="k">Employee Name</div><div class="v">R. Sharma</div></div>' +
        '<div class="row"><div class="k">Employee Code</div><div class="v">EMP-1042</div></div>' +
        '<div class="row"><div class="k">Items in Report</div><div class="v">' + batch.itemsSnapshot.length + '</div></div>' +
        '<div class="row"><div class="k">Date Generated</div><div class="v">' + dateStr + '</div></div>' +
        '<div class="row full"><div class="k">Merge Order</div><div class="v">' + (batch.mergeOrder || 'By Date') + '</div></div>' +
      '</div>' +
      '<table class="v-items"><thead><tr><th>#</th><th>Voucher No.</th><th>Date</th><th>Project</th><th>Head</th><th class="amt">Amount</th></tr></thead>' +
      '<tbody>' + rowsHtml + '</tbody>' +
      '<tfoot><tr><td colspan="5">Total Attachments / Vouchers Merged</td><td class="amt">' + fmt(batch.total) + '</td></tr></tfoot></table>' +
      '<div class="amount-box"><div class="label">Total Amount in this Report</div><div class="value">' + fmt(batch.total) + '</div></div>' +
      attachmentsSectionHtml +
      '<div class="v-declaration-text">' +
        'This report combines the vouchers and supporting attachments listed above, merged in the order shown, ' +
        'into a single submission for approval. Each underlying voucher retains its own reference number for audit.' +
      '</div>' +
      '<div class="approval-grid">' +
        '<div class="cell"><div class="stage-label">Employee Submission</div>' +
        '<div class="sign-line">R. Sharma — ' + dateStr + '<div class="status ok">Submitted</div></div></div>' +
        '<div class="cell"><div class="stage-label">Manager / HOD Approval</div>' +
        '<div class="sign-line">' + mgrLine + '</div></div>' +
        '<div class="cell"><div class="stage-label">Finance Approval</div>' +
        '<div class="sign-line">' + finLine + '</div></div>' +
      '</div>' +
      '<div class="v-foot">' +
        '<span>Generated by Expense Easy on ' + dateStr + ', ' + timeStr + '</span>' +
        '<span>This is a system-generated bulk report and is valid without physical signature once digitally approved.</span>' +
      '</div>';

    return el;
  }

  const reviewModal   = document.getElementById('modal-review-bulk');
  const reviewTitle   = document.getElementById('reviewBulkTitle');
  const reviewBody    = document.getElementById('reviewBulkBody');
  const reviewMarkBtn = document.getElementById('reviewBulkMarkBtn');
  let reviewingBatchId = null;

  /** Add an approved batch to Finance's queue for final sign-off. */
  function pushBulkReportToFinance(batch) {
    const finBody = document.getElementById('finApprovalsBody');
    if (!finBody) return;
    const emptyRow = finBody.querySelector('tr:only-child td[colspan]');
    if (emptyRow) finBody.innerHTML = '';

    const tr = document.createElement('tr');
    tr.dataset.voucher = batch.no;
    tr.dataset.gl = '—';
    tr.dataset.cc = 'Bulk';
    tr.dataset.amount = batch.total;
    tr.innerHTML =
      '<td><input type="checkbox"></td>' +
      '<td>R. Sharma</td><td>Bulk Report — ' + batch.itemsSnapshot.length + ' item(s)</td>' +
      '<td>' + batch.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + '</td>' +
      '<td class="amt">' + fmt(batch.total) + '</td>' +
      '<td class="mono">— / Bulk</td>' +
      '<td><div class="stage-track"><div class="dot done"></div>Employee<div class="dot done"></div>Manager<div class="dot current"></div>Finance</div></td>' +
      '<td class="approve-row-actions">' +
        '<button class="btn sm gold" data-action="settle" data-badge="badge-financeapproval">Approve &amp; Settle</button> ' +
        '<button class="btn sm danger" data-action="reject" data-badge="badge-financeapproval">Reject</button>' +
      '</td>';
    finBody.appendChild(tr);

    incrementCounter('badge-financeapproval');
    const badgeEl = document.getElementById('badge-financeapproval');
    if (badgeEl) badgeEl.style.display = '';
    const finPendingEl = document.getElementById('finPendingCount');
    if (finPendingEl) finPendingEl.textContent = parseInt(finPendingEl.textContent || '0', 10) + 1;
  }

  function renderBatchTables() {
    if (!bulkReports.length) {
      batchesBody.innerHTML = '<tr id="brBatchesEmptyRow"><td colspan="5" style="text-align:center;color:var(--slate);padding:18px;">No batches submitted yet — select entries above and submit your first report.</td></tr>';
      mgrBulkBody.innerHTML = '<tr id="mgrBulkEmptyRow"><td colspan="6" style="text-align:center;color:var(--slate);padding:18px;">No bulk reports submitted yet.</td></tr>';
      return;
    }

    batchesBody.innerHTML = bulkReports.slice().reverse().map(b =>
      '<tr><td>' + b.no + '</td><td>' + b.itemsSnapshot.length + '</td><td class="amt">' + fmt(b.total) + '</td><td>' +
      b.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + '</td><td>' + batchPill(b.status) + '</td></tr>'
    ).join('');

    mgrBulkBody.innerHTML = bulkReports.slice().reverse().map(b => {
      let actions;
      if (b.status === 'pending') {
        const approveAttrs = b.reviewed ? '' : ' disabled title="Review the report before approving"';
        actions =
          '<button class="btn sm ghost" data-batch-action="review" data-batch-id="' + b.id + '">Review</button> ' +
          '<button class="btn sm ghost" data-batch-action="download" data-batch-id="' + b.id + '">Download</button> ' +
          '<button class="btn sm gold" data-batch-action="approve" data-batch-id="' + b.id + '"' + approveAttrs + '>Approve</button> ' +
          '<button class="btn sm danger" data-batch-action="reject" data-batch-id="' + b.id + '">Reject</button>' +
          (b.reviewed ? '' : '<div class="hint" style="margin-top:4px;">Not yet reviewed</div>');
      } else {
        actions =
          '<button class="btn sm ghost" data-batch-action="download" data-batch-id="' + b.id + '">Download</button> ' +
          batchPill(b.status);
      }
      return '<tr><td>' + b.no + '</td><td>R. Sharma</td><td>' + b.itemsSnapshot.length + '</td><td class="amt">' +
        fmt(b.total) + '</td><td>' + b.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) +
        '</td><td class="approve-row-actions">' + actions + '</td></tr>';
    }).join('');

    // Row actions are wired once via delegation below, so no re-binding needed here.
  }

  // ---- Delegated click handler for Review / Download / Approve / Reject.
  // Attached once (not re-bound on every render) so it can never go stale. ----
  if (mgrBulkBody) {
    mgrBulkBody.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-batch-action]');
      if (!btn || !mgrBulkBody.contains(btn)) return;

      const batch = bulkReports.find(b => b.id === btn.dataset.batchId);
      if (!batch) return;
      const action = btn.dataset.batchAction;

      try {
        if (action === 'review') {
          reviewingBatchId = batch.id;
          reviewTitle.textContent = 'Review ' + batch.no + ' — ' + batch.itemsSnapshot.length + ' item(s)';
          reviewBody.innerHTML = '';
          reviewBody.appendChild(buildBatchSheetElement(batch));
          reviewMarkBtn.style.display = batch.reviewed ? 'none' : '';
          reviewModal.classList.add('active');
          return;
        }

        if (action === 'download') {
          const sheet = buildBatchSheetElement(batch);
          sheet.style.position = 'fixed';
          sheet.style.left = '-9999px';
          sheet.style.top = '0';
          sheet.style.width = '760px';
          document.body.appendChild(sheet);
          btn.disabled = true;
          const originalLabel = btn.textContent;
          btn.textContent = 'Preparing…';
          showToast('Generating PDF…', 'info');
          try {
            await downloadElementAsPDF(sheet, batch.no.replace(/[^A-Z0-9\-\/]/gi, '-') + '.pdf');
            showToast(batch.no + ' downloaded as PDF.', 'success');
          } catch (err) {
            console.error('Bulk report PDF download failed:', err);
            showToast('Could not generate PDF — check your internet connection and try again.', 'error', 5000);
          } finally {
            document.body.removeChild(sheet);
            btn.disabled = false;
            btn.textContent = originalLabel;
          }
          return;
        }

        if (action === 'approve') {
          if (!batch.reviewed) {
            showToast('Please review this report before approving it.', 'error');
            return;
          }
          batch.status = 'approved';
          batch.itemsSnapshot.forEach(snap => {
            const src = SOURCE_ITEMS.find(it => it.id === snap.id);
            if (src) src.status = 'approved';
          });
          decrementBadge('badge-approvals');
          pushBulkReportToFinance(batch);
          if (window.refreshDispatchReports) window.refreshDispatchReports();
          if (window.checkOutstandingAlert) window.checkOutstandingAlert();
          if (window.refreshDashboardAnalytics) window.refreshDashboardAnalytics();
          showToast(batch.no + ' approved — all ' + batch.itemsSnapshot.length + ' item(s) marked Approved and sent to Finance.', 'success', 5000);
          renderItemsTable();
          renderBatchTables();
          return;
        }

        if (action === 'reject') {
          const reason = window.prompt('Enter rejection reason (optional):') || '';
          batch.status = 'rejected';
          batch.itemsSnapshot.forEach(snap => {
            const src = SOURCE_ITEMS.find(it => it.id === snap.id);
            if (src) src.status = 'draft'; // returned so the employee can fix and resubmit
          });
          decrementBadge('badge-approvals');
          if (window.checkOutstandingAlert) window.checkOutstandingAlert();
          if (window.refreshDashboardAnalytics) window.refreshDashboardAnalytics();
          showToast(batch.no + ' rejected' + (reason ? ' — ' + reason : '') + '. Items returned to Draft for resubmission.', 'error', 5000);
          renderItemsTable();
          renderBatchTables();
        }
      } catch (err) {
        console.error('Bulk report action "' + action + '" failed:', err);
        showToast('Something went wrong — please try again.', 'error');
      }
    });
  }

  if (reviewMarkBtn) {
    reviewMarkBtn.addEventListener('click', () => {
      try {
        const batch = bulkReports.find(b => b.id === reviewingBatchId);
        if (batch) {
          batch.reviewed = true;
          renderBatchTables();
          showToast(batch.no + ' marked as reviewed — you can now approve it.', 'success');
        }
        if (window.closeAllModals) window.closeAllModals();
        else if (reviewModal) reviewModal.classList.remove('active');
      } catch (err) {
        console.error('Mark as reviewed failed:', err);
        showToast('Something went wrong — please try again.', 'error');
      }
    });
  }

  renderItemsTable();
  renderBatchTables();

  // Let Submit Expense / Declaration Voucher refresh this table the moment
  // they push a newly-submitted entry into the shared EE_EXPENSE_POOL.
  window.refreshBulkReportItems = renderItemsTable;
}


/* ============================================================
   23. SUPER ADMIN — PLATFORM CONTROLS
   ============================================================ */

function initSuperAdmin() {
  const saPortal = document.getElementById('portal-superadmin');
  if (!saPortal) return;

  // Toggle switches — show toast on change
  $$('.switch input', saPortal).forEach(toggle => {
    toggle.addEventListener('change', () => {
      const label = toggle.closest('.toggle-row')?.querySelector('span, label, strong');
      const name  = label ? label.textContent.trim() : 'Setting';
      showToast(`${name} ${toggle.checked ? 'enabled' : 'disabled'}.`, 'info');
    });
  });

  // "Open Company Admin" cross-portal link in modals
  $$('[data-portal-goto="companyadmin"]', saPortal).forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals();
      gotoPortal('companyadmin');
    });
  });
}


/* ============================================================
   24. SEARCH / FILTER (TABLES)
   ============================================================ */

/**
 * Attach a live search filter to a table inside a given view.
 * @param {string} searchInputId
 * @param {string} tableBodySelector  CSS selector for <tbody>
 */
function attachTableSearch(searchInputId, tableBodySelector) {
  const input = document.getElementById(searchInputId);
  const tbody = $(tableBodySelector);
  if (!input || !tbody) return;

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase().trim();
    $$('tr', tbody).forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
    });
  });
}

function initTableSearch() {
  // Company Admin — employee table
  attachTableSearch('empSearch',  '#emp-table-view tbody');
  // Super Admin — companies table (if present)
  attachTableSearch('coSearch',   '#sa-companies-table tbody');
}

/**
 * Generic .search input on any panel — filter its nearest table rows.
 */
function initGenericSearch() {
  $$('.search').forEach(input => {
    input.addEventListener('input', () => {
      const query = input.value.toLowerCase().trim();
      const panel = input.closest('.panel');
      if (!panel) return;
      const tbody = $('tbody', panel);
      if (!tbody) return;
      $$('tr', tbody).forEach(row => {
        row.style.display = !query || row.textContent.toLowerCase().includes(query) ? '' : 'none';
      });
    });
  });
}


/* ============================================================
   25. KEYBOARD SHORTCUTS
   ============================================================ */

function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    // Only when logged in and no input is focused
    if (!document.body.classList.contains('logged-in')) return;
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    switch (e.key) {
      case 'e':
      case 'E':
        // Jump to Submit Expense
        if (EE_SESSION.role === 'employee') {
          gotoPortal('employee');
          const submitNav = $('[data-view="submit"]', document.getElementById('portal-employee'));
          if (submitNav) submitNav.click();
        }
        break;

      case 'a':
      case 'A':
        // Jump to Approvals
        if (EE_SESSION.role === 'employee') {
          gotoPortal('employee');
          const approvalNav = $('[data-view="approvals"]', document.getElementById('portal-employee'));
          if (approvalNav) approvalNav.click();
        }
        break;

      case '/':
        // Focus first visible search input
        e.preventDefault();
        const searchEl = $('input.search:not([style*="display:none"])');
        if (searchEl) searchEl.focus();
        break;
    }
  });
}


/* ============================================================
   26. INITIALISATION
   ============================================================ */

/**
 * Main entry point — called when the DOM is fully ready.
 */
function init() {
  // Core shell
  initPortalSwitcher();
  initSidebarNav();
  initModals();

  // Auth
  initLandingCard();
  initLogin();

  // Employee portal features
  initAttachTabs();
  initAttachments();
  initGeoLocate();
  initSubmitExpense();
  initRateBasedHeads();
  initDeclarationVoucher();
  initLedger();
  initTourRequest();
  initDisputeRequest();
  initBulkReport();
  initDispatch();

  // Approval workflows
  initManagerApprovals();
  initFinanceApprovals();
  initApprovalLimits();
  initApprovalMapping();

  // Company Admin
  initCompanySwitcher();
  initVoucherPrefixSettings();
  initReportExports();

  // Super Admin
  initSuperAdmin();

  // Search / Filter
  initTableSearch();
  initGenericSearch();

  // Keyboard shortcuts
  initKeyboardShortcuts();

  // Initial temp voucher placeholders (before login)
  const tempExpEl  = document.getElementById('tempVoucherNo');
  const tempDeclEl = document.getElementById('tempDeclVoucherNo');
  if (tempExpEl)  tempExpEl.textContent  = genVoucherNo(EE_CONFIG.VOUCHER_PREFIX.expense,     true);
  if (tempDeclEl) tempDeclEl.textContent = genVoucherNo(EE_CONFIG.VOUCHER_PREFIX.declaration, true);
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* ---------- <script id="ee-canvas-js"> ---------- */
(function(){
  var C=document.getElementById('ee-canvas-bg');
  if(!C)return;
  var X=C.getContext('2d'),W,H,particles=[],appParticles=[],animId,flowOff=0,wmA=0,wmD=1;
  var SYMS=['\u20B9','\u2713','\u25B8','\u25C6','\u25B2','\u2261','\u2295','\u03A3','%','\u221E'];
  var COLS=['184,134,11','47,107,79','27,36,48','92,107,122'];
  function resize(){W=C.width=window.innerWidth;H=C.height=window.innerHeight;}
  function P(calm){
    this.reset=function(init){
      this.x=Math.random()*W; this.y=init?Math.random()*H:H+20;
      this.vx=(Math.random()-.5)*(calm?.18:.4); this.vy=-(calm?(0.12+Math.random()*.28):(0.3+Math.random()*.7));
      this.sym=SYMS[Math.floor(Math.random()*SYMS.length)];
      this.col=COLS[Math.floor(Math.random()*COLS.length)];
      this.sz=calm?(9+Math.random()*10):(11+Math.random()*14); this.op=0;
      this.maxOp=calm?(0.035+Math.random()*.05):(0.08+Math.random()*.14);
      this.life=0; this.maxLife=calm?(320+Math.random()*420):(200+Math.random()*300);
      this.angle=Math.random()*Math.PI*2;
      this.rot=(Math.random()-.5)*(calm?.008:.02);
    };
    this.reset(true);
    this.update=function(){
      this.life++; this.y+=this.vy; this.x+=this.vx+Math.sin(this.life*.02)*.3;
      this.angle+=this.rot;
      var p=this.life/this.maxLife;
      if(p<.15) this.op=this.maxOp*(p/.15);
      else if(p>.75) this.op=this.maxOp*(1-(p-.75)/.25);
      else this.op=this.maxOp;
      if(this.life>=this.maxLife||this.y<-30) this.reset(false);
    };
    this.draw=function(){
      X.save(); X.globalAlpha=this.op;
      X.font=this.sz+'px monospace';
      X.fillStyle='rgba('+this.col+','+this.op+')';
      X.translate(this.x,this.y); X.rotate(this.angle);
      X.fillText(this.sym,0,0); X.restore();
    };
  }
  function drawConns(list,d,strength){
    d=d||130; strength=strength==null?.06:strength;
    for(var i=0;i<list.length;i++){
      for(var j=i+1;j<list.length;j++){
        var dx=list[i].x-list[j].x,dy=list[i].y-list[j].y;
        var dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<d){
          X.beginPath(); X.moveTo(list[i].x,list[i].y);
          X.lineTo(list[j].x,list[j].y);
          X.strokeStyle='rgba(184,134,11,'+(1-dist/d)*strength+')';
          X.lineWidth=.5; X.stroke();
        }
      }
    }
  }
  function drawFlow(){
    flowOff=(flowOff+.4)%40;
    [[H*.28,'rgba(184,134,11,.07)'],[H*.52,'rgba(47,107,79,.055)'],[H*.75,'rgba(184,134,11,.05)']].forEach(function(p){
      X.beginPath(); X.setLineDash([18,22]); X.lineDashOffset=-flowOff;
      X.moveTo(0,p[0]); X.lineTo(W,p[0]);
      X.strokeStyle=p[1]; X.lineWidth=1; X.stroke();
    });
    X.setLineDash([]);
  }
  function drawWM(){
    wmA+=.002*wmD; if(wmA>.03)wmD=-1; if(wmA<.005)wmD=1;
    X.save(); X.globalAlpha=wmA;
    X.font='bold '+Math.min(W,H)*.55+'px Georgia,serif';
    X.fillStyle='#B8860B'; X.textAlign='center'; X.textBaseline='middle';
    X.fillText('\u20B9',W*.5,H*.5); X.restore();
  }
  function drawGrad(a1,a2){
    a1=a1==null?.22:a1; a2=a2==null?.07:a2;
    var g=X.createRadialGradient(W*.2,H*.8,0,W*.2,H*.8,Math.max(W,H)*.7);
    g.addColorStop(0,'rgba(35,47,62,'+a1+')'); g.addColorStop(1,'rgba(27,36,48,0)');
    X.fillStyle=g; X.fillRect(0,0,W,H);
    var g2=X.createRadialGradient(W*.85,H*.15,0,W*.85,H*.15,Math.max(W,H)*.5);
    g2.addColorStop(0,'rgba(184,134,11,'+a2+')'); g2.addColorStop(1,'rgba(184,134,11,0)');
    X.fillStyle=g2; X.fillRect(0,0,W,H);
  }
  function loop(){
    animId=requestAnimationFrame(loop);
    X.clearRect(0,0,W,H);
    var inApp=document.body.classList.contains('logged-in');
    if(!inApp){
      // Full login-screen treatment: bold central mark, scanning flow lines, dense field.
      drawWM(); drawFlow(); drawConns(particles,130,.06);
      particles.forEach(function(p){p.update();p.draw();});
      drawGrad(.22,.07);
    } else {
      // Calmer ambient version for working pages: sparse, slow, no bold watermark
      // or scan-lines that would compete with tables and forms.
      drawConns(appParticles,100,.035);
      appParticles.forEach(function(p){p.update();p.draw();});
      drawGrad(.10,.04);
    }
  }
  function init(){
    resize();
    particles=Array.from({length:55},function(){return new P(false);});
    appParticles=Array.from({length:14},function(){return new P(true);});
    C.classList.add('ready'); loop();
  }
  window.addEventListener('resize',resize);
  window.addEventListener('load',init);
  document.addEventListener('visibilitychange',function(){
    if(document.hidden)cancelAnimationFrame(animId); else loop();
  });
})();

/* ---------- <script id="ee-sound-js"> ---------- */
(function(){
  // Lightweight synthesized UI click/tab sound — no audio files, no CDN, no lag.
  var ctx=null, unlocked=false;
  function ensureCtx(){
    if(ctx) return ctx;
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) return null;
    ctx=new AC();
    return ctx;
  }
  function unlock(){
    if(unlocked) return;
    var c=ensureCtx();
    if(c && c.state==='suspended') c.resume();
    unlocked=true;
  }
  ['pointerdown','keydown','touchstart'].forEach(function(evt){
    document.addEventListener(evt, unlock, {once:true, passive:true});
  });

  /** Play a short, soft click blip. `variant` tweaks pitch for tabs vs buttons. */
  function playClick(variant){
    var c=ensureCtx();
    if(!c) return;
    if(c.state==='suspended') c.resume();
    var now=c.currentTime;
    var osc=c.createOscillator();
    var gain=c.createGain();
    osc.type='sine';
    var f0 = variant==='tab' ? 520 : 660;
    var f1 = variant==='tab' ? 340 : 380;
    osc.frequency.setValueAtTime(f0, now);
    osc.frequency.exponentialRampToValueAtTime(f1, now+0.07);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now+0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now+0.09);
    osc.connect(gain); gain.connect(c.destination);
    osc.start(now); osc.stop(now+0.1);
  }

  var SELECTOR = 'button, .btn, .ps-btn, .nav-item, .tab, .atab, [role="tab"], #ee-claude-btn, .ee-pill, .ee-cs';
  document.addEventListener('click', function(e){
    var el = e.target.closest ? e.target.closest(SELECTOR) : null;
    if(!el) return;
    var isTab = el.classList.contains('tab') || el.classList.contains('atab') || el.getAttribute('role')==='tab' || el.classList.contains('nav-item');
    playClick(isTab ? 'tab' : 'click');
  }, true);

  window.eeSound = { play: playClick };
})();

/* ---------- <script id="ee-progress-js"> ---------- */
(function(){
  var bar=document.getElementById('ee-progress');
  if(!bar)return;
  window.eeP={
    show:function(w){bar.style.width=(w||40)+'%';bar.style.opacity='1';},
    done:function(){bar.style.width='100%';setTimeout(function(){bar.style.opacity='0';bar.style.width='0';},400);},
    reset:function(){bar.style.width='0';bar.style.opacity='0';}
  };
  var of=window.fetch;
  window.fetch=function(){
    window.eeP&&eeP.show(30+Math.random()*40);
    return of.apply(this,arguments).then(function(r){window.eeP&&eeP.done();return r;}).catch(function(e){window.eeP&&eeP.reset();throw e;});
  };
})();

/* ---------- <script id="ee-3d-js"> ---------- */
(function(){
  var ICONS={
    'dashboard':'\u25C8','submit':'\uD83D\uDCCB','declare':'\uD83D\uDCDD',
    'advance':'\uD83D\uDCB0','tourapproval':'\u2708','ledger':'\uD83D\uDCCA',
    'dispute':'\u26D1','approvals':'\u2705','financeapproval':'\uD83C\uDFE6',
    'pettycash':'\uD83E\uDE99','accounting':'\u2696','masters':'\u2699',
    'ca-overview':'\u25C8','ca-employees':'\uD83D\uDC65','ca-departments':'\uD83C\uDFDB',
    'ca-branches':'\uD83C\uDF10','ca-projects':'\uD83D\uDCCC','ca-expenseheads':'\uD83D\uDDC2',
    'ca-policy':'\uD83D\uDCDC','ca-accounting':'\uD83D\uDD17','ca-companyprofile':'\uD83C\uDFE2',
    'ca-reports':'\uD83D\uDCC8','ca-approvals':'\u2705','sa-overview':'\u25C8',
    'sa-companies':'\uD83C\uDFE2','sa-newcompany':'\u2295','sa-allusers':'\uD83D\uDC65',
    'sa-plans':'\uD83D\uDCB3','sa-globalconfig':'\u2699','sa-crossreports':'\uD83D\uDCCA',
    'sa-platformaudit':'\uD83D\uDD0D'
  };

  function rebuild(){
    document.querySelectorAll('.nav-item').forEach(function(item){
      if(item.querySelector('.nav-item-inner'))return;
      var view=item.dataset.view||'';
      var icon=ICONS[view]||'\u25C6';
      var numEl=item.querySelector('.num');
      var num=numEl?numEl.outerHTML:'';
      var label='';
      item.childNodes.forEach(function(n){
        if(n.nodeType===3&&n.textContent.trim())label=n.textContent.trim();
      });
      item.innerHTML='<div class="nav-item-inner">'
        +'<span class="nav-3d-icon">'+icon+'</span>'
        +num
        +'<span class="nav-item-label">'+label+'</span>'
        +'<span class="nav-3d-dot"></span>'
        +'</div>';
    });
  }

  function initParallax(){
    var sb=document.querySelector('.sidebar');
    if(!sb)return;
    sb.addEventListener('mousemove',function(e){
      var r=sb.getBoundingClientRect();
      document.querySelectorAll('.nav-item:not(.active)').forEach(function(item){
        var ir=item.getBoundingClientRect();
        var cy=ir.top+ir.height/2-r.top;
        var dist=Math.abs(e.clientY-r.top-cy)/r.height;
        var d=Math.max(0,.06-dist*.12);
        if(dist<.15){
          item.style.transform='perspective(600px) rotateX('+(-(d*80))+'deg) translateZ('+(d*80)+'px) translateY('+(-(d*12))+'px)';
        } else {
          item.style.transform='';
        }
      });
    });
    sb.addEventListener('mouseleave',function(){
      document.querySelectorAll('.nav-item:not(.active)').forEach(function(item){
        item.style.transform='';
      });
    });
  }

  function initKPITilt(){
    document.addEventListener('mousemove',function(e){
      document.querySelectorAll('.kpi').forEach(function(kpi){
        var r=kpi.getBoundingClientRect();
        if(e.clientX<r.left-60||e.clientX>r.right+60||e.clientY<r.top-60||e.clientY>r.bottom+60)return;
        var cx=r.left+r.width/2,cy=r.top+r.height/2;
        var dx=(e.clientX-cx)/(r.width*.8),dy=(e.clientY-cy)/(r.height*.8);
        kpi.style.transform='perspective(800px) rotateX('+(-(dy*10))+'deg) rotateY('+(dx*10)+'deg) translateZ(8px)';
        kpi.style.animation='none';
      });
    });
    document.addEventListener('mouseleave',function(){
      document.querySelectorAll('.kpi').forEach(function(k){k.style.transform='';k.style.animation='';});
    });
  }

  function initTypewriter(){
    var brand=document.querySelector('.login-brand');
    if(!brand)return;
    var text=brand.textContent.trim();
    if(!text)return;
    brand.textContent='';
    brand.style.borderRight='2px solid #B8860B';
    var i=0;
    function type(){
      if(i<text.length){brand.textContent+=text[i++];setTimeout(type,60+Math.random()*40);}
      else{setTimeout(function(){brand.style.borderRight='none';},800);}
    }
    setTimeout(type,400);
  }

  function initPSBtns(){
    document.querySelectorAll('.ps-btn').forEach(function(btn){
      btn.addEventListener('mousedown',function(){btn.style.transform='perspective(400px) rotateX(4deg) translateZ(-2px)';});
      btn.addEventListener('mouseup',function(){btn.style.transform='';});
      btn.addEventListener('mouseleave',function(){btn.style.transform='';});
    });
  }

  function staggerKPIs(){
    var kpis=document.querySelectorAll('.kpi');
    kpis.forEach(function(k,i){
      k.style.opacity='0';
      k.style.transform='translateY(16px)';
      k.style.transition='opacity 0.4s ease '+(i*.08)+'s,transform 0.4s ease '+(i*.08)+'s';
      setTimeout(function(){k.style.opacity='1';k.style.transform='translateY(0)';},100+i*80);
    });
  }

  document.addEventListener('DOMContentLoaded',function(){
    rebuild();
    initParallax();
    initKPITilt();
    initTypewriter();
    initPSBtns();
    setTimeout(staggerKPIs,300);
  });

  document.addEventListener('click',function(e){
    if(e.target.classList.contains('ps-btn')||e.target.classList.contains('nav-item')||
       e.target.closest('.nav-item')){
      setTimeout(function(){rebuild();staggerKPIs();},200);
    }
  });
})();

/* ---------- <script id="ee-claude-js"> ---------- */
(function(){
  var history=[], isOpen=false;
  var btn=document.getElementById('ee-claude-btn');
  var panel=document.getElementById('ee-claude-panel');
  var msgs=document.getElementById('ee-msgs');
  var inp=document.getElementById('ee-ci');
  var snd=document.getElementById('ee-cs');
  var cls=document.getElementById('ee-cx');
  var badge=document.getElementById('ee-claude-badge');
  var cfg=document.getElementById('ee-keycfg');
  if(!btn)return;

  function getKey(){return sessionStorage.getItem('ee_ck')||'';}
  function setKey(k){sessionStorage.setItem('ee_ck',k);}

  if(!getKey()&&cfg)cfg.classList.add('show');

  btn.addEventListener('click',function(){
    isOpen=!isOpen;
    panel.classList.toggle('open',isOpen);
    if(badge)badge.style.display='none';
    if(isOpen)setTimeout(function(){inp&&inp.focus();},120);
  });
  if(cls)cls.addEventListener('click',function(){isOpen=false;panel.classList.remove('open');});

  function appendMsg(role,text){
    var el=document.createElement('div');
    el.className='ee-msg '+role;
    el.textContent=text;
    var welcome=msgs.querySelector('.ee-welcome');
    if(welcome)welcome.style.display='none';
    msgs.appendChild(el);
    msgs.scrollTop=msgs.scrollHeight;
    return el;
  }

  function sendMsg(text){
    var msg=text||(inp&&inp.value.trim());
    if(!msg)return;
    if(inp)inp.value='';
    inp.disabled=true;snd.disabled=true;
    appendMsg('user',msg);
    history.push({role:'user',content:msg});
    var typing=appendMsg('typing','Claude is thinking...');
    var key=getKey();
    if(!key){
      typing.remove();
      appendMsg('ai','Please enter your Anthropic API key using the setup box above. Get your key from console.anthropic.com');
      if(cfg)cfg.classList.add('show');
      inp.disabled=false;snd.disabled=false;
      return;
    }
    var payload=JSON.stringify({
      model:'claude-sonnet-4-6',
      max_tokens:1024,
      system:'You are the Expense Easy AI assistant for Shield Infra Solutions Pvt Ltd. Help users with expense submission, approval workflow (Employee to Manager to HOD to Finance), advance requests, tour approvals, dispute requests, and ledger queries. Pricing: Rs 199/user/month (Starter - field employees) and Rs 599/user/month (Professional - Admin and Finance). Be concise, helpful, and professional.',
      messages:history.slice(-10)
    });
    fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-api-key':key,
        'anthropic-version':'2023-06-01',
        'anthropic-dangerous-direct-browser-access':'true'
      },
      body:payload
    }).then(function(r){return r.json();}).then(function(d){
      typing.remove();
      var reply=(d.content&&d.content[0]&&d.content[0].text)||
                (d.error?'API error: '+d.error.message:'No response from Claude AI.');
      appendMsg('ai',reply);
      history.push({role:'assistant',content:reply});
      inp.disabled=false;snd.disabled=false;inp.focus();
    }).catch(function(e){
      typing.remove();
      appendMsg('ai','Could not reach Claude AI. Check your API key and internet connection.');
      inp.disabled=false;snd.disabled=false;
    });
  }

  snd.addEventListener('click',function(){sendMsg();});
  inp.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}
  });

  window.eePill=function(text){
    if(!isOpen){isOpen=true;panel.classList.add('open');if(badge)badge.style.display='none';}
    setTimeout(function(){sendMsg(text);},100);
  };

  window.eeSaveKey=function(){
    var k=(document.getElementById('ee-key-in')||{}).value||'';
    var st=document.getElementById('ee-key-st');
    if(!k||!k.startsWith('sk-')){
      if(st){st.textContent='Invalid key.';st.style.color='#A8412C';}return;
    }
    setKey(k);
    if(st){st.textContent='Saved!';st.style.color='#2F6B4F';}
    if(cfg)cfg.classList.remove('show');
    setTimeout(function(){sendMsg('Hello! What can you help me with today?');},300);
  };

  setTimeout(function(){if(!isOpen&&badge)badge.style.display='flex';},4000);
})();
