import React, { useState } from 'react';
import { useLocation, PRESET_LOCATIONS, PresetLocation } from '../../context/LocationContext';
import { safetyNotifier } from '../../services/notificationService';
import { Navigation, MapPin, ChevronRight, ShieldAlert, CheckCircle, Radio, Bell } from 'lucide-react';

interface LocationPermissionViewProps {
  onLocationGranted: () => void;
  onViewMap?: () => void;
}

export const LocationPermissionView: React.FC<LocationPermissionViewProps> = ({
  onLocationGranted,
  onViewMap
}) => {
  const {
    requestLocation,
    setManualLocation,
    isScanning,
    userLocation,
    locationName,
    hasPermission,
    permissionStatus,
    errorMessage
  } = useLocation();

  const [requestingGps, setRequestingGps] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleUseGps = async () => {
    setRequestingGps(true);
    setLocalError(null);
    try {
      // Request push notification permission for automated siren alerts
      await safetyNotifier.requestNotificationPermission();
      // Request device live location
      const res = await requestLocation();
      setRequestingGps(false);
      if (res.success) {
        onLocationGranted();
      } else {
        setLocalError(res.message || 'Could not acquire GPS position.');
        setShowPresets(true);
      }
    } catch (e: any) {
      setRequestingGps(false);
      setLocalError(e?.message || 'Error activating safety permissions.');
      setShowPresets(true);
    }
  };

  const handleSelectPreset = (preset: PresetLocation) => {
    setManualLocation(preset);
    onLocationGranted();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Main card */}
      <div className="bg-stone-50 border border-stone-300 rounded-xl shadow-sm overflow-hidden">
        <div className="p-8 sm:p-10 text-center border-b border-stone-200">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-terracotta-100 border border-terracotta-200 flex items-center justify-center text-terracotta-700 shadow-inner">
            <Navigation size={32} className={requestingGps ? 'animate-spin text-terracotta-600' : 'animate-pulse'} />
          </div>

          <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-terracotta-800 uppercase bg-terracotta-100/70 rounded-full border border-terracotta-200">
            Real-Time Proximity Protection
          </span>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-3">
            Allow Live Location & Push Notifications
          </h2>

          <p className="text-sm sm:text-base text-stone-600 max-w-lg mx-auto leading-relaxed">
            Kaal Kuaan calculates hazard distances from your live coordinates and automatically sounds an emergency siren when an uncovered borewell is detected within 1 km.
          </p>

          {(localError || errorMessage) && (
            <div className="mt-5 p-3.5 bg-rose-50 border border-rose-300 rounded-lg text-left text-xs text-rose-800 flex items-start space-x-2.5 max-w-lg mx-auto">
              <ShieldAlert size={18} className="shrink-0 text-rose-600 mt-0.5" />
              <div>
                <strong className="block font-semibold">Permissions Needed:</strong>
                <span>{localError || errorMessage}</span>
                <span className="block mt-1 text-stone-600">
                  Tip: Look at the top of your browser address bar and click the 🔒 icon to allow location and notifications, or choose a pre-mapped Telangana evaluation zone below.
                </span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleUseGps}
              disabled={requestingGps || isScanning}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#B84A3A] hover:bg-[#94382B] active:bg-[#7E302A] text-white !text-white font-bold text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <Navigation size={18} className="text-white shrink-0" />
              <span className="text-white font-bold">
                {requestingGps || isScanning ? 'Waiting for Browser Permission...' : 'Allow Location & Push Alerts'}
              </span>
            </button>

            <button
              onClick={() => setShowPresets(!showPresets)}
              className="w-full sm:w-auto px-5 py-3.5 bg-stone-200 hover:bg-stone-300 active:bg-stone-400 text-stone-800 font-semibold text-sm rounded-lg transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <MapPin size={18} />
              <span>Select Telangana Area Manually</span>
            </button>
          </div>

          <p className="mt-5 text-xs text-stone-600 flex items-center justify-center space-x-1">
            <span>🛡️ Privacy Notice: GPS coordinates remain strictly on your device and are only checked against public hazard points within 1 km.</span>
          </p>
        </div>

        {/* Preset Location Picker */}
        {showPresets && (
          <div className="p-6 bg-stone-100 border-t border-stone-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Select Tested Rural Evaluation Corridors
              </h4>
              <span className="text-[11px] text-stone-500">Includes baseline data</span>
            </div>

            <div className="space-y-2.5">
              {PRESET_LOCATIONS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="w-full p-3 text-left bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 rounded-lg transition flex items-center justify-between group shadow-2xs"
                >
                  <div className="pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-stone-900">{preset.name}</span>
                      {preset.district === 'Nalgonda' && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-900 rounded">
                          Pilot Zone
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">{preset.description}</p>
                    <span className="text-[10px] text-stone-600 font-mono">
                      {preset.coordinates.lat.toFixed(4)}° N, {preset.coordinates.lng.toFixed(4)}° E
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-stone-400 group-hover:text-terracotta-600 transition shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Location Status bar */}
        {userLocation && (
          <div className="px-6 py-4 bg-stone-100/60 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-medium text-stone-700">Active Location:</span>
              <span className="font-mono text-stone-800 truncate max-w-xs">{locationName}</span>
            </div>
            <button
              onClick={onLocationGranted}
              className="text-terracotta-700 hover:text-terracotta-900 font-semibold text-xs underline uppercase tracking-wider"
            >
              Proceed to Safety Scan →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
