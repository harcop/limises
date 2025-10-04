# Inpatient Department (IPD) Management Module - Comprehensive PRD

## Overview
The IPD Management Module is a comprehensive solution for managing all aspects of inpatient care, from admission to discharge. This module combines the best features from PRD-1 and PRD-2 to create a robust inpatient management system that optimizes bed utilization, enhances patient care, and improves operational efficiency.

---

## Key Features

### 1. Bed Management System

#### Bed Master Configuration
**Bed Hierarchy:**
```
Hospital
  └── Floors/Wings
       └── Wards/Units
            └── Rooms
                 └── Beds
```

**Bed Details:**
- **Bed ID**: Unique identifier (e.g., ICU-3F-101-A)
- **Ward/Unit**: ICU, General, Maternity, Pediatrics, Surgical
- **Floor**: Floor number
- **Room Number**: Physical room
- **Bed Number**: Within room
- **Bed Type**: General ward, Semi-private, Private, Deluxe, Suite, ICU, CCU, NICU, PICU, Isolation, HDU
- **Gender Allocation**: Male, Female, Unisex
- **Amenities**: AC/Non-AC, Attached bathroom, TV, Refrigerator, Attendant bed, Medical gas outlets
- **Equipment**: Cardiac monitor, Ventilator, Infusion pumps, Patient bed, Bedside table, IV stand
- **Financial**: Daily bed charges, Nursing charges, Equipment charges, Deposit required

#### Bed Status Management
**Real-Time Status:**
- 🟢 **Available**: Vacant, clean, ready
- 🔴 **Occupied**: Patient admitted
- 🟡 **Reserved**: Pre-booked
- 🔧 **Under Maintenance**: Being repaired
- 🧹 **Cleaning in Progress**: Housekeeping
- ⛔ **Blocked**: Quarantine, infection control, structural issues
- 📤 **Discharged - Cleaning Pending**: Patient left, not cleaned yet

**Status Tracking:**
- Automatic status changes
- Manual override capability
- Timestamp for each change
- User who updated
- Estimated availability time
- Last occupant details

#### Bed Allocation Dashboard
**Visual Bed Map:**
- Interactive floor layout
- Color-coded beds by status
- Click bed for details
- Gender-segregated wards marked
- Isolation rooms highlighted
- ICU areas marked
- Equipment indicators

**Real-Time Metrics:**
- **Total Beds**: Overall hospital capacity
- **Occupied Beds**: Current inpatients
- **Available Beds**: Ready for admission
- **Occupancy Rate**: (Occupied/Total) × 100
- **Beds by Type**: General ward, Private rooms, ICU, NICU, etc.

### 2. Patient Admission Process

#### Admission Sources
**Where Patients Come From:**
- **OPD**: Provider recommends admission
- **Emergency**: After stabilization
- **Direct Admission**: Pre-arranged
- **Transfer**: From another hospital
- **Post-Operative**: From OT
- **Re-admission**: Previous patient returning

#### Admission Registration
**Pre-Admission Assessment (Planned):**
- Medical fitness evaluation
- Pre-admission tests (CBC, ECG, X-ray, etc.)
- Anesthesia clearance (if surgery)
- Insurance pre-authorization
- Cost estimate
- Deposit collection
- Consent forms

**Admission Information:**
- **Admission Number**: Auto-generated unique ID
- **Admission Date & Time**: Timestamp
- **Admission Type**: Emergency, Elective/Planned, Maternity, Day care, Medical, Surgical, Transfer
- **Admission Source**: OPD/Emergency/Direct/Transfer
- **Admitting Provider**: Primary physician
- **Department**: Medicine/Surgery/Pediatrics/Obs-Gyn/Ortho
- **Bed Assignment**: Ward, room, bed number
- **Primary Diagnosis**: ICD-10 code
- **Expected Length of Stay**: Estimate
- **Special Requirements**: Isolation, Special diet, Language interpreter, Religious considerations

#### Admission Documentation
**Provider's Admission Note:**
- **History**: Chief complaint, HPI, Past medical history, Surgical history, Medication history, Allergy history, Family history, Social history
- **Physical Examination**: General examination, Vital signs, Systemic examination
- **Admission Diagnosis**: Provisional diagnosis, ICD-10 code, Co-morbidities
- **Treatment Plan**: Investigations ordered, Medications started, Diet orders, Activity level, IV fluids, Oxygen requirement, Monitoring requirements, Nursing care plan
- **Risk Assessment**: Fall risk score, Pressure ulcer risk, DVT risk, Nutritional risk, Infection risk, Suicide risk

**Consent Forms:**
- General consent for treatment
- Surgery consent (if applicable)
- Anesthesia consent
- Blood transfusion consent
- High-risk procedure consent
- Research/clinical trial (if applicable)
- Photography/video (teaching)
- Information sharing (HIPAA)

### 3. Ward Management

#### Ward Types
**Specialized Wards:**
- **General Medicine Ward**: Medical conditions, Chronic disease management, General nursing care
- **Surgical Ward**: Pre-operative patients, Post-operative recovery, Wound care, Drain management
- **Orthopedic Ward**: Fractures and trauma, Joint replacements, Mobility support, Physiotherapy coordination
- **Cardiac Care Unit (CCU)**: Heart attack patients, Heart failure, Post-cardiac procedures, Continuous cardiac monitoring
- **Intensive Care Unit (ICU)**: Critical patients, Multi-organ support, Ventilator patients, 1:1 or 1:2 nurse ratio, Advanced monitoring
- **Neonatal ICU (NICU)**: Premature babies, Low birth weight, Sick newborns, Incubators, Level II/III care
- **Pediatric ICU (PICU)**: Critically ill children, Post-operative pediatric, Respiratory support, Specialized pediatric equipment
- **Pediatric Ward**: Children 0-18 years, Parent accommodation, Play areas, Child-friendly environment
- **Maternity Ward**: Antenatal care, Postnatal care, Breastfeeding support, Mother-baby bonding, Family-centered care
- **Isolation Ward**: Infectious diseases, Immunocompromised patients, Negative pressure rooms, Strict infection control
- **High Dependency Unit (HDU)**: Step-down from ICU, Step-up from general ward, Closer monitoring than ward

#### Ward Staffing
**Per Ward:**
- **Nursing Staff**: Ward in-charge, Staff nurses, Nurse-patient ratio (General: 1:10-15, ICU: 1:1-2, HDU: 1:2-4)
- **Providers**: Consultant/attending physician, Junior providers/residents, Medical officers, Interns
- **Support Staff**: Ward boys/attendants, Housekeeping staff, Dietary staff, Physiotherapist, Social worker, Patient care coordinators

**Shift Handover:**
- Nursing handover (change of shift)
- Patient status updates
- Pending tasks
- Critical patients highlighted
- Medications due
- Tests pending
- Family concerns

#### Ward Rounds
**Morning Rounds (7-10 AM):**
- Consultant-led
- Review all patients
- Examine patients
- Review investigations
- Treatment plan updates
- New orders
- Discharge planning
- Teaching (if teaching hospital)

**Evening Rounds (5-7 PM):**
- Junior provider rounds
- Check patient progress
- Address concerns
- Night orders

**Night Rounds:**
- As needed
- Critical patient reviews
- Emergency situations

### 4. Patient Monitoring & Nursing Care

#### Vital Signs Monitoring
**Monitoring Frequency:**
- **Stable (General Ward)**: Every 8 hours (3x/day)
- **Moderate Risk**: Every 4 hours
- **High Risk/Post-Op**: Every 2 hours
- **Critical (ICU)**: Every hour or continuous

**Parameters:**
- **Blood Pressure**: Systolic/Diastolic (mmHg)
- **Heart Rate**: Beats per minute
- **Respiratory Rate**: Breaths per minute
- **Temperature**: °C or °F
- **SpO2**: Oxygen saturation (%)
- **Pain Score**: 0-10 scale
- **Consciousness**: AVPU or GCS

**Advanced (ICU):**
- Continuous ECG
- Invasive BP (arterial line)
- Central venous pressure (CVP)
- Cardiac output
- Intracranial pressure (ICP)
- Ventilator parameters
- Arterial blood gases (ABG)

#### Critical Alerts
**Auto-Alerts:**
- BP < 90/60 or > 180/110
- HR < 50 or > 120
- SpO2 < 90%
- Temp > 101°F or < 95°F
- RR < 10 or > 30
- Pain score > 7
- Sudden drop in consciousness

#### Nursing Assessment
**Daily Assessment:**
- General condition
- Level of consciousness
- Skin condition (color, turgor, lesions)
- Mobility status
- Nutritional status
- Elimination (bowel/bladder)
- Sleep pattern
- Pain assessment
- Emotional status
- Family support

**Nursing Care Plan:**
- Goals (short-term, long-term)
- Planned interventions
- Expected outcomes
- Evaluation criteria
- Date for review

### 5. Provider Orders Management

#### Order Types
**Medication Orders:**
- Drug name, dose, route, frequency
- Start date/time
- Duration or stop date
- Special instructions
- Indication

**Diagnostic Orders:**
- Laboratory tests
- Radiology/imaging
- ECG, Echo
- Endoscopy
- Biopsy

**Therapeutic Orders:**
- Physiotherapy
- Respiratory therapy
- Occupational therapy
- Speech therapy
- Wound care
- Catheterization
- Dressing changes

**Diet Orders:**
- NPO (nothing by mouth)
- Clear liquid, Full liquid
- Soft diet, Regular diet
- Diabetic diet, Low sodium diet
- Renal diet, High protein diet
- Calorie-controlled

**Activity Orders:**
- Strict bed rest
- Bed rest with bathroom privileges
- Chair sitting
- Walk with assistance
- Full ambulation
- Position changes (2-hourly)
- Head end elevation

**Nursing Orders:**
- Vital signs frequency
- Intake-output monitoring
- Neuro checks (hourly GCS)
- Blood glucose monitoring (QID)
- Weight monitoring (daily)
- Wound care protocol
- Fall precautions
- Isolation precautions

### 6. Patient Transfer Management

#### Internal Ward Transfer
**Scenarios:**
- General ward → ICU (deterioration)
- ICU → general ward (improvement)
- Ward → ward (specialty change)
- Room change (patient request/availability)

**Process:**
1. Provider orders transfer
2. Destination bed confirmed
3. Transfer note prepared
4. Nursing handover
5. Patient belongings checklist
6. Physical transfer
7. Bed status update (both locations)
8. Billing update (new bed charges)

#### ICU Transfer
**ICU Admission Criteria:**
- Respiratory failure
- Cardiac instability
- Severe sepsis/septic shock
- Multi-organ failure
- Post-op monitoring (major surgery)
- Neurological emergency
- Severe trauma
- Hemodynamic instability

**ICU Transfer Checklist:**
- ICU bed confirmed
- Intensivist notified
- Equipment ready (ventilator, monitor)
- Emergency meds available
- Family briefing

### 7. Discharge Management

#### Discharge Planning
**Early Planning:**
- Starts from admission
- Expected LOS
- Discharge criteria
- Home care needs
- Family education needs

**Discharge Criteria:**
- Clinical stability
- No active infection
- Oral medication tolerated
- Pain controlled
- Basic activities possible
- Follow-up arranged
- Home support available
- Patient/family educated

#### Discharge Types
**1. Regular Discharge:**
- Medically fit
- Treatment completed
- Provider approval

**2. DAMA (Discharge Against Medical Advice):**
- Patient wants to leave despite advice
- Risks explained and documented
- DAMA form signed
- Witness signature
- Medical-legal protection

**3. DOR (Discharge on Request):**
- Patient stable
- Wants discharge
- Not against medical advice
- Safe to discharge

**4. Transfer:**
- To another facility
- For specialized care
- For rehabilitation
- For long-term care

**5. Absconding:**
- Patient leaves without informing
- Security alerted
- Police informed (if needed)
- Documented

**6. Death:**
- Death certification
- Mortuary transfer
- Family notification
- Death summary

#### Discharge Process
**Discharge Summary:**
- Patient information
- Admission and discharge dates
- Length of stay
- Admission diagnosis
- Admitting provider
- Clinical course
- Investigations and results
- Procedures performed
- Complications
- Consultations
- Treatment provided
- Discharge diagnosis (with ICD-10)
- Discharge medications
- Follow-up instructions
- Diet and activity advice
- Wound care
- Warning signs
- Provider signature

**Discharge Clearance:**
- **Clinical**: Provider signs discharge order, Discharge summary completed, Prescriptions written
- **Nursing**: Remove IV lines, catheters, Final vitals, Patient education completed, Discharge checklist, Belongings returned
- **Billing**: Final bill generated, Payment collected, Outstanding settled, Insurance claims, Discharge summary after payment
- **Pharmacy**: Medications dispensed, Instructions given
- **Others**: Equipment returned, Medical records (if requested), Certificates issued, Ambulance (if needed)

### 8. Critical Care Management (ICU/CCU)

#### ICU Features
**Advanced Monitoring:**
- Multi-parameter monitors
- ECG (continuous)
- Invasive BP
- CVP
- Cardiac output
- ICP
- End-tidal CO2

**Ventilator Management:**
- Mode
- FiO2, PEEP
- Tidal volume, RR
- Peak pressures
- Compliance
- ABG correlation
- Weaning parameters

**ICU Scoring:**
- APACHE II (mortality prediction)
- SOFA (organ failure)
- GCS (neurological)

#### Infection Control
**Protocols:**
- Hand hygiene
- Central line bundle
- Ventilator bundle
- Catheter bundle
- Contact precautions
- Isolation

**Surveillance:**
- HAI rates
- CLABSI
- VAP
- CAUTI
- Infection monitoring

### 9. Visitor Management

#### Visiting Hours
**General Ward:**
- Morning: 11 AM - 1 PM
- Evening: 5 PM - 7 PM
- 2 visitors per patient

**ICU/CCU:**
- Restricted (15-30 min twice daily)
- 1 visitor at a time
- Provider briefing

**Pediatric:**
- One parent 24 hours
- Others during visiting hours

**Maternity:**
- Flexible for spouse
- Restricted for others

#### Visitor Registration
- Name and relation
- Contact number
- ID verification
- Health screening
- Hand sanitization
- Visitor badge
- Escort to ward

### 10. Death & Mortality Management

**Process:**
- Death certification
- Time declared
- Family notification
- Body to mortuary
- Police (if medico-legal)
- Death summary
- Belongings to family
- Support services

**Documentation:**
- Cause of death
- Time of death
- Who declared
- Family informed
- Autopsy consent (if needed)

### 11. IPD Billing Integration

#### Continuous Charges
**Daily Auto-Charges:**
- Bed charges
- Nursing charges
- Provider visit charges
- Equipment usage

**Service Charges:**
- Medications (pharmacy)
- Lab tests
- Radiology
- Procedures
- Physiotherapy
- Consumables
- Blood products
- Oxygen
- Surgical charges

#### Interim Billing
- Bill every 3-7 days
- Show running charges
- Collect payments
- Reduces discharge time
- Transparency

**Credit Limit:**
- Insurance limit tracking
- Alert when approaching
- Additional deposit request
- Service hold if non-payment

---

## Technical Specifications

### Database Schema

#### IPD Admissions Table
```sql
CREATE TABLE ipd_admissions (
    admission_id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patients(patient_id),
    admission_number VARCHAR(20) UNIQUE NOT NULL,
    admission_date TIMESTAMP NOT NULL,
    admission_type VARCHAR(50) NOT NULL,
    admission_source VARCHAR(50),
    admitting_provider_id UUID REFERENCES providers(provider_id),
    department_id UUID REFERENCES departments(department_id),
    ward_id UUID REFERENCES wards(ward_id),
    room_id UUID REFERENCES rooms(room_id),
    bed_id UUID REFERENCES beds(bed_id),
    primary_diagnosis TEXT,
    expected_los INTEGER,
    special_requirements TEXT,
    admission_notes TEXT,
    status VARCHAR(20) DEFAULT 'admitted',
    discharge_date TIMESTAMP,
    discharge_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Bed Management Table
```sql
CREATE TABLE beds (
    bed_id UUID PRIMARY KEY,
    bed_number VARCHAR(20) NOT NULL,
    room_id UUID REFERENCES rooms(room_id),
    ward_id UUID REFERENCES wards(ward_id),
    bed_type VARCHAR(50) NOT NULL,
    gender_allocation VARCHAR(20),
    amenities JSONB,
    equipment JSONB,
    daily_charges DECIMAL(10,2),
    deposit_required DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'available',
    last_cleaned TIMESTAMP,
    maintenance_due DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

#### IPD Management APIs
```typescript
// Create admission
POST /api/ipd/admissions
{
  "patientId": "uuid",
  "admissionType": "emergency|elective|transfer",
  "admissionSource": "opd|emergency|direct",
  "admittingProviderId": "uuid",
  "departmentId": "uuid",
  "primaryDiagnosis": "string",
  "expectedLOS": 5
}

// Get bed availability
GET /api/ipd/beds/availability?wardId={id}&date={date}

// Assign bed
POST /api/ipd/admissions/{admissionId}/assign-bed
{
  "bedId": "uuid"
}

// Transfer patient
POST /api/ipd/admissions/{admissionId}/transfer
{
  "newWardId": "uuid",
  "newBedId": "uuid",
  "transferReason": "string"
}

// Discharge patient
POST /api/ipd/admissions/{admissionId}/discharge
{
  "dischargeType": "regular|dama|transfer",
  "dischargeDate": "YYYY-MM-DD",
  "dischargeSummary": "string"
}
```

---

## Workflows

### Complete Admission to Discharge Flow
```
Admission Decision
  ↓
Bed Availability Check
  ↓
Bed Reservation/Allocation
  ↓
Admission Registration
  ↓
Advance Payment
  ↓
Consents Signed
  ↓
Shift to Ward
  ↓
Nursing Assessment
  ↓
Provider's Admission Note
  ↓
Initial Orders
  ↓
Regular Monitoring
  ↓
Daily Rounds
  ↓
Investigations
  ↓
Treatment
  ↓
Discharge Planning
  ↓
Discharge Decision
  ↓
Discharge Summary
  ↓
Final Bill
  ↓
Payment
  ↓
Discharge Clearance
  ↓
Patient Discharged
  ↓
Follow-Up Scheduled
```

---

## Reports & Analytics

### Operational Reports
- Daily census
- Bed occupancy rate
- Average length of stay (ALOS)
- Bed turnover rate
- Admission/discharge trends
- Ward utilization
- Provider productivity

### Clinical Reports
- Hospital-acquired infection rate
- Mortality rate
- Complication rate
- Readmission rate (30-day)
- Clinical outcomes
- Quality indicators
- Patient safety metrics

### Financial Reports
- Revenue per bed day
- Cost per patient day
- Department-wise costs
- Insurance vs cash ratio
- Collection efficiency
- Outstanding amounts
- Profitability analysis

---

## Integration Points

- **Patient Module**: Patient demographics and history
- **Provider Module**: Provider schedules and credentials
- **OPD/Emergency**: Admissions from outpatient/emergency
- **Laboratory**: Test orders and results
- **Radiology**: Imaging orders and reports
- **Pharmacy**: Medication orders and dispensing
- **OT**: Pre and post-operative care
- **Billing**: Charge capture and payment processing
- **Dietary**: Meal planning and nutrition
- **Housekeeping**: Cleaning and maintenance
- **Analytics**: IPD data for reporting

---

## Security & Compliance

### Data Security
- Encrypted patient data
- Secure communication
- Access control and authentication
- Audit trail maintenance
- Data backup and recovery
- Privacy protection

### Compliance
- HIPAA compliance
- Clinical documentation standards
- Quality assurance
- Regulatory compliance
- Patient safety
- Data privacy
- Security standards

---

*This comprehensive IPD Management Module provides a complete solution for inpatient care management while ensuring excellent patient outcomes, operational efficiency, and regulatory compliance.*
