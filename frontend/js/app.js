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
  document.querySelectorAll(".tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (b) { b.classList.remove("on"); });
      btn.classList.add("on");
      note.textContent = clans[btn.dataset.clan] || "";
      log("клан " + btn.textContent.trim());
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
    log("EXECUTE · в очередь · в сеть не ушло");
  });
  const labels = ["LORD", "CPO", "OSINT", "МАСС", "PR", "QA", "ШОУ"];
  const nodes = labels.map(function (n, i) {
    if (!i) return { n: n, x: 0, y: 0, z: 0, hot: 0 };
    const phi = Math.acos(-1 + (2 * (i - 1) + 1) / (labels.length - 1));
    const th = Math.PI * (1 + Math.sqrt(5)) * (i - 1);
    return { n: n, x: Math.sin(phi) * Math.cos(th), y: Math.cos(phi) * 0.85, z: Math.sin(phi) * Math.sin(th), hot: 0 };
  });
  const cv = document.getElementById("brain");
  const ctx = cv.getContext("2d");
  let W, H, rotY = 0.6, rotX = 0.2, dY = 0.6, dX = 0.2, drag = false, lx = 0, ly = 0, moved = 0;
  function resize() {
    const r = cv.parentElement.getBoundingClientRect();
    const d = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = W * d; cv.height = H * d;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  addEventListener("resize", resize); resize();
  function proj(p) {
    const cy = Math.cos(rotY), sy = Math.sin(rotY);
    const cx = Math.cos(rotX), sx = Math.sin(rotX);
    const x1 = p.x * cy - p.z * sy;
    const z1 = p.x * sy + p.z * cy;
    const y1 = p.y * cx - z1 * sx;
    const z2 = p.y * sx + z1 * cx;
    const f = Math.min(W, H) * 0.42 / (2.4 + z2);
    return { x: W / 2 + x1 * f, y: H / 2 + y1 * f, z: z2 };
  }
  cv.addEventListener("pointerdown", function (e) {
    drag = true; moved = 0; lx = e.clientX; ly = e.clientY; cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener("pointermove", function (e) {
    if (!drag) return;
    dY += (e.clientX - lx) * 0.008;
    dX = Math.max(-1.1, Math.min(1.1, dX + (e.clientY - ly) * 0.006));
    moved += Math.abs(e.clientX - lx) + Math.abs(e.clientY - ly);
    lx = e.clientX; ly = e.clientY;
  });
  cv.addEventListener("pointerup", function (e) {
    drag = false;
    if (moved > 12) return;
    const r = cv.getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    let best = null, bd = 28;
    nodes.forEach(function (n) {
      const p = proj(n);
      const d = Math.hypot(p.x - px, p.y - py);
      if (d < bd) { bd = d; best = n; }
    });
    if (best) { best.hot = 1; hudPick.textContent = "УЗЕЛ: " + best.n; log("узел " + best.n); }
  });
  function tick() {
    requestAnimationFrame(tick);
    rotY += (dY - rotY) * 0.1;
    rotX += (dX - rotX) * 0.1;
    if (!drag) dY += 0.003;
    ctx.fillStyle = "#050505"; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H) * 0.55);
    g.addColorStop(0, "#140808"); g.addColorStop(1, "#050505");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 1; i < nodes.length; i++) {
      const a = proj(nodes[0]), b = proj(nodes[i]);
      const heat = Math.max(nodes[0].hot, nodes[i].hot);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = "#d91b1b"; ctx.globalAlpha = 0.22 + heat * 0.55; ctx.lineWidth = 1 + heat * 2; ctx.stroke(); ctx.globalAlpha = 1;
    }
    nodes.map(function (n) { return { n: n, p: proj(n) }; }).sort(function (a, b) { return a.p.z - b.p.z; }).forEach(function (o) {
      o.n.hot *= 0.96;
      const rad = (o.n.n === "LORD" ? 8 : 5) + o.n.hot * 4;
      ctx.beginPath(); ctx.arc(o.p.x, o.p.y, rad, 0, 6.3);
      ctx.fillStyle = "#050505"; ctx.fill();
      ctx.strokeStyle = "#d91b1b"; ctx.shadowColor = "#d91b1b"; ctx.shadowBlur = 10 + o.n.hot * 16; ctx.lineWidth = 1.6; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = "#f3f1ea"; ctx.font = "600 10px Inter, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(o.n.n, o.p.x, o.p.y + rad + 12);
    });
  }
  tick();
  log("радар поднят");
})();
