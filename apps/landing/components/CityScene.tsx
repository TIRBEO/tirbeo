"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

const GRID = 24;
const SPACING = 2.8;
const BUILDING_COUNT = GRID * GRID;

function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return h ^ (h >> 16);
}

function seededRandom(x: number, y: number): number {
  return (hash(x, y) & 0x7fffffff) / 0x7fffffff;
}

export function CityScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.012);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
    camera.position.set(25, 18, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // Scene background
    scene.background = new THREE.Color(0x0a0a0f);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(140, 140);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d12,
      roughness: 1,
      metalness: 0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    // Grid lines
    const gridHelper = new THREE.GridHelper(120, 60, 0x1a1a2e, 0x111122);
    gridHelper.position.y = -0.45;
    scene.add(gridHelper);

    // --- Buildings ---
    const dummy = new THREE.Object3D();

    // Building meshes (variety of sizes)
    const buildingGeo1 = new THREE.BoxGeometry(1, 1, 1);
    const buildingGeo2 = new THREE.BoxGeometry(0.8, 1, 0.8);
    const buildingGeo3 = new THREE.BoxGeometry(1.2, 1, 1.2);

    const colors = [
      new THREE.Color(0x1a1a2e),
      new THREE.Color(0x16213e),
      new THREE.Color(0x0f3460),
      new THREE.Color(0x1b1b3a),
      new THREE.Color(0x201547),
      new THREE.Color(0x2d1b69),
      new THREE.Color(0x1c1c3a),
      new THREE.Color(0x151530),
    ];

    const buildingMat = new THREE.MeshStandardMaterial({
      roughness: 0.6,
      metalness: 0.3,
    });

    const geometries = [buildingGeo1, buildingGeo2, buildingGeo3];
    const meshes: THREE.Mesh[] = [];

    const offset = (GRID * SPACING) / 2;

    for (let ix = 0; ix < GRID; ix++) {
      for (let iz = 0; iz < GRID; iz++) {
        const r = seededRandom(ix, iz);
        const height = Math.max(0.5, Math.pow(r, 1.5) * 14 + 1);
        const geoIndex = Math.floor(r * 3) % 3;
        const geo = geometries[geoIndex];
        const color = colors[Math.floor(r * colors.length) % colors.length];

        const mat = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.5 + r * 0.4,
          metalness: 0.2 + r * 0.3,
        });

        const mesh = new THREE.Mesh(geo, mat);
        const scaleX = 0.8 + r * 0.6;
        const scaleZ = 0.8 + seededRandom(ix + 100, iz + 100) * 0.6;
        mesh.scale.set(scaleX, height, scaleZ);

        const xPos = ix * SPACING - offset + (seededRandom(ix + 50, iz) - 0.5) * 0.5;
        const zPos = iz * SPACING - offset + (seededRandom(ix, iz + 50) - 0.5) * 0.5;
        mesh.position.set(xPos, height / 2 - 0.5, zPos);

        // Slight random rotation
        mesh.rotation.y = Math.floor(r * 4) * (Math.PI / 2);

        scene.add(mesh);
        meshes.push(mesh);

        // --- Windows (emissive small boxes on front face) ---
        if (height > 1.5 && r > 0.2) {
          const windowMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xff9944),
            emissive: new THREE.Color(0xff6633),
            emissiveIntensity: 0.3 + r * 0.5,
          });
          const windowCount = Math.floor(Math.min(height, 8) * 0.6);
          for (let wi = 0; wi < windowCount; wi++) {
            const wy = (wi + 0.5) / windowCount * height - height / 2 + 0.3;
            const wx = (seededRandom(ix + wi * 7, iz) - 0.5) * scaleX * 0.6;

            if (Math.abs(wx) < 0.2) continue;

            const win = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.2), windowMat);
            win.position.set(
              xPos + wx,
              wy,
              zPos + scaleZ / 2 + 0.01
            );
            scene.add(win);
          }
        }
      }
    }

    // --- Ambient particles (distant city lights / stars) ---
    const particleCount = 600;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.3;
      const radius = 50 + Math.random() * 40;
      positions[i * 3] = Math.cos(theta) * Math.sin(phi) * radius;
      positions[i * 3 + 1] = Math.cos(phi) * radius * 0.3 + 10;
      positions[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * radius;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x4488ff,
      size: 0.4,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0x222244, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xff8844, 0.6);
    dirLight.position.set(-20, 30, 20);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x4466ff, 0.2);
    fillLight.position.set(20, 10, -20);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x8844ff, 0.15);
    rimLight.position.set(0, -10, -30);
    scene.add(rimLight);

    // --- Animation ---
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const onMouse = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMouse);

    const baseCamPos = new THREE.Vector3(25, 18, 30);
    let scrollY = 0;

    const onScroll = () => {
      const hero = mount.closest('section');
      if (hero) {
        const rect = hero.getBoundingClientRect();
        scrollY = Math.max(0, Math.min(1, -rect.top / rect.height));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    let animId = 0;

    function frame() {
      mouseX += (targetMouseX - mouseX) * 0.03;
      mouseY += (targetMouseY - mouseY) * 0.03;

      // Orbit
      const angle = Date.now() * 0.00005 + mouseX * 0.3;
      const radius = 30 + scrollY * 25;
      const height = 18 + scrollY * 15 - mouseY * 3;

      camera.position.x = Math.cos(angle) * radius;
      camera.position.z = Math.sin(angle) * radius;
      camera.position.y = height;
      camera.lookAt(0, -1 + scrollY * 2, 0);

      // Fade fog with scroll
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.density = 0.012 + scrollY * 0.008;
      }

      particles.rotation.y += 0.0001;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(frame);
    }
    frame();

    // Resize
    const ro = new ResizeObserver(() => {
      const w2 = mount.clientWidth;
      const h2 = mount.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} className="absolute inset-0 h-full w-full" style={{ zIndex: 0 }} />
  );
}
