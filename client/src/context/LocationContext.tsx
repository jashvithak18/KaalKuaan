import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { HazardItem, ProximityLevel } from '../types';
import { api } from '../services/api';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface PresetLocation {
  name: string;
  district: string;
  mandal: string;
  coordinates: LocationCoordinates;
  description: string;
}

export const PRESET_LOCATIONS: PresetLocation[] = [
  {
    name: 'Ramanapet Village Baseline (High Risk Demo)',
    district: 'Nalgonda',
    mandal: 'Vemulapally',
    coordinates: { lat: 17.0542, lng: 79.2685 },
    description: 'Direct field demonstration zone near uncapped high-risk wells'
  },
  {
    name: 'Settipalem Agricultural Sector',
    district: 'Nalgonda',
    mandal: 'Vemulapally',
    coordinates: { lat: 17.0620, lng: 79.2810 },
    description: 'Irrigation belt with verified & pending compliance notices'
  },
  {
    name: 'Vemulapally Mandal HQ',
    district: 'Nalgonda',
    mandal: 'Vemulapally',
    coordinates: { lat: 17.0490, lng: 79.2550 },
    description: 'Panchayat administrative cluster and primary school zone'
  },
  {
    name: 'Miryalaguda Town Outskirts',
    district: 'Nalgonda',
    mandal: 'Miryalaguda',
    coordinates: { lat: 16.8720, lng: 79.5630 },
    description: 'Urban periphery with newly drilled private residential borewells'
  },
  {
    name: 'Suryapet Rural Perimeter',
    district: 'Suryapet',
    mandal: 'Suryapet',
    coordinates: { lat: 17.1439, lng: 79.6239 },
    description: 'Mixed farmland and highway corridor borewell registry'
  },
  {
    name: 'Hyderabad Cyberabad Safe Hub (No Nearby Hazards)',
    district: 'Hyderabad',
    mandal: 'Serilingampally',
    coordinates: { lat: 17.4435, lng: 78.3812 },
    description: 'Urban test point to experience Zero-Hazard / All Clear status'
  }
];

interface LocationContextType {
  userLocation: LocationCoordinates | null;
  locationName: string;
  hasPermission: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'error' | 'initial';
  errorMessage: string | null;
  isScanning: boolean;
  nearbyHazards: HazardItem[];
  allHazards: HazardItem[];
  requestLocation: () => Promise<{ success: boolean; message?: string }>;
  setManualLocation: (preset: PresetLocation | { name: string; coordinates: LocationCoordinates }) => void;
  runScan: () => Promise<void>;
  activeFilter: 'ALL' | 'CRITICAL' | 'NEARBY' | 'VICINITY';
  setActiveFilter: (filter: 'ALL' | 'CRITICAL' | 'NEARBY' | 'VICINITY') => void;
}

// Haversine distance calculator in meters
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function classifyProximity(distanceMeters: number, status?: string): ProximityLevel {
  if (status === 'VERIFIED_SAFE' || status === 'CAPPED_PENDING_AUDIT') {
    return 'SECURED';
  }
  if (distanceMeters <= 100) return 'CRITICAL';
  if (distanceMeters <= 500) return 'NEARBY';
  return 'VICINITY';
}

const LocationContext = createContext<LocationContextType>({
  userLocation: null,
  locationName: 'Not Located',
  hasPermission: false,
  permissionStatus: 'initial',
  errorMessage: null,
  isScanning: false,
  nearbyHazards: [],
  allHazards: [],
  requestLocation: async () => ({ success: false }),
  setManualLocation: () => {},
  runScan: async () => {},
  activeFilter: 'ALL',
  setActiveFilter: () => {}
});

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(() => {
    const saved = localStorage.getItem('kaalkuaan_location');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const [locationName, setLocationName] = useState<string>(() => {
    return localStorage.getItem('kaalkuaan_location_name') || 'Awaiting Location Access...';
  });

  const [hasPermission, setHasPermission] = useState<boolean>(() => {
    return localStorage.getItem('kaalkuaan_loc_permission') === 'granted';
  });

  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'error' | 'initial'>(() => {
    return (localStorage.getItem('kaalkuaan_loc_permission') as any) || 'initial';
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [rawWells, setRawWells] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'NEARBY' | 'VICINITY'>('ALL');

  // Load wells data on mount
  useEffect(() => {
    api.getWells().then((wells) => {
      setRawWells(wells);
    }).catch(console.error);
  }, []);

  // Check browser permission status if supported
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (result.state === 'denied') {
          setPermissionStatus('denied');
        } else if (result.state === 'granted') {
          setPermissionStatus('granted');
        }
        result.onchange = () => {
          if (result.state === 'denied') {
            setPermissionStatus('denied');
            setHasPermission(false);
          } else if (result.state === 'granted') {
            setPermissionStatus('granted');
          }
        };
      }).catch(() => {});
    }
  }, []);

  // Compute hazards synchronously whenever userLocation or rawWells changes
  const allHazards = useMemo<HazardItem[]>(() => {
    if (!userLocation || rawWells.length === 0) {
      return [];
    }

    const computed: HazardItem[] = rawWells.map((well) => {
      const dist = calculateDistanceMeters(
        userLocation.lat,
        userLocation.lng,
        well.coordinates.lat,
        well.coordinates.lng
      );
      const prox = classifyProximity(dist, well.status);

      return {
        id: well._id,
        wellId: well.wellId,
        hazardType: well.hazardType || (well.status === 'VERIFIED_SAFE' ? 'Secured Borewell' : 'Uncovered Borewell'),
        area: well.area || `${well.village}, ${well.mandal}`,
        coordinates: well.coordinates,
        distanceMeters: dist,
        proximityLevel: prox,
        riskLevel: well.riskLevel,
        status: well.status,
        lastVerified: well.lastVerified || (well.timeline && well.timeline[0]?.date) || 'Recent',
        description: well.description || well.evidence?.summary,
        imageUrl: well.photos?.[0]?.url
      };
    });

    // Sort ascending by distance
    return computed.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [userLocation, rawWells]);

  // Filter hazards strictly within 1000m synchronously
  const nearbyHazards = useMemo<HazardItem[]>(() => {
    return allHazards.filter((h) => h.distanceMeters <= 1000);
  }, [allHazards]);

  // Request true live geolocation from browser
  const requestLocation = async (): Promise<{ success: boolean; message?: string }> => {
    setIsScanning(true);
    setErrorMessage(null);

    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser.';
      setErrorMessage(msg);
      setPermissionStatus('error');
      setIsScanning(false);
      return { success: false, message: msg };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };

          setUserLocation(coords);
          setHasPermission(true);
          setPermissionStatus('granted');
          setErrorMessage(null);
          localStorage.setItem('kaalkuaan_loc_permission', 'granted');
          localStorage.setItem('kaalkuaan_location', JSON.stringify(coords));

          // Format readable GPS name
          const gpsLabel = `Live GPS (${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E)`;
          setLocationName(gpsLabel);
          localStorage.setItem('kaalkuaan_location_name', gpsLabel);

          // Try reverse-geocoding via OpenStreetMap Nominatim for human-readable village/city name
          try {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=14&addressdetails=1`)
              .then(r => r.json())
              .then(data => {
                if (data && data.address) {
                  const place = data.address.suburb || data.address.village || data.address.town || data.address.city || data.address.county || data.address.state_district || 'Detected Area';
                  const district = data.address.state_district || data.address.state || '';
                  const fullName = `${place}${district ? `, ${district}` : ''} (Live GPS)`;
                  setLocationName(fullName);
                  localStorage.setItem('kaalkuaan_location_name', fullName);
                }
              })
              .catch(() => {});
          } catch (e) {}

          setIsScanning(false);
          resolve({ success: true });
        },
        (err) => {
          setIsScanning(false);
          let userMsg = 'Location permission was denied. Please allow location access in your browser.';
          if (err.code === err.PERMISSION_DENIED) {
            userMsg = 'Location access was blocked. Please tap the lock/permission icon in your browser address bar and choose "Allow".';
            setPermissionStatus('denied');
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            userMsg = 'GPS signal is currently unavailable. You can select your Telangana area manually below.';
            setPermissionStatus('error');
          } else if (err.code === err.TIMEOUT) {
            userMsg = 'Location request timed out. Please try again or pick a region below.';
            setPermissionStatus('error');
          }
          setErrorMessage(userMsg);
          resolve({ success: false, message: userMsg });
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });
  };

  const setManualLocation = (preset: PresetLocation | { name: string; coordinates: LocationCoordinates }) => {
    setUserLocation(preset.coordinates);
    setLocationName(preset.name);
    setHasPermission(true);
    setPermissionStatus('granted');
    setErrorMessage(null);
    localStorage.setItem('kaalkuaan_loc_permission', 'granted');
    localStorage.setItem('kaalkuaan_location', JSON.stringify(preset.coordinates));
    localStorage.setItem('kaalkuaan_location_name', preset.name);
  };

  const runScan = async () => {
    setIsScanning(true);
    // Refresh wells list from server
    try {
      const wells = await api.getWells();
      setRawWells(wells);
    } catch (e) {
      console.error('Scan refresh error:', e);
    } finally {
      // Simulate realistic safety sonar scan delay
      setTimeout(() => {
        setIsScanning(false);
      }, 700);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        locationName,
        hasPermission,
        permissionStatus,
        errorMessage,
        isScanning,
        nearbyHazards,
        allHazards,
        requestLocation,
        setManualLocation,
        runScan,
        activeFilter,
        setActiveFilter
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
