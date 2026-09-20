import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { safetyNotifier } from '../../services/notificationService';
import {
  X,
  Shield,
  UserCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Navigation,
  Bell,
  ShieldAlert
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login'
}) => {
  const { login, signup, availableUsers, switchRole } = useAuth();
  const { requestLocation } = useLocation();
  const [mode, setMode] = useState<'login' | 'signup' | 'permissions'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Nalgonda');
  const [mandal, setMandal] = useState('Vemulapally');
  const [village, setVillage] = useState('Ramanapet');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await login(email.trim());
    setLoading(false);
    if (res.success) {
      // Transition to mandatory safety permissions prompt
      setMode('permissions');
    } else {
      setError(res.message || 'Login failed. Try demo accounts below.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await signup({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      district,
      mandal,
      village
    });
    setLoading(false);
    if (res.success) {
      setMode('permissions');
    } else {
      setError(res.message || 'Signup failed');
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setError(null);
    setLoading(true);
    const res = await login(userEmail);
    setLoading(false);
    if (res.success) {
      setMode('permissions');
    }
  };

  // Request both device Live Location & Push Notifications for hazard alerts
  const handleGrantPermissions = async () => {
    setLoadingPermissions(true);
    try {
      // 1. Request browser push notifications for siren and hazard popups
      await safetyNotifier.requestNotificationPermission();
      // 2. Request browser live location
      await requestLocation();
    } catch (e) {
      console.warn('Error granting permissions:', e);
    } finally {
      setLoadingPermissions(false);
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  const handleSkipPermissions = () => {
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-stone-50 border border-stone-300 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-stone-900 text-stone-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.jpg"
              alt="Kaal Kuaan Logo"
              className="w-9 h-9 rounded-lg object-cover shadow border border-stone-700"
            />
            <div>
              <h3 className="text-base font-semibold tracking-tight text-white">Kaal Kuaan Access</h3>
              <p className="text-xs text-stone-400">Public Borewell Safety Registry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch or Permission Header */}
        {mode !== 'permissions' ? (
          <div className="flex border-b border-stone-200 bg-stone-100">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                mode === 'login'
                  ? 'bg-white text-stone-900 border-b-2 border-terracotta-600'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Citizen Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                mode === 'signup'
                  ? 'bg-white text-stone-900 border-b-2 border-terracotta-600'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Register Citizen Profile
            </button>
          </div>
        ) : (
          <div className="bg-rose-950 text-white px-6 py-3.5 flex items-center space-x-2 border-b border-rose-800">
            <ShieldAlert size={18} className="text-rose-400 shrink-0 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-rose-200">
              Safety Alerts Setup Required
            </span>
          </div>
        )}

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'permissions' ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-[#B84A3A] shadow-inner">
                  <Navigation size={28} className={loadingPermissions ? 'animate-spin text-[#B84A3A]' : 'animate-pulse text-[#B84A3A]'} />
                </div>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  Allow Location & Push Notifications
                </h3>
                <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  Kaal Kuaan must calculate your live distance to open borewells within 1 km and automatically sound emergency sirens to prevent deadly falls.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="p-3 bg-white border border-stone-200 rounded-xl flex items-start space-x-3 shadow-2xs">
                  <div className="p-2 bg-terracotta-100 text-[#B84A3A] rounded-lg shrink-0 mt-0.5">
                    <Navigation size={18} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-stone-900">1. Live Location Access</h4>
                    <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">
                      Measures your physical distance in meters to uncapped borewells and open cavities within 1 km.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white border border-stone-200 rounded-xl flex items-start space-x-3 shadow-2xs">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                    <Bell size={18} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-stone-900">2. Push Notifications & Automatic Siren</h4>
                    <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">
                      Delivers pop-up alerts and automatically sounds the two-tone siren when an uncovered borewell is nearby.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={handleGrantPermissions}
                  disabled={loadingPermissions}
                  className="w-full py-3 px-4 bg-[#B84A3A] hover:bg-[#94382B] active:bg-[#7E302A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                >
                  <CheckCircle2 size={16} />
                  <span>{loadingPermissions ? 'Requesting Device Permissions...' : 'Allow Location & Push Notifications'}</span>
                </button>

                <button
                  onClick={handleSkipPermissions}
                  className="w-full py-2 text-xs font-medium text-stone-500 hover:text-stone-800 transition text-center cursor-pointer"
                >
                  Continue to Safety Radar →
                </button>
              </div>
            </div>
          ) : mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Registered Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. citizen.mallesh@public.in"
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-600/30 focus:border-terracotta-600"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-terracotta-600 hover:bg-terracotta-700 active:bg-terracotta-800 text-white font-medium text-sm rounded-lg shadow-sm transition flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. K. Srinivas Rao"
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-600/30 focus:border-terracotta-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.in"
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-600/30 focus:border-terracotta-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Phone (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-600/30 focus:border-terracotta-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-600/30 focus:border-terracotta-600"
                  >
                    <option value="Nalgonda">Nalgonda</option>
                    <option value="Suryapet">Suryapet</option>
                    <option value="Khammam">Khammam</option>
                    <option value="Yadadri Bhuvanagiri">Yadadri Bhuvanagiri</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Mandal
                  </label>
                  <input
                    type="text"
                    value={mandal}
                    onChange={(e) => setMandal(e.target.value)}
                    placeholder="Vemulapally"
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-600/30 focus:border-terracotta-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Village / Town
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Ramanapet"
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-600/30 focus:border-terracotta-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-terracotta-600 hover:bg-terracotta-700 text-white font-medium text-sm rounded-lg shadow-sm transition flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Creating Profile...' : 'Complete Registration'}</span>
                <CheckCircle2 size={16} />
              </button>
            </form>
          )}

          {/* Quick Demo Citizen Profiles (Only on login/signup modes) */}
          {mode !== 'permissions' && (
            <div className="pt-4 mt-4 border-t border-stone-200">
              <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                Instant Demo Access (One Click)
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => handleQuickLogin('citizen.mallesh@public.in')}
                  className="w-full flex items-center justify-between p-2.5 text-xs text-left bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-full bg-stone-300 flex items-center justify-center text-stone-700 font-bold">
                      M
                    </div>
                    <div>
                      <span className="font-semibold text-stone-900 block">G. Mallesh (Citizen)</span>
                      <span className="text-[10px] text-stone-500">Ramanapet, Vemulapally • Has 4 reports</span>
                    </div>
                  </div>
                  <span className="text-terracotta-700 font-medium hover:underline text-[11px]">Select →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
