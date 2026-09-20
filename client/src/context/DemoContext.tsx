import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

export type DemoStep = 
  | 'IDLE'
  | 'STEP_1_DETECT'         // Highlight KK-TS-04281 on map
  | 'STEP_2_OPEN_EVIDENCE'  // Open well profile drawer with explainable cards
  | 'STEP_3_FIELD_DISPATCH' // Open Field Verification modal
  | 'STEP_4_CAPPING_ACTION' // Confirm Capping / Mark safe
  | 'STEP_5_QR_CERTIFICATE' // Show printable QR safety certificate
  | 'STEP_6_PUBLIC_MAP';    // Show public map updated to safe green

interface DemoContextType {
  currentStep: DemoStep;
  isDemoActive: boolean;
  startDemo: () => void;
  nextStep: () => void;
  prevStep: () => void;
  exitDemo: () => void;
  resetAllData: () => Promise<void>;
  isResetting: boolean;
}

const DemoContext = createContext<DemoContextType>({
  currentStep: 'IDLE',
  isDemoActive: false,
  startDemo: () => {},
  nextStep: () => {},
  prevStep: () => {},
  exitDemo: () => {},
  resetAllData: async () => {},
  isResetting: false
});

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<DemoStep>('IDLE');
  const [isResetting, setIsResetting] = useState(false);

  const startDemo = () => {
    setCurrentStep('STEP_1_DETECT');
  };

  const nextStep = () => {
    switch (currentStep) {
      case 'STEP_1_DETECT':
        setCurrentStep('STEP_2_OPEN_EVIDENCE');
        break;
      case 'STEP_2_OPEN_EVIDENCE':
        setCurrentStep('STEP_3_FIELD_DISPATCH');
        break;
      case 'STEP_3_FIELD_DISPATCH':
        setCurrentStep('STEP_4_CAPPING_ACTION');
        break;
      case 'STEP_4_CAPPING_ACTION':
        setCurrentStep('STEP_5_QR_CERTIFICATE');
        break;
      case 'STEP_5_QR_CERTIFICATE':
        setCurrentStep('STEP_6_PUBLIC_MAP');
        break;
      case 'STEP_6_PUBLIC_MAP':
        setCurrentStep('IDLE');
        break;
      default:
        setCurrentStep('IDLE');
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case 'STEP_2_OPEN_EVIDENCE':
        setCurrentStep('STEP_1_DETECT');
        break;
      case 'STEP_3_FIELD_DISPATCH':
        setCurrentStep('STEP_2_OPEN_EVIDENCE');
        break;
      case 'STEP_4_CAPPING_ACTION':
        setCurrentStep('STEP_3_FIELD_DISPATCH');
        break;
      case 'STEP_5_QR_CERTIFICATE':
        setCurrentStep('STEP_4_CAPPING_ACTION');
        break;
      case 'STEP_6_PUBLIC_MAP':
        setCurrentStep('STEP_5_QR_CERTIFICATE');
        break;
      default:
        setCurrentStep('IDLE');
    }
  };

  const exitDemo = () => {
    setCurrentStep('IDLE');
  };

  const resetAllData = async () => {
    setIsResetting(true);
    try {
      await api.resetDemo();
      setCurrentStep('IDLE');
      window.location.reload();
    } catch (err) {
      console.error('Demo reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <DemoContext.Provider
      value={{
        currentStep,
        isDemoActive: currentStep !== 'IDLE',
        startDemo,
        nextStep,
        prevStep,
        exitDemo,
        resetAllData,
        isResetting
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => useContext(DemoContext);
