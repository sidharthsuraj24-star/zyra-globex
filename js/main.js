
(function () {
  var el = document.getElementById("opening");
  if (!el || document.documentElement.classList.contains("skip-open")) {
    if (el) el.remove();
    return;
  }
  document.body.classList.add("opening-lock");
  function finish() {
    try { sessionStorage.setItem("zyra-open-white", "1"); } catch (e) {}
    el.remove();
    document.body.classList.remove("opening-lock");
  }
  var skip = document.getElementById("opening-skip");
  if (skip) skip.addEventListener("click", finish);
  setTimeout(function () { el.classList.add("is-out"); }, 4800);
  setTimeout(finish, 6000);
})();

document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.classList.remove('open');
      });
    });
  }

  const form = document.querySelector('form[name="inquiry"]');
  if (!form) return;
  const readyAt = Date.now();
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const data = new FormData(form);
    if (String(data.get('_honey') || data.get('bot-field') || '').trim()) return;
    const noteBox = form.querySelector('.form-note');
    function showNote(text) {
      let note = noteBox;
      if (!note) {
        note = document.createElement('p');
        note.className = 'form-note';
        form.appendChild(note);
      }
      note.textContent = text;
    }
    if (Date.now() - readyAt < 1500) {
      showNote('Please wait a moment and try again.');
      return;
    }
    const payload = {
      name: String(data.get('name') || '').slice(0, 80),
      company: String(data.get('company') || '').slice(0, 120),
      email: String(data.get('email') || '').slice(0, 120),
      phone: String(data.get('phone') || '').slice(0, 40),
      country: String(data.get('country') || '').slice(0, 80),
      products: String(data.get('products') || '').slice(0, 80),
      message: String(data.get('message') || '').slice(0, 2000),
      _honey: '',
      _ts: readyAt
    };
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json().catch(function () { return {}; });
      if (!res.ok) throw new Error(result.error || 'send failed');
      form.reset();
      showNote('Inquiry sent. We usually respond within 1 business day.');
      if (btn) { btn.textContent = 'Send Inquiry'; btn.disabled = false; }
    } catch (err) {
      const body = [
        'Name: ' + payload.name,
        'Company: ' + payload.company,
        'Email: ' + payload.email,
        'Phone: ' + payload.phone,
        'Country: ' + payload.country,
        'Products: ' + payload.products,
        '',
        payload.message
      ].join('\n');
      window.location.href = 'mailto:contact.zyraglobex@gmail.com?subject=' + encodeURIComponent('Zyra Globex website inquiry') + '&body=' + encodeURIComponent(body);
      showNote(err && err.message && err.message !== 'send failed' ? err.message : 'Your email app should open with this inquiry.');
      if (btn) { btn.textContent = 'Send Inquiry'; btn.disabled = false; }
    }
  });
});
