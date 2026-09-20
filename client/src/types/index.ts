export type WellStatus = 'UNVERIFIED' | 'ACTION_REQUIRED' | 'CAPPED_PENDING_AUDIT' | 'VERIFIED_SAFE';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type UserRole = 'PUBLIC' | 'FIELD_OFFICER' | 'PANCHAYAT' | 'DISTRICT_ADMIN' | 'SUPER_ADMIN';

export interface TimelineEvent {
  date: string;
  timestamp: string;
  event: string;
  actor: string;
  statusType: 'info' | 'warning' | 'danger' | 'success';
}

export interface WellPhoto {
  type: 'SATELLITE' | 'FIELD_EVIDENCE' | 'CAPPING_CONFIRMATION' | 'REPORT';
  url: string;
  caption?: string;
  timestamp: string;
}

export interface WellEvidence {
  diameterEstimate: string;
  voidSignature: string;
  nearHabitation: boolean;
  distanceToSchool: string;
  distanceToRoad: string;
  summary: string;
}

export interface QRCertificate {
  certificateId: string;
  issuedAt: string;
  officer: string;
  verificationId: string;
  sealHash: string;
}

export interface Well {
  _id: string;
  wellId: string;
  isDemoTarget?: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  district: string;
  mandal: string;
  village: string;
  surveyNumber: string;
  status: WellStatus;
  riskLevel: RiskLevel;
  detectionSource: string;
  detectionConfidence: number;
  detectionDate: string;
  permitStatus: 'NO_RECORD' | 'MATCHED' | 'EXPIRED' | 'UNREGISTERED_DRILLING';
  permitDetails?: {
    permitNumber: string;
    applicantName: string;
    rigOperatorId: string;
  };
  evidence: WellEvidence;
  photos: WellPhoto[];
  lastInspection: string | null;
  compliance?: {
    noticeIssued: boolean;
    noticeDate: string | null;
    deadline: string | null;
    assignedAuthority: string;
    enforcementStage: 'NOTICE_PENDING' | 'NOTICE_DISPATCHED' | 'CAPPING_ORDERED' | 'CAPPED_VERIFIED';
  };
  qrCertificate?: QRCertificate;
  timeline: TimelineEvent[];
}

export interface ComplianceRecord {
  _id: string;
  complianceId: string;
  wellId: string;
  district: string;
  mandal: string;
  village: string;
  surveyNumber: string;
  landownerName: string;
  status: 'ACTION_REQUIRED' | 'NOTICE_SERVED' | 'CAPPING_ENFORCED' | 'VERIFIED_SAFE' | 'OVERDUE';
  flaggedDate: string;
  statutoryDeadline: string;
  noticeReferenceNumber?: string;
  noticeDispatchedAt?: string;
  penaltyApplicable?: boolean;
  penaltyAmount?: number;
  assignedOfficer: string;
  actionsLog: Array<{
    action: string;
    actor: string;
    timestamp: string;
  }>;
}

export interface AuditLogEntry {
  _id: string;
  logId: string;
  timestamp: string;
  timeFormatted: string;
  wellId: string;
  action: string;
  actor: string;
  role: string;
  newState?: string;
  details: string;
  entryHash?: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  jurisdiction: {
    district: string;
    mandal?: string;
    village?: string;
  };
  badgeOrPhone?: string;
}

export interface StatisticsData {
  total: number;
  unverified: number;
  highRisk: number;
  actionRequired: number;
  verifiedSafe: number;
  mandalBreakdown: Array<{
    _id: string;
    total: number;
    highRisk: number;
    actionRequired: number;
    verifiedSafe: number;
    unverified: number;
  }>;
  lastUpdated: string;
}

export type ProximityLevel = 'CRITICAL' | 'NEARBY' | 'VICINITY' | 'SECURED';

export interface HazardItem {
  id: string;
  wellId?: string;
  hazardType: string;
  area: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceMeters: number;
  proximityLevel: ProximityLevel;
  riskLevel: RiskLevel;
  status: WellStatus | string;
  lastVerified?: string;
  description?: string;
  imageUrl?: string;
}

export type ReportLifecycleStatus = 'Pending' | 'Under Review' | 'Verified' | 'Resolved';

export interface CitizenReport {
  _id: string;
  reportId: string;
  userId: string;
  hazardType: string;
  area: string;
  locationName?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  photo?: string;
  description: string;
  status: ReportLifecycleStatus;
  wellId?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
