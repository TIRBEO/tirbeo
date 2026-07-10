"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

const GRID = 24;
const SPACING = 2.8;

function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return h ^ (h >> 16);
}
function seededRandom(x: number, y: number): number {
  return (hash(x, y) & 0x7fffffff) / 0x7fffffff;
}

function getScrollProgress() {
  const doc = document.documentElement;
  const total = doc.scrollHeight - window.innerHeight;
  return total > 0 ? Math.min(1, window.scrollY / total) : 0;
}

export function CityScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.015);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    scene.background = new THREE.Color(0x0a0a0f);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 140),
      new THREE.MeshStandardMaterial({ color: 0x0d0d12, roughness: 1, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    // Grid
    const grid = new THREE.GridHelper(120, 60, 0x1a1a2e, 0x111122);
    grid.position.y = -0.45;
    scene.add(grid);

    // Buildings
    const offset = (GRID * SPACING) / 2;
    const colors = [0x1a1a2e, 0x16213e, 0x0f3460, 0x1b1b3a, 0x201547, 0x2d1b69, 0x1c1c3a, 0x151530];
    const geos = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.BoxGeometry(0.8, 1, 0.8),
      new THREE.BoxGeometry(1.2, 1, 1.2),
    ];

    for (let ix = 0; ix < GRID; ix++) {
      for (let iz = 0; iz < GRID; iz++) {
        const r = seededRandom(ix, iz);
        const height = Math.max(0.5, Math.pow(r, 1.5) * 14 + 1);
        const geo = geos[Math.floor(r * 3) % 3];
        const c = colors[Math.floor(r * colors.length) % colors.length];

        const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
          color: c, roughness: 0.5 + r * 0.4, metalness: 0.2 + r * 0.3,
        }));

        const sx = 0.8 + r * 0.6;
        const sz = 0.8 + seededRandom(ix + 100, iz + 100) * 0.6;
        mesh.scale.set(sx, height, sz);

        mesh.position.set(
          ix * SPACING - offset + (seededRandom(ix + 50, iz) - 0.5) * 0.5,
          height / 2 - 0.5,
          iz * SPACING - offset + (seededRandom(ix, iz + 50) - 0.5) * 0.5,
        );
        mesh.rotation.y = Math.floor(r * 4) * (Math.PI / 2);
        scene.add(mesh);

        // Windows
        if (height > 1.5 && r > 0.2) {
          const wMat = new THREE.MeshStandardMaterial({
            color: 0xff9944, emissive: 0xff6633, emissiveIntensity: 0.3 + r * 0.5,
          });
          const wc = Math.floor(Math.min(height, 8) * 0.6);
          for (let wi = 0; wi < wc; wi++) {
            const wy = (wi + 0.5) / wc * height - height / 2 + 0.3;
            const wx = (seededRandom(ix + wi * 7, iz) - 0.5) * sx * 0.6;
            if (Math.abs(wx) < 0.2) continue;
            const win = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.2), wMat);
            win.position.set(mesh.position.x + wx, wy, mesh.position.z + sz / 2 + 0.01);
            scene.add(win);
          }
        }
      }
    }

    // Particles
    const pc = 600;
    const pg = new THREE.BufferGeometry();
    const pos = new Float32Array(pc * 3);
    for (let i = 0; i < pc; i++) {
      const t = Math.random() * Math.PI * 2;
      const p = Math.random() * Math.PI * 0.3;
      const r2 = 50 + Math.random() * 40;
      pos[i * 3] = Math.cos(t) * Math.sin(p) * r2;
      pos[i * 3 + 1] = Math.cos(p) * r2 * 0.3 + 10;
      pos[i * 3 + 2] = Math.sin(t) * Math.sin(p) * r2;
    }
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particles = new THREE.Points(pg, new THREE.PointsMaterial({
      color: 0x4488ff, size: 0.4, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending,
    }));
    scene.add(particles);

    // Lights
    scene.add(new THREE.AmbientLight(0x222244, 0.4));
    const dl = new THREE.DirectionalLight(0xff8844, 0.6);
    dl.position.set(-20, 30, 20);
    scene.add(dl);
    const fl = new THREE.DirectionalLight(0x4466ff, 0.2);
    fl.position.set(20, 10, -20);
    scene.add(fl);
    const rl = new THREE.DirectionalLight(0x8844ff, 0.15);
    rl.position.set(0, -10, -30);
    scene.add(rl);

    // --- Animation (scroll-driven camera) ---
    let mouseX = 0, mouseY = 0, tx = 0, ty = 0;
    const onMouse = (e: MouseEvent) => { tx = (e.clientX / window.innerWidth) * 2 - 1; ty = (e.clientY / window.innerHeight) * 2 - 1; };
    window.addEventListener('mousemove', onMouse);

    let animId = 0;

    function frame() {
      mouseX += (tx - mouseX) * 0.03;
      mouseY += (ty - mouseY) * 0.03;

      const p = getScrollProgress();

      // Camera path:
      // p=0: close to ground, walking the streets
      // p=0.3: rising up, mid orbit
      // p=0.6: wide aerial
      // p=1.0: bird's eye above city
      const angle = Date.now() * 0.00003 + mouseX * 0.4 + p * Math.PI * 2;
      const radius = 20 + p * 40;
      const height = 6 + p * 35 - mouseY * 2;
      const lookY = -1 + p * 8;

      camera.position.x = Math.cos(angle) * radius;
      camera.position.z = Math.sin(angle) * radius;
      camera.position.y = height;
      camera.lookAt(0, lookY, 0);

      // Fog thickens with height
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.density = 0.015 + p * 0.012;
      }

      particles.rotation.y += 0.0002;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(frame);
    }
    frame();

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
      ro.disconnect();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} className="fixed inset-0 h-full w-full" style={{ zIndex: 0 }} />
  );
}
