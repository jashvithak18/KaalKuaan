import React, { useState, useEffect } from 'react';
import { CitizenHeader, ActiveNavView } from './components/common/CitizenHeader';
import { PublicLandingPage } from './pages/PublicLandingPage';
import { LocationPermissionView } from './features/location/LocationPermissionView';
import { SafetyScanView } from './features/scan/SafetyScanView';
import { CitizenMapView } from './features/map/CitizenMapView';
import { ReportHazardModal } from './features/reports/ReportHazardModal';
import { MyReportsView } from './features/reports/MyReportsView';
import { ProfileView } from './features/profile/ProfileView';
import { AuthModal } from './features/auth/AuthModal';
import { FieldVerificationModal } from './features/verification/FieldVerificationModal';
import { QRCertificateModal } from './features/certificate/QRCertificateModal';
import { ProximityNotificationToast } from './components/notifications/ProximityNotificationToast';
import { SafetyAssistantPanel } from './features/assistant/SafetyAssistantPanel';
import { SafetyAssistantTrigger } from './features/assistant/SafetyAssistantTrigger';
import { useAuth } from './context/AuthContext';
import { useLocation } from './context/LocationContext';
import { api } from './services/api';
import { Well, ComplianceRecord, StatisticsData } from './types';

export const App: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { hasPermission, nearbyHazards } = useLocation();

  // Navigation views: 'LANDING' | 'PERMISSION' | 'SCAN' | 'MAP' | 'REPORTS' | 'PROFILE'
  const [currentView, setCurrentView] = useState<ActiveNavView>('LANDING');
  const [focusedHazardId, setFocusedHazardId] = useState<string | undefined>(undefined);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Admin and Data state
  const [wells, setWells] = useState<Well[]>([]);
  const [compliances, setCompliances] = useState<ComplianceRecord[]>([]);
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [selectedWell, setSelectedWell] = useState<Well | null>(null);

  const [reportsKey, setReportsKey] = useState(0);

  const refreshBackendData = async () => {
    try {
      const [w, c, s] = await Promise.all([
        api.getWells(),
        api.getCompliances(),
        api.getStatistics()
      ]);
      setWells(w);
      setCompliances(c);
      setStats(s);
      setReportsKey((k) => k + 1);
    } catch (e) {
      console.error('Data refresh error:', e);
    }
  };

  useEffect(() => {
    refreshBackendData();
  }, []);

  // Handlers - strictly gate all operational features behind authentication
  const handleProtectedAction = (action: () => void) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    action();
  };

  const handleCheckSurroundings = () => {
    handleProtectedAction(() => {
      if (!hasPermission) {
        setCurrentView('PERMISSION');
      } else {
        setCurrentView('SCAN');
      }
    });
  };

  const handleExploreMap = () => {
    handleProtectedAction(() => {
      setCurrentView('MAP');
    });
  };

  const handleAuthSuccess = () => {
    if (!hasPermission) {
      setCurrentView('PERMISSION');
    } else {
      setCurrentView('SCAN');
    }
  };

  const handleLocationGranted = () => {
    setCurrentView('SCAN');
  };

  const handleViewHazardOnMap = (hazardId?: string) => {
    handleProtectedAction(() => {
      setFocusedHazardId(hazardId);
      setCurrentView('MAP');
    });
  };

  const handleOpenReport = () => {
    handleProtectedAction(() => {
      setIsReportModalOpen(true);
    });
  };

  const handleIssueNotice = async (complianceId: string) => {
    try {
      await api.issueNotice(complianceId, {});
      await refreshBackendData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitVerification = async (wellId: string, payload: any) => {
    try {
      await api.verifyWell(wellId, payload);
      await refreshBackendData();
      setIsVerificationModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-screen overflow-x-hidden bg-[#F3F0E8] text-stone-900 select-none">
      {/* 1. Universal Citizen Navigation Header */}
      <CitizenHeader
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'LANDING') {
            setCurrentView('LANDING');
            return;
          }
          handleProtectedAction(() => {
            if (view === 'SCAN' && !hasPermission) {
              setCurrentView('PERMISSION');
            } else {
              setCurrentView(view);
            }
          });
        }}
        onOpenReportModal={handleOpenReport}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* 2. Main Viewport Switcher */}
      <main className="flex-1 flex flex-col">
        {currentView === 'LANDING' && (
          <PublicLandingPage
            onCheckSurroundings={handleCheckSurroundings}
            onOpenMap={handleExploreMap}
            onReportHazard={handleOpenReport}
            onSignIn={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* Protected Feature Views: If user somehow navigates directly without being authenticated, show Landing + AuthModal */}
        {isAuthenticated ? (
          <>
            {currentView === 'PERMISSION' && (
              <LocationPermissionView
                onLocationGranted={handleLocationGranted}
                onViewMap={handleExploreMap}
              />
            )}

            {currentView === 'SCAN' && (
              <SafetyScanView
                onViewOnMap={handleViewHazardOnMap}
                onReportHazard={handleOpenReport}
                onChangeLocation={() => setCurrentView('PERMISSION')}
              />
            )}

            {currentView === 'MAP' && (
              <CitizenMapView
                focusedHazardId={focusedHazardId}
                onBackToScan={() => setCurrentView('SCAN')}
                onReportHazard={handleOpenReport}
              />
            )}

            {currentView === 'REPORTS' && (
              <MyReportsView
                key={reportsKey}
                onReportNew={handleOpenReport}
                onViewHazard={(wellId) => handleViewHazardOnMap(wellId)}
              />
            )}

            {currentView === 'PROFILE' && (
              <ProfileView
                onViewMyReports={() => setCurrentView('REPORTS')}
                onSelectArea={() => setCurrentView('PERMISSION')}
              />
            )}
          </>
        ) : (
          currentView !== 'LANDING' && (
            <div className="max-w-md mx-auto my-auto px-4 py-16 text-center animate-fadeIn">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center text-stone-700">
                🔒
              </div>
              <h2 className="text-xl font-serif font-bold text-stone-900">Sign In Required</h2>
              <p className="text-xs text-stone-600 mt-2 mb-5">
                Surrounding safety radar, live hazard maps, and citizen reports require an authenticated profile.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-2.5 bg-[#B84A3A] hover:bg-[#94382B] text-white font-bold text-xs rounded-lg shadow-sm transition"
              >
                Sign In / Register
              </button>
            </div>
          )
        )}
      </main>

      {/* 3. Global Action & Flow Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <ReportHazardModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => {
          refreshBackendData();
          setCurrentView('REPORTS');
        }}
        initialWellId={focusedHazardId}
      />

      {/* Verification and Certificate Desks */}
      <FieldVerificationModal
        well={selectedWell}
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSubmitVerification={handleSubmitVerification}
      />

      <QRCertificateModal
        well={selectedWell}
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
      />

      {/* 4. Active Proximity Alert Notification within 1km (Toast + Audio + Push Notification) */}
      <ProximityNotificationToast
        onViewHazard={(hazardId) => handleViewHazardOnMap(hazardId)}
      />

      {/* 5. AI Safety Assistant (Understated Floating Trigger + Contextual Panel) */}
      {isAuthenticated && (
        <>
          <SafetyAssistantTrigger
            onClick={() => setIsAssistantOpen(true)}
            hasActiveAlert={
              nearbyHazards.some(
                (h) => h.distanceMeters <= 1000 &&
                       h.status !== 'VERIFIED_SAFE' &&
                       h.status !== 'CAPPED_PENDING_AUDIT'
              )
            }
          />
          <SafetyAssistantPanel
            isOpen={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
            onViewOnMap={(hazardId) => {
              handleViewHazardOnMap(hazardId);
            }}
            onOpenReportModal={handleOpenReport}
            onReportSubmitted={() => {
              refreshBackendData();
              setReportsKey((prev) => prev + 1);
            }}
            currentAlert={
              nearbyHazards.find(
                (h) => h.distanceMeters <= 1000 &&
                       h.status !== 'VERIFIED_SAFE' &&
                       h.status !== 'CAPPED_PENDING_AUDIT'
              ) || null
            }
          />
        </>
      )}
    </div>
  );
};
export default App;
