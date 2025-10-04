# OPD (Outpatient Department) Management Module

## Overview
The OPD Module manages all aspects of outpatient consultations, from appointment scheduling to consultation, prescription, and follow-up care.

---

## 1. Appointment Scheduling System

### 1.1 Online Appointment Booking

#### Patient Portal Features
**Self-Service Booking:**
- Search doctors by name or specialization
- View doctor profiles (qualifications, experience, languages)
- Check real-time availability
- Select preferred date and time slot
- Book appointment with confirmation
- Receive booking confirmation via SMS/Email
- Add appointment to personal calendar
- Option for video consultation (telemedicine)

**Appointment Details Captured:**
- Patient information (auto-filled for registered patients)
- Chief complaint/reason for visit
- Preferred doctor
- Appointment type (first visit/follow-up)
- Contact number for reminders
- Insurance information (if applicable)

#### Reception-Based Booking
**Walk-in Registration:**
- Quick patient search by name/phone/ID
- Check doctor availability in real-time
- Book next available slot
- Same-day appointment allocation
- Emergency slot booking
- Print appointment slip
- Collect consultation fee (if advance payment required)

**Phone Booking:**
- Call center integration
- Patient verification
- Slot booking over phone
- SMS confirmation to patient
- Call recording for quality

### 1.2 Doctor Availability Management

#### Schedule Configuration
**OPD Timings:**
- Weekly schedule setup (Monday to Sunday)
- Multiple sessions per day (Morning/Afternoon/Evening)
- Session timing (e.g., 9 AM - 12 PM)
- Consultation duration per patient (10/15/20/30 minutes)
- Maximum patients per session
- Buffer time between appointments
- Break times

**Special Schedules:**
- Holiday calendar
- Leave/vacation dates
- Conference/CME dates
- On-call duty adjustments
- Special clinic days (e.g., diabetic clinic every Tuesday)

**Slot Management:**
- Total slots per session
- Booked slots
- Available slots
- Blocked slots (for procedures/admin work)
- Emergency reserve slots
- VIP/referral slots

### 1.3 Appointment Calendar

#### Calendar Views
**Doctor's Personal Calendar:**
- Day view (hour-by-hour schedule)
- Week view (entire week at a glance)
- Month view (overall scheduling)
- Color-coded by appointment type
- Patient names visible (with privacy controls)
- Chief complaint preview
- New patient vs follow-up indicators

**Department Calendar:**
- All doctors in department
- Resource allocation view
- Room assignment
- Equipment scheduling
- Coordinated care visibility

#### Calendar Features
- Drag-and-drop rescheduling
- Quick appointment modifications
- Recurring appointment setup
- Group appointments (health camps)
- Waiting list management
- Overbooking controls

### 1.4 Waitlist Management

**Waitlist Features:**
- Automatic waitlist when slots full
- Priority ranking system
- Automatic notification on cancellation
- Waitlist to confirmed conversion
- Waitlist expiry (time-bound)
- Patient position tracking

---

## 2. Patient Queue Management

### 2.1 Token System

#### Token Generation
**Token Assignment:**
- Auto-generation on check-in
- Sequential numbering
- Department-wise token series
- Doctor-wise token series
- Priority tokens (emergency/senior citizens)
- Token validity (date-specific)

**Token Display:**
- Digital display boards in waiting area
- Current serving token number
- Next 3-5 tokens displayed
- Doctor name and room number
- Approximate wait time
- Audio announcement (multilingual)

#### Queue Tracking
**Real-Time Status:**
- Total patients in queue
- Current position in queue
- Estimated wait time
- Patients checked-in vs completed
- Average consultation duration
- Queue length by doctor

### 2.2 Priority Queue Management

**Priority Categories:**
1. **Emergency Cases** - Immediate attention
2. **Senior Citizens** (65+ years) - Priority service
3. **Pregnant Women** - Priority service
4. **Persons with Disabilities** - Priority service
5. **Healthcare Workers** - Priority service
6. **VIP Patients** - As per hospital policy
7. **Returning Patients** (lab/billing) - Quick service

**Priority Implementation:**
- Visual indicators on queue board
- Separate waiting area (optional)
- Priority token colors
- Staff alerts for priority patients

### 2.3 Queue Monitoring Dashboard

**Metrics Displayed:**
- Current queue length by doctor
- Average wait time
- Longest waiting patient
- Patients waiting > 30/60/90 minutes
- Doctor consultation status (busy/available/on break)
- Room occupancy
- Queue bottlenecks

**Alerts:**
- Long wait time alerts (> 60 minutes)
- Queue building up alerts
- Doctor running late alerts
- Room availability alerts

---

## 3. Patient Check-In Process

### 3.1 Registration Desk Operations

#### Appointment Verification
**Check-In Steps:**
1. Patient arrives and approaches reception
2. Verify appointment (booking ID/name/phone)
3. Confirm patient identity
4. Update demographics if changed
5. Verify insurance (if applicable)
6. Collect co-pay/consultation fee
7. Generate token number
8. Assign consultation room
9. Direct patient to waiting area

**Documents Collected:**
- Previous prescriptions/reports
- Insurance card (photocopy)
- Referral letter (if any)
- ID proof (for first visit)

### 3.2 Vital Signs Recording

**Pre-Consultation Vitals:**
Recorded by nursing staff before doctor consultation:

- **Blood Pressure:** Systolic and diastolic (mmHg)
- **Temperature:** Body temperature (°C or °F)
- **Pulse Rate:** Beats per minute
- **Respiratory Rate:** Breaths per minute
- **Height:** In cm or feet/inches
- **Weight:** In kg or pounds
- **BMI:** Auto-calculated from height and weight
- **SpO2:** Oxygen saturation percentage
- **Blood Glucose:** Random/fasting (if required)
- **Pain Score:** 0-10 scale

**Vital Signs Station:**
- Dedicated vitals recording area
- Digital equipment integration (BP monitors, weighing scales)
- Auto-upload to patient record
- Abnormal values flagged
- Historical comparison available

---

## 4. Doctor Consultation Interface

### 4.1 Patient Dashboard

**Quick View Panel:**
When doctor opens patient record, see at-a-glance:

**Patient Demographics:**
- Name, Age, Gender
- Patient ID and photo
- Contact number
- Address

**Chief Complaint:**
- Primary reason for visit
- Duration of symptoms
- Previous complaints history

**Vital Signs:**
- Current vitals recorded today
- Trend graphs (BP, weight over time)
- Abnormal values highlighted

**Medical History Summary:**
- Known allergies (prominently displayed)
- Chronic conditions
- Previous surgeries
- Current medications
- Family history

**Recent Visits:**
- Last consultation date and doctor
- Previous diagnoses
- Treatment given
- Follow-up compliance

**Insurance Status:**
- Insurance provider
- Policy number
- Coverage details
- Pre-authorization status

### 4.2 Consultation Documentation

#### Structured Clinical Documentation

**Chief Complaint (CC):**
- Free text entry
- Common complaints dropdown
- Duration selection
- Severity scale

**History of Present Illness (HPI):**
- Detailed symptom description
- Onset, duration, progression
- Associated symptoms
- Aggravating factors
- Relieving factors
- Previous treatments tried and response

**Review of Systems (ROS):**
System-wise checklist:
- General (fever, weight loss, fatigue)
- Cardiovascular (chest pain, palpitations)
- Respiratory (cough, breathlessness)
- Gastrointestinal (nausea, vomiting, diarrhea)
- Genitourinary (urinary symptoms)
- Musculoskeletal (joint pain)
- Neurological (headache, dizziness)
- Skin (rashes, lesions)

**Past Medical History:**
- Previous illnesses
- Hospitalizations
- Surgeries with dates
- Immunization history

**Medication History:**
- Current medications with dosages
- Medication compliance
- Adverse reactions
- Over-the-counter medications
- Herbal/alternative medicines

**Allergy History:**
- Drug allergies
- Food allergies
- Environmental allergies
- Type of reaction
- Severity

**Family History:**
- Hereditary conditions
- Disease prevalence in family
- Age of parents and siblings

**Social History:**
- Occupation
- Smoking/tobacco use
- Alcohol consumption
- Exercise habits
- Diet patterns
- Sleep patterns

**Physical Examination:**
**General Examination:**
- Appearance and build
- Consciousness level
- Pallor, cyanosis, jaundice, edema
- Lymph nodes

**Systemic Examination:**
Templates for:
- Cardiovascular system
- Respiratory system
- Abdominal examination
- Neurological examination
- Musculoskeletal examination

**Assessment & Diagnosis:**
- **Provisional Diagnosis:** Working diagnosis
- **Differential Diagnosis:** Other possibilities
- **ICD-10 Code:** For billing and statistics
- **Diagnosis Type:** New/Follow-up/Chronic
- **Severity:** Mild/Moderate/Severe

**Treatment Plan:**
- Medications prescribed (detailed below)
- Non-pharmacological advice
- Lifestyle modifications
- Dietary advice
- Activity restrictions
- Rest recommendations
- Referrals to specialists
- Follow-up plan

### 4.3 Clinical Decision Support

**Integrated Alerts:**
- **Drug-Drug Interactions:** Alert when prescribing interacting medications
- **Drug-Allergy Alerts:** Warning if patient allergic to prescribed drug
- **Duplicate Therapy:** Alert for similar medications
- **Dosage Warnings:** Age/weight-based dose checking
- **Pregnancy Warnings:** Contraindicated drugs in pregnancy
- **Renal/Hepatic Warnings:** Dose adjustment needed

**Evidence-Based Guidelines:**
- Clinical pathways for common conditions
- Treatment protocols
- Best practice recommendations
- Diagnostic criteria
- Red flag symptoms

**Differential Diagnosis Support:**
- Symptom-based suggestions
- Diagnostic possibilities
- Recommended investigations

---

## 5. Prescription Management (e-Prescription)

### 5.1 Electronic Prescription Features

**Prescription Header:**
- Hospital logo and details
- Doctor name and registration number
- Specialization
- Contact information
- Date and time
- Patient demographics
- Diagnosis

**Medication Entry:**

For each medication, capture:
- **Drug Name:** Generic or brand name (searchable)
- **Strength:** e.g., 500mg, 10mg, 5ml
- **Dosage Form:** Tablet, capsule, syrup, injection, cream
- **Route:** Oral, IV, IM, topical, inhalation
- **Frequency:** 
  - Once daily (OD)
  - Twice daily (BD)
  - Three times daily (TDS)
  - Four times daily (QID)
  - Every 6/8/12 hours
  - As needed (PRN/SOS)
  - Before meals/after meals/with meals
- **Duration:** Days, weeks, months
- **Quantity:** Total tablets/bottles to dispense
- **Instructions:** 
  - Take with food
  - Take on empty stomach
  - Do not crush
  - Shake well before use
  - Apply thin layer
  - Avoid driving
  - Avoid alcohol

**Prescription Templates:**
- **Favorite Prescriptions:** Save commonly prescribed combinations
- **Protocol-Based:** Standard treatment protocols
- **Condition-Specific:** Pre-filled for diabetes, hypertension, etc.
- **Quick Prescriptions:** One-click for common conditions

**Drug Database Features:**
- Generic and brand name search
- Drug interactions checking
- Allergy cross-checking
- Formulary compliance
- Cost information
- Generic alternatives suggestion
- Stock availability in hospital pharmacy

### 5.2 Prescription Validation

**Auto-Validation Checks:**
- Maximum daily dose not exceeded
- Age-appropriate dosing
- Weight-based dosing (pediatrics)
- Renal function-based adjustments
- Therapeutic duplication check
- High-risk medication double-check

### 5.3 Prescription Output

**Digital Prescription:**
- Digital signature of doctor
- QR code for verification
- Barcode for pharmacy scanning
- Hospital watermark
- Unique prescription ID

**Prescription Delivery:**
- Print at consultation
- SMS to patient mobile
- Email to patient
- Patient portal upload
- Direct transmission to pharmacy
- Mobile app notification

**Prescription History:**
- Previous prescriptions viewable
- Medication changes tracked
- Compliance monitoring
- Refill management

---

## 6. Orders Management

### 6.1 Laboratory Test Orders

**Test Ordering Interface:**
- Search tests by name/category
- Select individual tests or panels
- Indicate urgency (routine/urgent/STAT)
- Clinical indication/diagnosis
- Special instructions
- Sample collection timing
- Fasting requirements

**Order Details:**
- Test name and code
- Sample type required
- Patient preparation instructions
- Expected turnaround time
- Cost (for patient information)
- Insurance coverage check

**Order Tracking:**
- Order status (pending/collected/processing/completed)
- Sample collection time
- Result expected time
- Result availability notification
- View results in system

### 6.2 Radiology/Imaging Orders

**Imaging Order Entry:**
- Select modality (X-ray, CT, MRI, Ultrasound)
- Body part/region
- Contrast requirement
- Clinical indication
- Urgency level
- Previous imaging reference
- Special protocols

**Safety Checks:**
- Pregnancy status (for X-ray/CT)
- Contrast allergy check
- Kidney function check (for contrast)
- Pacemaker/implant check (for MRI)

### 6.3 Referrals

**Specialist Referral:**
- Select specialty
- Select specific doctor (if known)
- Referral reason
- Clinical summary
- Relevant test results
- Urgency level
- Referral letter generation

---

## 7. Follow-Up Management

### 7.1 Follow-Up Scheduling

**Follow-Up Recommendations:**
- Suggested follow-up interval (days/weeks/months)
- Reason for follow-up
- Tests to be done before follow-up
- Specific instructions
- Auto-booking option

**Follow-Up Types:**
- Post-treatment review
- Chronic disease monitoring
- Post-surgical follow-up
- Test result review
- Treatment adjustment
- Medication refill

### 7.2 Follow-Up Reminders

**Automated Reminders:**
- SMS reminder (3 days before)
- Email reminder
- Phone call (for high-risk patients)
- Mobile app notification
- Missed follow-up alerts to doctor

**Follow-Up Tracking:**
- Scheduled vs completed
- Missed follow-ups
- Follow-up compliance rate
- Outcome tracking

---

## 8. Telemedicine Integration

### 8.1 Video Consultation Setup

**Booking Process:**
- Select video consultation option
- Choose date and time
- Make online payment
- Receive video link via SMS/email
- Pre-call instructions

**Requirements:**
- Stable internet connection
- Device with camera and microphone
- Quiet, private space
- Patient ID for verification

### 8.2 Video Consultation Features

**During Consultation:**
- HD video and audio
- Screen sharing (for reports/images)
- Chat feature for links/instructions
- File sharing (upload reports)
- Digital prescription
- E-payment integration
- Session recording (with consent)
- Emergency contact option

**Post-Consultation:**
- Consultation notes saved in EMR
- e-Prescription sent digitally
- Test orders (patient goes to lab)
- Medicine home delivery option
- Follow-up scheduling
- Feedback collection

---

## 9. Medical Certificates & Documents

### 9.1 Certificate Types

**Commonly Issued Certificates:**

**Fitness Certificate:**
- Medical fitness for work
- Fitness to travel
- Fitness for sports/gym
- Pre-employment fitness

**Sick Leave Certificate:**
- Number of days leave recommended
- Diagnosis (if to be disclosed)
- Restrictions during leave period
- Return to work conditions

**Medical Leave Extension:**
- Previous certificate reference
- Reason for extension
- New end date

**Disability Certificate:**
- Type of disability
- Percentage of disability
- Duration (temporary/permanent)
- Functional limitations

**Other Certificates:**
- Pregnancy confirmation
- Vaccination certificate
- Blood group certificate
- Medical condition certificate

### 9.2 Certificate Features

**Template-Based Generation:**
- Pre-formatted templates
- Auto-fill patient details
- Digital signature
- Hospital seal/stamp
- QR code for verification
- Duplicate prevention
- Audit trail

---

## 10. OPD Billing Integration

### 10.1 Charge Capture

**Auto-Charge Posting:**
When doctor completes consultation, charges automatically posted:

- Consultation fee (by doctor/specialty)
- Procedure charges (if any done)
- Test order charges
- ECG/minor procedure charges
- Consumables used

**Charge Modifiers:**
- First visit vs follow-up
- New patient vs returning patient
- Emergency consultation surcharge
- After-hours charges
- Weekend/holiday charges

### 10.2 Billing Process

**Point-of-Care Billing:**
- Real-time bill generation
- Itemized bill display
- Discount application (if eligible)
- Insurance coverage adjustment
- Co-pay calculation
- Net payable amount

**Payment Collection:**
- Multiple payment methods
- Receipt generation
- Payment posting to patient account
- Outstanding tracking

---

## 11. Patient Feedback & Satisfaction

### 11.1 Feedback Collection Methods

**Digital Feedback:**
- Post-consultation SMS survey
- Email survey link
- QR code scan for feedback
- Tablet at reception
- Mobile app rating

**Questions Asked:**
- Overall experience rating (1-5 stars)
- Wait time satisfaction
- Doctor interaction quality
- Staff courtesy
- Facility cleanliness
- Would you recommend? (NPS)
- Open comments

### 11.2 Feedback Analysis

**Metrics Tracked:**
- Average rating by doctor
- Department-wise scores
- Time-trend analysis
- Complaint identification
- Improvement areas
- Response rate

**Action on Feedback:**
- Low rating alerts
- Complaint resolution tracking
- Doctor performance feedback
- Service improvement initiatives

---

## 12. OPD Performance Metrics

### Key Performance Indicators

**Operational KPIs:**
- Daily patient footfall
- Doctor utilization rate
- Average wait time
- Average consultation duration
- Appointment vs walk-in ratio
- No-show rate
- Cancellation rate

**Clinical KPIs:**
- Prescription rate
- Test ordering rate
- Referral rate
- Follow-up compliance
- Diagnosis patterns

**Financial KPIs:**
- Revenue per patient
- Revenue per doctor
- Collection efficiency
- Discount percentage

**Patient Experience KPIs:**
- Patient satisfaction score
- Net Promoter Score (NPS)
- Complaint rate
- Return patient rate

---

## Complete OPD Workflow

```
1. Patient Books Appointment (Online/Phone/Walk-in)
   ↓
2. Appointment Confirmation (SMS/Email)
   ↓
3. Appointment Reminder (1 day before)
   ↓
4. Patient Arrives at Hospital
   ↓
5. Check-in at Reception
   ↓
6. Token Generation
   ↓
7. Vital Signs Recording
   ↓
8. Waiting Area
   ↓
9. Token Called
   ↓
10. Doctor Consultation
    ↓
11. Clinical Documentation
    ↓
12. Diagnosis & Treatment Plan
    ↓
13. e-Prescription Generation
    ↓
14. Test Orders (if needed)
    ↓
15. Billing & Payment
    ↓
16. Pharmacy (Medicines)
    ↓
17. Lab/Radiology (if tests ordered)
    ↓
18. Follow-up Scheduled
    ↓
19. Patient Departure
    ↓
20. Feedback Collection
```

---

## Integration Points

- **Patient Module:** Patient demographics, medical history
- **Doctor Module:** Doctor schedules, credentials
- **Billing Module:** Auto charge posting
- **Pharmacy Module:** Prescription fulfillment
- **Laboratory Module:** Test orders and results
- **Radiology Module:** Imaging orders
- **Insurance Module:** Coverage verification
- **SMS/Email Gateway:** Notifications
- **Payment Gateway:** Online payments
- **Telemedicine Platform:** Video consultations

