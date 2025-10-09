# Inventory Management System - Sequence Diagrams

## 1. Add New Inventory Item Workflow

```mermaid
sequenceDiagram
    participant Staff as Inventory Staff
    participant Frontend as Frontend
    participant API as Inventory API
    participant Auth as Auth Service
    participant DB as Database
    participant Barcode as Barcode Service
    participant Audit as Audit Service

    Staff->>Frontend: Add new inventory item
    Frontend->>API: POST /api/inventory/items
    
    API->>Auth: Verify authentication & permissions
    Auth-->>API: User authenticated & authorized
    
    API->>DB: Validate item doesn't exist
    DB-->>API: Item validated
    
    API->>Barcode: Generate barcode/QR code
    Barcode-->>API: Barcode generated
    
    API->>DB: Create inventory item
    DB-->>API: Item created with ID
    
    API->>Audit: Log item creation
    Audit-->>API: Audit logged
    
    API-->>Frontend: Item created successfully
    Frontend-->>Staff: Item creation confirmed
    
    Note over Staff, Audit: New inventory item added with barcode
```

## 2. Stock Receiving Workflow

```mermaid
sequenceDiagram
    participant Staff as Receiving Staff
    participant Frontend as Frontend
    participant API as Inventory API
    participant DB as Database
    participant Alert as Alert Service
    participant Audit as Audit Service

    Staff->>Frontend: Process incoming shipment
    Frontend->>API: POST /api/inventory/receiving
    
    API->>DB: Validate purchase order
    DB-->>API: PO validated
    
    API->>DB: Update stock levels
    DB-->>API: Stock updated
    
    API->>Alert: Check for low stock alerts
    Alert-->>API: Alert status returned
    
    API->>Audit: Log receiving transaction
    Audit-->>API: Transaction logged
    
    API-->>Frontend: Receiving completed
    Frontend-->>Staff: Receiving confirmation
    
    Note over Staff, Audit: Stock received and levels updated
```

## 3. Item Issue Workflow

```mermaid
sequenceDiagram
    participant Staff as Clinical Staff
    participant Frontend as Frontend
    participant API as Inventory API
    participant DB as Database
    participant Alert as Alert Service
    participant Billing as Billing Service
    participant Audit as Audit Service

    Staff->>Frontend: Issue items to patient
    Frontend->>API: POST /api/inventory/issues
    
    API->>DB: Check item availability
    DB-->>API: Availability confirmed
    
    API->>DB: Update stock levels
    DB-->>API: Stock updated
    
    API->>Alert: Check for low stock alerts
    Alert-->>API: Alert status returned
    
    API->>Billing: Create billing entry
    Billing-->>API: Billing entry created
    
    API->>Audit: Log issue transaction
    Audit-->>API: Transaction logged
    
    API-->>Frontend: Items issued successfully
    Frontend-->>Staff: Issue confirmation
    
    Note over Staff, Audit: Items issued with billing integration
```

## 4. Low Stock Alert Workflow

```mermaid
sequenceDiagram
    participant System as System
    participant API as Inventory API
    participant DB as Database
    participant Alert as Alert Service
    participant Notification as Notification Service
    participant Staff as Inventory Manager

    System->>API: Check stock levels
    API->>DB: Query current stock levels
    DB-->>API: Stock levels returned
    
    API->>Alert: Evaluate stock levels
    Alert-->>API: Low stock items identified
    
    API->>Notification: Send low stock alerts
    Notification-->>API: Alerts sent
    
    Notification->>Staff: Email/SMS alert
    Staff-->>Notification: Alert received
    
    Note over System, Staff: Automated low stock monitoring
```

## 5. Stock Transfer Workflow

```mermaid
sequenceDiagram
    participant Staff as Inventory Staff
    participant Frontend as Frontend
    participant API as Inventory API
    participant DB as Database
    participant Auth as Auth Service
    participant Audit as Audit Service

    Staff->>Frontend: Transfer items between locations
    Frontend->>API: POST /api/inventory/transfers
    
    API->>Auth: Verify transfer permissions
    Auth-->>API: Transfer authorized
    
    API->>DB: Check source location stock
    DB-->>API: Stock availability confirmed
    
    API->>DB: Update both locations
    DB-->>API: Transfer completed
    
    API->>Audit: Log transfer transaction
    Audit-->>API: Transaction logged
    
    API-->>Frontend: Transfer completed
    Frontend-->>Staff: Transfer confirmation
    
    Note over Staff, Audit: Stock transferred between locations
```

## 6. Purchase Order Creation Workflow

```mermaid
sequenceDiagram
    participant Staff as Procurement Staff
    participant Frontend as Frontend
    participant API as Inventory API
    participant DB as Database
    participant Supplier as Supplier Service
    participant Approval as Approval Service
    participant Audit as Audit Service

    Staff->>Frontend: Create purchase order
    Frontend->>API: POST /api/inventory/purchase-orders
    
    API->>DB: Validate items and quantities
    DB-->>API: Items validated
    
    API->>Supplier: Get supplier pricing
    Supplier-->>API: Pricing returned
    
    API->>Approval: Submit for approval
    Approval-->>API: Approval workflow started
    
    API->>DB: Create purchase order
    DB-->>API: PO created
    
    API->>Audit: Log PO creation
    Audit-->>API: PO logged
    
    API-->>Frontend: PO created successfully
    Frontend-->>Staff: PO creation confirmation
    
    Note over Staff, Audit: Purchase order created with approval
```

## 7. Expiration Alert Workflow

```mermaid
sequenceDiagram
    participant System as System
    participant API as Inventory API
    participant DB as Database
    participant Alert as Alert Service
    participant Notification as Notification Service
    participant Staff as Inventory Staff

    System->>API: Check expiration dates
    API->>DB: Query items nearing expiration
    DB-->>API: Expiring items returned
    
    API->>Alert: Evaluate expiration dates
    Alert-->>API: Expiration alerts generated
    
    API->>Notification: Send expiration alerts
    Notification-->>API: Alerts sent
    
    Notification->>Staff: Email/SMS alert
    Staff-->>Notification: Alert received
    
    Note over System, Staff: Automated expiration monitoring
```

## 8. Cycle Count Workflow

```mermaid
sequenceDiagram
    participant Staff as Inventory Auditor
    participant Frontend as Frontend
    participant API as Inventory API
    participant DB as Database
    participant Scanner as Barcode Scanner
    participant Audit as Audit Service

    Staff->>Frontend: Start cycle count
    Frontend->>API: POST /api/inventory/cycle-count
    
    API->>DB: Create cycle count record
    DB-->>API: Cycle count created
    
    Staff->>Scanner: Scan item barcode
    Scanner->>Frontend: Barcode data
    Frontend->>API: POST /api/inventory/cycle-count/items
    
    API->>DB: Record counted quantity
    DB-->>API: Count recorded
    
    API->>DB: Compare with system quantity
    DB-->>API: Discrepancy identified
    
    API->>Audit: Log count discrepancy
    Audit-->>API: Discrepancy logged
    
    API-->>Frontend: Count completed
    Frontend-->>Staff: Count results displayed
    
    Note over Staff, Audit: Cycle count with discrepancy tracking
```

## 9. Stock Adjustment Workflow

```mermaid
sequenceDiagram
    participant Staff as Inventory Manager
    participant Frontend as Frontend
    participant API as Inventory API
    participant DB as Database
    participant Auth as Auth Service
    participant Audit as Audit Service

    Staff->>Frontend: Adjust stock quantity
    Frontend->>API: POST /api/inventory/adjustments
    
    API->>Auth: Verify adjustment permissions
    Auth-->>API: Adjustment authorized
    
    API->>DB: Record adjustment reason
    DB-->>API: Reason recorded
    
    API->>DB: Update stock quantity
    DB-->>API: Stock updated
    
    API->>Audit: Log adjustment transaction
    Audit-->>API: Transaction logged
    
    API-->>Frontend: Adjustment completed
    Frontend-->>Staff: Adjustment confirmation
    
    Note over Staff, Audit: Stock adjustment with audit trail
```

## 10. Inventory Report Generation Workflow

```mermaid
sequenceDiagram
    participant Staff as Manager
    participant Frontend as Frontend
    participant API as Inventory API
    participant DB as Database
    participant Report as Report Service
    participant Export as Export Service

    Staff->>Frontend: Request inventory report
    Frontend->>API: GET /api/inventory/reports
    
    API->>DB: Query inventory data
    DB-->>API: Data returned
    
    API->>Report: Generate report
    Report-->>API: Report generated
    
    API->>Export: Format for export
    Export-->>API: Report formatted
    
    API-->>Frontend: Report data returned
    Frontend-->>Staff: Report displayed
    
    Note over Staff, Export: Inventory report generation
```

## Key Features of These Sequence Diagrams

### 1. **Comprehensive Inventory Operations**
- Item management with barcode generation
- Stock receiving and issuing processes
- Stock transfers and adjustments
- Purchase order management

### 2. **Automated Monitoring**
- Low stock alerts and notifications
- Expiration date monitoring
- Cycle counting and reconciliation
- Automated reorder suggestions

### 3. **Integration Points**
- Barcode scanning integration
- Billing system integration
- Supplier system integration
- Approval workflow integration

### 4. **Audit and Compliance**
- Complete audit trail for all transactions
- Regulatory compliance tracking
- Data integrity and validation
- Security and access control

### 5. **User Experience**
- Intuitive workflows for inventory staff
- Mobile support for barcode scanning
- Real-time updates and notifications
- Comprehensive reporting capabilities

These sequence diagrams provide a complete view of the inventory management workflows, ensuring that all inventory operations are properly documented, secure, and efficient.
