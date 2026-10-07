const WINDOW_MS = 20000;
const MIN_FILL_MS = 1500;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

const lastByIp = globalThis.__zyraInquiryHits || (globalThis.__zyraInquiryHits = new Map());

function clip(value, max) {
  return String(value == null ? "" : value)
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

function readCookie(header, name) {
  const parts = String(header || "").split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) === name) return trimmed.slice(eq + 1);
  }
  return "";
}

module.exports = async function handler(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const type = String(req.headers["content-type"] || "");
  if (!type.includes("application/json")) {
    return res.status(415).json({ ok: false, error: "Rejected" });
  }

  const host = String(req.headers.host || "");
  const origin = String(req.headers.origin || "");
  if (origin) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {
      return res.status(403).json({ ok: false, error: "Rejected" });
    }
    if (originHost !== host) {
      return res.status(403).json({ ok: false, error: "Rejected" });
    }
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (String(body._honey || body["bot-field"] || "").trim()) {
    return res.status(200).json({ ok: true });
  }

  const now = Date.now();
  const started = Number(body._ts);
  if (!Number.isFinite(started) || now - started < MIN_FILL_MS || now - started > MAX_AGE_MS) {
    return res.status(400).json({ ok: false, error: "Please wait a moment and try again." });
  }

  const last = Number(readCookie(req.headers.cookie, "zyra_inq"));
  if (Number.isFinite(last) && now - last < WINDOW_MS) {
    return res.status(429).json({ ok: false, error: "Please wait a few seconds before sending another inquiry." });
  }

  const ip = String(req.headers["x-real-ip"] || "unknown");
  const seen = Number(lastByIp.get(ip) || 0);
  if (seen && now - seen < WINDOW_MS) {
    return res.status(429).json({ ok: false, error: "Please wait a few seconds before sending another inquiry." });
  }

  const name = clip(body.name, 80);
  const company = clip(body.company, 120);
  const email = clip(body.email, 120);
  const phone = clip(body.phone, 40);
  const country = clip(body.country, 80);
  const products = clip(body.products, 80);
  const message = clip(body.message, 2000);

  if (name.length < 2 || country.length < 2 || message.length < 8) {
    return res.status(400).json({ ok: false, error: "Please complete the required fields." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: "Please enter a valid email." });
  }

  try {
    const upstream = await fetch("https://formsubmit.co/ajax/contact.zyraglobex@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name,
        company,
        email,
        phone,
        country,
        products,
        message,
        _subject: "Zyra Globex website inquiry",
        _template: "table",
        _captcha: "false",
      }),
    });
    if (!upstream.ok) {
      return res.status(502).json({ ok: false, error: "Could not send right now. Please email us directly." });
    }
    lastByIp.set(ip, now);
    if (lastByIp.size > 1000) lastByIp.clear();
  } catch {
    return res.status(502).json({ ok: false, error: "Could not send right now. Please email us directly." });
  }

  res.setHeader("Set-Cookie", "zyra_inq=" + now + "; HttpOnly; Secure; SameSite=Strict; Max-Age=30; Path=/");
  return res.status(200).json({ ok: true });
};
