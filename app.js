import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.128.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030617);
scene.fog = new THREE.FogExp2(0x030617, 0.0055);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5.2, 2.8, 4.2);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.target.set(0, 0, 0);

scene.add(new THREE.AmbientLight(0x2c2e4a));
const mainLight = new THREE.DirectionalLight(0xfff5e0, 1.15);
mainLight.position.set(2, 3, 5);
scene.add(mainLight);
const fillLight = new THREE.PointLight(0x4477cc, 0.3);
fillLight.position.set(1.5, 2, 2);
scene.add(fillLight);
const rimLight = new THREE.PointLight(0xffaa66, 0.35);
rimLight.position.set(-2, 1, -3);
scene.add(rimLight);

function addAxisArrow(dir, origin, color, length = 3.5) {
  scene.add(new THREE.ArrowHelper(new THREE.Vector3(dir.x, dir.y, dir.z).normalize(), origin, length, color, 0.25, 0.15));
}
function createTextLabel(text, position, color = "#ffffff") {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = color;
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 256);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }));
  sprite.scale.set(1, 1, 1);
  sprite.position.copy(position);
  scene.add(sprite);
  return sprite;
}
function createEmojiSprite(emoji, position, size, font = 220) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);
  ctx.font = `${font}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(size, size, size);
  sprite.position.copy(position);
  scene.add(sprite);
  return sprite;
}
function createEarthGlobe() {
  const group = new THREE.Group();
  const radius = 1.18;

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 72, 72),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1,
      metalness: 0,
      map: createEarthTexture(),
      emissive: 0x06111f,
      emissiveIntensity: 0.18
    })
  );
  group.add(sphere);

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.015, 72, 72),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      alphaMap: createCloudTexture(),
      depthWrite: false
    })
  );
  group.add(clouds);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.06, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x4aa3ff, transparent: true, opacity: 0.08, side: THREE.BackSide })
  );
  group.add(atmosphere);

  group.scale.setScalar(0.57);
  scene.add(group);
  return { group, sphere, clouds };
}
function createEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0a1f47');
  gradient.addColorStop(0.35, '#114c86');
  gradient.addColorStop(0.7, '#0e5c92');
  gradient.addColorStop(1, '#081735');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0f4f84';
  for (let y = 0; y < canvas.height; y += 8) {
    const alpha = 0.03 + 0.02 * Math.sin(y * 0.03);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(0, y, canvas.width, 2);
  }
  drawLandMasses(ctx);
  drawIceCaps(ctx);
  drawDeserts(ctx);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
function createCloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255,255,255,0.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 260; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const w = 80 + Math.random() * 220;
    const h = 20 + Math.random() * 70;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w, h));
    grad.addColorStop(0, 'rgba(255,255,255,0.95)');
    grad.addColorStop(1, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
function drawLandMasses(ctx) {
  const continents = [
    [[0.10,0.24],[0.15,0.17],[0.23,0.18],[0.30,0.24],[0.28,0.31],[0.20,0.34],[0.12,0.30]],
    [[0.32,0.22],[0.38,0.18],[0.47,0.20],[0.50,0.28],[0.46,0.36],[0.36,0.35],[0.30,0.28]],
    [[0.54,0.17],[0.64,0.15],[0.71,0.21],[0.68,0.29],[0.58,0.28]],
    [[0.76,0.36],[0.86,0.37],[0.92,0.45],[0.90,0.55],[0.82,0.58],[0.74,0.49]],
    [[0.15,0.56],[0.22,0.52],[0.29,0.56],[0.28,0.66],[0.20,0.69],[0.13,0.64]],
    [[0.36,0.57],[0.45,0.55],[0.52,0.61],[0.49,0.71],[0.40,0.73],[0.34,0.66]],
    [[0.56,0.63],[0.63,0.58],[0.71,0.61],[0.72,0.70],[0.65,0.77],[0.58,0.73]]
  ];
  ctx.fillStyle = '#2f8f49';
  continents.forEach((points, idx) => {
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = p[0] * ctx.canvas.width;
      const y = p[1] * ctx.canvas.height;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = idx % 2 === 0 ? '#23643a' : '#357d44';
    ctx.fill();
    ctx.fillStyle = '#2f8f49';
  });
}
function drawIceCaps(ctx) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const north = ctx.createLinearGradient(0, 0, 0, h * 0.18);
  north.addColorStop(0, 'rgba(255,255,255,0.95)');
  north.addColorStop(1, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = north;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.06, w * 0.48, h * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  const south = ctx.createLinearGradient(0, h, 0, h * 0.82);
  south.addColorStop(0, 'rgba(255,255,255,0.95)');
  south.addColorStop(1, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = south;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.94, w * 0.48, h * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
}
function drawDeserts(ctx) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const deserts = [
    [w * 0.26, h * 0.42, w * 0.08, h * 0.05],
    [w * 0.62, h * 0.34, w * 0.10, h * 0.05],
    [w * 0.42, h * 0.58, w * 0.09, h * 0.05],
    [w * 0.83, h * 0.62, w * 0.08, h * 0.05]
  ];
  ctx.fillStyle = 'rgba(205, 171, 98, 0.78)';
  deserts.forEach(([x, y, rw, rh]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rw, rh, Math.random() * 0.15, 0, Math.PI * 2);
    ctx.fill();
  });
}

const originPt = new THREE.Vector3(0, 0, 0);
addAxisArrow(new THREE.Vector3(1, 0, 0), originPt, 0xff6666, 2.8);
addAxisArrow(new THREE.Vector3(0, 1, 0), originPt, 0x66ff66, 2.8);
addAxisArrow(new THREE.Vector3(0, 0, 1), originPt, 0x66aaff, 2.8);
createTextLabel("Vernal equinox", new THREE.Vector3(2.9, 0, 0), "#ff6666");
createTextLabel("Y-axis", new THREE.Vector3(0, 3.1, 0), "#66ff66");
createTextLabel("North pole", new THREE.Vector3(0, 0, 2.9), "#66aaff");

const equatorialPlane = new THREE.Mesh(
  new THREE.CircleGeometry(2.4, 64),
  new THREE.MeshPhongMaterial({ color: 0x3a86ff, side: THREE.DoubleSide, transparent: true, opacity: 0.08 })
);
scene.add(equatorialPlane);

const earthGlobe = createEarthGlobe();

let orbitalDisc = null;
function initOrbitalDisc() {
  if (orbitalDisc) scene.remove(orbitalDisc);
  orbitalDisc = new THREE.Mesh(
    new THREE.CircleGeometry(2.15, 96),
    new THREE.MeshPhongMaterial({ color: 0x55606f, side: THREE.DoubleSide, transparent: true, opacity: 0.12 })
  );
  scene.add(orbitalDisc);
}
initOrbitalDisc();

let nodeLineObj = null, perigeeArrow = null, smallDirectionArrow = null;
let hLabel = null, perigeeLabel = null, hArrow = null;
let satelliteMarker = null, satelliteLine = null, orbitPathLine = null;
let prevNuDeg = 60, prevOmegaDeg = 30;
let semiMajorA = 2.0;
let motionEnabled = false;
let motionAngleDeg = 60;
let orbitDirection = 1;
const motionSpeedDegPerSec = 18;
const earthSpinSpeed = 0.0035;
const MAX_DRAW_R = 60;
const defaultState = {
  a: 2.0,
  e: 0.0,
  i: 45,
  Omega: 45,
  omega: 30,
  nu: 60
};

function getSemiLatusRectum(e) {
  if (e < 1.0) return semiMajorA * (1 - e * e);
  if (Math.abs(e - 1.0) < 0.01) return 2 * semiMajorA;
  return semiMajorA * (e * e - 1);
}
function getOrbitRadius(e, nu_rad) {
  const p = getSemiLatusRectum(e);
  const denom = 1 + e * Math.cos(nu_rad);
  if (denom <= 0.01) return Infinity;
  return p / denom;
}
function rotateVectorAroundAxis(vec, axis, angleRad) {
  const k = new THREE.Vector3(axis.x, axis.y, axis.z).normalize();
  const cos = Math.cos(angleRad), sin = Math.sin(angleRad);
  const dot = vec.dot(k);
  const cross = new THREE.Vector3().crossVectors(k, vec);
  return vec.clone().multiplyScalar(cos).add(cross.multiplyScalar(sin)).add(k.clone().multiplyScalar(dot * (1 - cos)));
}
function createOrbitPath(h_vec, perigeeDir, e) {
  if (orbitPathLine) scene.remove(orbitPathLine);
  const e_x = perigeeDir.clone().normalize();
  const e_y = new THREE.Vector3().crossVectors(h_vec, e_x).normalize();
  const points = [];
  const segments = 900;
  if (e < 1.0) {
    const p = getSemiLatusRectum(e);
    const a = p / (1 - e * e);
    const b = a * Math.sqrt(1 - e * e);
    const c = a * e;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const pt = e_x.clone().multiplyScalar(a * Math.cos(theta) - c).add(e_y.clone().multiplyScalar(b * Math.sin(theta)));
      points.push(pt);
    }
    orbitPathLine = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0xd6d9de, transparent: true, opacity: 0.9 }));
  } else {
    const nuAsymptote = Math.acos(Math.max(-0.9999, -1 / e));
    let lo = 0, hi = nuAsymptote - 0.0001;
    for (let iter = 0; iter < 60; iter++) {
      const mid = (lo + hi) / 2;
      const denom = 1 + e * Math.cos(mid);
      const r = denom > 0.0001 ? getSemiLatusRectum(e) / denom : Infinity;
      if (isFinite(r) && r <= MAX_DRAW_R) lo = mid; else hi = mid;
    }
    const nuMax = Math.max(lo, 0.05);
    const halfSegs = Math.floor(segments / 2);
    for (let i = 0; i <= halfSegs; i++) {
      const nu = -nuMax + (i / halfSegs) * 2 * nuMax;
      const denom = 1 + e * Math.cos(nu);
      if (denom <= 0.01) continue;
      const r = getSemiLatusRectum(e) / denom;
      if (!isFinite(r) || r > MAX_DRAW_R) continue;
      points.push(e_x.clone().multiplyScalar(r * Math.cos(nu)).add(e_y.clone().multiplyScalar(r * Math.sin(nu))));
    }
    orbitPathLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0xff88ff, transparent: true, opacity: 1 }));
  }
  scene.add(orbitPathLine);
}
function updateVelocityDirectionArrow(satPos, perigeeDir, h_vec, nu_rad, e) {
  if (!smallDirectionArrow) {
    smallDirectionArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), satPos, 0.55, 0xffffff, 0.11, 0.06);
    scene.add(smallDirectionArrow);
  }
  const delta = 0.03;
  const posAtNuPlus = rotateVectorAroundAxis(perigeeDir, h_vec, nu_rad + delta).normalize().multiplyScalar(getOrbitRadius(e, nu_rad + delta));
  const forwardTangent = new THREE.Vector3().subVectors(posAtNuPlus, satPos).normalize();
  const currentOmegaDeg = parseFloat(document.getElementById('omegaSlider').value);
  const currentNuDeg = parseFloat(document.getElementById('nuSlider').value);
  let dir = (currentOmegaDeg + currentNuDeg) < (prevOmegaDeg + prevNuDeg) ? -1 : 1;
  const velocityDir = forwardTangent.clone().multiplyScalar(dir);
  if (velocityDir.length() > 0.01) {
    smallDirectionArrow.position.copy(satPos);
    smallDirectionArrow.setDirection(velocityDir);
    smallDirectionArrow.setColor(0xffffff);
    smallDirectionArrow.setLength(0.58, 0.12, 0.065);
  }
  prevOmegaDeg = currentOmegaDeg;
  prevNuDeg = currentNuDeg;
}
function bindAngleInputs() {
  const pairs = [
    { slider: 'incSlider', input: 'incInput', min: 0, max: 180 },
    { slider: 'OmegaSlider', input: 'OmegaInput', min: 0, max: 360 },
    { slider: 'omegaSlider', input: 'omegaInput', min: 0, max: 360 },
    { slider: 'nuSlider', input: 'nuInput', min: 0, max: 360 },
    { slider: 'eccSlider', input: 'eccInput', min: 0, max: 2.0, isFloat: true },
  ];
  pairs.forEach(pair => {
    const slider = document.getElementById(pair.slider);
    const input = document.getElementById(pair.input);
    if (!slider || !input) return;
    slider.addEventListener('input', () => { input.value = slider.value; updateOrbit(); });
    input.addEventListener('change', () => {
      let val = parseFloat(input.value);
      if (isNaN(val)) val = 0;
      val = Math.min(pair.max, Math.max(pair.min, val));
      val = pair.isFloat ? Math.round(val * 100) / 100 : Math.round(val);
      input.value = pair.isFloat ? val : String(val);
      slider.value = val;
      updateOrbit();
    });
  });
  const aSlider = document.getElementById('aSlider');
  const aInput = document.getElementById('aInput');
  aSlider.addEventListener('input', () => { aInput.value = parseFloat(aSlider.value).toFixed(2); semiMajorA = parseFloat(aSlider.value); updateOrbit(); });
  aInput.addEventListener('change', () => {
    let val = parseFloat(aInput.value);
    if (isNaN(val)) val = 2.0;
    val = Math.min(8.0, Math.max(1.2, Math.round(val * 100) / 100));
    aInput.value = val.toFixed(2);
    aSlider.value = val;
    semiMajorA = val;
    updateOrbit();
  });
  document.querySelectorAll('.arrow-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const slider = document.getElementById(btn.dataset.slider);
      if (!slider) return;
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      const next = btn.dataset.action === 'min' ? min : max;
      slider.value = next;
      const input = document.getElementById(slider.id.replace('Slider', 'Input'));
      if (input) input.value = slider.step && slider.step.includes('.') ? Number(next).toFixed(2) : String(Math.round(next));
      updateOrbit();
    });
  });
}
function updateOrbit(forceNuDeg = null) {
  const i_deg = parseFloat(document.getElementById('incSlider').value);
  const Omega_deg = parseFloat(document.getElementById('OmegaSlider').value);
  const omega_deg = parseFloat(document.getElementById('omegaSlider').value);
  const e = parseFloat(document.getElementById('eccSlider').value);
  if (forceNuDeg !== null) document.getElementById('nuSlider').value = forceNuDeg.toFixed(0);
  const nu_deg = parseFloat(document.getElementById('nuSlider').value);
  semiMajorA = parseFloat(document.getElementById('aSlider').value);
  document.getElementById('aVal').innerText = semiMajorA.toFixed(2);
  const p = getSemiLatusRectum(e);
  let infoHtml = `p (semi-latus rectum) = ${p.toFixed(3)}<br>`;
  if (e < 1.0) {
    const b = semiMajorA * Math.sqrt(1 - e * e);
    infoHtml += `b (semi-minor axis) = ${b.toFixed(3)}<br>`;
    infoHtml += `r_perigee = ${(semiMajorA * (1 - e)).toFixed(3)}<br>`;
    if (e > 0.001) infoHtml += `r_apogee = ${(semiMajorA * (1 + e)).toFixed(3)}<br>`;
  } else if (Math.abs(e - 1.0) < 0.01) {
    infoHtml += `a = undefined (parabola)<br>r_perigee = ${(p / 2).toFixed(3)}<br>`;
  } else {
    infoHtml += `a is negative (hyperbola)<br>r_perigee = ${(semiMajorA * (e - 1)).toFixed(3)}<br>`;
  }
  document.getElementById('orbitInfoBox').innerHTML = infoHtml;
  document.getElementById('iVal').innerText = i_deg + "°";
  document.getElementById('OmegaVal').innerText = Omega_deg + "°";
  document.getElementById('omegaVal').innerText = omega_deg + "°";
  document.getElementById('nuVal').innerText = nu_deg + "°";
  document.getElementById('eVal').innerText = e.toFixed(2);
  const badge = document.getElementById('eccBadge');
  if (e === 0) { badge.textContent = "● Circular"; badge.style.background = "#1a3a2a"; badge.style.color = "#44ffaa"; }
  else if (e < 1) { badge.textContent = "● Elliptic"; badge.style.background = "#1a2a3a"; badge.style.color = "#44aaff"; }
  else if (Math.abs(e - 1) < 0.01) { badge.textContent = "⚡ Parabolic"; badge.style.background = "#3a2a1a"; badge.style.color = "#ffaa44"; }
  else { badge.textContent = "🚀 Hyperbolic"; badge.style.background = "#3a1a2a"; badge.style.color = "#ff44aa"; }
  const i_rad = i_deg * Math.PI / 180, Omega_rad = Omega_deg * Math.PI / 180, omega_rad = omega_deg * Math.PI / 180, nu_rad = nu_deg * Math.PI / 180;
  const eps = 0.5;
  const isEquatorial = (Math.abs(i_deg) < eps || Math.abs(i_deg - 180) < eps);
  let specialMsg = "";
  if (Math.abs(i_deg) < eps) specialMsg = "⚠️ Inclination = 0°: Equatorial orbit. Node line ambiguous.";
  else if (Math.abs(i_deg - 180) < eps) specialMsg = "⚠️ Inclination = 180°: Retrograde equatorial orbit.";
  else if (Math.abs(i_deg - 90) < eps) specialMsg = "🌀 Inclination = 90°: Polar orbit. h vector lies in equatorial plane.";
  else specialMsg = `📐 Inclination ${i_deg}° — inclined orbit.`;
  let omegaOmegaMsg = "";
  const specialAngles = [0, 90, 180, 270];
  if (specialAngles.includes(Omega_deg % 360)) omegaOmegaMsg += `📍 Ω = ${Omega_deg}° → Line of Nodes aligned with ${( {0:"X axis",90:"Y axis",180:"negative X axis",270:"negative Y axis"} )[Omega_deg%360]}. `;
  if (specialAngles.includes(omega_deg % 360)) omegaOmegaMsg += "🟢 " + ({0:"ω=0° Perigee on Nodes.",90:"ω=90° Perigee ⊥ Nodes.",180:"ω=180° Perigee opposite Nodes.",270:"ω=270° anti-perpendicular."})[omega_deg%360];
  if (!omegaOmegaMsg) omegaOmegaMsg = "✨ Adjust Ω and ω for special alignments.";
  document.getElementById('specialAnglesMsg').innerHTML = omegaOmegaMsg;
  document.getElementById('dynamicStatus').innerHTML = `🛰️ i=${i_deg}° Ω=${Omega_deg}° ω=${omega_deg}° ν=${nu_deg}° e=${e.toFixed(2)}`;
  document.getElementById('specialCaseMsg').innerHTML = specialMsg;
  let nodeDir = new THREE.Vector3(Math.cos(Omega_rad), Math.sin(Omega_rad), 0);
  let h_vec;
  if (Math.abs(i_deg) < eps) { h_vec = new THREE.Vector3(0, 0, 1); nodeDir = new THREE.Vector3(1, 0, 0); }
  else if (Math.abs(i_deg - 180) < eps) { h_vec = new THREE.Vector3(0, 0, -1); nodeDir = new THREE.Vector3(1, 0, 0); }
  else h_vec = new THREE.Vector3(Math.sin(i_rad) * Math.sin(Omega_rad), -Math.sin(i_rad) * Math.cos(Omega_rad), Math.cos(i_rad)).normalize();
  let perigeeDir = isEquatorial ? rotateVectorAroundAxis(nodeDir, new THREE.Vector3(0,0,1), omega_rad) : rotateVectorAroundAxis(nodeDir, h_vec, omega_rad);
  perigeeDir.normalize();
  const currentNuDeg = motionEnabled ? motionAngleDeg : nu_deg;
  const currentNuRad = currentNuDeg * Math.PI / 180;
  const r = getOrbitRadius(e, currentNuRad);
  const satDir = rotateVectorAroundAxis(perigeeDir, h_vec, currentNuRad).normalize();
  const satPos = satDir.clone().multiplyScalar(isFinite(r) ? r : MAX_DRAW_R);
  createOrbitPath(h_vec, perigeeDir, e);
  if (orbitalDisc) {
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), h_vec.clone().normalize());
    orbitalDisc.quaternion.copy(quat);
    orbitalDisc.position.set(0, 0, 0);
  }
  updateVelocityDirectionArrow(satPos, perigeeDir, h_vec, currentNuRad, e);
  if (nodeLineObj) scene.remove(nodeLineObj);
  const nodeLen = 2.55;
  nodeLineObj = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([nodeDir.clone().multiplyScalar(-nodeLen), nodeDir.clone().multiplyScalar(nodeLen)]),
    new THREE.LineBasicMaterial({ color: 0xff4466, transparent: true, opacity: 0.8 })
  );
  scene.add(nodeLineObj);
  if (window.nodeSpheres) window.nodeSpheres.forEach(sp => scene.remove(sp));
  const sGeo = new THREE.SphereGeometry(0.05, 10, 10);
  const sMat = new THREE.MeshStandardMaterial({ color: 0xff8888 });
  const mA = new THREE.Mesh(sGeo, sMat); mA.position.copy(nodeDir.clone().multiplyScalar(nodeLen));
  const mD = new THREE.Mesh(sGeo, sMat); mD.position.copy(nodeDir.clone().multiplyScalar(-nodeLen));
  scene.add(mA); scene.add(mD); window.nodeSpheres = [mA, mD];
  if (perigeeArrow) scene.remove(perigeeArrow);
  perigeeArrow = new THREE.ArrowHelper(perigeeDir, originPt, 2.35, 0x00ffff, 0.11, 0.06);
  scene.add(perigeeArrow);
  if (perigeeLabel) scene.remove(perigeeLabel);
  perigeeLabel = createTextLabel("Perigee", perigeeDir.clone().multiplyScalar(2.65), "#00ffff");
  if (hArrow) scene.remove(hArrow);
  hArrow = new THREE.ArrowHelper(h_vec, originPt, 2.7, 0xffaa44, 0.125, 0.08);
  scene.add(hArrow);
  if (hLabel) scene.remove(hLabel);
  hLabel = createTextLabel("h vector", h_vec.clone().multiplyScalar(3.0), "#ffaa44");
  if (satelliteMarker) scene.remove(satelliteMarker);
  if (satelliteLine) scene.remove(satelliteLine);
  if (window.satGlow) scene.remove(window.satGlow);
  satelliteMarker = createEmojiSprite("🛰", satPos, 0.66, 230);
  satelliteLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), satPos]), new THREE.LineBasicMaterial({ color: 0x88aaff, transparent: true, opacity: 0.55 }));
  scene.add(satelliteLine);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff6644, transparent: true, opacity: 0.15 }));
  glow.position.copy(satPos);
  scene.add(glow);
  window.satGlow = glow;
}

function createStarfield() {
  const starCount = 650;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 380;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 380;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 140 - 40;
    starSizes[i] = Math.random();
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.14, transparent: true, opacity: 0.75 })));
}

function updateEarthRotation() {
  if (!motionEnabled) return;
  const spin = earthSpinSpeed;
  earthGlobe.group.rotation.z += spin;
  earthGlobe.clouds.rotation.z += spin * 1.25;
}

bindAngleInputs();
createStarfield();
updateOrbit();

document.getElementById('incSlider').addEventListener('input', () => {
  const iDeg = parseFloat(document.getElementById('incSlider').value);
  const flat = (Math.abs(iDeg) < 0.5 || Math.abs(iDeg - 180) < 0.5);
  document.getElementById('omegaSlider').style.opacity = flat ? "0.65" : "1";
  document.getElementById('OmegaSlider').style.opacity = flat ? "0.65" : "1";
});

document.getElementById('toggleControlsBtn').addEventListener('click', () => {
  const panel = document.getElementById('controlsPanel');
  const hidden = panel.classList.toggle('is-hidden');
  document.getElementById('toggleControlsBtn').textContent = hidden ? 'Show Panel' : 'Hide Panel';
});
document.getElementById('stopMotionBtn').addEventListener('click', () => {
  motionEnabled = false;
  orbitDirection = 1;
  document.getElementById('progradeMotionBtn').classList.remove('is-active');
  document.getElementById('retrogradeMotionBtn').classList.remove('is-active');
  updateOrbit();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  motionEnabled = false;
  orbitDirection = 1;
  document.getElementById('progradeMotionBtn').classList.remove('is-active');
  document.getElementById('retrogradeMotionBtn').classList.remove('is-active');
  document.getElementById('aSlider').value = defaultState.a;
  document.getElementById('aInput').value = defaultState.a.toFixed(2);
  document.getElementById('eccSlider').value = defaultState.e;
  document.getElementById('eccInput').value = defaultState.e.toFixed(2);
  document.getElementById('incSlider').value = defaultState.i;
  document.getElementById('incInput').value = defaultState.i;
  document.getElementById('OmegaSlider').value = defaultState.Omega;
  document.getElementById('OmegaInput').value = defaultState.Omega;
  document.getElementById('omegaSlider').value = defaultState.omega;
  document.getElementById('omegaInput').value = defaultState.omega;
  document.getElementById('nuSlider').value = defaultState.nu;
  document.getElementById('nuInput').value = defaultState.nu;
  semiMajorA = defaultState.a;
  motionAngleDeg = defaultState.nu;
  updateOrbit();
});

document.getElementById('progradeMotionBtn').addEventListener('click', () => {
  motionEnabled = true;
  orbitDirection = 1;
  document.getElementById('progradeMotionBtn').classList.add('is-active');
  document.getElementById('retrogradeMotionBtn').classList.remove('is-active');
  updateOrbit();
});

document.getElementById('retrogradeMotionBtn').addEventListener('click', () => {
  motionEnabled = true;
  orbitDirection = -1;
  document.getElementById('retrogradeMotionBtn').classList.add('is-active');
  document.getElementById('progradeMotionBtn').classList.remove('is-active');
  updateOrbit();
});

let lastTime = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  if (motionEnabled) {
    motionAngleDeg = (motionAngleDeg + orbitDirection * motionSpeedDegPerSec * dt) % 360;
    updateOrbit(motionAngleDeg);
  }
  updateEarthRotation();
  controls.update();
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
