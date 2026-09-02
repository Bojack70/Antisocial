// The Retrospective film — web-only engine, mounted into a DOM host.
//
// Everything runs on this device: MediaPipe face landmarks (WASM, loaded
// from CDN), Delaunay mesh-warp morphing between the visitor's own
// photographs, a synthesized score (WebAudio — no licensed audio, ever),
// and a canvas prologue. Photos never leave the browser. When landmark
// detection fails on a photo (old prints defeat it), that transition
// falls back to a plain crossfade — the film still plays.
//
// Why imperative DOM instead of RN views: the film is layered canvases,
// CSS transitions and per-frame warping — all DOM-native, all prototyped
// and user-approved as vanilla JS. The page hands us a <div> (an RN-web
// View ref IS its DOM element) and we own everything inside it.

export interface FilmPhoto {
  id: string;
  uri: string;
  year: string; // 4-digit, caller filters
  caption: string;
}

export interface FilmOptions {
  bornYear?: number;
  onClose: () => void;
}

export interface FilmHandle {
  destroy: () => void;
}

/* ── palette (mirrors lib/theme.ts; the film plays in its own dark room) ── */
const ROOM = '#141210';
const STARLIGHT = '#F3E9D8';
const CLAY = '#C27B5E';

/* ── morph geometry (mirrors the approved prototype) ── */
const MW = 460;
const MH = 575;
const EYE_Y = 0.4 * MH;
const EYE_DX = 0.14 * MW;

const OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397,
  365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93,
  234, 127, 162, 21, 54, 103, 67, 109];
const BROWS = [70, 63, 105, 66, 107, 336, 296, 334, 293, 300];
const EYES = [33, 160, 158, 133, 153, 144, 362, 385, 387, 263, 373, 380];
const NOSE = [1, 4, 6, 197, 195, 5, 98, 327];
const LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270,
  269, 267, 0, 37, 39, 40, 185];
const SUBSET = [...OVAL, ...BROWS, ...EYES, ...NOSE, ...LIPS];
const BORDER: Array<[number, number]> = [
  [0, 0], [MW / 2, 0], [MW - 1, 0], [MW - 1, MH / 2], [MW - 1, MH - 1],
  [MW / 2, MH - 1], [0, MH - 1], [0, MH / 2],
];

/* ── timings ── */
const PH = { dustIn: 400, condense: 5200, divide: 7200, ekg: 10600, arrive: 13600, end: 17200 };
const CHAPTER_MS = 6000;
const FADE_MS = 1200;
const MORPH_MS = 2000;

type Pt = [number, number];

// Metro must not try to resolve these at build time.
const dynImport = (u: string): Promise<any> =>
  new Function('u', 'return import(u)')(u);

const easeIO = (p: number) => (p < 0 ? 0 : p > 1 ? 1 : p * p * (3 - 2 * p));

/* 1 -> 2 -> 4 -> 8 cell layouts for the prologue */
const GEN: Pt[][] = [
  [[0, 0]],
  [[-0.55, 0], [0.55, 0]],
  [[-0.6, -0.5], [0.6, -0.5], [-0.6, 0.5], [0.6, 0.5]],
  [[-0.95, -0.5], [-0.32, -0.62], [0.32, -0.62], [0.95, -0.5],
   [-0.95, 0.5], [-0.32, 0.62], [0.32, 0.62], [0.95, 0.5]],
];

export function mountRetroFilm(
  host: HTMLElement,
  photos: FilmPhoto[],
  opts: FilmOptions
): FilmHandle {
  let destroyed = false;
  let runId = 0;
  let timers: ReturnType<typeof setTimeout>[] = [];
  let actx: AudioContext | null = null;
  let master: GainNode | null = null;

  const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
  const el = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    style: Partial<CSSStyleDeclaration>,
    parent: HTMLElement
  ): HTMLElementTagNameMap[K] => {
    const e = document.createElement(tag);
    Object.assign(e.style, style);
    parent.appendChild(e);
    return e;
  };

  /* ── DOM scaffold ── */
  host.innerHTML = '';
  const overlay = el('div', {
    position: 'fixed', inset: '0', zIndex: '999',
    background: 'rgba(20,18,16,.94)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '18px 14px',
  }, host);

  const stage = el('div', {
    position: 'relative',
    width: 'min(400px, 100%)',
    aspectRatio: '9 / 15',
    maxHeight: '80vh',
    background: ROOM,
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 18px 50px rgba(0,0,0,.5)',
  }, overlay);

  const layer = (z: string, parent: HTMLElement = stage) =>
    el('div', { position: 'absolute', inset: '0', opacity: '0', zIndex: z }, parent);

  const proCanvas = el('canvas', {
    position: 'absolute', inset: '0', width: '100%', height: '100%',
    opacity: '0', transition: 'opacity 1.8s ease', zIndex: '4',
  }, stage);

  const photoEls = photos.map((p, i) => {
    const d = layer('10');
    d.style.backgroundImage = `url(${p.uri})`;
    d.style.backgroundSize = 'cover';
    d.style.backgroundPosition = 'center 22%';
    const sepia = 0.5 - (photos.length > 1 ? (i / (photos.length - 1)) * 0.35 : 0);
    d.style.filter = `sepia(${sepia.toFixed(2)}) contrast(1.03) brightness(.96)`;
    d.style.transition = `opacity ${FADE_MS}ms ease`;
    const dir = i % 2 === 0 ? 1 : -1;
    d.dataset.from = `scale(1.06) translate(${dir * -1.2}%, -0.8%)`;
    d.dataset.to = `scale(1.17) translate(${dir * 1.4}%, 1.2%)`;
    d.style.transform = d.dataset.from;
    return d;
  });

  // The morph plays on its own canvas above the photos during transitions.
  const morphWrap = layer('14');
  morphWrap.style.background = ROOM;
  morphWrap.style.transition = 'opacity 500ms ease';
  morphWrap.style.display = 'flex';
  morphWrap.style.alignItems = 'center';
  morphWrap.style.justifyContent = 'center';
  const morphCanvas = el('canvas', { maxWidth: '100%', maxHeight: '100%' }, morphWrap);
  morphCanvas.width = MW;
  morphCanvas.height = MH;

  const scrim = layer('15');
  scrim.style.background = 'rgba(10,8,6,.36)';
  scrim.style.transition = 'opacity 1.1s ease';

  const chapterEl = layer('20');
  Object.assign(chapterEl.style, {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center',
    transition: 'opacity 1.1s ease', pointerEvents: 'none',
  });
  const chYear = el('div', {
    fontFamily: 'Lora_700Bold, Lora, Georgia, serif', fontSize: '54px',
    color: STARLIGHT, textShadow: '0 2px 26px rgba(0,0,0,.8)', lineHeight: '1',
  }, chapterEl);
  const chCap = el('div', {
    marginTop: '12px', fontSize: '11px', letterSpacing: '3px',
    textTransform: 'uppercase', color: 'rgba(243,233,216,.85)',
    textShadow: '0 1px 12px rgba(0,0,0,.9)',
    maxWidth: '80%',
  }, chapterEl);

  const wall = layer('25');
  Object.assign(wall.style, {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: '26px', background: ROOM,
    transition: 'opacity 2s ease',
  });
  const framesRow = el('div', { display: 'flex', gap: '8px' }, wall);
  const frameEls = photos.map((p, i) => {
    const f = el('div', {
      width: photos.length > 6 ? '42px' : '52px',
      height: photos.length > 6 ? '56px' : '69px',
      backgroundImage: `url(${p.uri})`,
      backgroundSize: 'cover', backgroundPosition: 'center 20%',
      border: '2px solid rgba(243,233,216,.35)',
      boxShadow: '0 4px 14px rgba(0,0,0,.6)',
      opacity: '0', transform: `translateY(10px)`,
      transition: 'opacity 1s ease, transform 1s ease',
    }, framesRow);
    f.dataset.tilt = `${(i - (photos.length - 1) / 2) * 1.2}deg`;
    return f;
  });
  const rangeEl = el('div', {
    fontFamily: 'Lora_700Bold, Lora, Georgia, serif', fontSize: '28px',
    color: STARLIGHT, opacity: '0', transition: 'opacity 1.6s ease',
  }, wall);
  const subEl = el('div', {
    fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase',
    color: 'rgba(243,233,216,.6)', opacity: '0', transition: 'opacity 1.6s ease',
  }, wall);
  subEl.textContent = 'An exhibit of one person';

  const vignette = el('div', {
    position: 'absolute', inset: '0', pointerEvents: 'none', zIndex: '40',
    boxShadow: 'inset 0 0 90px 30px rgba(0,0,0,.55)', borderRadius: '14px',
  }, stage);
  void vignette;

  const status = el('div', {
    position: 'absolute', inset: '0', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: '30', color: 'rgba(243,233,216,.6)',
    fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase',
    background: ROOM, transition: 'opacity .8s ease',
  }, stage);
  status.textContent = 'Reading the faces…';

  /* controls under the stage */
  const controls = el('div', {
    width: 'min(400px, 100%)', marginTop: '14px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: '10px',
  }, overlay);
  const button = (label: string) => {
    const b = document.createElement('button');
    b.textContent = label;
    Object.assign(b.style, {
      fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
      color: STARLIGHT, background: 'rgba(194,123,94,.22)',
      border: '1px solid rgba(243,233,216,.35)', borderRadius: '999px',
      padding: '10px 18px', cursor: 'pointer',
    } as Partial<CSSStyleDeclaration>);
    controls.appendChild(b);
    return b;
  };
  const againBtn = button('Watch again');
  const scrubBtn = button('Drag through time');
  const closeBtn = button('Leave the room');
  againBtn.style.display = 'none';
  scrubBtn.style.display = 'none';

  /* scrubber (hidden until requested) */
  const scrubRow = el('div', {
    width: 'min(400px, 100%)', marginTop: '12px', display: 'none',
    alignItems: 'center', gap: '12px',
  }, overlay);
  const scrubber = document.createElement('input');
  scrubber.type = 'range';
  scrubber.min = '0';
  scrubber.max = '1000';
  scrubber.value = '0';
  Object.assign(scrubber.style, { width: '100%', accentColor: CLAY, cursor: 'pointer' });
  scrubRow.appendChild(scrubber);

  /* ── morph machinery ── */
  const years = photos.map((p) => parseInt(p.year, 10));
  let aligned: (HTMLCanvasElement | null)[] = photos.map(() => null);
  let alignedPts: (Pt[] | null)[] = photos.map(() => null);
  let tris: number[][] = [];
  let morphReady = false;

  const scratch = [0, 1].map(() => {
    const c = document.createElement('canvas');
    c.width = MW; c.height = MH;
    return c;
  });

  async function prepareMorph() {
    try {
      const visionUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';
      const vision = await dynImport(visionUrl);
      const resolver = await vision.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );
      const landmarker = await vision.FaceLandmarker.createFromOptions(resolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        },
        runningMode: 'IMAGE',
        numFaces: 1,
        minFaceDetectionConfidence: 0.2,
      });
      const delaunator = (await dynImport('https://cdn.jsdelivr.net/npm/delaunator@5.1.0/+esm')).default;

      const rawPts: (Pt[] | null)[] = [];
      for (const p of photos) {
        const img = new Image();
        await new Promise<void>((res, rej) => {
          img.onload = () => res();
          img.onerror = () => rej(new Error('img'));
          img.src = p.uri;
        });
        try {
          const r = landmarker.detect(img);
          if (r.faceLandmarks && r.faceLandmarks.length) {
            rawPts.push(r.faceLandmarks[0].map(
              (q: { x: number; y: number }) => [q.x * img.naturalWidth, q.y * img.naturalHeight] as Pt
            ));
          } else rawPts.push(null);
        } catch {
          rawPts.push(null);
        }
        // build the aligned canvas whenever we have landmarks
        const idx = rawPts.length - 1;
        const pts = rawPts[idx];
        if (pts) {
          const le: Pt = [(pts[33][0] + pts[133][0]) / 2, (pts[33][1] + pts[133][1]) / 2];
          const re: Pt = [(pts[362][0] + pts[263][0]) / 2, (pts[362][1] + pts[263][1]) / 2];
          const sv: Pt = [re[0] - le[0], re[1] - le[1]];
          const tl: Pt = [MW / 2 - EYE_DX, EYE_Y];
          const tv: Pt = [2 * EYE_DX, 0];
          const s = Math.hypot(tv[0], tv[1]) / (Math.hypot(sv[0], sv[1]) || 1);
          const ang = Math.atan2(tv[1], tv[0]) - Math.atan2(sv[1], sv[0]);
          const a = s * Math.cos(ang);
          const b = s * Math.sin(ang);
          const tx = tl[0] - (a * le[0] - b * le[1]);
          const ty = tl[1] - (b * le[0] + a * le[1]);
          const c = document.createElement('canvas');
          c.width = MW; c.height = MH;
          const x = c.getContext('2d')!;
          x.fillStyle = ROOM;
          x.fillRect(0, 0, MW, MH);
          x.setTransform(a, b, -b, a, tx, ty);
          x.drawImage(img, 0, 0);
          aligned[idx] = c;
          alignedPts[idx] = [
            ...SUBSET.map((si): Pt => {
              const p0 = pts[si];
              return [a * p0[0] - b * p0[1] + tx, b * p0[0] + a * p0[1] + ty];
            }),
            ...BORDER,
          ];
        }
      }
      landmarker.close?.();

      const good = alignedPts.filter(Boolean) as Pt[][];
      if (good.length >= 2) {
        const mean: Pt[] = good[0].map((_, k) => {
          let sx = 0, sy = 0;
          for (const g of good) { sx += g[k][0]; sy += g[k][1]; }
          return [sx / good.length, sy / good.length];
        });
        const d = delaunator.from(mean, (p: Pt) => p[0], (p: Pt) => p[1]);
        tris = [];
        for (let i = 0; i < d.triangles.length; i += 3) {
          tris.push([d.triangles[i], d.triangles[i + 1], d.triangles[i + 2]]);
        }
        morphReady = true;
      }
    } catch {
      // No morphing — the film falls back to crossfades throughout.
      morphReady = false;
    }
  }

  function warpTo(src: HTMLCanvasElement, srcPts: Pt[], dstPts: Pt[], ctx: CanvasRenderingContext2D) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, MW, MH);
    for (const [i0, i1, i2] of tris) {
      const s0 = srcPts[i0], s1 = srcPts[i1], s2 = srcPts[i2];
      const d0 = dstPts[i0], d1 = dstPts[i1], d2 = dstPts[i2];
      const cx = (d0[0] + d1[0] + d2[0]) / 3;
      const cy = (d0[1] + d1[1] + d2[1]) / 3;
      const grow = (p: Pt): Pt => {
        const dx = p[0] - cx, dy = p[1] - cy;
        const l = Math.hypot(dx, dy) || 1;
        return [p[0] + (dx / l) * 0.7, p[1] + (dy / l) * 0.7];
      };
      const g0 = grow(d0), g1 = grow(d1), g2 = grow(d2);
      const ax = s1[0] - s0[0], ay = s1[1] - s0[1];
      const bx = s2[0] - s0[0], by = s2[1] - s0[1];
      const det = ax * by - ay * bx;
      if (Math.abs(det) < 1e-6) continue;
      const cx1 = d1[0] - d0[0], cy1 = d1[1] - d0[1];
      const cx2 = d2[0] - d0[0], cy2 = d2[1] - d0[1];
      const m11 = (cx1 * by - cx2 * ay) / det;
      const m21 = (cy1 * by - cy2 * ay) / det;
      const m12 = (cx2 * ax - cx1 * bx) / det;
      const m22 = (cy2 * ax - cy1 * bx) / det;
      const dx = d0[0] - m11 * s0[0] - m12 * s0[1];
      const dy = d0[1] - m21 * s0[0] - m22 * s0[1];
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(g0[0], g0[1]);
      ctx.lineTo(g1[0], g1[1]);
      ctx.lineTo(g2[0], g2[1]);
      ctx.closePath();
      ctx.clip();
      ctx.setTransform(m11, m21, m12, m22, dx, dy);
      ctx.drawImage(src, 0, 0);
      ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  function canMorph(i: number, j: number) {
    return morphReady && aligned[i] && aligned[j] && alignedPts[i] && alignedPts[j];
  }

  function renderMorph(i: number, j: number, f: number) {
    const A = alignedPts[i]!, B = alignedPts[j]!;
    const mid: Pt[] = A.map((p, k) => [p[0] + (B[k][0] - p[0]) * f, p[1] + (B[k][1] - p[1]) * f]);
    warpTo(aligned[i]!, A, mid, scratch[0].getContext('2d')!);
    warpTo(aligned[j]!, B, mid, scratch[1].getContext('2d')!);
    const ctx = morphCanvas.getContext('2d')!;
    ctx.globalAlpha = 1;
    ctx.drawImage(scratch[0], 0, 0);
    ctx.globalAlpha = f;
    ctx.drawImage(scratch[1], 0, 0);
    ctx.globalAlpha = 1;
  }

  /* ── synthesized score ── */
  function audioStart() {
    try {
      if (!actx) actx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (master) { try { master.disconnect(); } catch {} }
      master = actx.createGain();
      master.gain.value = 1;
      master.connect(actx.destination);
      if (actx.state === 'suspended') actx.resume();
      const t0 = actx.currentTime;
      for (const f of [64, 64.6]) {
        const o = actx.createOscillator();
        const g = actx.createGain();
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.045, t0 + 3);
        g.gain.setValueAtTime(0.045, t0 + PH.ekg / 1000 - 1.5);
        g.gain.linearRampToValueAtTime(0, t0 + PH.ekg / 1000 + 1);
        o.connect(g); g.connect(master);
        o.start(t0); o.stop(t0 + PH.ekg / 1000 + 1.2);
      }
      const beats: number[] = [];
      for (let t = PH.ekg / 1000; t < PH.end / 1000 + 0.6; t += 1.05) beats.push(t);
      beats.forEach((bt, i) => {
        const fade = i >= beats.length - 3 ? (beats.length - i) / 4 : 1;
        thump(t0 + bt, 0.3 * fade);
        thump(t0 + bt + 0.19, 0.18 * fade);
      });
    } catch {
      // sound is a gift, not a dependency
    }
  }
  function thump(when: number, vol: number) {
    if (!actx || !master) return;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.frequency.setValueAtTime(52, when);
    o.frequency.exponentialRampToValueAtTime(38, when + 0.12);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol, when + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.16);
    o.connect(g); g.connect(master);
    o.start(when); o.stop(when + 0.2);
  }
  function audioStop() {
    if (master) { try { master.gain.value = 0; master.disconnect(); } catch {} master = null; }
  }

  /* ── prologue scenes ── */
  const DUST_N = 260;
  let dust: { a: number; r: number; sp: number; sz: number; tw: number }[] = [];
  function seedDust(w: number, h: number) {
    dust = Array.from({ length: DUST_N }, () => ({
      a: Math.random() * Math.PI * 2,
      r: (0.12 + Math.random() * 0.55) * Math.min(w, h),
      sp: (Math.random() * 0.25 + 0.1) * (Math.random() < 0.5 ? 1 : -1),
      sz: Math.random() * 1.4 + 0.4,
      tw: Math.random() * Math.PI * 2,
    }));
  }

  function drawPrologue(ms: number, ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.44;

    if (ms < PH.divide + 600) {
      const gather = easeIO((ms - PH.condense) / (PH.divide - PH.condense));
      const fadeIn = easeIO((ms - PH.dustIn) / 1800);
      for (const p of dust) {
        const ang = p.a + (ms / 1000) * p.sp * (1 + gather * 5);
        const r = p.r * (1 - gather) + 6 * gather;
        const x = cx + Math.cos(ang) * r * 1.06;
        const y = cy + Math.sin(ang) * r * 0.8;
        const a = fadeIn * (1 - gather * 0.9) * (0.3 + 0.5 * (0.5 + 0.5 * Math.sin(ms / 700 + p.tw)));
        if (a <= 0.01) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = STARLIGHT;
        ctx.beginPath();
        ctx.arc(x, y, p.sz, 0, Math.PI * 2);
        ctx.fill();
      }
      if (gather > 0.05) {
        const gr = 8 + gather * 26;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr * 2.4);
        g.addColorStop(0, `rgba(255,247,230,${0.85 * gather})`);
        g.addColorStop(0.5, `rgba(226,167,138,${0.35 * gather})`);
        g.addColorStop(1, 'rgba(226,167,138,0)');
        ctx.globalAlpha = 1;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, gr * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (ms >= PH.divide && ms < PH.ekg + 900) {
      const span = (PH.ekg - PH.divide) / 3;
      const prog = (ms - PH.divide) / span;
      const gen = Math.min(Math.floor(prog), 2);
      const f = easeIO(prog - gen);
      const from = GEN[gen], to = GEN[gen + 1];
      const scale = Math.min(w, h) * 0.11;
      const R = (34 - gen * 7) * (w / 400);
      const dieOut = ms > PH.ekg ? 1 - easeIO((ms - PH.ekg) / 900) : 1;
      ctx.globalAlpha = dieOut;
      to.forEach((tp, i) => {
        const fp = from[Math.floor(i / (to.length / from.length))];
        const x = cx + (fp[0] + (tp[0] - fp[0]) * f) * scale;
        const y = cy + (fp[1] + (tp[1] - fp[1]) * f) * scale;
        const rr = R * (1 - f * 0.18);
        const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
        g.addColorStop(0, 'rgba(255,247,230,.95)');
        g.addColorStop(0.55, 'rgba(230,180,150,.55)');
        g.addColorStop(1, 'rgba(230,180,150,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    if (ms >= PH.ekg && ms < PH.end) {
      const p = (ms - PH.ekg) / (PH.arrive - PH.ekg);
      const reveal = Math.min(p * 1.15, 1);
      const dieOut = ms > PH.arrive ? 1 - easeIO((ms - PH.arrive) / 1600) : 1;
      const y0 = h * 0.58;
      ctx.globalAlpha = 0.95 * dieOut;
      ctx.strokeStyle = CLAY;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = 'rgba(194,123,94,.8)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      const beatW = w / 2.4;
      for (let x = 0; x <= w * reveal; x += 2) {
        const ph2 = (x % beatW) / beatW;
        let dy = 0;
        if (ph2 > 0.4 && ph2 < 0.46) dy = -6 * Math.sin(((ph2 - 0.4) / 0.06) * Math.PI);
        else if (ph2 >= 0.48 && ph2 < 0.52) dy = 34 * Math.sin(((ph2 - 0.48) / 0.04) * Math.PI);
        else if (ph2 >= 0.52 && ph2 < 0.55) dy = -13 * Math.sin(((ph2 - 0.52) / 0.03) * Math.PI);
        else if (ph2 > 0.62 && ph2 < 0.72) dy = -8 * Math.sin(((ph2 - 0.62) / 0.1) * Math.PI);
        const y = y0 - dy * (w / 400);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  function prologueLoop(myRun: number, start: number) {
    const tick = (now: number) => {
      if (destroyed || myRun !== runId) return;
      const ms = now - start;
      if (ms >= PH.end + 400) return;
      const r = stage.getBoundingClientRect();
      if (proCanvas.width !== Math.round(r.width)) {
        proCanvas.width = Math.round(r.width);
        proCanvas.height = Math.round(r.height);
      }
      drawPrologue(ms, proCanvas.getContext('2d')!, proCanvas.width, proCanvas.height);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ── the film ── */
  function showChapter(year: string, cap: string) {
    chYear.textContent = year;
    chCap.textContent = cap;
    chapterEl.style.opacity = '1';
  }
  const hideChapter = () => { chapterEl.style.opacity = '0'; };

  function resetFilm() {
    timers.forEach(clearTimeout);
    timers = [];
    runId++;
    audioStop();
    proCanvas.style.opacity = '0';
    scrim.style.opacity = '0';
    chapterEl.style.opacity = '0';
    morphWrap.style.opacity = '0';
    wall.style.opacity = '0';
    frameEls.forEach((f) => { f.style.opacity = '0'; f.style.transform = 'translateY(10px)'; });
    rangeEl.style.opacity = '0';
    subEl.style.opacity = '0';
    againBtn.style.display = 'none';
    scrubBtn.style.display = 'none';
    scrubRow.style.display = 'none';
    photoEls.forEach((d) => {
      d.style.transitionProperty = 'opacity';
      d.style.opacity = '0';
      d.style.transform = d.dataset.from!;
    });
  }

  function playMorphTransition(i: number, j: number, myRun: number) {
    morphWrap.style.opacity = '1';
    const start = performance.now();
    const tick = (now: number) => {
      if (destroyed || myRun !== runId) return;
      const f = Math.min((now - start) / MORPH_MS, 1);
      renderMorph(i, j, easeIO(f));
      if (f < 1) requestAnimationFrame(tick);
      else at(350, () => { morphWrap.style.opacity = '0'; });
    };
    requestAnimationFrame(tick);
  }

  function playFilm() {
    resetFilm();
    const myRun = runId;

    audioStart();
    seedDust(stage.clientWidth, stage.clientHeight);
    proCanvas.style.opacity = '1';
    prologueLoop(myRun, performance.now());
    const arrivalYear = opts.bornYear ? String(opts.bornYear) : photos[0].year;
    at(PH.arrive, () => showChapter(arrivalYear, 'You arrive'));
    at(PH.end - 500, hideChapter);
    at(PH.end - 900, () => { proCanvas.style.opacity = '0'; });

    photos.forEach((p, i) => {
      const t0 = PH.end + i * CHAPTER_MS;
      at(t0, () => {
        if (i > 0 && canMorph(i - 1, i)) {
          playMorphTransition(i - 1, i, myRun);
          at(MORPH_MS - 300, () => { photoEls[i - 1].style.opacity = '0'; });
        } else if (i > 0) {
          at(FADE_MS + 300, () => { photoEls[i - 1].style.opacity = '0'; });
        }
        const d = photoEls[i];
        d.style.opacity = '1';
        requestAnimationFrame(() => {
          d.style.transitionProperty = 'opacity, transform';
          d.style.transitionDuration = `${FADE_MS}ms, ${CHAPTER_MS + FADE_MS}ms`;
          d.style.transitionTimingFunction = 'ease, linear';
          d.style.transform = d.dataset.to!;
        });
        const titleDelay = i > 0 && canMorph(i - 1, i) ? MORPH_MS - 200 : 200;
        at(titleDelay, () => {
          scrim.style.opacity = '1';
          showChapter(p.year, p.caption || '');
        });
        at(titleDelay + 2400, () => { hideChapter(); scrim.style.opacity = '0'; });
      });
    });

    const tEnd = PH.end + photos.length * CHAPTER_MS;
    at(tEnd, () => {
      wall.style.opacity = '1';
      frameEls.forEach((f, i) =>
        at(400 + i * 240, () => {
          f.style.opacity = '1';
          f.style.transform = `translateY(0) rotate(${f.dataset.tilt})`;
        })
      );
      rangeEl.textContent = `${arrivalYear} to ${photos[photos.length - 1].year}`;
      at(2000, () => { rangeEl.style.opacity = '1'; });
      at(2500, () => { subEl.style.opacity = '1'; });
      at(3200, () => {
        againBtn.style.display = '';
        if (morphReady) scrubBtn.style.display = '';
      });
    });
  }

  /* ── scrubber mode ── */
  const scrubbable = () => {
    const idx: number[] = [];
    photos.forEach((_, i) => { if (aligned[i]) idx.push(i); });
    return idx;
  };
  function enterScrubMode() {
    resetFilm();
    const idx = scrubbable();
    if (idx.length < 2) return;
    morphWrap.style.transition = 'none';
    morphWrap.style.opacity = '1';
    scrubRow.style.display = 'flex';
    againBtn.style.display = '';
    const draw = () => {
      const v = (parseInt(scrubber.value, 10) / 1000) * (idx.length - 1);
      const k = Math.min(Math.floor(v), idx.length - 2);
      renderMorph(idx[k], idx[k + 1], v - k);
      const yA = years[idx[k]], yB = years[idx[k + 1]];
      chYear.textContent = String(Math.round(yA + (yB - yA) * (v - k)));
      chCap.textContent = '';
      chapterEl.style.opacity = '1';
      chapterEl.style.justifyContent = 'flex-end';
      chapterEl.style.paddingBottom = '26px';
    };
    scrubber.oninput = draw;
    draw();
  }

  /* ── boot ── */
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    handle.destroy();
    opts.onClose();
  };
  closeBtn.onclick = close;
  againBtn.onclick = () => {
    morphWrap.style.transition = 'opacity 500ms ease';
    chapterEl.style.justifyContent = 'center';
    chapterEl.style.paddingBottom = '0';
    playFilm();
  };
  scrubBtn.onclick = enterScrubMode;

  (async () => {
    await prepareMorph();
    if (destroyed) return;
    status.style.opacity = '0';
    at(500, () => { status.style.display = 'none'; });
    playFilm();
  })();

  const handle: FilmHandle = {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      timers.forEach(clearTimeout);
      timers = [];
      runId++;
      audioStop();
      try { actx?.close(); } catch {}
      actx = null;
      host.innerHTML = '';
    },
  };
  return handle;
}
