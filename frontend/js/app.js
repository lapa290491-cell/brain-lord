(function () {
  const clans = {
    pm: "CPO · QA · очередь апрува",
    mass: "Инженер масс · нейропсихолог · шоураннер",
    info: "Трикстер · повестка · антикризис",
    osint: "Открытые источники · фильтр версий"
  };
  const tones = ["холод", "сухо", "нейтраль", "тепло", "удар"];
  const logEl = document.getElementById("log");
  const hudPick = document.getElementById("hud-pick");
  const note = document.getElementById("clan-note");
  function log(s) {
    const t = new Date().toLocaleTimeString("ru-RU", { hour12: false });
    logEl.textContent = t + "  " + s + "\n" + logEl.textContent;
  }
  let spin = 0.004;
  let pulse = 0;
  function fire(label) {
    spin = 0.04;
    pulse = 1;
    if (hudPick) hudPick.textContent = "ИМПУЛЬС: " + label;
    log("импульс · " + label);
  }
  document.querySelectorAll(".tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (b) { b.classList.remove("on"); });
      btn.classList.add("on");
      note.textContent = clans[btn.dataset.clan] || "";
      fire(btn.textContent.trim());
    });
  });
  document.getElementById("prov").addEventListener("input", function (e) {
    document.getElementById("v-prov").textContent = e.target.value;
  });
  document.getElementById("tone").addEventListener("input", function (e) {
    document.getElementById("v-tone").textContent = tones[Math.min(4, Math.floor(e.target.value / 21))];
  });
  document.getElementById("execute").addEventListener("click", function () {
    const p = document.getElementById("prov").value;
    const tone = document.getElementById("v-tone").textContent;
    document.getElementById("k-osint").textContent = "бриф принят";
    document.getElementById("k-hyp").textContent = "декомпозиция CPO";
    document.getElementById("k-cnt").textContent = "черновик в очереди";
    document.getElementById("k-ok").textContent = "pending_approval · " + p + " · " + tone;
    fire("EXECUTE");
    log("EXECUTE · в сеть не ушло");
  });
  const N = 220;
  const pts = [];
  function lobe(side, count) {
    for (let i = 0; i < count; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const rr = Math.cbrt(Math.random());
      pts.push({
        x: side * 0.55 + rr * 1.15 * Math.sin(phi) * Math.cos(theta),
        y: rr * 0.82 * Math.cos(phi),
        z: rr * 0.92 * Math.sin(phi) * Math.sin(theta)
      });
    }
  }
  lobe(-1, N / 2); lobe(1, N / 2);
  const edges = [];
  const seen = {};
  for (let i = 0; i < N; i++) {
    let b1 = -1, b2 = -1, d1 = 99, d2 = 99;
    for (let j = 0; j < N; j++) {
      if (i === j) continue;
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dz = pts[i].z - pts[j].z;
      const d = dx * dx + dy * dy + dz * dz;
      if (d < d1) { d2 = d1; b2 = b1; d1 = d; b1 = j; }
      else if (d < d2) { d2 = d; b2 = j; }
    }
    [b1, b2].forEach(function (j) {
      if (j < 0) return;
      const a = i < j ? i : j, b = i < j ? j : i, key = a + "-" + b;
      if (!seen[key]) { seen[key] = 1; edges.push([a, b]); }
    });
  }
  const wrap = document.getElementById("brain-container");
  const cv = document.getElementById("brain");
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, rotY = 0.4, rotX = 0.18, drag = false, lx = 0, ly = 0;
  function resize() {
    const r = wrap.getBoundingClientRect();
    const d = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    cv.width = W * d; cv.height = H * d;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  window.addEventListener("resize", resize); resize();
  function proj(p) {
    const cy = Math.cos(rotY), sy = Math.sin(rotY);
    const cx = Math.cos(rotX), sx = Math.sin(rotX);
    const x1 = p.x * cy - p.z * sy;
    const z1 = p.x * sy + p.z * cy;
    const y1 = p.y * cx - z1 * sx;
    const z2 = p.y * sx + z1 * cx;
    const f = Math.min(W, H) * 0.46 / (2.6 + z2);
    return { x: W * 0.5 + x1 * f, y: H * 0.52 + y1 * f };
  }
  cv.addEventListener("pointerdown", function (e) {
    drag = true; lx = e.clientX; ly = e.clientY; cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener("pointermove", function (e) {
    if (!drag) return;
    rotY += (e.clientX - lx) * 0.008;
    rotX = Math.max(-1, Math.min(1, rotX + (e.clientY - ly) * 0.006));
    lx = e.clientX; ly = e.clientY;
  });
  cv.addEventListener("pointerup", function () { drag = false; });
  function tick() {
    requestAnimationFrame(tick);
    if (!drag) rotY += spin;
    spin += (0.004 - spin) * 0.05;
    pulse *= 0.96;
    const wave = 0.5 + 0.5 * Math.sin(performance.now() * 0.0024);
    const mix = Math.max(pulse, wave * 0.28);
    ctx.fillStyle = "#050505"; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H / 2, 8, W / 2, H / 2, Math.max(W, H) * 0.55);
    g.addColorStop(0, "#160808"); g.addColorStop(1, "#050505");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const P = pts.map(proj);
    ctx.strokeStyle = "rgba(" + Math.floor(90 + 125 * mix) + "," + Math.floor(90 - 70 * mix) + "," + Math.floor(92 - 70 * mix) + "," + (0.18 + mix * 0.45) + ")";
    ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < edges.length; i++) {
      const a = P[edges[i][0]], b = P[edges[i][1]];
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    ctx.fillStyle = "#f4f1ea";
    for (let i = 0; i < N; i++) { ctx.beginPath(); ctx.arc(P[i].x, P[i].y, 1.35, 0, 6.3); ctx.fill(); }
  }
  tick();
  log("мозг без CDN · " + N + " узлов");
})();
