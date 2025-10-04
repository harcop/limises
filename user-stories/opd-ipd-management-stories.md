# OPD & IPD Management Module - User Stories

## Overview

This document contains comprehensive user stories for the Outpatient Department (OPD) and Inpatient Department (IPD) Management Modules, covering patient flow, queue management, bed management, and care coordination.

---

## 1. OPD Management Stories

### Story 1.1: OPD Patient Check-in

**As a** Receptionist  
**I want to** check in patients for OPD visits with token generation  
**So that** patients can be efficiently queued and seen by healthcare providers

#### Acceptance Criteria:
- [ ] Patient identity verification at check-in
- [ ] Automatic token number generation
- [ ] Queue position assignment based on arrival time
- [ ] Staff assignment or selection
- [ ] Estimated wait time calculation
- [ ] Check-in confirmation with token details

#### Database Entities Involved:
- **OPD_VISIT**: New OPD visit record
- **OPD_QUEUE**: Queue management and positioning
- **PATIENT**: Patient information for check-in
- **STAFF**: Staff assignment and availability

#### API Endpoints:
- `POST /api/opd/check-in`: Process patient check-in
- `GET /api/opd/token/{tokenNumber}`: Get token details
- `GET /api/opd/queue-status`: Get current queue status
- `POST /api/opd/assign-staff`: Assign staff member to patient

#### Frontend Components:
- **OPDCheckInForm**: Patient check-in interface
- **TokenDisplay**: Token number and queue position
- **QueueStatusBoard**: Real-time queue display
- **StaffSelector**: Staff assignment interface
- **WaitTimeEstimator**: Estimated wait time display

#### Business Rules:
- Token numbers are sequential and unique per day
- Queue position based on first-come-first-served
- Walk-in patients can select available healthcare providers
- Appointed patients have priority in queue
- Check-in time recorded for analytics

#### Test Scenarios:
- **Walk-in Check-in**: Patient without appointment
- **Appointment Check-in**: Patient with scheduled appointment
- **Provider Selection**: Patient choosing specific healthcare provider
- **Queue Full**: Handle when queue is at capacity
- **Token Reprint**: Reprint lost token

---

### Story 1.2: OPD Queue Management

**As a** OPD Staff Member  
**I want to** manage patient queues efficiently  
**So that** patients are seen in proper order and wait times are minimized

#### Acceptance Criteria:
- [ ] Real-time queue position updates
- [ ] Queue status display for patients
- [ ] Staff queue management
- [ ] Priority queue handling for urgent cases
- [ ] Queue analytics and reporting
- [ ] Automatic queue progression

#### Database Entities Involved:
- **OPD_QUEUE**: Queue management and status
- **OPD_VISIT**: Visit status updates
- **STAFF**: Staff queue assignments

#### API Endpoints:
- `GET /api/opd/queue/{staffId}`: Get staff member's queue
- `PUT /api/opd/queue/{queueId}/status`: Update queue status
- `POST /api/opd/queue/priority`: Add priority patient
- `GET /api/opd/queue/analytics`: Get queue analytics

#### Frontend Components:
- **QueueManagementDashboard**: Queue overview interface
- **StaffQueueView**: Individual staff member queue display
- **QueueStatusIndicator**: Real-time status updates
- **PriorityQueueManager**: Handle priority patients
- **QueueAnalyticsChart**: Queue performance metrics

#### Business Rules:
- Queue positions updated in real-time
- Priority patients can be moved ahead in queue
- Staff members can manage their own queues
- Queue analytics tracked for performance
- Maximum queue capacity enforced

#### Test Scenarios:
- **Normal Queue Flow**: Standard queue progression
- **Priority Patient**: Handle urgent case in queue
- **Provider Unavailable**: Handle healthcare provider absence
- **Queue Overflow**: Manage queue capacity limits
- **Queue Analytics**: Generate queue performance reports

---

### Story 1.3: Vital Signs Recording

**As a** Nurse or Medical Assistant  
**I want to** record patient vital signs during OPD visits  
**So that** healthcare providers have current health data for clinical decision making

#### Acceptance Criteria:
- [ ] Record temperature, blood pressure, heart rate, respiratory rate
- [ ] Capture weight and height measurements
- [ ] Oxygen saturation monitoring
- [ ] Vital signs validation and normal ranges
- [ ] Integration with patient record
- [ ] Vital signs trending and history

#### Database Entities Involved:
- **VITAL_SIGNS**: Vital signs measurements
- **OPD_VISIT**: Link to OPD visit
- **PATIENT**: Patient vital signs history

#### API Endpoints:
- `POST /api/vital-signs`: Record vital signs
- `GET /api/patients/{id}/vital-signs`: Get patient vital signs history
- `GET /api/vital-signs/normal-ranges`: Get normal value ranges
- `POST /api/vital-signs/validate`: Validate vital signs values

#### Frontend Components:
- **VitalSignsForm**: Vital signs entry form
- **VitalSignsChart**: Historical vital signs display
- **NormalRangeIndicator**: Normal value indicators
- **VitalSignsValidator**: Real-time validation
- **VitalSignsHistory**: Historical trends

#### Business Rules:
- All vital signs must be within reasonable ranges
- Abnormal values flagged for immediate attention
- Vital signs linked to specific OPD visit
- Historical trends available for comparison
- Vital signs recorded by authorized staff only

#### Test Scenarios:
- **Normal Vital Signs**: Record normal values
- **Abnormal Vital Signs**: Handle abnormal values
- **Missing Values**: Handle incomplete vital signs
- **Historical Comparison**: Compare with previous visits
- **Vital Signs Validation**: Test validation rules

---

### Story 1.4: OPD Consultation Management

**As a** Doctor  
**I want to** manage OPD consultations efficiently  
**So that** I can provide quality care while maintaining patient flow

#### Acceptance Criteria:
- [ ] View patient queue and select next patient
- [ ] Access patient history and current vital signs
- [ ] Document consultation findings
- [ ] Generate prescriptions and referrals
- [ ] Update patient status in queue
- [ ] Schedule follow-up appointments

#### Database Entities Involved:
- **OPD_VISIT**: Consultation documentation
- **CLINICAL_NOTE**: Clinical findings
- **PRESCRIPTION**: Prescription generation
- **APPOINTMENT**: Follow-up scheduling

#### API Endpoints:
- `GET /api/opd/staff/{staffId}/next-patient`: Get next patient for staff member
- `PUT /api/opd/visit/{visitId}/consultation`: Update consultation
- `POST /api/opd/visit/{visitId}/complete`: Complete consultation
- `GET /api/opd/visit/{visitId}/patient-history`: Get patient history

#### Frontend Components:
- **DoctorOPDDashboard**: Doctor's OPD interface
- **PatientQueueView**: Current patient queue
- **ConsultationForm**: Consultation documentation
- **PatientHistoryViewer**: Patient medical history
- **FollowUpScheduler**: Schedule follow-up appointments

#### Business Rules:
- Patients seen in queue order unless priority
- Consultation must be documented before completion
- Prescriptions generated during consultation
- Follow-up appointments scheduled as needed
- Consultation time tracked for analytics

#### Test Scenarios:
- **Standard Consultation**: Complete routine consultation
- **Complex Consultation**: Handle complex medical case
- **Prescription Generation**: Create prescriptions during consultation
- **Follow-up Scheduling**: Schedule follow-up appointments
- **Consultation Documentation**: Document clinical findings

---

## 2. IPD Management Stories

### Story 2.1: Patient Admission

**As a** Doctor or Admission Staff  
**I want to** admit patients to inpatient departments  
**So that** patients receive appropriate inpatient care

#### Acceptance Criteria:
- [ ] Patient admission with bed assignment
- [ ] Ward and room allocation
- [ ] Admission type classification (emergency, planned, transfer)
- [ ] Admission reason and diagnosis documentation
- [ ] Insurance verification and authorization
- [ ] Admission notification to relevant staff

#### Database Entities Involved:
- **IPD_ADMISSION**: Admission record
- **BED**: Bed assignment and status
- **WARD**: Ward allocation
- **PATIENT**: Patient admission information

#### API Endpoints:
- `POST /api/ipd/admissions`: Create new admission
- `GET /api/ipd/beds/available`: Get available beds
- `POST /api/ipd/admissions/{id}/assign-bed`: Assign bed to patient
- `GET /api/ipd/wards/available`: Get available wards

#### Frontend Components:
- **AdmissionForm**: Patient admission interface
- **BedSelector**: Available bed selection
- **WardSelector**: Ward assignment interface
- **AdmissionTypeSelector**: Admission type selection
- **AdmissionConfirmation**: Admission confirmation display

#### Business Rules:
- Bed assignment required for admission
- Ward capacity limits enforced
- Emergency admissions have priority
- Insurance authorization required for planned admissions
- Admission notifications sent to nursing staff

#### Test Scenarios:
- **Emergency Admission**: Urgent patient admission
- **Planned Admission**: Scheduled patient admission
- **Transfer Admission**: Patient transfer from another facility
- **Bed Assignment**: Assign appropriate bed
- **Admission Documentation**: Complete admission paperwork

---

### Story 2.2: Bed Management

**As a** Nursing Staff or Ward Manager  
**I want to** manage bed assignments and availability  
**So that** patients are placed in appropriate beds and capacity is optimized

#### Acceptance Criteria:
- [ ] Real-time bed availability tracking
- [ ] Bed status updates (available, occupied, maintenance)
- [ ] Bed type and equipment management
- [ ] Bed transfer capabilities
- [ ] Bed utilization analytics
- [ ] Maintenance scheduling and tracking

#### Database Entities Involved:
- **BED**: Bed information and status
- **WARD**: Ward bed capacity
- **IPD_ADMISSION**: Bed assignments
- **BED_MAINTENANCE**: Maintenance records

#### API Endpoints:
- `GET /api/beds/status`: Get bed status overview
- `PUT /api/beds/{bedId}/status`: Update bed status
- `GET /api/beds/available`: Get available beds
- `POST /api/beds/{bedId}/maintenance`: Schedule bed maintenance

#### Frontend Components:
- **BedManagementDashboard**: Bed overview interface
- **BedStatusGrid**: Visual bed status display
- **BedTransferModal**: Bed transfer interface
- **MaintenanceScheduler**: Bed maintenance scheduling
- **BedUtilizationChart**: Bed usage analytics

#### Business Rules:
- Bed status updated in real-time
- Bed transfers require authorization
- Maintenance scheduled during low occupancy
- Bed utilization tracked for capacity planning
- Emergency beds reserved for urgent cases

#### Test Scenarios:
- **Bed Assignment**: Assign bed to new patient
- **Bed Transfer**: Transfer patient to different bed
- **Bed Maintenance**: Schedule and track maintenance
- **Bed Availability**: Check real-time availability
- **Bed Utilization**: Generate utilization reports

---

### Story 2.3: Ward Management

**As a** Ward Manager or Nursing Supervisor  
**I want to** manage ward operations and capacity  
**So that** patient care is coordinated and resources are optimized

#### Acceptance Criteria:
- [ ] Ward capacity and occupancy tracking
- [ ] Staff assignment and scheduling
- [ ] Patient distribution across wards
- [ ] Ward-specific protocols and procedures
- [ ] Ward performance analytics
- [ ] Inter-ward transfer management

#### Database Entities Involved:
- **WARD**: Ward information and capacity
- **IPD_ADMISSION**: Ward assignments
- **STAFF**: Ward staff assignments
- **PATIENT_TRANSFER**: Inter-ward transfers

#### API Endpoints:
- `GET /api/wards/status`: Get ward status overview
- `GET /api/wards/{wardId}/occupancy`: Get ward occupancy
- `POST /api/wards/{wardId}/staff-assignment`: Assign staff to ward
- `GET /api/wards/analytics`: Get ward performance analytics

#### Frontend Components:
- **WardManagementDashboard**: Ward overview interface
- **WardOccupancyChart**: Visual occupancy display
- **StaffAssignmentInterface**: Staff scheduling
- **WardTransferManager**: Inter-ward transfers
- **WardAnalyticsReport**: Performance metrics

#### Business Rules:
- Ward capacity limits enforced
- Staff assignments based on patient acuity
- Inter-ward transfers require authorization
- Ward protocols followed for patient care
- Performance metrics tracked for improvement

#### Test Scenarios:
- **Ward Occupancy**: Monitor ward capacity
- **Staff Assignment**: Assign staff to wards
- **Inter-ward Transfer**: Transfer patients between wards
- **Ward Protocols**: Follow ward-specific procedures
- **Performance Analytics**: Generate ward reports

---

### Story 2.4: Nursing Care Management

**As a** Nurse  
**I want to** document and manage patient care activities  
**So that** patient care is coordinated and documented properly

#### Acceptance Criteria:
- [ ] Document nursing assessments and interventions
- [ ] Track medication administration
- [ ] Record vital signs and patient observations
- [ ] Coordinate with other healthcare providers
- [ ] Update care plans based on patient condition
- [ ] Document patient response to care

#### Database Entities Involved:
- **NURSING_CARE**: Nursing care documentation
- **IPD_ADMISSION**: Patient care context
- **MEDICATION**: Medication administration
- **VITAL_SIGNS**: Patient monitoring

#### API Endpoints:
- `POST /api/nursing-care`: Document nursing care
- `GET /api/patients/{id}/nursing-care`: Get patient care history
- `PUT /api/nursing-care/{id}`: Update care documentation
- `GET /api/nursing-care/assignments`: Get nursing care assignments

#### Frontend Components:
- **NursingCareForm**: Care documentation interface
- **PatientCarePlan**: Care plan display
- **MedicationAdministration**: Medication tracking
- **VitalSignsMonitoring**: Patient monitoring
- **CareCoordination**: Provider communication

#### Business Rules:
- All care activities must be documented
- Medication administration tracked with timestamps
- Care plans updated based on patient response
- Nursing care coordinated with medical orders
- Care documentation follows nursing standards

#### Test Scenarios:
- **Routine Care**: Document standard nursing care
- **Medication Administration**: Track medication given
- **Patient Assessment**: Document patient condition
- **Care Plan Update**: Modify care based on patient needs
- **Care Coordination**: Coordinate with other providers

---

### Story 2.5: Doctor Orders Management

**As a** Doctor  
**I want to** create and manage medical orders for inpatients  
**So that** patient care is properly directed and executed

#### Acceptance Criteria:
- [ ] Create medication, laboratory, and procedure orders
- [ ] Set order priority and timing
- [ ] Review and modify existing orders
- [ ] Track order execution and completion
- [ ] Integrate with clinical decision support
- [ ] Document order rationale and outcomes

#### Database Entities Involved:
- **DOCTOR_ORDERS**: Medical orders
- **IPD_ADMISSION**: Order context
- **MEDICATION**: Medication orders
- **LAB_ORDER**: Laboratory orders

#### API Endpoints:
- `POST /api/medical-orders`: Create new order
- `GET /api/patients/{id}/orders`: Get patient orders
- `PUT /api/medical-orders/{id}`: Update order
- `POST /api/medical-orders/{id}/execute`: Mark order as executed

#### Frontend Components:
- **OrderCreationForm**: Create medical orders
- **OrderManagementView**: Manage existing orders
- **OrderPrioritySelector**: Set order priority
- **OrderExecutionTracker**: Track order completion
- **OrderHistoryView**: Order history and outcomes

#### Business Rules:
- All orders must be signed by authorized provider
- Order priority determines execution sequence
- Orders can be modified or cancelled with documentation
- Order execution tracked for compliance
- Clinical decision support integrated with orders

#### Test Scenarios:
- **Medication Order**: Create medication order
- **Laboratory Order**: Order laboratory tests
- **Procedure Order**: Order medical procedures
- **Order Modification**: Modify existing order
- **Order Execution**: Track order completion

---

### Story 2.6: Patient Transfer Management

**As a** Healthcare Provider  
**I want to** manage patient transfers between wards and departments  
**So that** patients receive appropriate care in the right location

#### Acceptance Criteria:
- [ ] Initiate patient transfer requests
- [ ] Coordinate transfer between sending and receiving units
- [ ] Document transfer reason and patient condition
- [ ] Update bed assignments and ward occupancy
- [ ] Transfer patient records and care plans
- [ ] Notify relevant staff of transfer

#### Database Entities Involved:
- **PATIENT_TRANSFER**: Transfer records
- **IPD_ADMISSION**: Admission updates
- **BED**: Bed reassignment
- **WARD**: Ward occupancy updates

#### API Endpoints:
- `POST /api/patient-transfers`: Initiate patient transfer
- `GET /api/patient-transfers/pending`: Get pending transfers
- `PUT /api/patient-transfers/{id}/approve`: Approve transfer
- `POST /api/patient-transfers/{id}/complete`: Complete transfer

#### Frontend Components:
- **TransferRequestForm**: Initiate transfer request
- **TransferApprovalInterface**: Approve transfers
- **TransferCoordinationView**: Coordinate transfers
- **TransferStatusTracker**: Track transfer progress
- **TransferHistoryView**: Transfer history

#### Business Rules:
- Transfers require authorization from both units
- Patient condition documented before transfer
- Bed assignments updated during transfer
- Transfer records maintained for audit
- Emergency transfers have priority processing

#### Test Scenarios:
- **Routine Transfer**: Standard ward-to-ward transfer
- **Emergency Transfer**: Urgent patient transfer
- **Transfer Approval**: Approve transfer request
- **Transfer Coordination**: Coordinate between units
- **Transfer Documentation**: Document transfer process

---

## 3. Integration Scenarios

### Scenario 1: Complete OPD Visit
1. **Patient Check-in** → Patient arrives and receives token
2. **Queue Management** → Patient queued for healthcare provider consultation
3. **Vital Signs Recording** → Nurse records vital signs
4. **Healthcare Provider Consultation** → Healthcare provider examines and treats patient
5. **Prescription & Follow-up** → Healthcare provider prescribes medication and schedules follow-up

### Scenario 2: IPD Admission and Care
1. **Patient Admission** → Patient admitted to appropriate ward and bed
2. **Nursing Assessment** → Nurse performs initial assessment
3. **Medical Orders** → Healthcare provider creates medical orders
4. **Care Delivery** → Nursing staff execute care plan
5. **Progress Monitoring** → Patient progress tracked and documented

### Scenario 3: Inter-Department Transfer
1. **Transfer Request** → Healthcare provider initiates transfer
2. **Transfer Coordination** → Sending and receiving units coordinate
3. **Patient Preparation** → Patient prepared for transfer
4. **Transfer Execution** → Patient moved to new location
5. **Care Continuity** → Care plan updated and continued

---

*These user stories provide comprehensive coverage of the OPD and IPD Management Modules, ensuring efficient patient flow and quality care delivery in both outpatient and inpatient settings.*
