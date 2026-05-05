'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface DigitalTwinProps {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  type: 'SERVER' | 'LAPTOP' | 'MONITOR';
}

/**
 * VaultIQ Digital Twin Engine
 * Renders a 3D interactive representation of a physical asset.
 * Powered by Three.js.
 */
export default function DigitalTwin({ status, type }: DigitalTwinProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // 2. Add Asset Geometry (Stylized)
    let geometry;
    if (type === 'SERVER') {
      geometry = new THREE.BoxGeometry(1, 1.5, 0.8);
    } else if (type === 'LAPTOP') {
      geometry = new THREE.BoxGeometry(1.4, 0.1, 1);
    } else {
      geometry = new THREE.BoxGeometry(1.2, 0.8, 0.1);
    }

    // Status-based Material
    const statusColors = {
      HEALTHY: 0x58a6ff,
      WARNING: 0xd29922,
      CRITICAL: 0xda3633,
    };

    const material = new THREE.MeshStandardMaterial({ 
      color: statusColors[status],
      metalness: 0.7,
      roughness: 0.2,
      emissive: statusColors[status],
      emissiveIntensity: 0.5
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 3. Add Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 3;

    // 4. Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      mesh.rotation.y += 0.01;
      mesh.rotation.x += 0.005;
      
      // Pulse effect for Critical/Warning
      if (status !== 'HEALTHY') {
        material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
      }
      
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
    };
  }, [status, type]);

  return (
    <div className="digital-twin-container glass">
      <div ref={mountRef} className="canvas-mount" />
      <div className="twin-overlay">
        <span className="status-badge" data-status={status}>
          {status}
        </span>
        <p className="twin-label">Live IoT Sync: Active</p>
      </div>

      <style jsx>{`
        .digital-twin-container {
          position: relative;
          width: 100%;
          height: 300px;
          overflow: hidden;
          background: radial-gradient(circle at center, rgba(88, 166, 255, 0.1), transparent);
        }
        .canvas-mount {
          width: 100%;
          height: 100%;
        }
        .twin-overlay {
          position: absolute;
          top: 16px;
          left: 16px;
          pointer-events: none;
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .status-badge[data-status="HEALTHY"] { color: var(--accent-primary); border-color: var(--accent-primary); }
        .status-badge[data-status="WARNING"] { color: var(--accent-warning); border-color: var(--accent-warning); }
        .status-badge[data-status="CRITICAL"] { color: var(--accent-danger); border-color: var(--accent-danger); }
        
        .twin-label {
          font-size: 0.7rem;
          color: var(--text-secondary);
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
