import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CREATURE, type Colorway } from "@/lib/collection";
import { MODELS, type Part, type Role } from "@/lib/three/models";

/* ------------------------------------------------------------------ helpers */

const U = 50; // SVG units per world unit
const P = (x: number, y: number, z = 0) => new THREE.Vector3((x - 100) / U, (172 - y) / U, z / U);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeOutBack = (x: number, s = 1.9) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const smooth = (a: number, b: number, t: number) => {
  const x = clamp((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};

const svg = new SVGLoader();
function svgPaths(d: string) {
  return svg.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`).paths;
}

const SILHOUETTE: Colorway = { name: "?", body: "#2b2b33", shade: "#24242b", belly: "#2b2b33", accent: "#24242b", eye: "#2b2b33" };

function roleColor(role: Role, c: Colorway) {
  switch (role) {
    case "body":
      return c.body;
    case "shade":
      return c.shade;
    case "belly":
      return c.belly;
    case "accent":
    case "crystal":
      return c.accent;
    case "eye":
      return c.eye;
    case "white":
      return c === SILHOUETTE ? c.body : "#ffffff";
    case "pink":
      return c === SILHOUETTE ? c.body : "#ff8fa8";
  }
}

/** Glossy vinyl-toy materials (clearcoat), glassy crystals, wet-looking eyes. */
function makeMaterials(c: Colorway) {
  const vinyl = (color: string, rough = 0.42) =>
    new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0, clearcoat: 0.85, clearcoatRoughness: 0.16, sheen: 0.25, sheenRoughness: 0.6 });
  const m: Record<Role, THREE.MeshPhysicalMaterial> = {
    body: vinyl(c.body),
    shade: vinyl(c.shade, 0.48),
    belly: vinyl(c.belly, 0.5),
    accent: vinyl(c.accent, 0.3),
    eye: new THREE.MeshPhysicalMaterial({ color: c.eye, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.02 }),
    white: new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 }),
    pink: vinyl("#ff8fa8", 0.6),
    crystal: new THREE.MeshPhysicalMaterial({ color: c.accent, roughness: 0.06, metalness: 0, transmission: 0.82, thickness: 0.6, ior: 1.5, clearcoat: 1, attenuationColor: new THREE.Color(c.accent), attenuationDistance: 1.2 }),
  };
  return m;
}

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material) {
  const o = new THREE.Mesh(geo, mat);
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
}

const SPHERE = new THREE.SphereGeometry(1, 64, 40);
const HALF = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);

function ellipsoidPoint(at: [number, number], r: [number, number, number], u: number, v: number, w: number) {
  const c = P(at[0], at[1]);
  const pos = new THREE.Vector3(c.x + (u * r[0]) / U, c.y + (v * r[1]) / U, c.z + (w * r[2]) / U);
  const n = new THREE.Vector3(u / r[0], v / r[1], w / r[2]).normalize();
  return { pos, n };
}

/* ------------------------------------------------------------------ creature */

export function buildCreature(id: string, cw: Colorway) {
  const mats = makeMaterials(cw);
  const g = new THREE.Group();
  const add = (o: THREE.Object3D) => g.add(o);

  for (const p of MODELS[id].parts as Part[]) {
    switch (p.k) {
      case "ell": {
        const o = mesh(SPHERE, mats[p.role]);
        o.scale.set(p.r[0] / U, p.r[1] / U, p.r[2] / U);
        o.position.copy(P(p.at[0], p.at[1], p.z));
        if (p.rot) o.rotation.z = -p.rot;
        add(o);
        break;
      }
      case "tube": {
        for (const path of svgPaths(p.d)) {
          for (const sp of path.subPaths) {
            const pts = sp.getPoints(48).map((v) => P(v.x, v.y, p.z));
            if (pts.length < 2) continue;
            const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
            const r = p.w / 2 / U;
            add(mesh(new THREE.TubeGeometry(curve, 96, r, 20), mats[p.role]));
            for (const end of [pts[0], pts[pts.length - 1]]) {
              const cap = mesh(SPHERE, mats[p.role]);
              cap.scale.setScalar(r);
              cap.position.copy(end);
              add(cap);
            }
          }
        }
        break;
      }
      case "ext": {
        const shapes = svgPaths(p.d).flatMap((path) => SVGLoader.createShapes(path));
        const geo = new THREE.ExtrudeGeometry(shapes, { depth: p.depth, bevelEnabled: true, bevelThickness: 1.4, bevelSize: 1.1, bevelSegments: 4, curveSegments: 32 });
        geo.translate(-100, -172, -p.depth / 2);
        geo.scale(1 / U, -1 / U, -1 / U); // two negative axes keep faces outward
        geo.translate(0, 0, (p.z ?? 0) / U);
        geo.computeVertexNormals();
        add(mesh(geo, mats[p.role]));
        break;
      }
      case "eye": {
        const r = p.r / U;
        const c = P(p.at[0], p.at[1], p.z);
        const sclera = mesh(SPHERE, mats.white);
        sclera.scale.set(r, r, r * 0.8);
        sclera.position.copy(c);
        const pupil = mesh(SPHERE, mats.eye);
        pupil.scale.set(r * 0.64, r * 0.64, r * 0.4);
        pupil.position.set(c.x + r * 0.12, c.y - r * 0.06, c.z + r * 0.62);
        const spec = new THREE.Mesh(SPHERE, new THREE.MeshBasicMaterial({ color: "#ffffff" }));
        spec.scale.setScalar(r * 0.2);
        spec.position.set(c.x - r * 0.18, c.y + r * 0.24, c.z + r * 0.9);
        add(sclera);
        add(pupil);
        add(spec);
        break;
      }
      case "cone": {
        const o = mesh(new THREE.ConeGeometry(p.r / U, p.h / U, 32), mats[p.role]);
        o.position.copy(P(p.at[0], p.at[1], p.z));
        o.rotation.z = -(p.tilt ?? 0);
        add(o);
        break;
      }
      case "crystal": {
        const grp = new THREE.Group();
        const body = mesh(new THREE.CylinderGeometry(p.r / U, p.r / U, (p.h * 0.68) / U, 6), mats.crystal);
        body.position.y = (p.h * 0.34) / U;
        const tip = mesh(new THREE.ConeGeometry(p.r / U, (p.h * 0.32) / U, 6), mats.crystal);
        tip.position.y = (p.h * 0.84) / U;
        grp.add(body, tip);
        grp.position.copy(P(p.at[0], p.at[1], p.z));
        grp.rotation.y = 0.4;
        add(grp);
        break;
      }
      case "torus": {
        const o = mesh(new THREE.TorusGeometry(p.R / U, p.t / U, 24, 96), mats[p.role]);
        o.position.copy(P(p.at[0], p.at[1], p.z));
        add(o);
        break;
      }
      case "box": {
        const o = mesh(new THREE.BoxGeometry(p.s[0] / U, p.s[1] / U, p.s[2] / U), mats[p.role]);
        o.position.copy(P(p.at[0], p.at[1], p.z));
        if (p.rot) o.rotation.z = -p.rot;
        add(o);
        break;
      }
      case "plates": {
        const up = new THREE.Vector3(0, 1, 0);
        for (let i = 0; i < p.rows; i++) {
          const phi = 0.22 * Math.PI + (i / (p.rows - 1)) * 0.36 * Math.PI;
          for (let j = 0; j < p.cols; j++) {
            const theta = (j / p.cols) * Math.PI * 2 + (i % 2) * (Math.PI / p.cols);
            const u = Math.sin(phi) * Math.cos(theta);
            const v = Math.cos(phi);
            const w = Math.sin(phi) * Math.sin(theta);
            const { pos, n } = ellipsoidPoint(p.on.at, p.on.r, u, v, w);
            const o = mesh(HALF, mats[p.role]);
            o.scale.set(p.size / U, (p.size * 0.42) / U, (p.size * 0.9) / U);
            o.position.copy(pos).addScaledVector(n, -0.04);
            o.quaternion.setFromUnitVectors(up, n);
            add(o);
          }
        }
        break;
      }
      case "studs": {
        const fwd = new THREE.Vector3(0, 0, 1);
        const [cx, cy] = p.on.at;
        for (const [x, y] of p.pts) {
          const u = (x - cx) / p.on.r[0];
          const v = (cy - y) / p.on.r[1];
          const w = Math.sqrt(Math.max(0, 1 - u * u - v * v));
          const { pos, n } = ellipsoidPoint(p.on.at, p.on.r, u, v, w);
          const o = mesh(SPHERE, mats[p.role]);
          o.scale.set(p.size / U, p.size / U, (p.size * 0.35) / U);
          o.position.copy(pos);
          o.quaternion.setFromUnitVectors(fwd, n);
          add(o);
        }
        break;
      }
    }
  }
  return { group: g, mats };
}

/* ------------------------------------------------------------------ shell */

const SHELL_R = 1.12;
const PEDESTAL_H = 0.12;

function buildShell(cw: Colorway, locked: boolean) {
  const shellMat = new THREE.MeshPhysicalMaterial({ color: locked ? "#c9c9d1" : cw.shade, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide });
  const innerTint = new THREE.MeshPhysicalMaterial({ color: locked ? "#a9a9b3" : cw.shade, roughness: 0.5, clearcoat: 0.6, side: THREE.BackSide });
  const seamMat = new THREE.MeshPhysicalMaterial({ color: locked ? "#9d9da8" : cw.accent, roughness: 0.25, metalness: 0.35, clearcoat: 1, transparent: true });
  const hubMat = new THREE.MeshPhysicalMaterial({ color: locked ? "#7d7d88" : cw.accent, roughness: 0.2, metalness: 0.4, clearcoat: 1, emissive: new THREE.Color(locked ? "#000000" : cw.accent), emissiveIntensity: 0 });

  const group = new THREE.Group();
  const pivots: { pivot: THREE.Group; axis: THREE.Vector3 }[] = [];
  const gap = 0.025;
  for (let k = 0; k < 4; k++) {
    const start = k * (Math.PI / 2) + Math.PI / 4 + gap;
    const len = Math.PI / 2 - 2 * gap;
    const geo = new THREE.SphereGeometry(SHELL_R, 64, 48, start, len, 0, Math.PI);
    const pivot = new THREE.Group();
    const outer = mesh(geo, shellMat);
    const inner = mesh(geo, innerTint);
    inner.scale.setScalar(0.985);
    outer.position.y = inner.position.y = SHELL_R;
    pivot.add(outer, inner);
    const m = start + len / 2;
    const d = new THREE.Vector3(-Math.cos(m), 0, Math.sin(m));
    pivots.push({ pivot, axis: new THREE.Vector3(d.z, 0, -d.x).normalize() });
    group.add(pivot);
  }
  const ring = mesh(new THREE.TorusGeometry(SHELL_R + 0.012, 0.035, 16, 128), seamMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = SHELL_R;
  group.add(ring);

  const hub = new THREE.Group();
  const disc = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 64), hubMat);
  disc.rotation.x = Math.PI / 2;
  const rim = mesh(new THREE.TorusGeometry(0.3, 0.035, 16, 64), seamMat);
  const holeMat = new THREE.MeshPhysicalMaterial({ color: locked ? "#55555f" : cw.shade, roughness: 0.4 });
  const hole = mesh(SPHERE, holeMat);
  hole.scale.set(0.075, 0.075, 0.03);
  hole.position.set(0, 0.05, 0.055);
  const slot = mesh(new THREE.BoxGeometry(0.06, 0.13, 0.03), holeMat);
  slot.position.set(0, -0.05, 0.055);
  hub.add(disc, rim, hole, slot);
  hub.position.set(0, SHELL_R, SHELL_R + 0.02);
  group.add(hub);

  // Display base the petals fold into.
  const pedestal = new THREE.Group();
  const baseMat = new THREE.MeshPhysicalMaterial({ color: locked ? "#bdbdc6" : cw.shade, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 });
  const base = mesh(new THREE.CylinderGeometry(1.0, 1.08, 0.12, 96), baseMat);
  base.position.y = 0.06;
  const lip = mesh(new THREE.TorusGeometry(1.0, 0.025, 16, 128), new THREE.MeshPhysicalMaterial({ color: locked ? "#9d9da8" : cw.accent, roughness: 0.25, metalness: 0.4, clearcoat: 1 }));
  lip.rotation.x = Math.PI / 2;
  lip.position.y = 0.12;
  pedestal.add(base, lip);
  group.add(pedestal);
  return { group, pivots, ring, seamMat, hub, hubMat, pedestal };
}

/* ------------------------------------------------------------------ stage */

export type StageMode = "static" | "reveal" | "showcase";

export interface StageOptions {
  creature: string;
  colorway: 0 | 1;
  mode: StageMode;
  locked?: boolean;
  altUnlocked?: boolean;
  reduceMotion?: boolean;
}

export class CoreStage3D {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  private pmrem: THREE.PMREMGenerator;
  private subject = new THREE.Group();
  private flash = new THREE.PointLight("#ffffff", 0, 8, 1.5);
  private raf = 0;
  private start = 0;
  private ro?: ResizeObserver;
  private opts!: StageOptions;
  private creature?: ReturnType<typeof buildCreature>;
  private shell?: ReturnType<typeof buildShell>;
  private fromColors?: Record<string, THREE.Color>;
  private toColors?: Record<string, THREE.Color>;
  private turn = 0;
  private started = false;

  constructor(canvas: HTMLCanvasElement, opts: StageOptions, preserve = false) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: preserve });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.75;

    this.scene.add(new THREE.HemisphereLight("#ffffff", "#3a3a48", 0.55));
    const key = new THREE.DirectionalLight("#fff6ea", 2.1);
    key.position.set(3.5, 6.5, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = key.shadow.camera.bottom = -4;
    key.shadow.camera.right = key.shadow.camera.top = 4;
    key.shadow.radius = 6;
    key.shadow.bias = -0.0004;
    this.scene.add(key);
    const rim = new THREE.DirectionalLight("#cfe0ff", 1.5);
    rim.position.set(-5, 3.5, -5);
    this.scene.add(rim);
    this.flash.position.set(0, 1.6, 2.2);
    this.scene.add(this.flash);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.22 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.scene.add(this.subject);

    this.camera.position.set(0, 2.1, 9.4);
    this.camera.lookAt(0, 1.3, 0);
    this.setSubject(opts);
  }

  setSubject(opts: StageOptions) {
    this.opts = opts;
    this.disposeSubject();
    const c = CREATURE[opts.creature];
    const cwA = c.colorways[opts.mode === "showcase" ? 0 : opts.colorway];
    this.shell = buildShell(cwA, !!opts.locked);
    this.subject.add(this.shell.group);
    this.flash.color.set(cwA.accent);
    if (!opts.locked) {
      this.creature = buildCreature(opts.creature, cwA);
      this.turn = MODELS[opts.creature].turn;
      this.subject.add(this.creature.group);
      const target = opts.mode === "showcase" ? (opts.altUnlocked ? c.colorways[1] : SILHOUETTE) : cwA;
      this.fromColors = {};
      this.toColors = {};
      for (const [role, m] of Object.entries(this.creature.mats)) {
        this.fromColors[role] = m.color.clone();
        this.toColors[role] = new THREE.Color(roleColor(role as Role, target));
      }
    }
    this.started = false;
  }

  private disposeSubject() {
    for (const child of [...this.subject.children]) {
      this.subject.remove(child);
      child.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          if (o.geometry !== SPHERE && o.geometry !== HALF) o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
    }
    this.creature = undefined;
    this.shell = undefined;
  }

  /** Pose everything for time t (seconds) on the 11-second timeline. */
  private pose(t: number) {
    const { mode, locked } = this.opts;
    const sh = this.shell!;
    if (mode === "static" || locked) {
      const open = !locked;
      sh.pivots.forEach(({ pivot, axis }) => {
        pivot.quaternion.setFromAxisAngle(axis, 0);
        pivot.visible = !open;
      });
      sh.ring.visible = !open;
      sh.hub.visible = !open;
      sh.pedestal.visible = open;
      sh.pedestal.scale.setScalar(1);
      sh.group.rotation.set(0, locked ? 0.35 : 0, 0);
      if (this.creature) {
        this.creature.group.scale.setScalar(1);
        this.creature.group.rotation.y = this.turn;
        this.creature.group.position.y = PEDESTAL_H;
      }
      return;
    }

    // Shell: spin in, settle, shake, then the four wedges fold down into a pedestal.
    const spawn = clamp(t / 0.9);
    sh.group.scale.setScalar(0.55 + 0.45 * easeOutBack(spawn, 1.4));
    sh.group.rotation.y = -2.4 * (1 - easeOutCubic(clamp(t / 1.8)));
    sh.group.rotation.z = t > 2 && t < 2.8 ? 0.07 * Math.sin((t - 2) * 42) * (1 - (t - 2) / 0.8) : 0;
    const glow = smooth(2.3, 2.9, t);
    sh.hubMat.emissiveIntensity = glow * 1.6;
    sh.hub.scale.setScalar(1 + glow * 0.35);
    sh.hub.visible = t < 3.05;
    const open = easeOutCubic(clamp((t - 2.95) / 1.0));
    const fold = smooth(3.9, 4.7, t); // petals shrink away as the display base rises
    sh.pivots.forEach(({ pivot, axis }) => {
      pivot.quaternion.setFromAxisAngle(axis, open * 1.85);
      pivot.scale.setScalar(Math.max(0.001, 1 - fold));
      pivot.visible = fold < 0.999;
    });
    sh.pedestal.visible = fold > 0.001;
    sh.pedestal.scale.set(Math.max(0.001, fold), Math.max(0.001, fold), Math.max(0.001, fold));
    sh.ring.scale.setScalar(1 + open * 0.7);
    sh.seamMat.opacity = 1 - open;
    sh.ring.visible = open < 0.99;

    // Flash light pulses on opening and on the colourway switch.
    const pulse = (a: number) => Math.max(0, Math.sin(Math.PI * clamp((t - a) / 0.55)));
    this.flash.intensity = 30 * pulse(2.95) + (mode === "showcase" ? 30 * pulse(7.3) : 0);

    const cr = this.creature!;
    const grow = clamp((t - 3.2) / 1.3);
    let s = grow <= 0 ? 0.001 : easeOutBack(grow, 2.4);
    if (mode === "showcase" && t > 7.2 && t < 8.1) s *= 1 - 0.12 * Math.sin((Math.PI * (t - 7.2)) / 0.9);
    cr.group.scale.setScalar(Math.max(0.001, s));
    const idle = Math.max(0, t - 4.5);
    cr.group.position.y = PEDESTAL_H * fold + (this.opts.reduceMotion ? 0 : 0.045 * Math.sin(idle * 2.6) * Math.min(1, idle));
    cr.group.rotation.y = this.turn + (this.opts.reduceMotion ? 0 : 0.32 * Math.sin(idle * 0.55) * Math.min(1, idle));

    if (mode === "showcase" && this.fromColors && this.toColors) {
      const k = smooth(7.4, 7.95, t);
      for (const [role, m] of Object.entries(cr.mats)) m.color.copy(this.fromColors[role]).lerp(this.toColors[role], k);
      const sil = !this.opts.altUnlocked;
      for (const m of Object.values(cr.mats)) {
        m.clearcoat = sil ? 0.85 * (1 - k) + 0.2 * k : m.clearcoat;
      }
    }
  }

  private resize() {
    const c = this.renderer.domElement;
    const w = c.clientWidth || 1;
    const h = c.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.fit(w / h);
  }

  /** Keep the whole figure in frame in tall (portrait) viewports. */
  private fit(aspect: number) {
    this.camera.aspect = aspect;
    const dist = 9.4 * Math.max(1, 0.95 / aspect);
    this.camera.position.set(0, 2.1 * (dist / 9.4), dist);
    this.camera.lookAt(0, 1.3, 0);
    this.camera.updateProjectionMatrix();
  }

  play() {
    this.resize();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.renderer.domElement);
    const end = this.opts.mode === "showcase" ? 11 : 6;
    const loop = () => {
      if (!this.started) {
        // Compile shaders before starting the clock so a slow first frame doesn't eat the timeline.
        this.pose(0);
        this.renderer.compile(this.scene, this.camera);
        this.renderer.render(this.scene, this.camera);
        this.start = performance.now();
        this.started = true;
      }
      const t = this.opts.reduceMotion ? end : (performance.now() - this.start) / 1000;
      this.pose(t);
      this.renderer.render(this.scene, this.camera);
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  replay() {
    this.setSubject(this.opts);
  }

  /** Render one still frame at the given pixel size and return it as a PNG data URL. */
  snapshot(size: number) {
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(size, size, false);
    this.fit(1);
    this.pose(99);
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL("image/png");
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.disposeSubject();
    this.scene.environment?.dispose();
    this.pmrem.dispose();
    this.renderer.dispose();
  }
}

/* ------------------------------------------------------------------ thumbnails */

let shared: CoreStage3D | null = null;
const cache = new Map<string, string>();

/** Crisp still renders for grids and cards, from one shared offscreen renderer. */
export function renderThumb(creature: string, colorway: 0 | 1, locked: boolean, size = 512) {
  const key = `${creature}:${colorway}:${locked ? 1 : 0}:${size}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const opts: StageOptions = { creature, colorway, mode: "static", locked };
  if (!shared) {
    const canvas = document.createElement("canvas");
    shared = new CoreStage3D(canvas, opts, true);
  } else {
    shared.setSubject(opts);
  }
  const url = shared.snapshot(size);
  cache.set(key, url);
  return url;
}
