# KAAL KUAAN ("Danger Beneath Every Step")
### Indian Public-Safety Infrastructure Platform for Open & Abandoned Borewell Prevention

> **Core Axiom:** *“An open borewell is invisible until it becomes an emergency. Find the hole before someone falls into it.”*
> 
> 🌐 **Live Production Deployment:** [https://kaalkuaan.onrender.com](https://kaalkuaan.onrender.com)

---

## 1. Problem Statement
Every year across India, abandoned, dry, or illegally drilled agricultural borewells claim the lives of young children. These incidents trigger frantic multi-day rescue operations by the NDRF, SDRF, and local administrations—frequently ending in tragedy.

The fundamental failure is not a lack of technical capacity:
- State remote sensing agencies possess high-resolution satellite passes and drone capability.
- District Ground Water Departments maintain the WALTA (Water, Land and Trees Act) permit registries.
- Revenue Departments possess detailed cadastral maps with survey parcel numbers.
- Citizens carry smartphones with cameras and WhatsApp.
- Gram Panchayats possess statutory enforcement authority.

**The crisis exists because these systems operate in total isolation.** Drilling rigs drill dry holes and leave overnight without capping; Panchayats have no registry of illegal holes; satellite scans sit in GIS labs without ground dispatch; and parents only discover the opening when a child goes missing.

---

## 2. The Solution: Kaal Kuaan
**Kaal Kuaan** connects existing fragmented infrastructure into a unified operational safety network:
$$\text{FIELD REALITY} \longrightarrow \text{DETECTION} \longrightarrow \text{VERIFICATION} \longrightarrow \text{ACTION} \longrightarrow \text{COMPLIANCE} \longrightarrow \text{PUBLIC SAFETY}$$

### The Visual & Product Philosophy
- **Believable First, Beautiful Second:** Grounded in Indian cadastral land maps, field survey registers, weathered parchment (`#F3F0E8`), and physical safety stamps.
- **Zero AI Gimmickry:** No glowing neon borders, no purple AI gradients, no floating holograms, no fake AI chatbots.
- **Explainable Evidence:** Detections are backed by transparent factors: circular void diameter, agricultural parcel boundaries, zero WALTA permit records, and proximity to village schools.
- **Human Ground Truth:** Remote sensing only flags candidates; mandatory mobile-first on-site field officer verification confirms the danger.
- **Enforceable Accountability:** Statutory 48-hour landowner notices, concrete capping verification, tamper-evident audit logs, and on-site printable QR Safety Certificates.

---

## 3. System Architecture

```
                                  +------------------------------------------------+
                                  |            KAAL KUAAN SAFETY NETWORK           |
                                  +------------------------------------------------+
                                                           |
          +-------------------------------+----------------+-------------------------------+
          |                               |                                                |
          v                               v                                                v
+-------------------+           +-------------------+                            +-------------------+
|   CITIZEN LAYER   |           |  FIELD & PANCHAYAT|                            |  DISTRICT ADMIN   |
| - Public Safety   |           | - Mobile Verifier |                            | - Cadastral Map   |
|   Radar (1km)     |           | - Photo Match Tool|                            | - Compliance Desk |
| - 3-Step Report   |           | - WhatsApp Intake |                            | - Drilldown Risk  |
| - Multilingual    |           | - QR Cert Issuer  |                            | - Audit Journal   |
+-------------------+           +-------------------+                            +-------------------+
          \                               |                                                /
           -------------------------------v------------------------------------------------
                                          |
                                          v
                         +---------------------------------+
                         |      EXPRESS REST API SERVER    |
                         |  (Node v24 + JWT + Mongoose)    |
                         +---------------------------------+
                                          |
                         +---------------------------------+
                         |      LOCAL MONGODB DATABASE     |
                         |  (Wells, Detections, Reports,   |
                         |   Verifications, Audits, GIS)   |
                         +---------------------------------+
```

### Current MVP Stack
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Leaflet GIS with GeoJSON Cadastral plot geometries, QRCode.react, Lucide Icons.
- **Backend:** Node.js (v24), Express, MongoDB (Mongoose), JWT, BcryptJS, CORS.
- **Design Tokens:** Authentic parchment palette (`#F3F0E8`, `#FAF8F2`, `#20251F`, `#6F624E`, `#D59B35`, `#B84A3A`, `#68775E`).

---

## 4. Production Java & Enterprise Migration Roadmap
To support nationwide rollout across 700+ districts and millions of cadastral plots, the platform is designed to decouple into the following enterprise architecture:

```
[Satellite / Drone Ingestion]      [Citizen WhatsApp / Web Reports]
               |                                   |
               v                                   v
    +----------------------+            +----------------------+
    |  Ingestion Pipeline  |            |  Citizen Gateway API |
    |   (Python / GDAL)    |            |     (Spring Cloud)   |
    +----------------------+            +----------------------+
               |                                   |
               +-----------------+-----------------+
                                 |
                                 v
                     +-----------------------+
                     |  Apache Kafka Cluster |
                     +-----------------------+
                                 |
          +----------------------+----------------------+
          |                                             |
          v                                             v
+------------------------+                    +------------------------+
| Borewell Core Service  |                    | Compliance & Legal     |
| (Spring Boot 3.3 Java) |                    | Service (Spring Boot)  |
+------------------------+                    +------------------------+
          |                                             |
          +----------------------+----------------------+
                                 |
                                 v
                     +-----------------------+
                     | PostgreSQL 16+PostGIS |
                     | (Spatial Indexing)    |
                     +-----------------------+
```

---

## 5. What is Real vs. Simulated (Transparency Disclosure)

In strict accordance with competition rules and engineering integrity, we disclose all simulated components:

| Component | Status in this Prototype | Production Implementation Path |
| :--- | :--- | :--- |
| **Cadastral GIS Engine** | **REAL** (Leaflet + GeoJSON parcels, mouse coordinates, dynamic risk circles) | Direct integration with State Land Records (e.g. Telangana Dharani Portal) via WFS/WMS |
| **Borewell Database & REST API** | **REAL** (Full CRUD, Mongoose schemas, statistics, search, filters) | Scales to PostgreSQL + PostGIS spatial tables |
| **Tamper-Evident Audit Journal**| **REAL** (Append-only SHA-256 cryptographic hashes logged for every state change) | Hyperledger or AWS QLDB ledger |
| **Guided Demo & Reset Mechanism** | **REAL** (Automates 6-step lifecycle and performs instant database reset) | Testing / onboarding utility |
| **QR Safety Certificate** | **REAL** (Generates authentic QR code pointing to site verification endpoint) | Affixed as weatherproof physical plates at capped wells |
| **Satellite Imagery & Void Scan**| **SIMULATED** (Uses Sentinel-2 10m agricultural overlays and sample void metrics) | Automated CNN / YOLOv9 void detection on ISRO Cartosat / PlanetScope 3m orthomosaics |
| **WhatsApp Bot Flow** | **SIMULATED** (Interactive UI dialogue with step progression and ticket creation) | WhatsApp Business Cloud API webhook connected to Node/Spring endpoint |
| **Voice Reporting** | **SIMULATED** (Audio waveform concept with translated regional transcript) | Bhashini / Whisper Indic speech-to-text API |

---

## 6. Demonstration & Evaluation Workflow

To experience the full lifecycle in 2 minutes:

1. Click **`RUN SAFETY DEMO`** on the top header.
2. **Step 1 (Detect):** View high-risk unverified well `KK-TS-04281` flagged at Survey `142/3A` in Ramanapet.
3. **Step 2 (Evidence):** Inspect explainable cards: 0.68m void diameter, 180m from ZP Primary School, zero WALTA permit match.
4. **Step 3 (Verify):** Open the Field Worker Mobile Console, examine side-by-side satellite vs field camera photos, confirm `OPEN & DANGEROUS`.
5. **Step 4 (Act):** Transition well to sealed; enter the Compliance Ledger to view statutory notice enforcement.
6. **Step 5 (Certify):** Generate the official printable QR Safety Certificate (`CERT-NL-2026-XXXX`).
7. **Step 6 (Public Safe):** Return to map. Observe the marker turn **GREEN**. Open **PUBLIC SAFETY MAP** to confirm zero open hazards remain within 1km.
8. Click **`RESET DEMO`** at any time to return the database to its initial unverified state.
