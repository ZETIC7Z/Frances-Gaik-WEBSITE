'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from './theme/ThemeProvider';

function OpenBook() {
  const { tokens } = useTheme();
  const primary = tokens.primary;
  const secondary = tokens.secondary;
  const cover = '#101d1c';
  const paper = '#e9f2ef';

  const pageL = useRef<THREE.Group>(null);
  const pageR = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const breathe = Math.sin(t * 0.9);
    if (pageL.current) pageL.current.rotation.y = 0.05 + breathe * 0.05;
    if (pageR.current) pageR.current.rotation.y = -0.05 - breathe * 0.05;
  });

  return (
    <group>
      {/* Left cover — pivoted at the spine via group rotation */}
      <group rotation={[0, 0.26, 0]}>
        <mesh position={[-0.95, -0.06, 0]}>
          <boxGeometry args={[1.9, 0.06, 1.66]} />
          <meshStandardMaterial color={cover} roughness={0.5} metalness={0.2} />
        </mesh>
        <group ref={pageL}>
          <mesh position={[-0.84, 0.05, 0]}>
            <boxGeometry args={[1.66, 0.1, 1.5]} />
            <meshStandardMaterial color={paper} roughness={0.92} />
          </mesh>
        </group>
      </group>

      {/* Right cover — pivoted at the spine via group rotation */}
      <group rotation={[0, -0.26, 0]}>
        <mesh position={[0.95, -0.06, 0]}>
          <boxGeometry args={[1.9, 0.06, 1.66]} />
          <meshStandardMaterial color={cover} roughness={0.5} metalness={0.2} />
        </mesh>
        <group ref={pageR}>
          <mesh position={[0.84, 0.05, 0]}>
            <boxGeometry args={[1.66, 0.1, 1.5]} />
            <meshStandardMaterial color={paper} roughness={0.92} />
          </mesh>
        </group>
      </group>

      {/* Spine glow seam */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.035, 0.14, 1.56]} />
        <meshStandardMaterial color={secondary} emissive={secondary} emissiveIntensity={1.1} />
      </mesh>

      {/* Pedestal rings */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.45, 1.68, 64]} />
        <meshBasicMaterial color={primary} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.92, 2.0, 64]} />
        <meshBasicMaterial color={primary} transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Particles({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.06;
  });
  const positions = useMemo(() => {
    const arr = new Float32Array(180 * 3);
    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.8 + Math.random() * 1.6;
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 1.6;
      arr[i * 3 + 2] = Math.sin(angle) * radius * 0.7;
    }
    return arr;
  }, []);
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color={color} transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function Scene() {
  const { tokens } = useTheme();
  const primary = tokens.primary;
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[3, 4, 4]} intensity={22} color={primary} />
      <pointLight position={[-4, -2, 3]} intensity={10} color="#ffffff" />
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.9}>
        <OpenBook />
      </Float>
      <Particles color={primary} />
    </>
  );
}

function StaticBook() {
  return (
    <div className="static-book" aria-hidden>
      <div className="static-book__glow" />
      <div className="static-book__pages">
        <span className="static-book__page static-book__page--l" />
        <span className="static-book__page static-book__page--r" />
        <span className="static-book__spine" />
      </div>
      <div className="static-book__ring" />
    </div>
  );
}

export default function HeroBook() {
  const [mode, setMode] = useState<'pending' | 'webgl' | 'static'>('pending');

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    let webgl = false;
    try {
      const c = document.createElement('canvas');
      webgl = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      webgl = false;
    }
    setMode(!webgl || reduced || mobile ? 'static' : 'webgl');
  }, []);

  if (mode === 'webgl') {
    return (
      <div className="hero__visual" role="img" aria-label="Open book illustration with glowing particles">
        <div className="hero__visual-glow" />
        <Canvas
          camera={{ position: [0, 1.9, 4.6], fov: 42 }}
          dpr={[1, 1.8]}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Scene />
        </Canvas>
      </div>
    );
  }

  if (mode === 'static') {
    return (
      <div className="hero__visual" role="img" aria-label="Open book illustration">
        <StaticBook />
      </div>
    );
  }

  return <div className="hero__visual" aria-hidden />;
}
