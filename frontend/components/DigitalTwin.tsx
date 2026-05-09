'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface DigitalTwinProps {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  type: 'SERVER' | 'LAPTOP' | 'MONITOR';
}

/**
 * VaultIQ Digital Twin Engine (V2)
 * Renders a high-fidelity 3D representation with tech-grid and pulse effects.
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

    // 2. Add Tech Grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x58a6ff, 0x1a1a1a);
    gridHelper.position.y = -1.2;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    scene.add(gridHelper);

    // 3. Add Asset Geometry
    let geometry;
    if (type === 'SERVER') {
      geometry = new THREE.BoxGeometry(1, 1.8, 0.8);
    } else if (type === 'LAPTOP') {
      geometry = new THREE.BoxGeometry(1.6, 0.08, 1.1);
    } else {
      geometry = new THREE.BoxGeometry(1.4, 0.9, 0.1);
    }

    const statusColors = {
      HEALTHY: 0x58a6ff,
      WARNING: 0xd29922,
      CRITICAL: 0xda3633,
    };

    const material = new THREE.MeshPhysicalMaterial({ 
      color: statusColors[status],
      metalness: 0.9,
      roughness: 0.1,
      emissive: statusColors[status],
      emissiveIntensity: 0.4,
      transmission: 0.5,
      thickness: 0.5,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Add Wireframe Overlay for "Scanning" look
    const wireframeGeom = new THREE.EdgesGeometry(geometry);
    const wireframeMat = new THREE.LineBasicMaterial({ 
      color: statusColors[status], 
      transparent: true, 
      opacity: 0.5 
    });
    const wireframe = new THREE.LineSegments(wireframeGeom, wireframeMat);
    mesh.add(wireframe);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const mainLight = new THREE.PointLight(0xffffff, 1.5);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const secondaryLight = new THREE.PointLight(statusColors[status], 2);
    secondaryLight.position.set(-5, -2, 2);
    scene.add(secondaryLight);

    camera.position.set(2, 1.5, 3);
    camera.lookAt(0, 0, 0);

    // 5. Animation Loop
    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      mesh.rotation.y += 0.008;
      
      // Floating animation
      mesh.position.y = Math.sin(Date.now() * 0.002) * 0.1;
      
      // Status Pulse
      const pulseSpeed = status === 'HEALTHY' ? 0.002 : 0.008;
      material.emissiveIntensity = 0.3 + Math.sin(Date.now() * pulseSpeed) * 0.3;
      wireframeMat.opacity = 0.2 + Math.sin(Date.now() * pulseSpeed) * 0.4;
      
      renderer.render(scene, camera);
      return frameId;
    };

    const frameId = animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      wireframeGeom.dispose();
      wireframeMat.dispose();
    };
  }, [status, type]);

  return (
    <div className="digital-twin-container">
      <div ref={mountRef} className="canvas-mount" />
      <div className="twin-overlay">
        <div className="status-indicator">
          <span className="pulse-dot" data-status={status}></span>
          <span className="status-text">{status}</span>
        </div>
      </div>

      <style jsx>{`
        .digital-twin-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: radial-gradient(circle at 50% 50%, rgba(88, 166, 255, 0.05) 0%, transparent 80%);
        }
        .canvas-mount {
          width: 100%;
          height: 100%;
        }
        .twin-overlay {
          position: absolute;
          top: 12px;
          left: 12px;
          pointer-events: none;
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.6);
          padding: 4px 10px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(4px);
        }
        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .pulse-dot[data-status="HEALTHY"] { background: #58a6ff; box-shadow: 0 0 10px #58a6ff; }
        .pulse-dot[data-status="WARNING"] { background: #d29922; box-shadow: 0 0 10px #d29922; }
        .pulse-dot[data-status="CRITICAL"] { background: #da3633; box-shadow: 0 0 10px #da3633; }
        
        .status-text {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: white;
        }
      `}</style>
    </div>
  );
}
