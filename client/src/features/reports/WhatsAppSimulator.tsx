import React, { useState } from 'react';
import { X, Send, Image, MapPin, CheckCheck, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';

interface WhatsAppSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text?: string;
  photo?: string;
  options?: string[];
  timestamp: string;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'user',
      text: 'Open borewell spotted near school path in Settipalem',
      timestamp: '14:20'
    },
    {
      id: 2,
      sender: 'bot',
      text: 'Kaal Kuaan Safety Bot: Hazard report initiated. Please share GPS location and a photograph of the borehole.',
      timestamp: '14:20'
    },
    {
      id: 3,
      sender: 'user',
      photo: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80',
      text: '📍 GPS Location: 17.0620°N, 79.2810°E (Settipalem canal road)',
      timestamp: '14:21'
    },
    {
      id: 4,
      sender: 'bot',
      text: 'Photo & Location received. What is the current physical state of the borewell opening?',
      options: ['OPEN & UNPROTECTED', 'PARTIALLY COVERED', 'NOT SURE'],
      timestamp: '14:21'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleOptionSelect = async (opt: string) => {
    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: opt,
      timestamp: '14:22'
    };

    setMessages((prev) => [...prev, userMsg]);

    setTimeout(async () => {
      try {
        const res = await api.submitWhatsAppSim({
          message: `Open borewell reported via WhatsApp: ${opt}`,
          locationName: 'Settipalem canal road'
        });

        const botReply: ChatMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: `✅ Report registered. Reference ID: ${res.reportId || 'KK-R-10982'}. Alert dispatched to Mandal Agricultural Officer and Gram Panchayat Secretary. Thank you for protecting your village.`,
          timestamp: '14:22'
        };
        setMessages((prev) => [...prev, botReply]);
        setCompleted(true);
      } catch (err) {
        console.error(err);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-carbon/80 flex items-center justify-center p-3 md:p-6 backdrop-blur-sm">
      <div className="bg-[#EFEAE2] w-full max-w-md border-2 border-carbon shadow-panel overflow-hidden flex flex-col h-[580px]">
        {/* Top WhatsApp Header */}
        <div className="bg-[#075E54] text-white p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.jpg"
              alt="Kaal Kuaan Logo"
              className="w-8 h-8 rounded-full object-cover border border-white/40"
            />
            <div>
              <div className="font-bold text-sm">Kaal Kuaan Safety Bot</div>
              <div className="text-[10px] text-white/80 font-mono">Government Safety Channel • Online</div>
            </div>
          </div>

          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Disclaimer Strip */}
        <div className="bg-safety-amber/20 text-carbon px-3 py-1 text-[10px] font-mono border-b border-safety-amber/40 flex justify-between">
          <span>DEMO FLOW — WHATSAPP INTEGRATION</span>
          <span>SIMULATED CHAT</span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs font-sans">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[82%] p-2.5 rounded-lg shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-[#E7FFDB] text-carbon border border-[#D0ECC2]'
                    : 'bg-white text-carbon border border-[#E0E0E0]'
                }`}
              >
                {m.photo && (
                  <img
                    src={m.photo}
                    alt="Uploaded Evidence"
                    className="w-full h-32 object-cover rounded mb-1.5"
                  />
                )}
                {m.text && <p className="leading-snug">{m.text}</p>}
                <div className="text-[9px] text-earth text-right mt-1 font-mono flex items-center justify-end gap-1">
                  <span>{m.timestamp}</span>
                  {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-survey-blue" />}
                </div>
              </div>

              {/* Options buttons if provided */}
              {m.options && !completed && (
                <div className="mt-2 space-y-1 w-full max-w-[82%]">
                  {m.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleOptionSelect(opt)}
                      className="w-full py-1.5 px-2.5 bg-white hover:bg-parchment text-carbon font-semibold text-xs rounded border border-[#CFC7B4] shadow-sm text-left transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-2 bg-[#F0F0F0] border-t border-[#DDD] flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={completed}
            placeholder={completed ? 'Hazard report logged.' : 'Type a message...'}
            className="flex-1 bg-white px-3 py-2 text-xs rounded-full border border-gray-300 focus:outline-none"
          />
          <button
            disabled={!inputVal || completed}
            className="p-2 bg-[#075E54] text-white rounded-full disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
