import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Well } from '../../types';
import { cadastralParcelsGeoJson } from '../../data/cadastralGeoJson';

interface FieldMapViewProps {
  wells: Well[];
  selectedWell: Well | null;
  onSelectWell: (well: Well) => void;
  satelliteMode: boolean;
  onToggleSatellite: (enabled: boolean) => void;
  publicView?: boolean;
  selectedDistrict: string;
}

// Geographic Centers and Zooms for Locations
const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  Nalgonda: { lat: 17.0580, lng: 79.2720, zoom: 13 },
  Vemulapally: { lat: 17.0542, lng: 79.2685, zoom: 14 },
  Miryalaguda: { lat: 17.0680, lng: 79.2880, zoom: 14 },
  Chityal: { lat: 17.0890, lng: 79.2450, zoom: 14 }
};

export const FieldMapView: React.FC<FieldMapViewProps> = ({
  wells,
  selectedWell,
  onSelectWell,
  satelliteMode,
  onToggleSatellite,
  publicView = false,
  selectedDistrict
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteTileLayerRef = useRef<L.TileLayer | null>(null);
  const parcelsLayerRef = useRef<L.GeoJSON | null>(null);
  const riskCircleRef = useRef<L.Circle | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCoord = DISTRICT_COORDINATES[selectedDistrict] || DISTRICT_COORDINATES.Nalgonda;

    const map = L.map(mapContainerRef.current, {
      center: [initialCoord.lat, initialCoord.lng],
      zoom: initialCoord.zoom,
      zoomControl: false,
      attributionControl: false
    });

    // Standard OpenStreetMap tiles (Reliable, open, zero API keys required)
    const standardLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);
    baseTileLayerRef.current = standardLayer;

    // Satellite Imagery Layer (Esri World Imagery)
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18
    });
    satelliteTileLayerRef.current = satelliteLayer;

    // Markers layer
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Zoom Control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Scale Control in bottom left
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size after mount to prevent layout shifts
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Prevent map overlaying / sizing issues with ResizeObserver
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Invalidate size whenever drawer opens or closes
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedWell]);

  // 3. React to Location / District changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const targetCoord = DISTRICT_COORDINATES[selectedDistrict] || DISTRICT_COORDINATES.Nalgonda;

    // Smoothly fly to the selected district / mandal
    map.flyTo([targetCoord.lat, targetCoord.lng], targetCoord.zoom, {
      duration: 1.2
    });
  }, [selectedDistrict]);

  // 4. Handle Satellite Toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !baseTileLayerRef.current || !satelliteTileLayerRef.current) return;

    if (satelliteMode) {
      map.removeLayer(baseTileLayerRef.current);
      satelliteTileLayerRef.current.addTo(map);
    } else {
      map.removeLayer(satelliteTileLayerRef.current);
      baseTileLayerRef.current.addTo(map);
    }
  }, [satelliteMode]);

  // 5. Render Cadastral Parcels
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (parcelsLayerRef.current) {
      map.removeLayer(parcelsLayerRef.current);
      parcelsLayerRef.current = null;
    }

    const parcels = L.geoJSON(cadastralParcelsGeoJson, {
      style: (feature: any) => {
        const isSelected = selectedWell && feature?.properties?.wellId === selectedWell.wellId;
        return {
          color: isSelected ? '#B84A3A' : '#6F624E',
          weight: isSelected ? 2 : 1,
          opacity: isSelected ? 0.9 : 0.45,
          dashArray: isSelected ? '' : '3, 4',
          fillColor: isSelected ? '#B84A3A' : '#7E916F',
          fillOpacity: isSelected ? 0.15 : 0.04
        };
      },
      onEachFeature: (feature: any, layer: L.Layer) => {
        if (feature?.properties?.surveyNo && !publicView) {
          layer.bindTooltip(`Sy. No. ${feature.properties.surveyNo} (${feature.properties.village})`, {
            permanent: false,
            direction: 'center',
            className: 'font-mono text-[10px] bg-parchment-surface text-carbon px-1.5 py-0.5 border border-[#CFC7B4] shadow-none'
          });
        }
      }
    }).addTo(map);

    parcelsLayerRef.current = parcels;
  }, [selectedWell, publicView]);

  // 6. Render Well Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    wells.forEach((well) => {
      const isSelected = selectedWell?.wellId === well.wellId;
      const isSafe = well.status === 'VERIFIED_SAFE';

      let bgClass = 'bg-[#B84A3A] border-[#7E302A]'; // Red Danger
      let dotColor = '#FFFFFF';

      if (isSafe) {
        bgClass = 'bg-[#68775E] border-[#3F4837]'; // Green Safe
      } else if (well.status === 'ACTION_REQUIRED' || well.riskLevel === 'MEDIUM') {
        bgClass = 'bg-[#D59B35] border-[#966B1E]'; // Amber Attention
      }

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="pointer-events: auto;">
          ${isSelected && !isSafe ? `<div class="absolute -inset-2.5 rounded-full border-2 border-warning-red animate-ping opacity-60"></div>` : ''}
          <div class="${bgClass} w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-md transition-transform ${isSelected ? 'scale-125 ring-2 ring-carbon' : 'hover:scale-110'}">
            <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${dotColor}"></div>
          </div>
          <div class="absolute top-7 font-mono text-[9px] font-bold px-1.5 py-0.5 bg-parchment-surface text-carbon border border-[#D5CFBF] whitespace-nowrap shadow-sm">
            ${well.wellId}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'field-well-marker',
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([well.coordinates.lat, well.coordinates.lng], { icon: customIcon });

      marker.on('click', () => {
        onSelectWell(well);
      });

      markersGroup.addLayer(marker);
    });
  }, [wells, selectedWell]);

  // 7. Focus on Selected Well & Draw Risk Radius
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (riskCircleRef.current) {
      map.removeLayer(riskCircleRef.current);
      riskCircleRef.current = null;
    }

    if (selectedWell) {
      map.panTo([selectedWell.coordinates.lat, selectedWell.coordinates.lng], {
        animate: true,
        duration: 0.6
      });

      if (selectedWell.status !== 'VERIFIED_SAFE') {
        const circle = L.circle([selectedWell.coordinates.lat, selectedWell.coordinates.lng], {
          radius: 180,
          color: '#B84A3A',
          weight: 1.5,
          dashArray: '3, 4',
          fillColor: '#B84A3A',
          fillOpacity: 0.08
        }).addTo(map);

        riskCircleRef.current = circle;
      }
    }
  }, [selectedWell]);

  return (
    <div className="relative w-full h-full flex-1 bg-parchment overflow-hidden z-0">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Right: Simple Map / Satellite Switcher */}
      <div className="absolute top-4 right-4 z-10 bg-parchment-surface border border-[#DDD7C7] p-1 shadow-subtle flex items-center gap-1 font-mono text-xs">
        <button
          onClick={() => onToggleSatellite(false)}
          className={`px-2.5 py-1 text-[11px] font-bold transition-colors ${
            !satelliteMode
              ? 'bg-carbon text-parchment'
              : 'text-earth hover:text-carbon'
          }`}
        >
          MAP
        </button>
        <button
          onClick={() => onToggleSatellite(true)}
          className={`px-2.5 py-1 text-[11px] font-bold transition-colors ${
            satelliteMode
              ? 'bg-carbon text-parchment'
              : 'text-earth hover:text-carbon'
          }`}
        >
          SATELLITE
        </button>
      </div>

      {/* Bottom Left: Safety Legend */}
      <div className="absolute bottom-6 left-4 z-10 bg-parchment-surface/95 border border-[#DDD7C7] px-3 py-2 shadow-subtle font-sans text-xs pointer-events-none">
        <div className="text-[10px] font-mono text-earth font-bold uppercase tracking-wider mb-1">
          LOCATION STATUS
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B84A3A]"></span>
            <span className="font-semibold text-carbon">High Risk / Unverified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D59B35]"></span>
            <span className="font-semibold text-carbon">Attention Needed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#68775E]"></span>
            <span className="font-semibold text-carbon">Verified Safe</span>
          </div>
        </div>
      </div>
    </div>
  );
};
