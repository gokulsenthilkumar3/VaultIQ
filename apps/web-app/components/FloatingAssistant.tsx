'use client';

import { useState } from 'react';
import AIAssistant from './AIAssistant';

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="floating-trigger glass" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Assistant"
      >
        <span className="orb"></span>
      </button>

      {isOpen && (
        <div className="assistant-window animate-slide-up">
          <AIAssistant />
          <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
        </div>
      )}

      <style jsx>{`
        .floating-trigger {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .floating-trigger:hover {
          transform: scale(1.1) rotate(5deg);
        }

        .orb {
          width: 24px;
          height: 24px;
          background: var(--accent-primary);
          border-radius: 50%;
          box-shadow: 0 0 20px var(--accent-primary);
          animation: pulse 2s infinite;
        }

        .assistant-window {
          position: fixed;
          bottom: 110px;
          right: 32px;
          width: 400px;
          z-index: 1000;
        }

        .close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          z-index: 1001;
        }

        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </>
  );
}
