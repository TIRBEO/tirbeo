"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { useLandingConfig } from "@/lib/LandingConfigContext";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_STAGES = [
  {
    label: "Foundation",
    color: "#C44A2B",
    heading: "Built to last.",
    body: "No shortcuts, no gimmicks. Just solid principles that outlive every trend and every technology shift.",
  },
  {
    label: "Framework",
    color: "#D4702A",
    heading: "Every feature has a reason.",
    body: "Designed to connect, not to keep you hooked. Purpose-driven, intentional, and built for real human interaction.",
  },
  {
    label: "Connection",
    color: "#A0522D",
    heading: "Less is more.",
    body: "A bridge carries only what's needed. Every line of code, every pixel—they all serve a purpose. Nothing wasted.",
  },
];

// ---------------------------------------------------------------------------
// Color grading + glitch full-screen shader pass.
// Always-on filmic grade (contrast / saturation / split-tone / vignette),
// plus a glitch pulse (RGB channel split + sliced-scanline displacement)
// that spikes briefly whenever the signboard content changes.
// ---------------------------------------------------------------------------
const ColorGradeGlitchShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGlitch: { value: 0 },
    uVignette: { value: 0.22 },
    uContrast: { value: 1.1 },
    uSaturation: { value: 1.14 },
    uShadowTint: { value: new THREE.Color("#8a3a20") },
    uHighlightTint: { value: new THREE.Color("#ffaa44") },
    // Extra warm push that ramps up once we're past the grass/foundation
    // stage, so the tower + bridge finale reads richer and more golden.
    uWarmBoost: { value: 0 },
    // Colorful glitch tints: each glitching scanline slice gets randomly
    // tinted one of these three, instead of the old plain red/cyan split.
    // uGlitchColorB is the requested custom green — a bright "signal
    // green" that reads as a cool, electric counterpoint to the warm
    // amber/orange palette everywhere else in the scene.
    uGlitchColorA: { value: new THREE.Color("#ff2d6b") },
    uGlitchColorB: { value: new THREE.Color("#39ff88") },
    uGlitchColorC: { value: new THREE.Color("#2fc7ff") },
    uDarkness: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGlitch;
    uniform float uVignette;
    uniform float uContrast;
    uniform float uSaturation;
    uniform vec3 uShadowTint;
    uniform vec3 uHighlightTint;
    uniform float uWarmBoost;
    uniform vec3 uGlitchColorA;
    uniform vec3 uGlitchColorB;
    uniform vec3 uGlitchColorC;
    uniform float uDarkness;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;

      // --- Glitch: sliced horizontal displacement, driven by uGlitch ---
      float sliceY = floor(uv.y * 46.0);
      float sliceNoise = rand(vec2(sliceY, floor(uTime * 14.0)));
      bool glitchingSlice = uGlitch > 0.001 && sliceNoise > 0.80;

      if (glitchingSlice) {
        uv.x += (sliceNoise - 0.5) * 0.07 * uGlitch;
      }

      // --- Chromatic split, shifted in two directions so it reads as
      // genuinely colorful rather than a flat red/cyan fringe ---
      float rgbShift = 0.006 * uGlitch;
      float r = texture2D(tDiffuse, uv + vec2(rgbShift, 0.0)).r;
      float g = texture2D(tDiffuse, uv + vec2(0.0, rgbShift * 0.8)).g;
      float b = texture2D(tDiffuse, uv - vec2(rgbShift, 0.0)).b;
      vec3 color = vec3(r, g, b);

      // --- Colorful slice tint: each glitching scanline is randomly
      // tinted hot-pink, signal-green, or electric-blue ---
      if (glitchingSlice) {
        float hueSeed = rand(vec2(sliceY * 3.7, floor(uTime * 14.0) + 11.0));
        vec3 tint = hueSeed < 0.34
          ? uGlitchColorA
          : (hueSeed < 0.67 ? uGlitchColorB : uGlitchColorC);
        color = mix(color, color * tint * 1.6, uGlitch * 0.55);
      }

      // --- Contrast ---
      color = (color - 0.5) * uContrast + 0.5;

      // --- Saturation ---
      float luma = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(vec3(luma), color, uSaturation);

      // --- Split toning: cool shadows, warm highlights (additive, so
      // shadow detail is never crushed to black) ---
      float lum = dot(color, vec3(0.299, 0.587, 0.114));
      color += uShadowTint * (1.0 - smoothstep(0.0, 0.6, lum)) * 0.15;
      color += uHighlightTint * smoothstep(0.5, 1.0, lum) * (0.1 + uWarmBoost * 0.15);

      // --- Vignette ---
      vec2 vigUv = vUv - 0.5;
      float vig = 1.0 - dot(vigUv, vigUv) * uVignette * 2.2;
      color *= vig;

      // --- Scanline flicker, only while glitching ---
      if (uGlitch > 0.001) {
        float scan = sin(uv.y * 900.0 + uTime * 34.0) * 0.03 * uGlitch;
        color += scan;
      }

      // --- Night darkness: mix toward black as sun sets ---
      color = mix(color, vec3(0.0), uDarkness);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

function createSunburstTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d")!;
  const cx = size / 2;
  const cy = size / 2;

  // Bright core
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.15);
  core.addColorStop(0, "rgba(255,252,235,1)");
  core.addColorStop(0.45, "rgba(255,220,160,0.9)");
  core.addColorStop(1, "rgba(255,180,90,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);

  // Soft wide halo
  ctx.globalCompositeOperation = "lighter";
  const halo = ctx.createRadialGradient(cx, cy, size * 0.1, cx, cy, size * 0.58);
  halo.addColorStop(0, "rgba(255,195,115,0.38)");
  halo.addColorStop(1, "rgba(255,195,115,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);

  // Streaking rays — a dense short layer plus a sparse long layer, so the
  // burst reads well both up close and from a distance.
  const rayLayers = [
    { count: 20, lenMin: 0.28, lenMax: 0.42, wMin: 0.004, wMax: 0.009, alpha: 0.45 },
    { count: 10, lenMin: 0.42, lenMax: 0.58, wMin: 0.01, wMax: 0.018, alpha: 0.3 },
  ];

  rayLayers.forEach(({ count, lenMin, lenMax, wMin, wMax, alpha }) => {

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2;
      const len = size * (lenMin + Math.random() * (lenMax - lenMin));
      const width = size * (wMin + Math.random() * (wMax - wMin));

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const rayGrad = ctx.createLinearGradient(0, 0, len, 0);
      rayGrad.addColorStop(0, `rgba(255,228,178,${alpha})`);
      rayGrad.addColorStop(1, "rgba(255,228,178,0)");

      ctx.fillStyle = rayGrad;
      ctx.fillRect(0, -width / 2, len, width);
      ctx.restore();
    }

  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

function createSkyGradient() {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#1a0a2a");
  grad.addColorStop(0.15, "#3a1040");
  grad.addColorStop(0.3, "#6a2040");
  grad.addColorStop(0.45, "#6a2a1a");
  grad.addColorStop(0.6, "#9a5020");
  grad.addColorStop(0.78, "#b07030");
  grad.addColorStop(0.9, "#c09040");
  grad.addColorStop(1, "#b08040");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 512);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

function createGlassFacadeTexture(litRatio = 0.25) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;

  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#2a1a14";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cols = 4;
  const rows = 10;

  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;

  const mullion = 5;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW + mullion / 2;
      const y = r * cellH + mullion / 2;

      const w = cellW - mullion;
      const h = cellH - mullion;

      const lit = Math.random() < litRatio;

      const g = ctx.createLinearGradient(x, y, x, y + h);

      if (lit) {
        g.addColorStop(0, "#ffe8a0");
        g.addColorStop(0.5, "#f0b850");
        g.addColorStop(1, "#c08030");
      } else {
        g.addColorStop(0, "#8a5a3a");
        g.addColorStop(0.5, "#5a3a2a");
        g.addColorStop(1, "#3a2018");
      }

      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

export function StackedSection() {
  const config = useLandingConfig();
  const stages = config.features?.stages?.length ? config.features.stages.map((s: any) => ({
    label: s.label || "Stage",
    color: s.color || "#C44A2B",
    heading: s.heading || "",
    body: s.body || "",
  })) : DEFAULT_STAGES;

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const textContainerRef = useRef<HTMLDivElement>(null);

  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Arrow overlay that visually connects the physical 3D signboard to the
  // on-screen caption text, so it's clear the caption "comes from" the sign.
  const arrowSvgRef = useRef<SVGSVGElement>(null);
  const arrowPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;

    if (!canvas || !wrapper) return;

    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;

    const scene = new THREE.Scene();

    scene.background =
      createSkyGradient();

    scene.fog =
      new THREE.FogExp2(
        0xd4a070,
        0.014
      );

    const camera = new THREE.PerspectiveCamera(
      32,
      width / height,
      0.1,
      50
    );

    const CAM_INIT = { x: 4.5, y: 6.5, z: 11 };
    const CAM_TARGET = new THREE.Vector3(-1.5, 1.7, 0);
    camera.position.set(CAM_INIT.x, CAM_INIT.y, CAM_INIT.z);
    camera.lookAt(CAM_TARGET);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //---------------------------------
    // Post-processing: color grade + glitch
    //---------------------------------

    const composer = new EffectComposer(renderer);
    composer.setSize(width, height);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const colorGradePass = new ShaderPass(ColorGradeGlitchShader);
    colorGradePass.renderToScreen = false;
    composer.addPass(colorGradePass);

    // Bloom – adds soft glow to bright areas (sun, emissive grass)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.25, 0.4, 0.6);
    bloomPass.threshold = 0.08;
    bloomPass.strength = 0.25;
    bloomPass.radius = 0.6;
    composer.addPass(bloomPass);
    bloomPass.renderToScreen = true;

    let glitchPulse = 0;

    //---------------------------------
    // Lighting — Golden Hour
    //---------------------------------

    const ambient = new THREE.AmbientLight(
      0xffd7a5,
      0.12
    );

    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(
      0x9fc3ff,
      0x1a2230,
      0.15
    );

    scene.add(hemi);

    const sun =
      new THREE.DirectionalLight(
        0xff7722,
        0.5
      );

    sun.position.set(-4, 5, -5);
    sun.castShadow = true;

    scene.add(sun);

    const sunRim =
      new THREE.DirectionalLight(
        0xff5500,
        0.3
      );

    sunRim.position.set(
      -2,
      3,
      -2
    );

    scene.add(sunRim);

    const fill = new THREE.DirectionalLight(
      0xffcc88,
      0.4
    );

    fill.position.set(6, 3, 6);

    scene.add(fill);

    // Extra fill facing the camera side of the tower/bridge so their
    // facades stay readable instead of silhouetting to black.
    const cameraFill = new THREE.DirectionalLight(
      0xbcd4ff,
      0.45
    );

    cameraFill.position.set(5, 4, 9);

    // Sun sphere – soft orange glow
    const sunSphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const sunSphereMat = new THREE.MeshStandardMaterial({
      color: "#ffb84d",
      emissive: new THREE.Color("#ffb84d"),
      emissiveIntensity: 0.4,
    });
    const sunSphere = new THREE.Mesh(sunSphereGeo, sunSphereMat);
    sunSphere.position.set(0, 8, 0);
    scene.add(sunSphere);

    // Sun icon sprite – visual marker for the sun
    const sunTexture = new THREE.TextureLoader().load('/sun.png');
    const sunSpriteMat = new THREE.SpriteMaterial({ map: sunTexture, color: 0xffffff, transparent: true });
    const sunIconSprite = new THREE.Sprite(sunSpriteMat);
    sunIconSprite.scale.set(2, 2, 1);
    sunIconSprite.position.set(0, 8, 0);
    scene.add(sunIconSprite);

    // Light emanating from the sun – soft orange point light
    const sunPoint = new THREE.PointLight(0xff8c00, 0.05, 30, 2);
    sunPoint.position.set(0, 8, 0);
    scene.add(sunPoint);

    // Sun halo – dark orange circular glow using a canvas texture
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 256;
    haloCanvas.height = 256;
    const haloCtx = haloCanvas.getContext('2d')!;
    const haloGrad = haloCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    haloGrad.addColorStop(0, 'rgba(255,140,0,0.8)'); // dark orange
    haloGrad.addColorStop(1, 'rgba(255,140,0,0)');
    haloCtx.fillStyle = haloGrad;
    haloCtx.fillRect(0, 0, 256, 256);
    const haloTexture = new THREE.CanvasTexture(haloCanvas);
    haloTexture.needsUpdate = true;
    const haloMaterial = new THREE.SpriteMaterial({
      map: haloTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const haloSprite = new THREE.Sprite(haloMaterial);
    haloSprite.scale.set(6, 6, 1);
    haloSprite.position.set(0, 8, 0);
    scene.add(haloSprite);

    scene.add(cameraFill);

    //---------------------------------
    // Sun / God Rays
    //---------------------------------

    const sunburstTexture = createSunburstTexture();

    const sunSpriteMaterial = new THREE.SpriteMaterial({
      map: sunburstTexture,
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const sunSprite = new THREE.Sprite(sunSpriteMaterial);

    const sunDirection = sun.position
      .clone()
      .normalize()
      .multiplyScalar(-1);

    sunSprite.position.copy(
      sunDirection.multiplyScalar(14)
    );

    sunSprite.position.y = 4.5;

    sunSprite.scale.set(6.5, 6.5, 1);

    scene.add(sunSprite);

    //---------------------------------
    // Ground
    //---------------------------------

    const gridHelper = new THREE.GridHelper(
      10,
      20,
      0xffffff,
      0xffffff
    );

    gridHelper.position.y = -0.5;

    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.05;

    scene.add(gridHelper);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshPhysicalMaterial({
        color: 0x3a2a1a,
        roughness: 0.95,
        metalness: 0,
      })
    );

    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;

    ground.receiveShadow = true;

    scene.add(ground);

    //---------------------------------
    // Small Pond
    //---------------------------------

    const pondMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a5a7a,
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.6,
      clearcoat: 0.4,
      clearcoatRoughness: 0.1,
      envMapIntensity: 0.3,
    });
    const pond = new THREE.Mesh(new THREE.CircleGeometry(0.9, 28), pondMat);
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(-0.5, -0.48, -1.8);
    pond.receiveShadow = true;
    scene.add(pond);

    // Rim around pond
    const rimMat = new THREE.MeshPhysicalMaterial({
      color: 0x3a2a1a,
      roughness: 0.95,
      metalness: 0,
    });
    const rim = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 28), rimMat);
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(-0.5, -0.48, -1.8);
    rim.receiveShadow = true;
    scene.add(rim);

    //---------------------------------
    // Dense Grass
    //---------------------------------

    const grassMaterial = new THREE.MeshStandardMaterial({
      color: "#3a8a40",
      side: THREE.DoubleSide,
      vertexColors: true,
      emissive: new THREE.Color("#5a9a30"),
      emissiveIntensity: 0.25,
    });

    const grassTimeUniform = { value: 0 };

    grassMaterial.onBeforeCompile = (shader: any) => {
      shader.uniforms.uGrassTime = grassTimeUniform;
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uGrassTime;`
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          float windPhase = position.x * 0.8 + position.z * 0.6;
          float windStrength = 0.07;
          float windSway = sin(uGrassTime * 1.6 + windPhase) * windStrength * position.y * 3.0;
          transformed.x += windSway;
          transformed.z += cos(uGrassTime * 1.2 + windPhase * 0.7) * windStrength * 0.5 * position.y * 3.0;`
        );
    };

    const bladeGeometry = new THREE.PlaneGeometry(
      0.025,
      0.065
    );

    bladeGeometry.translate(0, 0.032, 0);

    const FIELD = 16;
    const SPACING = 0.07;

    const rows = Math.floor(FIELD / SPACING);
    const cols = Math.floor(FIELD / SPACING);

    const grass = new THREE.InstancedMesh(
      bladeGeometry,
      grassMaterial,
      rows * cols
    );

    const dummy = new THREE.Object3D();

    // Furniture circle — center around which furniture is arranged in a ring
    const FURN_CENTER = new THREE.Vector3(-6.5, -0.5, 3.2);
    const EXCL_RADIUS = 2.6; // no grass inside this radius from FURN_CENTER

    let grassCount = 0;

    for (let x = 0; x < cols; x++) {

      for (let z = 0; z < rows; z++) {

        let px =
          -FIELD / 2 +
          x * SPACING +
          (Math.random() - 0.5) * SPACING;

        let pz =
          -FIELD / 2 +
          z * SPACING +
          (Math.random() - 0.5) * SPACING;

        // Skip grass inside the furniture exclusion zone
        const dx = px - FURN_CENTER.x;
        const dz = pz - FURN_CENTER.z;
        if (dx * dx + dz * dz < EXCL_RADIUS * EXCL_RADIUS) continue;

        const scale =
          0.6 + Math.random() * 0.5;

        dummy.position.set(px, -0.5, pz);

        dummy.rotation.y =
          Math.random() * Math.PI;

        dummy.rotation.z =
          (Math.random() - 0.5) * 0.25;

        dummy.scale.set(
          scale,
          scale,
          scale
        );

        dummy.updateMatrix();

        grass.setMatrixAt(
          grassCount++,
          dummy.matrix
        );
      }
    }

    grass.count = grassCount;
    grass.instanceMatrix.needsUpdate = true;

    const grassColors =
      new Float32Array(
        grassCount * 3
      );

    for (
      let i = 0;
      i < grassCount;
      i++
    ) {

      const shade =
        0.65 + Math.random() * 0.35;

grassColors[
            i * 3
          ] = 0.18 * shade;

          grassColors[
            i * 3 + 1
          ] = 0.70 * shade;

          grassColors[
            i * 3 + 2
          ] = 0.06 * shade;
    }

    grass.instanceColor =
      new THREE.InstancedBufferAttribute(
        grassColors,
        3
      );

    grass.castShadow = true;
    grass.receiveShadow = true;

    scene.add(grass);

    //---------------------------------
    // Wildflowers
    //---------------------------------

    const flowerCount = 300;
    const flowerPos = new Float32Array(flowerCount * 3);
    const flowerSizes = new Float32Array(flowerCount);
    const flowerPalette = [
      [1.0, 0.5, 0.7], [1.0, 0.85, 0.3], [0.9, 0.4, 0.9],
      [1.0, 0.7, 0.4], [1.0, 1.0, 1.0], [0.7, 0.5, 1.0],
      [1.0, 0.6, 0.6], [0.6, 0.8, 1.0],
    ];
    const flowerColors = new Float32Array(flowerCount * 3);

    for (let i = 0; i < flowerCount; i++) {
      let px = 0, pz = 0;
      let attempts = 0;
      do {
        px = (Math.random() - 0.5) * 11;
        pz = (Math.random() - 0.5) * 11;
        attempts++;
      } while (
        attempts < 50 &&
        ( // skip tower area
          (px > -4 && px < -1.5 && pz > -1.5 && pz < 1.5) ||
          // skip pillar area
          (px > -1.2 && px < 0 && pz > -0.8 && pz < 0.8) ||
          // skip furniture circle
          ((px + 6.5) ** 2 + (pz - 3.2) ** 2 < 3.0 ** 2) ||
          // skip pond
          ((px + 0.5) ** 2 + (pz + 1.8) ** 2 < 1.2 ** 2)
        )
      );
      flowerPos[i * 3] = px;
      flowerPos[i * 3 + 1] = -0.48;
      flowerPos[i * 3 + 2] = pz;
      const c = flowerPalette[Math.floor(Math.random() * flowerPalette.length)];
      flowerColors[i * 3] = c[0];
      flowerColors[i * 3 + 1] = c[1];
      flowerColors[i * 3 + 2] = c[2];
      flowerSizes[i] = 0.03 + Math.random() * 0.04;
    }

    const flowerGeo = new THREE.BufferGeometry();
    flowerGeo.setAttribute("position", new THREE.BufferAttribute(flowerPos, 3));
    flowerGeo.setAttribute("color", new THREE.BufferAttribute(flowerColors, 3));
    flowerGeo.setAttribute("size", new THREE.BufferAttribute(flowerSizes, 1));

    // Create a soft circular dot texture for flowers
    const flowerCanvas = document.createElement("canvas");
    flowerCanvas.width = 32;
    flowerCanvas.height = 32;
    const fCtx = flowerCanvas.getContext("2d")!;
    const fGrad = fCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    fGrad.addColorStop(0, "rgba(255,255,255,1)");
    fGrad.addColorStop(0.3, "rgba(255,255,255,0.9)");
    fGrad.addColorStop(0.7, "rgba(255,255,255,0.5)");
    fGrad.addColorStop(1, "rgba(255,255,255,0)");
    fCtx.fillStyle = fGrad;
    fCtx.fillRect(0, 0, 32, 32);
    const flowerDot = new THREE.CanvasTexture(flowerCanvas);

    const flowers = new THREE.Points(
      flowerGeo,
      new THREE.PointsMaterial({
        size: 0.06,
        map: flowerDot,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })
    );
    scene.add(flowers);

    const woodMaterial =
      new THREE.MeshPhysicalMaterial({
        color: "#8B6F47",
        roughness: 0.85,
        metalness: 0,
      });

    const woodDark =
      new THREE.MeshPhysicalMaterial({
        color: "#5C4A32",
        roughness: 0.9,
        metalness: 0,
      });

    const cushionMaterial =
      new THREE.MeshPhysicalMaterial({
        color: "#A67B5B",
        roughness: 0.95,
        metalness: 0,
      });

    // Bench
    const bench = new THREE.Group();

    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.06, 0.45),
      woodMaterial
    );
    seat.position.y = 0;
    seat.castShadow = true;
    seat.receiveShadow = true;
    bench.add(seat);

    const backrest = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.4, 0.04),
      woodMaterial
    );
    backrest.position.set(0, 0.23, -0.23);
    backrest.castShadow = true;
    backrest.receiveShadow = true;
    bench.add(backrest);

    for (let i = -1; i <= 1; i += 2) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.2, 0.04),
        woodDark
      );
      leg.position.set(i * 0.5, -0.13, 0.16);
      bench.add(leg);

      const legBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.32, 0.04),
        woodDark
      );
      legBack.position.set(i * 0.5, -0.06, -0.18);
      bench.add(legBack);
    }

    const cushion = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.05, 0.38),
      cushionMaterial
    );
    cushion.position.set(0, 0.04, 0);
    cushion.receiveShadow = true;
    bench.add(cushion);

    // Side table
    const tableMaterial =
      new THREE.MeshPhysicalMaterial({
        color: "#7A6B55",
        roughness: 0.7,
        metalness: 0.1,
      });

    const table = new THREE.Group();

    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.28, 0.04, 16),
      tableMaterial
    );
    tableTop.position.y = 0;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    table.add(tableTop);

    const tableLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.28, 8),
      woodDark
    );
    tableLeg.position.y = -0.16;
    table.add(tableLeg);

    scene.add(table);

    // Empty chair
    const chairMaterial =
      new THREE.MeshPhysicalMaterial({
        color: "#7A6B55",
        roughness: 0.75,
        metalness: 0.05,
      });

    const chair = new THREE.Group();

    const chairSeat = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.04, 0.4),
      chairMaterial
    );
    chairSeat.position.y = 0;
    chairSeat.castShadow = true;
    chairSeat.receiveShadow = true;
    chair.add(chairSeat);

    const chairBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.3, 0.03),
      chairMaterial
    );
    chairBack.position.set(0, 0.17, -0.19);
    chairBack.castShadow = true;
    chair.add(chairBack);

    for (let i = -1; i <= 1; i += 2) {
      const cl = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, 0.18, 0.025),
        woodDark
      );
      cl.position.set(i * 0.17, -0.11, 0.17);
      chair.add(cl);

      const clb = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, 0.25, 0.025),
        woodDark
      );
      clb.position.set(i * 0.17, -0.04, -0.17);
      chair.add(clb);
    }

    scene.add(chair);

    // Rearrange all 3 furniture items into a circle around FURN_CENTER
    const FURN_RADIUS = 1.4;
    const furnAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
    const furnItems = [bench, table, chair];
    furnItems.forEach((item, i) => {
      const a = furnAngles[i];
      item.position.set(
        FURN_CENTER.x + Math.cos(a) * FURN_RADIUS,
        FURN_CENTER.y,
        FURN_CENTER.z + Math.sin(a) * FURN_RADIUS
      );
      item.rotation.y = a + Math.PI;
    });

    // Circular ground patch under the furniture circle
    const patchGeo = new THREE.CircleGeometry(1.8, 24);
    const patchMat = new THREE.MeshPhysicalMaterial({
      color: "#3a2a1a",
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const groundPatch = new THREE.Mesh(patchGeo, patchMat);
    groundPatch.rotation.x = -Math.PI / 2;
    groundPatch.position.set(FURN_CENTER.x, -0.48, FURN_CENTER.z);
    groundPatch.receiveShadow = true;
    scene.add(groundPatch);

    //---------------------------------
    // Lamp Post
    //---------------------------------

    const lampGroup = new THREE.Group();
    const poleMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.7, roughness: 0.3 });
    const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xffdd88 });

    const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, 1.3, 8), poleMat);
    pole1.position.y = 0.65;
    pole1.castShadow = true;
    lampGroup.add(pole1);

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6), poleMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(0.17, 1.2, 0);
    lampGroup.add(arm);

    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), lampGlowMat);
    globe.position.set(0.34, 1.2, 0);
    lampGroup.add(globe);

    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), new THREE.MeshBasicMaterial({
      color: 0xffdd88,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    glow.position.set(0.34, 1.2, 0);
    lampGroup.add(glow);

    lampGroup.position.set(FURN_CENTER.x + 2.0, -0.5, FURN_CENTER.z - 1.0);
    lampGroup.rotation.y = -0.3;
    scene.add(lampGroup);

    const boardCanvas =
      document.createElement(
        "canvas"
      );

    // Higher resolution so headline + body copy stay crisp at the larger
    // physical size below.
    boardCanvas.width = 960;
    boardCanvas.height = 600;

    const boardCtx =
      boardCanvas.getContext(
        "2d"
      )!;

    // Offscreen buffer that always holds the pristine, un-glitched
    // artwork. The glitch pass reads slices out of this and composites
    // them (shifted) onto the visible boardCanvas, so the "clean" source
    // never gets destroyed by repeated glitching.
    const boardCleanCanvas =
      document.createElement(
        "canvas"
      );

    boardCleanCanvas.width = 960;
    boardCleanCanvas.height = 600;

    const boardCleanCtx =
      boardCleanCanvas.getContext(
        "2d"
      )!;

    const boardTexture =
      new THREE.CanvasTexture(
        boardCanvas
      );

    boardTexture.minFilter =
      THREE.LinearFilter;

    boardTexture.colorSpace =
      THREE.SRGBColorSpace;

    function drawBoard(
      stageIndex: number
    ) {

      const stage =
        stages[stageIndex];

      const ctx = boardCleanCtx;

      ctx.clearRect(
        0,
        0,
        960,
        600
      );

      // Warm dark background
      const bg =
        ctx.createRadialGradient(
          480,
          300,
          75,
          480,
          300,
          540
        );

      bg.addColorStop(0, "#1a1420");
      bg.addColorStop(1, "#0c0a10");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 960, 600);

      // Subtle inner glow border
      ctx.shadowColor =
        stage.color;

      ctx.shadowBlur = 12;

      ctx.strokeStyle =
        stage.color;

      ctx.lineWidth = 2;
      ctx.strokeRect(
        27,
        27,
        906,
        546
      );

      ctx.shadowBlur = 0;

      // Outer border
      ctx.strokeStyle =
        "rgba(255,255,255,0.06)";

      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        18,
        18,
        924,
        564
      );

      // Corner ornaments
      const ornSize = 18;

      ctx.strokeStyle =
        stage.color;

      ctx.lineWidth = 2;

      // Top-left
      ctx.beginPath();
      ctx.moveTo(27, 27 + ornSize);
      ctx.lineTo(27, 27);
      ctx.lineTo(27 + ornSize, 27);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(
        933 - ornSize,
        27
      );
      ctx.lineTo(933, 27);
      ctx.lineTo(
        933,
        27 + ornSize
      );
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(
        27,
        573 - ornSize
      );
      ctx.lineTo(27, 573);
      ctx.lineTo(
        27 + ornSize,
        573
      );
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(
        933 - ornSize,
        573
      );
      ctx.lineTo(933, 573);
      ctx.lineTo(
        933,
        573 - ornSize
      );
      ctx.stroke();

      // Label with accent bar
      ctx.fillStyle =
        stage.color;

      ctx.font =
        "600 21px 'Inter',system-ui,sans-serif";

      ctx.textAlign =
        "center";

      ctx.fillText(
        stage.label.toUpperCase(),
        480,
        66
      );

      // Accent bar below label
      const barW = 60;

      ctx.strokeStyle =
        stage.color;

      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(
        480 - barW,
        84
      );
      ctx.lineTo(
        480 + barW,
        84
      );
      ctx.stroke();

      // Small diamond accent at center of bar
      ctx.fillStyle =
        stage.color;

      ctx.fillRect(
        477,
        81,
        6,
        6
      );

      // Heading
      ctx.fillStyle =
        "#f0e8e0";

      ctx.font =
        "700 57px 'Inter',system-ui,sans-serif";

      ctx.shadowColor =
        "rgba(0,0,0,0.4)";

      ctx.shadowBlur = 18;

      ctx.fillText(
        stage.heading,
        480,
        192
      );

      ctx.shadowBlur = 0;

      // Decorative divider
      ctx.strokeStyle =
        "rgba(255,255,255,0.08)";

      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(210, 222);
      ctx.lineTo(750, 222);
      ctx.stroke();

      // Body text
      ctx.fillStyle =
        "#b8a898";

      ctx.font =
        "24px 'Inter',system-ui,sans-serif";

      ctx.textAlign =
        "center";

      const words =
        stage.body.split(
          " "
        );

      let line = "";
      let y = 285;

      for (const word of words) {

        const test =
          line + word + " ";

        const metrics =
          ctx.measureText(
            test
          );

        if (
          metrics.width > 780 &&
          line !== ""
        ) {

          ctx.fillText(
            line.trim(),
            480,
            y
          );

          line = word + " ";
          y += 42;

        } else {

          line = test;

        }
      }

      ctx.fillText(
        line.trim(),
        480,
        y
      );

      boardCtx.clearRect(0, 0, 960, 600);
      boardCtx.drawImage(boardCleanCanvas, 0, 0);

      boardTexture.needsUpdate =
        true;

    }

    let boardGlitchActive = false;

    // Applies a brief glitch pass on top of the clean board art: some
    // slices shift straight sideways, some pop upward, driven by the
    // same pulse that spikes on every stage change.
    function applyBoardGlitch(pulse: number) {

      if (pulse < 0.02) {

        if (boardGlitchActive) {

          boardCtx.clearRect(0, 0, 960, 600);
          boardCtx.drawImage(boardCleanCanvas, 0, 0);
          boardTexture.needsUpdate = true;
          boardGlitchActive = false;

        }

        return;

      }

      boardGlitchActive = true;

      boardCtx.clearRect(0, 0, 960, 600);
      boardCtx.drawImage(boardCleanCanvas, 0, 0);

      // Same three-color palette as the full-screen glitch pass — hot
      // pink, signal green, electric blue — so the board and the screen
      // glitch feel like one consistent effect.
      const glitchPalette = [
        "255,45,107",
        "57,255,136",
        "47,199,255",
      ];

      const sliceCount = 10;

      for (let i = 0; i < sliceCount; i++) {

        if (Math.random() > pulse * 0.95) continue;

        const sliceH = 10 + Math.random() * 50;
        const sy = Math.random() * (600 - sliceH);
        const goUpward = Math.random() > 0.5;
        const fringeColor =
          glitchPalette[
            Math.floor(Math.random() * glitchPalette.length)
          ];

        if (goUpward) {

          // Vertical (upward) displaced slice
          const dy = -(10 + Math.random() * 42) * pulse;

          boardCtx.drawImage(
            boardCleanCanvas,
            0, sy, 960, sliceH,
            0, sy + dy, 960, sliceH
          );

          boardCtx.globalCompositeOperation = "lighter";
          boardCtx.fillStyle = `rgba(${fringeColor},${0.22 * pulse})`;
          boardCtx.fillRect(0, sy + dy, 960, sliceH);
          boardCtx.globalCompositeOperation = "source-over";

        } else {

          // Straight (horizontal) displaced slice
          const dx = (Math.random() - 0.5) * 110 * pulse;

          boardCtx.drawImage(
            boardCleanCanvas,
            0, sy, 960, sliceH,
            dx, sy, 960, sliceH
          );

          boardCtx.globalCompositeOperation = "lighter";
          boardCtx.fillStyle = `rgba(${fringeColor},${0.22 * pulse})`;
          boardCtx.fillRect(dx, sy, 960, sliceH);
          boardCtx.globalCompositeOperation = "source-over";

        }

      }

      // Faint overall color wash while glitching, cycling through the
      // same palette rather than sitting on one flat red tint.
      const washColor =
        glitchPalette[
          Math.floor(Math.random() * glitchPalette.length)
        ];

      boardCtx.globalCompositeOperation = "lighter";
      boardCtx.fillStyle = `rgba(${washColor},${0.05 * pulse})`;
      boardCtx.fillRect(0, 0, 960, 600);
      boardCtx.globalCompositeOperation = "source-over";

      boardTexture.needsUpdate = true;

    }

    drawBoard(0);

    const boardMat =
      new THREE.MeshPhysicalMaterial(
        {
          map: boardTexture,
          roughness: 0.25,
          metalness: 0.05,
        }
      );

    // Board is enlarged well past its original footprint — big enough
    // that the label, headline, and full body copy are all comfortably
    // readable at a glance, not just legible up close.
    const BOARD_W = 3.2;
    const BOARD_H = 2.0;

    const boardGeo =
      new THREE.PlaneGeometry(
        BOARD_W,
        BOARD_H
      );

    const boardMesh =
      new THREE.Mesh(
        boardGeo,
        boardMat
      );

    boardMesh.position.y = BOARD_H / 2;

    // Frame
    const frameMat =
      new THREE.MeshPhysicalMaterial(
        {
          color: "#4a3520",
          roughness: 0.85,
          metalness: 0,
        }
      );

    const frameThick = 0.06;

    const frameTop =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          BOARD_W + 0.105,
          frameThick,
          0.07
        ),
        frameMat
      );

    frameTop.position.set(
      0,
      BOARD_H + 0.025,
      0
    );

    const frameBottom =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          BOARD_W + 0.105,
          frameThick,
          0.07
        ),
        frameMat
      );

    frameBottom.position.set(
      0,
      -0.025,
      0
    );

    const frameLeft =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          frameThick,
          BOARD_H + 0.105,
          0.07
        ),
        frameMat
      );

    frameLeft.position.set(
      -(BOARD_W / 2 + 0.0025),
      BOARD_H / 2,
      0
    );

    const frameRight =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          frameThick,
          BOARD_H + 0.105,
          0.07
        ),
        frameMat
      );

    frameRight.position.set(
      BOARD_W / 2 + 0.0025,
      BOARD_H / 2,
      0
      );

    // Post
    const postMat =
      new THREE.MeshPhysicalMaterial(
        {
          color: "#3a2a18",
          roughness: 0.9,
          metalness: 0,
        }
      );

    const post =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.11,
          1.15,
          0.11
        ),
        postMat
      );

    post.position.y = 0.38;
    post.castShadow = true;

    const signGroup =
      new THREE.Group();

    signGroup.add(boardMesh);
    signGroup.add(frameTop);
    signGroup.add(frameBottom);
    signGroup.add(frameLeft);
    signGroup.add(frameRight);
    signGroup.add(post);

    // Positioned near the furniture circle on the left, clearly visible
    // without competing with the tower/bridge for attention.
    signGroup.position.set(
      -5.2,
      -0.5,
      4.0
    );

    signGroup.rotation.y =
      0.55;

    scene.add(signGroup);

    // Camera + board are both static, so the board's on-screen position
    // is constant — project it once (and again on resize) rather than
    // every frame, then draw a curved arrow from that point to the
    // caption text so it's visually clear the caption "belongs" to
    // the sign.
    const boardScreenAnchor = new THREE.Vector3(0, BOARD_H * 0.62, 0);

    function updateArrowPosition() {

      if (!arrowPathRef.current || !wrapperRef.current) return;

      const w = wrapperRef.current.clientWidth;
      const h = wrapperRef.current.clientHeight;

      const worldPos = boardScreenAnchor.clone();
      boardMesh.localToWorld(worldPos);
      worldPos.project(camera);

      const startX = (worldPos.x * 0.5 + 0.5) * w;
      const startY = (-worldPos.y * 0.5 + 0.5) * h;

      const endX = w * 0.5;
      const endY = h * 0.46;

      const midX = (startX + endX) / 2;
      const midY = Math.min(startY, endY) - 60;

      arrowPathRef.current.setAttribute(
        "d",
        `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`
      );

    }

    updateArrowPosition();

    let lastBoardStage = -1;

    //---------------------------------
    // Foundation Block
    //---------------------------------

    const blockMaterial = new THREE.MeshPhysicalMaterial({
      color: "#3D4149",
      metalness: 0.12,
      roughness: 0.65,
      emissive: "#1B1E24",
      emissiveIntensity: 0.05,
    });

    const block = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.22, 1.4),
      blockMaterial
    );

    block.position.set(-3, -0.39, 0);
    block.castShadow = true;
    block.scale.y = 0;

    scene.add(block);

    //---------------------------------
    // Glass Tower
    //---------------------------------

    const facadeTexture = createGlassFacadeTexture(0.18);

    const glassColor = "#d4a060";

    const roofMaterial = new THREE.MeshPhysicalMaterial({
      color: "#173248",
      metalness: 0.45,
      roughness: 0.6,
    });

    const makeGlassMaterial = (
      repeatX: number,
      repeatY: number
    ) => {
      const texture = facadeTexture.clone();

      texture.needsUpdate = true;
      texture.repeat.set(repeatX, repeatY);

      return new THREE.MeshPhysicalMaterial({
        color: glassColor,
        map: texture,
        emissiveMap: texture,
        emissive: new THREE.Color("#ffaa44"),
        emissiveIntensity: 0.12,
        metalness: 0.7,
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.15,
        reflectivity: 0.9,
        envMapIntensity: 1.1,
      });
    };

    type Tier = {
      w: number;
      d: number;
      h: number;
      mesh: THREE.Mesh;
      baseY: number;
    };

    const tierSpecs = [
      { w: 1.55, d: 1.15, h: 1.3 },
      { w: 1.30, d: 0.95, h: 1.0 },
      { w: 1.00, d: 0.75, h: 0.85 },
      { w: 0.70, d: 0.55, h: 0.55 },
      { w: 0.42, d: 0.34, h: 0.40 },
    ];

    const tower: Tier[] = [];

    let cursorY = -0.28;

    tierSpecs.forEach((spec) => {

      const geometry = new THREE.BoxGeometry(
        spec.w,
        spec.h,
        spec.d
      );

      const sideMaterial = makeGlassMaterial(
        spec.w * 1.8,
        spec.h * 1.8
      );

      const mesh = new THREE.Mesh(
        geometry,
        [
          sideMaterial,
          sideMaterial,
          roofMaterial,
          roofMaterial,
          sideMaterial,
          sideMaterial,
        ]
      );

      mesh.castShadow = true;

      mesh.position.set(
        -3,
        cursorY + spec.h / 2,
        0
      );

      mesh.scale.y = 0;

      scene.add(mesh);

      tower.push({
        ...spec,
        mesh,
        baseY: cursorY,
      });

      cursorY += spec.h;
    });

    //---------------------------------
    // Antenna
    //---------------------------------

    const antennaMaterial =
      new THREE.MeshPhysicalMaterial({
        color: "#CBD5E1",
        metalness: 0.9,
        roughness: 0.25,
      });

    const antennaHeight = 0.55;

    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.012,
        0.02,
        antennaHeight,
        8
      ),
      antennaMaterial
    );

    antenna.position.set(
      -3,
      cursorY,
      0
    );

    antenna.scale.y = 0;

    scene.add(antenna);

    //---------------------------------
    // Beacon
    //---------------------------------

    const beaconMaterial =
      new THREE.MeshBasicMaterial({
        color: "#ff2a1f",
        transparent: true,
        opacity: 0,
      });

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.032,
        12,
        12
      ),
      beaconMaterial
    );

    scene.add(beacon);

    const beaconGlowMaterial =
      new THREE.MeshBasicMaterial({
        color: "#ff5544",
        transparent: true,
        opacity: 0,
        blending:
          THREE.AdditiveBlending,
        depthWrite: false,
      });

    const beaconGlow = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.09,
        12,
        12
      ),
      beaconGlowMaterial
    );

    scene.add(beaconGlow);

    const beaconLight =
      new THREE.PointLight(
        0xff3020,
        0,
        1.6
      );

    scene.add(beaconLight);

    //---------------------------------
    // Second Building
    //---------------------------------

    const pillarHeight = 2;

    const pillarGlass =
      makeGlassMaterial(
        0.5 * 1.8,
        pillarHeight * 1.8
      );

    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(
        0.5,
        pillarHeight,
        0.5
      ),
      [
        pillarGlass,
        pillarGlass,
        roofMaterial,
        roofMaterial,
        pillarGlass,
        pillarGlass,
      ]
    );

    pillar.position.set(
      -0.6,
      -0.5 + pillarHeight / 2,
      0
    );

    pillar.castShadow = true;
    pillar.scale.y = 0;

    scene.add(pillar);

    // A touch more glow on the second tower's glass, plus a warm accent
    // light near its top, so this later part of the scene doesn't read
    // as a flat dark block once the bridge connects to it.
    pillarGlass.emissiveIntensity = 0.35;

    const pillarAccentLight = new THREE.PointLight(
      0xffb066,
      0,
      3
    );

    pillarAccentLight.position.set(
      -0.6,
      -0.5 + pillarHeight,
      0
    );

    scene.add(pillarAccentLight);

    //---------------------------------
    // Bridge
    //---------------------------------

    const bridgeStart = new THREE.Vector3(
      -2.28,
      0.15,
      0
    );

    const bridgeEnd = new THREE.Vector3(
      -0.9,
      0.1,
      0
    );

    const bridgeVector =
      new THREE.Vector3().subVectors(
        bridgeEnd,
        bridgeStart
      );

    const bridgeLength =
      bridgeVector.length();

    const bridgeAngle =
      Math.atan2(
        bridgeVector.y,
        bridgeVector.x
      );

    const bridgeCenter =
      new THREE.Vector3()
        .addVectors(
          bridgeStart,
          bridgeEnd
        )
        .multiplyScalar(0.5);

    const bridgeMaterial =
      new THREE.MeshPhysicalMaterial({
        color: "#7A5C4A",
        metalness: 0.7,
        roughness: 0.45,
        transparent: true,
        opacity: 0,
        emissive: "#553322",
        emissiveIntensity: 0.02,
      });

    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(
        bridgeLength,
        0.2,
        0.75
      ),
      bridgeMaterial
    );

    bridge.position.copy(
      bridgeCenter
    );

    bridge.rotation.z =
      bridgeAngle;

    scene.add(bridge);

    //---------------------------------
    // Bridge Rails
    //---------------------------------

    const railMaterial =
      new THREE.MeshPhysicalMaterial({
        color: "#A08060",
        transparent: true,
        opacity: 0,
        roughness: 0.3,
        metalness: 0.6,
      });

    const railOffset =
      new THREE.Vector3(
        0,
        0.16,
        0.3
      );

    const rail1 = new THREE.Mesh(
      new THREE.BoxGeometry(
        bridgeLength * 0.96,
        0.035,
        0.055
      ),
      railMaterial.clone()
    );

    rail1.position
      .copy(bridgeCenter)
      .add(railOffset);

    rail1.position.z = 0.3;

    rail1.rotation.z =
      bridgeAngle;

    scene.add(rail1);

    const rail2 = new THREE.Mesh(
      new THREE.BoxGeometry(
        bridgeLength * 0.96,
        0.035,
        0.055
      ),
      railMaterial.clone()
    );

    rail2.position
      .copy(bridgeCenter)
      .add(new THREE.Vector3(0, 0.16, -0.3));

    rail2.rotation.z =
      bridgeAngle;

    scene.add(rail2);

    //---------------------------------
    // Moving Dots
    //---------------------------------

    const dotGroup =
      new THREE.Group();

    for (let i = 0; i < 6; i++) {

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.03,
          8,
          8
        ),
new THREE.MeshStandardMaterial({
          color: "#D4702A",
          transparent: true,
          opacity: 0,
        })
      );

      dot.position.set(
        (i / 5) * bridgeLength,
        0,
        0
      );

      dotGroup.add(dot);
    }

    dotGroup.position.copy(
      bridgeStart
    );

    dotGroup.rotation.z =
      bridgeAngle;

    scene.add(dotGroup);

    //---------------------------------
    // Floating Particles
    //---------------------------------

    const particleCount = 180;

    const particlePositions =
      new Float32Array(
        particleCount * 3
      );

    for (
      let i = 0;
      i < particleCount;
      i++
    ) {

      particlePositions[i * 3] =
        (Math.random() - 0.5) * 8;

      particlePositions[
        i * 3 + 1
      ] =
        Math.random() * 3;

      particlePositions[
        i * 3 + 2
      ] =
        (Math.random() - 0.5) * 8;
    }

    const particles =
      new THREE.Points(
        new THREE.BufferGeometry()
          .setAttribute(
            "position",
            new THREE.BufferAttribute(
              particlePositions,
              3
            )
          ),
        new THREE.PointsMaterial({
          color: "#d47a3a",
          size: 0.03,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending:
            THREE.AdditiveBlending,
          sizeAttenuation: true,
        })
      );

    scene.add(particles);

    //---------------------------------
    // Golden Dust Motes
    //---------------------------------

    const dustCount = 120;

    const dustPos =
      new Float32Array(
        dustCount * 3
      );

    const dustSpeeds =
      new Float32Array(
        dustCount
      );

    for (let i = 0; i < dustCount; i++) {

      dustPos[i * 3] =
        (Math.random() - 0.5) * 10;

      dustPos[i * 3 + 1] =
        Math.random() * 4;

      dustPos[i * 3 + 2] =
        (Math.random() - 0.5) * 10;

      dustSpeeds[i] =
        0.2 + Math.random() * 0.5;
    }

    const dust =
      new THREE.Points(
        new THREE.BufferGeometry()
          .setAttribute(
            "position",
            new THREE.BufferAttribute(
              dustPos,
              3
            )
          ),
        new THREE.PointsMaterial({
          color: "#ffaa55",
          size: 0.045,
          transparent: true,
          opacity: 0.35,
          depthWrite: false,
          blending:
            THREE.AdditiveBlending,
          sizeAttenuation: true,
        })
      );

    scene.add(dust);

    //---------------------------------
    // Fireflies
    //---------------------------------

    const fireflyCount = 60;
    const ffPos = new Float32Array(fireflyCount * 3);
    const ffSpeeds = new Float32Array(fireflyCount);
    const ffPhases = new Float32Array(fireflyCount);
    for (let i = 0; i < fireflyCount; i++) {
      ffPos[i * 3] = (Math.random() - 0.5) * 12;
      ffPos[i * 3 + 1] = Math.random() * 2.5;
      ffPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      ffSpeeds[i] = 0.3 + Math.random() * 0.6;
      ffPhases[i] = Math.random() * Math.PI * 2;
    }
    const ffGeo = new THREE.BufferGeometry();
    ffGeo.setAttribute("position", new THREE.BufferAttribute(ffPos, 3));

    const ffCanvas = document.createElement("canvas");
    ffCanvas.width = 32;
    ffCanvas.height = 32;
    const ffCtx = ffCanvas.getContext("2d")!;
    const ffG = ffCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    ffG.addColorStop(0, "rgba(220,255,200,1)");
    ffG.addColorStop(0.2, "rgba(200,255,150,0.8)");
    ffG.addColorStop(0.5, "rgba(180,240,100,0.3)");
    ffG.addColorStop(1, "rgba(150,220,50,0)");
    ffCtx.fillStyle = ffG;
    ffCtx.fillRect(0, 0, 32, 32);
    const ffTexture = new THREE.CanvasTexture(ffCanvas);

    const fireflies = new THREE.Points(
      ffGeo,
      new THREE.PointsMaterial({
        size: 0.08,
        map: ffTexture,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })
    );
    scene.add(fireflies);

    //---------------------------------
    // Background Trees
    //---------------------------------

    const trunkMat = new THREE.MeshPhysicalMaterial({ color: "#4a3520", roughness: 1, metalness: 0 });
    const foliageMats = [
      new THREE.MeshPhysicalMaterial({ color: "#1a4a2a", roughness: 0.9, metalness: 0 }),
      new THREE.MeshPhysicalMaterial({ color: "#1a5530", roughness: 0.9, metalness: 0 }),
      new THREE.MeshPhysicalMaterial({ color: "#154025", roughness: 0.9, metalness: 0 }),
      new THREE.MeshPhysicalMaterial({ color: "#0f4a20", roughness: 0.9, metalness: 0 }),
    ];

    function makeTree(x: number, z: number, h: number) {
      const trunkH = h * 0.3;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.05, trunkH, 6), trunkMat);
      trunk.position.set(x, -0.5 + trunkH / 2, z);
      trunk.castShadow = true;
      scene.add(trunk);

      const tiers = 2 + Math.floor(Math.random() * 2);
      for (let t = 0; t < tiers; t++) {
        const tH = h * (0.35 - t * 0.08);
        const tW = h * (0.28 - t * 0.05);
        const tY = -0.5 + trunkH + t * (h * 0.22) + tH / 2;
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(tW, tH, 6),
          foliageMats[t % foliageMats.length]
        );
        cone.position.set(x + (Math.random() - 0.5) * 0.04, tY, z + (Math.random() - 0.5) * 0.04);
        cone.castShadow = true;
        scene.add(cone);
      }
    }

    // Trees scattered in background — behind buildings and at edges
    const treePositions: [number, number, number][] = [
      [-2.0, -3.0, 0.5], [-4.5, -3.2, 0.7], [-1.0, -3.5, 0.6],
      [-6.0, -2.0, 0.45], [0.5, -4.0, 0.55], [3.0, -3.5, 0.5],
      [5.5, -1.5, 0.4], [6.5, -4.5, 0.7],
      [-8.0, -2.5, 0.5], [-9.0, -3.8, 0.6],
    ];
    treePositions.forEach(([tx, tz, th]) => makeTree(tx, tz, th));

    //---------------------------------
    // Bushes
    //---------------------------------

    const bushMat = new THREE.MeshPhysicalMaterial({ color: "#1a4a2a", roughness: 0.95, metalness: 0 });
    const bushMatLight = new THREE.MeshPhysicalMaterial({ color: "#2a5a3a", roughness: 0.95, metalness: 0 });

    function makeBush(x: number, z: number, size: number) {
      const g = new THREE.Group();
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const s = size * (0.5 + Math.random() * 0.5);
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(s, 7, 7),
          i % 2 === 0 ? bushMat : bushMatLight,
        );
        puff.position.set((Math.random() - 0.5) * size * 1.2, s * 0.8, (Math.random() - 0.5) * size * 1.2);
        puff.castShadow = true;
        puff.receiveShadow = true;
        g.add(puff);
      }
      g.position.set(x, -0.5, z);
      scene.add(g);
    }

    const bushPositions: [number, number, number][] = [
      [-3.5, 4.0, 0.25], [2.0, 4.5, 0.2], [-7.0, 1.0, 0.3],
      [4.5, 2.5, 0.2], [-2.0, 5.5, 0.25], [7.0, 3.0, 0.2],
      [-8.5, 4.0, 0.3], [3.5, -1.0, 0.2], [5.5, -2.5, 0.25],
      [-4.5, -2.5, 0.2], [-1.5, 2.5, 0.15], [6.0, 1.0, 0.25],
    ];
    bushPositions.forEach(([bx, bz, bs]) => makeBush(bx, bz, bs));

    const cloudMat = new THREE.MeshPhysicalMaterial({
      color: "#2a3a4a", roughness: 0.8, metalness: 0, transparent: true, opacity: 0.25,
    });
    const cloudMatLight = new THREE.MeshPhysicalMaterial({
      color: "#3a4a5a", roughness: 0.8, metalness: 0, transparent: true, opacity: 0.15,
    });

    function makeCloud(cx: number, cy: number, cz: number, spread: number) {
      const cloud = new THREE.Group();
      const count = 5 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(spread * (0.3 + Math.random() * 0.5), 7, 7),
          i % 2 === 0 ? cloudMat : cloudMatLight,
        );
        puff.position.set(
          (Math.random() - 0.5) * spread * 2.5,
          (Math.random() - 0.5) * spread * 0.4,
          (Math.random() - 0.5) * spread * 1.5,
        );
        cloud.add(puff);
      }
      cloud.position.set(cx, cy, cz);
      scene.add(cloud);
    }

    makeCloud(-5, 4.5, -6, 1.2);
    makeCloud(2, 5.0, -7, 1.5);
    makeCloud(7, 4.0, -5, 1.0);
    makeCloud(-3, 5.8, -8, 1.8);
    makeCloud(5, 3.5, -4, 0.8);

    //---------------------------------
    // Birds
    //---------------------------------

    const birdMat = new THREE.MeshBasicMaterial({ color: 0x1a2a3a, side: THREE.DoubleSide, depthWrite: false });

    function makeBird(x: number, y: number, z: number, scale: number) {
      const g = new THREE.Group();
      const wingGeo = new THREE.BufferGeometry();
      const wingVerts = new Float32Array([
        0, 0, 0,  -0.15, 0.04, 0.08,  -0.15, -0.04, 0.08,
        0, 0, 0,  -0.15, -0.04, -0.08,  -0.15, 0.04, -0.08,
      ]);
      wingGeo.setAttribute("position", new THREE.BufferAttribute(wingVerts, 3));
      const leftWing = new THREE.Mesh(wingGeo, birdMat);
      leftWing.scale.set(scale, scale, scale);
      g.add(leftWing);
      const rightWing = leftWing.clone();
      rightWing.scale.x = -scale;
      g.add(rightWing);
      g.position.set(x, y, z);
      return g;
    }

    const birdGroup = new THREE.Group();
    const birdFormations: [number, number, number, number][] = [
      [-2, 4.0, -3, 0.8], [-1.2, 4.2, -3.2, 0.7], [-0.4, 4.1, -2.8, 0.6],
      [0.5, 4.3, -3.1, 0.5], [1.2, 4.0, -2.9, 0.5],
    ];
    birdFormations.forEach(([bx, by, bz, bs]) => {
      birdGroup.add(makeBird(bx, by, bz, bs));
    });
    scene.add(birdGroup);

    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext("2d")!;
    sCtx.fillStyle = "rgba(0,0,0,0)";
    sCtx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 5; i++) {
      const cx = 20 + Math.random() * 88;
      const cy = 20 + Math.random() * 88;
      const r = 15 + Math.random() * 30;
      const g = sCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "rgba(0,0,0,0.5)");
      g.addColorStop(0.5, "rgba(0,0,0,0.2)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      sCtx.fillStyle = g;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      blending: THREE.MultiplyBlending,
    });
    const cloudShadow = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), shadowMat);
    cloudShadow.rotation.x = -Math.PI / 2;
    cloudShadow.position.set(0, -0.47, 0);
    scene.add(cloudShadow);

    //---------------------------------
    // Distant City Skyline
    //---------------------------------

    const buildingColors = ["#2a3040", "#354050", "#1e2a3a", "#3a4555", "#252e3e", "#404a5a", "#2f3848"];
    const bMat = (c: string) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.9, metalness: 0 });

    function makeBuilding(x: number, z: number, w: number, h: number, d: number, color: string) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bMat(color));
      m.position.set(x, -0.5 + h / 2, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
    }

    // Row 1 — closer, slightly larger
    const skyline1: [number, number, number, number][] = [
      [-7, -4, 0.8, 1.2], [-5.5, -4.2, 0.6, 0.9], [-4, -3.8, 0.5, 1.5],
      [-2.5, -4.5, 0.7, 1.0], [-1, -4, 0.5, 1.8], [0.5, -4.3, 0.6, 1.1],
      [2, -3.9, 0.7, 1.6], [3.5, -4.4, 0.5, 0.8], [5, -4, 0.8, 1.4],
      [6.5, -4.2, 0.5, 1.0], [8, -3.8, 0.7, 1.3],
    ];
    skyline1.forEach(([bx, bz, bw, bh], i) => {
      makeBuilding(bx, bz, bw, bh, bw * 0.7, buildingColors[i % buildingColors.length]);
    });

    // Row 2 — further back, smaller, darker
    const skyline2: [number, number, number, number][] = [
      [-8.5, -6, 0.6, 1.0], [-6.5, -6.3, 0.5, 1.4], [-4.5, -5.8, 0.5, 0.8],
      [-3, -6.2, 0.6, 1.6], [-1.5, -5.9, 0.4, 0.9], [0, -6.4, 0.5, 2.0],
      [1.5, -6, 0.6, 1.2], [3, -6.3, 0.4, 0.7], [4.5, -5.9, 0.5, 1.5],
      [6, -6.2, 0.6, 0.9], [7.5, -5.8, 0.5, 1.1], [9, -6.1, 0.5, 1.3],
    ];
    skyline2.forEach(([bx, bz, bw, bh], i) => {
      const c = new THREE.Color(buildingColors[i % buildingColors.length]);
      c.multiplyScalar(0.55);
      makeBuilding(bx, bz, bw, bh, bw * 0.6, "#" + c.getHexString());
    });

    // A few taller landmark buildings
    makeBuilding(-3.5, -5.0, 0.5, 2.4, 0.5, "#1a2535");
    makeBuilding(1.5, -5.2, 0.5, 2.8, 0.5, "#1a2535");
    makeBuilding(5.5, -5.0, 0.5, 2.2, 0.5, "#1a2535");

    //---------------------------------
    // Rolling Hills
    //---------------------------------

    function makeHill(cx: number, cz: number, radius: number, height: number) {
      const seg = 16;
      const geo = new THREE.CircleGeometry(radius, seg);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const dist = Math.sqrt(x * x + y * y);
        const t = 1 - dist / radius;
        pos.setZ(i, t > 0 ? Math.sin(t * Math.PI) * height : 0);
      }
      geo.computeVertexNormals();
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x1a3a1a,
        roughness: 0.95,
        metalness: 0,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const hill = new THREE.Mesh(geo, mat);
      hill.position.set(cx, -0.5, cz);
      hill.receiveShadow = true;
      scene.add(hill);
    }

    makeHill(-6, -5.5, 3, 0.5);
    makeHill(0, -6.0, 4, 0.6);
    makeHill(6, -5.5, 3.5, 0.4);
    makeHill(-3, -7.0, 3, 0.3);
    makeHill(3, -7.0, 2.5, 0.35);

    //---------------------------------
    // Animation
    //---------------------------------

    let currentProgress = 0;
    let animationId = 0;

    const clock =
      new THREE.Clock();

    const st =
      ScrollTrigger.create({
        trigger: sectionRef.current,
        // "top top" → "bottom bottom" is the exact scroll distance during
        // which the inner viewport is pinned in place. Previously this was
        // "top bottom" → "bottom top", a much longer span that ran ahead
        // of and behind the pinned window — so the whole build/caption
        // sequence could start or finish while the section was still
        // scrolling normally, before or after it was actually stuck.
        // Matching the range to the pin means progress 0 → 1 now spans
        // precisely the time the section is held in place.
        start: "top top",
        end: "bottom bottom",
        scrub: 2,
        // Pin the inner viewport directly via GSAP (a transform-driven
        // fixed position) instead of relying only on CSS `position:
        // sticky`. Sticky can silently stop working if any ancestor has
        // overflow, a transform, or a filter on it — a real risk on a
        // page full of animated/transformed elements — which would let
        // the section scroll away mid-animation. The GSAP pin is
        // guaranteed to hold it until the scroll range above completes.
        pin: pinRef.current,
        pinSpacing: false,
        anticipatePin: 1,

        onUpdate: (self) => {

          currentProgress = self.progress;

          const p = self.progress;

          // Caption timing is intentionally uneven and decoupled from the
          // 3D build progress below: nothing shows the instant scrolling
          // starts, the first caption gets a long hold, the middle one is
          // a short beat, and the last caption gets a long hold that
          // carries through to the end.
          //           first            middle        last
          //   0 ────────────────────────────────────────── 1
          //      [gap] [====long====] [=short=] [====long====]
          const captionWindows = [
            { start: 0.05, end: 0.36 }, // first — long hold
            { start: 0.42, end: 0.58 }, // middle — short hold
            { start: 0.64, end: 1.0 },  // last — long hold
          ];

          const stageVisibility = captionWindows.map(
            ({ start, end }, index) => {

              const isLast = index === captionWindows.length - 1;

              const fade = Math.min(
                0.06,
                (end - start) * 0.35
              );

              if (p < start) return 0;

              if (p < start + fade) {
                return (p - start) / fade;
              }

              if (isLast) return 1;

              if (p < end - fade) return 1;

              if (p < end) {
                return 1 - (p - (end - fade)) / fade;
              }

              return 0;

            }
          );

          stageRefs.current.forEach(
            (element, index) => {

              if (!element) return;

              const sp =
                stageVisibility[
                  index
                ] ?? 0;

              element.style.opacity =
                String(sp);

              element.style.transform =
                `translateY(${
                  (1 - sp) * 36
                }px)`;

            }
          );

          // The connector arrow only appears while a caption is actually
          // showing, and fades with whichever one is most visible.
          if (arrowSvgRef.current) {

            const maxVisibility = Math.max(
              0,
              ...stageVisibility
            );

            arrowSvgRef.current.style.opacity =
              String(maxVisibility * 0.85);

          }

          const activeStage =
            Math.min(
              Math.floor(
                p * stages.length
              ),
              stages.length - 1
            );

          if (
            activeStage !==
            lastBoardStage
          ) {

            lastBoardStage =
              activeStage;

            drawBoard(activeStage);

            // Kick the glitch pulse whenever the signboard content
            // changes — it decays back out in the render loop.
            glitchPulse = 1;

          }

        },

      });

    //---------------------------------
    // Resize
    //---------------------------------

    const onResize = () => {

      const width =
        wrapper.clientWidth;

      const height =
        wrapper.clientHeight;

      camera.aspect =
        width / height;

      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        height
      );

      composer.setSize(
        width,
        height
      );

      updateArrowPosition();

    };

    window.addEventListener(
      "resize",
      onResize
    );

    //---------------------------------
    // Render Loop
    //---------------------------------

    const animate = () => {

      const time =
        clock.getElapsedTime();

      const progress =
        currentProgress;

      //---------------------------------
      // Camera — subtle orbit + dolly during scroll
      //---------------------------------

      const camP = THREE.MathUtils.clamp(progress, 0, 1);
      const camSmooth = camP < 0.5 ? 2 * camP * camP : 1 - Math.pow(-2 * camP + 2, 2) / 2;
      camera.position.x = CAM_INIT.x + camSmooth * 2.5;
      camera.position.y = CAM_INIT.y + camSmooth * 0.6;
      camera.position.z = CAM_INIT.z - camSmooth * 3.5;
      CAM_TARGET.y = 1.7 + camSmooth * 0.8;
      camera.lookAt(CAM_TARGET);

      //---------------------------------
      // Sun — sets behind hills during scroll (day → sunset)
      //---------------------------------

      const sunTravel = THREE.MathUtils.clamp(progress * 1.2, 0, 1);
      const sunEased = sunTravel < 0.5 ? 2 * sunTravel * sunTravel : 1 - Math.pow(-2 * sunTravel + 2, 2) / 2;
      sun.position.y = 5 - sunEased * 5.2;
      sun.position.x = -4 - sunEased * 3;
      sun.position.z = -5 - sunEased * 5;
      sun.color.setHSL(0.08 - sunEased * 0.03, 0.8, 0.55 + sunEased * 0.15);
      sun.intensity = 0.4 - sunEased * 0.3;

      sunRim.position.y = 3 - sunEased * 2.9;
      sunRim.color.setHSL(0.07 - sunEased * 0.025, 0.9, 0.5 + sunEased * 0.2);
      sunRim.intensity = 0.25 - sunEased * 0.2;

      fill.color.setHSL(0.1 - sunEased * 0.02, 0.6, 0.6 + sunEased * 0.1);
      fill.intensity = 0.35 - sunEased * 0.25;

      // Sun sphere follows the directional light
      sunSphere.position.copy(sun.position);
      sunIconSprite.position.copy(sun.position);
      sunPoint.position.copy(sun.position);
      haloSprite.position.copy(sun.position);
      const sunCol = new THREE.Color().setHSL(0.08 - sunEased * 0.03, 0.8, 0.55 + sunEased * 0.15);
      sunSphereMat.emissive.copy(sunCol);
      sunSphereMat.color.copy(sunCol);

      // Fade out sprite and halo when sun drops behind hills
      const aboveHorizon = THREE.MathUtils.clamp((sun.position.y + 0.5) / 1, 0, 1);
      sunIconSprite.material.opacity = aboveHorizon;
      haloSprite.material.opacity = aboveHorizon;

      //---------------------------------
      // Foundation
      //---------------------------------

      const foundationProgress =
        THREE.MathUtils.clamp(
          progress / 0.3,
          0,
          1
        );

      block.scale.y =
        Math.max(
          foundationProgress,
          0.001
        );

      block.position.y =
        -0.5 +
        (0.22 * block.scale.y) / 2;

      //---------------------------------
      // Tower
      //---------------------------------

      const towerProgress =
        THREE.MathUtils.clamp(
          (progress - 0.25) / 0.3,
          0,
          1
        );

      const easeBounce = (t: number) => {
        if (t <= 0) return 0;
        if (t >= 1) return 1;
        const c = 1.12;
        if (t < 0.5) {
          const v = 2 * t;
          return (v * v * ((c + 1) * v - c)) / 2;
        } else {
          const v = 2 * t - 2;
          return (v * v * ((c + 1) * v + c) + 2) / 2;
        }
      };

      tower.forEach(
        (tier, index) => {
          const raw = THREE.MathUtils.clamp(
            towerProgress * 1.6 -
              index * 0.15,
            0,
            1
          );
          const scale = easeBounce(raw);
          tier.mesh.scale.y =
            scale;

          (
            tier.mesh.material as THREE.MeshPhysicalMaterial[]
          ).forEach((material) => {

            material.emissiveIntensity =
              0.12 +
              Math.sin(
                time * 1.5 +
                  index * 2.1
              ) *
                0.05 +
              scale * 0.08;

          });

        }
      );

      const topScale =
        tower.length
          ? THREE.MathUtils.clamp(
              towerProgress * 1.6 -
                (tower.length - 1) *
                  0.15,
              0,
              1
            )
          : 0;

      antenna.scale.y =
        topScale;

      const blink =
        topScale > 0.05
          ? Math.sin(time * 4) >
            0.2
            ? 1
            : 0.15
          : 0;

      (
        beacon.material as THREE.MeshBasicMaterial
      ).opacity = blink;

      beaconGlowMaterial.opacity =
        blink * 0.5;

      beaconLight.intensity =
        blink * 2.2;

      const beaconY =
        cursorY +
        antennaHeight *
          topScale;

      beacon.position.set(
        -3,
        beaconY,
        0
      );

      beaconGlow.position.set(
        -3,
        beaconY,
        0
      );

      beaconLight.position.set(
        -3,
        beaconY,
        0
      );

      //---------------------------------
      // Second Building
      //---------------------------------

      const bridgeProgress =
        THREE.MathUtils.clamp(
          (progress - 0.55) / 0.3,
          0,
          1
        );

      pillar.scale.y =
        Math.max(
          easeBounce(bridgeProgress),
          0.001
        );

      pillar.position.y =
        -0.5 +
        (pillarHeight *
          pillar.scale.y) /
          2;

      pillarAccentLight.intensity =
        bridgeProgress * 1.4;

      //---------------------------------
      // Bridge
      //---------------------------------

      bridge.material.opacity =
        bridgeProgress;
      bridgeMaterial.opacity =
        bridgeProgress;
      bridge.scale.x = bridgeProgress > 0.01 ? Math.min(bridgeProgress * 1.15, 1) : 0.001;

      //---------------------------------
      // Rails
      //---------------------------------

      railMaterial.opacity =
        bridgeProgress;

      (
        rail1.material as THREE.Material
      ).opacity = bridgeProgress;

      (
        rail2.material as THREE.Material
      ).opacity = bridgeProgress;

      //---------------------------------
      // Moving Dots
      //---------------------------------

      dotGroup.children.forEach(
        (dot, i) => {

          const dotMesh =
            dot as THREE.Mesh;

          (
            dotMesh.material as THREE.MeshBasicMaterial
          ).opacity =
            bridgeProgress;

          const t =
            (time * 0.4 +
              i / 5) %
            1;

          dotMesh.position.x =
            t * bridgeLength;
        }
      );

      //---------------------------------
      // Particles
      //---------------------------------

      (
        particles.material as THREE.PointsMaterial
      ).opacity =
        bridgeProgress * 0.6;

      //---------------------------------
      // Dust Motes
      //---------------------------------

      const dustPositions =
        dust.geometry.attributes
          .position;

      for (let i = 0; i < dustCount; i++) {

        dustPositions.array[
          i * 3 + 1
        ] +=
          Math.sin(
            time * dustSpeeds[i] +
              i
          ) * 0.0008;

        dustPositions.array[
          i * 3
        ] +=
          Math.cos(
            time * dustSpeeds[i] *
              0.7 +
              i * 0.5
          ) * 0.0004;

        if (
          dustPositions.array[
            i * 3 + 1
          ] > 4
        ) {

          dustPositions.array[
            i * 3 + 1
          ] = 0;

        }

        if (
          dustPositions.array[
            i * 3 + 1
          ] < 0
        ) {

          dustPositions.array[
            i * 3 + 1
          ] = 4;

        }
      }

      dustPositions.needsUpdate =
        true;

      //---------------------------------
      // Sun shimmer
      //---------------------------------

      sunSprite.scale.setScalar(
        6.5 + Math.sin(time * 0.6) * 0.2
      );

      sunSpriteMaterial.rotation =
        time * 0.045;

      //---------------------------------
      // Color grade + glitch pulse decay
      //---------------------------------

      grassTimeUniform.value = time;

      // Cloud shadow drift
      cloudShadow.position.x = Math.sin(time * 0.06 + 1.2) * 4;
      cloudShadow.position.z = Math.cos(time * 0.05 + 0.7) * 3 - 1;
      cloudShadow.material.opacity = 0.06 + Math.sin(time * 0.04) * 0.02;

      // Fireflies — emerge during golden hour (second half of scroll)
      const ffVisibility = THREE.MathUtils.clamp((progress - 0.45) / 0.35, 0, 1);
      const fireflyMaterial = fireflies.material as THREE.PointsMaterial;
      fireflyMaterial.opacity = ffVisibility * 0.7;
      const ffPosAttr = fireflies.geometry.attributes.position;
      for (let i = 0; i < fireflyCount; i++) {
        const i3 = i * 3;
        ffPosAttr.array[i3] += Math.sin(time * ffSpeeds[i] + ffPhases[i]) * 0.003;
        ffPosAttr.array[i3 + 1] += Math.sin(time * ffSpeeds[i] * 0.7 + ffPhases[i] * 1.3) * 0.002;
        ffPosAttr.array[i3 + 2] += Math.cos(time * ffSpeeds[i] * 0.8 + ffPhases[i] * 0.9) * 0.003;
        // gentle boundary push
        if (ffPosAttr.array[i3] > 6) ffPosAttr.array[i3] = -6;
        if (ffPosAttr.array[i3] < -6) ffPosAttr.array[i3] = 6;
        if (ffPosAttr.array[i3 + 1] > 2.5) ffPosAttr.array[i3 + 1] = 0;
        if (ffPosAttr.array[i3 + 1] < 0) ffPosAttr.array[i3 + 1] = 2.5;
        if (ffPosAttr.array[i3 + 2] > 5) ffPosAttr.array[i3 + 2] = -5;
        if (ffPosAttr.array[i3 + 2] < -5) ffPosAttr.array[i3 + 2] = 5;
      }
      ffPosAttr.needsUpdate = true;

      // Birds — slow circle in the sky
      const birdRadius = 3.2;
      const birdSpeed = 0.04;
      birdGroup.position.x = Math.sin(time * birdSpeed) * birdRadius;
      birdGroup.position.z = -3 + Math.cos(time * birdSpeed * 0.8) * birdRadius * 0.5;
      // Gentle banking
      birdGroup.rotation.z = Math.sin(time * birdSpeed * 1.3) * 0.06;

      glitchPulse *= 0.9;

      applyBoardGlitch(glitchPulse);

      colorGradePass.uniforms.uTime.value = time;
      // A slightly stronger whisper of the full-screen effect — the main
      // glitch payoff still lives on the signboard itself.
      colorGradePass.uniforms.uGlitch.value = glitchPulse * 0.32;

      // Warm the grade up as we move past the grass/foundation section
      // into the tower + bridge finale, for a richer golden-hour finish.
      colorGradePass.uniforms.uWarmBoost.value =
        THREE.MathUtils.clamp((progress - 0.35) / 0.5, 0, 1) * 1.0;

      // Darkness falls as the sun sets behind the hills
      colorGradePass.uniforms.uDarkness.value =
        THREE.MathUtils.clamp((progress - 0.4) / 0.6, 0, 1) * 0.65;

      // Fog darkens and thickens as night falls
      const nightFactor = THREE.MathUtils.clamp((progress - 0.5) / 0.5, 0, 1);
      (scene.fog as THREE.FogExp2).color.setHSL(0.08 - nightFactor * 0.06, 0.5 - nightFactor * 0.4, 0.4 - nightFactor * 0.3);
      (scene.fog as THREE.FogExp2).density = 0.014 + nightFactor * 0.012;

      //---------------------------------
      // Render
      //---------------------------------

      composer.render();

      animationId =
        requestAnimationFrame(
          animate
        );

    };

    animationId =
      requestAnimationFrame(
        animate
      );

    //---------------------------------
    // Cleanup
    //---------------------------------

    return () => {

      cancelAnimationFrame(
        animationId
      );

      st.kill();

      window.removeEventListener(
        "resize",
        onResize
      );

      scene.traverse((child) => {

        if (child instanceof THREE.Mesh) {

          child.geometry.dispose();

          if (
            Array.isArray(
              child.material
            )
          ) {

            child.material.forEach(
              (material) => {
                disposeMaterial(
                  material
                );
              }
            );

          } else {

            disposeMaterial(
              child.material
            );

          }

        }

      });

      boardTexture.dispose();

      sunburstTexture.dispose();

      composer.dispose();

      renderer.dispose();

      function disposeMaterial(
        material: THREE.Material
      ) {

        const m =
          material as THREE.MeshPhysicalMaterial;

        if (m.map) {
          m.map.dispose();
        }

        if (m.emissiveMap) {
          m.emissiveMap.dispose();
        }

        material.dispose();

      }

    };

  }, []);

  return (
    <section
      ref={sectionRef}
      id="stacked"
      className="relative min-h-[300vh]"
    >
      <div ref={pinRef} className="relative top-0 h-screen w-full overflow-hidden">

        {/* Full-screen 3D canvas */}
        <div
          ref={wrapperRef}
          className="absolute inset-0"
        >

          <canvas
            ref={canvasRef}
            className="size-full"
          />

        </div>

        {/* Text overlay — synced with building growth */}
        <div className="pointer-events-none absolute inset-0 z-10">

          {stages.map((stage, index) => (

            <div
              key={index}
              ref={(el) => {
                stageRefs.current[index] = el;
              }}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: 0,
              }}
            >

              <div className="flex w-full max-w-2xl flex-col items-center px-8 text-center md:px-12 lg:px-16" style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: '1rem', borderRadius: '0.5rem' }}>

                <div className="mb-4 flex items-center gap-3 md:mb-5">

                  <span
                    className="block h-px w-7"
                    style={{
                      background: stage.color,
                    }}
                  />

                  <span
                    className="text-xs font-semibold uppercase tracking-[0.22em]"
                    style={{
                      color: "#FFFFFF",
                      textShadow: "0 0 6px #000",
                    }}
                  >
                    {stage.label}
                  </span>

                </div>

                <h2
                  className="text-[2rem] font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-[3.25rem]"
style={{
                      color: "#FFFFFF",
                      letterSpacing: "-0.015em",
                      textShadow: "0 0 6px #000",
                    }}
                >
                  {stage.heading}
                </h2>

                <p
                  className="mx-auto mt-4 max-w-md text-[15px] leading-[1.75] md:mt-5 md:text-lg md:leading-[1.75]"
style={{
                      color: "#9AA7B8",
                      textShadow: "0 0 4px #000",
                    }}
                >
                  {stage.body}
                </p>

              </div>

            </div>

          ))}

        </div>

        {/* Connector arrow — points from the physical 3D signboard to the
            caption text, making it visually obvious the caption is being
            "read off" the board. */}
        <svg
          ref={arrowSvgRef}
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          style={{ opacity: 0 }}
        >
          <defs>
            <marker
              id="signArrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="4"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 Z" fill="#D4702A" />
            </marker>
          </defs>
          <path
            ref={arrowPathRef}
            d=""
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={1.5}
            strokeDasharray="6 5"
            markerEnd="url(#signArrowhead)"
          />
        </svg>

      </div>
    </section>
  );
}