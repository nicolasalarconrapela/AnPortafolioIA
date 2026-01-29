import * as THREE from "three";

import Stats from "three/addons/libs/stats.module.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// if using package manager: npm install @avaturn/sdk
import { AvaturnSDK } from "https://cdn.jsdelivr.net/npm/@avaturn/sdk/dist/index.js";

let scene, renderer, camera, stats, animationGroup;
let mixer, clock;
let currentAvatar;
let idleAction;

// =======================================================
// ✅ ESTÁTICO: quitamos movimiento circular por completo
// =======================================================

// =======================================================
// ✅ SALUDO REALISTA (trigger por botón)
// =======================================================

let waveBone = null;
let shoulderBone = null;

// Estado de animación del saludo (un pequeño “state machine”)
const waveState = {
  active: false,
  startTime: 0,
  duration: 1.6, // duración total del saludo
  waves: 3,      // número de “agites”
  // valores base (para volver a la pose original)
  baseHandRot: null,
  baseShoulderRot: null,
};

// Config fino (ajústalo a gusto)
const waveConfig = {
  side: "right",   // "right" o "left"
  handAxis: "z",   // eje de muñeca/mano para agitar
  handAmp: 0.9,    // amplitud del agite mano (rad)
  shoulderLift: 0.55, // levantar brazo (rad)
  elbowBend: 0.0,  // si encuentras antebrazo y quieres doblar, lo ampliamos
};

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
  maps.forEach((k) => {
    if (mat[k]) mat[k].dispose?.();
  });
  mat.dispose?.();
}

function computeModelBaseY(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const minY = box.min.y;
  root.position.y -= minY; // apoya en el suelo
  return size.y;
}

function normalizeAvatarFacingFront(root) {
  // ✅ Dejar el avatar “de frente” mirando hacia la cámara.
  // Tu cámara está en (-2,1,3) mirando a (0,1,0).
  // Si el modelo viene con orientación rara, normalmente basta con rotarlo en Y.
  // Ajuste conservador: lo ponemos mirando al +Z (o -Z) según tu escena.
  root.rotation.set(0, 0, 0);

  // Si lo ves de espaldas, cambia a:
  // root.rotation.y = Math.PI;
}

async function loadAvatar(url) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);

  const newModel = gltf.scene;

  newModel.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
      if (object.material) {
        object.material.envMapIntensity = 0.3;
        if (object.material.map && !object.material.name?.includes("hair")) {
          object.material.map.generateMipmaps = false;
          object.material.map.needsUpdate = true;
        }
      }
    }
  });

  const approxHeight = computeModelBaseY(newModel);

  // posición base (centro)
  newModel.position.set(0, newModel.position.y, 0);

  // orientación frontal estable
  normalizeAvatarFacingFront(newModel);

  animationGroup.add(newModel);
  scene.add(newModel);

  return { model: newModel, approxHeight, gltf };
}

function filterAnimation(animation) {
  animation.tracks = animation.tracks.filter((track) => {
    const name = track.name;
    return name.endsWith("Hips.position") || name.endsWith(".quaternion");
  });
  return animation;
}

function replaceAvatar(newAvatar) {
  if (currentAvatar) {
    animationGroup.uncache(currentAvatar);
    animationGroup.remove(currentAvatar);
    currentAvatar.removeFromParent();
    disposeGLTF(currentAvatar);
  }
  currentAvatar = newAvatar;

  // reiniciar huesos de saludo
  initWaveBonesForCurrentAvatar();
}

function findBoneByPatterns(root, patterns) {
  const bones = [];
  root.traverse((obj) => {
    if (obj.isBone) bones.push(obj);
  });

  const lowered = bones.map((b) => ({ b, n: (b.name || "").toLowerCase() }));

  for (const re of patterns) {
    const hit = lowered.find((x) => re.test(x.n));
    if (hit) return hit.b;
  }
  return null;
}

function initWaveBonesForCurrentAvatar() {
  waveBone = null;
  shoulderBone = null;

  waveState.baseHandRot = null;
  waveState.baseShoulderRot = null;
  waveState.active = false;

  if (!currentAvatar) return;

  const side = waveConfig.side.toLowerCase();

  const handPatterns =
    side === "right"
      ? [
          /right.*hand/, /r.*hand/, /hand.*r/,
          /right.*wrist/, /r.*wrist/,
        ]
      : [
          /left.*hand/, /l.*hand/, /hand.*l/,
          /left.*wrist/, /l.*wrist/,
        ];

  const shoulderPatterns =
    side === "right"
      ? [
          /right.*shoulder/, /r.*shoulder/,
          /right.*upperarm/, /r.*upperarm/,
          /right.*arm/, /r.*arm/,
        ]
      : [
          /left.*shoulder/, /l.*shoulder/,
          /left.*upperarm/, /l.*upperarm/,
          /left.*arm/, /l.*arm/,
        ];

  waveBone = findBoneByPatterns(currentAvatar, handPatterns);
  shoulderBone = findBoneByPatterns(currentAvatar, shoulderPatterns);

  if (waveBone) waveState.baseHandRot = waveBone.rotation.clone();
  if (shoulderBone) waveState.baseShoulderRot = shoulderBone.rotation.clone();

  if (!waveBone && !shoulderBone) {
    console.warn("[wave] No se encontraron huesos del brazo/mano. El modelo puede tener nombres no estándar.");
  } else {
    console.log("[wave] Huesos:", {
      hand: waveBone?.name ?? null,
      shoulder: shoulderBone?.name ?? null,
    });
  }
}

// Easing suave para gesto realista
function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// Saludo: levanta brazo + agita muñeca 2–3 veces + vuelve
function startWave() {
  if (!currentAvatar) return;
  if (waveState.active) return; // evita spam

  // si por lo que sea no estaban inicializados
  if (!waveState.baseHandRot && !waveState.baseShoulderRot) {
    initWaveBonesForCurrentAvatar();
  }

  waveState.active = true;
  waveState.startTime = clock.elapsedTime;
}

function applyWave(tNow) {
  if (!waveState.active) return;

  const t0 = waveState.startTime;
  const D = waveState.duration;
  let p = (tNow - t0) / D;

  if (p >= 1) {
    // Restaurar pose original y terminar
    if (waveBone && waveState.baseHandRot) waveBone.rotation.copy(waveState.baseHandRot);
    if (shoulderBone && waveState.baseShoulderRot) shoulderBone.rotation.copy(waveState.baseShoulderRot);
    waveState.active = false;
    return;
  }

  // fase con easing global
  const e = easeInOutCubic(p);

  // 1) Lift del hombro (sube rápido al inicio y mantiene)
  // usamos una curva que sube y baja al final
  // “campana”: sube (0->0.25), mantiene (0.25->0.75), baja (0.75->1)
  let liftFactor;
  if (p < 0.25) liftFactor = easeInOutCubic(p / 0.25);
  else if (p < 0.75) liftFactor = 1;
  else liftFactor = 1 - easeInOutCubic((p - 0.75) / 0.25);

  if (shoulderBone && waveState.baseShoulderRot) {
    shoulderBone.rotation.copy(waveState.baseShoulderRot);
    // levantar en X suele funcionar (depende del rig). Si no, cambia a Z o Y.
    shoulderBone.rotation.x -= waveConfig.shoulderLift * liftFactor;
  }

  // 2) Agite de muñeca (solo en la fase central, evita agitar cuando sube/baja)
  // ventana activa 0.25..0.85
  const wStart = 0.25;
  const wEnd = 0.85;
  let waveWindow = 0;
  if (p < wStart) waveWindow = 0;
  else if (p > wEnd) waveWindow = 0;
  else {
    // normaliza 0..1 dentro de la ventana
    const wp = (p - wStart) / (wEnd - wStart);
    // suaviza entrada/salida
    waveWindow = easeInOutCubic(wp) * (1 - easeInOutCubic(wp)); // tipo “bump”
    waveWindow *= 4; // re-normalizar pico
  }

  if (waveBone && waveState.baseHandRot) {
    waveBone.rotation.copy(waveState.baseHandRot);

    // frecuencia controlada: waves completas dentro de la ventana
    const cycles = waveState.waves;
    const swing = Math.sin((p * Math.PI * 2) * cycles) * waveConfig.handAmp * waveWindow;

    if (waveConfig.handAxis === "x") waveBone.rotation.x += swing;
    else if (waveConfig.handAxis === "y") waveBone.rotation.y += swing;
    else waveBone.rotation.z += swing;
  }
}

// =======================================================
// INIT
// =======================================================

async function init() {
  const container = document.getElementById("container");

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Camera + controls
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);

  camera.position.set(-2, 1, 3);
  controls.target.set(0, 1, 0);
  controls.update();

  clock = new THREE.Clock();

  animationGroup = new THREE.AnimationObjectGroup();
  mixer = new THREE.AnimationMixer(animationGroup);

  // Scene + lights + env
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc0c0c0);
  scene.fog = new THREE.Fog(0xc0c0c0, 20, 50);

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

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  // Load default avatar
  const { model: defaultAvatar } = await loadAvatar("public/model.glb");
  currentAvatar = defaultAvatar;

  // Inicializa huesos para saludo
  initWaveBonesForCurrentAvatar();

  // Load default animation (si existe, la reproduce)
  // OJO: si esta animación mueve brazos, puede competir con nuestro saludo.
  // Por eso el saludo se aplica DESPUÉS del mixer.update().
  const loader = new GLTFLoader();
  loader.load("public/animation.glb", function (gltf) {
    if (!gltf.animations || gltf.animations.length === 0) return;

    const clip = filterAnimation(gltf.animations[0]);
    const action = mixer.clipAction(clip);
    idleAction = action;
    idleAction.reset().play();
  });

  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize);

  // ✅ Botón “Saludar”
  const btnWave = document.querySelector("#buttonWave");
  if (btnWave) {
    btnWave.addEventListener("click", () => startWave());
  } else {
    console.warn("[wave] No existe #buttonWave en el HTML. Añádelo para disparar el saludo.");
  }

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const t = clock.elapsedTime;

  // Animación base (idle)
  mixer.update(delta);

  // ✅ Saludo por botón (se aplica tras el mixer)
  applyWave(t);

  stats.update();
  renderer.render(scene, camera);
}

// =======================================================
// Avaturn iframe + export
// =======================================================

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

  // Replace it with your own subdomain
  const subdomain = "demo";
  const url = `https://${subdomain}.avaturn.dev`;

  const sdk = new AvaturnSDK();
  sdk.init(container, { url }).then(() => {
    sdk.on("export", (data) => {
      loadAvatar(data.url).then(({ model }) => {
        replaceAvatar(model);

        // Si hay idleAction y quieres mantenerla:
        if (idleAction) {
          idleAction.reset().play();
        }
      });

      closeIframe();
    });
  });
}

// =======================================================
// Boot
// =======================================================

await init();

closeIframe();
document.querySelector("#buttonOpen")?.addEventListener("click", openIframe);
document.querySelector("#buttonClose")?.addEventListener("click", closeIframe);
