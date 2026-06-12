#version 300 es
// Lares · nebula v2 · demo técnica
//
// Un único fragment shader compone toda la escena del hero:
//
//  1. Nebulosa por domain warping (técnica de Inigo Quilez: un fbm
//     alimenta el dominio de otro fbm) con rotación global lenta y el
//     campo curvándose hacia el puntero.
//  2. El isotipo de Lares reconstruido como mosaico de diamantes:
//     se cuantiza el espacio en un grid rotado 45 grados y cada celda
//     muestrea la textura oficial en su centro. Cada celda aparece
//     según un umbral aleatorio frente a uAssemble y, mientras llega,
//     muestrea desplazada en una dirección propia: el logo se "reúne"
//     desde la dispersión.
//  3. Acabado: viñeta, sombra de legibilidad bajo la columna de texto,
//     desvanecido por scroll y dithering anti-banding.
precision highp float;

out vec4 outColor;

uniform vec2  uRes;      // tamaño en px físicos
uniform float uTime;     // segundos
uniform vec2  uPointer;  // puntero en px de canvas, origen arriba-izq
uniform float uAssemble; // 0..1 · ensamblado del isotipo
uniform float uFade;     // 0..1 · desvanecido por scroll
uniform vec2  uLogoPos;  // centro del cuadro del logo, en unidades uv
uniform float uLogoBox;  // semi-lado del cuadro del logo, unidades uv
uniform sampler2D uLogo; // isotipo (mosaico azul, fondo blanco)

float rnd(vec2 p) {
  p = fract(p * vec2(12.9898, 78.233));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  float a = rnd(i), b = rnd(i + vec2(1, 0)), c = rnd(i + vec2(0, 1)), d = rnd(i + 1.0);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float t = 0.0, a = 1.0;
  mat2 m = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 6; i++) {
    t += a * noise(p);
    p = m * p * 2.0;
    a *= 0.5;
  }
  return t;
}

// Domain warping (Quilez): fbm alimentando el dominio de otro fbm.
float nebula(vec2 p) {
  vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));
  vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7 + uTime * 0.06, 9.2)),
                fbm(p + 4.0 * q + vec2(8.3, 2.8 + uTime * 0.05)));
  return fbm(p + 4.0 * r);
}

void main() {
  float mn = min(uRes.x, uRes.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / mn;
  vec2 pt = (vec2(uPointer.x, uRes.y - uPointer.y) - 0.5 * uRes) / mn;

  // ── 1 · nebulosa ──────────────────────────────────────────────
  float ang = uTime * 0.015;
  mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 p = rot * uv * 1.3;

  float pd = length(uv - pt);
  p += (uv - pt) * -0.35 * exp(-pd * pd * 7.0); // se curva hacia el cursor

  vec3 cDark = vec3(0.039, 0.039, 0.078); // --dark
  vec3 cDeep = vec3(0.059, 0.310, 0.812); // --blue-dark
  vec3 cMid  = vec3(0.106, 0.420, 1.000); // --blue
  vec3 cHi   = vec3(0.239, 0.541, 1.000); // --blue-bright

  float n = nebula(p);
  float fine = fbm(p * 4.0 + vec2(uTime * 0.08, -uTime * 0.04));

  vec3 col = cDark;
  col = mix(col, cDeep * 0.30, smoothstep(0.45, 1.05, n));
  col = mix(col, cMid * 0.16, smoothstep(0.80, 1.25, n * n));
  col += cHi * 0.05 * smoothstep(0.90, 1.10, n) * fine;
  col += cHi * smoothstep(0.97, 1.08, n * fine) * 0.16;
  col += cMid * 0.07 * exp(-pd * pd * 9.0); // halo en el puntero

  // ── 2 · isotipo como mosaico de diamantes ─────────────────────
  float reveal = uAssemble * (1.0 - uFade);

  vec2 luv = (uv - uLogoPos) / (2.0 * uLogoBox) + 0.5; // 0..1 en el cuadro
  const float S = 0.70710678;
  mat2 d45 = mat2(S, -S, S, S);   // rotación +45 grados
  mat2 i45 = mat2(S, S, -S, S);   // inversa: rotación -45 grados
  const float CELLS = 34.0;

  vec2 g = d45 * (luv - 0.5) * CELLS;
  vec2 cell = floor(g);
  vec2 f = fract(g) - 0.5;

  float ru = rnd(cell);
  // 0 -> 1 cuando reveal cruza el umbral aleatorio de la celda.
  float appear = smoothstep(ru - 0.14, ru, reveal);

  // La celda "viene de lejos": muestrea desplazada mientras appear < 1
  vec2 dir = normalize(vec2(rnd(cell + 7.1), rnd(cell + 3.7)) - 0.5 + 1e-4);
  vec2 sampleCell = cell + dir * (1.0 - appear) * 6.0;
  vec2 cuv = i45 * ((sampleCell + 0.5) / CELLS) + 0.5;

  float inBox = step(0.0, cuv.x) * step(cuv.x, 1.0) * step(0.0, cuv.y) * step(cuv.y, 1.0);
  vec4 tex = texture(uLogo, cuv);
  float mask = smoothstep(0.35, 0.65, tex.a) * inBox; // el PNG trae fondo transparente

  float sq = max(abs(f.x), abs(f.y));
  float shape = smoothstep(0.46, 0.36, sq); // diamante con junta entre celdas

  float flicker = 0.65 + 0.35 * noise(cell * 1.7 + uTime * 0.9);
  float nearPt = exp(-pow(length(uv - pt) * 4.0, 2.0));
  // Recorte oscuro bajo cada celda: el mosaico gana contraste sobre la
  // nebulosa antes de sumar su propio color.
  col = mix(col, cDark, mask * shape * appear * 0.6);
  vec3 mcol = mix(cMid, cHi, rnd(cell + 1.3));
  col += mcol * mask * shape * appear * (0.70 * flicker + 0.85 * nearPt);

  // ── 3 · acabado ───────────────────────────────────────────────
  float vig = 1.0 - length(uv) * 0.60;
  col *= clamp(vig, 0.22, 1.0);

  vec2 tz = (uv - vec2(-0.45, 0.0)) * vec2(0.95, 1.55);
  col *= 1.0 - 0.52 * exp(-dot(tz, tz) * 2.2); // sombra bajo el texto

  col *= 1.0 - uFade * 0.85;
  col += (rnd(gl_FragCoord.xy) - 0.5) / 255.0; // dithering anti-banding

  outColor = vec4(col, 1.0);
}
