import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Send,
  X,
  MapPin,
  AlertTriangle,
  LifeBuoy,
  Camera,
  CornerDownLeft,
  RefreshCw,
  Eye,
  CheckCircle2,
  ChevronDown,
  Navigation,
  Sparkles
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: Array<{
    type: 'VIEW_ON_MAP' | 'VIEW_HAZARD' | 'REPORT_HAZARD' | 'CONFIRM_REPORT' | 'ENABLE_LOCATION';
    label: string;
    payload?: any;
  }>;
  reportDraft?: {
    hazardType: string;
    locationName: string;
    coordinates?: { lat: number; lng: number };
    description: string;
  };
}

interface SafetyAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOnMap: (hazardId?: string) => void;
  onOpenReportModal: () => void;
  onReportSubmitted: () => void;
  currentAlert?: any;
}

export const SafetyAssistantPanel: React.FC<SafetyAssistantPanelProps> = ({
  isOpen,
  onClose,
  onViewOnMap,
  onOpenReportModal,
  onReportSubmitted,
  currentAlert
}) => {
  const { userLocation, locationName, hasPermission, nearbyHazards, requestLocation } = useLocation();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize greeting on first open
  useEffect(() => {
    if (messages.length === 0) {
      const initialActions = [];
      if (currentAlert) {
        initialActions.push({
          type: 'VIEW_HAZARD' as const,
          label: '🚨 Explain My Proximity Alert',
          payload: { query: 'Why did I get this alert?' }
        });
      }
      initialActions.push({
        type: 'VIEW_ON_MAP' as const,
        label: '📍 Check Hazards Near Me',
        payload: { query: 'Are there any reported borewells near me?' }
      });
      initialActions.push({
        type: 'REPORT_HAZARD' as const,
        label: '🛡️ What Should I Do If I Find a Hole?',
        payload: { query: 'What should I do if I find an uncovered borewell?' }
      });

      setMessages([
        {
          id: 'msg-welcome',
          role: 'assistant',
          content: `Hello ${user ? user.name.split(' ')[0] : 'Citizen'}. I am the **Kaal Kuaan Safety Assistant**.\n\nI monitor active borewell hazards, explain safety alerts, guide emergency protocols, and assist with official hazard reporting. How can I help you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: initialActions
        }
      ]);
    }
  }, [user, currentAlert]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setMessages(newMessages);
    if (!textToSend) setInputValue('');
    setLoading(true);

    try {
      const history = newMessages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.askSafetyAssistant({
        message: text,
        conversationHistory: history,
        userLocation,
        locationName,
        hasPermission,
        currentAlert,
        userReports: []
      });

      if (res && res.reply) {
        setMessages(prev => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: res.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedActions: res.suggestedActions,
            reportDraft: res.reportDraft
          }
        ]);
        if (res.reportDraft) {
          setPendingDraft(res.reportDraft);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: 'I could not retrieve safety information right now. The Kaal Kuaan monitoring network is operational — you can inspect the map and scan views directly.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      console.error('Safety assistant error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: 'Network connection issue. Please check your data connectivity or retry.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReport = async (draft: any) => {
    setLoading(true);
    try {
      const res = await api.askSafetyAssistant({
        action: 'CONFIRM_SUBMIT_REPORT',
        reportDraft: draft,
        locationName,
        userLocation
      });

      setPendingDraft(null);

      if (res && res.reply) {
        setMessages(prev => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: res.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedActions: [
              {
                type: 'VIEW_ON_MAP',
                label: 'View on Map'
              }
            ]
          }
        ]);
        onReportSubmitted();
      }
    } catch (err) {
      console.error('Error confirming report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDraft = () => {
    setPendingDraft(null);
    setMessages(prev => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'Report draft cancelled. You can ask anything else or report manually at any time.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleActionClick = (action: any) => {
    if (action.payload?.query) {
      handleSendMessage(action.payload.query);
      return;
    }

    switch (action.type) {
      case 'VIEW_ON_MAP':
        onClose();
        onViewOnMap(action.payload?.hazardId);
        break;
      case 'VIEW_HAZARD':
        onClose();
        onViewOnMap(action.payload?.hazardId);
        break;
      case 'REPORT_HAZARD':
        onClose();
        onOpenReportModal();
        break;
      case 'CONFIRM_REPORT':
        handleConfirmReport(action.payload || pendingDraft);
        break;
      case 'ENABLE_LOCATION':
        requestLocation();
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[9000] flex flex-col justify-end sm:justify-start pointer-events-none animate-fadeIn">
      {/* Backdrop on mobile */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs sm:hidden pointer-events-auto"
        onClick={onClose}
      />

      {/* Main Panel Container */}
      <div className="relative pointer-events-auto w-full sm:w-[430px] h-[85vh] sm:h-[620px] max-h-[92vh] bg-[#FAF8F2] border border-stone-300 sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden text-stone-900 font-sans select-none">
        {/* Top Header */}
        <div className="px-4 py-3.5 bg-stone-900 text-stone-100 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <img
                src="/logo.jpg"
                alt="Kaal Kuaan Logo"
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/20"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-stone-900" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-serif font-bold text-sm tracking-tight text-white">
                  Kaal Kuaan Safety Assistant
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#B84A3A] text-white rounded">
                  AI SAFETY
                </span>
              </div>
              <p className="text-[10px] text-stone-300 flex items-center space-x-1">
                <MapPin size={10} className="text-amber-400 shrink-0" />
                <span className="truncate max-w-[180px]">{locationName || 'Telangana'}</span>
                <span>•</span>
                <span>WALTA Act Safety Framework</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setMessages([]);
                setPendingDraft(null);
              }}
              title="Reset conversation"
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Quick Context Strip */}
        <div className="px-4 py-2 bg-stone-100/90 border-b border-stone-200 text-xs flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-1.5 text-stone-600 truncate text-[11px]">
            <span className="font-semibold text-stone-800">Surroundings:</span>
            <span>
              {nearbyHazards.length > 0
                ? `${nearbyHazards.length} registered hazard${nearbyHazards.length > 1 ? 's' : ''} within 1 km`
                : 'Zero hazards registered in 1 km'}
            </span>
          </div>
          {currentAlert && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-[#B84A3A] border border-rose-200 rounded-full shrink-0 flex items-center space-x-1 animate-pulse">
              <AlertTriangle size={11} />
              <span>Active Alert</span>
            </span>
          )}
        </div>

        {/* Quick Action Pills Strip */}
        <div className="px-3.5 py-2 bg-[#F3F0E8] border-b border-stone-200 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
          {currentAlert && (
            <button
              onClick={() => handleSendMessage('Why did I get this alert?')}
              className="px-2.5 py-1 text-[11px] font-bold bg-[#B84A3A] hover:bg-[#94382B] text-white rounded-lg whitespace-nowrap transition flex items-center space-x-1 shadow-xs cursor-pointer shrink-0"
            >
              <AlertTriangle size={12} />
              <span>🚨 Explain My Alert</span>
            </button>
          )}
          <button
            onClick={() => handleSendMessage('Are there any reported borewells near me?')}
            className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg whitespace-nowrap transition flex items-center space-x-1 cursor-pointer shrink-0 shadow-2xs"
          >
            <MapPin size={12} className="text-stone-600" />
            <span>📍 Hazards Near Me</span>
          </button>
          <button
            onClick={() => handleSendMessage('What should I do if I find an uncovered borewell?')}
            className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg whitespace-nowrap transition flex items-center space-x-1 cursor-pointer shrink-0 shadow-2xs"
          >
            <ShieldAlert size={12} className="text-[#B84A3A]" />
            <span>🛡️ What Should I Do?</span>
          </button>
          <button
            onClick={() => handleSendMessage('Report this location as dangerous')}
            className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg whitespace-nowrap transition flex items-center space-x-1 cursor-pointer shrink-0 shadow-2xs"
          >
            <Camera size={12} className="text-stone-600" />
            <span>📸 Report a Hazard</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAF8F2]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-stone-900 text-white rounded-br-xs'
                    : 'bg-white border border-stone-300 text-stone-800 rounded-bl-xs'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-line space-y-1">
                  {msg.content}
                </div>

                {/* Structured Confirmation Card for Draft Reports */}
                {msg.reportDraft && (
                  <div className="mt-3 p-3 bg-red-50/70 border border-[#B84A3A]/40 rounded-xl space-y-2 text-stone-900">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-[#B84A3A] uppercase tracking-wider">
                      <AlertTriangle size={13} />
                      <span>Submit Hazard Report?</span>
                    </div>
                    <div className="text-[11px] space-y-1 text-stone-700 bg-white p-2 rounded-lg border border-stone-200">
                      <div>
                        <span className="font-bold text-stone-900">Location:</span> {msg.reportDraft.locationName}
                      </div>
                      {msg.reportDraft.coordinates && (
                        <div>
                          <span className="font-bold text-stone-900">Coordinates:</span>{' '}
                          <span className="font-mono">
                            {msg.reportDraft.coordinates.lat.toFixed(4)}, {msg.reportDraft.coordinates.lng.toFixed(4)}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-stone-900">Report type:</span> {msg.reportDraft.hazardType}
                      </div>
                      <div>
                        <span className="font-bold text-stone-900">Description:</span> {msg.reportDraft.description}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => handleConfirmReport(msg.reportDraft)}
                        disabled={loading}
                        className="flex-1 py-1.5 bg-[#B84A3A] hover:bg-[#94382B] text-white text-[11px] font-bold rounded-lg shadow-sm transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle2 size={13} />
                        <span>Submit Report</span>
                      </button>
                      <button
                        onClick={handleCancelDraft}
                        disabled={loading}
                        className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-medium rounded-lg transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-stone-200 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(act)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-[11px] font-semibold rounded-md shadow-2xs transition flex items-center space-x-1 cursor-pointer"
                      >
                        {act.type === 'VIEW_ON_MAP' && <Eye size={12} className="text-[#B84A3A]" />}
                        {act.type === 'VIEW_HAZARD' && <AlertTriangle size={12} className="text-amber-600" />}
                        {act.type === 'REPORT_HAZARD' && <Camera size={12} className="text-stone-600" />}
                        {act.type === 'CONFIRM_REPORT' && <CheckCircle2 size={12} className="text-[#B84A3A]" />}
                        {act.type === 'ENABLE_LOCATION' && <Navigation size={12} className="text-[#B84A3A]" />}
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[9px] text-stone-500 mt-1 px-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {/* Loading bubble */}
          {loading && (
            <div className="flex items-center space-x-2 text-stone-500 text-xs p-2 bg-white border border-stone-200 rounded-xl w-32 shadow-2xs animate-pulse">
              <Sparkles size={14} className="text-[#B84A3A] animate-spin" />
              <span className="font-medium">Analyzing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-stone-300 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about nearby borewells, sirens, or reporting..."
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs bg-[#FAF8F2] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A3A]/30 focus:border-[#B84A3A] text-stone-900 placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="p-2 bg-[#B84A3A] hover:bg-[#94382B] active:bg-[#7E302A] disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl shadow-sm transition flex items-center justify-center cursor-pointer"
              title="Send message"
            >
              <Send size={15} />
            </button>
          </form>
          <p className="text-[10px] text-stone-500 text-center mt-1.5 font-sans">
            Kaal Kuaan Safety Assistant • Grounded strictly in official Telangana hazard records
          </p>
        </div>
      </div>
    </div>
  );
};
