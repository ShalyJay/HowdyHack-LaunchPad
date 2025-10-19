'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function ShootingStar() {
  const groupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Line>(null);
  const prevPositions = useRef<THREE.Vector3[]>([]);
  const [trailLine, setTrailLine] = React.useState<THREE.Line | null>(null);

  React.useEffect(() => {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({ color: "#4682b4", transparent: true, opacity: 0.4 });
    const line = new THREE.Line(geometry, material);
    setTrailLine(line);
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const cycle = (time % 3) / 3; // 0 to 1 every 3 seconds

      // Move from top-left to bottom-right with a curved path
      const startX = -15;
      const startY = 10;
      const endX = 15;
      const endY = -10;

      // Add a curve using quadratic bezier-like interpolation
      const x = startX + (endX - startX) * cycle;
      const y = startY + (endY - startY) * cycle + Math.sin(cycle * Math.PI) * 3; // Arc upward
      const z = 5 + Math.sin(cycle * Math.PI) * 2; // Depth variation

      groupRef.current.position.set(x, y, z);

      // Fade in and out
      if (groupRef.current.children[0]) {
        const material = (groupRef.current.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (cycle < 0.1 || cycle > 0.9) {
          material.opacity = cycle < 0.1 ? cycle * 10 : (1 - cycle) * 10;
        } else {
          material.opacity = 1;
        }
      }

      // Update trail
      const currentPos = new THREE.Vector3(x, y, z);
      prevPositions.current.unshift(currentPos.clone());
      if (prevPositions.current.length > 20) {
        prevPositions.current.pop();
      }

      // Update trail geometry
      if (trailLine && prevPositions.current.length > 1) {
        const trailGeometry = new THREE.BufferGeometry().setFromPoints(prevPositions.current);
        trailLine.geometry.dispose();
        trailLine.geometry = trailGeometry;
      }
    }
  });

  // Create asterisk shape with crossing lines
  const createAsteriskLines = () => {
    const lines = [];
    const size = 0.15;

    // 4 crossing lines forming an asterisk
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 4;
      const points = [
        new THREE.Vector3(Math.cos(angle) * size, Math.sin(angle) * size, 0),
        new THREE.Vector3(-Math.cos(angle) * size, -Math.sin(angle) * size, 0)
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(
        <primitive key={i} object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "#4682b4", linewidth: 3, transparent: true }))} />
      );
    }
    return lines;
  };

  return (
    <group ref={groupRef}>
      {/* Asterisk sparkle shape */}
      {createAsteriskLines()}
      <mesh>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#4682b4" transparent />
      </mesh>
      {trailLine && <primitive object={trailLine} />}
    </group>
  );
}

function ShootingStar2() {
  const groupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Line>(null);
  const prevPositions = useRef<THREE.Vector3[]>([]);
  const [trailLine, setTrailLine] = React.useState<THREE.Line | null>(null);

  React.useEffect(() => {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({ color: "#4682b4", transparent: true, opacity: 0.4 });
    const line = new THREE.Line(geometry, material);
    setTrailLine(line);
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const cycle = ((time + 1.5) % 3) / 3; // Offset by 1.5 seconds

      // Move from top-right to bottom-left with a curved path
      const startX = 15;
      const startY = 10;
      const endX = -15;
      const endY = -10;

      // Add a curve using quadratic bezier-like interpolation
      const x = startX + (endX - startX) * cycle;
      const y = startY + (endY - startY) * cycle - Math.sin(cycle * Math.PI) * 3; // Arc downward
      const z = 5 + Math.sin(cycle * Math.PI) * 2; // Depth variation

      groupRef.current.position.set(x, y, z);

      // Fade in and out
      if (groupRef.current.children[0]) {
        const material = (groupRef.current.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (cycle < 0.1 || cycle > 0.9) {
          material.opacity = cycle < 0.1 ? cycle * 10 : (1 - cycle) * 10;
        } else {
          material.opacity = 1;
        }
      }

      // Update trail
      const currentPos = new THREE.Vector3(x, y, z);
      prevPositions.current.unshift(currentPos.clone());
      if (prevPositions.current.length > 20) {
        prevPositions.current.pop();
      }

      // Update trail geometry
      if (trailLine && prevPositions.current.length > 1) {
        const trailGeometry = new THREE.BufferGeometry().setFromPoints(prevPositions.current);
        trailLine.geometry.dispose();
        trailLine.geometry = trailGeometry;
      }
    }
  });

  // Create asterisk shape with crossing lines
  const createAsteriskLines = () => {
    const lines = [];
    const size = 0.15;

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 4;
      const points = [
        new THREE.Vector3(Math.cos(angle) * size, Math.sin(angle) * size, 0),
        new THREE.Vector3(-Math.cos(angle) * size, -Math.sin(angle) * size, 0)
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(
        <primitive key={i} object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "#4682b4", linewidth: 3, transparent: true }))} />
      );
    }
    return lines;
  };

  return (
    <group ref={groupRef}>
      {createAsteriskLines()}
      <mesh>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#4682b4" transparent />
      </mesh>
      {trailLine && <primitive object={trailLine} />}
    </group>
  );
}

function OrbitingLine() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // Tilt slightly in a circular motion
      meshRef.current.rotation.set(
        Math.PI / 2 + Math.sin(time * 0.6) * 0.15,  // Tilt forward/back
        Math.cos(time * 0.6) * 0.15,                 // Tilt left/right
        0
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[5.5, 0.1, 16, 100]} />
      <meshStandardMaterial
        color="#ffffff"
        roughness={0.1}
        metalness={0.9}
        emissive="#ffffff"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function Sphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Rotate the sphere on Y axis only
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  const geometry = new THREE.SphereGeometry(4.5, 64, 64);
  const colors = new Float32Array(geometry.attributes.position.count * 3);
  const positionAttribute = geometry.attributes.position;

  for (let i = 0; i < positionAttribute.count; i++) {
    const y = positionAttribute.getY(i);

    const index = i * 3;

    // Normalize y position from -1 to 1
    const t = (y / 4.5 + 1) / 2; // 0 at bottom, 1 at top

    // Gradient from pink/red -> purple/orange -> blue (more saturated)
    // Vibrant Pink/Maroon: #ff0040 (255, 0, 64)
    // Vibrant Orange: #ff6b00 (255, 107, 0)
    // Vibrant Blue: #0080ff (0, 128, 255)

    let r, g, b;

    if (t < 0.5) {
      // Bottom to middle: pink to orange
      const localT = t * 2; // 0 to 1
      r = 255 + (255 - 255) * localT;
      g = 0 + (107 - 0) * localT;
      b = 64 + (0 - 64) * localT;
    } else {
      // Middle to top: orange to blue
      const localT = (t - 0.5) * 2; // 0 to 1
      r = 255 + (0 - 255) * localT;
      g = 107 + (128 - 107) * localT;
      b = 0 + (255 - 0) * localT;
    }

    colors[index] = r / 255;
    colors[index + 1] = g / 255;
    colors[index + 2] = b / 255;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        vertexColors={true}
        roughness={1.0}
        metalness={0.0}
      />
    </mesh>
  );
}

export default function SpinningSphere() {
  return (
    <div style={{ width: '600px', maxWidth: '100vw', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* HTML Text Above */}
      <div style={{
        color: '#2a2521',
        fontSize: '3rem',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        //textTransform: 'uppercase',
        marginBottom: '-20px',
        marginTop: '60px',
        fontFamily: 'var(--font-orbitron)'
      }}>
        Launch Pad
      </div>

      <div style={{ width: '600px', maxWidth: '100vw', height: '500px', position: 'relative' }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[-5, 5, 3]} intensity={1.5} />
          <pointLight position={[-5, 5, 3]} intensity={1} />

          {/* 3D Objects */}
          <Sphere />
          <OrbitingLine />
          {/* <ShootingStar /> */}
          {/* <ShootingStar2 /> */}

          {/* Controls - allows user to rotate view with mouse */}
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>
    </div>
  );
}
