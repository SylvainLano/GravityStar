import{r as e}from"./rolldown-runtime-XKyaHtl9.js";import{A as t,B as n,C as r,D as i,E as a,F as o,G as s,H as c,I as l,K as u,L as d,M as f,N as p,O as m,P as h,R as g,S as _,T as v,U as y,V as b,W as x,_ as S,a as C,b as w,c as T,d as E,f as D,g as O,h as k,i as A,j as ee,k as j,l as M,m as te,n as ne,o as re,p as ie,r as ae,s as N,t as oe,u as se,v as P,w as ce,x as le,y as F,z as ue}from"./vendor-CfFc5B5O.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var de=e(s(),1),I=e(u(),1),fe=60,pe=3;function me(e){return Math.min(e*fe,pe)}var he=6.674*10**-11,ge=333e3;function _e(e,t){return t*t*e/(he*ge)}function L(e,t,n,r=new y){let i=r;i.subVectors(t,n);let a=i.lengthSq(),o=he*e/a;return i.normalize().multiplyScalar(-o)}var ve=new y;function ye(e,t,n){let r=e.length(),i=t.length(),a=ve.crossVectors(e,t).y<0,o=he*n;if(o<=0)return{distance:r,speed:i,period:null,eccentricity:1/0,semiMajorAxis:1/0,closest:r,escaping:!0,retrograde:a};let s=i*i/2-o/r,c=ve.lengthSq(),l=Math.sqrt(Math.max(0,1+2*s*c/(o*o))),u=c/(o*(1+l));if(s>=0)return{distance:r,speed:i,period:null,eccentricity:l,semiMajorAxis:1/0,closest:u,escaping:!0,retrograde:a};let d=-o/(2*s);return{distance:r,speed:i,period:2*Math.PI*Math.sqrt(d**3/o),eccentricity:l,semiMajorAxis:d,closest:u,escaping:!1,retrograde:a}}var be={position:new y,velocity:new y,force:new y},xe=Array.from({length:16},()=>({position:new y,velocity:new y,wait:0}));function Se({origin:e,velocity:t,planets:n,starPosition:r,starMass:i,starSize:a,asteroidGravityFactor:o,planetGravityFactor:s,planetSizeFactor:c,maxSteps:l,every:u,points:d}){let f=be.position.copy(e),p=be.velocity.copy(t),m=Math.min(n.length,xe.length);for(let e=0;e<m;e++)xe[e].position.copy(n[e].position),xe[e].velocity.copy(n[e].velocity),xe[e].wait=0;let h=0,g=!1;for(let e=1;e<=l&&!g;e++){for(let e=0;e<m;e++){let t=xe[e];t.velocity.addScaledVector(L(i,t.position,r,be.force),n[e].starPull),t.position.add(t.velocity)}f.add(p);let t=f.distanceTo(r);if(t>0&&p.addScaledVector(L(i,f,r,be.force),o),t<=a)g=!0;else for(let e=0;e<m;e++){let t=xe[e];if(--t.wait,t.wait>0)continue;let r=f.distanceTo(t.position);if(r<.1+n[e].size*c){g=!0;break}let i=L(n[e].mass,f,t.position,be.force);p.add(i.multiplyScalar(o*s));let a=Math.max(1,Math.round(r/(p.length()+t.velocity.length())));i.length()*o*s>1e-4&&(a=Math.max(1,Math.round(a/s))),t.wait=a}if((g||e%u===0)&&(d[h*3]=f.x,d[h*3+1]=f.y,d[h*3+2]=f.z,h++,h*3>=d.length)||f.lengthSq()>2500)break}return{count:h,hit:g}}var Ce=(0,I.createContext)(null);function we(){return{steps:0,substeps:0,stepSize:0,time:0}}function R(){return(0,I.useContext)(Ce)}function Te({simulation:e,speed:t}){return N((n,r)=>{let i=e.current;i.steps=me(r)*t/2,i.substeps=Math.ceil(i.steps-1e-6),i.stepSize=i.substeps>0?i.steps/i.substeps:0,i.time+=i.steps*1e3/60},-1),null}var z=[{id:`realistic`,name:`Realistic`,swatch:[`#05060a`,`#f0a830`],trail:{style:`glow`,width:3,color:`#ffb070`},sound:`spheres`},{id:`neko-nebula`,name:`Neko Nebula`,style:`neko`,swatch:[`#120a3a`,`#ff7ad9`],stars:{colors:[`#ffffff`,`#ff7ad9`,`#7ae8ff`,`#ffe066`],size:1.5,round:!1,opacity:1,stepped:!0},pixelSize:1.5,arrow:`#ff5fa2`,debris:[`#ff7ad9`,`#ffe066`],sunParticles:[`#ffd23f`,`#ff9a3c`],trail:{style:`candy`,width:5,color:`#ff7ad9`,colors:[`#ff7ad9`,`#ffe066`,`#7ae8ff`,`#ffffff`]},sound:`neko`},{id:`anime`,name:`Anime`,style:`anime`,swatch:[`#050a1f`,`#ff8a4c`],stars:{color:`#ffffff`,size:2,round:!0,opacity:.9},arrow:`#ff5f6d`,debris:[`#ff7b3a`,`#ffe0a0`],sunParticles:[`#ffb347`,`#fff1c4`],trail:{style:`glow`,width:3,color:`#ffd9a0`},sound:`anime`},{id:`comic`,name:`Comic`,style:`cel`,swatch:[`#252c70`,`#ffcf3f`],stars:{color:`#ffe9a8`,size:2,round:!0,opacity:.9},arrow:`#ff4b3e`,debris:[`#ff7a2e`,`#ffd23f`],sunParticles:[`#ff8c1a`,`#ffe14d`],trail:{style:`ink`,width:5,color:`#ffd23f`},sound:`comic`},{id:`arcade`,name:`Arcade`,style:`arcade`,swatch:[`#000000`,`#ff3fa4`],stars:{color:`#ffffff`,size:1,round:!1,opacity:1,stepped:!0},pixelSize:1.5,arrow:`#ff3333`,debris:[`#ff6600`,`#ffcc00`],sunParticles:[`#ff6600`,`#ffff33`],trail:{style:`pixels`,width:3,color:`#ffff33`},sound:`chip`},{id:`pastel`,name:`Pastel`,style:`pastel`,swatch:[`#7d889b`,`#f6d38c`],stars:{color:`#f4efe6`,size:2.5,round:!0,opacity:.55},arrow:`#e8735a`,debris:[`#f2c4a0`,`#c9d2f0`],sunParticles:[`#f6c27a`,`#fbe3a6`],trail:{style:`chalk`,width:4,color:`#f4efe6`},sound:`soft`},{id:`watercolor`,name:`Watercolor`,style:`watercolor`,swatch:[`#f8f5ee`,`#4a6fa5`],stars:{color:`#4a5a8a`,size:2.5,round:!0,opacity:.35},arrow:`#c4574f`,debris:[`#7c7396`,`#c39b7a`],sunParticles:[`#f0a35e`,`#f6d38c`],trail:{style:`wash`,width:8,color:`#4a6fa5`},sound:`soft`}],Ee=`gravity-star-skin`;function De(e){return z.find(t=>t.id===e)}function Oe(){let e=new URLSearchParams(window.location.search).get(`skin`);if(De(e))return e;try{let e=window.localStorage.getItem(Ee);if(De(e))return e}catch{}return z[0].id}function ke(e){try{window.localStorage.setItem(Ee,e)}catch{}let t=new URL(window.location.href);e===z[0].id?t.searchParams.delete(`skin`):t.searchParams.set(`skin`,e),window.history.replaceState(null,``,t)}function Ae(){return{lightPosition:{value:new y},spotPosition:{value:new y},spotRange:{value:0},starLight:{value:1},pixelRatio:{value:1},resolution:{value:new c(1,1)}}}function B(e){let t=new k().setStyle(e,w);return new y(t.r,t.g,t.b)}var je=`
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
`,Me=`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Ne=`
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
`,Pe={cel:`
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
`,pastel:`
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
`,watercolor:`
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
`,anime:`
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
`,arcade:`
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
`};function Fe(e,{map:t,shared:n,emissive:r=!1,rimColor:i=`#000000`}){return new p({uniforms:{map:{value:t},lightPosition:n.lightPosition,spotPosition:n.spotPosition,spotRange:n.spotRange,starLight:n.starLight,pixelRatio:n.pixelRatio,resolution:n.resolution,shadowTint:{value:B(`#6b55b5`)},inkColor:{value:B(`#1a1440`)},rimColor:{value:B(i)}},defines:r?{EMISSIVE:``}:{},vertexShader:je,fragmentShader:Ne+Pe[e],transparent:e===`pastel`||e===`watercolor`})}function Ie({shared:e,thickness:t,color:n=`#000000`,lightVariation:r=!0}){return new p({uniforms:{lightPosition:e.lightPosition,pixelRatio:e.pixelRatio,resolution:e.resolution,thickness:{value:t},lightVariation:{value:+!!r},inkColor:{value:B(n)}},vertexShader:`
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
    `,fragmentShader:`
      uniform vec3 inkColor;
      void main() { gl_FragColor = vec4(inkColor, 1.0); }
    `,side:1})}function Le(e,{shared:t}){return e===`watercolor`?new p({uniforms:{starLight:t.starLight},vertexShader:Me,fragmentShader:Ne+`
        varying vec2 vUv;
        void main() {
          vec2 c = vUv - 0.5;
          float n = fbm3(vec3(c * 4.0, 2.7));
          float edge = length(c) * 2.0 + 0.3 * (n - 0.5);
          float wash = (1.0 - smoothstep(0.58, 0.62, edge)) * (0.2 + 0.2 * (n - 0.5));
          float ring = smoothstep(0.45, 0.6, edge) * (1.0 - smoothstep(0.6, 0.63, edge)) * 0.2;
          gl_FragColor = vec4(1.0, 0.76, 0.32, (wash + ring) * min(starLight, 1.0));
        }
      `,transparent:!0,depthWrite:!1}):e===`pastel`?new p({uniforms:{starLight:t.starLight},vertexShader:Me,fragmentShader:Ne+`
        varying vec2 vUv;
        void main() {
          vec2 c = vUv - 0.5;
          float d = length(c) * 2.0;
          float alpha = (1.0 - smoothstep(0.25, 1.0, d + 0.35 * (fbm3(vec3(c * 5.0, 1.3)) - 0.5))) * 0.5;
          gl_FragColor = vec4(1.0, 0.8, 0.5, min(alpha * starLight, 1.0));
        }
      `,transparent:!0,depthWrite:!1}):new p({uniforms:{starLight:t.starLight},vertexShader:Me,fragmentShader:`
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
    `,transparent:!0,depthWrite:!1,blending:5,blendSrc:201,blendDst:201,blendSrcAlpha:201,blendDstAlpha:205})}var V=se(),Re=(0,I.createContext)(null);function ze({skinId:e,lightPosition:t,starIntensity:n,spotPosition:r,spotRange:i,children:a}){let o=De(e),s=(0,I.useMemo)(Ae,[]),c=(0,I.useMemo)(()=>new Map,[]);(0,I.useLayoutEffect)(()=>{s.lightPosition.value.copy(t),s.spotPosition.value.copy(r),s.spotRange.value=i,s.starLight.value=n/5},[s,t,n,r,i]);let l=M(e=>e.size),u=M(e=>e.viewport.dpr);(0,I.useLayoutEffect)(()=>{s.pixelRatio.value=u,s.resolution.value.set(l.width*u,l.height*u)},[s,l,u]);let d=(0,I.useMemo)(()=>({skin:o,shared:s,looks:c}),[o,s,c]);return(0,V.jsx)(Re.Provider,{value:d,children:a})}function Be(){return(0,I.useContext)(Re).skin}function Ve(e,t){let{skin:n,shared:r,looks:i}=(0,I.useContext)(Re);if(!n.style)return null;let a=`${n.style}:${e}`;return i.has(a)||i.set(a,t(n.style,r)),i.get(a)}var He={mercury:[[`#9a9a9a`,`#b8b8d0`],[`#6a6a6a`,`#8484a4`],[`#cfcfcf`,`#e4e4f4`],[`#3c3c3c`,`#5c5c80`]],venus:[[`#e6cc8c`,`#ffe08a`],[`#c8a060`,`#f5b752`],[`#f4e6c0`,`#fff4cc`]],earth:[[`#0a1e50`,`#1f4fd1`],[`#1c4a78`,`#3a8fe8`],[`#3c5028`,`#2fae4a`],[`#8c7850`,`#e8c060`],[`#e6e6e6`,`#ffffff`]],mars:[[`#b4643c`,`#f06a3a`],[`#82462c`,`#c0442a`],[`#d29a78`,`#ffa070`],[`#50301e`,`#8a2c1e`]],jupiter:[[`#f0ebe0`,`#fff1d6`],[`#d2b896`,`#ffc46b`],[`#ad8462`,`#f08a2c`],[`#805c46`,`#b5561c`]],saturn:[[`#dcc89a`,`#ffe2a0`],[`#bea270`,`#f0c070`],[`#9a7e56`,`#c8955a`]],uranus:[[`#9fd8de`,`#7fe3e8`],[`#7ab8c4`,`#4fc3cf`],[`#c8eef0`,`#c2f7f7`]],neptune:[[`#3c5cc8`,`#3a63e0`],[`#25388c`,`#2541a8`],[`#6a8ae0`,`#6f9bff`],[`#c4d0f0`,`#d6e4ff`]],asteroid:[[`#8a7a6a`,`#a08c7c`],[`#5a4c42`,`#7a665a`],[`#322a24`,`#4e3e36`],[`#b4a696`,`#c8b4a0`]]},H=`#2a0f3a`,Ue=`
  uniform sampler2D map;
  uniform float hasMap;
  uniform vec3 baseColor;
  uniform vec3 matchColors[6];
  uniform vec3 outputColors[6];
  uniform int paletteSize;
  uniform sampler2D faceMap;
  uniform float hasFace;
  uniform float faceOnly;
  uniform vec4 faceRect; // Center and half size of the face, in the surface's UV coordinates
  uniform float selfLit;
  uniform float unlit;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 color = baseColor;

    // Flat vivid colors: each pixel of the real texture takes the vivid color paired with the nearest real color
    if (hasMap > 0.5) {
      vec3 source = toSrgb(texture2D(map, vUv, 1.5).rgb);
      float nearest = 1e9;
      for (int i = 0; i < 6; i++) {
        if (i >= paletteSize) break;
        float d = distance(source, matchColors[i]);
        if (d < nearest) {
          nearest = d;
          color = outputColors[i];
        }
      }
    }

    // Face drawn over the front, in pixel art
    if (hasFace > 0.5) {
      vec2 faceUv = (vUv - faceRect.xy) / (2.0 * faceRect.zw) + 0.5;
      vec4 face = vec4(0.0);
      if (faceUv.x >= 0.0 && faceUv.x <= 1.0 && faceUv.y >= 0.0 && faceUv.y <= 1.0) face = texture2D(faceMap, faceUv);
      if (face.a > 0.5) color = face.rgb;
      else if (faceOnly > 0.5) discard;
    }

    if (unlit > 0.5) {
      gl_FragColor = vec4(color, 1.0);
      return;
    }

    // Sprite lighting: always from the upper left of the screen as in the games of the time, rather than from the star,
    // so that the characters stay readable. Four tones, dithered into each other, shadows leaning towards violet.
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize((vec4(normalize(vec3(-0.65, 0.7, 0.45)), 0.0) * viewMatrix).xyz);
    vec3 V = normalize(cameraPosition - vWorldPosition);
    float light = clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0);
    float tone = floor(light * 3.0 + bayer4(gl_FragCoord.xy) * 0.999);
    if (selfLit > 0.5) tone = max(tone, 1.0);

    vec3 darkest = color * vec3(0.42, 0.36, 0.62);
    vec3 shaded = tone < 0.5 ? darkest
                : tone < 1.5 ? color * vec3(0.7, 0.64, 0.86)
                : tone < 2.5 ? color
                : mix(color, vec3(1.0, 0.98, 0.88), 0.4);

    // A small white glint
    if (dot(N, normalize(L + V)) > 0.9975) shaded = vec3(1.0);

    // With the star switched off, everything takes its darkest tone, and the star itself goes dark
    gl_FragColor = vec4(byStarLight(selfLit > 0.5 ? vec3(0.0) : darkest, shaded), 1.0);
  }
`;function U({shared:e,map:t=null,palette:n=null,color:r=`#ffffff`,faceMap:i=null,faceRect:a=[.25,.5,.16,.3],faceOnly:o=!1,selfLit:s=!1,unlit:c=!1}){let l=n??[],u=e=>Array.from({length:6},(t,n)=>B(l[Math.min(n,l.length-1)]?.[e]??`#000000`));return new p({uniforms:{map:{value:t},hasMap:{value:+!!t},baseColor:{value:B(r)},matchColors:{value:u(0)},outputColors:{value:u(1)},paletteSize:{value:l.length},faceMap:{value:i},hasFace:{value:+!!i},faceOnly:{value:+!!o},faceRect:{value:new x(...a)},selfLit:{value:+!!s},unlit:{value:+!!c},lightPosition:e.lightPosition,starLight:e.starLight,pixelRatio:e.pixelRatio},vertexShader:je,fragmentShader:Ne+Ue,transparent:o})}function We(){let e=new h;for(let t=0;t<10;t++){let n=t%2==0?1:.5,r=Math.PI/2+t*Math.PI/5;t===0?e.moveTo(Math.cos(r)*n,Math.sin(r)*n):e.lineTo(Math.cos(r)*n,Math.sin(r)*n)}e.closePath();let t=new F(e,{depth:.3,bevelEnabled:!0,bevelThickness:.22,bevelSize:.16,bevelSegments:5});return t.center(),t.deleteAttribute(`uv`),t.deleteAttribute(`normal`),t=C(t),t.computeVertexNormals(),t.setAttribute(`uv`,new E(new Float32Array(t.attributes.position.count*2),2)),t}function Ge(e,t){let n=new O(e,t,3,1,!1,Math.PI/3);return n.translate(0,t/2,0),n}function Ke(e,t,n,r=32,i=10){let a=new te(e),o=new b(a,r,1,i,!1),s=o.attributes.position,c=new y,l=new y;for(let e=0;e<=r;e++){let o=e/r;a.getPointAt(o,c);let u=t+(n-t)*o;for(let t=0;t<=i;t++){let n=e*(i+1)+t;l.fromBufferAttribute(s,n).sub(c).multiplyScalar(u).add(c),s.setXYZ(n,l.x,l.y,l.z)}}return s.needsUpdate=!0,o}function qe(){return Ke([new y(.4,-.8,0),new y(.8,-1.2,0),new y(1.05,-1.55,0),new y(1.32,-1.62,0),new y(1.42,-1.42,0)],.18,.04)}var Je=new y(1,1.35,0);function Ye(){return Ke([new y(0,.62,0),new y(0,1.1,0),new y(.2,1.5,0),new y(.62,1.62,0),Je],.8,.08,40,16)}function Xe(){let e=new y(0,1,0),t=[];for(let n=0;n<80;n++){let r=1-2*(n+.5)/80,i=Math.sqrt(1-r*r),a=n*Math.PI*(3-Math.sqrt(5)),o=new y(Math.cos(a)*i,r,Math.sin(a)*i);if(o.z>.5)continue;let s=new O(.075,.3,6);s.translate(0,.94+.15,0),s.applyQuaternion(new j().setFromUnitVectors(e,o)),t.push(s)}return A(t)}function Ze(){let e=[0,1,2].map(e=>{let t=Math.PI/2+e*Math.PI*2/3;return new c(Math.cos(t)*1.05,Math.sin(t)*1.05-.1)}),t=new h;e.forEach((n,r)=>{let i=n.clone().lerp(e[(r+2)%3],.35),a=n.clone().lerp(e[(r+1)%3],.35);r===0?t.moveTo(i.x,i.y):t.lineTo(i.x,i.y),t.quadraticCurveTo(n.x,n.y,a.x,a.y)}),t.closePath();let n=new F(t,{depth:.5,bevelEnabled:!0,bevelThickness:.28,bevelSize:.18,bevelSegments:6,curveSegments:8});n.center(),n.deleteAttribute(`uv`),n.deleteAttribute(`normal`),n=C(n),n.computeVertexNormals(),n.computeBoundingBox();let{min:r,max:i}=n.boundingBox,a=n.attributes.position,o=new Float32Array(a.count*2);for(let e=0;e<a.count;e++)o[e*2]=(a.getX(e)-r.x)/(i.x-r.x),o[e*2+1]=(a.getY(e)-r.y)/(i.y-r.y);return n.setAttribute(`uv`,new E(o,2)),n}function Qe(){let e=new te([new y(.17,-.34,.96),new y(.55,-.36,.88),new y(.95,-.15,.55),new y(1.12,.35,.3),new y(1.1,.95,.2),new y(1.02,1.3,.18)]);return new b(e,40,.065,8,!1)}function W(e,t=64){let n=document.createElement(`canvas`);n.width=t,n.height=t,e(n.getContext(`2d`));let r=new ie(n);return r.magFilter=v,r.minFilter=v,r.generateMipmaps=!1,r}function $e(){return W(e=>{e.lineCap=`round`,e.lineJoin=`round`,e.strokeStyle=`#b5561c`,e.lineWidth=2.5,e.beginPath(),e.moveTo(23,12),e.lineTo(27,19),e.lineTo(32,13),e.lineTo(37,19),e.lineTo(41,12),e.stroke();for(let t of[-1,1]){let n=32+t*10;e.save(),e.translate(n,28),e.rotate(t*-.22),e.beginPath(),e.ellipse(0,0,7,5.5,0,0,Math.PI*2),e.fillStyle=`#ffd23a`,e.fill(),e.lineWidth=1.6,e.strokeStyle=H,e.stroke(),e.beginPath(),e.ellipse(0,.3,1.6,5,0,0,Math.PI*2),e.fillStyle=H,e.fill(),e.restore(),e.fillStyle=`#ffffff`,e.fillRect(n-4,25,2,2)}e.beginPath(),e.moveTo(29,36),e.lineTo(35,36),e.lineTo(32,39.5),e.closePath(),e.fillStyle=`#ff7aa8`,e.fill(),e.lineWidth=1.2,e.strokeStyle=H,e.stroke(),e.strokeStyle=`#5a2410`,e.lineWidth=1.5,e.beginPath(),e.moveTo(32,39.5),e.quadraticCurveTo(31,44,27,43),e.moveTo(32,39.5),e.quadraticCurveTo(33,44,37,43),e.stroke(),e.strokeStyle=`#ffffff`,e.lineWidth=1.6;for(let t of[-1,1])for(let n=0;n<3;n++)e.beginPath(),e.moveTo(32+t*9,38+n*2.5),e.lineTo(32+t*31,34+n*6),e.stroke()})}function et(){return W(e=>{e.fillStyle=`#ff9a70`;for(let[t,n,r]of[[24,12,2],[31,9,1.5],[39,13,2],[45,18,1.5],[18,17,1.5]])e.beginPath(),e.arc(t,n,r,0,Math.PI*2),e.fill();for(let t of[-1,1]){let n=32+t*10;e.save(),e.beginPath(),e.arc(n,28,7,0,Math.PI*2),e.fillStyle=`#fff7ea`,e.fill(),e.clip(),e.fillStyle=H,e.beginPath(),e.roundRect(n-4.5,27.5,9,3.4,1.5),e.fill(),e.fillStyle=`#c0442a`,e.fillRect(n-8,20,16,6.5),e.restore(),e.lineWidth=1.6,e.strokeStyle=H,e.beginPath(),e.arc(n,28,7,0,Math.PI*2),e.stroke(),e.beginPath(),e.moveTo(n-6.6,26.5),e.lineTo(n+6.6,26.5),e.stroke(),e.fillStyle=`#ffffff`,e.fillRect(n+1,28.5,1.5,1.5)}e.beginPath(),e.arc(32,43,3.2,0,Math.PI*2),e.fillStyle=`#ff8fb0`,e.fill(),e.lineWidth=1.4,e.strokeStyle=H,e.stroke(),e.beginPath(),e.arc(32,43,1.3,0,Math.PI*2),e.fillStyle=`#5a1a2a`,e.fill()})}function tt(){return W(e=>{e.lineCap=`round`;for(let t of[-1,1]){let n=32+t*10;e.save(),e.beginPath(),e.ellipse(n,18,6,4.5,0,0,Math.PI*2),e.fillStyle=`#fffaf0`,e.fill(),e.clip(),e.fillStyle=H,e.beginPath(),e.arc(n-2.5,18.8,2.6,0,Math.PI*2),e.fill(),e.fillStyle=`#d9a556`,e.fillRect(n-7,12,14,5),e.restore(),e.lineWidth=1.6,e.strokeStyle=H,e.beginPath(),e.ellipse(n,18,6,4.5,0,0,Math.PI*2),e.stroke(),e.beginPath(),e.moveTo(n-5.8,17),e.lineTo(n+5.8,17),e.stroke()}e.lineWidth=1.8,e.strokeStyle=H,e.beginPath(),e.moveTo(26,31),e.quadraticCurveTo(33,35,39,29),e.stroke()})}function nt(){return W(e=>{e.fillStyle=`#f7f5ef`,e.fillRect(0,0,64,64),e.fillStyle=`#e1dccf`;let t=3;for(let n=0;n<70;n++){t=t*16807%2147483647;let n=t%64;t=t*16807%2147483647;let r=t%64;e.beginPath(),e.ellipse(n,r,1.6,.8,t%6*.5,0,Math.PI*2),e.fill()}e.fillStyle=`#1d3326`,e.fillRect(19,46,26,18),e.fillStyle=`#33543f`;for(let t=20;t<44;t+=6)e.fillRect(t,48,1.5,14);e.lineCap=`round`,e.strokeStyle=H,e.lineWidth=1.8,e.beginPath(),e.moveTo(22,25),e.lineTo(29,28),e.moveTo(42,25),e.lineTo(35,28),e.stroke(),e.fillStyle=H;for(let t of[26,38])e.beginPath(),e.ellipse(t,31.5,1.6,2.2,0,0,Math.PI*2),e.fill();e.beginPath(),e.moveTo(27,41),e.quadraticCurveTo(32,37,37,41),e.stroke(),e.beginPath(),e.moveTo(45,18),e.quadraticCurveTo(48,23,45,25),e.quadraticCurveTo(42,23,45,18),e.fillStyle=`#7ad3ff`,e.fill(),e.lineWidth=1,e.stroke()})}function rt(){return W(e=>{e.lineCap=`round`;for(let t of[-1,1]){let n=32+t*10;e.fillStyle=`#9b59d0`,e.beginPath(),e.ellipse(n,27,7,4.5,0,Math.PI,Math.PI*2),e.fill(),e.save(),e.beginPath(),e.ellipse(n,28,6.5,4,0,0,Math.PI),e.clip(),e.fillStyle=`#fffaf2`,e.fillRect(n-7,28,14,5),e.fillStyle=`#5a2d1a`,e.beginPath(),e.arc(n,28,2.8,0,Math.PI*2),e.fill(),e.restore(),e.strokeStyle=H,e.lineWidth=1.8,e.beginPath(),e.moveTo(n-6.5,28),e.lineTo(n+6.5,28),e.stroke(),e.lineWidth=1.2;for(let r=0;r<4;r++){let i=n+t*(1+r*1.8);e.beginPath(),e.moveTo(i,28),e.lineTo(i+t*(1.5+r*.6),25-r*.5),e.stroke()}}e.beginPath(),e.moveTo(25,42),e.quadraticCurveTo(29,38,32,40),e.quadraticCurveTo(35,38,39,42),e.quadraticCurveTo(32,48,25,42),e.fillStyle=`#e0245e`,e.fill(),e.strokeStyle=H,e.lineWidth=1.2,e.stroke(),e.fillStyle=`#ff86a8`,e.fillRect(29,43,3,1.5),e.fillStyle=H,e.beginPath(),e.arc(41,37,1.2,0,Math.PI*2),e.fill()})}function it(){return W(e=>{e.fillStyle=`#1b1b26`,e.beginPath(),e.roundRect(12,18,40,19,7),e.fill(),e.fillStyle=`#a8ecff`,e.beginPath(),e.roundRect(14.5,20.5,35,14,5),e.fill(),e.fillStyle=`#1b1b26`,e.fillRect(31,20,2,3);for(let t of[-1,1]){let n=32+t*9;e.beginPath(),e.ellipse(n,27.5,4.5,4.5,0,0,Math.PI*2),e.fillStyle=`#ffffff`,e.fill(),e.lineWidth=1.2,e.strokeStyle=H,e.stroke(),e.fillStyle=H,e.beginPath(),e.arc(n+t*.5,28,2,0,Math.PI*2),e.fill()}e.strokeStyle=`#ffffff`,e.lineWidth=1.5,e.beginPath(),e.moveTo(17,30),e.lineTo(21,23),e.stroke(),e.fillStyle=`#ff7a1f`,e.beginPath(),e.roundRect(33,41,9,5,2),e.fill(),e.lineWidth=1.2,e.strokeStyle=H,e.stroke()})}function at(){return W(e=>{e.lineCap=`round`,e.strokeStyle=H,e.lineWidth=1.8;for(let t of[22,42])e.beginPath(),e.arc(t,26,5,.15*Math.PI,.85*Math.PI),e.stroke();e.beginPath(),e.ellipse(29,41,2.6,2,0,0,Math.PI*2),e.fillStyle=`#5a1a2a`,e.fill(),e.lineWidth=1.2,e.stroke(),e.beginPath(),e.arc(40,35,5.5,0,Math.PI*2),e.fillStyle=`#d8f8ff`,e.fill(),e.lineWidth=1.2,e.strokeStyle=`#4fa8c8`,e.stroke(),e.fillStyle=`#ffffff`,e.fillRect(37.5,32,2,2)})}function ot(){return W(e=>{for(let t of[-1,1]){let n=32+t*10;e.beginPath(),e.arc(n,27,7.5,0,Math.PI*2),e.fillStyle=`#ffffff`,e.fill(),e.lineWidth=1.6,e.strokeStyle=H,e.stroke(),e.fillStyle=H,e.beginPath(),e.arc(n-t*.5,26,2.2,0,Math.PI*2),e.fill(),e.fillStyle=`#ffffff`,e.fillRect(n-t*.5-1.5,24.5,1.2,1.2)}e.beginPath(),e.ellipse(32,42,3.4,3,0,0,Math.PI*2),e.fillStyle=`#ffb3c6`,e.fill(),e.lineWidth=1.4,e.strokeStyle=H,e.stroke(),e.beginPath(),e.ellipse(32,42,1.4,1.1,0,0,Math.PI*2),e.fillStyle=`#5a1a2a`,e.fill()})}function st(){return W(e=>{for(let t=0;t<64;t+=8)e.fillStyle=t/8%2==0?`#3b5bdb`:`#f1f3ff`,e.fillRect(t,0,8,64)})}function ct(){return W(e=>{e.lineCap=`round`,e.lineJoin=`round`;let t=()=>{e.beginPath(),e.moveTo(8,8),e.lineTo(24,8),e.lineTo(8,24),e.lineTo(24,24),e.stroke()};e.strokeStyle=H,e.lineWidth=8,t(),e.strokeStyle=`#ffffff`,e.lineWidth=4.5,t()},32)}function lt(){return W(e=>{e.fillStyle=`#f0cc78`,e.fillRect(0,0,64,64),e.fillStyle=`#d4a24a`;for(let t=0;t<64;t+=8)for(let n=0;n<64;n+=8)(n+t)%16==0?e.fillRect(n,t+3,7,1.5):e.fillRect(n+3,t,1.5,7)})}function ut(){return W(e=>{let t=128/1.95,n=[[1.95,H],[1.92,`#f2d27e`],[1.72,`#c8953f`],[1.67,`#f6dc96`],[1.42,`#9e6a2a`],[1.37,`#e8bf68`],[1.06,H]];for(let[r,i]of n)e.beginPath(),e.arc(128,128,r*t,0,Math.PI*2),e.fillStyle=i,e.fill();e.strokeStyle=`#c8953f`,e.lineWidth=1;for(let n=0;n<Math.PI*2;n+=Math.PI/36)e.beginPath(),e.moveTo(128+Math.cos(n)*1.1*t,128+Math.sin(n)*1.1*t),e.lineTo(128+Math.cos(n)*1.88*t,128+Math.sin(n)*1.88*t),e.stroke();e.globalCompositeOperation=`destination-out`,e.beginPath(),e.arc(128,128,t,0,Math.PI*2),e.fill()},256)}function dt(){return W(e=>{e.lineJoin=`round`;let t=t=>{e.beginPath(),e.moveTo(t,20),e.lineTo(t+18,20),e.lineTo(t+16,28),e.quadraticCurveTo(t+15,31,t+11,31),e.lineTo(t+6,31),e.quadraticCurveTo(t+1,31,t+1,27),e.closePath(),e.fill()};e.fillStyle=`#140a1e`,t(12),t(34),e.fillRect(28,21,8,2.5),e.fillStyle=`#ffffff`,e.fillRect(15,22,5,1.5),e.fillRect(37,22,5,1.5),e.beginPath(),e.moveTo(21,39),e.quadraticCurveTo(33,52,44,37),e.quadraticCurveTo(33,44,21,39),e.closePath(),e.fillStyle=`#7a1a2a`,e.fill(),e.save(),e.clip(),e.fillStyle=`#ffffff`,e.fillRect(20,37,26,4),e.restore(),e.lineWidth=1.5,e.strokeStyle=H,e.stroke()})}function ft(e){return Ie({shared:e,thickness:1.5,color:H,lightVariation:!1})}function pt({shared:e,map:t,name:n}){let r=ft(e),i=(t,n={})=>U({shared:e,color:t,...n}),a=(r={})=>U({shared:e,map:t,palette:He[n],...r});switch(n){case`mercury`:return{body:i(`#f7f5ef`,{faceMap:nt(),faceRect:[.5,.5,.5,.5]}),outline:r};case`venus`:return{body:a({faceMap:rt()}),pearl:i(`#fdf6ee`),gold:i(`#ffcc33`),outline:r};case`earth`:return{body:a({faceMap:it()}),strap:i(`#1b1b26`),snorkel:i(`#ffd23f`),outline:r};case`mars`:return{body:a({faceMap:et()}),tentacle:i(`#e8553a`),outline:r};case`jupiter`:return{head:a({faceMap:$e()}),ear:i(`#f08a2c`),innerEar:i(`#ff8fb0`),outline:r};case`saturn`:{let t=U({shared:e,faceMap:ut(),faceRect:[.5,.5,.5,.5],faceOnly:!0});return t.side=2,{body:a({faceMap:tt(),faceRect:[.25,.42,.16,.2]}),crown:i(`#f0cc78`,{faceMap:lt(),faceRect:[.5,.5,.5,.5]}),ribbon:i(`#283a9c`),brim:t,petal:i(`#ff5fa2`),flowerHeart:i(`#ffd23f`),outline:r}}case`uranus`:return{body:a({faceMap:at()}),cap:i(`#ffffff`,{faceMap:st(),faceRect:[.5,.5,.5,.5]}),capBand:i(`#f6f7ff`),sleepZ:U({shared:e,faceMap:ct(),faceRect:[.5,.5,.5,.5],faceOnly:!0,unlit:!0}),outline:r};case`neptune`:return{body:a({faceMap:ot()}),spikes:i(`#ffe9a8`),fin:i(`#ffb02e`),outline:r};default:return null}}function mt({shared:e}){return{body:U({shared:e,color:`#ffd23f`,selfLit:!0}),face:U({shared:e,faceMap:dt(),faceRect:[.5,.5,.5,.5],faceOnly:!0,unlit:!0}),outline:ft(e)}}function ht({shared:e,scene:t}){let n=ft(e),r=t.clone(!0),i=[];r.traverse(e=>{e.isMesh&&i.push(e)});for(let t of i)t.material=U({shared:e,map:t.material.map,palette:He.asteroid}),t.add(new _(t.geometry,n));return r}var gt={mercury:`#c9c2b8`,venus:`#ffd9a0`,earth:`#5ab8ff`,mars:`#ff9f80`,jupiter:`#a8865a`,saturn:`#e6d3a0`,uranus:`#9ff0f0`,neptune:`#7aa8ff`};function _t(e,t,n,r=!0){return e===`cel`?Ie({shared:t,thickness:n,color:`#0a0820`,lightVariation:r}):e===`anime`?Ie({shared:t,thickness:n*.5,color:`#0b0f2a`,lightVariation:!1}):null}function vt(e,{shared:t,map:n,name:r}){return n.colorSpace=f,e===`neko`?{character:pt({shared:t,map:n,name:r})}:{material:Fe(e,{map:n,shared:t,rimColor:gt[r]??`#ffffff`}),outline:_t(e,t,2)}}function yt(e,{shared:t,map:n}){if(e===`neko`)return{character:mt({shared:t})};let r=n.clone();return r.colorSpace=f,{material:Fe(e,{map:r,shared:t,emissive:!0}),outline:_t(e,t,2,!1),halo:e===`pastel`||e===`anime`||e===`watercolor`?Le(e,{shared:t}):null,haloSize:{anime:10,watercolor:4.5}[e]??5.7}}function bt(e,{shared:t,scene:n}){if(e===`neko`)return ht({shared:t,scene:n});let r=n.clone(!0),i=[];r.traverse(e=>{e.isMesh&&i.push(e)});for(let n of i){n.material=Fe(e,{map:n.material.map,shared:t});let r=_t(e,t,1.6);r&&n.add(new _(n.geometry,r))}return r}function xt(e){return e>0?2**(e-1)*1e3:0}var St=1024,Ct=Math.cos(le.degToRad(3)),wt=1025,Tt=1e3/60,Et={glow:0,ink:1,pixels:2,candy:3,chalk:4,wash:5},Dt=(()=>{let e=new Uint16Array(6144);for(let t=0;t<1024;t++)e.set([2*t,2*t+1,2*t+2,2*t+1,2*t+3,2*t+2],t*6);return e})(),Ot=`
  uniform vec2 resolution;
  uniform float pixelRatio;
  uniform float width;
  uniform float now; // The simulated time, and the trail's length, to know the age of each point
  uniform float duration;
  attribute vec3 previous;
  attribute vec3 next;
  attribute float side;
  attribute float time;
  attribute float along;
  varying float vAge;
  varying float vSide;
  varying float vAlong;

  void main() {
    float age = clamp((now - time) / duration, 0.0, 1.0);
    vAge = age;
    vSide = side;
    vAlong = along;
    mat4 transform = projectionMatrix * modelViewMatrix;
    vec4 current = transform * vec4(position, 1.0);
    vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
    vec2 here = current.xy / current.w * aspect;
    vec2 before = here - (transform * vec4(previous, 1.0)).xy / (transform * vec4(previous, 1.0)).w * aspect;
    vec2 after = (transform * vec4(next, 1.0)).xy / (transform * vec4(next, 1.0)).w * aspect - here;
    // The direction of the trail on screen, and the ribbon pushed out on both sides of it
    vec2 direction = length(before) > 1e-6 ? normalize(before) : vec2(1.0, 0.0);
    if (length(after) > 1e-6) direction = normalize(direction + normalize(after));
    vec2 normal = vec2(-direction.y, direction.x) / aspect;
    float pixels = width * pixelRatio * (0.3 + 0.7 * (1.0 - age));
    current.xy += normal * side * pixels / resolution.y * current.w;
    gl_Position = current;
  }
`,kt=`
  uniform vec3 color;
  uniform vec3 inkColor;
  uniform vec3 candyColors[4];
  uniform int style;
  uniform float pixelRatio;
  varying float vAge;
  varying float vSide;
  varying float vAlong;

  float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    float fade = 1.0 - vAge;
    float edge = abs(vSide);
    vec3 tint = color;
    float alpha = fade;

    if (style == 0) {
      // Glow: bright in the middle, soft on the edges
      alpha = fade * pow(1.0 - edge, 1.5);
      tint = mix(color, vec3(1.0), pow(1.0 - edge, 4.0) * 0.6);
    } else if (style == 1) {
      // Ink: the color inside an ink border
      tint = edge > 0.55 ? inkColor : color;
      alpha = smoothstep(0.0, 0.15, fade);
    } else if (style == 2) {
      // Pixels: dashes, fading in a few steps
      if (fract(vAlong / 0.12) > 0.55) discard;
      alpha = ceil(fade * 3.0) / 3.0;
    } else if (style == 3) {
      // Candy: round dots, each one of the next color
      float dotNumber = floor(vAlong / 0.09);
      vec2 inDot = vec2(fract(vAlong / 0.09) - 0.5, vSide * 0.5);
      if (length(inDot) > 0.4) discard;
      int index = int(mod(dotNumber, 4.0));
      tint = index == 0 ? candyColors[0] : index == 1 ? candyColors[1] : index == 2 ? candyColors[2] : candyColors[3];
      alpha = smoothstep(0.0, 0.3, fade);
    } else if (style == 4) {
      // Chalk: broken by the grain of the paper
      if (hash21(floor(gl_FragCoord.xy / pixelRatio / 1.5)) > 0.35 + 0.5 * fade) discard;
      alpha = fade * (1.0 - smoothstep(0.7, 1.0, edge));
    } else {
      // Wash: translucent, darker where the pigment gathered along its edges
      alpha = fade * (0.25 + 0.35 * smoothstep(0.55, 0.95, edge)) * (1.0 - smoothstep(0.92, 1.0, edge));
    }
    gl_FragColor = vec4(tint, alpha);
  }
`,At=I.memo(({target:e,duration:t,look:n,color:r})=>{let i=R(),a=(0,I.useRef)({data:new Float64Array(St*5),start:0,count:0,along:0,drawn:-1});(0,I.useEffect)(()=>{a.current.count=0,a.current.drawn=-1},[e]);let o=(0,I.useMemo)(()=>{let e=new D,t=wt*2;return e.setAttribute(`position`,new E(new Float32Array(t*3),3)),e.setAttribute(`previous`,new E(new Float32Array(t*3),3)),e.setAttribute(`next`,new E(new Float32Array(t*3),3)),e.setAttribute(`time`,new E(new Float32Array(t),1)),e.setAttribute(`along`,new E(new Float32Array(t),1)),e.setAttribute(`side`,new E(Float32Array.from({length:t},(e,t)=>t%2==0?-1:1),1)),e.setIndex(new E(Dt,1)),e.setDrawRange(0,0),e},[]);(0,I.useEffect)(()=>()=>o.dispose(),[o]);let s=(0,I.useMemo)(()=>new p({uniforms:{color:{value:new y(1,1,1)},inkColor:{value:B(`#0a0820`)},candyColors:{value:[0,1,2,3].map(()=>new y(1,1,1))},style:{value:0},width:{value:3},pixelRatio:{value:1},resolution:{value:new c(1,1)},now:{value:0},duration:{value:1}},vertexShader:Ot,fragmentShader:kt,transparent:!0,depthWrite:!1,side:2}),[]);(0,I.useEffect)(()=>()=>s.dispose(),[s]),(0,I.useLayoutEffect)(()=>{s.uniforms.color.value.copy(B(r)),s.uniforms.style.value=Et[n.style]??0,s.uniforms.width.value=n.width??3,(n.colors??[r]).forEach((e,t)=>s.uniforms.candyColors.value[t].copy(B(e)));for(let e=(n.colors??[r]).length;e<4;e++)s.uniforms.candyColors.value[e].copy(B(r))},[s,n,r]);let l=M(e=>e.size),u=M(e=>e.viewport.dpr);return(0,I.useLayoutEffect)(()=>{s.uniforms.pixelRatio.value=u,s.uniforms.resolution.value.set(l.width*u,l.height*u)},[s,l,u]),N(()=>{let n=a.current,r=i.current.time;if(t<=0){n.count=0,n.drawn=-1,o.setDrawRange(0,0);return}s.uniforms.now.value=r,s.uniforms.duration.value=t;let{data:c}=n,l=e=>(n.start+e)%St*5,u=!1,d=n.count>0?l(n.count-1):-1,f=d<0||r-c[d+3]>=Math.max(Tt,t/St);if(!f&&n.count>=2&&r-c[d+3]>=Tt){let t=l(n.count-2),r=c[d]-c[t],i=c[d+1]-c[t+1],a=c[d+2]-c[t+2],o=e.x-c[d],s=e.y-c[d+1],u=e.z-c[d+2],p=Math.hypot(r,i,a)*Math.hypot(o,s,u);f=p>0&&r*o+i*s+a*u<p*Ct}if(f){d>=0&&(n.along+=Math.hypot(e.x-c[d],e.y-c[d+1],e.z-c[d+2])),n.count===St&&(n.start=(n.start+1)%St,n.count--);let t=l(n.count);c[t]=e.x,c[t+1]=e.y,c[t+2]=e.z,c[t+3]=r,c[t+4]=n.along,n.count++,u=!0}for(;n.count>0&&r-c[l(0)+3]>t;)n.start=(n.start+1)%St,n.count--,u=!0;let{position:p,previous:m,next:h,time:g,along:_}=o.attributes,v=n.count+1,y=l(n.count-1),b=n.count>0?n.along+Math.hypot(e.x-c[y],e.y-c[y+1],e.z-c[y+2]):n.along,x=(e,t,n,r,i,a)=>{for(let o=e*2;o<e*2+2;o++)p.array[o*3]=t,p.array[o*3+1]=n,p.array[o*3+2]=r,g.array[o]=i,_.array[o]=a},S=e=>{let t=Math.max(0,e-1)*6,n=Math.min(v-1,e+1)*6;for(let r=e*2;r<e*2+2;r++)for(let e=0;e<3;e++)m.array[r*3+e]=p.array[t+e],h.array[r*3+e]=p.array[n+e]},C=u||n.drawn!==v?0:Math.max(0,v-2);for(let e=C;e<n.count;e++){let t=l(e);x(e,c[t],c[t+1],c[t+2],c[t+3],c[t+4])}x(n.count,e.x,e.y,e.z,r,b);for(let e=C;e<v;e++)S(e);n.drawn=v;for(let e of[p,m,h,g,_])e.clearUpdateRanges(),e.addUpdateRange(C*2*e.itemSize,(v-C)*2*e.itemSize),e.needsUpdate=!0;o.setDrawRange(0,(v-1)*6)}),(0,V.jsx)(`mesh`,{geometry:o,material:s,frustumCulled:!1})}),jt=`./models/meteorite/meteorite.glb`,Mt=.02,Nt=new y,Pt=new P,Ft=new j,It=({index:e,position:t,velocity:n,angularVelocity:r,active:i,moving:a,onStarCollision:o,starMass:s,starSize:c,asteroidMass:l,asteroids:u,planets:d,onAsteroidCollision:f,onPlanetCollision:p,planetSizeFactor:m,asteroidGravityFactor:h,starPosition:g,planetGravityFactor:_,trail:v})=>{let y=(0,I.useRef)(),b=R(),x=Be(),{scene:S}=T(ae,jt),C=Ve(`asteroid`,(e,t)=>bt(e,{shared:t,scene:S})),w=(0,I.useMemo)(()=>(C??S).clone(),[C,S]),[E,D]=(0,I.useState)(i),O=(0,I.useMemo)(()=>{let t=[];for(let n of u)n!==void 0&&n.index<e&&t.push({index:n.index,framesUntilCheck:Math.random()*u.length});return t},[e]),k=(0,I.useMemo)(()=>{let e=[];for(let t of d)t!==void 0&&e.push({index:t.index,framesUntilCheck:Math.random()*d.length});return e},[e]),A=i=>{t.addScaledVector(n,i);let a=t.distanceTo(g);if(a>0){let v=L(s,t,g,Nt);if(n.addScaledVector(v,h*i),Ft.setFromEuler(Pt.set(r.x*i,r.y*i,r.z*i,`XYZ`)),y.current.quaternion.premultiply(Ft),a<=c)return o(e),D(!1),!1;for(let r of O){let a=u.find(e=>e.index===r.index);if(a!==void 0&&(r.framesUntilCheck=Math.max(0,r.framesUntilCheck-i),r.framesUntilCheck===0)){let i=t.distanceTo(a.position);if(i<.15){let n=t.clone().lerp(a.position,.5);return f(e,r.index,n),D(!1),!1}r.framesUntilCheck=Math.max(1,Math.round(i/(n.length()+a.velocity.length())))}}for(let r of k){let a=d.find(e=>e.index===r.index);if(a!==void 0&&(r.framesUntilCheck=Math.max(0,r.framesUntilCheck-i),r.framesUntilCheck===0)){let i=t.distanceTo(a.position);if(i<.1+a.size*m){let i=t.clone(),o=t.clone().sub(a.position),s=n.clone().sub(a.velocity),c=Math.cbrt(l/a.mass),u=s.clone().multiplyScalar(c/(1+c)),d=o.clone().cross(u);return p(e,r.index,i,u,d),D(!1),!1}let o=L(a.mass,t,a.position,Nt);n.add(o.multiplyScalar(h*_));let s=Math.max(1,Math.round(i/(n.length()+a.velocity.length())));o.length()*h*_>1e-4&&(s=Math.max(1,Math.round(s/_))),r.framesUntilCheck=s}}}return!0};return N(()=>{if(E){if(a){let{substeps:e,stepSize:t}=b.current;for(let n=0;n<e&&A(t);n++);}y.current.position.copy(t)}}),(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`primitive`,{object:w,ref:y,scale:Mt,receiveShadow:!0,castShadow:!0}),a&&v>0&&(0,V.jsx)(At,{target:t,duration:xt(v),look:x.trail,color:x.trail.color})]})};T.preload(ae,jt);var Lt=I.memo(It),Rt=({startPosition:e,starSize:t,starIntensity:n})=>{let r=(0,I.useRef)(),i=R(),a=Be(),o=(0,I.useRef)(t+.01),[s]=(0,I.useState)(new y(Math.random()*.001-5e-4,Math.random()*.001-5e-4,Math.random()*.001-5e-4)),c=n/5,l=(0,I.useMemo)(()=>a.sunParticles?.map(e=>new k(e)),[a]),u=e=>l?e.lerpColors(l[0],l[1],Math.random()).multiplyScalar(c):e.setRGB(c,Math.random()*c*.8+.2*c,.2*c),[d]=(0,I.useState)(()=>u(new k));return N(()=>{let n=r.current.position;n.addScaledVector(s,i.current.steps),n.distanceTo(e)>o.current&&(s.set(Math.random()*.001-5e-4,Math.random()*.001-5e-4,Math.random()*.001-5e-4),Math.random()>.9?o.current=t+.1:o.current=Math.random()*.01+t+.01,n.copy(e),u(r.current.material.color))}),(0,V.jsxs)(`mesh`,{position:e,ref:r,children:[(0,V.jsx)(`sphereGeometry`,{args:[.01,16,16]}),(0,V.jsx)(`meshBasicMaterial`,{color:d,toneMapped:!l})]})},zt=new o(1,96,96),Bt=Ge(.36,.62),Vt=Ge(.22,.4),Ht=qe(),Ut=new o(1.05,64,24,0,Math.PI*2,0,Math.PI/2),Wt=new S(1.06,1.06,.2,64,1,!0),Gt=new ee(1,1.95,96,1),Kt=new o(.11,16,12),qt=Ze(),Jt=new o(.13,24,16),Yt=new o(.05,12,8),Xt=Qe(),Zt=le.degToRad(80),Qt=new n(1,.055,8,64,Math.PI*2-Zt),$t=Ye(),en=new n(.8,.11,10,48),tn=new o(.2,20,14),nn=new i(1,1),rn=Xe(),an=new o(1,20,14),on=We(),sn=new i(1.35,1.35);function cn({material:e,outline:t}){return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`mesh`,{geometry:zt,material:e}),(0,V.jsx)(`mesh`,{geometry:zt,material:t})]})}function ln({look:e}){return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`mesh`,{geometry:qt,material:e.body}),(0,V.jsx)(`mesh`,{geometry:qt,material:e.outline})]})}function un({look:e}){return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(cn,{material:e.body,outline:e.outline}),[-1,1].map(t=>(0,V.jsxs)(`group`,{position:[t*.98,-.3,.05],children:[(0,V.jsx)(`mesh`,{geometry:Yt,material:e.gold}),(0,V.jsx)(`mesh`,{geometry:Jt,material:e.pearl,position:[t*.04,-.17,0]}),(0,V.jsx)(`mesh`,{geometry:Jt,material:e.outline,position:[t*.04,-.17,0]})]},t))]})}function dn({look:e}){return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(cn,{material:e.body,outline:e.outline}),(0,V.jsx)(`group`,{position:[0,.15,0],rotation:[0,-(Math.PI/2+Zt/2),0],children:(0,V.jsx)(`mesh`,{geometry:Qt,material:e.strap,rotation:[Math.PI/2,0,0]})}),(0,V.jsx)(`mesh`,{geometry:Xt,material:e.snorkel}),(0,V.jsx)(`mesh`,{geometry:Xt,material:e.outline})]})}function fn({side:e,look:t}){let[n,r]=(0,I.useMemo)(()=>{let t=new y(e*.6,.77,.2).normalize();return[t.clone().multiplyScalar(.8),new j().setFromUnitVectors(new y(0,1,0),t)]},[e]);return(0,V.jsxs)(`group`,{position:n,quaternion:r,children:[(0,V.jsx)(`mesh`,{geometry:Bt,material:t.ear}),(0,V.jsx)(`mesh`,{geometry:Bt,material:t.outline}),(0,V.jsx)(`mesh`,{geometry:Vt,material:t.innerEar,position:[0,.05,.1]})]})}function pn({look:e}){return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(cn,{material:e.head,outline:e.outline}),(0,V.jsx)(fn,{side:-1,look:e}),(0,V.jsx)(fn,{side:1,look:e})]})}function mn({look:e}){let t=(0,I.useRef)([]);return N(e=>{t.current.forEach((t,n)=>{t&&(t.rotation.z=.12*Math.sin(e.clock.elapsedTime*2.2+n*1.3))})}),(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(cn,{material:e.body,outline:e.outline}),Array.from({length:6},(n,r)=>(0,V.jsx)(`group`,{rotation:[0,Math.PI/6+r*Math.PI/3,0],children:(0,V.jsxs)(`group`,{ref:e=>{t.current[r]=e},children:[(0,V.jsx)(`mesh`,{geometry:Ht,material:e.tentacle}),(0,V.jsx)(`mesh`,{geometry:Ht,material:e.outline})]})},r))]})}function hn({look:e}){return(0,V.jsxs)(V.Fragment,{children:[Array.from({length:5},(t,n)=>{let r=n*Math.PI*2/5;return(0,V.jsx)(`mesh`,{geometry:Kt,material:e.petal,position:[Math.cos(r)*.11,Math.sin(r)*.11,0],scale:[1,1,.5]},n)}),(0,V.jsx)(`mesh`,{geometry:Kt,material:e.flowerHeart,position:[0,0,.04],scale:.6})]})}function gn({look:e}){let t=-.6;return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(cn,{material:e.body,outline:e.outline}),(0,V.jsxs)(`group`,{rotation:[-.7,0,-.15],children:[(0,V.jsxs)(`group`,{scale:[1,1.15,1],children:[(0,V.jsx)(`mesh`,{geometry:Ut,material:e.crown}),(0,V.jsx)(`mesh`,{geometry:Ut,material:e.outline})]}),(0,V.jsx)(`mesh`,{geometry:Wt,material:e.ribbon,position:[0,.12,0]}),(0,V.jsx)(`mesh`,{geometry:Gt,material:e.brim,rotation:[-Math.PI/2,0,0]}),(0,V.jsx)(`group`,{position:[1.07*Math.sin(t),.14,1.07*Math.cos(t)],rotation:[0,t,0],children:(0,V.jsx)(hn,{look:e})})]})]})}function _n({look:e}){return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(cn,{material:e.body,outline:e.outline}),(0,V.jsx)(`mesh`,{geometry:$t,material:e.cap}),(0,V.jsx)(`mesh`,{geometry:$t,material:e.outline}),(0,V.jsx)(`mesh`,{geometry:en,material:e.capBand,position:[0,.64,0],rotation:[Math.PI/2,0,0]}),(0,V.jsx)(`mesh`,{geometry:tn,material:e.capBand,position:Je}),(0,V.jsx)(`mesh`,{geometry:tn,material:e.outline,position:Je})]})}function vn({radius:e,look:t}){let n=(0,I.useRef)([]);return N(t=>{n.current.forEach((n,r)=>{if(!n)return;let i=(t.clock.elapsedTime*.35+r/3)%1;n.position.set(e*(.8+i*.6),e*(.8+i*1.1),0),n.scale.setScalar(e*(.25+i*.25)),n.lookAt(t.camera.position)})}),[0,1,2].map(e=>(0,V.jsx)(`mesh`,{ref:t=>{n.current[e]=t},geometry:nn,material:t.sleepZ},e))}function yn({look:e}){let t=(0,I.useRef)();return N(e=>{t.current.scale.setScalar(1+.05*Math.sin(e.clock.elapsedTime*3))}),(0,V.jsxs)(`group`,{ref:t,children:[(0,V.jsx)(cn,{material:e.body,outline:e.outline}),(0,V.jsx)(`mesh`,{geometry:rn,material:e.spikes}),(0,V.jsx)(`mesh`,{geometry:rn,material:e.outline}),[-1,1].map(t=>(0,V.jsxs)(`group`,{position:[t*1,-.15,.2],rotation:[0,0,t*.4],scale:[.12,.3,.22],children:[(0,V.jsx)(`mesh`,{geometry:an,material:e.fin}),(0,V.jsx)(`mesh`,{geometry:an,material:e.outline})]},t)),(0,V.jsxs)(`group`,{position:[0,0,-1.05],scale:[.08,.38,.3],children:[(0,V.jsx)(`mesh`,{geometry:an,material:e.fin}),(0,V.jsx)(`mesh`,{geometry:an,material:e.outline})]})]})}var bn={mercury:ln,venus:un,earth:dn,mars:mn,jupiter:pn,saturn:gn,uranus:_n,neptune:yn},xn={uranus:[0,0,le.degToRad(98)]},Sn=[0,0,0];function Cn({name:e,radius:t,look:n,spinRef:r}){let i=bn[e];return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`group`,{rotation:xn[e]??Sn,children:(0,V.jsx)(`group`,{ref:r,scale:t,children:(0,V.jsx)(i,{look:n})})}),e===`uranus`&&(0,V.jsx)(vn,{radius:t,look:n})]})}function wn({radius:e,look:t}){let n=(0,I.useRef)();return N(e=>{n.current.lookAt(e.camera.position),n.current.rotateZ(.15*Math.sin(e.clock.elapsedTime*.9))}),(0,V.jsxs)(`group`,{ref:n,scale:e,children:[(0,V.jsx)(`mesh`,{geometry:on,material:t.body}),(0,V.jsx)(`mesh`,{geometry:on,material:t.outline}),(0,V.jsx)(`mesh`,{geometry:sn,material:t.face,position:[0,.04,.4]})]})}var Tn=({size:e,starIntensity:t})=>{let n=(0,I.useRef)(),i=R(),a=T(ue,`./img/2k_sun.jpg`),o=Ve(`sun`,(e,t)=>yt(e,{shared:t,map:a})),s=(0,I.useMemo)(()=>{let e=new r({map:a});return e.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
	diffuseColor.rgb = min( diffuseColor.rgb, vec3( 1.0 ) );`)},e},[a]);return(0,I.useLayoutEffect)(()=>{s.color.setScalar(t/5)},[s,t]),N(()=>{n.current&&(n.current.rotation.y+=.001*i.current.steps)}),o?.character?(0,V.jsx)(wn,{radius:e,look:o.character}):(0,V.jsxs)(`group`,{children:[(0,V.jsxs)(`mesh`,{ref:n,position:[0,0,0],material:o?o.material:s,children:[(0,V.jsx)(`sphereGeometry`,{args:[e,64,64]}),o?.outline&&(0,V.jsx)(`mesh`,{material:o.outline,children:(0,V.jsx)(`sphereGeometry`,{args:[e,64,64]})})]}),o?.halo&&(0,V.jsx)(oe,{children:(0,V.jsx)(`mesh`,{material:o.halo,children:(0,V.jsx)(`planeGeometry`,{args:[e*o.haloSize,e*o.haloSize]})})})]})},En=({position:e,radius:t})=>{let n=(0,I.useRef)(),r=(0,I.useMemo)(()=>Math.random()*.4+.2,[]),i=(0,I.useMemo)(()=>Math.random()*.1+.1,[]),a=(0,I.useMemo)(()=>1,[]),o=(0,I.useMemo)(()=>Math.random()*20+5,[]);return N(({clock:e})=>{let t=e.getElapsedTime()%o/o;n.current.material.emissiveIntensity=i+(a-i)*Math.sin(Math.PI*t)}),(0,V.jsxs)(`mesh`,{position:e,ref:n,children:[(0,V.jsx)(`sphereGeometry`,{args:[t,16,16]}),(0,V.jsx)(`meshStandardMaterial`,{color:`white`,emissive:`#ffffff`,emissiveIntensity:r})]})},Dn=new y(0,1,0),On=new y,kn=I.memo(({aim:e,referenceDistance:t})=>{let n=(0,I.useRef)(),r=Be();return N(({camera:r})=>{let i=n.current,{active:a,origin:o,velocity:s}=e.current,c=s.length()*100;if(i.visible=a&&c>0,!i.visible)return;On.copy(s).normalize(),i.quaternion.setFromUnitVectors(Dn,On);let l=r.position.distanceTo(o)/t;i.scale.set(l,c,l),i.position.copy(o).addScaledVector(On,c*5/8)}),(0,V.jsxs)(`mesh`,{ref:n,visible:!1,renderOrder:1,children:[(0,V.jsx)(`coneGeometry`,{args:[.01,1,8]}),(0,V.jsx)(`meshBasicMaterial`,{color:r.arrow??`red`,toneMapped:!r.arrow,depthTest:!1})]})}),An=900,jn=6,Mn=Math.ceil(An/jn)+1,Nn=new y,Pn=({aim:e,getLaunchVelocity:t,planets:n,starPosition:r,starMass:i,starSize:a,asteroidGravityFactor:o,planetGravityFactor:s,planetSizeFactor:c,color:l})=>{let u=(0,I.useMemo)(()=>{let e=new D;return e.setAttribute(`position`,new E(new Float32Array(453),3)),e.setAttribute(`dotIndex`,new E(Float32Array.from({length:Mn},(e,t)=>t),1)),e.setDrawRange(0,0),e},[]),d=(0,I.useMemo)(()=>new p({uniforms:{color:{value:new y(1,0,0)},pixelRatio:{value:1},hitDot:{value:-1}},vertexShader:`
      uniform float pixelRatio;
      uniform float hitDot;
      attribute float dotIndex;
      varying float vAlpha;
      void main() {
        bool hit = abs(dotIndex - hitDot) < 0.5;
        vAlpha = hit ? 1.0 : 1.0 - 0.85 * dotIndex / ${Mn.toFixed(1)};
        gl_PointSize = (hit ? 8.0 : 3.5) * pixelRatio;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform vec3 color;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(color, vAlpha);
      }
    `,transparent:!0,depthWrite:!1,depthTest:!1}),[]);(0,I.useLayoutEffect)(()=>{d.uniforms.color.value.copy(B(l))},[d,l]);let f=M(e=>e.viewport.dpr);return(0,I.useLayoutEffect)(()=>{d.uniforms.pixelRatio.value=f},[d,f]),N(()=>{let{active:l,origin:f,velocity:p}=e.current;if(!l||p.lengthSq()===0){u.setDrawRange(0,0);return}let m=u.attributes.position,{count:h,hit:g}=Se({origin:f,velocity:t(e.current,Nn),planets:n,starPosition:r,starMass:i,starSize:a,asteroidGravityFactor:o,planetGravityFactor:s,planetSizeFactor:c,maxSteps:An,every:jn,points:m.array});m.needsUpdate=!0,u.setDrawRange(0,h),d.uniforms.hitDot.value=g?h-1:-1}),(0,V.jsx)(`points`,{geometry:u,material:d,frustumCulled:!1,renderOrder:1})},Fn=new y,In=I.memo(({index:e,name:t,size:n,position:r,velocity:i,rotation:a,onStarCollision:o,planetTexture:s,starMass:c,starSize:l,mass:u,planetSizeFactor:d,starPull:f,starPosition:p,planets:m,onPlanetCollision:h,trail:g})=>{let _=Be(),v=(0,I.useRef)(),y=(0,I.useRef)(),b=T(ue,s),x=R(),S=Ve(`planet:${t}`,(e,n)=>vt(e,{shared:n,map:b,name:t})),C=(0,I.useMemo)(()=>{let t=[];for(let n of m)n!==void 0&&n.index!==e&&t.push({index:n.index,framesUntilCheck:Math.random()*m.length});return t},[e]),w=t=>{let s=r.distanceTo(p);if(s>0){let g=L(c,r,p,Fn);i.addScaledVector(g,t*f);for(let a of C){let o=m.find(e=>e.index===a.index);if(o!==void 0&&(a.framesUntilCheck=Math.max(0,a.framesUntilCheck-t),a.framesUntilCheck===0)){let t=r.distanceTo(o.position),s=Math.max(1,Math.round(t/(i.length()+o.velocity.length())));if(t<(n+o.size)*d){let a=i.clone().sub(o.velocity),c=o.position.clone().sub(r).normalize(),l=2*a.dot(c)/(1/u+1/o.mass),f=c.multiplyScalar(l),p=f.clone().divideScalar(u),m=f.clone().divideScalar(-o.mass);h(e,p,o.index,m),s=Math.max(1,Math.round((t+(n+o.size)*d)/(i.length()+o.velocity.length())))}else{let e=L(o.mass,r,o.position,Fn);i.add(e)}a.framesUntilCheck=s}}r.addScaledVector(i,t),y.current.rotation.x+=a.x*t,y.current.rotation.y+=a.y*t,y.current.rotation.z+=a.z*t,s<=Math.abs(l-n)&&o(e)}};N(()=>{let{substeps:e,stepSize:t}=x.current;for(let n=0;n<e;n++)w(t);v.current.position.copy(r)});let E=n*d;return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`group`,{ref:v,children:S?.character?(0,V.jsx)(Cn,{name:t,radius:E,look:S.character,spinRef:y}):(0,V.jsx)(`group`,{ref:y,children:S?(0,V.jsxs)(`mesh`,{material:S.material,children:[(0,V.jsx)(`sphereGeometry`,{args:[E,64,64]}),S.outline&&(0,V.jsx)(`mesh`,{material:S.outline,children:(0,V.jsx)(`sphereGeometry`,{args:[E,64,64]})})]},`stylized`):(0,V.jsxs)(`mesh`,{receiveShadow:!0,castShadow:!0,children:[(0,V.jsx)(`sphereGeometry`,{args:[E,64,64]}),(0,V.jsx)(`meshStandardMaterial`,{map:b})]},`realistic`)})}),g>0&&(0,V.jsx)(At,{target:r,duration:xt(g),look:_.trail,color:gt[t]??`#ffffff`})]})}),Ln={mercury:{distance:.387,year:88,speed:47.4,mass:.055,eccentricity:.206},venus:{distance:.723,year:224.7,speed:35,mass:.815,eccentricity:.007},earth:{distance:1,year:365.25,speed:29.8,mass:1,eccentricity:.017},mars:{distance:1.524,year:687,speed:24.1,mass:.107,eccentricity:.093},jupiter:{distance:5.2,year:4333,speed:13.1,mass:317.8,eccentricity:.049},saturn:{distance:9.58,year:10759,speed:9.7,mass:95.2,eccentricity:.057},uranus:{distance:19.2,year:30687,speed:6.8,mass:14.5,eccentricity:.046},neptune:{distance:30.05,year:60190,speed:5.4,mass:17.1,eccentricity:.01}},Rn=250,zn=3e3,G=e=>String(Number(e.toPrecision(3))),Bn=e=>e<1e3?`${G(e)} days`:`${G(e/365.25)} years`,Vn=e=>{if(e===null)return`never`;let t=e/60;return t<100?`${Math.round(t)} s`:t<6e3?`${Math.round(t/60)} min`:`${G(t/3600)} h`},Hn=e=>e<.05?`round`:e<.2?`slightly oval`:e<.5?`oval`:e<1?`very stretched`:`open`;function Un(e,t,n,r,i){let a=e.position.dot(e.velocity)<0;return n-e.lastImpact<zn?`Having a bad day`:t.closest<r&&(a||!t.escaping)?`Working on its tan`:t.escaping?`Going on a long vacation`:t.retrograde?`Driving the wrong way`:e.impacts>=5?`Seriously considering therapy`:t.eccentricity>.5?`Taking the scenic route`:t.semiMajorAxis>1.5*e.start.distance?`Moved to the suburbs`:t.semiMajorAxis<.67*e.start.distance?`Feeling the heat`:e.impacts>=2?`Starting to take it personally`:e.impacts===1?`A bit shaken, nothing serious`:i===333e3?`Minding its own business`:`Coping with the star's mood swings`}var Wn=new y;function Gn({planet:e,starMass:t,starSize:n}){let r=(0,I.useRef)(),i=M(e=>e.camera),a=R(),[,o]=(0,I.useState)(0),s=(0,I.useRef)(0);N((t,n)=>{r.current.position.copy(e.position),s.current+=n*1e3,s.current>=Rn&&(s.current=0,o(e=>e+1))});let c=Ln[e.name],l=ye(e.position,e.velocity,t*e.starPull),u=e.start,d=2*Math.PI*u.distance/u.speed,f=Wn.copy(e.position).project(i).x>.2?`left`:`right`,p=[[`Distance`,`${G(c.distance)} AU`,`${G(u.distance)} → ${G(l.distance)}`],[`Year`,Bn(c.year),`${Vn(d)} → ${Vn(l.period)}`],[`Speed`,`${G(c.speed)} km/s`,`${G(u.speed*60)} → ${G(l.speed*60)}`],[`Orbit`,Hn(c.eccentricity),`round → ${Hn(l.eccentricity)}`],[`Mass`,`${G(c.mass)} × Earth`,G(e.mass)],[`Impacts`,``,String(e.impacts)]];return(0,V.jsx)(`group`,{ref:r,children:(0,V.jsx)(ne,{zIndexRange:[0,0],style:{pointerEvents:`none`},children:(0,V.jsxs)(`div`,{className:`planet-info ${f}`,children:[(0,V.jsxs)(`div`,{className:`planet-info-name`,children:[(0,V.jsx)(`span`,{className:`planet-info-dot`,style:{backgroundColor:gt[e.name]}}),e.name]}),(0,V.jsx)(`div`,{className:`planet-info-status`,children:Un(e,l,a.current.time,n,t)}),(0,V.jsxs)(`table`,{children:[(0,V.jsx)(`thead`,{children:(0,V.jsxs)(`tr`,{children:[(0,V.jsx)(`th`,{}),(0,V.jsx)(`th`,{children:`Real`}),(0,V.jsx)(`th`,{children:`Game`})]})}),(0,V.jsx)(`tbody`,{children:p.map(([e,t,n])=>(0,V.jsxs)(`tr`,{children:[(0,V.jsx)(`th`,{children:e}),(0,V.jsx)(`td`,{children:t}),(0,V.jsx)(`td`,{children:n})]},e))})]}),(0,V.jsx)(`div`,{className:`planet-info-note`,children:`Game: at start → now, in scene units and seconds`})]})})})}var Kn=[{id:`yeet`,icon:`☄️`,name:`Yeet`,text:`Your first rock is out there. No take-backs.`},{id:`sun-snack`,icon:`🔥`,name:`Sun Snack`,text:`The star ate your asteroid. It says thanks.`},{id:`fender-bender`,icon:`💥`,name:`Fender Bender`,text:`Two rocks, one fate. Swap insurance details.`},{id:`bullseye`,icon:`🎯`,name:`Bullseye`,text:`Planets: 0. You: 1.`},{id:`houston`,icon:`🌍`,name:`Houston, We Have a Problem`,text:`You hit the Earth. Somewhere, an insurer is crying.`},{id:`nosy`,icon:`🔍`,name:`Nosy Neighbor`,text:`Reading a planet's private files. Classy.`},{id:`music`,icon:`🎵`,name:`Music of the Spheres`,text:`The planets were humming all along.`},{id:`fashion`,icon:`👗`,name:`Fashion Victim`,text:`Seven outfits. Same old Solar System.`},{id:`birds-eye`,icon:`🦅`,name:`Bird's-Eye View`,text:`Orbits look so much tidier from up here.`},{id:`reroll`,icon:`🎲`,name:`Reroll`,text:`If at first you don't succeed, reroll the universe.`},{id:`fast-forward`,icon:`⌛`,name:`Fast Forward`,text:`Years fly by. Literally.`},{id:`sunburn`,icon:`☀️`,name:`Sunburn`,text:`A planet got too close to the star. They never listen.`},{id:`bon-voyage`,icon:`🧳`,name:`Bon Voyage`,text:`A planet packed its bags and left. Pluto sends its regards.`},{id:`ghost`,icon:`👻`,name:`Now You See Me`,text:`Where did all the buttons go? Oh, H.`},{id:`bumper-cars`,icon:`🎳`,name:`Bumper Cars`,text:`Two planets collided. Premiums just went up.`},{id:`wrong-way`,icon:`🌀`,name:`Wrong Way`,text:`A planet turns the wrong way round. It's not lost, it's creative.`},{id:`completionist`,icon:`🏆`,name:`Completionist`,text:`Every planet has been hit at least once. Eight bruises.`},{id:`empty-nest`,icon:`🏚️`,name:`Empty Nest`,text:`No planet left. Peace and quiet at last.`},{id:`sorry-newton`,icon:`🙃`,name:`Sorry, Newton`,text:`An asteroid that falls upwards. Gravity is more of a suggestion.`},{id:`zen`,icon:`🧘`,name:`Zen`,text:`Ten minutes of the game without throwing a thing. Who are you?`}],qn=`gravity-star-achievements`;function Jn(e){try{return new Set(JSON.parse(window.localStorage.getItem(e))??[])}catch{return new Set}}function Yn(e,t){try{window.localStorage.setItem(e,JSON.stringify([...t]))}catch{}}var Xn=Jn(qn),Zn=new Set,Qn=()=>new Set(Xn);function K(e){if(Xn.has(e))return;let t=Kn.find(t=>t.id===e);if(t){Xn.add(e),Yn(qn,Xn);for(let e of Zn)e(t)}}function $n(e){return Zn.add(e),()=>Zn.delete(e)}var er=new Map;function tr(e,t,n,r){let i=`gravity-star-${e}`;er.has(i)||er.set(i,Jn(i));let a=er.get(i);a.has(t)||(a.add(t),Yn(i,a)),a.size>=n&&K(r)}var nr=500,rr=30,ir=6e5;function ar({planets:e,starMass:t,lastLaunch:n}){let r=R(),i=(0,I.useRef)(0);return N((a,o)=>{if(i.current+=o*1e3,i.current<nr)return;i.current=0,r.current.time-n.current>=ir&&K(`zen`);let s=0;for(let n of e){let e=ye(n.position,n.velocity,t*n.starPull);e.escaping&&e.distance>rr?(K(`bon-voyage`),s++):e.retrograde&&K(`wrong-way`)}s===e.length&&K(`empty-nest`)}),null}var or=({position:e,velocity:t,timestamp:n})=>{let i=(0,I.useRef)(),a=R(),s=Be(),c=(0,I.useMemo)(()=>{let e=new k(1973790),t=new k(5784882),n=Math.random()*(t.r-e.r)+e.r,r=Math.random()*(t.g-e.g)+e.g,i=Math.random()*(t.b-e.b)+e.b;return new k(n,r,i)},[]),l=(0,I.useMemo)(()=>{if(s.debris){let[e,t]=s.debris;return new r({color:new k(e).lerp(new k(t),Math.random()),transparent:!0,opacity:1,toneMapped:!1})}return new ce({color:c,transparent:!0,opacity:1})},[c,s]),u=(0,I.useMemo)(()=>new o(.01,3,3),[]);return N(()=>{t&&i.current.position.addScaledVector(t,a.current.steps);let e=a.current.time-n,r=2e4;e<r?l.opacity=1-e/r:l.opacity=0}),(0,V.jsx)(`mesh`,{ref:i,position:e,material:l,children:(0,V.jsx)(`primitive`,{object:u})})},sr=new Map;function cr(e,t,n){if(!sr.has(e)){let r=document.createElement(`canvas`);r.width=t,r.height=t,n(r.getContext(`2d`),t);let i=new ie(r);i.colorSpace=f,sr.set(e,i)}return sr.get(e)}var lr=`#0a0820`;function ur(e){return cr(`word:${e}`,256,(t,n)=>{let r=n/2;t.beginPath();for(let e=0;e<28;e++){let i=e/28*Math.PI*2,a=(e%2==0?.47-.05*(e*5%3)/2:.33)*n,o=r+Math.cos(i)*a,s=r+Math.sin(i)*a*.8;e===0?t.moveTo(o,s):t.lineTo(o,s)}t.closePath(),t.fillStyle=`#ffe14d`,t.fill(),t.lineWidth=6,t.strokeStyle=lr,t.stroke();let i=64;t.font=`bold ${i}px Impact, 'Arial Black', sans-serif`;let a=t.measureText(e).width;a>n*.62&&(i*=n*.62/a),t.font=`bold ${i}px Impact, 'Arial Black', sans-serif`,t.textAlign=`center`,t.textBaseline=`middle`,t.lineJoin=`round`,t.lineWidth=8,t.strokeStyle=lr,t.strokeText(e,r,r+2),t.fillStyle=`#ff4b3e`,t.fillText(e,r,r+2)})}function dr(){return cr(`blot`,128,(e,t)=>{let n=5,r=()=>(n=n*16807%2147483647,(n-1)/2147483646);for(let n=0;n<9;n++){let n=t*(.5+(r()-.5)*.35),i=t*(.5+(r()-.5)*.35),a=t*(.18+r()*.14),o=e.createRadialGradient(n,i,0,n,i,a);o.addColorStop(0,`rgba(255, 255, 255, 0.45)`),o.addColorStop(.7,`rgba(255, 255, 255, 0.3)`),o.addColorStop(1,`rgba(255, 255, 255, 0)`),e.fillStyle=o,e.beginPath(),e.arc(n,i,a,0,Math.PI*2),e.fill()}})}function fr(){return cr(`star`,64,(e,t)=>{e.beginPath();for(let n=0;n<10;n++){let r=-Math.PI/2+n*Math.PI/5,i=t*(n%2==0?.42:.2);e.lineTo(t/2+Math.cos(r)*i,t/2+Math.sin(r)*i)}e.closePath(),e.lineJoin=`round`,e.lineWidth=7,e.strokeStyle=`#2a0f3a`,e.stroke(),e.lineWidth=3,e.strokeStyle=`#ffe066`,e.stroke(),e.fillStyle=`#ffe066`,e.fill()})}function pr(){return cr(`heart`,64,(e,t)=>{let n=t/64;e.beginPath(),e.moveTo(32*n,52*n),e.bezierCurveTo(8*n,36*n,8*n,14*n,22*n,13*n),e.bezierCurveTo(28*n,12.5*n,31*n,17*n,32*n,21*n),e.bezierCurveTo(33*n,17*n,36*n,12.5*n,42*n,13*n),e.bezierCurveTo(56*n,14*n,56*n,36*n,32*n,52*n),e.closePath(),e.fillStyle=`#ff7ad9`,e.fill(),e.lineWidth=3.5*n,e.strokeStyle=`#2a0f3a`,e.stroke(),e.fillStyle=`#ffffff`,e.fillRect(18*n,19*n,5*n,4*n)})}function mr(){return cr(`impact`,256,(e,t)=>{let n=t/2,r=9,i=()=>(r=r*16807%2147483647,(r-1)/2147483646);e.fillStyle=`#ffffff`;for(let r=0;r<36;r++){let a=r/36*Math.PI*2+i()*.1,o=t*(.3+i()*.2),s=.025+i()*.02;e.beginPath(),e.moveTo(n+Math.cos(a-s)*t*.08,n+Math.sin(a-s)*t*.08),e.lineTo(n+Math.cos(a)*o,n+Math.sin(a)*o),e.lineTo(n+Math.cos(a+s)*t*.08,n+Math.sin(a+s)*t*.08),e.closePath(),e.fill()}let a=e.createRadialGradient(n,n,0,n,n,t*.16);a.addColorStop(0,`rgba(255, 255, 255, 1)`),a.addColorStop(.6,`rgba(255, 255, 255, 0.9)`),a.addColorStop(1,`rgba(255, 255, 255, 0)`),e.fillStyle=a,e.fillRect(0,0,t,t)})}var hr=e=>e[Math.floor(Math.random()*e.length)],gr=()=>new y().randomDirection(),_r={cel:()=>[{map:ur(hr([`BOOM!`,`KRAK!`,`POW!`,`BLAM!`,`KABOOM!`])),scale:.3,rotation:(Math.random()-.5)*.5,life:1700,pop:!0,overlay:!0}],pastel:()=>Array.from({length:4},()=>({map:dr(),color:hr([`#f6d38c`,`#f2a07b`,`#c9d2f0`,`#f4efe6`,`#e8735a`]),scale:.1+Math.random()*.08,grow:[.4,1.3],rotation:Math.random()*Math.PI*2,offset:gr().multiplyScalar(.04),life:2600,opacity:.6})),watercolor:()=>[...Array.from({length:3},()=>({map:dr(),color:hr([`#e07a5f`,`#4a6fa5`,`#f2cc8f`,`#81b29a`]),scale:.1+Math.random()*.08,grow:[.5,1.2],rotation:Math.random()*Math.PI*2,offset:gr().multiplyScalar(.03),life:2800,opacity:.7})),...Array.from({length:8},()=>({map:dr(),color:hr([`#e07a5f`,`#4a6fa5`,`#3d405b`]),scale:.012+Math.random()*.012,rotation:Math.random()*Math.PI*2,drift:gr().multiplyScalar(.004+Math.random()*.004),life:2200,opacity:.85}))],arcade:()=>Array.from({length:16},()=>({color:hr([`#ffff33`,`#ff6600`,`#ffffff`,`#ff3333`]),scale:.014,drift:gr().multiplyScalar(.006+Math.random()*.008),life:600+Math.random()*300,blink:!0})),neko:()=>Array.from({length:10},(e,t)=>({map:t%2==0?fr():pr(),scale:.05+Math.random()*.025,drift:gr().multiplyScalar(.004+Math.random()*.005),spin:(Math.random()-.5)*.12,life:1200+Math.random()*400,pop:!0})),anime:()=>[{map:mr(),color:`#fff1c4`,scale:.32,grow:[.5,1.4],rotation:Math.random()*Math.PI,life:450,overlay:!0}]},vr=60/1e3;function yr({style:e,position:t,timestamp:n}){let r=R(),i=(0,I.useMemo)(()=>(_r[e]?.()??[]).map(e=>({...e,material:new g({map:e.map??null,color:e.color??`#ffffff`,transparent:!0,depthWrite:!1,depthTest:!e.overlay,sizeAttenuation:!1,rotation:e.rotation??0,toneMapped:!1})})),[e]);(0,I.useEffect)(()=>()=>i.forEach(e=>e.material.dispose()),[i]);let a=(0,I.useRef)([]);return N(()=>{let e=r.current.time-n;i.forEach((n,r)=>{let i=a.current[r];if(!i)return;let o=e/n.life;if(i.visible=o<1&&!(n.blink&&o>.5&&Math.floor(e/70)%2==1),!i.visible)return;let s=e*vr;i.position.copy(t),n.offset&&i.position.add(n.offset),n.drift&&i.position.addScaledVector(n.drift,s);let c=n.scale;n.pop&&(c*=o<.08?o/.08*1.2:o<.16?1.2-(o-.08)/.08*.2:1),n.grow&&(c*=n.grow[0]+(n.grow[1]-n.grow[0])*(1-(1-o)**2)),i.scale.set(c,c,1),n.material.rotation=(n.rotation??0)+(n.spin??0)*s,n.material.opacity=(n.opacity??1)*Math.min(1,(1-o)/.35)})}),i.map((e,t)=>(0,V.jsx)(`sprite`,{ref:e=>{a.current[t]=e},material:e.material,renderOrder:e.overlay?2:0,visible:!1},t))}var br=({index:e,lights:t,position:n,timestamp:r,terminateExplosion:i})=>{let a=(0,I.useRef)(),o=R(),s=Be(),c=2e4,l=3*Math.PI,[u,d]=(0,I.useState)(!0),[f,p]=(0,I.useState)([]),m=(0,I.useRef)(0),h=(0,I.useRef)(null);return(0,I.useLayoutEffect)(()=>{let i=t.find(e=>e.owner===null)??t.reduce((e,t)=>t.since<e.since?t:e);return i.owner=e,i.since=r,i.light.position.copy(n),i.light.color.set(16746496),i.light.intensity=l,h.current=i,()=>{i.owner===e&&(i.owner=null,i.light.intensity=0)}},[t,e,n,r]),N(()=>{if(u){let t=o.current.time-r;if(t>c)i(e),d(!1);else{let i=Math.min(50,Math.floor(t/1e3*60))-m.current;if(i>0){let e=[];for(let t=0;t<i;t++){let i=new y((Math.random()-.5)*.005,(Math.random()-.5)*.005,(Math.random()-.5)*.005);e.push((0,V.jsx)(or,{position:n.clone(),velocity:i,timestamp:r},`particle_${m.current+t}`))}m.current+=i,p(t=>[...t,...e])}if(h.current&&h.current.owner===e){let e=h.current.light,n=l*(1-t/(c/4));e.intensity=Math.max(0,Math.min(l,n)),e.color.setRGB(1,Math.sin(t*.002)/4+.25,.25)}}}}),(0,V.jsxs)(`group`,{ref:a,children:[f,s.style&&(0,V.jsx)(yr,{style:s.style,position:n,timestamp:r})]})},xr=`gravity-star-volume`,Sr=.7,Cr={mercury:783.99,venus:587.33,earth:523.25,mars:440,jupiter:293.66,saturn:220,uranus:196,neptune:146.83},q=null,J=null,wr=!1,Tr=jr(),Er=`spheres`,Dr=!1,Or=new Map,kr=new Map,Ar=new WeakMap;function jr(){try{let e=parseFloat(window.localStorage.getItem(xr));return Number.isFinite(e)&&e>0?e:Sr}catch{return Sr}}var Mr=(e,t,n)=>Math.min(n,Math.max(t,e)),Nr={right:{x:1,y:0,z:0},front:{x:0,y:0,z:1}},Pr=(e,t)=>e.x*t.x+e.y*t.y+e.z*t.z;function Fr(e){let t=e.matrixWorld.elements;Nr.right={x:t[0],y:t[1],z:t[2]};let n=e.position.length()||1;Nr.front={x:e.position.x/n,y:e.position.y/n,z:e.position.z/n}}var Ir=e=>Mr(Pr(e,Nr.right)/10,-1,1);function Y(e,t,{type:n=`sine`,frequency:r,to:i,start:a,duration:o,attack:s=.005,gain:c=.3,pan:l=0}){let u=e.createOscillator();u.type=n,u.frequency.setValueAtTime(r,a),i&&u.frequency.exponentialRampToValueAtTime(i,a+o);let d=e.createGain();d.gain.setValueAtTime(1e-4,a),d.gain.exponentialRampToValueAtTime(c,a+s),d.gain.exponentialRampToValueAtTime(1e-4,a+o);let f=e.createStereoPanner();f.pan.value=l,u.connect(d).connect(f).connect(t),u.start(a),u.stop(a+o+.05)}function Lr(e){if(!Ar.has(e)){let t=e.createBuffer(1,e.sampleRate,e.sampleRate),n=t.getChannelData(0);for(let e=0;e<n.length;e++)n[e]=Math.random()*2-1;Ar.set(e,t)}return Ar.get(e)}function X(e,t,{filter:n=`lowpass`,frequency:r=1e3,to:i,q:a=1,start:o,duration:s,attack:c=.005,gain:l=.3,pan:u=0}){let d=e.createBufferSource();d.buffer=Lr(e),d.loop=!0;let f=e.createBiquadFilter();f.type=n,f.Q.value=a,f.frequency.setValueAtTime(r,o),i&&f.frequency.exponentialRampToValueAtTime(i,o+s);let p=e.createGain();p.gain.setValueAtTime(1e-4,o),p.gain.exponentialRampToValueAtTime(l,o+c),p.gain.exponentialRampToValueAtTime(1e-4,o+s);let m=e.createStereoPanner();m.pan.value=u,d.connect(f).connect(p).connect(m).connect(t),d.start(o),d.stop(o+s+.05)}function Rr(e,t,{frequency:n,start:r,duration:i,gain:a,pan:o=0}){[[1,1],[2.76,.45],[5.4,.2],[8.93,.1]].forEach(([s,c],l)=>{Y(e,t,{frequency:n*s,start:r,duration:i/(1+l),attack:.003,gain:a*c,pan:o})})}function zr(e,t,{frequency:n,start:r,duration:i=.9,gain:a,pan:o=0}){Y(e,t,{frequency:n,start:r,duration:i,attack:.004,gain:a,pan:o}),Y(e,t,{frequency:n*4,start:r,duration:i*.18,attack:.002,gain:a*.35,pan:o})}function Br(e,t,{frequencies:n,step:r,type:i,start:a,gain:o,pan:s=0}){n.forEach((n,c)=>Y(e,t,{type:i,frequency:n,start:a+c*r,duration:r*1.6,gain:o,pan:s}))}var Vr={spheres:{launch:(e,t,n,{strength:r,pan:i})=>Y(e,t,{frequency:220,to:330+220*r,start:n,duration:.6,attack:.1,gain:.07,pan:i}),impact:(e,t,n,{strength:r,pan:i,note:a=220})=>{Y(e,t,{frequency:a/2,start:n,duration:2.8,attack:.03,gain:.3*r,pan:i}),X(e,t,{filter:`lowpass`,frequency:150,start:n,duration:1.6,attack:.03,gain:.35*r,pan:i})},crash:(e,t,n,{pan:r})=>{Y(e,t,{frequency:1318.5,start:n,duration:.25,gain:.05,pan:r}),Y(e,t,{frequency:1760,start:n+.08,duration:.25,gain:.04,pan:r})},star:(e,t,n,{strength:r,pan:i})=>{Rr(e,t,{frequency:1568,start:n,duration:2.5,gain:.05+.08*r,pan:i}),Y(e,t,{frequency:1568,to:196,start:n,duration:2.2,attack:.05,gain:.03,pan:i})},pass:(e,t,n,{note:r,pan:i,gain:a})=>Rr(e,t,{frequency:r,start:n,duration:3.5,gain:.1*a,pan:i}),achievement:(e,t,n)=>[523.25,659.25,783.99,1046.5].forEach((r,i)=>Rr(e,t,{frequency:r,start:n+i*.12,duration:1.6,gain:.06}))},comic:{launch:(e,t,n,{strength:r,pan:i})=>X(e,t,{filter:`bandpass`,frequency:400,to:2200,q:2,start:n,duration:.35,attack:.05,gain:.25+.2*r,pan:i}),impact:(e,t,n,{strength:r,pan:i})=>{Y(e,t,{frequency:150,to:40,start:n,duration:.6,gain:.6*r,pan:i}),X(e,t,{filter:`lowpass`,frequency:1200,to:150,start:n,duration:.5,gain:.45*r,pan:i})},crash:(e,t,n,{pan:r})=>{X(e,t,{filter:`highpass`,frequency:1500,start:n,duration:.15,gain:.35,pan:r}),Y(e,t,{type:`square`,frequency:300,to:120,start:n,duration:.1,gain:.12,pan:r})},star:(e,t,n,{strength:r,pan:i})=>{X(e,t,{filter:`highpass`,frequency:2500,start:n,duration:1.2,attack:.02,gain:.2+.15*r,pan:i}),Y(e,t,{frequency:1500,to:200,start:n,duration:.8,gain:.08,pan:i})},achievement:(e,t,n)=>{[392,523.25,659.25].forEach(r=>Y(e,t,{type:`triangle`,frequency:r,start:n,duration:.14,gain:.08})),[523.25,659.25,783.99,1046.5].forEach(r=>Y(e,t,{type:`triangle`,frequency:r,start:n+.16,duration:.8,attack:.01,gain:.07}))}},chip:{launch:(e,t,n,{pan:r})=>Br(e,t,{frequencies:[523.25,659.25,783.99,1046.5],step:.04,type:`square`,start:n,gain:.08,pan:r}),impact:(e,t,n,{strength:r,pan:i})=>{X(e,t,{filter:`lowpass`,frequency:4e3,to:200,q:.5,start:n,duration:.55,gain:.4*r,pan:i}),Y(e,t,{type:`square`,frequency:110,to:55,start:n,duration:.3,gain:.12*r,pan:i})},crash:(e,t,n,{pan:r})=>Br(e,t,{frequencies:[880,659.25],step:.05,type:`square`,start:n,gain:.08,pan:r}),star:(e,t,n,{pan:r})=>Y(e,t,{type:`square`,frequency:1200,to:100,start:n,duration:.6,gain:.08,pan:r}),achievement:(e,t,n)=>{Br(e,t,{frequencies:[783.99,987.77,1174.66],step:.07,type:`square`,start:n,gain:.06}),Y(e,t,{type:`square`,frequency:1567.98,start:n+.21,duration:.45,gain:.06})}},neko:{launch:(e,t,n,{pan:r})=>Y(e,t,{type:`square`,frequency:1800,to:600,start:n,duration:.15,gain:.07,pan:r}),impact:(e,t,n,{strength:r,pan:i})=>{Y(e,t,{frequency:180,to:520,start:n,duration:.18,gain:.35*r,pan:i}),Y(e,t,{frequency:520,to:260,start:n+.18,duration:.35,gain:.3*r,pan:i}),X(e,t,{filter:`lowpass`,frequency:2500,to:300,start:n,duration:.3,gain:.2*r,pan:i})},crash:(e,t,n,{pan:r})=>Y(e,t,{frequency:900,to:1700,start:n,duration:.09,gain:.12,pan:r}),star:(e,t,n,{pan:r})=>{let i=e.createGain(),a=e.createBiquadFilter();a.type=`bandpass`,a.frequency.setValueAtTime(1400,n),a.frequency.exponentialRampToValueAtTime(700,n+.45),a.Q.value=3,i.connect(a).connect(t),Y(e,i,{type:`sawtooth`,frequency:700,to:420,start:n,duration:.45,attack:.04,gain:.25,pan:r})},achievement:(e,t,n)=>{Br(e,t,{frequencies:[1046.5,1318.5,1568,2093],step:.06,type:`square`,start:n,gain:.05}),Rr(e,t,{frequency:3136,start:n+.24,duration:.8,gain:.04})}},anime:{launch:(e,t,n,{strength:r,pan:i})=>Y(e,t,{frequency:600,to:1800+1200*r,start:n,duration:.3,attack:.03,gain:.07,pan:i}),impact:(e,t,n,{strength:r,pan:i})=>{Rr(e,t,{frequency:1046.5,start:n,duration:1.4,gain:.25*r,pan:i}),X(e,t,{filter:`highpass`,frequency:3e3,start:n,duration:.25,gain:.25*r,pan:i}),Y(e,t,{frequency:90,to:45,start:n,duration:.5,gain:.35*r,pan:i})},crash:(e,t,n,{pan:r})=>X(e,t,{filter:`bandpass`,frequency:5e3,q:4,start:n,duration:.35,gain:.3,pan:r}),star:(e,t,n,{pan:r})=>Br(e,t,{frequencies:[1318.5,1568,2093,2637],step:.06,type:`sine`,start:n,gain:.06,pan:r}),achievement:(e,t,n)=>{Br(e,t,{frequencies:[1568,2093,2637,3136],step:.05,type:`sine`,start:n,gain:.05}),Rr(e,t,{frequency:2093,start:n+.2,duration:1.4,gain:.08})}},soft:{launch:(e,t,n,{pan:r})=>zr(e,t,{frequency:659.25,start:n,gain:.15,pan:r}),impact:(e,t,n,{strength:r,pan:i})=>{zr(e,t,{frequency:110,start:n,duration:1.4,gain:.45*r,pan:i}),X(e,t,{filter:`lowpass`,frequency:400,start:n,duration:.6,gain:.15*r,pan:i})},crash:(e,t,n,{pan:r})=>{zr(e,t,{frequency:880,start:n,gain:.12,pan:r}),zr(e,t,{frequency:659.25,start:n+.09,gain:.1,pan:r})},star:(e,t,n,{pan:r})=>[783.99,659.25,523.25,392].forEach((i,a)=>zr(e,t,{frequency:i,start:n+a*.12,gain:.12,pan:r})),achievement:(e,t,n)=>[523.25,659.25,783.99,1046.5].forEach((r,i)=>zr(e,t,{frequency:r,start:n+i*.1,gain:.12}))}};function Hr(){return wr}function Ur(e){if(wr=e,e&&!q){q=new AudioContext;let e=q.createDynamicsCompressor();e.threshold.value=-14,e.ratio.value=6,J=q.createGain(),J.gain.value=Tr,J.connect(e).connect(q.destination)}q&&(e?q.resume():(Xr(),q.suspend()))}function Wr(){return Tr}function Gr(e){Tr=e;try{window.localStorage.setItem(xr,String(e))}catch{}J&&J.gain.setTargetAtTime(e,q.currentTime,.05)}function Kr(e){e!==Er&&Xr(),Er=e}function qr(e){Dr=e}var Jr=()=>wr&&q&&q.state===`running`;function Yr(e,{strength:t=1,pan:n=0,note:r}={}){Jr()&&Vr[Er]?.[e]?.(q,J,q.currentTime,{strength:Mr(t,.2,1),pan:n,note:r})}function Xr(){for(let e of[Or,kr]){for(let t of e.values())t.oscillator.stop();e.clear()}}function Zr(e){let t=q.createOscillator();t.frequency.value=e;let n=q.createGain();n.gain.value=0;let r=q.createStereoPanner();return t.connect(n).connect(r).connect(J),t.start(),{oscillator:t,gain:n,panner:r}}function Qr(e,t){let n=q.currentTime;for(let[r,{frequency:i,gain:a,pan:o}]of t){e.has(r)||e.set(r,Zr(i));let t=e.get(r);t.oscillator.frequency.setTargetAtTime(i,n,.1),t.gain.gain.setTargetAtTime(a,n,.25),t.panner.pan.setTargetAtTime(o,n,.1)}for(let[r,i]of e)t.has(r)||(i.gain.gain.setTargetAtTime(0,n,.2),i.oscillator.stop(n+1),e.delete(r))}var $r=new Map;function ei(e,t,n){if(!Jr()||Er!==`spheres`)return;let r=new Map,i=new Map;if(!Dr){for(let t of e){let e=Cr[t.name];if(!e)continue;let i=Pr(t.position,Nr.right),a=Pr(t.position,Nr.front),o=Mr(6/t.position.distanceTo(n),0,1);r.set(t.name,{frequency:e,gain:.008+.022*o,pan:Ir(t.position)});let s=$r.get(t.name);a>0&&s!==void 0&&Math.sign(i)!==Math.sign(s)&&Vr.spheres.pass(q,J,q.currentTime,{note:e,pan:Ir(t.position),gain:.4+.6*o}),$r.set(t.name,i)}for(let e of t){if(!e.moving)continue;let t=Mr(196*2**(e.velocity.length()/.008),196,1760);i.set(e.index,{frequency:t,gain:.02,pan:Ir(e.position)})}}Qr(Or,r),Qr(kr,i)}function ti({planets:e,asteroids:t}){let n=R();return N(({camera:r})=>{Fr(r),qr(n.current.steps===0),ei(e,t,r.position)}),null}var ni=700,ri=60;function ii({color:e,colors:t,size:n,round:r,opacity:i,stepped:a=!1}){let o=(0,I.useMemo)(()=>{let e=7,t=()=>(e=e*16807%2147483647,(e-1)/2147483646),n=new Float32Array(ni*3),r=new Float32Array(ni*2);for(let e=0;e<ni;e++){let i=t()*Math.PI*2,a=t()*2-1,o=Math.sqrt(1-a*a);n.set([ri*o*Math.cos(i),ri*a,ri*o*Math.sin(i)],e*3),r.set([t()*Math.PI*2,Math.PI*2/(5+t()*20)],e*2)}let i=new D;return i.setAttribute(`position`,new E(n,3)),i.setAttribute(`twinkle`,new E(r,2)),i.setAttribute(`starColor`,new E(new Float32Array(ni*3),3)),i},[]),s=(0,I.useMemo)(()=>new p({uniforms:{size:{value:2},round:{value:1},opacity:{value:1},stepped:{value:0},time:{value:0},pixelRatio:{value:1}},vertexShader:`
      uniform float size;
      uniform float pixelRatio;
      uniform float time;
      uniform float stepped;
      attribute vec3 starColor;
      attribute vec2 twinkle;
      varying vec3 vColor;
      varying float vGlow;
      void main() {
        vColor = starColor;
        vGlow = 0.65 + 0.35 * sin(time * twinkle.y + twinkle.x);
        if (stepped > 0.5) vGlow = ceil(vGlow * 3.0) / 3.0;
        gl_PointSize = max(1.0, size * pixelRatio);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform float round;
      uniform float opacity;
      varying vec3 vColor;
      varying float vGlow;
      void main() {
        if (round > 0.5 && length(gl_PointCoord - 0.5) > 0.5) discard;
        gl_FragColor = vec4(vColor, opacity * vGlow);
      }
    `,transparent:!0,depthWrite:!1}),[]);(0,I.useLayoutEffect)(()=>{let c=(t??[e]).map(B),l=o.attributes.starColor,u=11;for(let e=0;e<l.count;e++){u=u*16807%2147483647;let t=c[u%c.length];l.setXYZ(e,t.x,t.y,t.z)}l.needsUpdate=!0,s.uniforms.size.value=n,s.uniforms.round.value=+!!r,s.uniforms.opacity.value=i,s.uniforms.stepped.value=+!!a},[o,s,e,t,n,r,i,a]);let c=M(e=>e.viewport.dpr);return(0,I.useLayoutEffect)(()=>{s.uniforms.pixelRatio.value=c},[s,c]),N(({clock:e})=>{s.uniforms.time.value=e.getElapsedTime()}),(0,V.jsx)(`points`,{geometry:o,material:s})}var Z=new y(0,0,0),Q=new y(0,5,6),ai=new y().copy(Q).lerp(Z,.25);ai.y-=.5;var oi=new a().setFromNormalAndCoplanarPoint(new y().subVectors(Z,Q).normalize(),ai),si=new a(new y(0,1,0),0),ci=25,li=.009,ui=5e-4,di=4,fi=Q.length(),pi=3,mi=30,hi=(()=>{let e=new l().setFromVector3(Q);return{polar:e.phi,azimuth:e.theta}})(),gi=.02,_i=Math.PI-.02,vi=new y().subVectors(Z,Q).normalize().dot(new y().subVectors(ai,Q)),yi=60,bi=new t,xi=new c,Si=new y,Ci=new y,wi=new y,Ti=new y,Ei=12,Di=[{name:`mercury`,size:.0349,distance:.8,rotation:17e-5,planetTexture:`./img/2k_mercury.jpg`,mass:.055,startArc:[0,360]},{name:`venus`,size:.055,distance:1.44,rotation:41e-6,planetTexture:`./img/2k_venus_atmosphere.jpg`,mass:.815,startArc:[0,360]},{name:`earth`,size:.05644,distance:2,rotation:.01,planetTexture:`./img/2k_earth_daymap.jpg`,mass:1,startArc:[0,360]},{name:`mars`,size:.0412,distance:3.04,rotation:.01,planetTexture:`./img/2k_mars.jpg`,mass:.107,startArc:[0,360]},{name:`jupiter`,size:.1889,distance:6.2,rotation:.024,planetTexture:`./img/2k_jupiter.jpg`,mass:316,startArc:[20,160]},{name:`saturn`,size:.1706,distance:9.5,rotation:.0229,planetTexture:`./img/2k_saturn.jpg`,mass:95,startArc:[40,140]},{name:`uranus`,size:.1126,distance:13,rotation:.0141,planetTexture:`./img/2k_uranus.jpg`,mass:14.53,startArc:[55,125]},{name:`neptune`,size:.1105,distance:17,rotation:.015,planetTexture:`./img/2k_neptune.jpg`,mass:17.15,startArc:[60,120]}],Oi=2880;function ki(e){return Di.map((t,n)=>{let[r,i]=t.startArc,a=le.degToRad(r+Math.random()*(i-r)),o=t.distance+e,s=Oi*Ln[t.name].year/Ln.earth.year,c=2*Math.PI*o/s;return{index:n+1,name:t.name,size:t.size,position:new y(o*Math.cos(a),0,-o*Math.sin(a)),velocity:new y(-Math.sin(a),0,-Math.cos(a)).multiplyScalar(c),starPull:_e(o,c),rotation:{x:0,y:t.rotation,z:0},planetTexture:t.planetTexture,mass:t.mass,start:{distance:o,speed:c},impacts:0,lastImpact:-1/0}})}function Ai(e,t){return t.copy(e.velocity),e.mode===`screen`&&t.add(Ci.subVectors(Z,e.origin).multiplyScalar(ui)),t}function ji({position:e}){let t=M(e=>e.camera);return(0,I.useLayoutEffect)(()=>{t.position.copy(e),t.lookAt(Z)},[t,e]),null}function Mi({children:e}){let t=(0,I.useRef)();return N(({camera:e})=>{t.current.position.copy(e.position)}),(0,V.jsx)(`group`,{ref:t,children:e})}function Ni({starSize:e,planetSizeFactor:t,starMass:n,asteroidMass:r,asteroidGravityFactor:i,planetGravityFactor:a,starIntensity:o,launchMode:s,skinId:c,speed:l,system:u,asteroidTrail:f,planetTrail:p,trajectoryPreview:h,mainButton:g}){let _=De(c),v=(0,I.useRef)(),b=(0,I.useRef)(null);b.current===null&&(b.current=we());let[x,S]=(0,I.useState)([]),C=(0,I.useRef)(0),[w,T]=(0,I.useState)(()=>ki(e)),E=(0,I.useRef)(new Set);(0,I.useEffect)(()=>{Kr(_.sound??`spheres`)},[_]);let D=(0,I.useMemo)(()=>{let e=new d(16777215);return e.position.copy(Q),e.intensity=15,e.distance=di,e.angle=Math.PI/3,e.penumbra=0,e.target.position.copy(Z),e},[]),[O,k]=(0,I.useState)(fi),[A,ee]=(0,I.useState)(hi),j=O/fi,M=(0,I.useMemo)(()=>new y().setFromSphericalCoords(O,A.polar,A.azimuth),[O,A]);(0,I.useEffect)(()=>{let e=e=>k(t=>le.clamp(t*e,pi,mi)),t=t=>{t.preventDefault();let n=t.deltaY*(t.deltaMode===1?33:1);e(Math.exp(n*(t.ctrlKey?.01:.0015)))},n=t=>{t.ctrlKey||t.metaKey||t.altKey||t.target.closest?.(`input[type="text"], select, textarea`)||((t.key===`+`||t.key===`=`)&&e(1/1.15),t.key===`-`&&e(1.15),(t.key===`v`||t.key===`V`)&&(ee(hi),k(fi)))},r=v.current;return r.addEventListener(`wheel`,t,{passive:!1}),window.addEventListener(`keydown`,n),()=>{r.removeEventListener(`wheel`,t),window.removeEventListener(`keydown`,n)}},[]),(0,I.useLayoutEffect)(()=>{D.position.copy(M),D.distance=di*j,D.intensity=15*j*j;let e=new y().subVectors(Z,M).normalize();oi.setFromNormalAndCoplanarPoint(e,M.clone().addScaledVector(e,vi*j))},[D,M,j]);let te=(0,I.useMemo)(()=>{let e=[],t=yi/(2*fi);for(let n=0;n<200;n++){let r=Math.random()*Math.PI*2,i=(Math.random()-.5)*Math.PI,a=yi*Math.cos(r)*Math.cos(i),o=yi*Math.sin(r)*Math.cos(i),s=yi*Math.sin(i),c=(Math.random()*.006+.01)*t;e.push((0,V.jsx)(En,{position:[a,o,s],radius:c},n))}return e},[]),ne=(0,I.useMemo)(()=>{let t=[];for(let n=0;n<100;n++)t.push((0,V.jsx)(Rt,{startPosition:Z,starSize:e,starIntensity:o},n));return t},[e,o]),ie=(0,I.useMemo)(()=>Array.from({length:3},()=>({light:new m(16746496,0,4,0),owner:null,since:0})),[]),[ae,N]=(0,I.useState)([]),oe=(0,I.useRef)(0),se=(0,I.useRef)(null),P=(0,I.useRef)({active:!1,pointerId:null,asteroidIndex:null,mode:`screen`,origin:new y,velocity:new y}),ce=(e,t,n)=>{let r=e.currentTarget.getBoundingClientRect();return xi.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1),bi.setFromCamera(xi,se.current.camera),bi.ray.intersectPlane(t,n)},F=(0,I.useRef)(null),ue=e=>{if(P.current.active||F.current||!se.current)return;let t=e.pointerType===`mouse`&&e.button===2;if(e.pointerType===`mouse`&&e.button!==0&&!t)return;let n=t!==(g===`rotate`);try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}if(n){F.current={pointerId:e.pointerId,x:e.clientX,y:e.clientY},fe(null);return}let r=ce(e,s===`orbital`?si:oi,P.current.origin);if(!r||s===`orbital`&&r.length()>ci||ae.some(e=>e.position.distanceTo(r)<.15))return;let i=C.current++;Object.assign(P.current,{active:!0,pointerId:e.pointerId,asteroidIndex:i,mode:s}),P.current.velocity.set(0,0,0);let a=new y(0,0,0),o={index:i,position:r.clone(),velocity:a,angularVelocity:a,active:!0,moving:!1};N(e=>[...e,o]),fe(null)},[de,fe]=(0,I.useState)(null),pe=e=>{let{camera:n}=se.current,r=e.currentTarget.getBoundingClientRect(),i=r.height/(2*Math.tan(le.degToRad(n.fov/2))),a=null,o=1/0;for(let s of w){if(Ti.copy(s.position).project(n),Ti.z>1)continue;let c=Math.hypot((Ti.x+1)/2*r.width-(e.clientX-r.left),(1-Ti.y)/2*r.height-(e.clientY-r.top));c<s.size*t*i/n.position.distanceTo(s.position)+Ei&&c<o&&(a=s.index,o=c)}return a},me=e=>{let t=P.current.mode===`orbital`?si:oi;if(!ce(e,t,Si))return;let n=P.current.velocity.subVectors(Si,P.current.origin).multiplyScalar(li);P.current.mode===`screen`&&(Ci.subVectors(Z,P.current.origin),n.sub(wi.copy(n).projectOnVector(Ci)))},he=e=>{if(F.current){if(e.pointerId!==F.current.pointerId)return;let t=2*Math.PI/e.currentTarget.getBoundingClientRect().height,n=e.clientX-F.current.x,r=e.clientY-F.current.y;F.current.x=e.clientX,F.current.y=e.clientY,ee(e=>({polar:le.clamp(e.polar-r*t,gi,_i),azimuth:e.azimuth-n*t}))}else P.current.active?e.pointerId===P.current.pointerId&&me(e):e.pointerType===`mouse`&&se.current&&fe(pe(e))},ge=e=>{if(F.current?.pointerId===e.pointerId){F.current=null;return}if(!P.current.active||e.pointerId!==P.current.pointerId)return;me(e),P.current.active=!1;let t=Ai(P.current,new y);Yr(`launch`,{strength:t.length()/.03,pan:Ir(P.current.origin)}),K(`yeet`),i<0&&K(`sorry-newton`),oe.current=b.current.time;let n=P.current.asteroidIndex;N(e=>e.map(e=>e.index===n?{...e,moving:!0,velocity:t,angularVelocity:t}:e))},_e=e=>{Yr(`star`,{strength:.5}),K(`sun-snack`),N(t=>t.filter(t=>t.index!==e))},L=e=>{S(t=>t.filter(t=>t.index!==e))},ve=(0,I.useCallback)((e,t,n)=>{Yr(`crash`,{pan:Ir(n)}),K(`fender-bender`);let r={index:C.current++,position:n,timestamp:b.current.time};S(e=>[...e,r]),N(n=>n.filter(n=>n.index!==e&&n.index!==t))},[]),ye=(0,I.useCallback)((e,t,n,r,i)=>{let a=Di[t-1]?.name;Yr(`impact`,{strength:r.length()*150,pan:Ir(n),note:Cr[a]}),K(`bullseye`),a===`earth`&&K(`houston`),a&&tr(`planets-hit`,a,Di.length,`completionist`);let o={index:C.current++,position:n,timestamp:b.current.time};S(e=>[...e,o]),T(e=>e.map(e=>({...e,...e.index===t?{velocity:e.velocity.add(r),rotation:{x:e.rotation.x+i.x,y:e.rotation.y+i.y,z:e.rotation.z+i.z},impacts:e.impacts+1,lastImpact:b.current.time}:{}}))),N(t=>t.filter(t=>t.index!==e))},[]),be=(0,I.useCallback)((e,t,n,r)=>{let i=e<n;i&&Yr(`impact`,{strength:1,note:Cr[Di[e-1]?.name]}),K(`bumper-cars`);let a=b.current.time;T(o=>o.map(o=>o.index===e?{...o,velocity:o.velocity.clone().add(t),impacts:o.impacts+ +!!i,lastImpact:a}:o.index===n?{...o,velocity:o.velocity.clone().add(r),impacts:o.impacts+ +!!i,lastImpact:a}:o))},[]),xe=e=>{E.current.has(e)||(E.current.add(e),Yr(`star`,{strength:1}),K(`sunburn`)),T(t=>t.filter(t=>t.index!==e))},Se=w.find(e=>e.index===de);return(0,I.useEffect)(()=>{de!==null&&K(`nosy`)},[de]),(0,I.useEffect)(()=>{A.polar<.15&&K(`birds-eye`)},[A]),(0,I.useEffect)(()=>{u!==0&&(P.current.active=!1,N([]),S([]),T(ki(e)),E.current.clear(),fe(null))},[u]),(0,V.jsx)(re,{ref:v,className:`scene`,shadows:!0,camera:{position:Q},gl:{antialias:!0},dpr:_.pixelSize?window.devicePixelRatio/_.pixelSize:[1,2],style:{width:`100vw`,height:`100vh`,touchAction:`none`},onCreated:e=>{se.current=e},onPointerDown:ue,onPointerMove:he,onPointerUp:ge,onPointerCancel:ge,onPointerLeave:()=>fe(null),onContextMenu:e=>e.preventDefault(),children:(0,V.jsxs)(Ce.Provider,{value:b,children:[(0,V.jsx)(Te,{simulation:b,speed:l}),(0,V.jsx)(ji,{position:M}),(0,V.jsx)(ze,{skinId:c,lightPosition:Z,starIntensity:o,spotPosition:M,spotRange:di*j,children:(0,V.jsxs)(`scene`,{children:[(0,V.jsx)(`primitive`,{object:D}),(0,V.jsx)(`pointLight`,{position:Z,intensity:o*3.6,distance:19,decay:.75}),ie.map((e,t)=>(0,V.jsx)(`primitive`,{object:e.light},`explosion_light_${t}`)),(0,V.jsx)(Mi,{children:_.stars?(0,V.jsx)(ii,{..._.stars}):te}),ne,w.map(r=>(0,V.jsx)(In,{...r,starMass:n,starSize:e,planetSizeFactor:t,onStarCollision:xe,starPosition:Z,planets:w,onPlanetCollision:be,trail:p},`planet_${r.index}`)),Se&&(0,V.jsx)(Gn,{planet:Se,starMass:n,starSize:e}),(0,V.jsx)(I.Suspense,{fallback:null,children:ae.map(o=>(0,V.jsx)(Lt,{index:o.index,position:o.position,velocity:o.velocity,angularVelocity:o.angularVelocity,active:o.active,moving:o.moving,onStarCollision:_e,asteroids:ae,onAsteroidCollision:ve,planets:w,onPlanetCollision:ye,starMass:n,starSize:e,asteroidMass:r,planetSizeFactor:t,asteroidGravityFactor:i,starPosition:Z,planetGravityFactor:a,trail:f},`asteroid_${o.index}`))}),x.map(e=>(0,V.jsx)(br,{index:e.index,lights:ie,position:e.position,timestamp:e.timestamp,terminateExplosion:L},`explosion_${e.index}`)),(0,V.jsx)(Tn,{size:e,starIntensity:o}),(0,V.jsx)(kn,{aim:P,referenceDistance:Q.distanceTo(ai)}),(0,V.jsx)(ti,{planets:w,asteroids:ae}),(0,V.jsx)(ar,{planets:w,starMass:n,lastLaunch:oe}),h&&(0,V.jsx)(Pn,{aim:P,getLaunchVelocity:Ai,planets:w,starPosition:Z,starMass:n,starSize:e,asteroidGravityFactor:i,planetGravityFactor:a,planetSizeFactor:t,color:_.arrow??`red`})]})})]})})}function Pi({skinId:e,onSkinChange:t}){(0,I.useEffect)(()=>{let n=n=>{let r={ArrowLeft:-1,ArrowRight:1}[n.key];!r||n.ctrlKey||n.metaKey||n.altKey||n.target.closest?.(`input, select, textarea`)||t(z[(z.findIndex(t=>t.id===e)+r+z.length)%z.length].id)};return window.addEventListener(`keydown`,n),()=>window.removeEventListener(`keydown`,n)},[e,t]);let n=z.find(t=>t.id===e);return(0,V.jsxs)(`div`,{className:`skin-selector`,role:`radiogroup`,"aria-label":`Skin`,children:[(0,V.jsx)(`span`,{className:`skin-name`,children:n.name}),z.map(n=>(0,V.jsx)(`button`,{type:`button`,role:`radio`,"aria-checked":n.id===e,"aria-label":n.name,title:`${n.name} (← →: change skin)`,className:n.id===e?`skin-swatch active`:`skin-swatch`,style:{background:`linear-gradient(135deg, ${n.swatch[0]} 50%, ${n.swatch[1]} 50%)`},onClick:()=>t(n.id)},n.id))]})}function Fi({on:e,onToggle:t,volume:n,onVolumeChange:r}){return(0,V.jsxs)(`div`,{className:`sound-control`,children:[(0,V.jsx)(`button`,{type:`button`,className:`sound-toggle`,"aria-pressed":e,"aria-label":`Sound`,title:e?`Sound on (M: mute)`:`Sound off (M: sound on)`,onClick:t,children:(0,V.jsxs)(`svg`,{viewBox:`0 0 24 24`,width:`20`,height:`20`,"aria-hidden":`true`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,V.jsx)(`path`,{d:`M4 9h4l5-4v14l-5-4H4z`,fill:`currentColor`}),e?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`path`,{d:`M16 9a4 4 0 0 1 0 6`}),(0,V.jsx)(`path`,{d:`M18.5 6.5a7.5 7.5 0 0 1 0 11`})]}):(0,V.jsx)(`path`,{d:`M16 9l5 6M21 9l-5 6`})]})}),(0,V.jsx)(`input`,{type:`range`,className:`volume-slider`,"aria-label":`Volume`,title:`Volume: ${n}`,min:0,max:10,step:1,value:n,onChange:e=>r(parseFloat(e.target.value))})]})}var Ii={speed:2,starSize:.4,starIntensity:5,planetSizeFactor:2,asteroidTrail:3,planetTrail:0,launchMode:`screen`,trajectoryPreview:!0,mainButton:`launch`,asteroidMass:1,asteroidGravityFactor:10,planetGravityFactor:100,starMass:ge};function $({id:e,label:t,hint:n,min:r,max:i,step:a,value:o,onChange:s,shown:c=o}){return(0,V.jsxs)(`div`,{className:`setting`,children:[(0,V.jsxs)(`label`,{htmlFor:e,children:[t,n&&(0,V.jsx)(`span`,{className:`setting-hint`,children:n})]}),(0,V.jsx)(`input`,{type:`range`,id:e,min:r,max:i,step:a,value:o,onChange:e=>s(parseFloat(e.target.value))}),(0,V.jsx)(`output`,{htmlFor:e,children:c})]})}function Li({id:e,label:t,hint:n,choices:r,value:i,onChange:a}){let[[o,s],[c,l]]=r;return(0,V.jsxs)(`div`,{className:`setting`,children:[(0,V.jsxs)(`label`,{htmlFor:e,children:[t,n&&(0,V.jsx)(`span`,{className:`setting-hint`,children:n})]}),(0,V.jsxs)(`div`,{className:`setting-toggle`,children:[(0,V.jsx)(`span`,{className:i===o?`switch-option active`:`switch-option`,onClick:()=>a(o),children:s}),(0,V.jsxs)(`label`,{className:`switch`,children:[(0,V.jsx)(`input`,{type:`checkbox`,id:e,role:`switch`,checked:i===c,onChange:e=>a(e.target.checked?c:o)}),(0,V.jsx)(`span`,{className:`switch-track`})]}),(0,V.jsx)(`span`,{className:i===c?`switch-option active`:`switch-option`,onClick:()=>a(c),children:l})]})]})}function Ri({settings:e,onChange:t,onRandomize:n,onReset:r,volume:i,onVolumeChange:a}){let[o,s]=(0,I.useState)(!1),c=e=>n=>t(e,n);return(0,V.jsxs)(`div`,{className:o?`simulation-parameters open`:`simulation-parameters`,onPointerLeave:e=>{e.pointerType===`mouse`&&s(!1)},children:[(0,V.jsx)(`div`,{className:`title`,children:(0,V.jsx)(`button`,{type:`button`,className:`title-toggle`,"aria-expanded":o,onClick:()=>s(e=>!e),children:`Change the settings here`})}),(0,V.jsxs)(`div`,{className:`settings-body`,children:[(0,V.jsxs)(`div`,{className:`settings-actions`,children:[(0,V.jsx)(`button`,{type:`button`,className:`settings-button primary`,title:`The planets at new places, with the same settings`,onClick:n,children:`Randomize (R)`}),(0,V.jsx)(`button`,{type:`button`,className:`settings-button`,title:`Back to the settings by default`,onClick:r,children:`Reset`})]}),(0,V.jsxs)(`section`,{className:`settings-group`,children:[(0,V.jsx)(`h3`,{children:`Game`}),(0,V.jsx)($,{id:`speed`,label:`Speed`,hint:`Space: pause`,min:0,max:10,step:1,value:e.speed,onChange:c(`speed`),shown:e.speed===0?`Paused`:e.speed}),(0,V.jsx)($,{id:`volume`,label:`Volume`,hint:`M: sound on/off`,min:0,max:10,step:1,value:i,onChange:a})]}),(0,V.jsxs)(`section`,{className:`settings-group`,children:[(0,V.jsx)(`h3`,{children:`Look`}),(0,V.jsx)($,{id:`star-size`,label:`Star Size`,min:.2,max:2,step:.2,value:e.starSize,onChange:c(`starSize`)}),(0,V.jsx)($,{id:`star-luminosity`,label:`Star Luminosity`,min:0,max:10,step:1,value:e.starIntensity,onChange:c(`starIntensity`)}),(0,V.jsx)($,{id:`planets-size`,label:`Planet Size`,min:.5,max:10,step:.5,value:e.planetSizeFactor,onChange:c(`planetSizeFactor`)}),(0,V.jsx)($,{id:`asteroid-trail`,label:`Asteroid Trail`,min:0,max:10,step:1,value:e.asteroidTrail,onChange:c(`asteroidTrail`)}),(0,V.jsx)($,{id:`planet-trail`,label:`Planet Trail`,min:0,max:10,step:1,value:e.planetTrail,onChange:c(`planetTrail`)})]}),(0,V.jsxs)(`section`,{className:`settings-group`,children:[(0,V.jsx)(`h3`,{children:`Throw`}),(0,V.jsx)(Li,{id:`launch-mode`,label:`Launch Mode`,choices:[[`screen`,`Free Throw`],[`orbital`,`Orbital Plane`]],value:e.launchMode,onChange:c(`launchMode`)}),(0,V.jsx)(Li,{id:`trajectory-preview`,label:`Trajectory Preview`,hint:`T: on/off`,choices:[[!1,`Off`],[!0,`On`]],value:e.trajectoryPreview,onChange:c(`trajectoryPreview`)}),(0,V.jsx)(Li,{id:`main-button`,label:`Left Button / Touch`,hint:`Right button: the other`,choices:[[`launch`,`Launch`],[`rotate`,`Rotate View`]],value:e.mainButton,onChange:c(`mainButton`)}),(0,V.jsx)($,{id:`asteroid-mass`,label:`Asteroid Mass`,hint:`Earth masses`,min:.5,max:10,step:.5,value:e.asteroidMass,onChange:c(`asteroidMass`)})]}),(0,V.jsxs)(`section`,{className:`settings-group`,children:[(0,V.jsx)(`h3`,{children:`Gravity`}),(0,V.jsx)($,{id:`asteroid-sensitivity`,label:`Asteroid Sensitivity`,hint:`to gravity`,min:-100,max:100,step:10,value:e.asteroidGravityFactor,onChange:c(`asteroidGravityFactor`)}),(0,V.jsx)($,{id:`planet-gravity-factor`,label:`Planet Gravity`,hint:`on asteroids`,min:-2400,max:2600,step:500,value:e.planetGravityFactor,onChange:c(`planetGravityFactor`)}),(0,V.jsx)($,{id:`star-mass`,label:`Star Mass`,hint:`Breaks the orbits!`,min:-9667e3,max:10333e3,step:1e6,value:e.starMass,onChange:c(`starMass`),shown:`×${Math.round(e.starMass/ge)}`})]}),(0,V.jsxs)(`div`,{className:`settings-keys`,children:[(0,V.jsx)(`span`,{children:`H: hide the interface`}),(0,V.jsx)(`span`,{children:`F: full screen`}),(0,V.jsx)(`span`,{children:`V: reset the view`})]})]})]})}var zi=4e3;function Bi(){let[e,t]=(0,I.useState)(Qn),[n,r]=(0,I.useState)([]),i=(0,I.useRef)(0);return(0,I.useEffect)(()=>$n(e=>{Yr(`achievement`),t(Qn());let n=i.current++;r(t=>[...t,{id:n,achievement:e}]),setTimeout(()=>r(e=>e.filter(e=>e.id!==n)),zi)}),[]),{unlocked:e,toasts:n}}function Vi({unlocked:e,open:t,onToggle:n}){return(0,V.jsx)(`button`,{type:`button`,className:`achievements-button`,"aria-expanded":t,"aria-label":`Achievements`,title:`Achievements (${e.size}/${Kn.length})`,onClick:n,children:(0,V.jsxs)(`svg`,{viewBox:`0 0 24 24`,width:`20`,height:`20`,"aria-hidden":`true`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,V.jsx)(`path`,{d:`M8 4h8v5a4 4 0 0 1-8 0z`,fill:`currentColor`}),(0,V.jsx)(`path`,{d:`M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4`}),(0,V.jsx)(`path`,{d:`M12 13v4M8 20h8M10 17h4`})]})})}function Hi({unlocked:e,onClose:t}){return(0,I.useEffect)(()=>{let e=e=>{e.key===`Escape`&&t()};return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},[t]),(0,V.jsxs)(`div`,{className:`achievements-board`,role:`dialog`,"aria-label":`Achievements`,children:[(0,V.jsxs)(`div`,{className:`achievements-title`,children:[`Achievements · `,e.size,`/`,Kn.length]}),(0,V.jsx)(`ul`,{className:`achievements-list`,children:Kn.map(t=>e.has(t.id)?(0,V.jsxs)(`li`,{className:`achievement`,tabIndex:0,"aria-label":`${t.name}: ${t.text}`,children:[(0,V.jsx)(`span`,{className:`achievement-icon`,"aria-hidden":`true`,children:t.icon}),(0,V.jsxs)(`span`,{className:`achievement-details`,"aria-hidden":`true`,children:[(0,V.jsx)(`span`,{className:`achievement-icon`,children:t.icon}),(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`span`,{className:`achievement-name`,children:t.name}),(0,V.jsx)(`span`,{className:`achievement-text`,children:t.text})]})]})]},t.id):(0,V.jsx)(`li`,{className:`achievement locked`,"aria-label":`Locked`,children:(0,V.jsx)(`span`,{className:`achievement-icon`,"aria-hidden":`true`,children:t.icon})},t.id))})]})}function Ui({toasts:e}){return(0,V.jsx)(`div`,{className:`achievement-toasts`,"aria-live":`polite`,children:e.map(({id:e,achievement:t})=>(0,V.jsxs)(`div`,{className:`achievement-toast`,children:[(0,V.jsx)(`span`,{className:`achievement-icon`,"aria-hidden":`true`,children:t.icon}),(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`span`,{className:`achievement-toast-label`,children:`Achievement unlocked`}),(0,V.jsx)(`span`,{className:`achievement-name`,children:t.name})]})]},e))})}function Wi(){let[e,t]=(0,I.useState)(Ii),n=(0,I.useCallback)((e,n)=>t(t=>({...t,[e]:n})),[]),r=(0,I.useCallback)(()=>t(Ii),[]),{speed:i}=e,a=(0,I.useCallback)(e=>t(t=>({...t,speed:typeof e==`function`?e(t.speed):e})),[]),[o,s]=(0,I.useState)(Oe),[c,l]=(0,I.useState)(0),u=(0,I.useCallback)(()=>{l(e=>e+1),K(`reroll`)},[]),[d,f]=(0,I.useState)(!1),[p,m]=(0,I.useState)(()=>Math.round(Wr()*10)),h=(0,I.useCallback)(e=>{Ur(e),f(e),e&&K(`music`)},[]),g=(0,I.useCallback)(()=>h(!Hr()),[]),_=(0,I.useCallback)(e=>{m(e),Gr(e/10)},[]),v=(0,I.useCallback)(e=>{e===0?(_(Math.round(Sr*10)),h(!1)):(_(e),Hr()||h(!0))},[]),y=(0,I.useCallback)(e=>{s(e),ke(e)},[]),[b,x]=(0,I.useState)(!1),[S,C]=(0,I.useState)(0),w=(0,I.useCallback)(()=>{x(e=>!e),C(e=>e+1)},[]),T=(0,I.useCallback)(()=>{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen().then(()=>{x(!0),C(e=>e+1)}).catch(()=>{})},[]),{unlocked:E,toasts:D}=Bi(),[O,k]=(0,I.useState)(!1),A=(0,I.useCallback)(()=>k(!1),[]);(0,I.useEffect)(()=>{i===10&&K(`fast-forward`)},[i]),(0,I.useEffect)(()=>{tr(`skins-worn`,o,z.length,`fashion`)},[o]),(0,I.useEffect)(()=>{b&&K(`ghost`)},[b]),(0,I.useEffect)(()=>{let e=()=>{document.fullscreenElement||x(!1)};return document.addEventListener(`fullscreenchange`,e),()=>document.removeEventListener(`fullscreenchange`,e)},[]);let ee=(0,I.useRef)(i);return(0,I.useEffect)(()=>{i>0&&(ee.current=i)},[i]),(0,I.useEffect)(()=>{let e=e=>{e.ctrlKey||e.metaKey||e.altKey||e.target.closest?.(`input[type="text"], select, textarea`)||(e.key!==`r`&&e.key!==`R`||e.repeat||u(),e.key!==`m`&&e.key!==`M`||e.repeat||g(),e.key!==`t`&&e.key!==`T`||e.repeat||t(e=>({...e,trajectoryPreview:!e.trajectoryPreview})),e.key!==`h`&&e.key!==`H`||e.repeat||w(),e.key!==`f`&&e.key!==`F`||e.repeat||T(),e.code===`Space`&&(e.preventDefault(),e.repeat||a(e=>e>0?0:ee.current)))};return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},[]),(0,V.jsxs)(`div`,{className:b?`App interface-hidden`:`App`,"data-skin":o,children:[(0,V.jsx)(Ni,{...e,skinId:o,system:c}),(0,V.jsx)(Ri,{settings:e,onChange:n,onRandomize:u,onReset:r,volume:d?p:0,onVolumeChange:v}),(0,V.jsxs)(`div`,{className:`top-bar`,children:[(0,V.jsx)(Fi,{on:d,onToggle:g,volume:d?p:0,onVolumeChange:v}),(0,V.jsxs)(`div`,{className:`achievements-control`,children:[(0,V.jsx)(Vi,{unlocked:E,open:O,onToggle:()=>k(e=>!e)}),O&&(0,V.jsx)(Hi,{unlocked:E,onClose:A})]}),(0,V.jsx)(Pi,{skinId:o,onSkinChange:y})]}),(0,V.jsx)(Ui,{toasts:D}),i===0&&(0,V.jsx)(`button`,{type:`button`,className:`paused`,onClick:()=>a(ee.current),children:`Paused · Space or tap to resume`}),b&&(0,V.jsx)(`div`,{className:`interface-hint`,children:document.fullscreenElement?`H: show interface · Esc: leave full screen`:`H: show interface`},S),(0,V.jsxs)(`div`,{className:`credits`,children:[(0,V.jsx)(`a`,{href:`https://sketchfab.com/3d-models/meteorite-0a503e5bec784cbc9082e2f6b2d9f701`,target:`_blank`,rel:`noopener noreferrer`,children:`"Meteorite"`}),` by `,(0,V.jsx)(`a`,{href:`https://sketchfab.com/hailphilly`,target:`_blank`,rel:`noopener noreferrer`,children:`Hailphilly`}),` (simplified), `,(0,V.jsx)(`a`,{href:`https://creativecommons.org/licenses/by/4.0/`,target:`_blank`,rel:`noopener noreferrer`,children:`CC BY 4.0`}),` · Planet textures by `,(0,V.jsx)(`a`,{href:`https://www.solarsystemscope.com/textures/`,target:`_blank`,rel:`noopener noreferrer`,children:`Solar System Scope`}),`, `,(0,V.jsx)(`a`,{href:`https://creativecommons.org/licenses/by/4.0/`,target:`_blank`,rel:`noopener noreferrer`,children:`CC BY 4.0`})]})]})}(0,de.createRoot)(document.getElementById(`root`)).render((0,V.jsx)(Wi,{}));