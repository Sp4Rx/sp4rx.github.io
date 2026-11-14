// The background scene: one WebGL draw call of points that can be the portrait,
// a tunnel of dust, or a line of text. No 3D library.

export interface SceneState {
  scatter: number; // 0 = portrait, 1 = tunnel
  text: number; // 0 = tunnel, 1 = text
  travel: number; // how far down the tunnel the camera is
  pointerX: number; // -1..1
  pointerY: number; // -1..1
}

const VERT = `
attribute vec3 aPortrait;
attribute vec3 aScatter;
attribute vec2 aText;
attribute float aLum;
attribute float aSeed;
uniform float uTime, uScatter, uText, uTravel, uAspect, uSize, uTextGlow;
uniform vec2 uPointer;
uniform vec3 uPortraitT, uTextT; // x offset, y offset, scale
varying float vAlpha;

void main() {
  // Each point leaves a little later than the last, so shapes dissolve instead of snapping.
  float a = smoothstep(0.0, 1.0, clamp(uScatter * 1.6 - aSeed * 0.6, 0.0, 1.0));
  float b = smoothstep(0.0, 1.0, clamp(uText * 1.6 - aSeed * 0.6, 0.0, 1.0));

  vec3 p = aPortrait;
  float ry = uPointer.x * 0.4 + sin(uTime * 0.4) * 0.07;
  float rx = uPointer.y * 0.25;
  p.xz = vec2(p.x * cos(ry) + p.z * sin(ry), p.z * cos(ry) - p.x * sin(ry));
  p.yz = vec2(p.y * cos(rx) - p.z * sin(rx), p.z * cos(rx) + p.y * sin(rx));
  p.xy += 0.003 * vec2(sin(uTime * 1.3 + aSeed * 40.0), cos(uTime * 1.1 + aSeed * 31.0));
  p = p * uPortraitT.z + vec3(uPortraitT.xy, 0.0);

  float along = fract(aScatter.z + uTravel); // 0 = far end, 1 = just behind the camera
  vec3 s = vec3(aScatter.xy * vec2(uAspect, 1.0), mix(-7.0, 1.2, along));

  vec3 t = vec3(aText * uTextT.z + uTextT.xy, 0.0);
  t.xy += 0.004 * vec2(sin(uTime * 0.9 + aSeed * 50.0), cos(uTime * 0.7 + aSeed * 23.0));

  vec3 pos = mix(mix(p, s, a), t, b);
  float persp = 1.6 / max(1.6 - pos.z, 0.05); // camera sits at z = 1.6
  gl_Position = vec4(pos.x * persp / uAspect, pos.y * persp, 0.0, 1.0);

  float tunnel = a * (1.0 - b);
  float lum = mix(mix(0.14 + 0.86 * pow(aLum, 1.2), 0.5 + 0.5 * aSeed, a), uTextGlow, b);
  float edge = smoothstep(0.0, 0.15, along) * (1.0 - smoothstep(0.85, 1.0, along));
  vAlpha = lum * mix(1.0, edge * 0.8, tunnel);
  gl_PointSize = uSize * min(persp, 3.0) * (0.75 + lum * 0.6);
}`;

const FRAG = `
precision mediump float;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vec3(0.83, 1.0, 0.23) * vAlpha, 1.0);
}`;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const pixels = (w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  paint(ctx);
  return ctx.getImageData(0, 0, w, h).data;
};

/**
 * Starts the scene on the canvas. Resolves to a draw function to call every frame,
 * or null when WebGL or the portrait is unavailable (the page works without it).
 */
export async function startParticles(canvas: HTMLCanvasElement, portraitUrl: string, words: string[]) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return null;

  let img: HTMLImageElement;
  try {
    img = await loadImage(portraitUrl);
  } catch {
    return null;
  }

  // Portrait: one point per opaque pixel. Brightness sets the glow and pushes the point forward.
  const W = img.width;
  const H = img.height;
  const px = pixels(W, H, (ctx) => ctx.drawImage(img, 0, 0));
  const portrait: number[] = [];
  const lum: number[] = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (px[i + 3] < 128) continue;
      const l = px[i] / 255;
      const u = x / W - 0.5;
      const v = 0.5 - y / H;
      // A soft dome plus brightness gives the flat photo some depth to turn in.
      portrait.push(u * (W / H), v, 0.22 * Math.cos(u * 2.6) * Math.cos(v * 2.2) + l * 0.08 - 0.2);
      lum.push(l);
    }
  }
  const count = lum.length;
  if (!count) return null;

  // The words are drawn with the page's display font, so wait for it (or carry on without).
  await document.fonts.load('800 150px "Bricolage Grotesque"').catch(() => undefined);

  // Text: points are dealt out over the lit pixels of the words, one word per line.
  const TW = 640;
  const TH = 160 * words.length;
  const tp = pixels(TW, TH, (ctx) => {
    ctx.fillStyle = '#fff';
    ctx.font = '800 150px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    words.forEach((word, n) => ctx.fillText(word, TW / 2, 160 * n + 84, TW - 20));
  });
  const lit: number[] = [];
  for (let i = 0; i < TW * TH; i += 2) if (tp[i * 4] > 128) lit.push(i);

  const scatter = new Float32Array(count * 3);
  const text = new Float32Array(count * 2);
  const seed = new Float32Array(count);
  for (let k = 0; k < count; k++) {
    seed[k] = Math.random();
    // Keep the middle of the tunnel clear so the cards stay readable.
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.55 + Math.random() * 1.6;
    scatter[k * 3] = Math.cos(angle) * radius;
    scatter[k * 3 + 1] = Math.sin(angle) * radius;
    scatter[k * 3 + 2] = Math.random();
    const i = lit.length ? lit[Math.floor(Math.random() * lit.length)] : 0;
    text[k * 2] = (i % TW) / TW - 0.5;
    text[k * 2 + 1] = (0.5 - Math.floor(i / TW) / TH) * (TH / TW);
  }

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Particle shader failed to link:', gl.getProgramInfoLog(program));
    return null;
  }
  gl.useProgram(program);

  const attribute = (name: string, data: Float32Array, size: number) => {
    const location = gl.getAttribLocation(program, name);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  };
  attribute('aPortrait', new Float32Array(portrait), 3);
  attribute('aScatter', scatter, 3);
  attribute('aText', text, 2);
  attribute('aLum', new Float32Array(lum), 1);
  attribute('aSeed', seed, 1);

  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const u = {
    time: uniform('uTime'),
    scatter: uniform('uScatter'),
    text: uniform('uText'),
    travel: uniform('uTravel'),
    aspect: uniform('uAspect'),
    size: uniform('uSize'),
    pointer: uniform('uPointer'),
    portraitT: uniform('uPortraitT'),
    textT: uniform('uTextT'),
    textGlow: uniform('uTextGlow'),
  };

  gl.clearColor(0.047, 0.051, 0.039, 1); // the page's ink background
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // additive: overlapping points glow

  const imageAspect = W / H;
  const textAspect = TW / TH;

  return (state: SceneState, timeMs: number) => {
    // Cap the pixel ratio: phones report 3, which triples the fill cost for no visible gain.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    const aspect = w / h;
    const wide = aspect > 1.1;

    // Scene units: the viewport is 2 tall and 2 * aspect wide.
    const portraitScale = wide ? 1.5 : Math.min(1.15, (aspect * 2 * 0.98) / imageAspect);
    const textScale = Math.min(aspect * 2 * 0.86, 0.9 * textAspect);

    gl.uniform1f(u.time, timeMs / 1000);
    gl.uniform1f(u.scatter, state.scatter);
    gl.uniform1f(u.text, state.text);
    gl.uniform1f(u.travel, state.travel);
    gl.uniform1f(u.aspect, aspect);
    gl.uniform1f(u.size, Math.max(1.5, (h / 520) * (wide ? 1 : 0.8)));
    gl.uniform2f(u.pointer, state.pointerX, state.pointerY);
    gl.uniform3f(u.portraitT, wide ? aspect * 0.42 : 0, wide ? -0.08 : 0.36, portraitScale);
    gl.uniform3f(u.textT, 0, wide ? 0.3 : 0.38, textScale);
    // The same points packed into smaller letters would burn out to white, so dim them.
    gl.uniform1f(u.textGlow, 0.85 * Math.min(1, Math.max(0.3, (textScale * textScale) / 2.4)));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, count);
  };
}
