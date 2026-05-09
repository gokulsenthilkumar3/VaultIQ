'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * VaultIQ AI Assistant (V2)
 * Advanced natural language interface with typing indicators and context awareness.
 */
export default function AIAssistant() {
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'System initialized. I am VaultIQ-Core. How can I assist with your asset lifecycle management today?' }
  ]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getAIResponse = (input: string) => {
    const lowInput = input.toLowerCase();
    if (lowInput.includes('maintenance')) {
      return "Analyzing telemetry... Predictive Engine suggests Rack A-12 (Primary Web Server) requires thermal paste replacement within 14 days to avoid critical throttling.";
    }
    if (lowInput.includes('blockchain') || lowInput.includes('audit')) {
      return "All ledger entries are synced. Integrity check: 100%. The most recent anchor was for asset LAP-442 at 14:22 UTC.";
    }
    if (lowInput.includes('budget') || lowInput.includes('cost')) {
      return "Projected depreciation for Q3 is $12,400. I recommend prioritizing the replacement of 5 workstations in Studio 4 to maintain 99.9% operational uptime.";
    }
    return "I've processed your request. Based on current inventory metrics, your asset utilization is at 84%. Would you like a detailed lifecycle report?";
  };

  const handleSend = () => {
    if (!query.trim()) return;
    
    const userMessage = query;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setQuery('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: getAIResponse(userMessage)
      }]);
    }, 1500);
  };

  return (
    <div className="ai-assistant glass">
      <div className="chat-header">
        <div className="ai-brand">
          <div className="ai-orb"></div>
          <div>
            <h3>VaultIQ-Core</h3>
            <span className="ai-status">Neural Network Active</span>
          </div>
        </div>
      </div>
      
      <div className="chat-history">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role} animate-slide-up`}>
            <div className="message-bubble">
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message assistant">
            <div className="message-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-wrapper">
        <div className="chat-input glass">
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Query lifecycle, maintenance, or audit trails..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="send-btn" onClick={handleSend} disabled={isTyping} aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        .ai-assistant {
          display: flex;
          flex-direction: column;
          height: 500px;
          border: 1px solid var(--border-color);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .chat-header {
          padding: 20px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid var(--border-color);
        }

        .ai-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .ai-orb {
          width: 32px;
          height: 32px;
          background: var(--accent-primary);
          border-radius: 50%;
          box-shadow: 0 0 15px var(--accent-primary);
          animation: pulse 2s infinite ease-in-out;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }

        .ai-brand h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
        }

        .ai-status {
          font-size: 0.65rem;
          color: var(--accent-success);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .chat-history {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        .message {
          display: flex;
          width: 100%;
        }

        .message.assistant { justify-content: flex-start; }
        .message.user { justify-content: flex-end; }

        .message-bubble {
          max-width: 85%;
          padding: 12px 18px;
          border-radius: 12px;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .assistant .message-bubble {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
          border-bottom-left-radius: 2px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .user .message-bubble {
          background: var(--accent-primary);
          color: white;
          border-bottom-right-radius: 2px;
          box-shadow: 0 4px 12px rgba(88, 166, 255, 0.3);
        }

        .typing {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
        }

        .typing span {
          width: 6px;
          height: 6px;
          background: var(--text-secondary);
          border-radius: 50%;
          animation: blink 1.4s infinite both;
        }

        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }

        .chat-input-wrapper {
          padding: 20px;
        }

        .chat-input {
          display: flex;
          align-items: center;
          padding: 4px 4px 4px 16px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: rgba(255,255,255,0.03);
        }

        .chat-input input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          padding: 12px 0;
          outline: none;
          font-size: 0.9rem;
        }

        .send-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-primary);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          filter: brightness(1.1);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
