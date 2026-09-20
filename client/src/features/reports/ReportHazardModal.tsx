import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { api } from '../../services/api';
import { X, Camera, MapPin, AlertCircle, CheckCircle, Upload } from 'lucide-react';

interface ReportHazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialHazardType?: string;
  initialWellId?: string;
}

const HAZARD_TYPES = [
  'Uncovered Borewell',
  'Abandoned Borewell',
  'Open Irrigation Well',
  'Damaged/Unsafe Cover',
  'Dry Agricultural Drilling Pit',
  'Other Field Hazard'
];

export const ReportHazardModal: React.FC<ReportHazardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialHazardType = 'Uncovered Borewell',
  initialWellId
}) => {
  const { user } = useAuth();
  const { userLocation, locationName } = useLocation();

  const [hazardType, setHazardType] = useState(initialHazardType);
  const [area, setArea] = useState(locationName || 'Ramanapet, Vemulapally');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [lat, setLat] = useState<number>(userLocation?.lat || 17.0542);
  const [lng, setLng] = useState<number>(userLocation?.lng || 79.2685);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a brief description of the site or surroundings');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.submitHazardReport({
        userId: user?.userId || 'USR-PUBLIC-04',
        hazardType,
        area: area.trim(),
        coordinates: { lat, lng },
        photo: photoUrl.trim() || 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80',
        description: description.trim(),
        wellId: initialWellId
      });

      setSubmitting(false);

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Submission failed');
      }
    } catch (err: any) {
      setSubmitting(false);
      setError(err.message || 'Network error while submitting report');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-50 border border-stone-300 rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-900 text-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-terracotta-400 uppercase tracking-widest block">
              Direct Citizen Action
            </span>
            <h3 className="text-base font-semibold text-white">Report Unsafe Borewell</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-130px)]">
            {error && (
              <div className="p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Hazard Type Select */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Hazard Classification
              </label>
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-600/30 focus:border-terracotta-600 font-medium text-stone-900"
              >
                {HAZARD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Area & GPS Coordinates */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Village / Land Location
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Ramanapet School Road, Survey No. 142"
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-600/30 focus:border-terracotta-600 text-stone-900"
                required
              />

              <div className="p-2.5 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-between text-xs text-stone-600">
                <div className="flex items-center space-x-1.5">
                  <MapPin size={14} className="text-terracotta-600" />
                  <span className="font-medium">Auto-Attached Coordinates:</span>
                </div>
                <span className="font-mono text-stone-800 font-semibold">
                  {lat.toFixed(5)}° N, {lng.toFixed(5)}° E
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Field Observations / Landmarks
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe diameter, depth, absence of barricade, proximity to school/homes, or landowner details..."
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-600/30 focus:border-terracotta-600 resize-none text-stone-900"
                required
              />
            </div>

            {/* Photo URL or Quick Presets */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Site Photo Proof (Optional)
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Paste photo link or select a field sample below..."
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-600/30 focus:border-terracotta-600 mb-2 text-stone-900"
              />
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80')}
                  className="text-[11px] px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded transition cursor-pointer"
                >
                  Use Uncapped Field Photo
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80')}
                  className="text-[11px] px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded transition cursor-pointer"
                >
                  Use Dry Pit Photo
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-stone-500 leading-normal pt-2 border-t border-stone-200">
              ⚖️ Reports submitted to Kaal Kuaan are routed directly to the Mandal Revenue Officer and Gram Panchayat for immediate barricading and statutory WALTA Act notice issuance.
            </p>
          </div>

          {/* Fixed Modal Footer Action Bar - Always Visible */}
          <div className="px-6 py-4 bg-stone-100 border-t border-stone-300 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold bg-[#B84A3A] hover:bg-[#94382B] active:bg-[#7E302A] text-white !text-white rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-2 cursor-pointer"
            >
              <CheckCircle size={15} className="text-white" />
              <span>{submitting ? 'Transmitting Notice...' : 'Submit Citizen Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
