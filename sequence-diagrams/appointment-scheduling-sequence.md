# Appointment Scheduling Module - End-to-End Sequence Diagram

## Online Appointment Booking Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant PORTAL as Patient Portal
    participant HMS as HMS System
    participant SCHED as Scheduling System
    participant DB as Database
    participant PAY as Payment System
    participant NOT as Notification Service
    participant DR as Doctor

    P->>PORTAL: Access appointment booking
    PORTAL->>HMS: Request available providers
    HMS->>DB: Query provider database
    DB-->>HMS: Return provider list
    HMS-->>PORTAL: Display providers
    P->>PORTAL: Select provider
    PORTAL->>SCHED: Request available slots
    SCHED->>DB: Check provider availability
    DB-->>SCHED: Return available slots
    SCHED-->>PORTAL: Display available times
    P->>PORTAL: Select appointment time
    PORTAL->>HMS: Create appointment request
    HMS->>DB: Check slot availability
    DB-->>HMS: Slot available
    HMS->>PAY: Process payment
    PAY->>P: Request payment details
    P->>PAY: Provide payment information
    PAY-->>HMS: Payment successful
    HMS->>DB: Create appointment record
    HMS->>NOT: Send confirmation
    NOT->>P: Appointment confirmation
    NOT->>DR: New appointment notification
    HMS-->>PORTAL: Booking successful
    PORTAL-->>P: Appointment confirmed
```

## Phone Booking System Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant AGENT as Call Center Agent
    participant HMS as HMS System
    participant SCHED as Scheduling System
    participant DB as Database
    participant PAY as Payment System
    participant NOT as Notification Service

    P->>AGENT: Call for appointment
    AGENT->>HMS: Search patient record
    HMS->>DB: Query patient database
    DB-->>HMS: Return patient information
    HMS-->>AGENT: Display patient details
    AGENT->>P: Verify patient identity
    P->>AGENT: Confirms identity
    AGENT->>P: Ask for preferred provider/date
    P->>AGENT: Provides preferences
    AGENT->>SCHED: Check availability
    SCHED->>DB: Query provider schedule
    DB-->>SCHED: Return available slots
    SCHED-->>AGENT: Available options
    AGENT->>P: Present available slots
    P->>AGENT: Selects appointment
    AGENT->>HMS: Create appointment
    HMS->>PAY: Process payment over phone
    PAY->>P: Request payment details
    P->>PAY: Provide payment information
    PAY-->>HMS: Payment processed
    HMS->>DB: Save appointment
    HMS->>NOT: Send confirmation
    NOT->>P: SMS/Email confirmation
    HMS-->>AGENT: Booking complete
    AGENT->>P: Confirm appointment details
```

## Walk-in Appointment Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant R as Receptionist
    participant HMS as HMS System
    participant SCHED as Scheduling System
    participant DB as Database
    participant QUEUE as Queue Management
    participant NOT as Notification Service

    P->>R: Arrives without appointment
    R->>HMS: Check patient record
    HMS->>DB: Query patient database
    DB-->>HMS: Return patient information
    HMS-->>R: Display patient details
    R->>P: Verify identity
    P->>R: Confirms identity
    R->>SCHED: Check same-day availability
    SCHED->>DB: Query provider schedules
    DB-->>SCHED: Return available slots
    SCHED-->>R: Available options
    R->>P: Present available slots
    P->>R: Selects appointment
    R->>HMS: Create walk-in appointment
    HMS->>QUEUE: Add to queue
    QUEUE->>DB: Update queue status
    HMS->>NOT: Notify provider
    NOT->>SCHED: Update provider schedule
    HMS->>DB: Generate token number
    HMS-->>R: Appointment created
    R->>P: Provide token and wait time
    QUEUE->>P: Display queue status
```

## Appointment Rescheduling Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant PORTAL as Patient Portal
    participant HMS as HMS System
    participant SCHED as Scheduling System
    participant DB as Database
    participant NOT as Notification Service
    participant DR as Doctor

    P->>PORTAL: Request reschedule
    PORTAL->>HMS: Get current appointment
    HMS->>DB: Retrieve appointment details
    DB-->>HMS: Return appointment info
    HMS-->>PORTAL: Display current appointment
    P->>PORTAL: Select new date/time
    PORTAL->>SCHED: Check new slot availability
    SCHED->>DB: Query provider schedule
    DB-->>SCHED: Return available slots
    SCHED-->>PORTAL: Display alternatives
    P->>PORTAL: Confirm new appointment
    PORTAL->>HMS: Process reschedule
    HMS->>DB: Cancel original appointment
    HMS->>DB: Create new appointment
    HMS->>NOT: Send reschedule notifications
    NOT->>P: New appointment confirmation
    NOT->>DR: Schedule change notification
    HMS->>DB: Update appointment history
    HMS-->>PORTAL: Reschedule successful
    PORTAL-->>P: Appointment rescheduled
```

## Appointment Cancellation Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant PORTAL as Patient Portal
    participant HMS as HMS System
    participant SCHED as Scheduling System
    participant DB as Database
    participant PAY as Payment System
    participant NOT as Notification Service
    participant DR as Doctor

    P->>PORTAL: Request cancellation
    PORTAL->>HMS: Get appointment details
    HMS->>DB: Retrieve appointment
    DB-->>HMS: Return appointment info
    HMS-->>PORTAL: Display appointment details
    P->>PORTAL: Confirm cancellation
    PORTAL->>HMS: Process cancellation
    HMS->>DB: Update appointment status
    HMS->>SCHED: Free up time slot
    SCHED->>DB: Update provider schedule
    HMS->>PAY: Process refund if applicable
    PAY->>P: Refund processed
    HMS->>NOT: Send cancellation notifications
    NOT->>P: Cancellation confirmation
    NOT->>DR: Appointment cancelled notification
    HMS->>DB: Update cancellation history
    HMS-->>PORTAL: Cancellation complete
    PORTAL-->>P: Appointment cancelled
```

## Queue Management Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant R as Receptionist
    participant HMS as HMS System
    participant QUEUE as Queue Management
    participant DB as Database
    participant DISPLAY as Display Board
    participant NOT as Notification Service
    participant DR as Doctor

    P->>R: Check-in for appointment
    R->>HMS: Process check-in
    HMS->>QUEUE: Add to queue
    QUEUE->>DB: Update queue status
    QUEUE->>DISPLAY: Update display board
    DISPLAY->>P: Show queue position
    QUEUE->>NOT: Notify provider
    NOT->>DR: Patient ready notification
    DR->>HMS: Call next patient
    HMS->>QUEUE: Update queue status
    QUEUE->>DB: Update queue
    QUEUE->>DISPLAY: Update display
    QUEUE->>NOT: Notify patient
    NOT->>P: "Please proceed to room X"
    P->>DR: Arrives at consultation room
    DR->>HMS: Start consultation
    HMS->>QUEUE: Remove from queue
    QUEUE->>DB: Update queue status
    QUEUE->>DISPLAY: Update display board
```

## Provider Schedule Management Flow

```mermaid
sequenceDiagram
    participant DR as Doctor
    participant HMS as HMS System
    participant SCHED as Scheduling System
    participant DB as Database
    participant NOT as Notification Service
    participant PATIENTS as Patient List

    DR->>HMS: Access schedule management
    HMS->>SCHED: Get provider schedule
    SCHED->>DB: Query provider calendar
    DB-->>SCHED: Return schedule data
    SCHED-->>HMS: Display schedule
    HMS-->>DR: Show current schedule
    DR->>HMS: Request schedule changes
    HMS->>SCHED: Process schedule update
    SCHED->>DB: Check for conflicts
    DB-->>SCHED: Conflict check result
    alt No Conflicts
        SCHED->>DB: Update schedule
        SCHED->>NOT: Notify affected patients
        NOT->>PATIENTS: Schedule change notification
        SCHED-->>HMS: Schedule updated
        HMS-->>DR: Changes saved
    else Conflicts Found
        SCHED-->>HMS: Conflict alert
        HMS-->>DR: Show conflicts
        DR->>HMS: Resolve conflicts
        HMS->>SCHED: Apply resolution
        SCHED->>DB: Update schedule
        SCHED-->>HMS: Schedule updated
        HMS-->>DR: Changes saved
    end
```

## Appointment Reminder Flow

```mermaid
sequenceDiagram
    participant HMS as HMS System
    participant SCHED as Scheduling System
    participant DB as Database
    participant NOT as Notification Service
    participant P as Patient
    participant SMS as SMS Service
    participant EMAIL as Email Service
    participant APP as Mobile App

    HMS->>SCHED: Check upcoming appointments
    SCHED->>DB: Query appointment database
    DB-->>SCHED: Return appointments due for reminder
    SCHED-->>HMS: List of appointments
    HMS->>NOT: Schedule reminder notifications
    NOT->>DB: Get patient preferences
    DB-->>NOT: Return communication preferences
    NOT->>SMS: Send SMS reminder
    SMS->>P: SMS notification
    NOT->>EMAIL: Send email reminder
    EMAIL->>P: Email notification
    NOT->>APP: Send push notification
    APP->>P: Push notification
    P->>APP: Acknowledge reminder
    APP->>NOT: Update notification status
    NOT->>DB: Log notification activity
    HMS->>SCHED: Schedule follow-up reminder
    SCHED->>NOT: Send follow-up notification
    NOT->>P: Follow-up reminder
```

## Telemedicine Appointment Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant PORTAL as Patient Portal
    participant HMS as HMS System
    participant SCHED as Scheduling System
    participant DB as Database
    participant VIDEO as Video Platform
    participant NOT as Notification Service
    participant DR as Doctor

    P->>PORTAL: Request telemedicine appointment
    PORTAL->>HMS: Check telemedicine availability
    HMS->>SCHED: Query virtual appointment slots
    SCHED->>DB: Check provider virtual schedule
    DB-->>SCHED: Return available virtual slots
    SCHED-->>HMS: Available telemedicine times
    HMS-->>PORTAL: Display virtual options
    P->>PORTAL: Select virtual appointment
    PORTAL->>HMS: Create telemedicine appointment
    HMS->>DB: Save virtual appointment
    HMS->>NOT: Send appointment confirmation
    NOT->>P: Virtual appointment details
    NOT->>DR: Telemedicine appointment notification
    HMS->>VIDEO: Generate meeting link
    VIDEO-->>HMS: Meeting room created
    HMS->>NOT: Send meeting link
    NOT->>P: Video consultation link
    NOT->>DR: Video consultation link
    P->>VIDEO: Join video call
    DR->>VIDEO: Join video call
    VIDEO->>HMS: Log consultation session
    HMS->>DB: Update appointment status
```

## Group Appointment Flow

```mermaid
sequenceDiagram
    participant P1 as Patient 1
    participant P2 as Patient 2
    participant P3 as Patient 3
    participant R as Receptionist
    participant HMS as HMS System
    participant SCHED as Scheduling System
    participant DB as Database
    participant DR as Doctor
    participant NOT as Notification Service

    P1->>R: Request group appointment
    R->>HMS: Create group appointment
    HMS->>SCHED: Check group availability
    SCHED->>DB: Query provider schedule
    DB-->>SCHED: Return available group slots
    SCHED-->>HMS: Available group times
    HMS-->>R: Display group options
    R->>P1: Present group appointment options
    P1->>R: Select group appointment
    R->>HMS: Add patients to group
    HMS->>DB: Create group appointment
    HMS->>NOT: Send group notifications
    NOT->>P1: Group appointment confirmation
    NOT->>P2: Group appointment invitation
    NOT->>P3: Group appointment invitation
    NOT->>DR: Group appointment notification
    P2->>HMS: Accept group invitation
    P3->>HMS: Accept group invitation
    HMS->>DB: Update group attendance
    HMS->>SCHED: Confirm group appointment
    SCHED->>DB: Reserve group time slot
    HMS-->>R: Group appointment confirmed
```

## Appointment Analytics Flow

```mermaid
sequenceDiagram
    participant ADMIN as Administrator
    participant HMS as HMS System
    participant SCHED as Scheduling System
    participant DB as Database
    participant ANALYTICS as Analytics Engine
    participant REPORT as Report Generator

    ADMIN->>HMS: Request appointment analytics
    HMS->>SCHED: Get scheduling data
    SCHED->>DB: Query appointment database
    DB-->>SCHED: Return appointment data
    SCHED-->>HMS: Appointment statistics
    HMS->>ANALYTICS: Process appointment data
    ANALYTICS->>ANALYTICS: Calculate metrics
    Note over ANALYTICS: - No-show rates<br/>- Cancellation rates<br/>- Wait times<br/>- Provider utilization
    ANALYTICS-->>HMS: Analytics results
    HMS->>REPORT: Generate appointment report
    REPORT->>REPORT: Create visualizations
    REPORT-->>HMS: Appointment analytics report
    HMS-->>ADMIN: Display appointment insights
    ADMIN->>HMS: Request trend analysis
    HMS->>ANALYTICS: Analyze historical trends
    ANALYTICS->>DB: Query historical data
    DB-->>ANALYTICS: Return trend data
    ANALYTICS-->>HMS: Trend analysis results
    HMS-->>ADMIN: Appointment trends and recommendations
```
