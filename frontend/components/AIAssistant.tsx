'use client';

import { useState } from 'react';

/**
 * VaultIQ AI Assistant Component
 * Provides a natural language interface for asset insights.
 */
export default function AIAssistant() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your VaultIQ Assistant. Ask me anything about your assets, maintenance, or budget forecasts.' }
  ]);

  const handleSend = () => {
    if (!query.trim()) return;
    
    // Add user message
    setMessages([...messages, { role: 'user', content: query }]);
    setQuery('');

    // Simulate AI response (In production, this calls the AI Microservice)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Based on current depreciation trends, 12% of your MacBooks in the London office will reach their end-of-life by Q3. I recommend allocating $14,500 for upgrades.` 
      }]);
    }, 1000);
  };

  return (
    <div className="ai-assistant glass">
      <div className="chat-header">
        <span className="ai-status">●</span>
        <h3>VaultIQ Assistant</h3>
      </div>
      
      <div className="chat-history">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <div className="message-bubble">
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn btn-primary" onClick={handleSend}>Send</button>
      </div>

      <style jsx>{`
        .ai-assistant {
          display: flex;
          flex-direction: column;
          height: 400px;
          overflow: hidden;
        }

        .chat-header {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ai-status {
          color: var(--accent-success);
          font-size: 1.2rem;
        }

        .chat-history {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          display: flex;
        }

        .message.assistant {
          justify-content: flex-start;
        }

        .message.user {
          justify-content: flex-end;
        }

        .message-bubble {
          max-width: 80%;
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 0.9rem;
        }

        .assistant .message-bubble {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .user .message-bubble {
          background: var(--accent-primary);
          color: white;
        }

        .chat-input {
          padding: 16px;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 12px;
        }

        .chat-input input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          padding: 10px 16px;
          border-radius: 8px;
          color: white;
          outline: none;
        }

        .chat-input input:focus {
          border-color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}
