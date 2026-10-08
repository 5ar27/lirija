function initializeLirija(frameUrls) {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = () => innerWidth <= 900;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const win = (a, b, x) => ease(clamp((x - a) / (b - a)));
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  let vw = innerWidth, vh = innerHeight;

  /* smooth scroll */
  let lenis = null;
  if (!reduce && window.Lenis) { try { lenis = new Lenis({ lerp: 0.08, smoothWheel: true }); } catch (e) {} }
  const menu = $('#menu'), menuBtn = $('#menuBtn');
  function openMenu() { menu.classList.add('open'); menuBtn.setAttribute('aria-expanded', 'true'); lenis && lenis.stop(); }
  function closeMenu() { if (!menu.classList.contains('open')) return; menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); lenis && lenis.start(); }
  menuBtn.addEventListener('click', openMenu);
  $('#menuClose').addEventListener('click', closeMenu);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href')); if (!t) return;
    e.preventDefault(); closeMenu();
    lenis ? lenis.scrollTo(t, { duration: 1.8 }) : t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* gown frame sequence */
  const N = frameUrls.length, frames = new Array(N), ok = new Uint8Array(N);
  const canvas = $('#gownCanvas'), ctx = canvas.getContext('2d'), frameBox = $('#gownFrame');
  let loaded = 0, drawn = -1, disposed = false;
  const order = Array.from({ length: N }, (_, i) => i);
  const NEED = N;
  let qi = 0;
  function load(i) {
    const im = new Image(); im.decoding = 'async';
    im.onload = async () => {
      let decoded = im;
      if (typeof createImageBitmap === 'function') {
        try {
          const width = Math.min(im.naturalWidth, small() ? 540 : 810);
          decoded = await createImageBitmap(im, { resizeWidth: width, resizeHeight: Math.round(im.naturalHeight * width / im.naturalWidth), resizeQuality: 'high' });
        } catch { /* Keep the decoded image on browsers without resize support. */ }
      }
      if (disposed) { decoded.close?.(); return; }
      frames[i] = decoded; ok[i] = 1; loaded++;
      if (i === 0) { size(); draw(0, true); frameBox.classList.add('ready'); }
      progress(); pump();
    };
    im.onerror = () => { if (!disposed) pump(); };
    im.src = frameUrls[i];
  }
  function pump() { if (!disposed && qi < order.length) load(order[qi++]); }
  for (let k = 0; k < Math.min(6, N); k++) pump();
  function size() { const r = frameBox.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, small() ? 1.5 : 1.75); const scale = Math.min(dpr, 1800 / r.width, Math.sqrt(1800000 / (r.width * r.height))); canvas.width = Math.round(r.width * scale); canvas.height = Math.round(r.height * scale); drawn = -1; }
  function draw(i, force) {
    const position = clamp(i, 0, N - 1);
    const lo = Math.floor(position), hi = Math.min(N - 1, lo + 1);
    // Never leap to a distant frame while neighboring frames are still decoding.
    if (!ok[lo] || !ok[hi]) return;
    const fraction = reduce ? 0 : Math.round((position - lo) * 256) / 256;
    const key = lo + fraction;
    if (key === drawn && !force) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    function paint(image, opacity) {
      const iw = image.naturalWidth || image.width, ih = image.naturalHeight || image.height;
      const ratio = Math.min(w / iw, h / ih);
      const imageWidth = iw * ratio, imageHeight = ih * ratio;
      const x = (w - imageWidth) / 2, y = (h - imageHeight) / 2;
      ctx.globalAlpha = opacity;
      if (y > 0) {
        ctx.drawImage(image, 0, 0, iw, 1, x, 0, imageWidth, y + 1);
        ctx.drawImage(image, 0, ih - 1, iw, 1, x, y + imageHeight - 1, imageWidth, y + 1);
      }
      if (x > 0) {
        ctx.drawImage(image, 0, 0, 1, ih, 0, y, x + 1, imageHeight);
        ctx.drawImage(image, iw - 1, 0, 1, ih, x + imageWidth - 1, y, x + 1, imageHeight);
      }
      ctx.drawImage(image, x, y, imageWidth, imageHeight);
    }
    paint(frames[lo], 1);
    if (fraction > 0) paint(frames[hi], fraction);
    ctx.globalAlpha = 1;
    canvas.dataset.frame = key.toFixed(3);
    drawn = key;
  }

  /* loader */
  const intro = $('#intro'), pct = $('#introPct'); const t0 = performance.now(); let done = false;
  function progress() {
    const v = clamp(loaded / NEED); pct.textContent = Math.round(v * 100) + '%'; intro.style.setProperty('--load', v);
    if (v >= 1) finish();
  }
  function finish() {
    if (done) return; done = true;
    const wait = Math.max(0, 2400 - (performance.now() - t0));
    setTimeout(() => { pct.textContent = '100%'; intro.classList.add('done'); root.classList.add('loaded'); revealVisible(); }, wait);
  }
  setTimeout(finish, 5200);

  /* headline line reveals */
  const reveals = $$('.reveal');
  function revealVisible() { reveals.forEach(el => { if (el.getBoundingClientRect().top < vh) el.classList.add('in'); }); }
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && root.classList.contains('loaded')) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
    reveals.forEach(el => io.observe(el));
    const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('wait'); io2.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.rv').forEach(el => { if (el.getBoundingClientRect().top > vh) { el.classList.add('wait'); io2.observe(el); } });
  } else reveals.forEach(el => el.classList.add('in'));

  /* testimonials: split words */
  $$('.q blockquote').forEach(bq => { const w = bq.textContent.trim().split(/\s+/); bq.innerHTML = w.map((x, i) => `<span class="wd" style="transition-delay:${(i * .035).toFixed(3)}s">${x}</span>`).join(' '); });

  /* elements */
  const titleIn = $('#titleIn'), title = $('.title');
  const gown = $('.gown'), words = $('#gownWords');
  const wipe = $('.wipe'), wimgs = $$('.wipe-img'), wdots = $$('.wipe-dots i'), cap = $('#wipeCap'), capSpans = [...cap.children];
  const houses = $$('.house'), hmImgs = $$('#hmSticky img');
  const zoom = $('.zoom'), zs = $$('.z'), zScale = [4, 5, 6, 5, 6, 8, 9], zoomCap = $('#zoomCap'), zoomShade = $('#zoomShade');
  const wordsSec = $('.words'), wrows = $$('.wrow'), seal = $('#seal');
  const par = $$('[data-speed]'), mega = $('#mega');

  function layout() { vw = innerWidth; vh = innerHeight; if (ok[0]) { size(); draw(drawn < 0 ? 0 : drawn, true); } }
  let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(layout, 150); });
  const prog = el => { const r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - vh)); };

  let animationId = 0;
  function frame(t) {
    // Preserve the site's easing elsewhere, but do not ease scroll twice in the gown scene.
    const gownRect = gown.getBoundingClientRect();
    if (lenis) {
      const direct = gownRect.top < vh && gownRect.bottom > 0;
      // Lenis uses exponential damping even at lerp=1; zero takes its immediate branch.
      lenis.options.lerp = direct ? 0 : .08;
      if (direct && lenis.animate.isRunning && !lenis.animate.duration) lenis.animate.lerp = 0;
    }
    lenis && lenis.raf(t);

    // title card drifts away
    const tr = title.getBoundingClientRect();
    if (tr.bottom > 0) { const k = clamp(-tr.top / vh); titleIn.style.transform = `translate3d(0,${k * 30}vh,0)`; titleIn.style.opacity = (1 - k * 1.4).toFixed(3); }

    // gown: rises into the frame, turns a full 360 with the scroll
    const gr = gown.getBoundingClientRect();
    if (gr.top < vh && gr.bottom > 0) {
      const p = clamp(-gr.top / (gr.height - vh));
      const enter = clamp((vh - gr.top) / vh);              // 0 when the section starts entering, 1 when pinned
      const target = p * (N - 1);
      // Fractional adjacent-frame blending supplies continuity without a playback timer.
      draw(enter < 1 ? 0 : target);
      const rise = 1 - easeIO(clamp(p / 0.2));
      frameBox.style.transform = `translate3d(-50%,${(rise * (small() ? 38 : 58)).toFixed(2)}vh,0) scale(${(1 + 0.05 * ease(p)).toFixed(4)})`;
      const a = win(0.48, 0.6, p);
      words.style.opacity = a.toFixed(3);
      words.style.transform = `translate3d(0,${((1 - a) * 50 - p * 40).toFixed(1)}px,0)`;
    }

    // wipe scene
    const wr = wipe.getBoundingClientRect();
    if (wr.top < vh && wr.bottom > 0) {
      const p = clamp(-wr.top / (wr.height - vh));
      const t1 = easeIO(clamp((p - 0.16) / 0.3)), t2 = easeIO(clamp((p - 0.58) / 0.3));
      wimgs[1].style.clipPath = `inset(0 0 0 ${((1 - t1) * 100).toFixed(2)}%)`;
      wimgs[2].style.clipPath = `inset(0 0 0 ${((1 - t2) * 100).toFixed(2)}%)`;
      wimgs.forEach((w, i) => { const own = i === 0 ? 1 : i === 1 ? t1 : t2; w.firstElementChild.style.transform = `scale(${(1.12 - 0.12 * own).toFixed(4)})`; });
      const f = t1 + t2, idx = f > 1.5 ? 2 : f > .5 ? 1 : 0;
      capSpans.forEach((s, i) => s.classList.toggle('on', i === idx));
      wdots.forEach((d, i) => d.classList.toggle('on', i === idx));
      const c = capSpans.map(s => s.offsetLeft + s.offsetWidth / 2);
      const lo = Math.floor(f), hi = Math.min(2, lo + 1), fr = f - lo;
      const centre = c[lo] + (c[hi] - c[lo]) * fr;
      cap.style.transform = `translate3d(${(vw / 2 - centre).toFixed(1)}px,0,0)`;
    }

    // houses: sticky image follows the active house
    if (!small()) {
      let best = 0, bd = 1e9;
      houses.forEach((h, i) => { const r = h.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - vh / 2); if (d < bd) { bd = d; best = i; } });
      hmImgs.forEach((im, i) => im.classList.toggle('on', i === best));
    }

    // gallery zoom
    const zr = zoom.getBoundingClientRect();
    if (zr.top < vh && zr.bottom > 0) {
      const p = clamp(-zr.top / (zr.height - vh)), e = ease(clamp(p / .8));
      zs.forEach((z, i) => z.style.transform = `scale(${(1 + (zScale[i] - 1) * e).toFixed(4)})`);
      const c = win(.74, .92, p); zoomCap.style.opacity = c.toFixed(3); zoomShade.style.opacity = c.toFixed(3); zoomCap.style.transform = `translateY(${(1 - c) * 40}px)`;
    }

    // word rows slide against each other
    const sr = wordsSec.getBoundingClientRect();
    if (sr.top < vh && sr.bottom > 0 && !reduce) {
      const p = clamp((vh - sr.top) / (vh + sr.height));
      wrows.forEach((r, i) => { const d = +r.dataset.dir; r.style.transform = `translate3d(${(d * (p - .5) * vw * .7 - vw * .35).toFixed(1)}px,0,0)`; });
      seal.style.setProperty('--r', (p * 160 - 80).toFixed(1) + 'deg');
    }

    // parallax
    if (!reduce) par.forEach(el => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) return; const c = r.top + r.height / 2 - vh / 2; el.style.transform = `translate3d(0,${(c * parseFloat(el.dataset.speed)).toFixed(1)}px,0)`; });

    const mr = mega.getBoundingClientRect();
    if (mr.top < vh && !reduce) { const p = clamp((vh - mr.top) / (vh * .7)); mega.style.transform = `translateY(${(1 - ease(p)) * 30}%)`; }

    animationId = requestAnimationFrame(frame);
  }
  animationId = requestAnimationFrame(frame);

  /* testimonials */
  const qs = $$('.q'), qCount = $('#qCount'); let qn = 0, qT;
  function showQ(i) { qn = (i + qs.length) % qs.length; qs.forEach((q, k) => q.classList.toggle('on', k === qn)); qCount.textContent = `${qn + 1} / ${qs.length}`; }
  function auto() { clearInterval(qT); if (!reduce) qT = setInterval(() => showQ(qn + 1), 7000); }
  $('#qPrev').addEventListener('click', () => { showQ(qn - 1); auto(); });
  $('#qNext').addEventListener('click', () => { showQ(qn + 1); auto(); });
  auto();

  /* booking form */
  const form = $('#form'), btn = $('#submitBtn');
  const today = new Date(); today.setHours(0, 0, 0, 0); $('#date').min = today.toISOString().slice(0, 10);
  function setErr(id, msg) { $('#f-' + id).classList.toggle('bad', !!msg); $('#e-' + id).textContent = msg || ''; const inp = $('#' + id); msg ? inp.setAttribute('aria-invalid', 'true') : inp.removeAttribute('aria-invalid'); inp.setAttribute('aria-describedby', 'e-' + id); }
  function validate() {
    const name = $('#name').value.trim(), phone = $('#phone').value.replace(/\D/g, ''), date = $('#date').value, day = $('#day').value, e = {};
    if (name.length < 3) e.name = 'Upišite ime i prezime.';
    if (phone.length < 8) e.phone = 'Upišite broj telefona, npr. 064 123 4567.';
    if (!date) e.date = 'Izaberite datum venčanja.'; else if (new Date(date) < today) e.date = 'Datum venčanja ne može biti u prošlosti.';
    if (!day) e.day = 'Izaberite kada vam odgovara proba.';
    ['name', 'phone', 'date', 'day'].forEach(k => setErr(k, e[k])); return Object.keys(e);
  }
  form.addEventListener('submit', ev => {
    ev.preventDefault(); const bad = validate(); if (bad.length) { $('#' + bad[0]).focus(); return; }
    btn.setAttribute('aria-busy', 'true'); btn.querySelector('.lbl').textContent = 'Šaljemo...';
    setTimeout(() => {
      btn.removeAttribute('aria-busy'); btn.querySelector('.lbl').innerHTML = 'Pošaljite <em>zahtev</em>';
      $('#sentTitle').textContent = `Hvala, ${$('#name').value.trim().split(' ')[0]}!`;
      $('#formBody').style.display = 'none'; $('#sent').hidden = false;
    }, 1100);
  });
  $('#again').addEventListener('click', () => { form.reset(); $('#sent').hidden = true; $('#formBody').style.display = 'grid'; });

  /* copy phone */
  $('#copyPhone').addEventListener('click', () => {
    const b = $('#copyPhone'), txt = $('#phoneTxt').textContent;
    const okMsg = () => { b.textContent = 'kopirano'; setTimeout(() => b.textContent = 'kopiraj broj', 1800); };
    const sel = () => { const r = document.createRange(); r.selectNodeContents($('#phoneTxt')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'označeno, kopirajte'; };
    try { navigator.clipboard.writeText(txt).then(okMsg, sel); } catch (e) { sel(); }
  });
  return () => { disposed = true; cancelAnimationFrame(animationId); clearInterval(qT); lenis?.destroy(); frames.forEach(image => image?.close?.()); };
}
