import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, PRESET_LOCATIONS } from '../../context/LocationContext';
import { User, MapPin, Shield, LogOut, FileText, CheckCircle, Navigation, ExternalLink } from 'lucide-react';

interface ProfileViewProps {
  onViewMyReports: () => void;
  onSelectArea: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onViewMyReports,
  onSelectArea
}) => {
  const { user, logout, role } = useAuth();
  const { locationName, userLocation } = useLocation();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fadeIn">
        <User size={48} className="mx-auto text-stone-400 mb-3" />
        <h3 className="text-lg font-serif font-bold text-stone-900">No Citizen Profile Loaded</h3>
        <p className="text-xs text-stone-600 mt-1 mb-4">Please sign in to view your profile and tracked reports.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Profile Card */}
      <div className="bg-stone-50 border border-stone-300 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-6 sm:p-8 border-b border-stone-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-terracotta-600 text-white font-serif font-bold text-xl flex items-center justify-center shadow-inner">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900">{user.name}</h3>
                <p className="text-xs text-stone-600 font-mono">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-stone-200 text-stone-800 rounded">
                    Role: {user.role}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                    Verified Citizen
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-stone-500 hover:text-rose-600 hover:bg-stone-200 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
              Registered District
            </span>
            <p className="text-sm font-semibold text-stone-800">
              {user.jurisdiction.district || 'Nalgonda'}, Telangana
            </p>
            <p className="text-xs text-stone-600 mt-0.5">
              Mandal: {user.jurisdiction.mandal || 'Vemulapally'}
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
              Phone / Alert Dispatch
            </span>
            <p className="text-sm font-semibold text-stone-800 font-mono">
              {user.badgeOrPhone || '+91 98480 12345'}
            </p>
            <p className="text-xs text-stone-600 mt-0.5">
              WhatsApp Alert Enabled
            </p>
          </div>

          <div className="sm:col-span-2 p-3.5 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                Active Monitoring GPS
              </span>
              <p className="text-xs font-semibold text-stone-800">
                {locationName}
              </p>
              {userLocation && (
                <p className="text-[11px] font-mono text-stone-600 mt-0.5">
                  {userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° E
                </p>
              )}
            </div>
            <button
              onClick={onSelectArea}
              className="px-3 py-1.5 text-xs font-medium text-terracotta-700 bg-terracotta-50 hover:bg-terracotta-100 border border-terracotta-200 rounded-lg transition"
            >
              Change
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-stone-100/60 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-start gap-3">
          <button
            onClick={onViewMyReports}
            className="w-full sm:w-auto px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-lg transition flex items-center justify-center space-x-2 shadow-2xs cursor-pointer"
          >
            <FileText size={16} />
            <span>View My Submitted Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};
