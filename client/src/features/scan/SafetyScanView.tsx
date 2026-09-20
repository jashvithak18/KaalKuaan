import React, { useState } from 'react';
import { useLocation, PRESET_LOCATIONS } from '../../context/LocationContext';
import { HazardItem, ProximityLevel } from '../../types';
import {
  AlertTriangle,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Eye,
  Flag,
  ChevronRight,
  Filter,
  Radio,
  ExternalLink,
  ShieldAlert,
  Info,
  Navigation
} from 'lucide-react';

interface SafetyScanViewProps {
  onViewOnMap: (hazardId?: string) => void;
  onReportHazard: () => void;
  onChangeLocation: () => void;
}

export const SafetyScanView: React.FC<SafetyScanViewProps> = ({
  onViewOnMap,
  onReportHazard,
  onChangeLocation
}) => {
  const {
    userLocation,
    locationName,
    nearbyHazards,
    allHazards,
    isScanning,
    runScan,
    setManualLocation
  } = useLocation();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'NEARBY' | 'VICINITY'>('ALL');

  // Filter nearby hazards (within 1km)
  const filteredHazards = nearbyHazards.filter((h) => {
    if (activeFilter === 'ALL') return true;
    return h.proximityLevel === activeFilter;
  });

  // Check if there is a critical hazard within 100m
  const criticalHazard = nearbyHazards.find((h) => h.proximityLevel === 'CRITICAL');
  // Check if any unsafe hazard exists within 1km
  const hasUnsafeNearby = nearbyHazards.some(
    (h) => h.status !== 'VERIFIED_SAFE' && h.status !== 'CAPPED_PENDING_AUDIT'
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* 1. Location Bar & Radar Scanning Status */}
      <div className="bg-stone-50 border border-stone-300 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-700">
              <Radio size={20} className={isScanning ? 'animate-spin' : ''} />
            </div>
            {isScanning && (
              <span className="absolute w-12 h-12 rounded-full border-2 border-terracotta-400 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Current Monitored Area
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-200 text-stone-700">
                1.0 KM RADIUS
              </span>
            </div>
            <p className="text-sm font-semibold text-stone-900 truncate max-w-md">
              {locationName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={onChangeLocation}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#B84A3A] hover:bg-[#94382B] rounded-lg transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
            title="Update or fix detected location"
          >
            <Navigation size={13} className="shrink-0" />
            <span>Update Live GPS</span>
          </button>
          <button
            onClick={runScan}
            disabled={isScanning}
            className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
            title="Refresh surrounding scan"
          >
            <RefreshCw size={13} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'Scanning...' : 'Rescan'}</span>
          </button>
        </div>
      </div>

      {/* 2. Prominent Nearby Hazard Alert Banner (Enlarged) */}
      {criticalHazard ? (
        <div className="bg-rose-950 text-white border-3 border-rose-500 ring-4 ring-rose-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-5">
            <div className="p-4 bg-rose-600 text-white rounded-2xl shrink-0 animate-pulse shadow-lg">
              <ShieldAlert size={40} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 text-xs font-mono font-black tracking-widest text-white uppercase bg-rose-600 rounded-full">
                  🚨 CRITICAL PROXIMITY ALERT
                </span>
                <span className="text-sm font-mono font-black text-amber-300">
                  {criticalHazard.distanceMeters} METERS FROM YOUR STEP
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-white leading-tight">
                ⚠️ Emergency Warning: Open Borewell Within 100 Meters!
              </h3>
              <p className="text-sm sm:text-base text-stone-200 leading-relaxed max-w-3xl">
                An active <strong className="text-white underline decoration-amber-400">{criticalHazard.hazardType}</strong> ({criticalHazard.wellId || 'Reported Void'}) is situated approximately <strong className="text-white">{criticalHazard.distanceMeters} meters</strong> from your live coordinates in <strong className="text-white">{criticalHazard.area}</strong>. Unfenced voids in weeds and field paths present fatal fall hazards.
              </p>

              <div className="pt-3 flex flex-wrap gap-3">
                <button
                  onClick={() => onViewOnMap(criticalHazard.id)}
                  className="px-5 py-3 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center space-x-2 cursor-pointer"
                >
                  <Eye size={16} />
                  <span>Inspect Hazard on Live Map</span>
                </button>
                <button
                  onClick={onReportHazard}
                  className="px-5 py-3 bg-white hover:bg-stone-100 text-rose-950 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center space-x-2 cursor-pointer shadow"
                >
                  <Flag size={16} />
                  <span>Report Update / Flag Unmarked Well</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : hasUnsafeNearby ? (
        <div className="bg-stone-900 text-white border-3 border-amber-500 ring-4 ring-amber-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-5">
            <div className="p-4 bg-amber-500 text-stone-950 rounded-2xl shrink-0 shadow-lg">
              <AlertTriangle size={38} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 text-xs font-mono font-black tracking-widest text-stone-950 uppercase bg-amber-400 rounded-full">
                  ⚠️ SURROUNDING VIGILANCE REQUIRED
                </span>
                <span className="text-sm font-mono font-black text-amber-300">
                  {nearbyHazards.length} Registered Hazard{nearbyHazards.length > 1 ? 's' : ''} Within 1 KM
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-white leading-tight">
                Active & Unverified Wells Detected Nearby
              </h3>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-3xl">
                Kaal Kuaan has flagged active or unverified wells within walking distance of your current position. Review the hazard cards below before traversing unpaved rural tracks or farmland.
              </p>
              <div className="pt-3 flex flex-wrap gap-2.5">
                <button
                  onClick={() => onViewOnMap()}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition inline-flex items-center space-x-2 cursor-pointer shadow-lg"
                >
                  <Eye size={16} />
                  <span>Explore All Surrounding Hazards on Map</span>
                </button>
                <button
                  onClick={onReportHazard}
                  className="px-5 py-3 bg-[#B84A3A] hover:bg-[#94382B] active:bg-[#7E302A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition inline-flex items-center space-x-2 cursor-pointer shadow-lg border border-white/20"
                >
                  <Flag size={16} className="text-white" />
                  <span>Report Unsafe Borewell</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-6 shadow-2xs text-center sm:text-left flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="p-3 bg-emerald-600 text-white rounded-full">
            <ShieldCheck size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-serif font-bold text-emerald-950">
              Surroundings Monitored — No Open Hazards Within 1 km
            </h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              No uncapped borewells or hazardous cavities are registered in this 1000m radius. All nearby documented structures are capped or verified safe.
            </p>
          </div>
          <button
            onClick={onReportHazard}
            className="px-4 py-2.5 bg-[#B84A3A] hover:bg-[#94382B] active:bg-[#7E302A] text-white font-bold text-xs rounded-lg transition whitespace-nowrap shadow flex items-center space-x-1.5 cursor-pointer"
          >
            <Flag size={14} />
            <span>Report Unsafe Borewell</span>
          </button>
        </div>
      )}

      {/* 3. Proximity Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center space-x-1 bg-stone-200/80 p-1 rounded-lg">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeFilter === 'ALL'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Within 1km ({nearbyHazards.length})
          </button>
          <button
            onClick={() => setActiveFilter('CRITICAL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center space-x-1 ${
              activeFilter === 'CRITICAL'
                ? 'bg-white text-rose-800 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
            <span>&lt; 100m Critical ({nearbyHazards.filter(h => h.proximityLevel === 'CRITICAL').length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('NEARBY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center space-x-1 ${
              activeFilter === 'NEARBY'
                ? 'bg-white text-amber-800 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>&lt; 500m ({nearbyHazards.filter(h => h.proximityLevel === 'NEARBY').length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('VICINITY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center space-x-1 ${
              activeFilter === 'VICINITY'
                ? 'bg-white text-stone-800 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-stone-500 inline-block" />
            <span>&lt; 1km ({nearbyHazards.filter(h => h.proximityLevel === 'VICINITY').length})</span>
          </button>
        </div>

        <button
          onClick={() => onViewOnMap()}
          className="text-xs font-semibold text-terracotta-700 hover:text-terracotta-900 flex items-center space-x-1 self-end sm:self-center"
        >
          <span>View All on Map</span>
          <ExternalLink size={13} />
        </button>
      </div>

      {/* 4. Hazard Cards List */}
      <div className="space-y-3">
        {filteredHazards.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 border border-stone-200 rounded-xl">
            <Info size={24} className="mx-auto text-stone-400 mb-2" />
            <p className="text-sm font-semibold text-stone-700">No hazards match the selected distance filter.</p>
            <p className="text-xs text-stone-500 mt-1">Switch filter back to "All" or test another area in Telangana.</p>
          </div>
        ) : (
          filteredHazards.map((hazard) => {
            const isCritical = hazard.proximityLevel === 'CRITICAL';
            const isSecured = hazard.status === 'VERIFIED_SAFE' || hazard.status === 'CAPPED_PENDING_AUDIT';
            const isNearby = hazard.proximityLevel === 'NEARBY';

            return (
              <div
                key={hazard.id}
                className={`p-4 bg-white border rounded-xl transition shadow-2xs hover:shadow-sm ${
                  isCritical
                    ? 'border-rose-300 bg-rose-50/30'
                    : isSecured
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isNearby
                    ? 'border-amber-200'
                    : 'border-stone-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Proximity badge */}
                      {isCritical ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white rounded">
                          🔴 CRITICAL &lt; 100M
                        </span>
                      ) : isSecured ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white rounded">
                          🟢 SECURED / CAPPED
                        </span>
                      ) : isNearby ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white rounded">
                          🟠 NEARBY &lt; 500M
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-stone-500 text-white rounded">
                          🟡 VICINITY &lt; 1KM
                        </span>
                      )}

                      <span className="text-xs font-mono font-bold text-stone-900">
                        {hazard.distanceMeters}m from you
                      </span>

                      {hazard.wellId && (
                        <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                          {hazard.wellId}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-stone-900">
                      {hazard.hazardType}
                    </h4>

                    <div className="flex items-center space-x-1.5 text-xs text-stone-600">
                      <MapPin size={13} className="shrink-0 text-stone-400" />
                      <span>{hazard.area}</span>
                      <span className="text-stone-300">•</span>
                      <span className="font-mono text-stone-500">
                        {hazard.coordinates.lat.toFixed(4)}° N, {hazard.coordinates.lng.toFixed(4)}° E
                      </span>
                    </div>

                    {hazard.description && (
                      <p className="text-xs text-stone-600 leading-relaxed pt-0.5">
                        {hazard.description}
                      </p>
                    )}

                    <div className="pt-1 text-[11px] text-stone-600">
                      Last Verified / Registry Update: <span className="font-medium text-stone-700">{hazard.lastVerified}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <button
                      onClick={() => onViewOnMap(hazard.id)}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition flex items-center space-x-1.5 shadow-2xs"
                    >
                      <Eye size={13} />
                      <span>View on Map</span>
                    </button>
                    <button
                      onClick={onReportHazard}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg transition flex items-center space-x-1"
                    >
                      <Flag size={13} />
                      <span>Report Update</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Floating / Sticky Report a Hazard prompt */}
      <div className="p-5 bg-gradient-to-r from-red-50 to-amber-50 border-2 border-[#B84A3A]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-[#B84A3A] text-white rounded-xl shadow-sm shrink-0">
            <Flag size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900">
              Spotted an unlisted or uncapped borewell nearby?
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              Your GPS coordinates will be auto-attached so the local Panchayat and WALTA field officers can immediately verify and secure it.
            </p>
          </div>
        </div>
        <button
          onClick={onReportHazard}
          className="w-full sm:w-auto px-5 py-3 bg-[#B84A3A] hover:bg-[#94382B] active:bg-[#7E302A] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer shrink-0 border border-white/20"
        >
          <Flag size={16} />
          <span>Report Unsafe Borewell</span>
        </button>
      </div>
    </div>
  );
};
