import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { api } from '../../services/api';
import { Search, ShieldAlert, ShieldCheck, MapPin, AlertCircle, Navigation } from 'lucide-react';

interface PublicSafetyMapProps {
  onOpenReportModal: () => void;
}

export const PublicSafetyMap: React.FC<PublicSafetyMapProps> = ({ onOpenReportModal }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyDangers, setNearbyDangers] = useState<number>(1);
  const [publicWells, setPublicWells] = useState<any[]>([]);
  const [selectedVillage, setSelectedVillage] = useState('Ramanapet');
  const [activeCenter, setActiveCenter] = useState({ lat: 17.0542, lng: 79.2685 });

  // Fetch Public Wells
  const loadPublicData = async (query = '') => {
    try {
      const res = await api.getPublicMap({
        lat: activeCenter.lat,
        lng: activeCenter.lng,
        search: query
      });
      if (res.success) {
        setPublicWells(res.data);
        setNearbyDangers(res.meta.nearbyDangersWithin1km);
      }
    } catch (err) {
      console.error('Failed to load public map data:', err);
    }
  };

  useEffect(() => {
    loadPublicData();
  }, [activeCenter]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [activeCenter.lat, activeCenter.lng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Public Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (userCircleRef.current) {
      map.removeLayer(userCircleRef.current);
    }

    // Add 1km Citizen Safety Radius around focal point
    const circle = L.circle([activeCenter.lat, activeCenter.lng], {
      radius: 1000,
      color: '#B84A3A',
      weight: 1.5,
      dashArray: '5, 5',
      fillColor: '#B84A3A',
      fillOpacity: 0.05
    }).addTo(map);
    userCircleRef.current = circle;

    publicWells.forEach((w) => {
      const isSafe = w.status === 'VERIFIED_SAFE';
      const color = isSafe ? '#68775E' : '#B84A3A';

      const iconHtml = `
        <div class="flex items-center justify-center">
          <div style="background-color: ${color};" class="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white">
            <span style="font-size: 10px; font-weight: bold;">${isSafe ? '✓' : '!'}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'public-map-marker',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([w.coordinates.lat, w.coordinates.lng], { icon: customIcon });

      marker.bindPopup(`
        <div class="p-3 font-sans text-xs max-w-xs">
          <div class="font-bold text-sm ${isSafe ? 'text-muted-green' : 'text-warning-red'}">
            ${isSafe ? 'VERIFIED SAFE (CAPPED)' : 'DANGER: OPEN / UNVERIFIED BOREWELL'}
          </div>
          <div class="text-carbon font-semibold mt-1">
            Village: ${w.village}, Plot Sy. ${w.surveyNumber}
          </div>
          <div class="text-earth text-[11px] mt-0.5">
            ${isSafe ? 'Inspected and certified sealed with reinforced concrete slab.' : 'Hazardous open excavation. Keep children away.'}
          </div>
        </div>
      `);

      markersGroup.addLayer(marker);
    });
  }, [publicWells, activeCenter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPublicData(searchQuery);
  };

  const handleVillagePreset = (village: string, lat: number, lng: number) => {
    setSelectedVillage(village);
    setActiveCenter({ lat, lng });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([lat, lng]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-parchment">
      {/* Public Banner: Citizen Safety Radar */}
      <div className="bg-parchment-surface border-b border-[#DDD7C7] p-4 shadow-subtle">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-earth uppercase font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-warning-red" />
              <span>CITIZEN PROTECTION RADAR</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-carbon mt-0.5">
              KNOW THE DANGERS BEFORE YOU WALK THERE.
            </h1>
            <p className="text-xs text-earth mt-1">
              Public borewell safety accountability layer. Search your village or school to verify hazardous open holes.
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="px-4 py-2.5 bg-warning-red hover:bg-deep-red text-white text-xs font-bold tracking-wider transition-colors border border-deep-red flex items-center gap-2 shadow-subtle flex-shrink-0"
          >
            <AlertCircle className="w-4 h-4" />
            <span>REPORT A HAZARD NEAR YOU</span>
          </button>
        </div>

        {/* Proximity Risk Alert Strip */}
        <div className="max-w-5xl mx-auto mt-3 flex flex-wrap items-center justify-between gap-3 bg-parchment-dark/70 p-2.5 border border-[#D5CFBF]">
          <div className="flex items-center gap-2 text-xs font-mono text-carbon">
            <span className="w-2.5 h-2.5 rounded-full bg-warning-red animate-ping inline-block"></span>
            <span className="font-bold text-warning-red">{nearbyDangers} OPEN / UNVERIFIED WELL(S)</span>
            <span>reported within 1 km radius of {selectedVillage} Primary School.</span>
          </div>

          {/* Quick Village Presets */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-earth text-[11px]">QUICK SCAN:</span>
            <button
              onClick={() => handleVillagePreset('Ramanapet', 17.0542, 79.2685)}
              className={`px-2 py-0.5 border ${
                selectedVillage === 'Ramanapet' ? 'bg-carbon text-parchment' : 'bg-parchment text-carbon'
              }`}
            >
              Ramanapet
            </button>
            <button
              onClick={() => handleVillagePreset('Settipalem', 17.0620, 79.2810)}
              className={`px-2 py-0.5 border ${
                selectedVillage === 'Settipalem' ? 'bg-carbon text-parchment' : 'bg-parchment text-carbon'
              }`}
            >
              Settipalem
            </button>
            <button
              onClick={() => handleVillagePreset('Thimmapur', 17.0780, 79.2990)}
              className={`px-2 py-0.5 border ${
                selectedVillage === 'Thimmapur' ? 'bg-carbon text-parchment' : 'bg-parchment text-carbon'
              }`}
            >
              Thimmapur
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Public Map Container */}
      <div className="relative flex-1 w-full overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Search Bar */}
        <div className="absolute top-4 left-4 z-10 w-80 max-w-[calc(100vw-2rem)]">
          <form onSubmit={handleSearch} className="flex items-center bg-parchment-surface border-2 border-carbon shadow-panel">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search village, school, or road..."
              className="flex-1 px-3 py-2 text-xs bg-transparent focus:outline-none font-sans text-carbon"
            />
            <button type="submit" className="p-2 text-carbon hover:bg-parchment transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Public Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-parchment-surface/95 border border-[#DDD7C7] p-3 shadow-card max-w-xs font-sans text-xs">
          <div className="font-mono text-[10px] font-bold text-earth uppercase mb-1.5">
            SAFETY ADVISORY
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-muted-green flex items-center justify-center text-white text-[9px] font-bold">✓</span>
              <span className="text-carbon font-semibold">VERIFIED SAFE:</span>
              <span className="text-earth text-[11px]">Capped with certified concrete</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-warning-red flex items-center justify-center text-white text-[9px] font-bold">!</span>
              <span className="text-carbon font-semibold">DANGER / REPORTED:</span>
              <span className="text-earth text-[11px]">Keep children away</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
