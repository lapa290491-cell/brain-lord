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
  let spin = 0.003;
  let pulse = 0;
  const grey = { r: 0.35, g: 0.35, b: 0.36 };
  const red = { r: 0.85, g: 0.11, b: 0.11 };
  function fire(label) {
    spin = 0.028;
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
    log("EXECUTE · pending_approval · в сеть не ушло");
  });
  if (typeof THREE === "undefined") { log("three.js не загрузился"); return; }
  const wrap = document.getElementById("brain-container");
  const canvas = document.getElementById("brain");
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050505, 6.5, 14);
  const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
  cam.position.set(0, 0.15, 6.2);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false });
  renderer.setClearColor(0x050505);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  function resize() {
    const w = wrap.clientWidth || 1;
    const h = wrap.clientHeight || 1;
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener("resize", resize);
  resize();
  const root = new THREE.Group();
  scene.add(root);
  const N = 320;
  const pts = [];
  function lobe(side, count) {
    for (let i = 0; i < count; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const rr = Math.cbrt(Math.random());
      pts.push(new THREE.Vector3(
        side * 0.55 + rr * 1.15 * Math.sin(phi) * Math.cos(theta),
        rr * 0.85 * Math.cos(phi),
        rr * 0.95 * Math.sin(phi) * Math.sin(theta)
      ));
    }
  }
  lobe(-1, N / 2);
  lobe(1, N / 2);
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = pts[i].x; pos[i * 3 + 1] = pts[i].y; pos[i * 3 + 2] = pts[i].z; }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  root.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xf4f1ea, size: 0.035, sizeAttenuation: true })));
  const K = 2;
  const segs = [];
  const seen = {};
  for (let i = 0; i < N; i++) {
    const dist = [];
    for (let j = 0; j < N; j++) {
      if (i !== j) dist.push({ j: j, d: pts[i].distanceToSquared(pts[j]) });
    }
    dist.sort(function (a, b) { return a.d - b.d; });
    for (let k = 0; k < K; k++) {
      const j = dist[k].j;
      const key = i < j ? i + "-" + j : j + "-" + i;
      if (seen[key]) continue;
      seen[key] = 1;
      segs.push(i, j);
    }
  }
  const lpos = new Float32Array(segs.length * 3);
  for (let s = 0; s < segs.length; s++) {
    const p = pts[segs[s]];
    lpos[s * 3] = p.x; lpos[s * 3 + 1] = p.y; lpos[s * 3 + 2] = p.z;
  }
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute("position", new THREE.BufferAttribute(lpos, 3));
  const lMat = new THREE.LineBasicMaterial({ color: 0x5a5a5c, transparent: true, opacity: 0.32 });
  root.add(new THREE.LineSegments(lGeo, lMat));
  let drag = false, lx = 0, ly = 0;
  canvas.addEventListener("pointerdown", function (e) {
    drag = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!drag) return;
    root.rotation.y += (e.clientX - lx) * 0.005;
    root.rotation.x = Math.max(-0.7, Math.min(0.7, root.rotation.x + (e.clientY - ly) * 0.004));
    lx = e.clientX; ly = e.clientY;
  });
  canvas.addEventListener("pointerup", function () { drag = false; });
  function tick() {
    requestAnimationFrame(tick);
    if (!drag) root.rotation.y += spin;
    spin += (0.003 - spin) * 0.04;
    pulse *= 0.96;
    const t = 0.5 + 0.5 * Math.sin(performance.now() * 0.0025);
    const mix = Math.max(pulse, t * 0.25);
    lMat.color.setRGB(grey.r + (red.r - grey.r) * mix, grey.g + (red.g - grey.g) * mix, grey.b + (red.b - grey.b) * mix);
    lMat.opacity = 0.22 + mix * 0.45;
    renderer.render(scene, cam);
  }
  tick();
  log("three.js · " + N + " узлов · паутина");
})();
