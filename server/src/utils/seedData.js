const mongoose = require('mongoose');
const Well = require('../models/Well');
const Compliance = require('../models/Compliance');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Report = require('../models/Report');
const Verification = require('../models/Verification');

const seedDefaultData = async () => {
  try {
    // 1. Clear existing collections
    await Well.deleteMany({});
    await Compliance.deleteMany({});
    // We clear collections for fresh demo seed
    await mongoose.connection.collection('auditlogs').deleteMany({});
    await User.deleteMany({});
    await Report.deleteMany({});
    await Verification.deleteMany({});

    console.log('[SEED] Purged existing collections.');

    // 2. Create Default Users for role switching
    const users = [
      {
        userId: 'USR-ADMIN-01',
        name: 'S. Ramachandra Murthy, IAS',
        email: 'collector.nalgonda@telangana.gov.in',
        password: 'password123',
        role: 'DISTRICT_ADMIN',
        jurisdiction: { district: 'Nalgonda', mandal: 'ALL' },
        badgeOrPhone: '+91-8682-224001'
      },
      {
        userId: 'USR-OFFICER-02',
        name: 'K. Venkateshwar Rao',
        email: 'afo.vemulapally@agri.gov.in',
        password: 'password123',
        role: 'FIELD_OFFICER',
        jurisdiction: { district: 'Nalgonda', mandal: 'Vemulapally', village: 'Ramanapet' },
        badgeOrPhone: 'AFO-NL-884'
      },
      {
        userId: 'USR-PANCHAYAT-03',
        name: 'B. Anasuya Devi',
        email: 'sarpanch.ramanapet@panchayat.gov.in',
        password: 'password123',
        role: 'PANCHAYAT',
        jurisdiction: { district: 'Nalgonda', mandal: 'Vemulapally', village: 'Ramanapet' },
        badgeOrPhone: 'GP-SEC-402'
      },
      {
        userId: 'USR-PUBLIC-04',
        name: 'G. Mallesh (Local Citizen)',
        email: 'citizen.mallesh@public.in',
        password: 'password123',
        role: 'PUBLIC',
        jurisdiction: { district: 'Nalgonda', mandal: 'Vemulapally' },
        badgeOrPhone: '+91-98480-11223'
      }
    ];

    for (const u of users) {
      await User.create(u);
    }
    console.log('[SEED] Standard evaluation user profiles registered.');

    // 3. Seed Wells
    // Coords around Ramanapet / Vemulapally, Nalgonda, Telangana (Pilot baseline lat: 17.0542, lng: 79.2685)
    const wells = [
      {
        wellId: 'KK-TS-04289',
        hazardType: 'Uncovered Borewell',
        area: 'Ramanapet South Field, Telangana',
        description: 'Critical danger: Uncovered dry borewell cavity without casing cap, directly adjacent to farm walking path.',
        lastVerified: '19 Sep 2026',
        isDemoTarget: false,
        coordinates: { lat: 17.0548, lng: 79.2689 }, // ~85m from pilot baseline
        district: 'Nalgonda',
        mandal: 'Vemulapally',
        village: 'Ramanapet',
        surveyNumber: '141/2',
        status: 'UNVERIFIED',
        riskLevel: 'HIGH',
        detectionSource: 'LOCAL VOLUNTEER RADAR SCAN',
        detectionConfidence: 96,
        detectionDate: '19 Sep 2026',
        permitStatus: 'NO_RECORD',
        permitDetails: {
          permitNumber: 'NONE',
          applicantName: 'Unregistered Dry Pit',
          rigOperatorId: 'Unknown'
        },
        evidence: {
          diameterEstimate: '0.70m',
          voidSignature: 'Directly exposed bore opening flush with soil',
          nearHabitation: true,
          distanceToSchool: '95m from village residential perimeter',
          distanceToRoad: '12m from main field path',
          summary: 'Critical proximity hazard: Uncapped opening within 100 meters of walking path.'
        },
        photos: [
          {
            type: 'FIELD_EVIDENCE',
            url: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80',
            caption: 'Immediate field hazard: open pipe without welded cap',
            timestamp: new Date('2026-09-19T06:00:00Z')
          }
        ],
        compliance: {
          noticeIssued: false,
          noticeDate: null,
          deadline: '21 Sep 2026',
          assignedAuthority: 'Vemulapally Gram Panchayat',
          enforcementStage: 'NOTICE_PENDING'
        },
        timeline: [
          {
            date: '19 Sep',
            timestamp: new Date('2026-09-19T06:00:00Z'),
            event: 'Citizen flagged critical proximity uncovered borewell',
            actor: 'Citizen Safety Alert',
            statusType: 'danger'
          }
        ]
      },
      {
        wellId: 'KK-TS-04281',
        hazardType: 'Uncovered Borewell',
        area: 'Ramanapet School Road, Telangana',
        description: 'Reported 0.68m void cavity 180m from Zilla Parishad Primary School.',
        lastVerified: '18 Sep 2026',
        isDemoTarget: true,
        coordinates: { lat: 17.0558, lng: 79.2685 }, // ~178m from pilot baseline
        district: 'Nalgonda',
        mandal: 'Vemulapally',
        village: 'Ramanapet',
        surveyNumber: '142/3A',
        status: 'UNVERIFIED',
        riskLevel: 'HIGH',
        detectionSource: 'SIMULATED SATELLITE ANOMALY (Sentinel-2 Cadastral Overlay)',
        detectionConfidence: 87,
        detectionDate: '18 Sep 2026',
        permitStatus: 'NO_RECORD',
        permitDetails: {
          permitNumber: 'NONE',
          applicantName: 'Unregistered Agricultural Plot',
          rigOperatorId: 'Unknown Unlicensed Rig'
        },
        evidence: {
          diameterEstimate: '0.68m',
          voidSignature: 'Circular dark void reflectance signature confirmed',
          nearHabitation: true,
          distanceToSchool: '180m from Zilla Parishad Primary School Ramanapet',
          distanceToRoad: '25m from cart track / village boundary road',
          summary: 'High vulnerability: Unregistered void anomaly within 200m of primary school children walking corridor. High vegetation cover obscuring surface opening.'
        },
        photos: [
          {
            type: 'SATELLITE',
            url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
            caption: 'Simulated Cadastral Multispectral Anomaly Scan (Resolution: 10m bands re-sampled)',
            timestamp: new Date('2026-09-18T08:42:00Z')
          }
        ],
        compliance: {
          noticeIssued: false,
          noticeDate: null,
          deadline: '22 Sep 2026',
          assignedAuthority: 'Vemulapally Gram Panchayat Secretary',
          enforcementStage: 'NOTICE_PENDING'
        },
        timeline: [
          {
            date: '18 Sep',
            timestamp: new Date('2026-09-18T08:42:00Z'),
            event: 'Simulated satellite scan detected circular void anomaly',
            actor: 'GIS Pipeline / Sentinel-2 Feed',
            statusType: 'warning'
          },
          {
            date: '18 Sep',
            timestamp: new Date('2026-09-18T09:03:00Z'),
            event: 'Permit database cross-check: NO ACTIVE DRILLING RECORD found',
            actor: 'WALTA Permit Registry DB',
            statusType: 'danger'
          },
          {
            date: '19 Sep',
            timestamp: new Date('2026-09-19T06:30:00Z'),
            event: 'Risk classified as HIGH based on 180m primary school proximity',
            actor: 'Risk Engine',
            statusType: 'danger'
          },
          {
            date: '19 Sep',
            timestamp: new Date('2026-09-19T07:15:00Z'),
            event: 'Panchayat Secretary & Mandal Officer dispatch alert queued',
            actor: 'Alert Dispatcher',
            statusType: 'info'
          },
          {
            date: '19 Sep',
            timestamp: new Date('2026-09-19T10:00:00Z'),
            event: 'Field verification pending dispatch to AFO-NL-884',
            actor: 'Operations Console',
            statusType: 'warning'
          }
        ]
      },
      {
        wellId: 'KK-TS-04282',
        isDemoTarget: false,
        coordinates: { lat: 17.0620, lng: 79.2810 },
        district: 'Nalgonda',
        mandal: 'Miryalaguda',
        village: 'Settipalem',
        surveyNumber: '89/1B',
        status: 'ACTION_REQUIRED',
        riskLevel: 'HIGH',
        detectionSource: 'CITIZEN REPORT (WhatsApp Channel)',
        detectionConfidence: 94,
        detectionDate: '17 Sep 2026',
        permitStatus: 'EXPIRED',
        permitDetails: {
          permitNumber: 'WALTA-2023-NG-4412',
          applicantName: 'M. Chennaiah',
          rigOperatorId: 'Sri Sai Borewells (License Expired)'
        },
        evidence: {
          diameterEstimate: '0.80m',
          voidSignature: 'Open casing pipe protruding 10cm without cap',
          nearHabitation: true,
          distanceToSchool: '420m from Anganwadi Centre',
          distanceToRoad: '10m from main canal service road',
          summary: 'Agricultural borewell drilled in 2023 struck dry ground; casing left exposed without welded cap.'
        },
        photos: [
          {
            type: 'REPORT',
            url: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80',
            caption: 'Citizen field capture via WhatsApp',
            timestamp: new Date('2026-09-17T14:20:00Z')
          }
        ],
        compliance: {
          noticeIssued: true,
          noticeDate: '18 Sep 2026',
          deadline: '21 Sep 2026',
          assignedAuthority: 'Settipalem Gram Panchayat',
          enforcementStage: 'CAPPING_ORDERED'
        },
        timeline: [
          {
            date: '17 Sep',
            timestamp: new Date('2026-09-17T14:20:00Z'),
            event: 'Citizen submitted photo via WhatsApp Safety Bot (#KK-R-10982)',
            actor: 'Citizen (G. Mallesh)',
            statusType: 'warning'
          },
          {
            date: '18 Sep',
            timestamp: new Date('2026-09-18T10:15:00Z'),
            event: 'Field officer verified: UNPROTECTED CASING CONFIRMED',
            actor: 'AFO-NL-884',
            statusType: 'danger'
          },
          {
            date: '18 Sep',
            timestamp: new Date('2026-09-18T15:00:00Z'),
            event: 'Statutory Notice No. NG/VML/2026/089 served to landowner',
            actor: 'Panchayat Secretary',
            statusType: 'warning'
          }
        ]
      },
      {
        wellId: 'KK-TS-04283',
        isDemoTarget: false,
        coordinates: { lat: 17.0410, lng: 79.2520 },
        district: 'Nalgonda',
        mandal: 'Vemulapally',
        village: 'Buggabavigudem',
        surveyNumber: '55/2C',
        status: 'ACTION_REQUIRED',
        riskLevel: 'MEDIUM',
        detectionSource: 'SIMULATED DRONE SURVEY (Panchayat Cluster A)',
        detectionConfidence: 79,
        detectionDate: '16 Sep 2026',
        permitStatus: 'NO_RECORD',
        permitDetails: {
          permitNumber: 'NONE',
          applicantName: 'Unregistered Plot',
          rigOperatorId: 'Unknown'
        },
        evidence: {
          diameterEstimate: '0.55m',
          voidSignature: 'Unlined hole partially covered with thorny bushes',
          nearHabitation: false,
          distanceToSchool: '850m from nearest habitation',
          distanceToRoad: '150m from field bund',
          summary: 'Thorny bush placed loosely over 120-foot dry borewell; prone to displacement by cattle.'
        },
        photos: [
          {
            type: 'FIELD_EVIDENCE',
            url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
            caption: 'Drone oblique aerial capture (Simulated)',
            timestamp: new Date('2026-09-16T11:00:00Z')
          }
        ],
        compliance: {
          noticeIssued: true,
          noticeDate: '17 Sep 2026',
          deadline: '20 Sep 2026',
          assignedAuthority: 'Buggabavigudem GP',
          enforcementStage: 'NOTICE_DISPATCHED'
        },
        timeline: [
          {
            date: '16 Sep',
            timestamp: new Date('2026-09-16T11:00:00Z'),
            event: 'Drone thermal and RGB scan flagged unlined pit',
            actor: 'Drone Survey Pilot',
            statusType: 'warning'
          }
        ]
      },
      {
        wellId: 'KK-TS-04284',
        isDemoTarget: false,
        coordinates: { lat: 17.0780, lng: 79.2990 },
        district: 'Nalgonda',
        mandal: 'Miryalaguda',
        village: 'Thimmapur',
        surveyNumber: '210/4',
        status: 'VERIFIED_SAFE',
        riskLevel: 'LOW',
        detectionSource: 'SIMULATED SATELLITE ANOMALY (Sentinel-2)',
        detectionConfidence: 91,
        detectionDate: '12 Sep 2026',
        permitStatus: 'MATCHED',
        permitDetails: {
          permitNumber: 'WALTA-2024-NG-0192',
          applicantName: 'P. Sambasiva Rao',
          rigOperatorId: 'Kisan Drilling Co. (Reg: TS-NL-12)'
        },
        evidence: {
          diameterEstimate: '0.60m',
          voidSignature: 'Reinforced concrete cap with anchor bolts verified',
          nearHabitation: true,
          distanceToSchool: '600m',
          distanceToRoad: '40m',
          summary: 'Compliant installation: 150mm reinforced concrete slab installed flush with land boundary; inspection tag affixed.'
        },
        photos: [
          {
            type: 'CAPPING_CONFIRMATION',
            url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
            caption: 'Tamper-proof reinforced concrete slab verified on-site',
            timestamp: new Date('2026-09-15T16:00:00Z')
          }
        ],
        compliance: {
          noticeIssued: true,
          noticeDate: '13 Sep 2026',
          deadline: '16 Sep 2026',
          assignedAuthority: 'Thimmapur Gram Panchayat',
          enforcementStage: 'CAPPED_VERIFIED'
        },
        qrCertificate: {
          certificateId: 'CERT-NL-2026-09-8812',
          issuedAt: new Date('2026-09-15T16:30:00Z'),
          officer: 'K. Venkateshwar Rao (AFO-NL-884)',
          verificationId: 'KV-928180',
          sealHash: 'A89F2C10D4E7B988'
        },
        timeline: [
          {
            date: '12 Sep',
            timestamp: new Date('2026-09-12T09:00:00Z'),
            event: 'Anomaly detected near farm parcel',
            actor: 'Satellite Pipeline',
            statusType: 'info'
          },
          {
            date: '15 Sep',
            timestamp: new Date('2026-09-15T16:00:00Z'),
            event: 'Field capping verified: Steel-reinforced concrete cap certified',
            actor: 'AFO-NL-884',
            statusType: 'success'
          },
          {
            date: '15 Sep',
            timestamp: new Date('2026-09-15T16:30:00Z'),
            event: 'QR Safety Certificate CERT-NL-2026-09-8812 issued',
            actor: 'System / District Safety Desk',
            statusType: 'success'
          }
        ]
      },
      {
        wellId: 'KK-TS-04285',
        isDemoTarget: false,
        coordinates: { lat: 17.0315, lng: 79.2390 },
        district: 'Nalgonda',
        mandal: 'Vemulapally',
        village: 'Gudivada',
        surveyNumber: '17/8',
        status: 'VERIFIED_SAFE',
        riskLevel: 'LOW',
        detectionSource: 'PANCHAYAT VERIFICATION DRIVE',
        detectionConfidence: 98,
        detectionDate: '10 Sep 2026',
        permitStatus: 'MATCHED',
        permitDetails: {
          permitNumber: 'WALTA-2025-NG-9011',
          applicantName: 'T. Narsimha Reddy',
          rigOperatorId: 'Bhadradri Drilling Works'
        },
        evidence: {
          diameterEstimate: '0.65m',
          voidSignature: 'Welded steel plate lock in active agricultural use with pump motor',
          nearHabitation: true,
          distanceToSchool: '900m',
          distanceToRoad: '60m',
          summary: 'Active permitted borewell with locked steel enclosure. Safe.'
        },
        photos: [
          {
            type: 'CAPPING_CONFIRMATION',
            url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
            caption: 'Protective enclosure & steel lock mechanism verified',
            timestamp: new Date('2026-09-11T11:00:00Z')
          }
        ],
        compliance: {
          noticeIssued: false,
          noticeDate: null,
          deadline: null,
          assignedAuthority: 'Gudivada Gram Panchayat',
          enforcementStage: 'CAPPED_VERIFIED'
        },
        qrCertificate: {
          certificateId: 'CERT-NL-2026-09-8811',
          issuedAt: new Date('2026-09-11T12:00:00Z'),
          officer: 'T. Sridhar (AFO-NL-812)',
          verificationId: 'KV-928181',
          sealHash: '5B23EF89104AC391'
        },
        timeline: [
          {
            date: '10 Sep',
            timestamp: new Date('2026-09-10T10:00:00Z'),
            event: 'Routine pre-monsoon safety audit performed',
            actor: 'AFO-NL-812',
            statusType: 'success'
          },
          {
            date: '11 Sep',
            timestamp: new Date('2026-09-11T12:00:00Z'),
            event: 'QR Safety Certificate issued for compliant well',
            actor: 'District Safety Desk',
            statusType: 'success'
          }
        ]
      },
      {
        wellId: 'KK-TS-04286',
        isDemoTarget: false,
        coordinates: { lat: 17.0890, lng: 79.2450 },
        district: 'Nalgonda',
        mandal: 'Chityal',
        village: 'Kondrapole',
        surveyNumber: '94/2',
        status: 'UNVERIFIED',
        riskLevel: 'HIGH',
        detectionSource: 'SIMULATED SATELLITE ANOMALY (Sentinel-2)',
        detectionConfidence: 84,
        detectionDate: '19 Sep 2026',
        permitStatus: 'NO_RECORD',
        evidence: {
          diameterEstimate: '0.72m',
          voidSignature: 'Dark circular reflectance feature near field junction',
          nearHabitation: true,
          distanceToSchool: '310m from Government High School Kondrapole',
          distanceToRoad: '15m from rural link road',
          summary: 'High risk: Fresh drill spoil pile detected with no casing visible from satellite scan.'
        },
        photos: [
          {
            type: 'SATELLITE',
            url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
            caption: 'Fresh excavation anomaly flagged 19 Sep 2026',
            timestamp: new Date('2026-09-19T05:00:00Z')
          }
        ],
        compliance: {
          noticeIssued: false,
          noticeDate: null,
          deadline: '23 Sep 2026',
          assignedAuthority: 'Chityal Mandal Office',
          enforcementStage: 'NOTICE_PENDING'
        },
        timeline: [
          {
            date: '19 Sep',
            timestamp: new Date('2026-09-19T05:00:00Z'),
            event: 'Automated satellite scan flagged circular soil anomaly',
            actor: 'GIS Engine',
            statusType: 'warning'
          }
        ]
      }
    ];

    for (const w of wells) {
      await Well.create(w);
    }
    console.log(`[SEED] Seeded ${wells.length} operational borewells.`);

    // 4. Seed Compliances
    const compliances = [
      {
        complianceId: 'CMP-NL-2026-0041',
        wellId: 'KK-TS-04281',
        mandal: 'Vemulapally',
        village: 'Ramanapet',
        surveyNumber: '142/3A',
        landownerName: 'V. Krishnaiah / Legal Heirs',
        status: 'ACTION_REQUIRED',
        flaggedDate: '18 Sep 2026',
        statutoryDeadline: '22 Sep 2026',
        noticeReferenceNumber: 'REV/WALTA/2026/VML/0142',
        assignedOfficer: 'Panchayat Extension Officer, Vemulapally',
        actionsLog: [
          {
            action: 'Automated high-risk notice drafted',
            actor: 'System Rule Engine',
            timestamp: new Date('2026-09-18T10:00:00Z')
          }
        ]
      },
      {
        complianceId: 'CMP-NL-2026-0038',
        wellId: 'KK-TS-04282',
        mandal: 'Miryalaguda',
        village: 'Settipalem',
        surveyNumber: '89/1B',
        landownerName: 'M. Chennaiah',
        status: 'OVERDUE',
        flaggedDate: '14 Sep 2026',
        statutoryDeadline: '18 Sep 2026',
        noticeReferenceNumber: 'REV/WALTA/2026/MRG/0089',
        penaltyApplicable: true,
        penaltyAmount: 5000,
        assignedOfficer: 'Tahsildar Office Miryalaguda',
        actionsLog: [
          {
            action: '48-hour statutory closure notice served in person',
            actor: 'Village Revenue Officer',
            timestamp: new Date('2026-09-15T09:00:00Z')
          },
          {
            action: 'Deadline passed without verified capping. Statutory fine levied.',
            actor: 'Mandal Executive Magistrate',
            timestamp: new Date('2026-09-19T00:01:00Z')
          }
        ]
      },
      {
        complianceId: 'CMP-NL-2026-0035',
        wellId: 'KK-TS-04284',
        mandal: 'Miryalaguda',
        village: 'Thimmapur',
        surveyNumber: '210/4',
        landownerName: 'P. Sambasiva Rao',
        status: 'VERIFIED_SAFE',
        flaggedDate: '12 Sep 2026',
        statutoryDeadline: '16 Sep 2026',
        noticeReferenceNumber: 'REV/WALTA/2026/MRG/0210',
        assignedOfficer: 'Gram Panchayat Secretary',
        actionsLog: [
          {
            action: 'Capping verified on-site by AFO. Certified safe.',
            actor: 'AFO-NL-884',
            timestamp: new Date('2026-09-15T16:00:00Z')
          }
        ]
      }
    ];

    for (const c of compliances) {
      await Compliance.create(c);
    }
    console.log('[SEED] Seeded statutory compliance records.');

    // 5. Seed Audit Logs (Append-only style)
    const initialLogs = [
      {
        logId: 'AUD-2026-0001',
        timeFormatted: '18 Sep 08:42:15',
        wellId: 'KK-TS-04281',
        action: 'SATELLITE_SCAN_INGESTED',
        actor: 'GIS Engine (Sentinel-2 Simulated Feed)',
        role: 'SYSTEM',
        newState: 'UNVERIFIED',
        details: 'Circular void anomaly detected at (17.0542, 79.2685) with 87% spectral confidence.'
      },
      {
        logId: 'AUD-2026-0002',
        timeFormatted: '18 Sep 09:03:40',
        wellId: 'KK-TS-04281',
        action: 'PERMIT_REGISTRY_CROSSCHECK',
        actor: 'Permit Sync Worker',
        role: 'SYSTEM',
        newState: 'NO_RECORD',
        details: 'Discrepancy: Zero authorized drilling records found for Survey 142/3A Ramanapet.'
      },
      {
        logId: 'AUD-2026-0003',
        timeFormatted: '19 Sep 06:30:10',
        wellId: 'KK-TS-04281',
        action: 'RISK_SCORE_ELEVATION',
        actor: 'Vulnerability Engine',
        role: 'SYSTEM',
        newState: 'HIGH_RISK',
        details: 'Calculated proximity: 180m from Zilla Parishad Primary School Ramanapet.'
      },
      {
        logId: 'AUD-2026-0004',
        timeFormatted: '19 Sep 07:15:22',
        wellId: 'KK-TS-04281',
        action: 'PANCHAYAT_DISPATCH_NOTIFIED',
        actor: 'District Safety Network',
        role: 'SYSTEM',
        newState: 'ACTION_QUEUED',
        details: 'Automated notice dispatched to Vemulapally Mandal AFO-NL-884.'
      },
      {
        logId: 'AUD-2026-0005',
        timeFormatted: '19 Sep 09:12:00',
        wellId: 'KK-TS-04282',
        action: 'COMPLIANCE_PENALTY_LEVIED',
        actor: 'Mandal Executive Magistrate',
        role: 'DISTRICT_ADMIN',
        newState: 'OVERDUE',
        details: 'Statutory deadline expired for Settipalem borewell. ₹5,000 fine imposed under Section 19 WALTA Act.'
      }
    ];

    for (const log of initialLogs) {
      await AuditLog.create(log);
    }
    console.log('[SEED] Seeded tamper-evident immutable audit logs.');

    // 6. Seed Citizen WhatsApp & Citizen Web Reports
    const citizenReports = [
      {
        reportId: 'KK-R-10982',
        userId: 'USR-PUBLIC-04',
        hazardType: 'Uncapped Borewell',
        area: 'Settipalem village, near canal bund road',
        locationName: 'Settipalem village, near canal bund road',
        wellId: 'KK-TS-04282',
        reporterType: 'WHATSAPP_BOT',
        photo: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 17.0620, lng: 79.2810 },
        description: 'Open casing pipe protruding 10cm without cap near school path',
        language: 'te',
        status: 'Under Review',
        submittedAt: new Date(Date.now() - 36 * 3600 * 1000)
      },
      {
        reportId: 'KK-R-10983',
        userId: 'USR-PUBLIC-04',
        hazardType: 'Dry Agricultural Pit',
        area: 'Ramanapet Outskirts, Field 4',
        locationName: 'Ramanapet Outskirts, Field 4',
        reporterType: 'CITIZEN_PORTAL',
        photo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 17.0548, lng: 79.2689 },
        description: 'Uncovered drilling pit with no warning flag or barricade.',
        language: 'en',
        status: 'Pending',
        submittedAt: new Date(Date.now() - 4 * 3600 * 1000)
      },
      {
        reportId: 'KK-R-10980',
        userId: 'USR-PUBLIC-04',
        hazardType: 'Abandoned Open Well',
        area: 'Vemulapally Cross Road',
        locationName: 'Vemulapally Cross Road',
        wellId: 'KK-TS-04281',
        reporterType: 'CITIZEN_PORTAL',
        photo: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 17.0558, lng: 79.2685 },
        description: 'Deep unbarricaded cavity right along roadside walking trail.',
        language: 'te',
        status: 'Verified',
        submittedAt: new Date(Date.now() - 72 * 3600 * 1000)
      },
      {
        reportId: 'KK-R-10975',
        userId: 'USR-PUBLIC-04',
        hazardType: 'Uncapped Borewell',
        area: 'Near Gram Panchayat Office, Ramanapet',
        locationName: 'Near Gram Panchayat Office, Ramanapet',
        wellId: 'KK-TS-04284',
        reporterType: 'CITIZEN_PORTAL',
        photo: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 17.0512, lng: 79.2640 },
        description: 'Abandoned irrigation borewell successfully welded with iron safety flange.',
        language: 'en',
        status: 'Resolved',
        submittedAt: new Date(Date.now() - 120 * 3600 * 1000)
      }
    ];

    for (const report of citizenReports) {
      await Report.create(report);
    }
    console.log('[SEED] Seeded citizen reports across all 4 statuses.');

    console.log('[SEED] All initial Kaal Kuaan data seeded successfully.');
  } catch (error) {
    console.error('[SEED ERROR]', error);
    throw error;
  }
};

// If run directly via node command
if (require.main === module) {
  require('dotenv').config();
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kaalkuaan')
    .then(async () => {
      await seedDefaultData();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedDefaultData;
