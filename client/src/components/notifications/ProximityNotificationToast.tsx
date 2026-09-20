import React, { useEffect, useState } from 'react';
import { useLocation, calculateDistanceMeters } from '../../context/LocationContext';
import { safetyNotifier } from '../../services/notificationService';
import { AlertTriangle, ShieldAlert, X, ExternalLink } from 'lucide-react';

interface ProximityNotificationToastProps {
  onViewHazard?: (hazardId?: string) => void;
}

export const ProximityNotificationToast: React.FC<ProximityNotificationToastProps> = ({
  onViewHazard
}) => {
  const { nearbyHazards, userLocation } = useLocation();
  const [activeNotification, setActiveNotification] = useState<any | null>(null);

  // Monitor hazards strictly within 1km
  useEffect(() => {
    // If no user location or no nearby hazards, immediately dismiss and stop siren
    if (!userLocation || !nearbyHazards || nearbyHazards.length === 0) {
      setActiveNotification(null);
      safetyNotifier.stopSiren();
      return;
    }

    // Filter only dangerous/uncovered borewells strictly <= 1000m
    const dangerousHazards = nearbyHazards.filter(
      (h) => h.distanceMeters <= 1000 &&
             h.status !== 'VERIFIED_SAFE' &&
             h.status !== 'CAPPED_PENDING_AUDIT'
    );

    if (dangerousHazards.length > 0) {
      const nearest = dangerousHazards[0]; // already sorted by distance

      // Double-check real distance to current live coordinates
      const realDist = calculateDistanceMeters(
        userLocation.lat,
        userLocation.lng,
        nearest.coordinates.lat,
        nearest.coordinates.lng
      );

      // If real distance is greater than 1000m, DO NOT trigger alert
      if (realDist > 1000) {
        setActiveNotification(null);
        safetyNotifier.stopSiren();
        return;
      }

      const isCritical = realDist <= 100;

      setActiveNotification({
        hazard: nearest,
        isCritical,
        distanceMeters: realDist,
        area: nearest.area,
        hazardType: nearest.hazardType,
        id: nearest.id || nearest.wellId
      });

      // Automatically sound the official emergency hazard alert
      safetyNotifier.triggerHazardAlert({
        hazardId: nearest.id || nearest.wellId || 'unknown',
        hazardType: nearest.hazardType,
        area: nearest.area,
        distanceMeters: realDist,
        isCritical
      });
    } else {
      setActiveNotification(null);
      safetyNotifier.stopSiren();
    }

    return () => {
      // Clean up on location shift or unmount
      safetyNotifier.stopSiren();
    };
  }, [nearbyHazards, userLocation]);

  if (!activeNotification) return null;

  const isCritical = activeNotification.isCritical;

  return (
    <div className="fixed top-16 sm:top-20 right-4 left-4 sm:left-auto sm:w-[520px] z-[9999] animate-fadeIn">
      <div
        className={`rounded-2xl p-5 sm:p-6 shadow-2xl border-2 sm:border-3 transition-all backdrop-blur-md ${
          isCritical
            ? 'bg-rose-950 text-white border-rose-500 ring-4 ring-rose-500/30'
            : 'bg-stone-900 text-white border-amber-500 ring-4 ring-amber-500/20'
        }`}
      >
        {/* Header Tag and Close */}
        <div className="flex items-center justify-between pb-3 border-b border-white/15">
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 text-xs font-mono font-extrabold uppercase tracking-widest rounded-full ${
                isCritical
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-amber-500 text-stone-950'
              }`}
            >
              {isCritical ? '🚨 CRITICAL: UNCOVERED BOREWELL (<100M)' : '⚠️ UNCOVERED BOREWELL WITHIN 1 KM'}
            </span>
            <span className="text-xs font-mono text-stone-300 font-semibold">
              AUTOMATED ALERT
            </span>
          </div>

          <button
            onClick={() => setActiveNotification(null)}
            className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            title="Dismiss notification"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Alert Body */}
        <div className="mt-4 flex items-start space-x-4">
          <div
            className={`p-3.5 rounded-xl shrink-0 ${
              isCritical ? 'bg-rose-600 text-white animate-bounce-short' : 'bg-amber-500 text-stone-950'
            }`}
          >
            {isCritical ? <ShieldAlert size={34} /> : <AlertTriangle size={34} />}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-baseline space-x-2">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-white tracking-tight">
                {activeNotification.hazardType}
              </h3>
              <span className="font-mono text-sm sm:text-base font-black text-amber-300">
                • {activeNotification.distanceMeters}m away
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
              An uncovered borewell hazard has been detected approximately{' '}
              <strong className="text-white font-bold underline decoration-amber-400 decoration-2">
                {activeNotification.distanceMeters} meters
              </strong>{' '}
              from your live physical position in <strong>{activeNotification.area}</strong>.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-mono text-amber-300/90 flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span>Emergency Siren Sounded</span>
          </div>

          <button
            onClick={() => {
              if (onViewHazard) {
                onViewHazard(activeNotification.id);
              }
            }}
            className={`w-full sm:w-auto px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-lg transition flex items-center justify-center space-x-2 shadow-lg cursor-pointer ${
              isCritical
                ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700'
                : 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700'
            }`}
          >
            <span>View Exact Hazard on Map</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
