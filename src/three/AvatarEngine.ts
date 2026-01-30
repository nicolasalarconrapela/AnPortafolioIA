import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import { FBXLoader } from "three-stdlib";
import { RGBELoader } from "three-stdlib";
import { OrbitControls } from "three-stdlib";
import { disposeObject3D, disposeRenderer } from "./dispose";

/** Estados posibles del motor */
export type EngineStatus =
  | "initializing"
  | "ready"
  | "rendering"
  | "stopped"
  | "disposed"
  | "loading_avatar"
  | "error";

/** Opciones de configuración */
export interface AvatarEngineOptions {
  maxDPR?: number;
  onStatus?: (status: EngineStatus, message?: string) => void;
}

/** Estructura para animaciones disponibles */
export interface AnimationItem {
  name: string;
  path: string;
}

/** Configuración de la ola (saludo procedural) */
interface WaveState {
  enabled: boolean;
  active: boolean;
  t0: number;
  duration: number;
  waves: number;
  shoulderLift: number;
  elbowBend: number;
  wristAmp: number;
  upper: THREE.Bone | null;
  fore: THREE.Bone | null;
  hand: THREE.Bone | null;
  baseUpper: THREE.Quaternion | null;
  baseFore: THREE.Quaternion | null;
  baseHand: THREE.Quaternion | null;
  upperAxis: THREE.Vector3;
  foreAxis: THREE.Vector3;
  wristAxis: THREE.Vector3;
}

/**
 * MOTOR AVATAR: Lógica completa migrada de main.js
 */
export class AvatarEngine {
  private canvas: HTMLCanvasElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private clock: THREE.Clock | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private controls: OrbitControls | null = null;
  private rafId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private host: HTMLElement | null = null;

  // Estado del Avatar
  private currentAvatar: THREE.Group | null = null;
  private idleAction: THREE.AnimationAction | null = null;
  private currentAnimationAction: THREE.AnimationAction | null = null;

  // Configuración
  private maxDPR: number;
  private onStatus?: (status: EngineStatus, message?: string) => void;
  private currentStatus: EngineStatus = "initializing";

  // Wave (Saludo) State
  private wave: WaveState = {
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

  constructor(options: AvatarEngineOptions = {}) {
    this.maxDPR = options.maxDPR ?? 1.5;
    this.onStatus = options.onStatus;
  }

  // ============================================================
  // CICLO DE VIDA (INIT, START, STOP, DISPOSE)
  // ============================================================

  public async init(hostElement: HTMLElement): Promise<void> {
    if (!hostElement) throw new Error("[AvatarEngine] Host element required");
    this.host = hostElement;
    this.updateStatus("initializing", "Creando escena...");

    // 1. Renderer
    this.canvas = document.createElement("canvas");
    this.canvas.style.display = "block";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.host.appendChild(this.canvas);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false, // main.js tenía alpha: false y background color
      powerPreference: "high-performance",
    });
    const dpr = Math.min(window.devicePixelRatio, this.maxDPR);
    this.renderer.setPixelRatio(dpr);
    this.renderer.shadowMap.enabled = true;

    // 2. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f5f5); // Color original main.js

    // 3. Camera (Interview mode)
    const aspect = this.host.clientWidth / this.host.clientHeight;
    this.camera = new THREE.PerspectiveCamera(35, aspect, 0.02, 100);

    // 4. Controls (desactivados pero instanciados como en main.js)
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enabled = false;
    this.controls.enableDamping = false;

    // 5. Lights & Environment
    this.setupLighting();

    // 6. Mixer & Clock
    this.clock = new THREE.Clock();
    this.mixer = new THREE.AnimationMixer(this.scene);

    // 7. Resize Handler
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.resize();

    // 8. Cargar Avatar
    this.updateStatus("loading_avatar", "Cargando avatar base...");
    try {
      // Intentamos cargar el modelo desde public/model.glb
      const avatar = await this.loadAvatar("/model.glb");
      this.replaceAvatar(avatar);

      this.updateStatus("ready", "Avatar listo");

      // Intentamos cargar ambiente HDR (opcional, no bloqueante)
      this.loadEnvironment("/brown_photostudio_01.hdr");
    } catch (err) {
      console.error(err);
      this.updateStatus("error", "Error cargando avatar");
    }
  }

  public start(): void {
    if (!this.renderer) return;
    if (this.rafId !== null) return;

    this.updateStatus("rendering", "Loop activo");
    this.loop();
  }

  public stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
      this.updateStatus("stopped", "Loop detenido");
    }
  }

  public dispose(): void {
    this.stop();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.scene) {
      disposeObject3D(this.scene);
      this.scene.clear();
      this.scene = null;
    }
    if (this.renderer) {
      disposeRenderer(this.renderer);
      this.renderer = null;
    }
    if (this.canvas?.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }

    // Limpieza específica
    this.currentAvatar = null;
    this.mixer = null;
    this.clock = null;
    this.controls = null;

    this.updateStatus("disposed");
  }

  // ============================================================
  // LOADERS & SCENE SETUP
  // ============================================================

  private setupLighting(): void {
    if (!this.scene) return;
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemi.position.set(0, 20, 0);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff);
    dir.position.set(3, 3, 5);
    dir.castShadow = true;
    dir.shadow.bias = -0.001;
    dir.intensity = 3;
    this.scene.add(dir);
  }

  private loadEnvironment(url: string): void {
    if (!this.scene) return;
    new RGBELoader().load(
      url,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        if (this.scene) this.scene.environment = texture;
      },
      undefined,
      (err) => console.warn("HDR load error (ignorable):", err)
    );
  }

  private async loadAvatar(url: string): Promise<THREE.Group> {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(url);
    const model = gltf.scene;

    // DIAGNOSTICO: Verificar huesos del avatar cargado
    const boneNames: string[] = [];
    model.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
      if ((o as THREE.Bone).isBone) {
        boneNames.push(o.name);
      }
    });

    console.log(`[AvatarEngine] Avatar loaded. Bones: ${boneNames.length}`, {
      sampleBones: boneNames.slice(0, 5),
      hasMixamoPrefix: boneNames.some((b) => b.startsWith("mixamorig")),
    });

    this.computeModelBaseY(model);
    this.faceCameraSetup(model);

    // Si el propio GLB trae animaciones (ej. Idle integrada)
    if (gltf.animations?.length) {
      console.log(
        `[AvatarEngine] Built-in animations found: ${gltf.animations.length}`
      );
      // Crear mixer temporal solo si hay animaciones nativas, aunque luego se recreará en replaceAvatar
      this.mixer = new THREE.AnimationMixer(model);
      const idleClip =
        gltf.animations.find((a) => /idle/i.test(a.name)) || gltf.animations[0];
      this.idleAction = this.mixer.clipAction(idleClip);
      this.idleAction.play();
    }

    return model;
  }

  // ============================================================
  // AVATAR LOGIC
  // ============================================================

  public replaceAvatar(newAvatar: THREE.Group): void {
    if (!this.scene || !this.camera) return;

    // Limpiar anterior
    if (this.currentAvatar) {
      this.scene.remove(this.currentAvatar);
      disposeObject3D(this.currentAvatar);
    }

    this.currentAvatar = newAvatar;
    this.scene.add(this.currentAvatar);

    // CRÍTICO: Recrear el Mixer vinculado al NUEVO AVATAR, no a la escena
    // Esto asegura que animate() actualice los huesos de ESTE modelo específico
    if (this.mixer) this.mixer.stopAllAction();
    this.mixer = new THREE.AnimationMixer(this.currentAvatar);

    // Bind para saludo
    this.bindWaveBones();

    // Auto-encuadre
    this.frameUpperBody();
  }

  public async loadAnimationFromUrl(url: string): Promise<void> {
    if (!this.currentAvatar || !this.mixer) {
      console.warn(
        "[AvatarEngine] Cannot load animation: Avatar or Mixer not ready"
      );
      return;
    }

    try {
      console.log(`[AvatarEngine] Loading FBX Animation: ${url}`);
      const loader = new FBXLoader();
      const animFbx = await loader.loadAsync(url);

      if (!animFbx.animations || animFbx.animations.length === 0) {
        console.warn("[AvatarEngine] El FBX no tiene animaciones");
        return;
      }

      let clip = animFbx.animations[0];
      const originalDuration = clip.duration;

      // Retargeting
      clip = this.retargetAnimation(this.currentAvatar, clip);

      // DIAGNÓSTICO DE MATCHING
      // Verificamos si los tracks de la animación realmente targetean huesos existentes
      let matchCount = 0;
      clip.tracks.forEach((track) => {
        // El track name suele ser "BoneName.property"
        const boneName = track.name.split(".")[0];
        const found = this.currentAvatar?.getObjectByName(boneName);
        if (found) matchCount++;
      });

      console.log(`[AvatarEngine] Animation Applied.`, {
        clipName: clip.name,
        duration: clip.duration,
        originalTracks: animFbx.animations[0].tracks.length,
        retargetedTracks: clip.tracks.length,
        matchedBones: matchCount, // Si esto es bajo o 0, el retarget falló
        sampleTrack: clip.tracks[0]?.name,
      });

      if (matchCount === 0) {
        console.error(
          "[AvatarEngine] CRITICAL: Animation tracks do not match any bone in the avatar! Check naming prefixes."
        );
      }

      if (this.currentAnimationAction) this.currentAnimationAction.stop();
      if (this.idleAction) this.idleAction.stop();

      const action = this.mixer.clipAction(clip);
      action.reset().fadeIn(0.2).play();
      this.currentAnimationAction = action;
    } catch (e) {
      console.error("[AvatarEngine] Error loading animation:", e);
    }
  }

  // --- Helpers de Posición ---

  private computeModelBaseY(root: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(root);
    const minY = box.min.y;
    root.position.y -= minY;
  }

  private faceCameraSetup(root: THREE.Object3D): void {
    // Centrado absoluto
    root.position.set(0, 0, 0);

    // Mirar de frente: sin yaw (rotación Y)
    root.rotation.set(0, 0, 0);

    // Si el GLB viene con una rotación base rara, puedes preferir:
     root.quaternion.identity();
  }

  // --- Frame Camera Logic (Entrevista / Plano Medio) ---
  // AQUI SE CONFIGURA LA POSICIÓN Y ZOOM DE LA CÁMARA

  public frameUpperBody(): void {
    if (!this.camera || !this.currentAvatar) return;

    // CONFIGURACIÓN DE CÁMARA
    // Ajusta estos valores para cambiar el encuadre
    const opts = {
      targetHeightRatio: 0.79, // Altura del punto de mira (0.79 = ~pecho/cuello)
      heightPortion: 0.55, // Qué porción del avatar debe ocupar la pantalla (menor = más zoom)

      distanceMultiplier: 1.5, // Multiplicador de distancia final (mayor = más lejos)
      offsetY: -0.01, // Ajuste fino vertical (+ sube cámara, - baja cámara)

      // Límites de seguridad
      minDistance: 1.0,
      maxDistance: 6.0,
      minNear: 0.01,
      nearFactor: 0.02,
    };

    const root = this.currentAvatar;
    root.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(root);
    if (box.isEmpty()) return;

    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const target = new THREE.Vector3(
      center.x,
      box.min.y + size.y * opts.targetHeightRatio + opts.offsetY,
      center.z
    );

    const effectiveHeight = Math.max(0.2, size.y * opts.heightPortion);
    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    let distance =
      (effectiveHeight / (2 * Math.tan(fov / 2))) * opts.distanceMultiplier;
    distance = THREE.MathUtils.clamp(
      distance,
      opts.minDistance,
      opts.maxDistance
    );

    // Posición cámara (frontal)
    this.camera.position.set(target.x, target.y, target.z + distance);

    this.camera.near = Math.max(opts.minNear, distance * opts.nearFactor);
    this.camera.far = Math.max(this.camera.near + 10, distance * 50);
    this.camera.updateProjectionMatrix();

    this.camera.lookAt(target);

    if (this.controls) {
      this.controls.target.copy(target);
      this.controls.update();
    }
  }

  // --- Wave Logic (Saludo) ---

  public triggerWave(): void {
    if (!this.wave.enabled || !this.currentAvatar) return;
    if (this.wave.active) return;

    // Si no están bindeados, intentar
    if (!this.wave.upper) this.bindWaveBones();
    if (!this.wave.upper) {
      console.warn("Wave: huesos no encontrados");
      return;
    }

    // Guardar estado base actual
    this.wave.baseUpper = this.wave.upper!.quaternion.clone();
    this.wave.baseFore = this.wave.fore?.quaternion.clone() || null;
    this.wave.baseHand = this.wave.hand?.quaternion.clone() || null;

    if (this.clock) {
      this.wave.t0 = this.clock.elapsedTime;
      this.wave.active = true;
    }
  }

  private bindWaveBones(): void {
    if (!this.currentAvatar) return;
    const findBone = (regexes: RegExp[]) => {
      let found: THREE.Bone | null = null;
      this.currentAvatar!.traverse((o) => {
        if (
          !found &&
          (o as THREE.Bone).isBone &&
          regexes.some((r) => r.test(o.name.toLowerCase()))
        ) {
          found = o as THREE.Bone;
        }
      });
      return found;
    };

    this.wave.upper = findBone([
      /right.*upperarm/,
      /r.*upperarm/,
      /right.*shoulder/,
      /r.*shoulder/,
      /right.*arm(?!ature)/,
    ]);
    this.wave.fore = findBone([
      /right.*forearm/,
      /r.*forearm/,
      /right.*elbow/,
      /r.*elbow/,
    ]);
    this.wave.hand = findBone([
      /right.*hand/,
      /r.*hand/,
      /right.*wrist/,
      /r.*wrist/,
    ]);
  }

  private updateWave(t: number): void {
    if (!this.wave.active || !this.wave.upper) return;

    const p = (t - this.wave.t0) / this.wave.duration;

    if (p >= 1) {
      // Restaurar
      if (this.wave.upper && this.wave.baseUpper)
        this.wave.upper.quaternion.copy(this.wave.baseUpper);
      if (this.wave.fore && this.wave.baseFore)
        this.wave.fore.quaternion.copy(this.wave.baseFore);
      if (this.wave.hand && this.wave.baseHand)
        this.wave.hand.quaternion.copy(this.wave.baseHand);
      this.wave.active = false;
      return;
    }

    // Easing logic (copy-pasted de main.js)
    const easeInOutCubic = (x: number) =>
      x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const bump = (x: number) => Math.sin(Math.PI * Math.max(0, Math.min(1, x)));

    const up = p < 0.25 ? easeInOutCubic(p / 0.25) : 1;
    const down = p > 0.85 ? 1 - easeInOutCubic((p - 0.85) / 0.15) : 1;
    const lift = Math.min(up, down);

    let w = 0;
    if (p >= 0.25 && p <= 0.85) {
      const wp = (p - 0.25) / 0.6;
      w = bump(wp);
    }

    const { shoulderLift, elbowBend, wristAmp, waves } = this.wave;

    // Aplicar rotaciones
    const apply = (
      bone: THREE.Bone | null,
      base: THREE.Quaternion | null,
      axis: THREE.Vector3,
      rads: number
    ) => {
      if (bone && base) {
        const dq = new THREE.Quaternion().setFromAxisAngle(axis, rads);
        bone.quaternion.copy(base).multiply(dq);
      }
    };

    apply(
      this.wave.upper,
      this.wave.baseUpper,
      this.wave.upperAxis,
      -shoulderLift * lift
    );
    apply(
      this.wave.fore,
      this.wave.baseFore,
      this.wave.foreAxis,
      -elbowBend * lift
    );

    const swing = Math.sin(p * Math.PI * 2 * waves) * wristAmp * w;
    apply(this.wave.hand, this.wave.baseHand, this.wave.wristAxis, swing);
  }

  // --- Retargeting ---

  private retargetAnimation(
    target: THREE.Object3D,
    clip: THREE.AnimationClip
  ): THREE.AnimationClip {
    const newClip = clip.clone();
    newClip.name = clip.name + "_retarget";

    // Detect prefixes
    const boneNames: string[] = [];
    target.traverse((o) => {
      if ((o as THREE.Bone).isBone) boneNames.push(o.name);
    });
    const targetHasPrefix = boneNames.some((n) => n.startsWith("mixamorig:"));

    newClip.tracks.forEach((track) => {
      // Logic de rename simple
      let trackName = track.name;
      const lastDot = trackName.lastIndexOf(".");
      let boneName =
        lastDot !== -1 ? trackName.substring(0, lastDot) : trackName;
      const property = lastDot !== -1 ? trackName.substring(lastDot) : "";

      // Strip prefix
      if (boneName.startsWith("mixamorig:")) boneName = boneName.substring(10);
      else if (boneName.startsWith("mixamorig"))
        boneName = boneName.substring(9);

      // Add prefix if needed
      if (targetHasPrefix && !trackName.startsWith("mixamorig")) {
        track.name = `mixamorig:${boneName}${property}`;
      } else if (!targetHasPrefix && trackName.startsWith("mixamorig")) {
        track.name = `${boneName}${property}`;
      }
    });

    // Remove hips position (flying fix)
    newClip.tracks = newClip.tracks.filter((tr) => {
      // En main.js original solo se filtraba Hips.position.
      // Filtrar todo .position puede romper rigs que dependen de translaciones locales.
      if (tr.name === "Hips.position" || tr.name === "mixamorig:Hips.position")
        return false;
      return true;
    });

    return newClip;
  }

  // ============================================================
  // LOOP & EVENTS
  // ============================================================

  private loop = (): void => {
    if (!this.renderer || !this.scene || !this.camera || !this.clock) return;

    this.rafId = requestAnimationFrame(this.loop);

    const dt = this.clock.getDelta();
    const t = this.clock.elapsedTime;

    if (this.mixer) this.mixer.update(dt);
    this.updateWave(t);
    if (this.controls) this.controls.update();

    this.renderer.render(this.scene, this.camera);
  };

  private resize(): void {
    if (!this.host || !this.camera || !this.renderer) return;
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;

    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);

    // Re-frame on resize to keep centered
    this.frameUpperBody();
  }

  private updateStatus(status: EngineStatus, msg?: string) {
    this.currentStatus = status;
    this.onStatus?.(status, msg);
  }

  public getStatus() {
    return this.currentStatus;
  }
}
