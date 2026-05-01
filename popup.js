// popup.js - OdooDevTools

/* ── Versión de la extensión ─────────────────────────
   Editar esta constante antes de cada commit/push.
   Formato: "X.Y"  (ej: "1.0", "1.1", "2.0")
   Se muestra como badge en el header de Ajustes.
──────────────────────────────────────────────────── */
const APP_VERSION = "1.2";

/* ══════════════════════════════════════
   Hash fragment helpers
══════════════════════════════════════ */
function parseHash(url) {
  try {
    const hash = new URL(url).hash.replace(/^#/, "");
    if (!hash) return {};
    return Object.fromEntries(
      hash.split("&")
        .filter((s) => s.includes("="))
        .map((s) => s.split("=").map(decodeURIComponent))
    );
  } catch { return {}; }
}

function rebuildHash(params) {
  const entries = Object.entries(params);
  return entries.length
    ? entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")
    : "";
}

function deleteHashParam(url, key) {
  try {
    const u      = new URL(url);
    const params = parseHash(url);
    delete params[key];
    delete params["_company_switching"];
    u.hash = rebuildHash(params);
    return u.toString();
  } catch { return url; }
}

function isFirefox() {
  return typeof browser !== 'undefined' && navigator.userAgent.includes('Firefox');
}

/* ══════════════════════════════════════
   Referencias DOM
══════════════════════════════════════ */
const domainInput    = document.getElementById("domainInput");
const addBtn         = document.getElementById("addBtn");
const domainList     = document.getElementById("domainList");
const errorMsg       = document.getElementById("errorMsg");
const statusDot      = document.getElementById("statusDot");

const productSection = document.getElementById("productSection");
const productIdBadge = document.getElementById("productIdBadge");
const productOpenBtn = document.getElementById("productOpenBtn");

const portalSection     = document.getElementById("portalSection");
const portalIdBadge     = document.getElementById("portalIdBadge");
const portalRecordTitle = document.getElementById("portalRecordTitle");
const portalRecordName  = document.getElementById("portalRecordName");
const portalOpenBtn     = document.getElementById("portalOpenBtn");

const modelInput        = document.getElementById("modelInput");
const modelOpenBtn      = document.getElementById("modelOpenBtn");
const modelInputSection = document.getElementById("modelInputSection");

const clientModeBtn   = document.getElementById("clientModeBtn");
const clientModeLabel = document.getElementById("clientModeLabel");
const clientModeIcon  = document.getElementById("clientModeIcon");
const clientBanner    = document.getElementById("clientBanner");

const settingsBtn    = document.getElementById("settingsBtn");
const backBtn        = document.getElementById("backBtn");
const viewMain       = document.getElementById("viewMain");
const viewSettings   = document.getElementById("viewSettings");

const themeSwitch       = document.getElementById("themeSwitch");
const exportBtn         = document.getElementById("exportBtn");
const companyNameInput  = document.getElementById("companyNameInput");
const companyCidInput   = document.getElementById("companyCidInput");
const companyAddBtn     = document.getElementById("companyAddBtn");
const companyList       = document.getElementById("companyList");
const companyError      = document.getElementById("companyError");
const langNameInput     = document.getElementById("langNameInput");
const langCodeInput     = document.getElementById("langCodeInput");
const langAddBtn        = document.getElementById("langAddBtn");
const langList          = document.getElementById("langList");
const langError         = document.getElementById("langError");

const toast    = document.getElementById("toast");
const toastMsg = document.getElementById("toastMsg");

const modulesSection  = document.getElementById("modulesSection");
const modulesHeader   = document.getElementById("modulesHeader");
const modulesBody     = document.getElementById("modulesBody");
const modulesCount    = document.getElementById("modulesCount");
const modulesRefresh  = document.getElementById("modulesRefresh");
const modulesSwitch   = document.getElementById("modulesSwitch");

/* ══════════════════════════════════════
   IMPORTACIÓN (compatible Chrome + Firefox)
══════════════════════════════════════ */
const importBtn = document.getElementById('importBtn');

// Detectar si estamos en la mini ventana de importación (Firefox)
const IMPORT_MODE = (window.location.hash === '#import');

if (IMPORT_MODE) {
  // Estamos en la ventana emergente para Firefox → ocultar vistas normales y mostrar selector
  document.getElementById('viewMain').style.display = 'none';
  document.getElementById('viewSettings').style.display = 'none';

  const importModeView   = document.getElementById('importModeView');
  importModeView.style.display = 'block';

  const importFileInput  = document.getElementById('importFileInput');
  const importSelectBtn  = document.getElementById('importSelectBtn');
  const importStatusText = document.getElementById('importStatusText');
  const importDropZone   = document.getElementById('importDropZone');
  const importFileName   = document.getElementById('importFileName');

  // Leer y guardar el JSON
  function processFile(file) {
    if (!file) return;
    importFileName.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data || typeof data !== 'object') throw new Error();

        const domains     = Array.isArray(data.domains)   ? data.domains   : [];
        const companies   = Array.isArray(data.companies) ? data.companies : [];
        const langs       = Array.isArray(data.langs)     ? data.langs     : [];
        const theme       = data.theme === 'light' ? 'light' : 'dark';
        const showModules = typeof data.showModules === 'boolean' ? data.showModules : false;

        chrome.storage.sync.set({ domains, companies, langs, theme, showModules }, () => {
          importDropZone.style.borderColor = '#22c55e';
          importDropZone.style.background  = 'rgba(34,197,94,0.08)';
          importStatusText.style.display   = 'block';
          importStatusText.textContent     = '✓ Importado correctamente. Cerrando...';
          importStatusText.style.color     = '#22c55e';
          importStatusText.style.background = 'rgba(34,197,94,0.08)';
          importSelectBtn.style.opacity    = '0.5';
          importSelectBtn.disabled         = true;
          setTimeout(() => window.close(), 1200);
        });
      } catch {
        importDropZone.style.borderColor  = '#ef4444';
        importDropZone.style.background   = 'rgba(239,68,68,0.08)';
        importStatusText.style.display    = 'block';
        importStatusText.textContent      = '✗ Archivo no válido. Comprueba que es un .json de OdooDevTools.';
        importStatusText.style.color      = '#ef4444';
        importStatusText.style.background = 'rgba(239,68,68,0.08)';
      }
    };
    reader.readAsText(file);
  }

  // Click en la zona o en el botón
  importDropZone.addEventListener('click', () => importFileInput.click());
  importSelectBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', () => processFile(importFileInput.files[0]));

  // Drag & drop
  importDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    importDropZone.style.borderColor = '#7c3aed';
    importDropZone.style.background  = 'rgba(124,58,237,0.08)';
  });
  importDropZone.addEventListener('dragleave', () => {
    importDropZone.style.borderColor = '';
    importDropZone.style.background  = '';
  });
  importDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    importDropZone.style.borderColor = '';
    importDropZone.style.background  = '';
    processFile(e.dataTransfer.files[0]);
  });
} else {
  // Popup normal → comportamiento según navegador
  if (isFirefox()) {
    // Firefox: abrir ventana emergente en modo importación
    importBtn.addEventListener('click', () => {
      chrome.windows.create({
        url: chrome.runtime.getURL('popup.html') + '#import',
        type: 'popup',
        width: 420,
        height: 340,
        focused: true
      });
    });
  } else {
    // Chrome / Edge / Opera, etc.: diálogo de archivo directo desde el popup
    const hiddenFileInput = document.createElement('input');
    hiddenFileInput.type = 'file';
    hiddenFileInput.accept = '.json';
    hiddenFileInput.style.display = 'none';
    document.body.appendChild(hiddenFileInput);

    hiddenFileInput.addEventListener('change', () => {
      const file = hiddenFileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data || typeof data !== 'object') throw new Error();

          const domains     = Array.isArray(data.domains)   ? data.domains   : [];
          const companies   = Array.isArray(data.companies) ? data.companies : [];
          const langs       = Array.isArray(data.langs)     ? data.langs     : [];
          const theme       = data.theme === 'light' ? 'light' : 'dark';
          const showModules = typeof data.showModules === 'boolean' ? data.showModules : false;

          chrome.storage.sync.set({ domains, companies, langs, theme, showModules }, () => {
            themeSwitch.checked = theme === 'light';
            applyTheme(theme === 'light');
            applyModulesVisibility(showModules);
            getDomains((entries) => getCompanies((companies) => getLangs((langs) => render(entries, companies, langs))));
            showToast('✓ Configuración importada correctamente');
          });
        } catch {
          showToast('✗ Error al leer el archivo');
        }
        hiddenFileInput.value = '';
      };
      reader.readAsText(file);
    });

    importBtn.addEventListener('click', () => hiddenFileInput.click());
  }
}


/* ══════════════════════════════════════
   Navegación vistas
══════════════════════════════════════ */
settingsBtn.addEventListener("click", () => {
  viewMain.classList.remove("active");
  viewSettings.classList.add("active");
  renderCompanies();
  renderLangs();
  getShowModules((show) => { modulesSwitch.checked = show; });
  const badge = document.getElementById("appVersionBadge");
  if (badge) badge.textContent = "v" + APP_VERSION;
});
backBtn.addEventListener("click", () => {
  viewSettings.classList.remove("active");
  viewMain.classList.add("active");
  loadAll();
});

/* ══════════════════════════════════════
   Toast
══════════════════════════════════════ */
let toastTimer = null;
function showToast(msg) {
  toastMsg.textContent = msg;
  toast.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

/* ══════════════════════════════════════
   Tema
══════════════════════════════════════ */
function applyTheme(isLight) {
  document.body.classList.toggle("light", isLight);
}
function loadTheme(cb) {
  chrome.storage.sync.get({ theme: "dark" }, ({ theme }) => {
    const isLight = theme === "light";
    themeSwitch.checked = isLight;
    applyTheme(isLight);
    cb && cb();
  });
}
themeSwitch.addEventListener("change", () => {
  const isLight = themeSwitch.checked;
  applyTheme(isLight);
  chrome.storage.sync.set({ theme: isLight ? "light" : "dark" });
});

/* ══════════════════════════════════════
   Storage helpers
══════════════════════════════════════ */
function getDomains(cb) {
  chrome.storage.sync.get({ domains: [] }, (r) => cb(r.domains));
}
function saveDomains(domains, cb) {
  chrome.storage.sync.set({ domains }, () => cb && cb());
}
function getCompanies(cb) {
  chrome.storage.sync.get({ companies: [] }, (r) => cb(r.companies));
}
function saveCompanies(companies, cb) {
  chrome.storage.sync.set({ companies }, () => cb && cb());
}
function getLangs(cb) {
  chrome.storage.sync.get({ langs: [] }, (r) => cb(r.langs));
}
function saveLangs(langs, cb) {
  chrome.storage.sync.set({ langs }, () => cb && cb());
}
function getClientMode(cb) {
  chrome.storage.sync.get({ clientMode: false }, (r) => cb(r.clientMode));
}
function setClientMode(val, cb) {
  chrome.storage.sync.set({ clientMode: val }, () => cb && cb());
}
function getShowModules(cb) {
  chrome.storage.sync.get({ showModules: false }, (r) => cb(r.showModules));
}
function setShowModules(val, cb) {
  chrome.storage.sync.set({ showModules: val }, () => cb && cb());
}

/* ══════════════════════════════════════
   Validaciones dominio
══════════════════════════════════════ */
function cleanDomain(value) {
  return value.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}
function isValidDomain(domain) {
  // Separar host y puerto si lo hay
  const portMatch = domain.match(/^(.+):(\d{1,5})$/);
  const host = portMatch ? portMatch[1] : domain;
  const port = portMatch ? parseInt(portMatch[2]) : null;

  // Puerto válido si existe: 1-65535
  if (port !== null && (port < 1 || port > 65535)) return false;

  // IP: 192.168.1.10
  const ipPattern    = /^(\d{1,3}\.){3}\d{1,3}$/;
  // Localhost
  const localPattern = /^localhost$/;
  // DNS: cualquier hostname válido con o sin TLD
  // Acepta: mi-empresa.odoo.com, srvdockerdev.miweb.com, odoo.local, servidor
  const dnsPattern   = /^[a-z0-9]([a-z0-9\-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]*[a-z0-9])?)*$/;

  return ipPattern.test(host) || localPattern.test(host) || dnsPattern.test(host);
}
function setError(msg) { errorMsg.textContent = msg; }
function clearError()  { errorMsg.textContent = ""; }

/* ══════════════════════════════════════
   Matching
══════════════════════════════════════ */
function domainMatches(entry, parsedUrl) {
  const clean = entry.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (clean.includes(":")) return parsedUrl.host === clean;
  return parsedUrl.hostname === clean || parsedUrl.hostname.endsWith("." + clean);
}

/* ══════════════════════════════════════
   Modo cliente
   — quita debug/lang/cids del tab activo
   — al desactivar restaura la configuración
══════════════════════════════════════ */
function applyClientModeUI(isActive) {
  clientModeBtn.classList.toggle("active", isActive);
  clientBanner.classList.toggle("visible", isActive);
  document.body.classList.toggle("client-mode", isActive);

  if (isActive) {
    // Estamos en modo cliente → mostrar botón para volver a Desarrollador
    clientModeLabel.textContent = "Desarrollador";
    clientModeBtn.title = "Volver al modo desarrollador";
    clientModeIcon.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>`;
  } else {
    // Estamos en modo desarrollador → mostrar botón para ir a Cliente
    clientModeLabel.textContent = "Cliente";
    clientModeBtn.title = "Ver como cliente (quita debug/idioma/empresa)";
    clientModeIcon.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>`;
  }
}

function stripParamsFromTab(entries) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs.length) return;
    const tab = tabs[0];
    if (!tab.url || !tab.url.startsWith("http")) return;
    let parsed;
    try { parsed = new URL(tab.url); } catch { return; }

    const entry = entries.find((e) => domainMatches(e, parsed));
    if (!entry) return;

    parsed.searchParams.delete("debug");
    parsed.searchParams.delete("lang");
    let newUrl = deleteHashParam(parsed.toString(), "cids");
    chrome.tabs.update(tab.id, { url: newUrl });
  });
}

function restoreParamsToTab(entries) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs.length) return;
    const tab = tabs[0];
    if (!tab.url || !tab.url.startsWith("http")) return;
    let parsed;
    try { parsed = new URL(tab.url); } catch { return; }

    const entry = entries.find((e) => domainMatches(e, parsed));
    if (!entry) return;

    syncActiveTab(entry);
  });
}

clientModeBtn.addEventListener("click", () => {
  getClientMode((isActive) => {
    const next = !isActive;
    setClientMode(next, () => {
      applyClientModeUI(next);
      getDomains((entries) => {
        if (next) {
          stripParamsFromTab(entries);
          showToast("👁 Modo cliente activo — sin debug ni params");
        } else {
          restoreParamsToTab(entries);
          showToast("✓ Modo desarrollador restaurado");
        }
      });
    });
  });
});

/* ══════════════════════════════════════
   Sincronización tab activo
══════════════════════════════════════ */
function syncActiveTab(entry) {
  const mode = entry.mode || "1";
  const lang = entry.lang || "es_ES";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs.length) return;
    const tab = tabs[0];
    if (!tab.url || !tab.url.startsWith("http")) return;
    let parsed;
    try { parsed = new URL(tab.url); } catch { return; }
    if (!domainMatches(entry, parsed)) return;

    const debugOk = parsed.searchParams.get("debug") === mode;
    const langOk  = parsed.searchParams.get("lang") === lang;
    if (debugOk && langOk) return;

    parsed.searchParams.set("debug", mode);
    parsed.searchParams.set("lang", lang);
    chrome.tabs.update(tab.id, { url: parsed.toString() });
  });
}

function switchCompanyOnTab(entry, newCid) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs.length) return;
    const tab = tabs[0];
    if (!tab.url || !tab.url.startsWith("http")) return;
    let parsed;
    try { parsed = new URL(tab.url); } catch { return; }
    if (!domainMatches(entry, parsed)) return;

    const mode = entry.mode || "1";
    parsed.searchParams.set("debug", mode);
    const cid = newCid || "1";
    const switchUrl = `${parsed.origin}/web?${parsed.searchParams.toString()}#action=menu&cids=${cid}&_company_switching=1`;
    chrome.tabs.update(tab.id, { url: switchUrl });
  });
}

function switchLangOnTab(entry, newLang) {
  const effectiveLang = newLang || "es_ES";
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs.length) return;
    const tab = tabs[0];
    if (!tab.url || !tab.url.startsWith("http")) return;
    let parsed;
    try { parsed = new URL(tab.url); } catch { return; }
    if (!domainMatches(entry, parsed)) return;
    parsed.searchParams.set("debug", entry.mode || "1");
    parsed.searchParams.set("lang", effectiveLang);
    chrome.tabs.update(tab.id, { url: parsed.toString() });
  });
}

function removeDebugFromTab(entry) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs.length) return;
    const tab = tabs[0];
    if (!tab.url || !tab.url.startsWith("http")) return;
    let parsed;
    try { parsed = new URL(tab.url); } catch { return; }
    if (!domainMatches(entry, parsed)) return;
    parsed.searchParams.delete("debug");
    parsed.searchParams.delete("lang");
    let newUrl = deleteHashParam(parsed.toString(), "cids");
    chrome.tabs.update(tab.id, { url: newUrl });
  });
}

/* ══════════════════════════════════════
   Detección de producto (tienda web)
   /shop/slug-ID
══════════════════════════════════════ */
/* ══════════════════════════════════════
   Detección de registros en el portal /my/
   Patrones: /my/{tipo}/{id}?access_token=...
   El token se ignora — usamos la sesión backend
══════════════════════════════════════ */
const PORTAL_ROUTES = {
  orders:   { model: "sale.order",      label: "Pedido de venta / Presupuesto"  },
  quotes:   { model: "sale.order",      label: "Presupuesto"       },
  invoices: { model: "account.move",    label: "Factura"           },
  bills:    { model: "account.move",    label: "Factura proveedor" },
  purchase: { model: "purchase.order",  label: "Pedido de compra"  },
  picking:  { model: "stock.picking",   label: "Albarán"           },
  projects: { model: "project.project", label: "Proyecto"          },
  tasks:    { model: "project.task",    label: "Tarea"             },
};

function getPortalRecord(url) {
  try {
    const pathname = new URL(url).pathname;
    // Formato: /my/{tipo}/{id}  (con o sin access_token en query)
    const match = pathname.match(/^\/my\/([a-z_]+)\/(\d+)\/?$/);
    if (!match) return null;
    const tipo  = match[1];
    const id    = match[2];
    const route = PORTAL_ROUTES[tipo];
    if (!route) return null;
    return { id, model: route.model, label: route.label };
  } catch { return null; }
}

async function fetchRecordName(origin, model, id) {
  try {
    const resp = await fetch(`${origin}/web/dataset/call_kw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        jsonrpc: "2.0", method: "call", id: 1,
        params: {
          model,
          method: "name_get",
          args:   [[parseInt(id)]],
          kwargs: { context: {} }
        }
      })
    });
    const data = await resp.json();
    if (data.result && data.result.length) return data.result[0][1];
    return null;
  } catch { return null; }
}

function getProductIdFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const match    = pathname.match(/^\/shop\/.*-(\d+)\/?$/);
    return match ? match[1] : null;
  } catch { return null; }
}

/* ══════════════════════════════════════
   Actualizar secciones de detección
══════════════════════════════════════ */
function updateDetectionSections(tab, entries) {
  if (!tab || !tab.url || !tab.url.startsWith("http")) {
    productSection.classList.remove("visible");
    portalSection.classList.remove("visible");
    modelInputSection.classList.add("hidden");
    return;
  }

  let parsed;
  try { parsed = new URL(tab.url); } catch {
    productSection.classList.remove("visible");
    portalSection.classList.remove("visible");
    modelInputSection.classList.add("hidden");
    return;
  }

  const entry = entries.find((e) => domainMatches(e, parsed));
  const mode  = entry ? (entry.mode || "1") : "1";

  // ── Producto tienda ──
  const productId = getProductIdFromUrl(tab.url);
  if (entry && productId) {
    const backendUrl = `${parsed.origin}/web?debug=${mode}#id=${productId}&model=product.template&view_type=form`;
    productIdBadge.textContent = `#${productId}`;
    productOpenBtn.onclick = () => chrome.tabs.update(tab.id, { url: backendUrl });
    productSection.classList.add("visible");
  } else {
    productSection.classList.remove("visible");
  }

  // ── Registro portal ──
  const portalRecord = getPortalRecord(tab.url);
  if (entry && portalRecord) {
    const backendUrl = `${parsed.origin}/web?debug=${mode}#id=${portalRecord.id}&model=${encodeURIComponent(portalRecord.model)}&view_type=form`;
    portalIdBadge.textContent     = `#${portalRecord.id}`;
    portalRecordTitle.textContent = portalRecord.label;
    portalRecordName.textContent  = "Cargando nombre…";
    portalOpenBtn.onclick = () => chrome.tabs.update(tab.id, { url: backendUrl });
    portalSection.classList.add("visible");
    // Cargar el nombre real del registro via call_kw en background
    fetchRecordName(parsed.origin, portalRecord.model, portalRecord.id).then((name) => {
      portalRecordName.textContent = name || `ID ${portalRecord.id}`;
    });
  } else {
    portalSection.classList.remove("visible");
  }

  // ── Sección abrir modelo: solo visible si hay dominio reconocido ──
  if (entry) {
    modelInputSection.classList.remove("hidden");
    modelInputSection.dataset.origin = parsed.origin;
    modelInputSection.dataset.mode   = mode;
    const currentCids = parseHash(tab.url)["cids"] || entry.cid || "";
    modelInputSection.dataset.cids = currentCids;
    // Propagar origen al panel de módulos
    modulesSection.dataset.origin = parsed.origin;
    modulesSection.dataset.mode   = mode;
  } else {
    modelInputSection.classList.add("hidden");
    modulesSection.dataset.origin = "";
  }
}

/* Abrir modelo — replica exactamente el server action Python:
   {"type": "ir.actions.act_window", "res_model": name, "view_mode": "tree,form"}
   Crea el action al vuelo via create(), navega a él, luego lo borra. */
async function openModel() {
  const model  = modelInput.value.trim();
  if (!model) { modelInput.focus(); return; }
  const origin = modelInputSection.dataset.origin;
  const mode   = modelInputSection.dataset.mode || "1";
  const cids   = modelInputSection.dataset.cids || "";
  if (!origin) return;

  modelOpenBtn.textContent = "…";
  modelOpenBtn.disabled    = true;

  async function rpc(params) {
    const r = await fetch(`${origin}/web/dataset/call_kw`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ jsonrpc: "2.0", method: "call", id: 1, params })
    });
    return r.json();
  }

  try {
    // 1. Crear el action exactamente igual que el server action Python
    const createData = await rpc({
      model:  "ir.actions.act_window",
      method: "create",
      args: [{
        name:      model,
        res_model: model,
        view_mode: "tree,form",
        target:    "current",
        domain:    "[]",
      }],
      kwargs: { context: {} }
    });

    if (createData.error || !createData.result) {
      showModelError("Error al crear la acción: " + (createData.error?.data?.message || "sin permisos"));
      return;
    }

    const actionId = createData.result;

    // 2. Navegar al action recién creado
    let hash = `action=${actionId}&view_type=list`;
    if (cids) hash += `&cids=${cids}`;
    const url = `${origin}/web?debug=${mode}#${hash}`;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length) chrome.tabs.update(tabs[0].id, { url });
    });

    // 3. Pedir al background que borre el action temporal tras la navegación.
    //    El popup se cierra al navegar, matando cualquier setTimeout.
    //    El background.js permanece vivo y ejecuta el unlink con seguridad.
    chrome.runtime.sendMessage({
      type:     "unlinkAction",
      origin:   origin,
      actionId: actionId,
    });

  } catch {
    showModelError("Error de conexión con Odoo.");
  } finally {
    modelOpenBtn.textContent = "Abrir";
    modelOpenBtn.disabled    = false;
  }
}

function showModelError(msg) {
  const err = document.getElementById("modelError");
  if (err) { err.textContent = msg; setTimeout(() => { err.textContent = ""; }, 3500); }
}

modelOpenBtn.addEventListener("click", openModel);
modelInput.addEventListener("keydown", (e) => { if (e.key === "Enter") openModel(); });

/* ══════════════════════════════════════
   Render lista de dominios
══════════════════════════════════════ */
function buildLangOptions(selected, langs) {
  const none = `<option value="">🌐 Idioma por defecto</option>`;
  return none + langs.map(({ code, name }) =>
    `<option value="${code}" ${code === selected ? "selected" : ""}>${name} (${code})</option>`
  ).join("");
}
function buildCompanyOptions(selected, companies) {
  const none = `<option value="">🏢 Empresa por defecto (Recargar)</option>`;
  return none + companies.map(({ cid, name }) =>
    `<option value="${cid}" ${String(cid) === String(selected) ? "selected" : ""}>${name} (cids=${cid})</option>`
  ).join("");
}

/* ══════════════════════════════════════
   Info de base de datos por dominio
   Usa /web/webclient/version_info que devuelve
   db_name y expiration_date sin necesitar call_kw
══════════════════════════════════════ */
const dbInfoCache = {};

async function fetchDbInfo(origin) {
  if (dbInfoCache[origin]) return dbInfoCache[origin];

  async function rpc(params) {
    const r = await fetch(`${origin}/web/dataset/call_kw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ jsonrpc: "2.0", method: "call", id: 1, params })
    });
    return r.json();
  }

  try {
    // Obtener nombre de BD y fecha de vencimiento en paralelo
    const [sessionResp, expiryResp] = await Promise.all([
      // Nombre de BD: sesión activa
      fetch(`${origin}/web/session/get_session_info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ jsonrpc: "2.0", method: "call", id: 1, params: {} })
      }).then(r => r.json()),
      // Fecha de vencimiento: ir.config_parameter
      rpc({
        model:  "ir.config_parameter",
        method: "get_param",
        args:   ["database.expiration_date"],
        kwargs: { context: {} }
      })
    ]);

    const db     = sessionResp?.result?.db || null;
    const expiry = expiryResp?.result || null;

    const info = { db, expiry };
    dbInfoCache[origin] = info;
    return info;
  } catch { return { db: null, expiry: null }; }
}

function expiryBadge(expiryStr) {
  if (!expiryStr) return `<span class="domain-expiry none">—</span>`;
  try {
    const expiry = new Date(expiryStr);
    const now    = new Date();
    const days   = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    const label  = expiryStr.substring(0, 10); // YYYY-MM-DD
    if (days < 0)  return `<span class="domain-expiry expired">Caducada ${label}</span>`;
    if (days < 30) return `<span class="domain-expiry warn">Vence ${label}</span>`;
    return `<span class="domain-expiry ok">Vence ${label}</span>`;
  } catch { return `<span class="domain-expiry none">${expiryStr}</span>`; }
}

async function renderDbInfo(entry, itemEl) {
  const origin = `https://${entry.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  const infoRow = itemEl.querySelector(".domain-info");
  if (!infoRow) return;

  const info = await fetchDbInfo(origin);
  const dbEl   = infoRow.querySelector(".domain-db span");
  const expDiv = infoRow.querySelector(".domain-expiry-wrap");

  if (dbEl)   dbEl.textContent = info.db    || "—";
  if (expDiv) expDiv.innerHTML = expiryBadge(info.expiry);
}

function render(entries, companies, langs) {
  statusDot.classList.toggle("inactive", entries.length === 0);
  statusDot.title = entries.length > 0
    ? `Activo en ${entries.length} dominio${entries.length > 1 ? "s" : ""}`
    : "Sin dominios configurados";

  domainList.innerHTML = "";

  if (entries.length === 0) {
    domainList.innerHTML = `
      <div class="empty">
        <span>🔧</span>
        Añade dominios de Odoo<br>para empezar la configuración.
      </div>`;
    return;
  }

  const hasCompanies = companies && companies.length > 0;
  const hasLangs     = langs     && langs.length     > 0;

  entries.forEach((entry, idx) => {
    const mode = entry.mode || "1";
    const lang = entry.lang || "";
    const cid  = entry.cid  || "";
    const item = document.createElement("div");
    item.className = "domain-item";

    const companyRow = hasCompanies ? `
      <div class="domain-row-bot">
        <select class="ctrl-select company-select" data-idx="${idx}">
          ${buildCompanyOptions(cid, companies)}
        </select>
      </div>` : "";

    item.innerHTML = `
      <div class="domain-row-top">
        <span class="domain-name" title="${entry.domain}">${entry.domain}</span>
        <button class="remove-btn" data-idx="${idx}" title="Eliminar">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="domain-row-mid">
        <div class="mode-toggle" data-idx="${idx}">
          <button class="mode-btn ${mode === "1"      ? "active" : ""}" data-mode="1">debug</button>
          <button class="mode-btn ${mode === "assets" ? "active" : ""}" data-mode="assets">assets</button>
        </div>
        ${hasLangs ? `<select class="ctrl-select lang-select" data-idx="${idx}">
          ${buildLangOptions(lang, langs)}
        </select>` : ""}
      </div>
      ${companyRow}
      <div class="domain-info">
        <span class="domain-db">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
          <span>…</span>
        </span>
        <span class="domain-expiry-wrap"><span class="domain-expiry none">…</span></span>
      </div>`;
    domainList.appendChild(item);
    // Cargar info de BD en background (no bloquea el render)
    renderDbInfo(entry, item);
  });
}

/* ══════════════════════════════════════
   Gestión de idiomas (ajustes)
══════════════════════════════════════ */
function renderLangs() {
  getLangs((langs) => {
    langList.innerHTML = "";
    langs.forEach((l, idx) => {
      const row = document.createElement("div");
      row.className = "company-list-item";
      row.innerHTML = `
        <span class="company-cid">lang=${l.code}</span>
        <span class="company-name-text">${l.name}</span>
        <button class="remove-btn" data-lidx="${idx}" title="Eliminar idioma">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>`;
      langList.appendChild(row);
    });
  });
}

langAddBtn.addEventListener("click", () => {
  langError.textContent = "";
  const name = langNameInput.value.trim();
  const code = langCodeInput.value.trim();
  if (!name) { langError.textContent = "Escribe el nombre del idioma."; return; }
  if (!code || !/^[a-zA-Z]{2,3}_[a-zA-Z]{2,4}$/.test(code)) {
    langError.textContent = "Formato inválido. Ej: es_ES, pt_PT, en_US"; return;
  }
  getLangs((langs) => {
    if (langs.some((l) => l.code === code)) {
      langError.textContent = "Ya existe un idioma con ese código."; return;
    }
    const updated = [...langs, { name, code }];
    saveLangs(updated, () => {
      langNameInput.value = "";
      langCodeInput.value = "";
      renderLangs();
    });
  });
});

langList.addEventListener("click", (e) => {
  const btn = e.target.closest(".remove-btn[data-lidx]");
  if (!btn) return;
  const idx = parseInt(btn.dataset.lidx, 10);
  getLangs((langs) => { saveLangs(langs.filter((_, i) => i !== idx), renderLangs); });
});

langNameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") langAddBtn.click(); });
langCodeInput.addEventListener("keydown",  (e) => { if (e.key === "Enter") langAddBtn.click(); });

/* ══════════════════════════════════════
   Gestión de empresas (ajustes)
══════════════════════════════════════ */
function renderCompanies() {
  getCompanies((companies) => {
    companyList.innerHTML = "";
    companies.forEach((c, idx) => {
      const row = document.createElement("div");
      row.className = "company-list-item";
      row.innerHTML = `
        <span class="company-cid">cids=${c.cid}</span>
        <span class="company-name-text">${c.name}</span>
        <button class="remove-btn" data-cidx="${idx}" title="Eliminar empresa">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>`;
      companyList.appendChild(row);
    });
  });
}

companyAddBtn.addEventListener("click", () => {
  companyError.textContent = "";
  const name = companyNameInput.value.trim();
  const cid  = companyCidInput.value.trim();
  if (!name) { companyError.textContent = "Escribe el nombre de la empresa."; return; }
  if (!cid || isNaN(Number(cid)) || Number(cid) < 1) {
    companyError.textContent = "El cid debe ser un número entero positivo."; return;
  }
  getCompanies((companies) => {
    if (companies.some((c) => String(c.cid) === cid)) {
      companyError.textContent = "Ya existe una empresa con ese cid."; return;
    }
    const updated = [...companies, { name, cid: Number(cid) }];
    saveCompanies(updated, () => {
      companyNameInput.value = "";
      companyCidInput.value  = "";
      renderCompanies();
    });
  });
});

companyList.addEventListener("click", (e) => {
  const btn = e.target.closest(".remove-btn[data-cidx]");
  if (!btn) return;
  const idx = parseInt(btn.dataset.cidx, 10);
  getCompanies((companies) => { saveCompanies(companies.filter((_, i) => i !== idx), renderCompanies); });
});

companyNameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") companyAddBtn.click(); });
companyCidInput.addEventListener("keydown",  (e) => { if (e.key === "Enter") companyAddBtn.click(); });

/* ══════════════════════════════════════
   Añadir dominio
══════════════════════════════════════ */
function addDomain() {
  clearError();
  const raw = domainInput.value;
  if (!raw.trim()) return;
  const domain = cleanDomain(raw);
  if (!isValidDomain(domain)) {
    setError("Dominio no válido. Ej: mi-empresa.odoo.com o 192.168.1.10:8069"); return;
  }
  getDomains((entries) => {
    if (entries.some((e) => e.domain === domain)) {
      setError("Este dominio ya está en la lista."); return;
    }
    const newEntry = { domain, mode: "1", lang: "", cid: "" };
    const updated  = [...entries, newEntry];
    saveDomains(updated, () => {
      domainInput.value = "";
      getCompanies((companies) => getLangs((langs) => render(updated, companies, langs)));
      syncActiveTab(newEntry);
    });
  });
}

addBtn.addEventListener("click", addDomain);
domainInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addDomain(); });
domainInput.addEventListener("input", clearError);

/* ══════════════════════════════════════
   Eventos lista de dominios
══════════════════════════════════════ */
domainList.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".remove-btn[data-idx]");
  if (removeBtn) {
    const idx = parseInt(removeBtn.dataset.idx, 10);
    getDomains((entries) => {
      const removed = entries[idx];
      const updated = entries.filter((_, i) => i !== idx);
      saveDomains(updated, () => {
        getCompanies((companies) => getLangs((langs) => render(updated, companies, langs)));
        removeDebugFromTab(removed);
      });
    });
    return;
  }

  const modeBtn = e.target.closest(".mode-btn");
  if (modeBtn) {
    const idx     = parseInt(modeBtn.closest(".mode-toggle").dataset.idx, 10);
    const newMode = modeBtn.dataset.mode;
    getDomains((entries) => {
      const updated = entries.map((e, i) => i === idx ? { ...e, mode: newMode } : e);
      saveDomains(updated, () => {
        getCompanies((companies) => getLangs((langs) => render(updated, companies, langs)));
        syncActiveTab(updated[idx]);
      });
    });
  }
});

domainList.addEventListener("change", (e) => {
  const langSel = e.target.closest(".lang-select");
  if (langSel) {
    const idx     = parseInt(langSel.dataset.idx, 10);
    const newLang = langSel.value;
    getDomains((entries) => {
      const updated = entries.map((en, i) => i === idx ? { ...en, lang: newLang } : en);
      saveDomains(updated, () => {
        switchLangOnTab(updated[idx], newLang);
        getCompanies((companies) => getLangs((langs) => render(updated, companies, langs)));
      });
    });
    return;
  }

  const compSel = e.target.closest(".company-select");
  if (compSel) {
    const idx    = parseInt(compSel.dataset.idx, 10);
    const newCid = compSel.value;
    getDomains((entries) => {
      const updated = entries.map((en, i) => i === idx ? { ...en, cid: newCid } : en);
      saveDomains(updated, () => {
        switchCompanyOnTab(updated[idx], newCid);
        getCompanies((companies) => getLangs((langs) => render(updated, companies, langs)));
      });
    });
  }
});

/* ══════════════════════════════════════
   Exportar
══════════════════════════════════════ */
exportBtn.addEventListener("click", () => {
  chrome.storage.sync.get({ domains: [], companies: [], langs: [], theme: "dark", showModules: false }, (data) => {
    const payload = {
      version: 3, exportedAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      theme: data.theme, companies: data.companies,
      langs: data.langs, domains: data.domains,
      showModules: data.showModules,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "odoo-devtools-config.json"; a.click();
    URL.revokeObjectURL(url);
    showToast("✓ Configuración exportada correctamente");
  });
});


/* ══════════════════════════════════════
   Panel de módulos
══════════════════════════════════════ */

// Toggle acordeón
modulesHeader.addEventListener("click", (e) => {
  if (e.target.closest(".modules-refresh")) return; // no colapsar al refrescar
  modulesSection.classList.toggle("open");
});

// Botón refrescar
modulesRefresh.addEventListener("click", (e) => {
  e.stopPropagation();
  loadModules();
});

// Toggle ajustes
modulesSwitch.addEventListener("change", () => {
  const val = modulesSwitch.checked;
  setShowModules(val, () => {
    applyModulesVisibility(val);
    if (val) loadModules();
  });
});

function applyModulesVisibility(show) {
  modulesSwitch.checked = show;
  if (show) {
    modulesSection.classList.remove("hidden");
  } else {
    modulesSection.classList.add("hidden");
  }
}

function timeAgo(dateStr) {
  try {
    // Odoo devuelve fechas en UTC sin 'Z', añadirla para parsear correctamente
    const d    = new Date(dateStr.replace(" ", "T") + "Z");
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60)   return "ahora";
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    return `hace ${Math.floor(diff / 3600)}h`;
  } catch { return ""; }
}

function stateLabelAndBadge(state) {
  const map = {
    to_upgrade: { label: "actualizar",  cls: "badge-to_upgrade" },
    to_install: { label: "instalar",    cls: "badge-to_install" },
    to_remove:  { label: "eliminar",    cls: "badge-to_remove"  },
    installed:  { label: "instalado",   cls: "badge-installed"  },
  };
  return map[state] || { label: state, cls: "badge-installed" };
}

async function loadModules() {
  // Necesita un dominio activo con sesión
  const origin = modulesSection.dataset.origin;
  const mode   = modulesSection.dataset.mode || "1";
  if (!origin) {
    modulesBody.innerHTML = `<div class="modules-loading">Abre un dominio Odoo configurado.</div>`;
    modulesCount.textContent = "—";
    return;
  }

  modulesCount.textContent = "…";
  modulesBody.innerHTML    = `<div class="modules-loading">Cargando…</div>`;

  try {
    // Calcular hace 2 horas en UTC formato Odoo: "2024-01-15 10:00:00"
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      .toISOString().replace("T", " ").substring(0, 19);

    // Llamada paralela: pendientes + recién actualizados
    const [pendingResp, recentResp] = await Promise.all([
      // Módulos con estado pendiente (to upgrade / to install / to remove)
      fetch(`${origin}/web/dataset/call_kw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          jsonrpc: "2.0", method: "call", id: 1,
          params: {
            model: "ir.module.module", method: "search_read",
            args: [[["state", "in", ["to upgrade", "to install", "to remove"]]]],
            kwargs: {
              fields: ["name", "shortdesc", "state", "write_date"],
              order:  "write_date desc",
              limit:  50, context: {}
            }
          }
        })
      }),
      // Módulos instalados/actualizados en las últimas 2 horas
      fetch(`${origin}/web/dataset/call_kw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          jsonrpc: "2.0", method: "call", id: 2,
          params: {
            model: "ir.module.module", method: "search_read",
            args: [[["state", "=", "installed"], ["write_date", ">=", twoHoursAgo]]],
            kwargs: {
              fields: ["name", "shortdesc", "state", "write_date"],
              order:  "write_date desc",
              limit:  50, context: {}
            }
          }
        })
      })
    ]);

    const pendingData = await pendingResp.json();
    const recentData  = await recentResp.json();

    if (pendingData.error || recentData.error) {
      throw new Error("RPC error");
    }

    const pending = pendingData.result || [];
    const recent  = recentData.result  || [];

    // Fusionar evitando duplicados (por si un módulo aparece en ambos)
    const seen = new Set();
    const all  = [];
    for (const m of [...pending, ...recent]) {
      if (!seen.has(m.id)) { seen.add(m.id); all.push(m); }
    }

    const total = all.length;
    const hasPending = pending.length > 0;

    // Badge contador
    modulesCount.textContent = total === 0 ? "✓ ok" : String(total);
    modulesCount.className   = "modules-header-count" + (hasPending ? " warn" : "");

    if (total === 0) {
      modulesBody.innerHTML = `<div class="modules-loading" style="color:var(--green)">✓ Sin módulos pendientes ni actualizaciones recientes.</div>`;
      return;
    }

    // Render lista
    modulesBody.innerHTML = all.map((m) => {
      const { label, cls } = stateLabelAndBadge(m.state);
      const time           = timeAgo(m.write_date);
      const displayName    = m.shortdesc || m.name;
      return `<div class="module-item">
        <span class="module-badge ${cls}">${label}</span>
        <span class="module-name" title="${displayName} (${m.name})">${m.name}</span>
        <span class="module-time">${time}</span>
      </div>`;
    }).join("");

  } catch (err) {
    modulesCount.textContent = "!";
    modulesCount.className   = "modules-header-count warn";
    modulesBody.innerHTML    = `<div class="modules-loading" style="color:var(--red)">Error al conectar con Odoo.</div>`;
  }
}

/* ══════════════════════════════════════
   Carga inicial
══════════════════════════════════════ */
function loadAll() {
  getDomains((entries) => {
    getCompanies((companies) => {
      getLangs((langs) => {
        render(entries, companies, langs);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs.length) updateDetectionSections(tabs[0], entries);
        });
      });
    });
  });
  // Restaurar estado del botón modo cliente
  getClientMode((isActive) => applyClientModeUI(isActive));

  // Restaurar y cargar panel de módulos
  getShowModules((show) => {
    applyModulesVisibility(show);
    if (show) {
      // Esperar a que updateDetectionSections haya guardado el origin
      setTimeout(loadModules, 100);
    }
  });
}

loadTheme(loadAll);
