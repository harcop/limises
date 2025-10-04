# Human Resources Module - End-to-End Sequence Diagram

## Employee Onboarding Flow

```mermaid
sequenceDiagram
    participant HR as HR Staff
    participant EMP as New Employee
    participant HMS as HMS System
    participant HR_SYS as HR System
    participant DB as Database
    participant IT as IT Department
    participant MANAGER as Department Manager
    participant NOT as Notification Service

    HR->>HMS: Access HR system
    HMS->>HR_SYS: Initiate onboarding
    HR_SYS->>DB: Create employee record
    DB-->>HR_SYS: Employee record created
    HR_SYS->>IT: Request system access
    IT->>DB: Create user accounts
    IT-->>HR_SYS: System access granted
    HR_SYS->>NOT: Send onboarding notifications
    NOT->>EMP: Welcome and onboarding instructions
    NOT->>MANAGER: New employee notification
    EMP->>HMS: Complete onboarding tasks
    HMS->>HR_SYS: Update onboarding status
    HR_SYS->>DB: Save onboarding progress
    MANAGER->>HMS: Assign mentor and training
    HMS->>HR_SYS: Update employee assignments
    HR_SYS->>DB: Save employee assignments
    HR_SYS-->>HR: Onboarding process complete
```

## Employee Performance Review Flow

```mermaid
sequenceDiagram
    participant EMP as Employee
    participant MANAGER as Manager
    participant HMS as HMS System
    participant HR_SYS as HR System
    participant DB as Database
    participant PERFORMANCE as Performance System
    participant GOALS as Goals System
    participant NOT as Notification Service

    HMS->>PERFORMANCE: Initiate performance review
    PERFORMANCE->>NOT: Send review notification
    NOT->>EMP: Performance review due
    NOT->>MANAGER: Performance review due
    EMP->>HMS: Complete self-evaluation
    HMS->>PERFORMANCE: Submit self-evaluation
    PERFORMANCE->>DB: Save self-evaluation
    MANAGER->>HMS: Complete manager evaluation
    HMS->>PERFORMANCE: Submit manager evaluation
    PERFORMANCE->>DB: Save manager evaluation
    PERFORMANCE->>PERFORMANCE: Calculate overall rating
    PERFORMANCE->>GOALS: Review goal achievement
    GOALS->>DB: Query goal data
    DB-->>GOALS: Return goal information
    GOALS-->>PERFORMANCE: Return goal assessment
    PERFORMANCE->>DB: Save performance review
    PERFORMANCE->>NOT: Send review completion
    NOT->>EMP: Performance review complete
    NOT->>MANAGER: Performance review complete
    PERFORMANCE-->>HMS: Performance review finished
```

## Leave Management Flow

```mermaid
sequenceDiagram
    participant EMP as Employee
    participant MANAGER as Manager
    participant HMS as HMS System
    participant HR_SYS as HR System
    participant DB as Database
    participant LEAVE as Leave System
    participant CALENDAR as Calendar System
    participant NOT as Notification Service

    EMP->>HMS: Request leave
    HMS->>LEAVE: Process leave request
    LEAVE->>DB: Check leave balance
    DB-->>LEAVE: Return leave balance
    LEAVE->>CALENDAR: Check calendar conflicts
    CALENDAR-->>LEAVE: Return calendar status
    LEAVE->>NOT: Send approval request
    NOT->>MANAGER: Leave approval request
    MANAGER->>HMS: Review leave request
    HMS->>LEAVE: Access leave details
    LEAVE->>DB: Retrieve leave data
    DB-->>LEAVE: Return leave information
    LEAVE-->>HMS: Display leave request
    HMS-->>MANAGER: Show leave details
    MANAGER->>LEAVE: Approve/reject leave
    LEAVE->>DB: Update leave status
    LEAVE->>CALENDAR: Update calendar
    LEAVE->>NOT: Send leave decision
    NOT->>EMP: Leave approval/rejection
    LEAVE-->>HMS: Leave request processed
```

## Recruitment Process Flow

```mermaid
sequenceDiagram
    participant HR as HR Staff
    participant MANAGER as Hiring Manager
    participant CANDIDATE as Candidate
    participant HMS as HMS System
    participant HR_SYS as HR System
    participant DB as Database
    participant RECRUITMENT as Recruitment System
    participant INTERVIEW as Interview System
    participant NOT as Notification Service

    MANAGER->>HMS: Request new position
    HMS->>HR_SYS: Create job requisition
    HR_SYS->>DB: Save job requisition
    HR_SYS->>NOT: Send approval request
    NOT->>HR: Job requisition approval
    HR->>HMS: Approve job requisition
    HMS->>RECRUITMENT: Post job opening
    RECRUITMENT->>DB: Save job posting
    CANDIDATE->>RECRUITMENT: Submit application
    RECRUITMENT->>DB: Save application
    RECRUITMENT->>NOT: Send application notification
    NOT->>HR: New application received
    HR->>HMS: Review applications
    HMS->>RECRUITMENT: Screen candidates
    RECRUITMENT->>INTERVIEW: Schedule interviews
    INTERVIEW->>NOT: Send interview invitations
    NOT->>CANDIDATE: Interview invitation
    CANDIDATE->>INTERVIEW: Attend interview
    INTERVIEW->>DB: Record interview feedback
    HR->>HMS: Make hiring decision
    HMS->>HR_SYS: Create offer
    HR_SYS->>NOT: Send offer notification
    NOT->>CANDIDATE: Job offer
    CANDIDATE->>HR_SYS: Accept/decline offer
    HR_SYS->>DB: Update offer status
    HR_SYS-->>HR: Recruitment process complete
```

## Payroll Processing Flow

```mermaid
sequenceDiagram
    participant HR as HR Staff
    participant EMP as Employee
    participant HMS as HMS System
    participant HR_SYS as HR System
    participant DB as Database
    participant PAYROLL as Payroll System
    participant ATTENDANCE as Attendance System
    participant BANK as Bank System
    participant NOT as Notification Service

    HMS->>PAYROLL: Initiate payroll processing
    PAYROLL->>ATTENDANCE: Get attendance data
    ATTENDANCE->>DB: Query attendance records
    DB-->>ATTENDANCE: Return attendance data
    ATTENDANCE-->>PAYROLL: Return attendance summary
    PAYROLL->>DB: Get employee salary data
    DB-->>PAYROLL: Return salary information
    PAYROLL->>PAYROLL: Calculate gross pay
    PAYROLL->>PAYROLL: Calculate deductions
    PAYROLL->>PAYROLL: Calculate net pay
    PAYROLL->>DB: Save payroll data
    PAYROLL->>BANK: Process salary payments
    BANK-->>PAYROLL: Payment confirmation
    PAYROLL->>NOT: Send payroll notifications
    NOT->>EMP: Payslip notification
    NOT->>HR: Payroll processing complete
    PAYROLL-->>HMS: Payroll processing finished
```

## Training Management Flow

```mermaid
sequenceDiagram
    participant EMP as Employee
    participant MANAGER as Manager
    participant HR as HR Staff
    participant HMS as HMS System
    participant HR_SYS as HR System
    participant DB as Database
    participant TRAINING as Training System
    participant PROVIDER as Training Provider
    participant NOT as Notification Service

    MANAGER->>HMS: Request training for employee
    HMS->>TRAINING: Create training request
    TRAINING->>DB: Save training request
    TRAINING->>NOT: Send training notification
    NOT->>HR: Training request approval
    HR->>HMS: Approve training request
    HMS->>TRAINING: Update training status
    TRAINING->>PROVIDER: Schedule training
    PROVIDER->>TRAINING: Confirm training schedule
    TRAINING->>NOT: Send training invitation
    NOT->>EMP: Training schedule notification
    EMP->>TRAINING: Attend training
    TRAINING->>DB: Record training attendance
    PROVIDER->>TRAINING: Submit training results
    TRAINING->>DB: Save training completion
    TRAINING->>NOT: Send completion notification
    NOT->>EMP: Training completion certificate
    NOT->>MANAGER: Training completion report
    TRAINING-->>HMS: Training management complete
```

## Employee Relations Flow

```mermaid
sequenceDiagram
    participant EMP as Employee
    participant HR as HR Staff
    participant MANAGER as Manager
    participant HMS as HMS System
    participant HR_SYS as HR System
    participant DB as Database
    participant RELATIONS as Employee Relations
    participant RESOLUTION as Resolution System
    participant NOT as Notification Service

    EMP->>HMS: Report workplace issue
    HMS->>RELATIONS: Create employee relations case
    RELATIONS->>DB: Save case data
    RELATIONS->>NOT: Send case notification
    NOT->>HR: New employee relations case
    HR->>HMS: Review case details
    HMS->>RELATIONS: Access case information
    RELATIONS->>DB: Retrieve case data
    DB-->>RELATIONS: Return case details
    RELATIONS-->>HMS: Display case information
    HMS-->>HR: Show case details
    HR->>RELATIONS: Initiate resolution process
    RELATIONS->>RESOLUTION: Start resolution
    RESOLUTION->>MANAGER: Involve manager if needed
    MANAGER->>RESOLUTION: Provide input
    RESOLUTION->>DB: Record resolution steps
    RESOLUTION->>NOT: Send resolution updates
    NOT->>EMP: Resolution progress update
    RESOLUTION->>RELATIONS: Complete resolution
    RELATIONS->>DB: Save resolution outcome
    RELATIONS->>NOT: Send resolution notification
    NOT->>EMP: Case resolution notification
    RELATIONS-->>HR: Employee relations case closed
```

## Compliance Management Flow

```mermaid
sequenceDiagram
    participant HR as HR Staff
    participant EMP as Employee
    participant HMS as HMS System
    participant HR_SYS as HR System
    participant DB as Database
    participant COMPLIANCE as Compliance System
    participant AUDIT as Audit System
    participant NOT as Notification Service

    HMS->>COMPLIANCE: Monitor compliance requirements
    COMPLIANCE->>DB: Check compliance status
    DB-->>COMPLIANCE: Return compliance data
    COMPLIANCE->>COMPLIANCE: Analyze compliance gaps
    alt Compliance Issues Found
        COMPLIANCE->>NOT: Send compliance alert
        NOT->>HR: Compliance issue notification
        HR->>HMS: Address compliance issue
        HMS->>COMPLIANCE: Update compliance status
        COMPLIANCE->>DB: Save compliance actions
    end
    COMPLIANCE->>AUDIT: Schedule compliance audit
    AUDIT->>DB: Query compliance records
    DB-->>AUDIT: Return audit data
    AUDIT->>AUDIT: Perform compliance audit
    AUDIT->>DB: Save audit results
    AUDIT->>NOT: Send audit notification
    NOT->>HR: Compliance audit results
    COMPLIANCE-->>HMS: Compliance management complete
```

## HR Analytics Flow

```mermaid
sequenceDiagram
    participant ADMIN as HR Administrator
    participant HMS as HMS System
    participant HR_SYS as HR System
    participant DB as Database
    participant ANALYTICS as Analytics Engine
    participant REPORT as Report Generator
    participant DASHBOARD as Dashboard System

    ADMIN->>HMS: Request HR analytics
    HMS->>HR_SYS: Initiate HR analytics
    HR_SYS->>ANALYTICS: Process HR data
    ANALYTICS->>DB: Query HR metrics
    DB-->>ANALYTICS: Return HR data
    ANALYTICS->>ANALYTICS: Calculate HR metrics
    Note over ANALYTICS: - Employee turnover<br/>- Performance metrics<br/>- Training completion<br/>- Recruitment metrics
    ANALYTICS-->>HR_SYS: Return analytics results
    HR_SYS->>REPORT: Generate HR report
    REPORT->>DB: Compile report data
    DB-->>REPORT: Return report information
    REPORT-->>HR_SYS: HR report ready
    HR_SYS->>DASHBOARD: Update dashboard
    DASHBOARD->>DB: Save dashboard data
    DASHBOARD-->>HR_SYS: Dashboard updated
    HR_SYS-->>HMS: Return analytics results
    HMS-->>ADMIN: Display HR analytics
    ADMIN->>HMS: Request trend analysis
    HMS->>ANALYTICS: Analyze HR trends
    ANALYTICS->>DB: Query historical data
    DB-->>ANALYTICS: Return trend data
    ANALYTICS-->>HMS: HR trend analysis
    HMS-->>ADMIN: HR insights and recommendations
```

## Employee Exit Process Flow

```mermaid
sequenceDiagram
    participant EMP as Employee
    participant MANAGER as Manager
    participant HR as HR Staff
    participant HMS as HMS System
    participant HR_SYS as HR System
    participant DB as Database
    participant EXIT as Exit Management
    participant IT as IT Department
    participant FINANCE as Finance Department
    participant NOT as Notification Service

    EMP->>HMS: Submit resignation
    HMS->>EXIT: Initiate exit process
    EXIT->>DB: Create exit record
    EXIT->>NOT: Send exit notification
    NOT->>MANAGER: Employee resignation
    NOT->>HR: Exit process initiated
    MANAGER->>HMS: Acknowledge resignation
    HMS->>EXIT: Update exit status
    HR->>HMS: Conduct exit interview
    HMS->>EXIT: Record exit interview
    EXIT->>DB: Save exit interview data
    EXIT->>IT: Request system access removal
    IT->>DB: Remove user accounts
    IT-->>EXIT: System access removed
    EXIT->>FINANCE: Process final payment
    FINANCE->>DB: Calculate final settlement
    FINANCE-->>EXIT: Final payment processed
    EXIT->>DB: Complete exit process
    EXIT->>NOT: Send exit completion
    NOT->>EMP: Exit process complete
    NOT->>HR: Employee exit finalized
    EXIT-->>HMS: Exit process finished
```
