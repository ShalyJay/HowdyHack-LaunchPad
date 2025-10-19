'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function Sphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Rotate the sphere
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial
        color="#cc6c13"
        wireframe={false}
        roughness={0.5}
        metalness={0.3}
      />
    </mesh>
  );
}

function OrbitingText() {
  const textRef = useRef<THREE.Group>(null);

  // Orbit the text around the sphere
  useFrame((state) => {
    if (textRef.current) {
      const time = state.clock.getElapsedTime();
      const radius = 4;
      textRef.current.position.x = Math.cos(time * 0.5) * radius;
      textRef.current.position.z = Math.sin(time * 0.5) * radius;
      textRef.current.position.y = Math.sin(time * 0.3) * 1;

      // Make text always face the camera
      textRef.current.lookAt(0, textRef.current.position.y, 0);
    }
  });

  return (
    <group ref={textRef}>
      <Text
        fontSize={0.8}
        color="#9b1b1b"
        anchorX="center"
        anchorY="middle"
        font="/fonts/archivo.woff"
      >
        Job Roadmap
      </Text>
    </group>
  );
}

export default function SpinningSphere() {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* 3D Objects */}
        <Sphere />
        <OrbitingText />

        {/* Controls - allows user to rotate view with mouse */}
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
