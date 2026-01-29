import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { AvaturnSDK } from "https://cdn.jsdelivr.net/npm/@avaturn/sdk/dist/index.js";

let scene, renderer, camera, stats;
let mixer, clock;
let currentAvatar;
let idleAction = null;
let activeAction = null;

// ================================
// ✅ Saludo procedural (MVP)
// ================================
const wave = {
  enabled: true,
  side: "right",      // right/left
  duration: 1.7,      // segundos total
  waves: 3,           // ciclos de agite
  shoulderLift: 0.55, // levantar brazo (rad)
  wristAmp: 0.85,     // agite muñeca (rad)
  wristAxis: "z",     // eje muñeca
  active: false,
  t0: 0,

  // huesos
  upperArm: null,
  foreArm: null,
  hand: null,

  // pose base
  baseUpperArm: null,
  baseForeArm: null,
  baseHand: null,
};

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function bump(x) {
  // campana suave 0..1..0
  x = Math.max(0, Math.min(1, x));
  return Math.sin(Math.PI * x);
}

function findBoneByRegex(root, regexList) {
  const bones = [];
  root.traverse((o) => { if (o.isBone) bones.push(o); });
  const lowered = bones.map((b) => ({ b, n: (b.name || "").toLowerCase() }));
  for (const re of regexList) {
    const hit = lowered.find((x) => re.test(x.n));
    if (hit) return hit.b;
  }
  return null;
}

function initWaveBones() {
  wave.upperArm = null;
  wave.foreArm = null;
  wave.hand = null;
  wave.baseUpperArm = null;
  wave.baseForeArm = null;
  wave.baseHand = null;
  wave.active = false;

  if (!currentAvatar) return;

  const side = wave.side.toLowerCase();

  const upperArmPatterns =
    side === "right"
      ? [/right.*upperarm/, /r.*upperarm/, /right.*arm/, /r.*arm/, /right.*shoulder/, /r.*shoulder/]
      : [/left.*upperarm/, /l.*upperarm/, /left.*arm/, /l.*arm/, /left.*shoulder/, /l.*shoulder/];

  const foreArmPatterns =
    side === "right"
      ? [/right.*forearm/, /r.*forearm/, /right.*elbow/, /r.*elbow/]
      : [/left.*forearm/, /l.*forearm/, /left.*elbow/, /l.*elbow/];

  const handPatterns =
    side === "right"
      ? [/right.*hand/, /r.*hand/, /right.*wrist/, /r.*wrist/]
      : [/left.*hand/, /l.*hand/, /left.*wrist/, /l.*wrist/];

  wave.upperArm = findBoneByRegex(currentAvatar, upperArmPatterns);
  wave.foreArm = findBoneByRegex(currentAvatar, foreArmPatterns);
  wave.hand = findBoneByRegex(currentAvatar, handPatterns);

  if (wave.upperArm) wave.baseUpperArm = wave.upperArm.rotation.clone();
  if (wave.foreArm) wave.baseForeArm = wave.foreArm.rotation.clone();
  if (wave.hand) wave.baseHand = wave.hand.rotation.clone();

  console.log("[wave] bones:", {
    upperArm: wave.upperArm?.name ?? null,
    foreArm: wave.foreArm?.name ?? null,
    hand: wave.hand?.name ?? null,
  });
}

function triggerWave() {
  if (!wave.enabled || !currentAvatar) return;
  if (wave.active) return;

  // si no estaban encontrados, intenta
  if (!wave.upperArm && !wave.hand) initWaveBones();

  // si no hay nada, no se puede
  if (!wave.upperArm && !wave.hand) {
    console.warn("[wave] No se encontraron huesos del brazo/mano.");
    return;
  }

  wave.active = true;
  wave.t0 = clock.elapsedTime;

  // re-captura base por si el idle movió algo
  if (wave.upperArm) wave.baseUpperArm = wave.upperArm.rotation.clone();
  if (wave.foreArm) wave.baseForeArm = wave.foreArm.rotation.clone();
  if (wave.hand) wave.baseHand = wave.hand.rotation.clone();
}

function applyWave(tNow) {
  if (!wave.active) return;

  const p = (tNow - wave.t0) / wave.duration;
  if (p >= 1) {
    // restore
    if (wave.upperArm && wave.baseUpperArm) wave.upperArm.rotation.copy(wave.baseUpperArm);
    if (wave.foreArm && wave.baseForeArm) wave.foreArm.rotation.copy(wave.baseForeArm);
    if (wave.hand && wave.baseHand) wave.hand.rotation.copy(wave.baseHand);
    wave.active = false;
    return;
  }

  // fases:
  // 0..0.25 levantar
  // 0.25..0.85 agitar
  // 0.85..1 bajar
  const liftUp = p < 0.25 ? easeInOutCubic(p / 0.25) : 1;
  const liftDown = p > 0.85 ? 1 - easeInOutCubic((p - 0.85) / 0.15) : 1;
  const lift = Math.min(liftUp, liftDown);

  // ventana de agite
  let w = 0;
  if (p >= 0.25 && p <= 0.85) {
    const wp = (p - 0.25) / 0.60;
    w = bump(wp); // 0..1..0
  }

  // aplicar hombro/upperarm: levantar brazo
  if (wave.upperArm && wave.baseUpperArm) {
    wave.upperArm.rotation.copy(wave.baseUpperArm);
    // Por defecto, levantar en X suele funcionar (si lo ves raro, cambia signo o eje)
    wave.upperArm.rotation.x -= wave.shoulderLift * lift;
  }

  // opcional: doblar codo un poco para naturalidad
  if (wave.foreArm && wave.baseForeArm) {
    wave.foreArm.rotation.copy(wave.baseForeArm);
    wave.foreArm.rotation.x -= 0.20 * lift;
  }

  // agitar muñeca
  if (wave.hand && wave.baseHand) {
    wave.hand.rotation.copy(wave.baseHand);
    const cycles = wave.waves;
    const swing = Math.sin(p * Math.PI * 2 * cycles) * wave.wristAmp * w;

    if (wave.wristAxis === "x") wave.hand.rotation.x += swing;
    else if (wave.wristAxis === "y") wave.hand.rotation.y += swing;
    else wave.hand.rotation.z += swing;
  }
}

// ================================
// ✅ Animación base (idle) con mixer
// ================================
function setAction(next, fade = 0.2) {
  if (!next || next === activeAction) return;
  next.reset().fadeIn(fade).play();
  if (activeAction) activeAction.fadeOut(fade);
  activeAction = next;
}

// ================================
// Scene helpers
// ================================
function computeModelBaseY(root) {
  const box = new THREE.Box3().setFromObject(root);
  const minY = box.min.y;
  root.position.y -= minY;
}

function faceCamera(root) {
  // Coloca el avatar centrado y mirando hacia la cámara
  root.position.x = 0;
  root.position.z = 0;

  // Queremos que mire hacia la cámara (aprox):
  // Cámara en (-2,1,3) mirando a (0,1,0)
  // Forzamos yaw para que mire hacia +Z o -Z según cómo venga el modelo.
  // Si lo ves de espaldas, cambia el signo (Math.PI).
  root.rotation.set(0, 0, 0);
  // root.rotation.y = Math.PI; // <- descomenta si está de espaldas
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

  // mixer: si el model trae animaciones, las usamos
  if (gltf.animations && gltf.animations.length) {
    // buscamos un idle por nombre (tu inspect indica "IdleV4.2...")
    const idleClip =
      gltf.animations.find((a) => /idle/i.test(a.name)) || gltf.animations[0];
    idleAction = mixer.clipAction(idleClip);
    setAction(idleAction, 0.0);
  }

  return model;
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

function disposeMaterial(mat) {
  const maps = ["map","normalMap","roughnessMap","metalnessMap","aoMap","emissiveMap","alphaMap","envMap"];
  maps.forEach((k) => mat[k]?.dispose?.());
  mat.dispose?.();
}

function replaceAvatar(newAvatar) {
  if (currentAvatar) {
    currentAvatar.removeFromParent();
    disposeGLTF(currentAvatar);
  }
  currentAvatar = newAvatar;
  initWaveBones();
}

// ================================
// Init + loop
// ================================
async function init() {
  const container = document.getElementById("container");

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc0c0c0);
  scene.fog = new THREE.Fog(0xc0c0c0, 20, 50);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);

  camera.position.set(-2, 1, 3);
  controls.target.set(0, 1, 0);
  controls.update();

  clock = new THREE.Clock();
  mixer = new THREE.AnimationMixer(scene); // mixer necesita un root; usamos scene (simple)

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

  // Carga avatar
  const avatar = await loadAvatar("public/model.glb");
  replaceAvatar(avatar);

  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize);

  // Botón wave
  const btn = document.querySelector("#buttonWave");
  if (btn) btn.addEventListener("click", triggerWave);
  else console.warn("Añade <button id='buttonWave'>Saludar</button> en el HTML");

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// loop
function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  const t = clock.elapsedTime;

  mixer.update(dt);

  // aplicar gesto después del idle para que se imponga
  applyWave(t);

  stats.update();
  renderer.render(scene, camera);
}

// ================================
// Avaturn iframe
// ================================
function openIframe() {
  initAvaturn();
  document.querySelector("#avaturn-sdk-container").hidden = false;
  document.querySelector("#buttonOpen").disabled = true;
}
function closeIframe() {
  document.querySelector("#avaturn-sdk-container").hidden = true;
  document.querySelector("#buttonOpen").disabled = false;
}

function initAvaturn() {
  const container = document.getElementById("avaturn-sdk-container");
  const subdomain = "demo";
  const url = `https://${subdomain}.avaturn.dev`;

  const sdk = new AvaturnSDK();
  sdk.init(container, { url }).then(() => {
    sdk.on("export", (data) => {
      const loader = new GLTFLoader();
      loader.load(data.url, (gltf) => {
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

        // si trae idle, lo reproducimos
        if (gltf.animations && gltf.animations.length) {
          const idleClip =
            gltf.animations.find((a) => /idle/i.test(a.name)) || gltf.animations[0];
          idleAction = mixer.clipAction(idleClip);
          setAction(idleAction, 0.0);
        }

        replaceAvatar(avatar);
      });

      closeIframe();
    });
  });
}

await init();

closeIframe();
document.querySelector("#buttonOpen")?.addEventListener("click", openIframe);
document.querySelector("#buttonClose")?.addEventListener("click", closeIframe);
