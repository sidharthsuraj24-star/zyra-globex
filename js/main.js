
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

  var header = document.querySelector('.header');
  function markHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  markHeader();
  window.addEventListener('scroll', markHeader, { passive: true });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nodes = document.querySelectorAll('.section, .chapter, .product-detail, .page-hero');
  if (!reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(function (node) {
      node.classList.add('reveal');
      io.observe(node);
    });
    var photos = document.querySelectorAll('.chapter-photo img');
    var ticking = false;
    function drift() {
      var view = window.innerHeight || 800;
      photos.forEach(function (img) {
        var parent = img.parentElement;
        if (!parent) return;
        var rect = parent.getBoundingClientRect();
        var progress = (view - rect.top) / (view + rect.height);
        progress = Math.max(0, Math.min(1, progress));
        var y = (progress - 0.5) * 28;
        img.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0) scale(1.06)';
      });
      ticking = false;
    }
    if (photos.length) {
      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(drift);
      }, { passive: true });
      drift();
    }
  }

  const form = document.querySelector('form[name="inquiry"]');
  if (!form) return;
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const data = new FormData(form);
    if (String(data.get('bot-field') || data.get('_honey') || '').trim()) return;
    const payload = {
      name: data.get('name') || '',
      company: data.get('company') || '',
      email: data.get('email') || '',
      phone: data.get('phone') || '',
      country: data.get('country') || '',
      products: data.get('products') || '',
      message: data.get('message') || '',
      _subject: 'Zyra Globex website inquiry',
      _template: 'table',
      _captcha: 'false'
    };
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
    try {
      const res = await fetch('https://formsubmit.co/ajax/contact.zyraglobex@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('send failed');
      form.reset();
      const note = document.createElement('p');
      note.className = 'form-note';
      note.textContent = 'Inquiry sent. We usually respond within 1 business day.';
      form.appendChild(note);
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
      if (btn) { btn.textContent = 'Send Inquiry'; btn.disabled = false; }
    }
  });
});
