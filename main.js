/**
 * main.js — Avaturn/GLB + Three.js
 * ------------------------------------------------------------
 * ✅ Avatar de frente (quieto en el mundo)
 * ✅ OrbitControls (mueves cámara con ratón)
 * ✅ “Puppet Mode” (mover TODO el cuerpo):
 *    - SkeletonHelper visible
 *    - Markers clicables para seleccionar huesos
 *    - TransformControls (gizmo) para ROTAR / TRASLADAR huesos
 * ✅ Botón #buttonWave: saludar (procedural)
 * ✅ (Opcional) Recorder JSON: si tienes botones/inputs (no rompe si no existen)
 *
 * HTML mínimo requerido:
 * - <div id="container"></div>
 * - <button id="buttonWave">Saludar</button> (opcional, si no existe avisa por consola)
 *
 * Rutas esperadas:
 * - public/model.glb
 * - public/brown_photostudio_01.hdr
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
  enabled: true,
  showSkeleton: true,
  showMarkers: true,
  markerSize: 0.025, // tamaño esfera markers
  mode: "rotate", // "rotate" | "translate"
  space: "local", // "local" | "world"
};

// ============================================================
// Utils (easing)
// ============================================================
function easeInOutCubic(x) {
  x = Math.max(0, Math.min(1, x));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
function bump(x) {
  x = Math.max(0, Math.min(1, x));
  return Math.sin(Math.PI * x); // 0..1..0
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
  root.position.x = 0;
  root.position.z = 0;

  root.rotation.set(0, 0, 0);

  // Si lo ves de espaldas, descomenta:
  // root.rotation.y = Math.PI;
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
// (aplica quaternions -> menos “cosas raras”)
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

  // Recaptura base por si idle movió los huesos
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
// Puppet system (mover cuerpo completo)
// - SkeletonHelper
// - Markers clicables para seleccionar huesos
// - TransformControls para rotar / trasladar huesos
// ============================================================
function enableSkeletonHelper(root) {
  if (skeletonHelper) skeletonHelper.removeFromParent();
  skeletonHelper = new THREE.SkeletonHelper(root);
  skeletonHelper.visible = puppet.showSkeleton;
  scene.add(skeletonHelper);
}

function createBoneMarkers(root) {
  // Cleanup anterior
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

  // Reutilizamos misma geometría para todas
  const geo = new THREE.SphereGeometry(puppet.markerSize, 10, 10);

  for (const bone of bones) {
    const mat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const marker = new THREE.Mesh(geo, mat);

    marker.name = `marker:${bone.name}`;
    marker.userData.bone = bone;

    // Los colocamos por matriz world en updateBoneMarkersWorldMatrices()
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
    // cuando mueves gizmo, apaga orbit
    if (controls) controls.enabled = !e.value;
  });

  scene.add(transformControls);

  // Teclas de control
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
    // Toggle markers/skeleton rápido
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

  // Selección por click en markers
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

  // feedback visual: marca el seleccionado (simple)
  if (boneMarkersGroup) {
    for (const m of boneMarkersGroup.children) {
      const b = m.userData.bone;
      if (!b) continue;
      m.material.color.setHex(b === bone ? 0xff0000 : 0x111111);
    }
  }

  console.log("[puppet] selected bone:", bone.name, " | mode:", puppet.mode, "space:", puppet.space);
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
// Loading avatar (GLB)
// ============================================================
// ============================================================
// Loading helpers (GLB / FBX)
// ============================================================
async function loadFBX(url) {
  const loader = new FBXLoader();
  const object = await loader.loadAsync(url);

  // FBX a menudo viene con escala muy grande o muy pequeña
  // Ajuste conservador (escala 0.01 suele ser común si viene de Mixamo/Blender cm)
  object.scale.setScalar(0.01);

  object.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
      if (o.material) {
        // A veces el FBX trae materiales Phong/Lambert básicos
        // o.material.envMapIntensity = 0.3; 
      }
    }
  });

  computeModelBaseY(object);
  faceCamera(object);

  scene.add(object);

  // Animaciones del FBX
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
  // ... (resto reutilizable si quieres, pero aquí separo para claridad)

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
  // Quita anterior
  if (currentAvatar) {
    deselectBone();
    currentAvatar.removeFromParent();
    disposeGLTF(currentAvatar);
  }

  currentAvatar = newAvatar;

  // Debug útil si quieres: lista de huesos
  // listBones(currentAvatar);

  bindWaveBonesFromAvatar();

  // Puppet setup
  enableSkeletonHelper(currentAvatar);
  createBoneMarkers(currentAvatar);
  initTransformControlsOnce();
}

// ============================================================
// Retargeting Helper (Mixamo -> Avaturn)
// ============================================================
function retargetAnimation(target, clip) {
  const newClip = clip.clone();
  newClip.name = clip.name + "_retarget";

  // 1. Detectar prefijo en el modelo destino (si lo tiene)
  const boneNames = [];
  target.traverse((o) => { if (o.isBone) boneNames.push(o.name); });

  const targetHasPrefix = boneNames.some(n => n.startsWith("mixamorig:"));

  newClip.tracks.forEach((track) => {
    // track.name puede ser "mixamorig:Hips.position" o "mixamorigHips.position"
    let trackName = track.name;

    // Extraer nombre de hueso y propiedad
    const lastDot = trackName.lastIndexOf(".");
    let boneName = lastDot !== -1 ? trackName.substring(0, lastDot) : trackName;
    let property = lastDot !== -1 ? trackName.substring(lastDot) : "";

    // Quitar prefijo mixamorig: o mixamorig
    if (boneName.startsWith("mixamorig:")) {
      boneName = boneName.substring(10);
    } else if (boneName.startsWith("mixamorig")) {
      boneName = boneName.substring(9);
    }

    // Si el avatar QUIERE "mixamorig:" y la anim no lo tiene -> agregamos
    if (targetHasPrefix && !trackName.startsWith("mixamorig")) {
      track.name = `mixamorig:${boneName}${property}`;
    }
    // Si el avatar NO quiere "mixamorig:" y la anim SÍ lo tiene -> quitamos
    else if (!targetHasPrefix && (trackName.startsWith("mixamorig:") || trackName.startsWith("mixamorig"))) {
      track.name = `${boneName}${property}`;
    }

    // FILTRO DE POSICIÓN PARA CADERAS
    // Un problema común es que la animación mueva las Hips a (0,0,0) o al aire.
    // mixamo suele animar Hips.position. 
    // Si quieres que el avatar se quede en su sitio X/Z pero salte en Y, o solo rote,
    // puedes filtrar. Por defecto, dejamos pasar Hips.position pero a veces escala mal.

    // Ejemplo: si el avatar se va volando, comenta esto:
    if (track.name.endsWith(".position") && !track.name.toLowerCase().includes("hips")) {
      // Bloquear traslación de huesos que no sean hips (evita estiramientos raros)
      // track.values = track.values.map(v => 0); // o eliminar track
    }
  });

  // IMPORTANTE: Filtrar Hips.position si causa problemas de escala
  // (el avatar vuela lejos o se va bajo tierra)
  newClip.tracks = newClip.tracks.filter(track => {
    // Mantener solo rotaciones, eliminar traslaciones excepto tal vez Hips Y
    if (track.name === "Hips.position") {
      console.log("🚫 Eliminando track Hips.position para evitar que el avatar vuele");
      return false; // eliminar
    }
    return true;
  });

  return newClip;
}

// ============================================================
// Scene init
// ============================================================
async function init() {
  // ... (setup scene, camera, lights, etc.)
  const container = document.getElementById("container");
  if (!container) throw new Error("No existe #container en el HTML.");

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc0c0c0);
  scene.fog = new THREE.Fog(0xc0c0c0, 20, 50);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);

  controls = new OrbitControls(camera, renderer.domElement);
  camera.position.set(-2, 1, 3);
  controls.target.set(0, 1, 0);

  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.minDistance = 1.2;
  controls.maxDistance = 6.0;
  controls.update();

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

  new RGBELoader().load("public/brown_photostudio_01.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  });

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // 1. Cargar Avatar (GLB)
  const avatar = await loadAvatar("public/model.glb");
  replaceAvatar(avatar);

  // 2. Cargar Animación (FBX) e integrarla
  try {
    const loader = new FBXLoader();
    const animFbx = await loader.loadAsync("public/Block With Rifle.fbx");

    if (animFbx.animations && animFbx.animations.length > 0) {
      console.log("Animación FBX encontrada:", animFbx.animations[0].name);

      // DEBUG: Ver nombres de huesos del avatar
      const avatarBones = [];
      avatar.traverse((o) => { if (o.isBone) avatarBones.push(o.name); });
      console.log("Huesos del avatar:", avatarBones.slice(0, 10));

      // DEBUG: Ver nombres de tracks originales
      let clip = animFbx.animations[0];
      console.log("Tracks originales (muestra):", clip.tracks.slice(0, 5).map(t => t.name));

      // Retarget
      clip = retargetAnimation(avatar, clip);
      console.log("Tracks retargeteados (muestra):", clip.tracks.slice(0, 5).map(t => t.name));
      console.log("Total tracks:", clip.tracks.length);
      console.log("Todos los tracks retargeteados:", clip.tracks.map(t => t.name));

      // Opcional: si la animación viene de Mixamo sin prefijo "mixamorig:" 
      // y tu avatar SÍ lo tiene (o viceversa), a veces hay que renombrar tracks.
      // Por ahora probamos directo:

      // Limpiamos acción anterior (idle)
      if (idleAction) idleAction.stop();

      // Reproducir nueva
      const action = mixer.clipAction(clip);
      action.reset().play();

      console.log("Reproduciendo animación del FBX en el avatar.");
    } else {
      console.warn("El FBX no tiene animaciones.");
    }
  } catch (err) {
    console.warn("Error cargando animación FBX:", err);
  }

  // Stats
  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize);

  wireUI();

  console.log(
    [
      "CONTROLES PUPPET:",
      "- Click en un punto (marker) del esqueleto para seleccionar hueso",
      "- R: modo ROTATE",
      "- T: modo TRANSLATE",
      "- L: alterna Local/World",
      "- M: toggle markers",
      "- K: toggle skeleton",
      "- Esc: deseleccionar",
    ].join("\\n")
  );

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
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
}

// ============================================================
// Render loop
// ============================================================
function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  const t = clock.elapsedTime;

  // Actualiza orbit (damping)
  controls?.update?.();

  // Animaciones (idle)
  mixer.update(dt);

  // Aplica gesto encima (si está activo)
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

  // Sustituye por tu subdominio real
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

          // Idle si viene
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
