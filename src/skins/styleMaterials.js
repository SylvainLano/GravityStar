import * as THREE from 'three';

// Stylized materials for the skins. They do their own lighting from lightPosition (the star) and from the spotlight
// placed at the camera, and work on colors as displayed (sRGB), which keeps flat colors and palettes exact.

// Uniforms shared by every stylized material: updating them once updates all the materials
export function createSharedUniforms() {
  return {
    lightPosition: { value: new THREE.Vector3() },
    // Spotlight at the camera that shows the asteroids before they are launched (spotRange 0 switches it off)
    spotPosition: { value: new THREE.Vector3() },
    spotRange: { value: 0 },
    // Luminosity of the star: 0 switches it off, 1 is the normal light, 2 twice as bright
    starLight: { value: 1 },
    pixelRatio: { value: 1 },
    resolution: { value: new THREE.Vector2(1, 1) }, // Size of the drawing buffer, in device pixels
  };
}

// A color written as displayed, e.g. rgb('#0b0f2a')
export function rgb(hex) {
  const color = new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace);
  return new THREE.Vector3(color.r, color.g, color.b);
}

export const surfaceVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vDirection; // Direction from the object's center, used to stick noise to the surface
  varying vec4 vCenter; // The object's center on screen (in clip space), to attach strokes drawn on screen to it

  void main() {
    vUv = uv;
    vDirection = normalize(position);
    vCenter = projectionMatrix * viewMatrix * modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const flatVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const helpers = /* glsl */ `
  uniform vec3 lightPosition;
  uniform vec3 spotPosition;
  uniform float spotRange;
  uniform float starLight;
  uniform float pixelRatio;

  // Lighting (dot of the normal and the light direction) from the star, or from the spotlight where it is brighter
  float withSpot(float ndl, vec3 N, vec3 position) {
    if (spotRange <= 0.0) return ndl;
    float spot = dot(N, normalize(spotPosition - position));
    float reach = 1.0 - smoothstep(spotRange * 0.6, spotRange, distance(spotPosition, position));
    return max(ndl, mix(-1.0, spot, reach));
  }

  // The luminosity of the star goes from the colors lit by the spotlight alone (star off) to the colors lit by the star,
  // and beyond them for a brighter star: the lit side moves further away from the shadow, which doesn't change
  vec3 byStarLight(vec3 spotOnly, vec3 lit) { return clamp(mix(spotOnly, lit, starLight), 0.0, 1.0); }

  vec3 toSrgb(vec3 color) { return pow(max(color, 0.0), vec3(1.0 / 2.2)); }
  float brightness(vec3 color) { return dot(color, vec3(0.299, 0.587, 0.114)); }

  float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise2(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1, 0)), f.x), mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), f.x), f.y);
  }
  float hash31(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise3(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i), hash31(i + vec3(1, 0, 0)), f.x), mix(hash31(i + vec3(0, 1, 0)), hash31(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0, 0, 1)), hash31(i + vec3(1, 0, 1)), f.x), mix(hash31(i + vec3(0, 1, 1)), hash31(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float fbm3(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise3(p);
      p *= 2.03;
      amplitude *= 0.5;
    }
    return value;
  }

  // Ordered dithering thresholds (4x4 Bayer matrix), between 0 and 1
  float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
  float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
`;

// Comic book: flattened and saturated texture, three light bands, colored shadows, ink hatching in the shadow
const celFragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform vec3 shadowTint;
  uniform vec3 inkColor;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  vec3 shade(vec3 albedo, float ndl, vec3 N, vec3 V) {
    // Shadow in a colored tint rather than gray, full colors in the middle band, a brighter lit band
    float toMid = smoothstep(-0.03, 0.03, ndl);
    float toLit = smoothstep(0.42, 0.48, ndl);
    vec3 color = mix(albedo * shadowTint, mix(albedo * 0.9, min(albedo * 1.15, vec3(1.0)), toLit), toMid);

    // Warm light catching the lit edge
    color += vec3(1.0, 0.85, 0.6) * pow(1.0 - max(dot(N, V), 0.0), 4.0) * toMid * 0.35;

    // Pen hatching in the shadow, crossed in the deepest part
    vec2 p = gl_FragCoord.xy / pixelRatio;
    float hatch = 1.0 - step(0.22, fract((p.x + p.y) / 5.0));
    float crossHatch = 1.0 - step(0.22, fract((p.x - p.y) / 5.0));
    float shadow = 1.0 - smoothstep(-0.15, -0.05, ndl);
    float deepShadow = 1.0 - smoothstep(-0.55, -0.45, ndl);
    color = mix(color, inkColor, 0.55 * hatch * shadow);
    color = mix(color, inkColor, 0.55 * crossHatch * deepShadow);
    return min(color, vec3(1.0));
  }

  void main() {
    // Blurred (lower mipmap), saturated and posterized texture: details turn into vivid flat color areas
    vec3 albedo = toSrgb(texture2D(map, vUv, 2.0).rgb);
    albedo = clamp(mix(vec3(brightness(albedo)), albedo, 1.5), 0.0, 1.0);
    albedo = floor(albedo * 6.0 + 0.5) / 6.0;

  #ifdef EMISSIVE
    gl_FragColor = vec4(min(albedo * 1.15 * starLight, vec3(1.0)), 1.0);
  #else
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(lightPosition - vWorldPosition);
    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 spotOnly = shade(albedo, withSpot(-1.0, N, vWorldPosition), N, V);
    vec3 lit = shade(albedo, withSpot(dot(N, L), N, vWorldPosition), N, V);
    gl_FragColor = vec4(byStarLight(spotOnly, lit), 1.0);
  #endif
  }
`;

// Soft pastel on tinted paper: chalk laid in layers of strokes (a base shaded by the light, cool shadows hatched across it,
// warm touches of light), which only catch the peaks of the paper's grain and let the paper show between them.
// The strokes are drawn on screen, attached to the body's center so that they travel with it.
const pastelFragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform vec2 resolution;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vDirection;
  varying vec4 vCenter;

  // Strokes of a pastel stick along a direction (in radians), their width and length in screen pixels:
  // a value between 0 and 1 that changes slowly along each stroke and quickly across them
  float strokes(vec2 p, float angle, float width, float length) {
    vec2 along = vec2(cos(angle), sin(angle));
    vec2 q = vec2(dot(p, along) / length, dot(p, vec2(-along.y, along.x)) / width);
    return noise2(q) * 0.7 + noise2(q * 2.3 + 11.0) * 0.3;
  }

  // How much chalk a layer leaves, from 0 to 1: the harder it is pressed, the more of the paper's grain it fills
  float chalk(float pressure, float stroke, float tooth) {
    return smoothstep(1.0 - pressure, 1.15 - pressure, stroke * 0.6 + tooth * 0.4);
  }

  // Light on the surface, from 0 (shadow) to 1 (lit), with an uneven terminator
  float lightOf(float ndl, float grain) {
    return smoothstep(-0.25, 0.35, ndl + 0.25 * grain);
  }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 L = normalize(lightPosition - vWorldPosition);
    float grain = fbm3(vDirection * 6.0) - 0.5;

    // Screen pixels from the body's center, and the grain of the paper there
    vec2 center = (vCenter.xy / vCenter.w * 0.5 + 0.5) * resolution;
    vec2 p = (gl_FragCoord.xy - center) / pixelRatio;
    vec2 paper = gl_FragCoord.xy / pixelRatio;
    float tooth = noise2(paper * 0.8) * 0.5 + noise2(paper * 0.23 + 5.0) * 0.3 + hash21(floor(paper)) * 0.2;

    // Chalky pigments, in masses of color rather than details (a blurred texture), a little lighter
    vec3 albedo = toSrgb(texture2D(map, vUv, 3.0).rgb);
    vec3 mid = clamp(mix(vec3(brightness(albedo)), albedo, 1.1), 0.0, 1.0);
    mid = mix(mid, vec3(1.0, 0.98, 0.94), 0.08);

  #ifdef EMISSIVE
    // The star: brighter towards its middle, without shadows
    float light = 1.0;
    float shine = smoothstep(0.5, 1.0, dot(N, V));
    vec3 dark = mid * 0.8;
  #else
    // From the light of the spotlight alone (star switched off) to the star's light, and beyond it for a brighter star
    float light = clamp(mix(lightOf(withSpot(-1.0, N, vWorldPosition), grain), lightOf(withSpot(dot(N, L), N, vWorldPosition), grain), starLight), 0.0, 1.0);
    // Touches of light where the star shines the most
    float shine = smoothstep(0.5, 0.95, dot(N, L) + 0.2 * grain) * starLight;
    vec3 dark = mid * vec3(0.38, 0.4, 0.62) + vec3(0.06, 0.04, 0.12); // Cool, violet shadows
  #endif
    vec3 bright = mix(mid, vec3(1.0, 0.96, 0.84), 0.4); // Warm touches of light

    // Lighter pressure towards the silhouette, so that the edge turns powdery
    float rim = 1.0 - max(dot(N, V), 0.0);
    float pressure = 1.0 - smoothstep(0.55, 1.0, rim + 0.25 * grain);

    float baseStrokes = strokes(p, 0.6, 2.4, 14.0);
    float base = chalk(0.8 * pressure, baseStrokes, tooth);
    float shadow = chalk((1.0 - light) * 0.9 * pressure, strokes(p, -0.75, 2.0, 11.0), tooth);
    float highlight = chalk(min(shine, 1.3) * 0.65 * pressure, strokes(p, 0.35, 1.8, 9.0), tooth);

    // The base layer, shaded by the light, its strokes a little lighter or darker from one to the next
    vec3 color = mix(mix(dark, mid, 0.4), mid, smoothstep(0.0, 0.7, light)) * (0.86 + 0.28 * baseStrokes);
    color = mix(color, dark, shadow);
    color = mix(color, bright, highlight);
  #ifdef EMISSIVE
    color = min(color * starLight, vec3(1.0));
  #endif
    gl_FragColor = vec4(color, max(base, max(shadow, highlight)));
  }
`;

// Watercolor: transparent washes on white paper. A first wash of the body's colors, with the white paper left
// where the light is the strongest, a cool glaze for the shadow with a hard edge, pigment pooling into darker edges
// as it dries, granulation in the grain of the paper, and blooms where the wash dried unevenly.
// The washes darken the paper as pigments do (each one lets through some of the light), then are drawn as a color and its opacity.
const watercolorFragmentShader = /* glsl */ `
  uniform sampler2D map;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vDirection;

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 L = normalize(lightPosition - vWorldPosition);
    float wet = fbm3(vDirection * 3.0) - 0.5; // Large unevenness of the washes, stuck to the surface
    float wetFine = fbm3(vDirection * 9.0 + 3.0) - 0.5;
    vec2 paper = gl_FragCoord.xy / pixelRatio;
    float grain = noise2(paper * 0.45) * 0.6 + noise2(paper * 1.3 + 7.0) * 0.4; // Where the pigment settles in the paper

    // Pigments: the body's colors in soft masses
    vec3 albedo = toSrgb(texture2D(map, vUv, 3.5).rgb);
    vec3 pigment = clamp(mix(vec3(brightness(albedo)), albedo, 1.15), 0.0, 1.0);

    // The uneven silhouette of the wash, and the pigment pooling along it
    float rim = 1.0 - max(dot(N, V), 0.0);
    float edge = rim + 0.18 * wet + 0.06 * wetFine;
    float inside = 1.0 - smoothstep(0.9, 0.97, edge);
    float pooling = smoothstep(0.7, 0.92, edge) * inside;

  #ifdef EMISSIVE
    // The star: a warm wash around a white heart, which darkens when the star is switched off
    pigment = mix(vec3(0.16, 0.13, 0.22), pigment, min(starLight, 1.0));
    float shine = smoothstep(0.8, 1.0, dot(N, V) + 0.2 * wet) * 0.8 * min(starLight, 1.0);
    float shadow = 0.0;
    float shadowEdge = 0.0;
  #else
    // A hard-edged glaze of shadow, from the light of the spotlight alone (star switched off) to the star's light
    float terminator = withSpot(dot(N, L), N, vWorldPosition) + 0.3 * wet;
    float lit = mix(step(0.0, withSpot(-1.0, N, vWorldPosition) + 0.3 * wet), step(0.0, terminator), min(starLight, 1.0));
    float shadow = 1.0 - lit;
    // Darker along its edge, where the pigment gathered as it dried
    float shadowEdge = shadow * (1.0 - smoothstep(0.0, 0.15, -terminator)) * min(starLight, 1.0);
    // White paper left where the star shines the most, more of it for a brighter star
    float shine = smoothstep(1.05 - 0.2 * starLight, 1.12 - 0.18 * starLight, dot(N, L) + 0.15 * wet) * lit;
  #endif

    // First wash, uneven, granulating, and almost none where the light shines the most
    float wash = 0.7 + 0.25 * wet + 0.15 * (grain - 0.5);
    wash *= 1.0 - 0.85 * shine;
    // Blooms: lighter patches with a dark rim, where water flowed back into the drying wash
    float bloomNoise = fbm3(vDirection * 2.5 + 9.0);
    float bloom = smoothstep(0.64, 0.67, bloomNoise);
    wash = wash * (1.0 - 0.35 * bloom) + 0.2 * (smoothstep(0.61, 0.64, bloomNoise) - bloom);
    wash = clamp(wash + 0.35 * pooling, 0.0, 1.0);

    // Glaze of shadow: a cool ultramarine mixed with the body's color, granulating more
    vec3 shadowPigment = mix(pigment * 0.55, vec3(0.3, 0.34, 0.62), 0.55);
    float glaze = shadow * (0.7 + 0.2 * wet + 0.3 * (grain - 0.5));
    glaze = clamp(glaze + 0.25 * shadowEdge + 0.25 * shadow * pooling, 0.0, 1.0);

    // Over white paper: what each layer lets through, then the color and opacity giving the same result
    vec3 through = (1.0 - wash * (1.0 - pigment)) * (1.0 - glaze * (1.0 - shadowPigment));
    float alpha = (1.0 - (1.0 - wash) * (1.0 - glaze)) * inside;
    vec3 color = alpha > 0.001 ? clamp((through - (1.0 - alpha)) / alpha, 0.0, 1.0) : vec3(1.0);
    gl_FragColor = vec4(color, alpha);
  }
`;

// Adult anime: hard terminator, warm band along it, screentone in the shadow, atmosphere rim
const animeFragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform vec3 rimColor;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  vec3 shade(vec3 albedo, float ndl, vec3 N, vec3 V) {
    float lit = smoothstep(-0.015, 0.015, ndl);
    vec3 color = mix(albedo * vec3(0.22, 0.25, 0.42), albedo, lit);

    // Warm band along the terminator
    float band = lit * (1.0 - smoothstep(0.04, 0.12, ndl));
    color = mix(color, vec3(1.0, 0.5, 0.3), band * 0.55);

    // Screentone: dots growing larger in the deep shadow, as in printed manga
    vec2 p = mat2(0.7071, -0.7071, 0.7071, 0.7071) * (gl_FragCoord.xy / pixelRatio);
    vec2 cell = mod(p, 4.0) - 2.0;
    float dotRadius = 0.6 + 1.0 * (1.0 - smoothstep(-0.7, 0.0, ndl));
    float dots = 1.0 - smoothstep(dotRadius - 0.3, dotRadius + 0.3, length(cell));
    color = mix(color, color * 0.35, dots * (1.0 - lit));

    // Atmosphere on the lit side of the edge
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    color += rimColor * fresnel * smoothstep(-0.1, 0.5, ndl);
    return min(color, vec3(1.0));
  }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 L = normalize(lightPosition - vWorldPosition);

    // Slightly more saturated colors
    vec3 albedo = toSrgb(texture2D(map, vUv, 0.5).rgb);
    albedo = clamp(mix(vec3(brightness(albedo)), albedo, 1.3), 0.0, 1.0);

  #ifdef EMISSIVE
    // White-hot core, with hard steps towards an orange edge
    float facing = max(dot(N, V), 0.0);
    vec3 sun = facing > 0.75 ? vec3(1.0, 0.98, 0.9) : facing > 0.45 ? vec3(1.0, 0.86, 0.45) : vec3(1.0, 0.6, 0.25);
    gl_FragColor = vec4(min(sun * (0.9 + 0.2 * brightness(albedo)) * starLight, vec3(1.0)), 1.0);
  #else
    vec3 spotOnly = shade(albedo, withSpot(-1.0, N, vWorldPosition), N, V);
    vec3 lit = shade(albedo, withSpot(dot(N, L), N, vWorldPosition), N, V);
    gl_FragColor = vec4(byStarLight(spotOnly, lit), 1.0);
  #endif
  }
`;

// 16-bit arcade: a few light levels and a limited palette, with ordered dithering
// (meant to be rendered at a low resolution and scaled up without smoothing)
const arcadeFragmentShader = /* glsl */ `
  uniform sampler2D map;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 albedo = toSrgb(texture2D(map, vUv).rgb);
    float dither = bayer4(gl_FragCoord.xy);

  #ifdef EMISSIVE
    vec3 color = min(albedo * 1.07 * starLight, vec3(1.0));
  #else
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(lightPosition - vWorldPosition);
    float spotOnly = floor(clamp(withSpot(-1.0, N, vWorldPosition), 0.0, 1.0) * 3.0 + dither) / 3.0;
    float lit = floor(clamp(withSpot(dot(N, L), N, vWorldPosition), 0.0, 1.0) * 3.0 + dither) / 3.0;
    vec3 color = byStarLight(albedo * (0.12 + 0.95 * spotOnly), albedo * (0.12 + 0.95 * lit));
  #endif

    // Dithering only between light levels, the palette itself is cut into flat steps
    color = floor(color * 6.0 + 0.5) / 6.0;
    gl_FragColor = vec4(color, 1.0);
  }
`;

const fragmentShaders = {
  cel: celFragmentShader,
  pastel: pastelFragmentShader,
  watercolor: watercolorFragmentShader,
  anime: animeFragmentShader,
  arcade: arcadeFragmentShader,
};

// Material of a surface (planet, star, asteroid) in one of the styles above.
// emissive: lit by itself (the star), so ignores lightPosition.
export function createSurfaceMaterial(style, { map, shared, emissive = false, rimColor = '#000000' }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: map },
      lightPosition: shared.lightPosition,
      spotPosition: shared.spotPosition,
      spotRange: shared.spotRange,
      starLight: shared.starLight,
      pixelRatio: shared.pixelRatio,
      resolution: shared.resolution,
      shadowTint: { value: rgb('#6b55b5') }, // Violet shadows
      inkColor: { value: rgb('#1a1440') }, // Midnight blue ink
      rimColor: { value: rgb(rimColor) },
    },
    defines: emissive ? { EMISSIVE: '' } : {},
    vertexShader: surfaceVertexShader,
    fragmentShader: helpers + fragmentShaders[style],
    transparent: style === 'pastel' || style === 'watercolor', // The paper shows between the strokes, or through the washes
  });
}

// Ink outline drawn around an object: the same geometry, pushed out along its normals on screen and seen from the inside.
// thickness is in screen pixels, like a pen whose width doesn't depend on the size of what it draws.
// With lightVariation, the line is thicker on the side away from the light, as drawn with a brush.
export function createOutlineMaterial({ shared, thickness, color = '#000000', lightVariation = true }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      lightPosition: shared.lightPosition,
      pixelRatio: shared.pixelRatio,
      resolution: shared.resolution,
      thickness: { value: thickness },
      lightVariation: { value: lightVariation ? 1 : 0 },
      inkColor: { value: rgb(color) },
    },
    vertexShader: /* glsl */ `
      uniform vec3 lightPosition;
      uniform float pixelRatio;
      uniform vec2 resolution;
      uniform float thickness;
      uniform float lightVariation;

      void main() {
        vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        float ndl = dot(worldNormal, normalize(lightPosition - worldPosition.xyz));
        float width = thickness * mix(1.0, mix(1.8, 0.5, smoothstep(-0.3, 0.6, ndl)), lightVariation);

        // Push the vertex along the normal as seen on screen, by width pixels
        vec4 clipPosition = projectionMatrix * viewMatrix * worldPosition;
        vec2 screenNormal = (projectionMatrix * viewMatrix * vec4(worldNormal, 0.0)).xy;
        screenNormal = length(screenNormal) > 0.00001 ? normalize(screenNormal) : vec2(0.0);
        clipPosition.xy += screenNormal * width * pixelRatio * 2.0 / resolution * clipPosition.w;
        gl_Position = clipPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 inkColor;
      void main() { gl_FragColor = vec4(inkColor, 1.0); }
    `,
    side: THREE.BackSide,
  });
}

// Halo drawn on a camera-facing square around the star, stronger or weaker with the star's luminosity
export function createHaloMaterial(style, { shared }) {
  if (style === 'watercolor') {
    // A pale yellow bloom around the star, hard-edged with a darker rim where it dried
    return new THREE.ShaderMaterial({
      uniforms: { starLight: shared.starLight },
      vertexShader: flatVertexShader,
      fragmentShader: helpers + /* glsl */ `
        varying vec2 vUv;
        void main() {
          vec2 c = vUv - 0.5;
          float n = fbm3(vec3(c * 4.0, 2.7));
          float edge = length(c) * 2.0 + 0.3 * (n - 0.5);
          float wash = (1.0 - smoothstep(0.58, 0.62, edge)) * (0.2 + 0.2 * (n - 0.5));
          float ring = smoothstep(0.45, 0.6, edge) * (1.0 - smoothstep(0.6, 0.63, edge)) * 0.2;
          gl_FragColor = vec4(1.0, 0.76, 0.32, (wash + ring) * min(starLight, 1.0));
        }
      `,
      transparent: true,
      depthWrite: false,
    });
  }
  if (style === 'pastel') {
    // A warm wash around the star, with an irregular edge
    return new THREE.ShaderMaterial({
      uniforms: { starLight: shared.starLight },
      vertexShader: flatVertexShader,
      fragmentShader: helpers + /* glsl */ `
        varying vec2 vUv;
        void main() {
          vec2 c = vUv - 0.5;
          float d = length(c) * 2.0;
          float alpha = (1.0 - smoothstep(0.25, 1.0, d + 0.35 * (fbm3(vec3(c * 5.0, 1.3)) - 0.5))) * 0.5;
          gl_FragColor = vec4(1.0, 0.8, 0.5, min(alpha * starLight, 1.0));
        }
      `,
      transparent: true,
      depthWrite: false,
    });
  }
  // Anime: lens glare with long thin rays
  return new THREE.ShaderMaterial({
    uniforms: { starLight: shared.starLight },
    vertexShader: flatVertexShader,
    fragmentShader: /* glsl */ `
      uniform float starLight;
      varying vec2 vUv;
      void main() {
        vec2 c = (vUv - 0.5) * 2.0;
        // (faded out before the edge of the square, so that its border never shows)
        float glow = exp(-length(c) * 5.0) * 0.8 * (1.0 - smoothstep(0.6, 1.0, length(c)));
        float rays = exp(-abs(c.y) * 70.0) * (1.0 - smoothstep(0.0, 1.0, abs(c.x)))
                   + exp(-abs(c.x) * 70.0) * (1.0 - smoothstep(0.0, 1.0, abs(c.y)));
        vec2 r = mat2(0.7071, -0.7071, 0.7071, 0.7071) * c;
        rays += 0.5 * (exp(-abs(r.y) * 90.0) * (1.0 - smoothstep(0.0, 0.7, abs(r.x)))
                     + exp(-abs(r.x) * 90.0) * (1.0 - smoothstep(0.0, 0.7, abs(r.y))));
        float intensity = (glow + rays) * starLight;
        gl_FragColor = vec4(min(vec3(1.0, 0.85, 0.6) * intensity, 1.0), min(intensity, 1.0));
      }
    `,
    transparent: true,
    depthWrite: false,
    // Light added to what is behind, which also covers the transparent canvas in front of a background drawn by CSS
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  });
}
