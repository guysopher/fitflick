'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced Character component with more detailed features
function EnhancedCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  const [time, setTime] = useState(0);
  
  useFrame((state, delta) => {
    setTime(prev => prev + delta);
  });
  
  // Animation cycle (2.5 seconds per cycle for more natural movement)
  const cycleTime = 2.5;
  const progress = (time % cycleTime) / cycleTime;
  
  // Enhanced jumping jacks motion calculations
  const jumpPhase = Math.sin(progress * Math.PI * 2);
  const armPhase = Math.sin(progress * Math.PI * 2);
  const legPhase = Math.sin(progress * Math.PI * 2);
  const bodyTilt = Math.sin(progress * Math.PI * 4) * 0.02; // Subtle body movement
  
  // Animation values with more natural motion
  const jumpHeight = Math.max(0, jumpPhase) * 0.35;
  const armSpread = (armPhase + 1) * 0.6; // 0 to 1.2
  const legSpread = Math.abs(legPhase) * 0.25; // 0 to 0.25
  const armSwing = Math.sin(progress * Math.PI * 2) * 0.1;
  
  // Enhanced character colors - light brown skin and vibrant clothes
  const skinColor = "#C8A882"; // Light brown skin
  const hairColor = "#0a0a0a"; // Deep black hair
  const topColor = "#FF4757"; // Vibrant red top
  const bottomColor = "#00D2D3"; // Cyan shorts
  const shoeColor = "#FFDD59"; // Bright yellow shoes
  const hairAccessoryColor = "#A55EEA"; // Purple hair accessory
  const eyeColor = "#2C3E50";
  
  return (
    <group ref={groupRef} position={[0, jumpHeight, 0]} rotation={[0, bodyTilt, 0]}>
      {/* Long straight hair - enhanced with multiple layers */}
      <group position={[0, 1.5, 0]}>
        {/* Hair cap/base */}
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.19, 20, 16]} />
          <meshPhongMaterial color={hairColor} shininess={30} />
        </mesh>
        
        {/* Front bangs */}
        <mesh position={[0, 0.25, 0.15]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.04, 0.15, 8]} />
          <meshPhongMaterial color={hairColor} />
        </mesh>
        <mesh position={[-0.06, 0.22, 0.14]} rotation={[0.2, -0.3, 0]}>
          <cylinderGeometry args={[0.015, 0.035, 0.12, 8]} />
          <meshPhongMaterial color={hairColor} />
        </mesh>
        <mesh position={[0.06, 0.22, 0.14]} rotation={[0.2, 0.3, 0]}>
          <cylinderGeometry args={[0.015, 0.035, 0.12, 8]} />
          <meshPhongMaterial color={hairColor} />
        </mesh>
        
        {/* Long hair strands - left side */}
        <mesh position={[-0.13, -0.1, 0]} rotation={[0, 0, 0.25]} scale={[1, 1, 0.8]}>
          <cylinderGeometry args={[0.025, 0.05, 0.7, 12]} />
          <meshPhongMaterial color={hairColor} />
        </mesh>
        <mesh position={[-0.16, -0.4, 0]} rotation={[0.1, 0, 0.15]} scale={[0.8, 1, 0.8]}>
          <cylinderGeometry args={[0.02, 0.04, 0.5, 10]} />
          <meshPhongMaterial color={hairColor} />
        </mesh>
        <mesh position={[-0.18, -0.65, -0.02]} rotation={[0.05, 0, 0.1]} scale={[0.6, 1, 0.6]}>
          <cylinderGeometry args={[0.015, 0.03, 0.3, 8]} />
          <meshPhongMaterial color={hairColor} />
        </mesh>
        
        {/* Long hair strands - right side */}
        <mesh position={[0.13, -0.1, 0]} rotation={[0, 0, -0.25]} scale={[1, 1, 0.8]}>
          <cylinderGeometry args={[0.025, 0.05, 0.7, 12]} />
          <meshPhongMaterial color={hairColor} />
        </mesh>
        <mesh position={[0.16, -0.4, 0]} rotation={[0.1, 0, -0.15]} scale={[0.8, 1, 0.8]}>
          <cylinderGeometry args={[0.02, 0.04, 0.5, 10]} />
          <meshPhongMaterial color={hairColor} />
        </mesh>
        <mesh position={[0.18, -0.65, -0.02]} rotation={[0.05, 0, -0.1]} scale={[0.6, 1, 0.6]}>
          <cylinderGeometry args={[0.015, 0.03, 0.3, 8]} />
          <meshPhongMaterial color={hairColor} />
        </mesh>
        
        {/* Back hair - long and flowing */}
        <mesh position={[0, -0.15, -0.1]} rotation={[0.4, 0, 0]} scale={[1, 1.2, 1]}>
          <cylinderGeometry args={[0.035, 0.065, 0.9, 12]} />
          <meshPhongMaterial color={hairColor} />
        </mesh>
        <mesh position={[0, -0.5, -0.15]} rotation={[0.2, 0, 0]} scale={[0.8, 1, 0.8]}>
          <cylinderGeometry args={[0.025, 0.05, 0.6, 10]} />
          <meshPhongMaterial color={hairColor} />
        </mesh>
        
        {/* Hair accessory - colorful headband */}
        <mesh position={[0, 0.08, 0]}>
          <torusGeometry args={[0.18, 0.025, 12, 24]} />
          <meshPhongMaterial color={hairAccessoryColor} shininess={60} />
        </mesh>
        
        {/* Hair accessory details */}
        <mesh position={[0.15, 0.08, 0]} rotation={[0, 0, Math.PI/4]}>
          <boxGeometry args={[0.04, 0.04, 0.02]} />
          <meshPhongMaterial color="#FFD700" />
        </mesh>
      </group>
      
      {/* Head with improved features */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshPhongMaterial color={skinColor} shininess={20} />
      </mesh>
      
      {/* Enhanced eyes */}
      <group position={[0, 1.5, 0]}>
        {/* Eye whites */}
        <mesh position={[-0.05, 0.05, 0.13]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshPhongMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.05, 0.05, 0.13]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshPhongMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Pupils */}
        <mesh position={[-0.05, 0.05, 0.145]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshPhongMaterial color={eyeColor} />
        </mesh>
        <mesh position={[0.05, 0.05, 0.145]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshPhongMaterial color={eyeColor} />
        </mesh>
        
        {/* Eye highlights */}
        <mesh position={[-0.045, 0.06, 0.155]}>
          <sphereGeometry args={[0.005, 6, 6]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.055, 0.06, 0.155]}>
          <sphereGeometry args={[0.005, 6, 6]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      {/* Nose */}
      <mesh position={[0, 1.48, 0.13]}>
        <sphereGeometry args={[0.01, 6, 6]} />
        <meshPhongMaterial color={skinColor} />
      </mesh>
      
      {/* Smile */}
      <mesh position={[0, 1.42, 0.135]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.03, 0.005, 4, 8, Math.PI]} />
        <meshBasicMaterial color="#FF6B9D" />
      </mesh>
      
      {/* Colorful athletic top */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.13, 0.17, 0.4, 12]} />
        <meshPhongMaterial color={topColor} shininess={10} />
      </mesh>
      
      {/* Top design details */}
      <mesh position={[0, 1.25, 0.13]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 8]} />
        <meshPhongMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Colorful athletic shorts */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.17, 0.15, 0.28, 12]} />
        <meshPhongMaterial color={bottomColor} shininess={10} />
      </mesh>
      
      {/* Shorts stripe details */}
      <mesh position={[-0.12, 0.85, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
        <meshPhongMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.12, 0.85, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
        <meshPhongMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Left Arm with enhanced movement */}
      <group position={[-0.2, 1.25, 0]} rotation={[armSwing, 0, -armSpread - 0.2]}>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 10]} />
          <meshPhongMaterial color={skinColor} shininess={15} />
        </mesh>
        <mesh position={[0, -0.42, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshPhongMaterial color={skinColor} shininess={15} />
        </mesh>
      </group>
      
      {/* Right Arm with enhanced movement */}
      <group position={[0.2, 1.25, 0]} rotation={[-armSwing, 0, armSpread + 0.2]}>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 10]} />
          <meshPhongMaterial color={skinColor} shininess={15} />
        </mesh>
        <mesh position={[0, -0.42, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshPhongMaterial color={skinColor} shininess={15} />
        </mesh>
      </group>
      
      {/* Left Leg */}
      <group position={[-0.08 - legSpread, 0.7, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.08, 0.06, 0.5, 10]} />
          <meshPhongMaterial color={skinColor} shininess={15} />
        </mesh>
        {/* Enhanced colorful shoe */}
        <mesh position={[0, -0.55, 0.08]}>
          <boxGeometry args={[0.16, 0.1, 0.26]} />
          <meshPhongMaterial color={shoeColor} shininess={40} />
        </mesh>
        {/* Shoe sole */}
        <mesh position={[0, -0.58, 0.08]}>
          <boxGeometry args={[0.18, 0.04, 0.28]} />
          <meshPhongMaterial color="#2C3E50" />
        </mesh>
        {/* Shoe laces */}
        <mesh position={[0, -0.52, 0.15]}>
          <boxGeometry args={[0.12, 0.02, 0.02]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, -0.48, 0.15]}>
          <boxGeometry args={[0.08, 0.02, 0.02]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      {/* Right Leg */}
      <group position={[0.08 + legSpread, 0.7, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.08, 0.06, 0.5, 10]} />
          <meshPhongMaterial color={skinColor} shininess={15} />
        </mesh>
        {/* Enhanced colorful shoe */}
        <mesh position={[0, -0.55, 0.08]}>
          <boxGeometry args={[0.16, 0.1, 0.26]} />
          <meshPhongMaterial color={shoeColor} shininess={40} />
        </mesh>
        {/* Shoe sole */}
        <mesh position={[0, -0.58, 0.08]}>
          <boxGeometry args={[0.18, 0.04, 0.28]} />
          <meshPhongMaterial color="#2C3E50" />
        </mesh>
        {/* Shoe laces */}
        <mesh position={[0, -0.52, 0.15]}>
          <boxGeometry args={[0.12, 0.02, 0.02]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, -0.48, 0.15]}>
          <boxGeometry args={[0.08, 0.02, 0.02]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>
    </group>
  );
}

// Enhanced 3D Scene with better lighting and effects
function Scene() {
  const showParticles = true;
  
  // Animated particles for energy effect
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 50; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 8,
          Math.random() * 4,
          (Math.random() - 0.5) * 8
        ],
        speed: 0.01 + Math.random() * 0.02,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFE66D', '#A55EEA'][Math.floor(Math.random() * 5)]
      });
    }
    return temp;
  }, []);
  
  function AnimatedParticles() {
    const particleRefs = useRef<THREE.Mesh[]>([]);
    
    useFrame((state, delta) => {
      particleRefs.current.forEach((particle, index) => {
        if (particle) {
          particle.position.y += particles[index].speed;
          if (particle.position.y > 4) {
            particle.position.y = 0;
          }
          particle.rotation.x += delta * 2;
          particle.rotation.y += delta * 1.5;
        }
      });
    });
    
    return (
      <group>
        {showParticles && particles.map((particle, index) => (
          <mesh
            key={index}
            ref={(el) => {
              if (el) particleRefs.current[index] = el;
            }}
            position={particle.position as [number, number, number]}
          >
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshBasicMaterial color={particle.color} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    );
  }
  
  return (
    <>
      {/* Enhanced Lighting Setup */}
      <ambientLight intensity={0.4} color="#FFF5EE" />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2} 
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-10, 5, -5]} intensity={0.5} color="#E6F3FF" />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#FFE4E1" />
      <spotLight 
        position={[0, 8, 3]} 
        intensity={0.5} 
        angle={0.3} 
        penumbra={1} 
        color="#FF6B9D"
      />
      
      {/* Animated background gradient */}
      <mesh position={[0, 0, -5]} scale={[20, 20, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#E8F4FD" transparent opacity={0.3} />
      </mesh>
      
      {/* Enhanced Ground with patterns */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshPhongMaterial color="#F8FBFF" shininess={10} />
      </mesh>
      
      {/* Ground pattern circles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1, 1.1, 32]} />
        <meshBasicMaterial color="#E3F2FD" transparent opacity={0.5} />
      </mesh>
             <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
         <ringGeometry args={[2, 2.1, 32]} />
         <meshBasicMaterial color="#BBDEFB" transparent opacity={0.3} />
       </mesh>
      
      {/* Enhanced Character */}
      <EnhancedCharacter />
      
      {/* Animated Energy Particles */}
      <AnimatedParticles />
      
      {/* Exercise Info Text in 3D Space */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.3}
        color="#2C3E50"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        JUMPING JACKS
      </Text>
      
      {/* Camera controls with enhanced settings */}
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 6}
        target={[0, 1.2, 0]}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

interface ExerciseAnimationProps {
  currentExercise?: {
    name: string;
    description: string;
  };
}

export default function ExerciseAnimation({ currentExercise }: ExerciseAnimationProps) {
  const exercise = currentExercise || {
    name: "Jumping Jacks",
    description: "Full body cardio exercise with enhanced 3D character"
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-3xl shadow-2xl overflow-hidden border border-white/50">
      {/* Enhanced Exercise Information Panel */}
      <div className="absolute top-6 left-6 z-20 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/60">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></div>
          <h2 className="text-xl font-bold text-gray-900">{exercise.name}</h2>
        </div>
        <p className="text-gray-700 text-sm mb-2">{exercise.description}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">Enhanced 3D</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Interactive</span>
        </div>
      </div>
      
      {/* Enhanced Control Instructions */}
      <div className="absolute top-6 right-6 z-20 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-white/60">
        <div className="space-y-1 text-xs text-gray-600">
          <p className="flex items-center gap-2">
            <span className="text-purple-500">🖱️</span> Click & drag to rotate
          </p>
          <p className="flex items-center gap-2">
            <span className="text-blue-500">🔍</span> Scroll to zoom
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-500">✨</span> Watch the particles!
          </p>
        </div>
      </div>
      
      {/* 3D Canvas with enhanced settings */}
      <Canvas
        camera={{ 
          position: [0, 2.5, 6], 
          fov: 50 
        }}
        className="w-full h-full"
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
      
      {/* Enhanced Animation Status */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-white/30">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-white">
            {exercise.name} - Enhanced Character
          </span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
} 