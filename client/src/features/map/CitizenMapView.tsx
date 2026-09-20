import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useLocation } from '../../context/LocationContext';
import { HazardItem } from '../../types';
import { Navigation, Layers, ShieldAlert, ShieldCheck, Crosshair, AlertTriangle, ArrowLeft } from 'lucide-react';

interface CitizenMapViewProps {
  focusedHazardId?: string;
  onBackToScan: () => void;
  onReportHazard: () => void;
}

export const CitizenMapView: React.FC<CitizenMapViewProps> = ({
  focusedHazardId,
  onBackToScan,
  onReportHazard
}) => {
  const { userLocation, locationName, nearbyHazards, allHazards } = useLocation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const hazardsLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedHazard, setSelectedHazard] = useState<HazardItem | null>(null);
  const [satelliteView, setSatelliteView] = useState(false);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteTileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = userLocation?.lat || 17.0542;
    const initialLng = userLocation?.lng || 79.2685;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    // Clean OpenStreetMap tiles
    const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);
    baseTileLayerRef.current = osm;

    // Optional Esri Satellite layer
    const sat = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18 }
    );
    satelliteTileLayerRef.current = sat;

    hazardsLayerRef.current = L.layerGroup().addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Satellite Toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !baseTileLayerRef.current || !satelliteTileLayerRef.current) return;

    if (satelliteView) {
      map.removeLayer(baseTileLayerRef.current);
      satelliteTileLayerRef.current.addTo(map);
    } else {
      map.removeLayer(satelliteTileLayerRef.current);
      baseTileLayerRef.current.addTo(map);
    }
  }, [satelliteView]);

  // Render User Blue Pulsing Pin & 1000m / 100m rings
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }
    if (userCircleRef.current) {
      map.removeLayer(userCircleRef.current);
    }

    // User pulsating blue marker
    const userIcon = L.divIcon({
      className: 'user-location-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 rounded-full bg-blue-500/25 animate-ping"></div>
          <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
          <div class="absolute top-6 px-1.5 py-0.5 rounded bg-stone-900 text-white font-mono text-[9px] font-bold shadow whitespace-nowrap">
            YOU ARE HERE
          </div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 1000
    }).addTo(map);

    // 100m critical perimeter circle
    userCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
      radius: 100,
      color: '#dc2626',
      weight: 1.5,
      dashArray: '4, 4',
      fillColor: '#dc2626',
      fillOpacity: 0.05
    }).addTo(map);
  }, [userLocation]);

  // Render Hazards Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = hazardsLayerRef.current;
    if (!map || !group) return;

    group.clearLayers();

    allHazards.forEach((hazard) => {
      const isSelected = selectedHazard?.id === hazard.id;
      const isCritical = hazard.proximityLevel === 'CRITICAL';
      const isSecured = hazard.status === 'VERIFIED_SAFE' || hazard.status === 'CAPPED_PENDING_AUDIT';
      const isNearby = hazard.proximityLevel === 'NEARBY';

      let bg = '#d97706'; // Amber default
      let label = '!';
      let border = '#92400e';

      if (isSecured) {
        bg = '#059669'; // Emerald
        label = '✓';
        border = '#065f46';
      } else if (isCritical) {
        bg = '#dc2626'; // Red
        label = '⚠';
        border = '#991b1b';
      }

      const iconHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer">
          ${isCritical ? `<div class="absolute -inset-2 rounded-full border-2 border-rose-500 animate-ping opacity-75"></div>` : ''}
          <div style="background-color: ${bg}; border-color: ${border};" class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-white font-bold text-xs shadow-md transition transform ${isSelected ? 'scale-125 ring-2 ring-stone-900' : 'hover:scale-110'}">
            <span>${label}</span>
          </div>
          <div class="mt-1 px-1.5 py-0.5 rounded bg-white/95 text-stone-900 border border-stone-300 font-mono text-[9px] font-bold shadow-xs whitespace-nowrap">
            ${hazard.distanceMeters}m
          </div>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'citizen-hazard-marker',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([hazard.coordinates.lat, hazard.coordinates.lng], {
        icon: markerIcon
      });

      marker.on('click', () => {
        setSelectedHazard(hazard);
      });

      group.addLayer(marker);
    });
  }, [allHazards, selectedHazard]);

  // Focus on specified hazard if requested
  useEffect(() => {
    if (focusedHazardId && allHazards.length > 0) {
      const match = allHazards.find((h) => h.id === focusedHazardId || h.wellId === focusedHazardId);
      if (match) {
        setSelectedHazard(match);
        mapInstanceRef.current?.flyTo([match.coordinates.lat, match.coordinates.lng], 17, {
          duration: 1
        });
      }
    }
  }, [focusedHazardId, allHazards]);

  const recenterOnUser = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 0.8 });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-stone-100">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-[500] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={onBackToScan}
            className="px-3 py-2 bg-stone-900/90 hover:bg-stone-900 text-white rounded-lg shadow-md font-medium text-xs flex items-center space-x-1.5 transition backdrop-blur-xs"
          >
            <ArrowLeft size={15} />
            <span>Back to Radar Scan</span>
          </button>

          <div className="hidden sm:flex items-center px-3 py-2 bg-white/95 border border-stone-300 rounded-lg shadow-sm font-sans text-xs text-stone-800 backdrop-blur-xs">
            <span className="font-semibold text-stone-900 mr-1.5">Monitored:</span>
            <span className="truncate max-w-[200px]">{locationName}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={onReportHazard}
            className="px-3.5 py-2 bg-[#B84A3A] hover:bg-[#94382B] active:bg-[#7E302A] text-white rounded-lg shadow-lg font-bold text-xs flex items-center space-x-1.5 transition border border-white/30 cursor-pointer"
          >
            <AlertTriangle size={15} className="text-white shrink-0 animate-pulse" />
            <span className="hidden sm:inline">Report Unsafe Borewell</span>
            <span className="sm:hidden">Report Borewell</span>
          </button>

          <button
            onClick={() => setSatelliteView(!satelliteView)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg shadow-md transition flex items-center space-x-1.5 ${
              satelliteView
                ? 'bg-amber-600 text-white'
                : 'bg-white/95 hover:bg-stone-100 text-stone-800 border border-stone-300'
            }`}
          >
            <Layers size={15} />
            <span>{satelliteView ? 'Standard Map' : 'Satellite Overlay'}</span>
          </button>

          <button
            onClick={recenterOnUser}
            className="p-2 bg-white/95 hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg shadow-md transition"
            title="Recenter on your location"
          >
            <Crosshair size={18} />
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-6 left-4 z-[400] bg-white/95 border border-stone-300 rounded-lg px-3 py-2 shadow-md text-xs pointer-events-none hidden sm:block backdrop-blur-xs">
        <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
          Safety Legend
        </p>
        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-stone-700">You</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span className="text-stone-700">&lt;100m Danger</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-stone-700">&lt;500m Open</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="text-stone-700">Secured / Capped</span>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Rapid Borewell Reporting */}
      {!selectedHazard && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[450] pointer-events-auto">
          <button
            onClick={onReportHazard}
            className="px-6 py-3.5 bg-[#B84A3A] hover:bg-[#94382B] active:bg-[#7E302A] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-2xl flex items-center space-x-2 border-2 border-white cursor-pointer hover:scale-105 transition transform ring-4 ring-[#B84A3A]/30"
          >
            <AlertTriangle size={17} className="text-white shrink-0 animate-pulse" />
            <span>Report Unsafe Borewell</span>
          </button>
        </div>
      )}

      {/* Selected Hazard Drawer / Bottom Sheet */}
      {selectedHazard && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[500] bg-stone-50 border border-stone-300 rounded-xl p-4 shadow-xl animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {selectedHazard.proximityLevel === 'CRITICAL' ? (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded">
                  🔴 CRITICAL &lt; 100M
                </span>
              ) : selectedHazard.status === 'VERIFIED_SAFE' ? (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded">
                  🟢 VERIFIED CAPPED
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded">
                  🟠 OPEN HAZARD
                </span>
              )}
              <span className="font-mono text-xs font-bold text-stone-900">
                {selectedHazard.distanceMeters}m away
              </span>
            </div>
            <button
              onClick={() => setSelectedHazard(null)}
              className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1"
            >
              ✕
            </button>
          </div>

          <h3 className="font-serif font-bold text-stone-900 text-base mt-2">
            {selectedHazard.hazardType}
          </h3>

          <p className="text-xs text-stone-600 mt-1">
            📍 {selectedHazard.area}
          </p>

          {selectedHazard.description && (
            <p className="text-xs text-stone-700 mt-2 bg-stone-100 p-2 rounded border border-stone-200">
              {selectedHazard.description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-200 pt-2">
            <span>Coordinates:</span>
            <span className="font-mono text-stone-700">
              {selectedHazard.coordinates.lat.toFixed(5)}, {selectedHazard.coordinates.lng.toFixed(5)}
            </span>
          </div>

          <div className="mt-3 flex space-x-2">
            <button
              onClick={onReportHazard}
              className="flex-1 py-2 bg-[#B84A3A] hover:bg-[#94382B] text-white text-xs font-bold rounded-lg transition shadow flex items-center justify-center space-x-1"
            >
              <AlertTriangle size={14} />
              <span>Report Unsafe Borewell</span>
            </button>
            <button
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedHazard.coordinates.lat},${selectedHazard.coordinates.lng}`;
                window.open(url, '_blank');
              }}
              className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium rounded-lg transition"
            >
              Directions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
