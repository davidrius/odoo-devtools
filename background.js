// background.js - OdooDevTools

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

function setHashParam(url, key, value) {
  try {
    const u      = new URL(url);
    const params = parseHash(url);
    params[key]  = value;
    delete params["_company_switching"];
    u.hash = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return u.toString();
  } catch { return url; }
}

function deleteHashParam(url, key) {
  try {
    const u      = new URL(url);
    const params = parseHash(url);
    delete params[key];
    delete params["_company_switching"];
    const entries = Object.entries(params);
    u.hash = entries.length
      ? entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")
      : "";
    return u.toString();
  } catch { return url; }
}

/* ══════════════════════════════════════
   Storage
══════════════════════════════════════ */
async function getStorage() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ domains: [], companies: [], clientMode: false }, resolve);
  });
}

/* ══════════════════════════════════════
   Matching
══════════════════════════════════════ */
function matchEntry(url, entries) {
  try {
    const { hostname, host } = new URL(url);
    return entries.find((e) => {
      const clean = e.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
      if (clean.includes(":")) return host === clean;
      return hostname === clean || hostname.endsWith("." + clean);
    }) || null;
  } catch { return null; }
}

function isLoginPage(url) {
  try {
    const { pathname } = new URL(url);
    return pathname === "/web/login" || pathname.startsWith("/web/login/");
  } catch { return true; }
}

function isCompanySwitching(url) {
  try {
    return parseHash(url)["_company_switching"] === "1";
  } catch { return false; }
}

function alreadyUpToDate(url, entry) {
  try {
    const searchParams = new URL(url).searchParams;
    const hashParams   = parseHash(url);
    const debugOk = searchParams.get("debug") === (entry.mode || "1");
    const langOk  = !entry.lang || searchParams.get("lang") === entry.lang;
    const cidsOk  = !entry.cid  || hashParams["cids"] === String(entry.cid);
    return debugOk && langOk && cidsOk;
  } catch { return false; }
}

function buildDebugUrl(url, entry) {
  let result = url;
  const u = new URL(result);
  u.searchParams.set("debug", entry.mode || "1");
  if (entry.lang) u.searchParams.set("lang", entry.lang);
  else            u.searchParams.delete("lang");
  result = u.toString();
  if (entry.cid) result = setHashParam(result, "cids", String(entry.cid));
  return result;
}

function getDebugUrl(url, entries) {
  if (!url.startsWith("http")) return null;
  if (isLoginPage(url)) return null;
  if (isCompanySwitching(url)) return null;
  if (!entries.length) return null;
  const entry = matchEntry(url, entries);
  if (!entry) return null;
  if (alreadyUpToDate(url, entry)) return null;
  return buildDebugUrl(url, entry);
}

/* ══════════════════════════════════════
   Badge
══════════════════════════════════════ */
async function updateBadge(tabId, url) {
  if (!url || !url.startsWith("http")) {
    chrome.action.setBadgeText({ text: "", tabId });
    return;
  }
  const { domains, clientMode } = await getStorage();

  // Modo cliente activo → badge gris con ojo
  if (clientMode) {
    const entry = matchEntry(url, domains);
    if (entry) {
      chrome.action.setBadgeText({ text: "👁", tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#f59e0b", tabId });
      return;
    }
  }

  const entry = matchEntry(url, domains);
  if (!entry) {
    chrome.action.setBadgeText({ text: "", tabId });
    return;
  }

  let debugVal = null;
  try { debugVal = new URL(url).searchParams.get("debug"); } catch {}

  if (debugVal === "1") {
    chrome.action.setBadgeText({ text: "1", tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#22c55e", tabId });
    chrome.action.setBadgeTextColor({ color: "#ffffff", tabId });
  } else if (debugVal === "assets") {
    chrome.action.setBadgeText({ text: "A", tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#f59e0b", tabId });
    chrome.action.setBadgeTextColor({ color: "#ffffff", tabId });
  } else {
    chrome.action.setBadgeText({ text: "·", tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#6b7280", tabId });
    chrome.action.setBadgeTextColor({ color: "#ffffff", tabId });
  }
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    updateBadge(tabId, tab.url || "");
  } catch {}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) updateBadge(tabId, changeInfo.url);
});

chrome.storage.onChanged.addListener(async (changes) => {
  if (!changes.domains && !changes.clientMode) return;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) updateBadge(tab.id, tab.url || "");
  } catch {}
});

/* ══════════════════════════════════════
   Navegación — respeta modo cliente
══════════════════════════════════════ */
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const { domains, clientMode } = await getStorage();
  if (clientMode) return; // no interceptar en modo cliente
  const debugUrl = getDebugUrl(details.url, domains);
  if (debugUrl) chrome.tabs.update(details.tabId, { url: debugUrl });
});

chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const qualifies =
    (details.transitionQualifiers && details.transitionQualifiers.includes("server_redirect")) ||
    details.transitionType === "form_submit";
  if (!qualifies) return;
  const { domains, clientMode } = await getStorage();
  if (clientMode) return; // no interceptar en modo cliente
  const debugUrl = getDebugUrl(details.url, domains);
  if (debugUrl) chrome.tabs.update(details.tabId, { url: debugUrl });
});

/* ══════════════════════════════════════
   Borrar action temporal creado por openModel
   El popup se cierra al navegar, así que el
   unlink lo ejecuta el background que permanece vivo
══════════════════════════════════════ */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "unlinkAction") return;
  const { origin, actionId } = msg;

  // Esperar a que Odoo haya cargado el action en cliente antes de borrarlo
  setTimeout(async () => {
    try {
      await fetch(`${origin}/web/dataset/call_kw`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          jsonrpc: "2.0", method: "call", id: 1,
          params: {
            model:  "ir.actions.act_window",
            method: "unlink",
            args:   [[actionId]],
            kwargs: {}
          }
        })
      });
    } catch {}
  }, 3000);
});
