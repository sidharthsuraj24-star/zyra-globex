
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
  setTimeout(function () { el.classList.add("is-out"); }, 2600);
  setTimeout(finish, 3400);
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
  var heroContent = document.querySelector('.hero-content');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nativeScroll = window.CSS && CSS.supports('animation-timeline: scroll()');
  if (!document.querySelector('.scroll-progress')) {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
  }
  function markHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (!heroContent || reduce || nativeScroll) return;
    var p = Math.max(0, Math.min(1, window.scrollY / (window.innerHeight * 0.72)));
    heroContent.style.opacity = String(1 - p);
    heroContent.style.transform = 'translate3d(0,' + (-p * 70).toFixed(1) + 'px,0)';
  }
  markHeader();
  window.addEventListener('scroll', markHeader, { passive: true });

  var reel = document.querySelector('.reel-frame');
  if (reel && !reduce) {
    var shots = reel.querySelectorAll('img');
    var cap = reel.querySelector('.reel-caption');
    var reelIndex = 0;
    setInterval(function () {
      if (!shots.length) return;
      shots[reelIndex].classList.remove('is-on');
      reelIndex = (reelIndex + 1) % shots.length;
      shots[reelIndex].classList.add('is-on');
      if (cap) {
        cap.textContent = shots[reelIndex].getAttribute('data-title') || '';
        cap.setAttribute('href', shots[reelIndex].getAttribute('data-href') || '#');
      }
    }, 3800);
  }

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
        var y = (progress - 0.5) * Math.min(140, rect.height * 0.18);
        var centered = 1 - Math.min(1, Math.abs(rect.top + rect.height / 2 - view / 2) / view);
        var scale = 1.05 + centered * 0.14;
        img.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0) scale(' + scale.toFixed(3) + ')';
      });
      ticking = false;
    }
    if (photos.length && !nativeScroll) {
      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(drift);
      }, { passive: true });
      drift();
    }
  }

  document.querySelectorAll('.product-detail').forEach(function (block) {
    var imageBox = block.querySelector('.product-detail-image');
    var photo = imageBox && imageBox.querySelector('img');
    var heading = block.querySelector('h2');
    var blurb = block.querySelector('.desc');
    function openMain() {
      if (!photo || !heading) return;
      openSheet(photo.getAttribute('src'), heading.textContent, blurb ? blurb.textContent : '');
    }
    if (imageBox) imageBox.addEventListener('click', openMain);
    if (heading) heading.addEventListener('click', openMain);
    block.querySelectorAll('.snack-photos figure').forEach(function (fig) {
      fig.addEventListener('click', function (event) {
        event.stopPropagation();
        var im = fig.querySelector('img');
        var cap = fig.querySelector('figcaption');
        if (!im) return;
        openSheet(im.getAttribute('src'), cap ? cap.textContent : '', blurb ? blurb.textContent : '');
      });
    });
  });

  function openSheet(src, title, about) {
    var sheet = document.querySelector('.sheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.className = 'sheet';
      sheet.innerHTML = '<button type="button" class="sheet-scrim" aria-label="Close"></button><div class="sheet-card" role="dialog"><img alt=""><div><button type="button" class="sheet-close">Close</button><h3></h3><p class="sheet-about"></p><button type="button" class="sheet-add">Add to enquiry</button><p class="sheet-note" hidden>Added. Send it from Contact whenever you are ready.</p></div></div>';
      document.body.appendChild(sheet);
      sheet.querySelector('.sheet-scrim').addEventListener('click', closeSheet);
      sheet.querySelector('.sheet-close').addEventListener('click', closeSheet);
      sheet.querySelector('.sheet-add').addEventListener('click', function () {
        var name = sheet.querySelector('h3').textContent || '';
        var list = [];
        try { list = JSON.parse(sessionStorage.getItem('zyra-enquiry') || '[]'); } catch (e) {}
        if (list.indexOf(name) === -1) list.push(name);
        sessionStorage.setItem('zyra-enquiry', JSON.stringify(list));
        sheet.querySelector('.sheet-add').hidden = true;
        sheet.querySelector('.sheet-note').hidden = false;
      });
    }
    sheet.querySelector('img').setAttribute('src', src || '');
    sheet.querySelector('h3').textContent = title || '';
    sheet.querySelector('.sheet-about').textContent = about || '';
    sheet.querySelector('.sheet-add').hidden = false;
    sheet.querySelector('.sheet-note').hidden = true;
    sheet.classList.add('is-open');
  }
  function closeSheet() {
    var sheet = document.querySelector('.sheet');
    if (sheet) sheet.classList.remove('is-open');
  }

  const form = document.querySelector('form[name="inquiry"]');
  var savedEnquiry = [];
  try { savedEnquiry = JSON.parse(sessionStorage.getItem('zyra-enquiry') || '[]'); } catch (e) {}
  if (savedEnquiry.length && form) {
    var select = form.querySelector('#products');
    var message = form.querySelector('#message');
    if (select && savedEnquiry.length === 1) {
      var wanted = savedEnquiry[0];
      var matched = false;
      Array.prototype.forEach.call(select.options, function (option) {
        if (!matched && option.value && (option.value === wanted || option.text === wanted || wanted.indexOf(option.text) !== -1)) {
          select.value = option.value;
          matched = true;
        }
      });
      if (!matched) select.value = 'Multiple / Other';
    } else if (select) {
      select.value = 'Multiple / Other';
    }
    if (message && !message.value) message.value = 'Products of interest: ' + savedEnquiry.join(', ') + '\n';
  }
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
