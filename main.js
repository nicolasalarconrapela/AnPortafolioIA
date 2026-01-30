/**
 * main.js — Avaturn/GLB + Three.js (Interview / Upper-body framing)
 * ------------------------------------------------------------
 * ✅ Avatar de frente (quieto en el mundo)
 * ✅ OrbitControls (mueves cámara con ratón) — aquí desactivado (modo entrevista)
 * ✅ “Puppet Mode” (mover TODO el cuerpo):
 *    - SkeletonHelper visible
 *    - Markers clicables para seleccionar huesos
 *    - TransformControls (gizmo) para ROTAR / TRASLADAR huesos
 * ✅ Botón #buttonWave: saludar (procedural)
 * ✅ Selector #animationSelector: cargar animaciones FBX desde movements.json (opcional)
 * ✅ Cámara auto-centrada y encuadrada (torso+cara) usando bounding-box (robusto)
 *
 * HTML mínimo requerido:
 * - <div id="container"></div>
 * - <button id="buttonWave">Saludar</button> (opcional)
 * - <select id="animationSelector"></select> (opcional)
 *
 * Rutas esperadas:
 * - /model.glb
 * - /brown_photostudio_01.hdr
 * - /movements.json  (opcional)
 */

import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";

// Avaturn (opcional, si reactivas su UI)
import { AvaturnSDK } from "https://cdn.jsdelivr.net/npm/@avaturn/sdk/dist/index.js";

// ============================================================
// Globals
// ============================================================
let scene, renderer, camera, stats, controls;
let mixer, clock;

let currentAvatar = null;
let idleAction = null;

// Puppet / rig controls
let transformControls = null;
let skeletonHelper = null;
let boneMarkersGroup = null;
let selectedBone = null;

const puppet = {
  enabled: false,        // ❌ Modo entrevista por defecto
  showSkeleton: false,
  showMarkers: false,
  markerSize: 0.025,
  mode: "rotate",
  space: "local",
};

// ============================================================
// Animation Library
// ============================================================
// Se cargará dinámicamente desde /movements.json
let AVAILABLE_ANIMATIONS = [];
let currentAnimationAction = null;

// Cargar lista de animaciones disponibles
async function loadAvailableAnimations() {
  try {
    const response = await fetch("/movements.json");
    if (!response.ok) {
      console.warn("No se pudo cargar /movements.json, usando lista vacía");
      return;
    }
    AVAILABLE_ANIMATIONS = await response.json();
    console.log(`📋 Cargadas ${AVAILABLE_ANIMATIONS.length} animaciones disponibles`);
  } catch (err) {
    console.warn("Error cargando /movements.json:", err);
  }
}

// ============================================================
// Utils (easing)
// ============================================================
function easeInOutCubic(x) {
  x = Math.max(0, Math.min(1, x));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
function bump(x) {
  x = Math.max(0, Math.min(1, x));
  return Math.sin(Math.PI * x);
}

// ============================================================
// Resource cleanup
// ============================================================
function disposeMaterial(mat) {
  const maps = [
    "map",
    "normalMap",
    "roughnessMap",
    "metalnessMap",
    "aoMap",
    "emissiveMap",
    "alphaMap",
    "envMap",
  ];
  for (const k of maps) mat?.[k]?.dispose?.();
  mat?.dispose?.();
}

function disposeGLTF(root) {
  root.traverse((obj) => {
    if (obj.isMesh) {
      obj.geometry?.dispose?.();
      const mat = obj.material;
      if (Array.isArray(mat)) mat.forEach(disposeMaterial);
      else if (mat) disposeMaterial(mat);
    }
  });
}

// ============================================================
// Placement helpers
// ============================================================
function computeModelBaseY(root) {
  const box = new THREE.Box3().setFromObject(root);
  const minY = box.min.y;
  root.position.y -= minY; // apoya en Y=0
}

function faceCamera(root) {
  root.position.x = 10;
  root.position.z = 0;
  root.rotation.set(0, 0, 0);
  root.rotation.y = THREE.MathUtils.degToRad(32);

}

// ============================================================
// Camera framing (TORSO / Interview) ✅
// ============================================================
function frameUpperBody(camera, object3D, opts = {}) {
  const {
    targetHeightRatio = 0.76,  // mira al pecho/cuello
    heightPortion = 0.42,      // torso+head en vertical
    distanceMultiplier = 1.00, // ajuste fino

    offsetX = 0.0,
    offsetY = 0.0,
    offsetZ = 0.0,

    // 🔒 clamps para que no “desaparezca”
    minDistance = 1.0,         // <- IMPORTANTÍSIMO
    maxDistance = 6.0,
    nearFactor = 0.02,         // near = distance * nearFactor
    minNear = 0.01,
    farMultiplier = 50,
  } = opts;

  if (!object3D) return;

  object3D.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(object3D);

  if (box.isEmpty()) {
    console.warn("[camera] Bounding box vacío. No se puede encuadrar.");
    return;
  }

  const size = new THREE.Vector3();
  box.getSize(size);

  const center = new THREE.Vector3();
  box.getCenter(center);

  // Target tipo entrevista (pecho/cuello)
  const target = new THREE.Vector3(
    center.x + offsetX,
    box.min.y + size.y * targetHeightRatio + offsetY,
    center.z
  );

  // Altura efectiva (torso) con seguridad
  const effectiveHeight = Math.max(0.2, size.y * heightPortion);

  const fov = THREE.MathUtils.degToRad(camera.fov);
  let distance = (effectiveHeight / (2 * Math.tan(fov / 2))) * distanceMultiplier;

  // ✅ clamp distancia para evitar cámara dentro del modelo
  distance = THREE.MathUtils.clamp(distance, minDistance, maxDistance);

  // Posición frontal (asumiendo que el avatar está alrededor de Z=0)
  camera.position.set(
    target.x,
    target.y,
    target.z + distance + offsetZ
  );

  // ✅ near/far robustos (evita clipping brutal)
  camera.near = Math.max(minNear, distance * nearFactor);
  camera.far = Math.max(camera.near + 10, distance * farMultiplier);
  camera.updateProjectionMatrix();

  camera.lookAt(target);

  // Mantén coherente el target de OrbitControls aunque estén disabled
  if (controls) {
    controls.target.copy(target);
    controls.update?.();
  }

  console.log("[camera] framed OK", {
    size: size.toArray(),
    target: target.toArray(),
    effectiveHeight,
    distance,
    near: camera.near,
    far: camera.far,
  });
}


// ============================================================
// Bone helpers
// ============================================================
function listBones(root) {
  const out = [];
  root.traverse((o) => {
    if (o.isBone) out.push(o.name);
  });
  out.sort();
  console.log("=== BONES (" + out.length + ") ===");
  console.log(out.join("\n"));
  return out;
}

function findBoneByRegex(root, regexList) {
  const bones = [];
  root.traverse((o) => {
    if (o.isBone) bones.push(o);
  });
  const lowered = bones.map((b) => ({ b, n: (b.name || "").toLowerCase() }));

  for (const re of regexList) {
    const hit = lowered.find((x) => re.test(x.n));
    if (hit) return hit.b;
  }
  return null;
}

function detectRightArmBones(root) {
  const upper = findBoneByRegex(root, [
    /right.*upperarm/,
    /r.*upperarm/,
    /right.*shoulder/,
    /r.*shoulder/,
    /right.*arm(?!ature)/,
    /r.*arm(?!ature)/,
  ]);
  const fore = findBoneByRegex(root, [
    /right.*forearm/,
    /r.*forearm/,
    /right.*elbow/,
    /r.*elbow/,
  ]);
  const hand = findBoneByRegex(root, [
    /right.*hand/,
    /r.*hand/,
    /right.*wrist/,
    /r.*wrist/,
  ]);
  return { upper, fore, hand };
}

// ============================================================
// Procedural gesture: Wave 👋
// ============================================================
const wave = {
  enabled: true,
  active: false,
  t0: 0,

  duration: 1.7,
  waves: 3,

  shoulderLift: 0.55,
  elbowBend: 0.22,
  wristAmp: 0.95,

  upper: null,
  fore: null,
  hand: null,

  baseUpper: null,
  baseFore: null,
  baseHand: null,

  upperAxis: new THREE.Vector3(1, 0, 0),
  foreAxis: new THREE.Vector3(1, 0, 0),
  wristAxis: new THREE.Vector3(0, 0, 1),
};

function bindWaveBonesFromAvatar() {
  if (!currentAvatar) return;
  const { upper, fore, hand } = detectRightArmBones(currentAvatar);

  wave.upper = upper;
  wave.fore = fore;
  wave.hand = hand;

  wave.baseUpper = upper ? upper.quaternion.clone() : null;
  wave.baseFore = fore ? fore.quaternion.clone() : null;
  wave.baseHand = hand ? hand.quaternion.clone() : null;

  console.log("[wave] bones:", {
    upperArm: wave.upper?.name ?? null,
    foreArm: wave.fore?.name ?? null,
    hand: wave.hand?.name ?? null,
  });
}

function applyQuatOffset(bone, baseQuat, axis, radians) {
  if (!bone || !baseQuat) return;
  const dq = new THREE.Quaternion().setFromAxisAngle(axis, radians);
  bone.quaternion.copy(baseQuat).multiply(dq);
}

function triggerWave() {
  if (!wave.enabled || !currentAvatar) return;
  if (wave.active) return;

  if (!wave.upper && !wave.hand) bindWaveBonesFromAvatar();
  if (!wave.upper && !wave.hand) {
    console.warn("[wave] No se han encontrado huesos de brazo/mano para saludar.");
    return;
  }

  wave.baseUpper = wave.upper ? wave.upper.quaternion.clone() : null;
  wave.baseFore = wave.fore ? wave.fore.quaternion.clone() : null;
  wave.baseHand = wave.hand ? wave.hand.quaternion.clone() : null;

  wave.active = true;
  wave.t0 = clock.elapsedTime;
}

function updateWave(nowSeconds) {
  if (!wave.active) return;

  const p = (nowSeconds - wave.t0) / wave.duration;
  if (p >= 1) {
    if (wave.upper && wave.baseUpper) wave.upper.quaternion.copy(wave.baseUpper);
    if (wave.fore && wave.baseFore) wave.fore.quaternion.copy(wave.baseFore);
    if (wave.hand && wave.baseHand) wave.hand.quaternion.copy(wave.baseHand);
    wave.active = false;
    return;
  }

  const up = p < 0.25 ? easeInOutCubic(p / 0.25) : 1;
  const down = p > 0.85 ? 1 - easeInOutCubic((p - 0.85) / 0.15) : 1;
  const lift = Math.min(up, down);

  let w = 0;
  if (p >= 0.25 && p <= 0.85) {
    const wp = (p - 0.25) / 0.6;
    w = bump(wp);
  }

  if (wave.upper && wave.baseUpper) {
    applyQuatOffset(wave.upper, wave.baseUpper, wave.upperAxis, -wave.shoulderLift * lift);
  }
  if (wave.fore && wave.baseFore) {
    applyQuatOffset(wave.fore, wave.baseFore, wave.foreAxis, -wave.elbowBend * lift);
  }
  if (wave.hand && wave.baseHand) {
    const swing = Math.sin(p * Math.PI * 2 * wave.waves) * wave.wristAmp * w;
    applyQuatOffset(wave.hand, wave.baseHand, wave.wristAxis, swing);
  }
}

// ============================================================
// Puppet system
// ============================================================
function enableSkeletonHelper(root) {
  if (skeletonHelper) skeletonHelper.removeFromParent();
  skeletonHelper = new THREE.SkeletonHelper(root);
  skeletonHelper.visible = puppet.showSkeleton;
  scene.add(skeletonHelper);
}

function createBoneMarkers(root) {
  if (boneMarkersGroup) {
    boneMarkersGroup.removeFromParent();
    boneMarkersGroup.traverse((o) => o.geometry?.dispose?.());
    boneMarkersGroup.traverse((o) => o.material?.dispose?.());
  }

  boneMarkersGroup = new THREE.Group();
  boneMarkersGroup.name = "BoneMarkers";

  const bones = [];
  root.traverse((o) => {
    if (o.isBone) bones.push(o);
  });

  const geo = new THREE.SphereGeometry(puppet.markerSize, 10, 10);

  for (const bone of bones) {
    const mat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const marker = new THREE.Mesh(geo, mat);

    marker.name = `marker:${bone.name}`;
    marker.userData.bone = bone;
    marker.matrixAutoUpdate = false;

    boneMarkersGroup.add(marker);
  }

  boneMarkersGroup.visible = puppet.showMarkers;
  scene.add(boneMarkersGroup);
}

function updateBoneMarkersWorldMatrices() {
  if (!boneMarkersGroup || !boneMarkersGroup.visible) return;

  scene.updateMatrixWorld(true);

  const pos = new THREE.Vector3();
  for (const marker of boneMarkersGroup.children) {
    const bone = marker.userData.bone;
    if (!bone) continue;

    bone.getWorldPosition(pos);
    marker.matrix.identity();
    marker.matrix.setPosition(pos);
  }
}

function initTransformControlsOnce() {
  if (transformControls) return;

  transformControls = new TransformControls(camera, renderer.domElement);
  transformControls.setMode(puppet.mode);
  transformControls.setSpace(puppet.space);
  transformControls.enabled = puppet.enabled;

  transformControls.addEventListener("dragging-changed", (e) => {
    if (controls) controls.enabled = !e.value;
  });

  scene.add(transformControls);

  window.addEventListener("keydown", (e) => {
    if (!puppet.enabled) return;

    if (e.code === "KeyR") {
      puppet.mode = "rotate";
      transformControls.setMode("rotate");
    }
    if (e.code === "KeyT") {
      puppet.mode = "translate";
      transformControls.setMode("translate");
    }
    if (e.code === "KeyL") {
      puppet.space = puppet.space === "local" ? "world" : "local";
      transformControls.setSpace(puppet.space);
    }
    if (e.code === "Escape") {
      deselectBone();
    }
    if (e.code === "KeyM") {
      puppet.showMarkers = !puppet.showMarkers;
      if (boneMarkersGroup) boneMarkersGroup.visible = puppet.showMarkers;
      if (!puppet.showMarkers) deselectBone();
    }
    if (e.code === "KeyK") {
      puppet.showSkeleton = !puppet.showSkeleton;
      if (skeletonHelper) skeletonHelper.visible = puppet.showSkeleton;
    }
  });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  renderer.domElement.addEventListener("pointerdown", (ev) => {
    if (!puppet.enabled || !boneMarkersGroup || !boneMarkersGroup.visible) return;
    if (transformControls.dragging) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -(((ev.clientY - rect.top) / rect.height) * 2 - 1);

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(boneMarkersGroup.children, false);
    if (!hits.length) return;

    const marker = hits[0].object;
    const bone = marker.userData.bone;
    if (bone) selectBone(bone);
  });
}

function selectBone(bone) {
  selectedBone = bone;
  transformControls.attach(bone);

  if (boneMarkersGroup) {
    for (const m of boneMarkersGroup.children) {
      const b = m.userData.bone;
      if (!b) continue;
      m.material.color.setHex(b === bone ? 0xff0000 : 0x111111);
    }
  }

  console.log("[puppet] selected bone:", bone.name, "| mode:", puppet.mode, "space:", puppet.space);
}

function deselectBone() {
  selectedBone = null;
  transformControls?.detach?.();

  if (boneMarkersGroup) {
    for (const m of boneMarkersGroup.children) {
      m.material.color.setHex(0x111111);
    }
  }
}

// ============================================================
// Loading helpers (GLB / FBX)
// ============================================================
async function loadFBX(url) {
  const loader = new FBXLoader();
  const object = await loader.loadAsync(url);

  object.scale.setScalar(0.01);

  object.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  computeModelBaseY(object);
  faceCamera(object);

  scene.add(object);

  if (object.animations?.length) {
    const clip = object.animations[0];
    idleAction = mixer.clipAction(clip);
    idleAction.reset().play();
  } else {
    idleAction = null;
  }

  return object;
}

async function loadAvatar(url) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);
  const model = gltf.scene;

  model.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
      if (o.material) o.material.envMapIntensity = 0.3;
    }
  });

  computeModelBaseY(model);
  faceCamera(model);
  scene.add(model);

  if (gltf.animations?.length) {
    const idleClip = gltf.animations.find((a) => /idle/i.test(a.name)) || gltf.animations[0];
    idleAction = mixer.clipAction(idleClip);
    idleAction.reset().play();
  } else {
    idleAction = null;
  }

  return model;
}


function replaceAvatar(newAvatar) {
  if (currentAvatar) {
    deselectBone();
    currentAvatar.removeFromParent();
    disposeGLTF(currentAvatar);
  }

  currentAvatar = newAvatar;

  bindWaveBonesFromAvatar();

  // Puppet setup (aunque disabled en modo entrevista)
  enableSkeletonHelper(currentAvatar);
  createBoneMarkers(currentAvatar);
  initTransformControlsOnce();

  // ✅ Auto-encuadre usando bounding box
  frameUpperBody(camera, currentAvatar, {
// Baja el punto de mira un pelín para que no corte la cabeza
  targetHeightRatio: 0.79,

  // Que el cálculo de distancia use un trozo mayor (más “torso visible”)
  heightPortion: 0.55,

  // Aléjate un poco
  distanceMultiplier: 1.5,

  // Sube muy poco el target si quieres (con UI arriba mejor NO subir)
  offsetY: -0.01,

  // Seguridad
  minDistance: 1.6,
  maxDistance: 6.0,
  nearFactor: 0.02,
  minNear: 0.01,
  });
}

// ============================================================
// Retargeting Helper (Mixamo -> Avaturn)
// ============================================================
function retargetAnimation(target, clip) {
  const newClip = clip.clone();
  newClip.name = clip.name + "_retarget";

  const boneNames = [];
  target.traverse((o) => { if (o.isBone) boneNames.push(o.name); });

  const targetHasPrefix = boneNames.some(n => n.startsWith("mixamorig:"));

  newClip.tracks.forEach((track) => {
    let trackName = track.name;

    const lastDot = trackName.lastIndexOf(".");
    let boneName = lastDot !== -1 ? trackName.substring(0, lastDot) : trackName;
    const property = lastDot !== -1 ? trackName.substring(lastDot) : "";

    if (boneName.startsWith("mixamorig:")) {
      boneName = boneName.substring(10);
    } else if (boneName.startsWith("mixamorig")) {
      boneName = boneName.substring(9);
    }

    if (targetHasPrefix && !trackName.startsWith("mixamorig")) {
      track.name = `mixamorig:${boneName}${property}`;
    } else if (!targetHasPrefix && (trackName.startsWith("mixamorig:") || trackName.startsWith("mixamorig"))) {
      track.name = `${boneName}${property}`;
    }
  });

  // IMPORTANTE: filtra traslación de caderas si te hace “volar”
  newClip.tracks = newClip.tracks.filter(track => {
    if (track.name === "Hips.position") {
      console.log("🚫 Eliminando track Hips.position para evitar que el avatar vuele");
      return false;
    }
    return true;
  });

  return newClip;
}

// ============================================================
// Scene init
// ============================================================
async function init() {
  const container = document.getElementById("container");
  if (!container) throw new Error("No existe #container en el HTML.");

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f5);
  scene.fog = null;

  // Cámara (modo entrevista)
  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.02, 100);

  // OrbitControls (desactivados)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false;
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableRotate = false;

  clock = new THREE.Clock();
  mixer = new THREE.AnimationMixer(scene);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemi.position.set(0, 20, 0);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff);
  dir.position.set(3, 3, 5);
  dir.castShadow = true;
  dir.shadow.camera.top = 2;
  dir.shadow.camera.bottom = -2;
  dir.shadow.camera.left = -2;
  dir.shadow.camera.right = 2;
  dir.shadow.camera.near = 0.1;
  dir.shadow.camera.far = 40;
  dir.shadow.bias = -0.001;
  dir.intensity = 3;
  scene.add(dir);

  new RGBELoader().load("/brown_photostudio_01.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  });

  // 1) Cargar avatar
  const avatar = await loadAvatar("public/model.glb");
  replaceAvatar(avatar);

  // Stats
  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize);

  // Animaciones disponibles
  await loadAvailableAnimations();

  wireUI();

  // 3) Cargar animación inicial si hay
  if (AVAILABLE_ANIMATIONS.length > 0) {
    await loadAnimation(AVAILABLE_ANIMATIONS[0].path);
  }


  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // ✅ Re-encuadra al redimensionar (mantiene torso centrado)
  if (currentAvatar) {
    frameUpperBody(camera, currentAvatar, {
      targetHeightRatio: 0.76,
      heightPortion: 0.42,
      distanceMultiplier: 0.98,
    });
  }
}

// ============================================================
// UI wiring (no revienta si falta)
// ============================================================
function wireClick(id, fn) {
  const el = document.querySelector(id);
  if (!el) {
    console.warn("Falta en HTML:", id);
    return;
  }
  el.addEventListener("click", fn);
}

function wireUI() {
  wireClick("#buttonWave", triggerWave);

  // (Opcional) Avaturn si lo reactivas en HTML
  wireClick("#buttonOpen", openIframe);
  wireClick("#buttonClose", closeIframe);

  // (Opcional) Botón recenter
  wireClick("#buttonRecenter", () => {
    if (!currentAvatar) return;
    frameUpperBody(camera, currentAvatar, {
      targetHeightRatio: 0.76,
      heightPortion: 0.42,
      distanceMultiplier: 0.98,
    });
  });

  populateAnimationSelector();
}

// ============================================================
// Animation Loader
// ============================================================
function populateAnimationSelector() {
  const selector = document.querySelector("#animationSelector");
  if (!selector) {
    console.warn("Falta #animationSelector en HTML");
    return;
  }

  selector.innerHTML = "";

  AVAILABLE_ANIMATIONS.forEach((anim, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = anim.name;
    selector.appendChild(option);
  });

  selector.addEventListener("change", async (e) => {
    const index = parseInt(e.target.value, 10);
    if (isNaN(index) || index < 0 || index >= AVAILABLE_ANIMATIONS.length) {
      console.log("Ninguna animación seleccionada");
      return;
    }

    const animData = AVAILABLE_ANIMATIONS[index];
    console.log(`Cargando animación: ${animData.name}`);
    await loadAnimation(animData.path);
  });
}

async function loadAnimation(fbxPath) {
  if (!currentAvatar) {
    console.warn("No hay avatar cargado para aplicar animación");
    return;
  }

  try {
    const loader = new FBXLoader();
    const animFbx = await loader.loadAsync(fbxPath);

    if (!animFbx.animations || animFbx.animations.length === 0) {
      console.warn(`El FBX ${fbxPath} no contiene animaciones`);
      return;
    }

    let clip = animFbx.animations[0];
    console.log(`Animación encontrada: ${clip.name}`);

    clip = retargetAnimation(currentAvatar, clip);

    if (currentAnimationAction) currentAnimationAction.stop();
    if (idleAction) idleAction.stop();

    currentAnimationAction = mixer.clipAction(clip);
    currentAnimationAction.reset().play();

    console.log(`✅ Reproduciendo: ${clip.name}`);
  } catch (err) {
    console.error(`Error cargando animación desde ${fbxPath}:`, err);
  }
}

// ============================================================
// Render loop
// ============================================================
function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  const t = clock.elapsedTime;

  // Animaciones
  mixer.update(dt);

  // Gesto
  updateWave(t);

  // Puppet visuals
  updateBoneMarkersWorldMatrices();
  skeletonHelper?.update?.();

  stats.update();
  renderer.render(scene, camera);
}

// ============================================================
// Avaturn iframe (opcional)
// ============================================================
function openIframe() {
  initAvaturn();
  const c = document.querySelector("#avaturn-sdk-container");
  if (c) c.hidden = false;

  const open = document.querySelector("#buttonOpen");
  if (open) open.disabled = true;
}

function closeIframe() {
  const c = document.querySelector("#avaturn-sdk-container");
  if (c) c.hidden = true;

  const open = document.querySelector("#buttonOpen");
  if (open) open.disabled = false;
}

function initAvaturn() {
  const container = document.getElementById("avaturn-sdk-container");
  if (!container) {
    console.warn("Falta #avaturn-sdk-container en HTML.");
    return;
  }

  const subdomain = "demo";
  const url = `https://${subdomain}.avaturn.dev`;

  const sdk = new AvaturnSDK();
  sdk.init(container, { url }).then(() => {
    sdk.on("export", (data) => {
      const loader = new GLTFLoader();
      loader.load(
        data.url,
        (gltf) => {
          const avatar = gltf.scene;

          avatar.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
              if (o.material) o.material.envMapIntensity = 0.3;
            }
          });

          computeModelBaseY(avatar);
          faceCamera(avatar);

          if (gltf.animations?.length) {
            const idleClip =
              gltf.animations.find((a) => /idle/i.test(a.name)) || gltf.animations[0];
            idleAction = mixer.clipAction(idleClip);
            idleAction.reset().play();
          } else {
            idleAction = null;
          }

          replaceAvatar(avatar);
        },
        undefined,
        (err) => console.error("Error cargando avatar Avaturn:", err)
      );

      closeIframe();
    });
  });
}

// ============================================================
// Start
// ============================================================
await init();
closeIframe();
