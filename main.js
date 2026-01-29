/**
 * main.js — Avatar Avaturn/GLB de frente + gesto “Saludar” + grabación a JSON (keyframes)
 * ------------------------------------------------------------------------------------
 * ✅ Avatar siempre frente a cámara (sin dar vueltas)
 * ✅ Botón “Saludar” (gesto procedural robusto)
 * ✅ “Record” / “Stop” / “Play” del gesto grabado
 * ✅ Guardar / cargar JSON (localStorage + descarga de archivo + carga desde <input type="file">)
 *
 * IDs de UI que (idealmente) existan en tu HTML:
 * - #container
 * - #buttonOpen, #buttonClose, #avaturn-sdk-container  (tu flujo Avaturn)
 * - #buttonWave
 * - #buttonRecord, #buttonStop, #buttonPlay
 * - #buttonSaveJson, #buttonLoadJson, #fileJson
 *
 * Si alguno no existe, el script no se rompe: lo avisa por consola.
 */

import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { AvaturnSDK } from "https://cdn.jsdelivr.net/npm/@avaturn/sdk/dist/index.js";

// ================================
// Estado global Three.js
// ================================
let scene, renderer, camera, stats, controls;
let mixer, clock;
let currentAvatar = null;
let idleAction = null;
let activeAction = null;

// ================================
// Helpers matemáticos
// ================================
function easeInOutCubic(x) {
  x = Math.max(0, Math.min(1, x));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
function bump(x) {
  x = Math.max(0, Math.min(1, x));
  return Math.sin(Math.PI * x); // 0..1..0
}

// ================================
// Recorder: huesos -> JSON -> clip
// ================================
class BoneAnimationRecorder {
  constructor() {
    this.isRecording = false;
    this.startTime = 0;

    /** @type {THREE.Bone[]} */
    this.bones = [];

    /** @type {number[]} */
    this.times = [];

    /** Map boneName -> number[] (x,y,z,w,... por frame) */
    this.valuesByBone = new Map();

    // throttle sampling
    this._acc = 0;
    this.sampleRate = 30; // fps
  }

  /**
   * @param {THREE.Object3D} root
   * @param {string[]} boneNames EXACTOS
   */
  bindBones(root, boneNames) {
    const boneMap = new Map();
    root.traverse((o) => {
      if (o.isBone) boneMap.set(o.name, o);
    });

    this.bones = [];
    this.valuesByBone.clear();

    for (const name of boneNames) {
      const b = boneMap.get(name);
      if (!b) {
        console.warn("[Recorder] Bone no encontrado:", name);
        continue;
      }
      this.bones.push(b);
      this.valuesByBone.set(name, []);
    }

    console.log("[Recorder] bound bones:", this.bones.map((b) => b.name));
  }

  start(nowSeconds) {
    if (!this.bones.length) throw new Error("Recorder: no hay huesos bindeados.");
    this.isRecording = true;
    this.startTime = nowSeconds;
    this.times = [];
    this._acc = 0;
    for (const b of this.bones) this.valuesByBone.set(b.name, []);
    console.log("[Recorder] START");
  }

  capture(dt, nowSeconds) {
    if (!this.isRecording) return;

    // muestreo a sampleRate
    this._acc += dt;
    const step = 1 / this.sampleRate;
    if (this._acc < step) return;
    this._acc = 0;

    const t = nowSeconds - this.startTime;
    this.times.push(t);

    for (const b of this.bones) {
      const arr = this.valuesByBone.get(b.name);
      const q = b.quaternion;
      arr.push(q.x, q.y, q.z, q.w);
    }
  }

  stop() {
    this.isRecording = false;
    console.log("[Recorder] STOP. samples:", this.times.length);
  }

  toJSON(name = "RecordedClip") {
    const duration = this.times.length ? this.times[this.times.length - 1] : 0;
    const values = {};
    for (const b of this.bones) values[b.name] = this.valuesByBone.get(b.name);

    return {
      version: 1,
      name,
      duration,
      times: this.times,
      bones: this.bones.map((b) => b.name),
      values,
    };
  }

  static clipFromJSON(json) {
    if (!json?.bones?.length || !json?.times?.length) {
      throw new Error("JSON inválido: faltan bones/times.");
    }
    const tracks = [];
    for (const boneName of json.bones) {
      const vals = json.values?.[boneName];
      if (!vals?.length) continue;
      tracks.push(new THREE.QuaternionKeyframeTrack(`${boneName}.quaternion`, json.times, vals));
    }
    return new THREE.AnimationClip(json.name || "RecordedClip", json.duration || -1, tracks);
  }
}

// ================================
// Gestión de acciones del mixer
// ================================
function setAction(next, fade = 0.2) {
  if (!next || next === activeAction) return;
  next.reset().fadeIn(fade).play();
  if (activeAction) activeAction.fadeOut(fade);
  activeAction = next;
}

// ================================
// Limpieza de recursos al cambiar avatar
// ================================
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
  for (const k of maps) mat[k]?.dispose?.();
  mat.dispose?.();
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

// ================================
// Colocar avatar en el suelo y de frente
// ================================
function computeModelBaseY(root) {
  const box = new THREE.Box3().setFromObject(root);
  const minY = box.min.y;
  root.position.y -= minY; // apoyo en Y=0
}

function faceCamera(root) {
  // centrado
  root.position.x = 0;
  root.position.z = 0;

  // orientación base
  root.rotation.set(0, 0, 0);

  // Si lo ves de espaldas, descomenta:
  // root.rotation.y = Math.PI;
}

// ================================
// Detectar huesos para el gesto
// ================================
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
  // regex bastante tolerante a rigs
  const upper = findBoneByRegex(root, [
    /right.*upperarm/,
    /r.*upperarm/,
    /right.*shoulder/,
    /r.*shoulder/,
    /right.*arm(?!ature)/, // evita "armature"
    /r.*arm(?!ature)/,
  ]);
  const fore = findBoneByRegex(root, [/right.*forearm/, /r.*forearm/, /right.*elbow/, /r.*elbow/]);
  const hand = findBoneByRegex(root, [/right.*hand/, /r.*hand/, /right.*wrist/, /r.*wrist/]);

  return { upper, fore, hand };
}

// ================================
// Gesto procedural: SALUDAR 👋 (robusto)
// - aplica quaternions (evita gimbal / saltos raros)
// - se superpone al idle (lo aplicamos después del mixer.update)
// ================================
const wave = {
  enabled: true,
  active: false,
  t0: 0,

  duration: 1.7,
  waves: 3,

  // “sensación”: ajusta si quieres
  shoulderLift: 0.55,
  elbowBend: 0.22,
  wristAmp: 0.95,

  // huesos
  upper: null,
  fore: null,
  hand: null,

  // base quaternions
  baseUpper: null,
  baseFore: null,
  baseHand: null,

  // ejes locales aproximados (en rigs distintos puede variar)
  // si lo ves raro, cambia estos ejes/signos
  upperAxis: new THREE.Vector3(1, 0, 0), // levantar brazo
  foreAxis: new THREE.Vector3(1, 0, 0),  // doblar codo
  wristAxis: new THREE.Vector3(0, 0, 1), // agitar muñeca
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

  // re-captura base por si el idle movió cosas
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
    // restore
    if (wave.upper && wave.baseUpper) wave.upper.quaternion.copy(wave.baseUpper);
    if (wave.fore && wave.baseFore) wave.fore.quaternion.copy(wave.baseFore);
    if (wave.hand && wave.baseHand) wave.hand.quaternion.copy(wave.baseHand);
    wave.active = false;
    return;
  }

  // fases: levantar (0..0.25), agitar (0.25..0.85), bajar (0.85..1)
  const up = p < 0.25 ? easeInOutCubic(p / 0.25) : 1;
  const down = p > 0.85 ? 1 - easeInOutCubic((p - 0.85) / 0.15) : 1;
  const lift = Math.min(up, down);

  // ventana wave
  let w = 0;
  if (p >= 0.25 && p <= 0.85) {
    const wp = (p - 0.25) / 0.60;
    w = bump(wp);
  }

  // hombro: levantar
  if (wave.upper && wave.baseUpper) {
    applyQuatOffset(wave.upper, wave.baseUpper, wave.upperAxis, -wave.shoulderLift * lift);
  }

  // codo: doblar un poco
  if (wave.fore && wave.baseFore) {
    applyQuatOffset(wave.fore, wave.baseFore, wave.foreAxis, -wave.elbowBend * lift);
  }

  // muñeca: agitar (senoidal)
  if (wave.hand && wave.baseHand) {
    const swing = Math.sin(p * Math.PI * 2 * wave.waves) * wave.wristAmp * w;
    applyQuatOffset(wave.hand, wave.baseHand, wave.wristAxis, swing);
  }
}

// ================================
// Grabación a JSON (del gesto en tiempo real)
// ================================
const recorder = new BoneAnimationRecorder();
const STORAGE_KEY = "avaturn_gesture_wave_json";
let recordedClipAction = null; // action para reproducir el clip grabado

function bindRecorderToWaveBones() {
  if (!currentAvatar) return;

  // preferimos usar exactamente los huesos encontrados por wave
  if (!wave.upper && !wave.hand) bindWaveBonesFromAvatar();

  const names = [];
  if (wave.upper) names.push(wave.upper.name);
  if (wave.fore) names.push(wave.fore.name);
  if (wave.hand) names.push(wave.hand.name);

  if (!names.length) {
    console.warn("[Recorder] No hay huesos detectados para grabar.");
    return;
  }

  recorder.bindBones(currentAvatar, names);
}

function startRecording() {
  if (!currentAvatar) return;
  bindRecorderToWaveBones();
  try {
    recorder.start(clock.elapsedTime);
  } catch (e) {
    console.error(e);
  }
}

function stopRecording() {
  recorder.stop();
  const json = recorder.toJSON("WaveRecorded");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
  console.log("[Recorder] JSON guardado en localStorage:", STORAGE_KEY, json);
}

function playRecorded() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    console.warn("No hay JSON grabado. Pulsa Record -> Wave -> Stop.");
    return;
  }

  const json = JSON.parse(raw);
  const clip = BoneAnimationRecorder.clipFromJSON(json);

  // Nota: el mixer está creado sobre scene, así que el track target "BoneName.quaternion"
  // se resolverá si el bone existe en la escena (está dentro del avatar ya añadido).
  if (recordedClipAction) recordedClipAction.stop();
  recordedClipAction = mixer.clipAction(clip);

  // Si hay idle, lo dejamos; el clip puede mezclarse “encima” si quieres.
  // Aquí lo reproducimos tal cual:
  recordedClipAction.reset().play();
}

function downloadJSON() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    console.warn("No hay JSON grabado para descargar.");
    return;
  }
  const blob = new Blob([raw], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gesture_wave.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function loadJSONFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const json = JSON.parse(String(reader.result));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
      console.log("[JSON] cargado y guardado en localStorage:", STORAGE_KEY, json);
    } catch (e) {
      console.error("JSON inválido:", e);
    }
  };
  reader.readAsText(file);
}

// ================================
// Carga de avatar (GLB)
// ================================
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

  // Idle desde el propio GLB si existe
  if (gltf.animations?.length) {
    const idleClip = gltf.animations.find((a) => /idle/i.test(a.name)) || gltf.animations[0];
    idleAction = mixer.clipAction(idleClip);
    setAction(idleAction, 0.0);
  } else {
    idleAction = null;
  }

  return model;
}

function replaceAvatar(newAvatar) {
  if (currentAvatar) {
    currentAvatar.removeFromParent();
    disposeGLTF(currentAvatar);
  }
  currentAvatar = newAvatar;

  // Debug útil (descomenta si lo necesitas):
  // listBones(currentAvatar);

  bindWaveBonesFromAvatar();
}

// ================================
// Init scene
// ================================
async function init() {
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
  controls.update();

  clock = new THREE.Clock();
  mixer = new THREE.AnimationMixer(scene);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(3, 3, 5);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = -2;
  dirLight.shadow.camera.left = -2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 40;
  dirLight.shadow.bias = -0.001;
  dirLight.intensity = 3;
  scene.add(dirLight);

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

  // Cargar avatar por defecto
  const avatar = await loadAvatar("public/model.glb");
  replaceAvatar(avatar);

  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize);

  wireUI();

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ================================
// UI wiring (tolerante: no rompe si faltan)
// ================================
function wire(id, fn) {
  const el = document.querySelector(id);
  if (!el) {
    console.warn("Falta en HTML:", id);
    return;
  }
  el.addEventListener("click", fn);
}

function wireUI() {
  // gesto
  wire("#buttonWave", () => triggerWave());

  // grabación
  wire("#buttonRecord", () => startRecording());
  wire("#buttonStop", () => stopRecording());
  wire("#buttonPlay", () => playRecorded());

  // JSON export/import
  wire("#buttonSaveJson", () => downloadJSON());
  wire("#buttonLoadJson", () => {
    const input = document.querySelector("#fileJson");
    if (input) input.click();
    else console.warn("Falta #fileJson (input type='file').");
  });

  const fileInput = document.querySelector("#fileJson");
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target?.files?.[0];
      loadJSONFromFile(file);
      // limpiar para permitir recargar el mismo archivo
      e.target.value = "";
    });
  } else {
    console.warn("Falta #fileJson (input type='file').");
  }

  // Avaturn iframe open/close (si existen)
  wire("#buttonOpen", openIframe);
  wire("#buttonClose", closeIframe);
}

// ================================
// Loop
// ================================
function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  const t = clock.elapsedTime;

  // 1) animaciones (idle / clips)
  mixer.update(dt);

  // 2) aplicar gesto procedural “encima”
  updateWave(t);

  // 3) grabar (si activo) -> captura post-animación para registrar el resultado final
  recorder.capture(dt, t);

  stats.update();
  renderer.render(scene, camera);
}

// ================================
// Avaturn iframe
// ================================
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

          // idle desde avatar exportado si viene
          if (gltf.animations?.length) {
            const idleClip =
              gltf.animations.find((a) => /idle/i.test(a.name)) || gltf.animations[0];
            idleAction = mixer.clipAction(idleClip);
            setAction(idleAction, 0.0);
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

// ================================
// Start
// ================================
await init();
closeIframe();

// Nota operativa:
// Para grabar el saludo a JSON:
// 1) Pulsa "Record"
// 2) Pulsa "Saludar"
// 3) Pulsa "Stop"
// 4) "Play" reproduce desde JSON guardado
// 5) "Save JSON" descarga gesture_wave.json
// 6) "Load JSON" + elegir archivo -> lo carga a localStorage
