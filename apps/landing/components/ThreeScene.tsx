"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x00ff66, 2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    
    const fillLight = new THREE.DirectionalLight(0x0b311e, 3);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    // 3. Materials
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00ff66,
      metalness: 0.1,
      roughness: 0.2,
      transmission: 0.9,
      thickness: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
    });

    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff66,
      transparent: true,
      opacity: 0.6,
    });
    
    const solidBoxMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x047832,
      metalness: 0.2,
      roughness: 0.4,
      transmission: 0.8,
      thickness: 0.5,
      transparent: true,
      opacity: 0, // Starts fully transparent
    });

    // 4. Objects: Central Liquid Rock & Shards
    const rockGeo = new THREE.IcosahedronGeometry(2.5, 4); // high poly for liquid look
    // Slightly perturb vertices to make it organic
    const pos = rockGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(i, pos.getX(i) * (0.95 + Math.random() * 0.1), pos.getY(i) * (0.95 + Math.random() * 0.1), pos.getZ(i) * (0.95 + Math.random() * 0.1));
    }
    rockGeo.computeVertexNormals();

    const centralRock = new THREE.Mesh(rockGeo, glassMaterial);
    scene.add(centralRock);
    
    // Shards
    const shards: THREE.Mesh[] = [];
    const shardGeo = new THREE.IcosahedronGeometry(0.8, 1);
    const shardPositions = [
      new THREE.Vector3(-6, 4, -2),
      new THREE.Vector3(6, -3, 1),
      new THREE.Vector3(-4, -5, 2),
      new THREE.Vector3(5, 5, -3),
    ];
    
    shardPositions.forEach((pos) => {
      const shard = new THREE.Mesh(shardGeo, glassMaterial);
      shard.position.copy(pos);
      shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(shard);
      shards.push(shard);
    });

    // 5. Objects: Layered Deck (Foundation, Framework, Connection)
    const deckGroup = new THREE.Group();
    deckGroup.position.set(0, -15, 0); // Start hidden below
    scene.add(deckGroup);

    const boxGeo = new THREE.BoxGeometry(4, 0.8, 4);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    
    const layers: { wire: THREE.LineSegments, solid: THREE.Mesh }[] = [];
    for (let i = 0; i < 3; i++) {
      const wire = new THREE.LineSegments(boxEdges, wireframeMaterial.clone());
      const solid = new THREE.Mesh(boxGeo, solidBoxMaterial.clone());
      const yOffset = i * 1.5;
      wire.position.y = yOffset;
      solid.position.y = yOffset;
      deckGroup.add(wire);
      deckGroup.add(solid);
      layers.push({ wire, solid });
    }

    // Laser Beam Connection
    const beamGeo = new THREE.CylinderGeometry(0.1, 0.1, 10, 8);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x00ff66, transparent: true, opacity: 0 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, 0, 0); // We will position this dynamically in animation loop
    deckGroup.add(beam);

    // 6. GSAP Scroll Animations
    // Set initial state
    centralRock.scale.set(0.1, 0.1, 0.1);
    centralRock.material.opacity = 0;

    // Master Timeline tied to scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // smooth scrubbing
      }
    });

    // Phase 1: Hero -> Combine shards (0% to 20% of scroll)
    tl.to(centralRock.scale, { x: 1, y: 1, z: 1, duration: 2 }, 0);
    tl.to(centralRock.material, { opacity: 1, duration: 2 }, 0);
    shards.forEach((shard, i) => {
      tl.to(shard.position, { x: 0, y: 0, z: 0, duration: 2, ease: "power2.inOut" }, 0);
      tl.to(shard.scale, { x: 0.1, y: 0.1, z: 0.1, duration: 2 }, 0);
      // @ts-ignore
      tl.to(shard.material, { opacity: 0, duration: 1.5 }, 0.5);
    });

    // Phase 2: About -> Rock moves left (20% to 40%)
    tl.to(centralRock.position, { x: -5, duration: 2, ease: "power1.inOut" }, 2);
    
    // Phase 3: Features -> Rock curve path down to right (40% to 65%)
    tl.to(centralRock.position, { 
      x: 5, 
      y: -2, 
      z: -2,
      duration: 2.5, 
      ease: "sine.inOut" 
    }, 4);
    tl.to(centralRock.rotation, { x: Math.PI, y: Math.PI * 2, duration: 2.5 }, 4);

    // Phase 4: Foundation -> Deck rises, wireframes turn solid, beam connects (65% to 85%)
    // Bring deck up
    tl.to(deckGroup.position, { y: -2, duration: 2, ease: "power2.out" }, 6.5);
    
    // Fade out wireframes and fade in solid
    layers.forEach((layer, i) => {
      // @ts-ignore
      tl.to(layer.wire.material, { opacity: 0.1, duration: 1 }, 7 + i * 0.3);
      // @ts-ignore
      tl.to(layer.solid.material, { opacity: 0.9, duration: 1 }, 7 + i * 0.3);
    });

    // Connect beam from deck top to rock
    tl.to(beam.material, { opacity: 0.8, duration: 1 }, 8);
    
    // Phase 5: Fade out scene for footer (85% to 100%)
    tl.to(centralRock.material, { opacity: 0.2, duration: 1.5 }, 8.5);
    tl.to(deckGroup.position, { y: -10, duration: 1.5 }, 8.5);

    // 7. Render Loop
    const clock = new THREE.Clock();
    let rafId: number;

    const render = () => {
      const time = clock.getElapsedTime();
      
      // Idle floating animation
      centralRock.position.y += Math.sin(time * 2) * 0.005;
      centralRock.rotation.x += 0.002;
      centralRock.rotation.y += 0.003;

      shards.forEach((shard, i) => {
        shard.rotation.x += 0.01 + (i * 0.002);
        shard.rotation.y += 0.015;
      });
      
      // Update deck gentle float
      deckGroup.position.y += Math.sin(time) * 0.002;

      // Update beam to connect from top box to rock dynamically
      if (beam.material.opacity > 0) {
        const topBoxPos = new THREE.Vector3();
        layers[2].solid.getWorldPosition(topBoxPos);
        const rockPos = new THREE.Vector3();
        centralRock.getWorldPosition(rockPos);
        
        const distance = topBoxPos.distanceTo(rockPos);
        beam.scale.set(1, distance / 10, 1); // 10 is original height
        
        const midpoint = topBoxPos.clone().lerp(rockPos, 0.5);
        beam.position.copy(deckGroup.worldToLocal(midpoint));
        beam.lookAt(deckGroup.worldToLocal(rockPos.clone()));
        beam.rotateX(Math.PI / 2); // align cylinder length
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(render);
    };
    render();

    // 8. Resize Handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
      ScrollTrigger.getAll().forEach(t => t.kill());
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="webgl-canvas-container" />;
}
