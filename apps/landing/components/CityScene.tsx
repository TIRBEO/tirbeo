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

export function CityScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0b0d);
    scene.fog = new THREE.FogExp2(0x0b0b0d, 0.008);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 300);
    camera.position.set(25, 15, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    mount.appendChild(renderer.domElement);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x0d0d12, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    // Grid
    const grid = new THREE.GridHelper(80, 40, 0x1a1a2e, 0x111122);
    grid.position.y = -0.45;
    scene.add(grid);

    // Buildings
    const offset = (GRID * SPACING) / 2;
    const colors = [0x1a1a2e, 0x16213e, 0x0f3460, 0x1b1b3a, 0x201547, 0x2d1b69];
    const geo = new THREE.BoxGeometry(1, 1, 1);

    for (let ix = 0; ix < GRID; ix++) {
      for (let iz = 0; iz < GRID; iz++) {
        const r = seededRandom(ix, iz);
        const height = Math.max(0.5, Math.pow(r, 1.5) * 14 + 1);
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

    // Lights
    scene.add(new THREE.AmbientLight(0x222244, 0.5));
    const dir = new THREE.DirectionalLight(0xff8844, 0.8);
    dir.position.set(-20, 30, 20);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0x4466ff, 0.3);
    fill.position.set(20, 10, -20);
    scene.add(fill);

    // Slow auto-orbit, no mouse tracking
    let animId = 0;
    function frame(t: number) {
      const angle = t * 0.00005;
      const radius = 28;
      camera.position.x = Math.cos(angle) * radius;
      camera.position.z = Math.sin(angle) * radius;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      animId = requestAnimationFrame(frame);
    }
    animId = requestAnimationFrame(frame);

    const resize = () => {
      const w2 = mount.clientWidth || window.innerWidth;
      const h2 = mount.clientHeight || window.innerHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 h-full w-full" />;
}