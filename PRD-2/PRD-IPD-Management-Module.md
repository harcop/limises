# IPD (In-Patient Department) Management Module

## Overview
The IPD Module manages all inpatient admissions, bed allocation, ward management, patient monitoring, and discharge processes for hospitalized patients.

---

## 1. Bed Management System

### 1.1 Bed Master Configuration

#### Bed Hierarchy
```
Hospital
  └── Floors/Wings
       └── Wards/Units
            └── Rooms
                 └── Beds
```

**Bed Details:**
- **Bed ID:** Unique identifier (e.g., ICU-101-A)
- **Ward/Unit:** ICU, General Ward, Maternity, Pediatrics
- **Floor:** Floor number
- **Room Number:** Physical room number
- **Bed Number:** Bed number within room
- **Bed Type:**
  - General ward bed (multi-occupancy)
  - Semi-private (2-4 beds)
  - Private room (single bed)
  - Deluxe room
  - Suite
  - ICU bed
  - CCU bed
  - NICU bed
  - Isolation bed
- **Gender Allocation:** Male/Female/Any
- **Amenities:**
  - AC/Non-AC
  - Attached bathroom
  - TV
  - Refrigerator
  - Attendant bed
  - Medical gas outlets (oxygen, vacuum)
- **Equipment:**
  - Cardiac monitor
  - Ventilator
  - Infusion pump
  - Patient bed (electric/manual)
- **Daily Charges:** Base rate per day
- **Deposit Required:** Advance deposit amount

### 1.2 Bed Status Management

**Real-Time Bed Status:**
- **Available:** Vacant, clean, ready for admission
- **Occupied:** Patient admitted
- **Reserved:** Pre-booked for scheduled admission
- **Under Maintenance:** Being repaired
- **Cleaning in Progress:** Housekeeping in process
- **Blocked:** Quarantine, infection control, structural issues
- **Discharged - Cleaning Pending:** Patient left, cleaning not done

**Status Updates:**
- Automatic status changes based on events
- Manual override capability
- Timestamp for each status change
- User who updated status
- Estimated availability time

### 1.3 Bed Allocation Dashboard

#### Visual Bed Map

**Floor Plan View:**
- Interactive floor map
- Color-coded beds:
  - 🟢 Green: Available
  - 🔴 Red: Occupied
  - 🟡 Yellow: Reserved
  - ⚪ Gray: Blocked/Maintenance
  - 🔵 Blue: Cleaning
- Click bed for patient details
- Gender-segregated wards marked
- Isolation rooms highlighted
- ICU/critical care areas marked

**Ward-Wise View:**
- List view by ward
- Total beds vs occupied
- Available beds count
- Expected discharges today
- Expected admissions today
- Bed turnover rate

**Real-Time Metrics:**
- **Total Beds:** Overall hospital capacity
- **Occupied Beds:** Current inpatients
- **Available Beds:** Ready for admission
- **Occupancy Rate:** (Occupied/Total) × 100
- **Beds by Type:**
  - General ward: 50/100
  - Private rooms: 8/20
  - ICU: 12/15
  - NICU: 5/8

### 1.4 Bed Reservation & Allocation

#### Advance Bed Booking

**Reservation Scenarios:**
- Scheduled surgery (book OT + post-op bed)
- Planned admission (medical treatment)
- Transfer from another facility
- VIP patient booking
- Package admission

**Reservation Details:**
- Patient name and ID
- Expected admission date and time
- Duration of stay (estimated)
- Bed type preferred
- Special requirements
- Doctor requesting
- Reservation validity (auto-cancel if no-show)

#### Bed Allocation Algorithm

**Priority Order:**
1. Emergency cases (highest priority)
2. Post-operative patients
3. Reserved beds (scheduled admissions)
4. Transfer from other departments
5. Elective admissions

**Allocation Criteria:**
- Gender-appropriate allocation
- Age-appropriate (pediatric/adult/geriatric)
- Disease-specific wards (TB, infectious diseases)
- Isolation requirements
- Proximity to nursing station (critical patients)
- Patient preference (if available)
- Insurance coverage for bed type

---

## 2. Patient Admission Process

### 2.1 Admission Sources

**Where Patients Come From:**
- **OPD:** Doctor recommends admission
- **Emergency:** Stabilization → Admission
- **Direct Admission:** Pre-arranged admission
- **Transfer:** From another hospital
- **Post-Operative:** From OT to ward/ICU
- **Re-admission:** Previous patient returning

### 2.2 Admission Registration

#### Pre-Admission Assessment
**For Planned Admissions:**
- Medical fitness evaluation
- Pre-admission tests (CBC, ECG, X-ray, etc.)
- Anesthesia clearance (if surgery planned)
- Insurance pre-authorization
- Estimate of costs
- Deposit collection
- Consent forms

#### Admission Information Captured

**Patient Demographics:**
- Full name, age, gender
- Address and contact
- Emergency contact (mandatory)
- Insurance details
- Identification documents

**Admission Details:**
- **Admission Number:** Unique ID (auto-generated)
- **Admission Date & Time:** Timestamp
- **Admission Type:**
  - Emergency
  - Elective/Planned
  - Maternity
  - Day care
  - Transfer
- **Admission Source:** OPD/Emergency/Direct
- **Admitting Doctor:** Primary treating doctor
- **Department:** Medicine/Surgery/Pediatrics, etc.
- **Bed Assignment:** Ward, room, bed number
- **Primary Diagnosis:** Reason for admission
- **Expected Length of Stay:** Estimate
- **Special Requirements:**
  - Isolation needed
  - Special diet
  - Language interpreter
  - Religious considerations

**Financial Information:**
- Payment type (cash/insurance/corporate)
- Insurance company and policy number
- Pre-authorization number
- Credit limit (for insurance)
- Advance deposit collected
- Estimated total cost

### 2.3 Admission Documentation

#### Admission Note (by Doctor)

**History:**
- Chief complaint
- History of present illness
- Past medical history
- Surgical history
- Medication history
- Allergy history
- Family history
- Social history

**Physical Examination:**
- General examination
- Vital signs
- Systemic examination

**Admission Diagnosis:**
- Provisional diagnosis
- ICD-10 code
- Co-morbidities

**Treatment Plan:**
- Investigations ordered
- Medications started
- Diet orders
- Activity level
- Nursing care plan
- Monitoring requirements

**Risk Assessment:**
- Fall risk score
- Pressure ulcer risk
- DVT risk
- Nutritional risk
- Infection risk

#### Consent Forms

**Types of Consents:**
- **General Consent for Treatment**
- **Surgery Consent** (if applicable)
- **Anesthesia Consent**
- **Blood Transfusion Consent**
- **High-Risk Procedure Consent**
- **Research/Clinical Trial Consent** (if applicable)
- **Photography/Video Consent** (for teaching)
- **Information Sharing Consent** (HIPAA)

**Consent Documentation:**
- Type of procedure/treatment
- Risks explained
- Benefits explained
- Alternative options discussed
- Questions answered
- Patient/guardian signature
- Doctor signature
- Witness signature (if required)
- Date and time

---

## 3. Ward Management

### 3.1 Ward Types & Configuration

#### Specialized Wards

**General Medicine Ward:**
- Medical conditions
- Chronic disease management
- General nursing care

**Surgical Ward:**
- Pre-operative patients
- Post-operative recovery
- Wound care

**Orthopedic Ward:**
- Fractures and trauma
- Joint replacements
- Mobility support equipment

**Cardiac Care Unit (CCU):**
- Heart attack patients
- Heart failure
- Post-cardiac procedure
- Continuous cardiac monitoring

**Intensive Care Unit (ICU):**
- Critical patients
- Multi-organ support
- 1:1 or 1:2 nurse-patient ratio
- Advanced monitoring
- Ventilator support

**Neonatal ICU (NICU):**
- Premature babies
- Sick newborns
- Incubators
- Specialized neonatal care

**Pediatric Ward:**
- Children 0-18 years
- Parent accommodation
- Play areas
- Child-friendly environment

**Maternity Ward:**
- Antenatal care
- Postnatal care
- Breastfeeding support
- Mother-baby bonding

**Isolation Ward:**
- Infectious diseases
- Immunocompromised patients
- Negative pressure rooms
- Strict infection control

### 3.2 Ward Staff Management

**Staffing Per Ward:**

**Nursing Staff:**
- Ward in-charge (senior nurse)
- Staff nurses (shift-wise)
- Nurse-patient ratio:
  - General ward: 1:10-15
  - ICU: 1:1 or 1:2
  - High dependency: 1:4-6

**Doctors:**
- Consultant/attending physician
- Junior doctors/residents
- Medical officers
- Intern doctors

**Support Staff:**
- Ward boys/attendants
- Housekeeping staff
- Dietary staff
- Physiotherapist
- Social worker

**Shift Handover:**
- Nursing handover notes
- Patient status update
- Pending tasks
- Critical patients highlighted
- Medication due
- Test reports pending

### 3.3 Ward Rounds

#### Daily Round Schedule

**Morning Rounds (7-10 AM):**
- Consultant-led rounds
- Review all patients
- Treatment plan updates
- New orders
- Discharge planning

**Evening Rounds (5-7 PM):**
- Junior doctor rounds
- Check patient progress
- Address immediate concerns
- Night orders

**Night Rounds (as needed):**
- Critical patient reviews
- Emergency situations

**Round Documentation:**
- Patients visited
- Clinical assessment
- Changes in condition
- Treatment modifications
- New investigations ordered
- Expected discharge date
- Family communication

---

## 4. Patient Monitoring & Nursing Care

### 4.1 Vital Signs Monitoring

#### Monitoring Frequency

**Stable Patients (General Ward):**
- Every 8 hours (3 times daily)
- Morning, afternoon, night shifts

**Moderate Risk:**
- Every 4 hours

**High Risk/Post-Operative:**
- Every 2 hours

**Critical (ICU):**
- Every hour or continuous monitoring

**Parameters Monitored:**
- **Blood Pressure:** Systolic/Diastolic (mmHg)
- **Heart Rate:** Beats per minute
- **Respiratory Rate:** Breaths per minute
- **Temperature:** °C or °F
- **Oxygen Saturation (SpO2):** Percentage
- **Pain Score:** 0-10 scale
- **Consciousness Level:** 
  - Alert
  - Voice responsive
  - Pain responsive
  - Unresponsive
  - GCS score (for critical)

**Advanced Monitoring (ICU):**
- Continuous ECG
- Invasive blood pressure
- Central venous pressure (CVP)
- Cardiac output
- Intracranial pressure (ICP)
- Ventilator parameters
- Arterial blood gases

#### Critical Alerts

**Auto-Alerts for Abnormal Vitals:**
- BP < 90/60 or > 180/110
- Heart rate < 50 or > 120
- SpO2 < 90%
- Temperature > 101°F or
