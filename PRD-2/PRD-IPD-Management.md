# IPD (In-Patient Department) Management - Complete Guide

## Overview
The IPD Module manages all inpatient admissions, bed allocation, ward management, patient monitoring, and discharge processes for hospitalized patients.

---

## TABLE OF CONTENTS

1. Bed Management System
2. Patient Admission Process
3. Ward Management
4. Patient Monitoring & Nursing Care
5. Doctor Orders Management
6. Patient Transfer Management
7. Discharge Management
8. Critical Care Management (ICU/CCU)
9. Visitor Management
10. Death & Mortality Management
11. IPD Billing & Charges
12. Workflows & KPIs

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
- **Bed ID:** Unique identifier (e.g., ICU-3F-101-A)
- **Ward/Unit:** ICU, General, Maternity, Pediatrics, Surgical
- **Floor:** Floor number
- **Room Number:** Physical room
- **Bed Number:** Within room
- **Bed Type:**
  - General ward (multi-bed: 4-6 beds)
  - Semi-private (2-4 beds)
  - Private room (single)
  - Deluxe room
  - Suite (with attendant space)
  - ICU bed
  - CCU bed
  - NICU bed
  - PICU bed
  - Isolation bed
  - HDU (High Dependency Unit)

**Gender Allocation:**
- Male ward
- Female ward
- Unisex (ICU, private rooms)

**Amenities:**
- AC/Non-AC
- Attached bathroom
- TV
- Refrigerator
- Attendant bed/sofa
- Medical gas outlets (O2, vacuum, medical air)
- Nurse call button

**Equipment:**
- Cardiac monitor
- Ventilator
- Infusion pumps
- Patient bed (electric/manual)
- Bedside table
- IV stand
- Oxygen outlet

**Financial:**
- Daily bed charges
- Nursing charges
- Equipment charges
- Deposit required

### 1.2 Bed Status Management

**Real-Time Status:**
- 🟢 **Available:** Vacant, clean, ready
- 🔴 **Occupied:** Patient admitted
- 🟡 **Reserved:** Pre-booked
- 🔧 **Under Maintenance:** Being repaired
- 🧹 **Cleaning in Progress:** Housekeeping
- ⛔ **Blocked:** Quarantine, infection control, structural issues
- 📤 **Discharged - Cleaning Pending:** Patient left, not cleaned yet

**Status Tracking:**
- Automatic status changes
- Manual override capability
- Timestamp for each change
- User who updated
- Estimated availability time
- Last occupant details

### 1.3 Bed Allocation Dashboard

#### Visual Bed Map

**Floor Plan View:**
- Interactive floor layout
- Color-coded beds by status
- Click bed for details
- Gender-segregated wards marked
- Isolation rooms highlighted
- ICU areas marked
- Equipment indicators

**Ward-Wise View:**
- List view by ward
- Total vs occupied beds
- Available beds
- Expected discharges today
- Expected admissions today
- Bed turnover rate

**Real-Time Metrics:**
- **Total Beds:** 250
- **Occupied:** 195
- **Available:** 45
- **Occupancy Rate:** 78%
- **By Type:**
  - General ward: 120/150
  - Private: 15/30
  - ICU: 12/15
  - CCU: 8/10
  - NICU: 6/8
  - Maternity: 20/25
  - Pediatric: 14/22

### 1.4 Bed Reservation & Allocation

**Advance Reservation:**
- Scheduled surgery patients
- Planned admissions
- Transfer patients
- VIP patients
- Package admissions

**Reservation Details:**
- Patient name and ID
- Expected admission date/time
- Duration estimate
- Bed type preferred
- Special requirements
- Doctor requesting
- Reservation validity (auto-cancel if no-show)

**Allocation Algorithm Priority:**
1. Emergency cases (highest)
2. Post-operative patients
3. Reserved beds
4. Transfers from other departments
5. Elective admissions

**Allocation Criteria:**
- Gender-appropriate
- Age-appropriate (pediatric/adult/geriatric)
- Disease-specific wards
- Isolation requirements
- Proximity to nursing station (critical patients)
- Patient preference
- Insurance coverage

---

## 2. Patient Admission Process

### 2.1 Admission Sources

- **OPD:** Doctor recommends admission
- **Emergency:** After stabilization
- **Direct Admission:** Pre-arranged
- **Transfer:** From another hospital
- **Post-Operative:** From OT
- **Re-admission:** Previous patient returning

### 2.2 Admission Registration

#### Pre-Admission Assessment (Planned)

- Medical fitness evaluation
- Pre-admission tests (CBC, ECG, X-ray, etc.)
- Anesthesia clearance (if surgery)
- Insurance pre-authorization
- Cost estimate
- Deposit collection
- Consent forms

#### Admission Information

**Patient Demographics:**
- Full name, age, gender
- Address and contact
- Emergency contact (mandatory)
- Insurance details
- Identification documents

**Admission Details:**
- **Admission Number:** Auto-generated unique ID
- **Admission Date & Time:** Timestamp
- **Admission Type:**
  - Emergency
  - Elective/Planned
  - Maternity
  - Day care
  - Medical
  - Surgical
  - Transfer
- **Admission Source:** OPD/Emergency/Direct/Transfer
- **Admitting Doctor:** Primary physician
- **Department:** Medicine/Surgery/Pediatrics/Obs-Gyn/Ortho
- **Bed Assignment:** Ward, room, bed number
- **Primary Diagnosis:** ICD-10 code
- **Expected Length of Stay:** Estimate
- **Special Requirements:**
  - Isolation needed
  - Special diet (diabetic, renal, etc.)
  - Language interpreter
  - Religious considerations
  - Attendant needed

**Financial Information:**
- Payment type (cash/insurance/corporate)
- Insurance company and policy
- Pre-authorization number
- Credit limit
- Advance deposit collected
- Estimated total cost
- Daily charge breakdown

### 2.3 Admission Documentation

#### Doctor's Admission Note

**History:**
- Chief complaint
- History of present illness
- Past medical history
- Surgical history
- Medication history
- Allergy history
- Family history
- Social history (smoking, alcohol)

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
- IV fluids
- Oxygen requirement
- Monitoring requirements
- Nursing care plan

**Risk Assessment:**
- Fall risk score (Morse Fall Scale)
- Pressure ulcer risk (Braden Scale)
- DVT risk (Wells score)
- Nutritional risk
- Infection risk
- Suicide risk (psychiatric)

#### Consent Forms

**Types:**
- General consent for treatment
- Surgery consent (if applicable)
- Anesthesia consent
- Blood transfusion consent
- High-risk procedure consent
- Research/clinical trial (if applicable)
- Photography/video (teaching)
- Information sharing (HIPAA)

**Consent Documentation:**
- Procedure/treatment explained
- Risks and benefits
- Alternative options
- Questions answered
- Patient/guardian signature
- Doctor signature
- Witness signature
- Date and time

---

## 3. Ward Management

### 3.1 Ward Types

#### General Medicine Ward
- Medical conditions
- Chronic disease management
- General nursing care
- 20-40 beds typically

#### Surgical Ward
- Pre-operative patients
- Post-operative recovery
- Wound care
- Drain management

#### Orthopedic Ward
- Fractures and trauma
- Joint replacements
- Mobility support
- Physiotherapy coordination

#### Cardiac Care Unit (CCU)
- Heart attack patients
- Heart failure
- Post-cardiac procedures
- Continuous cardiac monitoring
- 8-12 beds

#### Intensive Care Unit (ICU)
- Critical patients
- Multi-organ support
- Ventilator patients
- 1:1 or 1:2 nurse ratio
- Advanced monitoring
- 10-20 beds

#### Neonatal ICU (NICU)
- Premature babies (< 37 weeks)
- Low birth weight (< 2.5 kg)
- Sick newborns
- Incubators
- Level II (special care) or Level III (intensive care)

#### Pediatric ICU (PICU)
- Critically ill children
- Post-operative pediatric
- Respiratory support
- Specialized pediatric equipment

#### Pediatric Ward
- Children 0-18 years
- Parent accommodation
- Play areas
- Child-friendly environment
- Colorful décor

#### Maternity Ward
- Antenatal care
- Postnatal care (mother + baby)
- Breastfeeding support
- Mother-baby bonding (rooming-in)
- Family-centered care

#### Isolation Ward
- Infectious diseases (TB, COVID, etc.)
- Immunocompromised patients
- Negative pressure rooms
- Strict infection control
- PPE requirements

#### High Dependency Unit (HDU)
- Step-down from ICU
- Step-up from general ward
- Closer monitoring than ward
- 1:2 or 1:4 nurse ratio

### 3.2 Ward Staffing

**Per Ward:**

**Nursing Staff:**
- Ward in-charge (senior nurse)
- Staff nurses (shift-wise)
- Nurse-patient ratio:
  - General ward: 1:10-15
  - ICU: 1:1 or 1:2
  - HDU: 1:2-4
  - Maternity: 1:6-8
  - Pediatric: 1:6-8

**Doctors:**
- Consultant/attending physician
- Junior doctors/residents
- Medical officers
- Interns

**Support Staff:**
- Ward boys/attendants
- Housekeeping staff
- Dietary staff
- Physiotherapist (as needed)
- Social worker
- Patient care coordinators

**Shift Handover:**
- Nursing handover (change of shift)
- Patient status updates
- Pending tasks
- Critical patients highlighted
- Medications due
- Tests pending
- Family concerns

### 3.3 Ward Rounds

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
- Junior doctor rounds
- Check patient progress
- Address concerns
- Night orders

**Night Rounds:**
- As needed
- Critical patient reviews
- Emergency situations

**Round Documentation:**
- Patients visited
- Clinical findings
- Changes in condition
- Treatment modifications
- New investigations
- Expected discharge date
- Family communication

---

## 4. Patient Monitoring & Nursing Care

### 4.1 Vital Signs Monitoring

#### Monitoring Frequency

- **Stable (General Ward):** Every 8 hours (3x/day)
- **Moderate Risk:** Every 4 hours
- **High Risk/Post-Op:** Every 2 hours
- **Critical (ICU):** Every hour or continuous

**Parameters:**
- **Blood Pressure:** Systolic/Diastolic (mmHg)
- **Heart Rate:** Beats per minute
- **Respiratory Rate:** Breaths per minute
- **Temperature:** °C or °F
- **SpO2:** Oxygen saturation (%)
- **Pain Score:** 0-10 scale
- **Consciousness:** AVPU or GCS

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

**Response:**
- Immediate nurse notification
- Doctor escalation
- Document intervention
- Re-check vitals
- Trending analysis

### 4.2 Nursing Assessment

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

**Nursing Diagnosis:**
- Identified problems
- Risk factors
- Patient needs

**Nursing Care Plan:**
- Goals (short-term, long-term)
- Planned interventions
- Expected outcomes
- Evaluation criteria
- Date for review

### 4.3 Nursing Documentation

**Progress Notes (Shift-Wise):**
- Patient complaints/concerns
- Response to treatment
- Medications administered
- Procedures performed
- Wounds/dressings changed
- Patient activity (bed rest, walking)
- Visitors
- Diet intake
- Fluid input/output
- Any incidents/falls
- Family communication

**Charting Methods:**
- SOAP notes (Subjective, Objective, Assessment, Plan)
- Focus charting (Data, Action, Response)
- Narrative notes
- Flowsheets for routine tasks

### 4.4 Medication Administration

#### e-MAR (Electronic Medication Administration Record)

**Display:**
- All current medications
- Scheduled meds with timing
- PRN (as needed) meds
- IV meds and infusions
- One-time/STAT meds
- Due now (highlighted)
- Overdue (red alert)

**Medication Details:**
- Drug name and strength
- Route (oral/IV/IM/SC/topical)
- Dose and frequency
- Start and stop date
- Special instructions
- Ordering doctor

**5 Rights + 3:**
1. Right Patient (wristband check)
2. Right Drug
3. Right Dose
4. Right Route
5. Right Time
6. Right Documentation
7. Right Reason
8. Right Response

**Barcode Scanning:**
- Scan patient wristband
- Scan medication barcode
- System verifies match
- Document administration
- Timestamp

**Missed Dose:**
- Reason (patient refused/NPO/unavailable)
- Document reason
- Notify doctor if critical
- Reschedule

**Adverse Reaction:**
- Symptoms observed
- Time of onset
- Severity
- Action taken
- Doctor notified
- Medication stopped
- Incident report

#### IV Fluid Management

**Tracking:**
- Fluid type
- Volume
- Rate (ml/hour)
- Start time
- Expected completion
- Running balance
- IV site assessment
- Site change (every 72 hours)

**Infusion Pump:**
- Programmed rate
- Volume infused
- Volume remaining
- Occlusion alerts
- Air-in-line alerts
- Completion alerts

### 4.5 Input-Output Monitoring

**Intake:**
- IV fluids
- Oral fluids
- Tube feeding
- Blood products
- Total intake/24 hours

**Output:**
- Urine output (most important)
- Surgical drains
- NG tube output
- Stool
- Vomitus
- Insensible loss (estimated)
- Total output/24 hours

**Fluid Balance:**
- Intake - Output = Balance
- Positive balance (fluid retention)
- Negative balance (dehydration)
- Target balance (as per doctor orders)

---

## 5. Doctor Orders Management

### 5.1 Order Types

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
- Clear liquid
- Full liquid
- Soft diet
- Regular diet
- Diabetic diet
- Low sodium diet
- Renal diet
- High protein diet
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

**Consultation Orders:**
- Specialty consultation (cardiology, neurology, etc.)
- Reason for consultation
- Urgency level
- Specific questions

### 5.2 Order Execution

**Status:**
- Pending
- In Progress
- Completed
- Discontinued
- On Hold
- Cancelled

**Priority:**
- Routine
- Urgent
- STAT (immediate)
- Scheduled (specific time)

**Verification:**
- Nurse acknowledges
- Pharmacist verifies medication
- Lab receives test order
- Radiology schedules imaging

**Tracking:**
- All active orders by patient
- Pending orders
- Completed today
- Overdue orders
- STAT in progress

---

## 6. Patient Transfer Management

### 6.1 Internal Ward Transfer

**Scenarios:**
- General ward → ICU (deterioration)
- ICU → general ward (improvement)
- Ward → ward (specialty change)
- Room change (patient request/availability)

**Process:**
1. Doctor orders transfer
2. Destination bed confirmed
3. Transfer note prepared:
   - Current condition
   - Ongoing treatments
   - IV lines, catheters, drains
   - Pending investigations
   - Special care needs
4. Nursing handover
5. Patient belongings checklist
6. Physical transfer
7. Bed status update (both locations)
8. Billing update (new bed charges)

### 6.2 ICU Transfer

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

**ICU Handover:**
- Detailed clinical summary
- Current meds and infusions
- Ventilator settings (if intubated)
- Hemodynamic status
- Lab results
- Pending tests
- Code status (DNR/Full code)

### 6.3 Inter-Hospital Transfer

**Reasons:**
- Specialized care unavailable
- Higher level facility needed
- Patient/family request
- Insurance requirements
- Bed unavailability

**Preparation:**
1. Destination hospital contacted
2. Bed and doctor confirmed
3. Medical summary prepared
4. Investigation reports
5. Imaging CDs
6. Medication list
7. Ambulance arranged (BLS/ALS)
8. Medical escort (doctor/nurse)
9. Stabilization for transport
10. Transfer documentation
11. Consent for transfer
12. Billing clearance/undertaking
13. Family communication

---

## 7. Discharge Management

### 7.1 Discharge Planning

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

### 7.2 Discharge Types

**1. Regular Discharge:**
- Medically fit
- Treatment completed
- Doctor approval

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

### 7.3 Discharge Process

#### Discharge Summary

**Contents:**
- Patient information
- Admission and discharge dates
- Length of stay
- Admission diagnosis
- Admitting doctor
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
- Doctor signature

#### Discharge Medications

**Counseling:**
- Purpose of each medication
- How and when to take
- Side effects
- Drug interactions
- Storage
- Duration

**Prescription:**
- 1-2 weeks supply typically
- Refills noted

#### Discharge Clearance

**Multi-Department:**

**Clinical:**
- Doctor signs discharge order
- Discharge summary completed
- Prescriptions written

**Nursing:**
- Remove IV lines, catheters
- Final vitals
- Patient education completed
- Discharge checklist
- Belongings returned

**Billing:**
- Final bill generated
- Payment collected
- Outstanding settled
- Insurance claims
- Discharge summary after payment

**Pharmacy:**
- Medications dispensed
- Instructions given

**Others:**
- Equipment returned
- Medical records (if requested)
- Certificates issued
- Ambulance (if needed)

**Discharge Time:**
- Preferably before 11 AM
- Frees bed for next admission

### 7.4 Post-Discharge Follow-Up

**Follow-Up Call (24-48 hours):**
- Check patient condition
- Medication compliance
- Any issues/concerns
- Answer questions
- Remind of follow-up

**Readmission Tracking:**
- 30-day readmission monitored
- Same condition flagged
- Quality indicator

---

## 8. Critical Care (ICU/CCU)

### 8.1 ICU Features

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

### 8.2 Infection Control

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

---

## 9. Visitor Management

### 9.1 Visiting Hours

**General Ward:**
- Morning: 11 AM - 1 PM
- Evening: 5 PM - 7 PM
- 2 visitors per patient

**ICU/CCU:**
- Restricted (15-30 min twice daily)
- 1 visitor at a time
- Doctor briefing

**Pediatric:**
- One parent 24 hours
- Others during visiting hours

**Maternity:**
- Flexible for spouse
- Restricted for others

### 9.2 Visitor Registration

- Name and relation
- Contact number
- ID verification
- Health screening
- Hand sanitization
- Visitor badge
- Escort to ward

**Rules:**
- Max number enforced
- Mobile restrictions
- Photography restrictions
- Food restrictions
- Overnight attendant policy
- Child visitor policy

---

## 10. Death & Mortality

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

---

## 11. IPD Billing

### 11.1 Continuous Charges

**Daily Auto-Charges:**
- Bed charges
- Nursing charges
- Doctor visit charges
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

### 11.2 Interim Billing

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

### 11.3 Final Bill

**Components:**
- Date-wise charges
- Service-wise summary
- Total charges
- Advance payments
- Discounts
- Insurance coverage
- Net payable

**Discharge:**
- Bill presented
- Payment collected
- Receipt issued
- Discharge summary released
- No dues certificate

---

## 12. IPD Workflows

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
Doctor's Admission Note
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

## Key Performance Indicators

**Occupancy:**
- Bed occupancy rate
- ALOS (Average Length of Stay)
- Bed turnover rate

**Clinical:**
- Hospital-acquired infection rate
- Mortality rate
- Complication rate
- Readmission rate (30-day)

**Operational:**
- Time to bed assignment
- Discharge before 11 AM rate
- Turnaround time

**Patient Experience:**
- Satisfaction scores
- Complaint rate
- Family satisfaction

---

## Integration Points

- Patient Module
- Doctor Module
- OPD/Emergency (admissions)
- Laboratory (tests)
- Radiology (imaging)
- Pharmacy (medications)
- OT (surgery)
- Billing (charges)
- Dietary (meal planning)
- Housekeeping (cleaning)
