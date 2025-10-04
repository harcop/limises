# Inventory Management Module - End-to-End Sequence Diagram

## Stock Receipt Flow

```mermaid
sequenceDiagram
    participant SUPPLIER as Supplier
    participant RECEIVING as Receiving Staff
    participant HMS as HMS System
    participant INVENTORY as Inventory System
    participant DB as Database
    participant QC as Quality Control
    participant PO as Purchase Order System
    participant NOT as Notification Service

    SUPPLIER->>RECEIVING: Deliver goods
    RECEIVING->>HMS: Access receiving system
    HMS->>PO: Get purchase order details
    PO->>DB: Query purchase order
    DB-->>PO: Return PO information
    PO-->>HMS: Display PO details
    HMS-->>RECEIVING: Show expected items
    RECEIVING->>INVENTORY: Process goods receipt
    INVENTORY->>QC: Inspect received items
    QC->>DB: Record quality check
    QC-->>INVENTORY: Quality assessment
    alt Quality Approved
        INVENTORY->>DB: Update stock levels
        INVENTORY->>DB: Record batch information
        INVENTORY->>NOT: Send receipt notification
        NOT->>RECEIVING: Receipt successful
    else Quality Rejected
        INVENTORY->>DB: Record quality issues
        INVENTORY->>NOT: Send rejection notification
        NOT->>SUPPLIER: Quality rejection notice
    end
    INVENTORY->>PO: Update PO status
    INVENTORY-->>RECEIVING: Receipt processing complete
```

## Stock Issue Flow

```mermaid
sequenceDiagram
    participant USER as Department User
    participant STAFF as Inventory Staff
    participant HMS as HMS System
    participant INVENTORY as Inventory System
    participant DB as Database
    participant LOCATION as Location System
    participant FEFO as FEFO System
    participant NOT as Notification Service

    USER->>STAFF: Request items
    STAFF->>HMS: Access inventory system
    HMS->>INVENTORY: Process issue request
    INVENTORY->>DB: Check stock availability
    DB-->>INVENTORY: Return stock status
    INVENTORY-->>HMS: Display stock levels
    HMS-->>STAFF: Show available items
    STAFF->>INVENTORY: Confirm issue request
    INVENTORY->>FEFO: Select batch (FEFO)
    FEFO->>DB: Query batch information
    DB-->>FEFO: Return batch data
    FEFO-->>INVENTORY: Return selected batch
    INVENTORY->>LOCATION: Update location stock
    LOCATION->>DB: Update location inventory
    INVENTORY->>DB: Record stock issue
    INVENTORY->>NOT: Send issue notification
    NOT->>USER: Items issued notification
    INVENTORY-->>STAFF: Stock issue complete
```

## Stock Transfer Flow

```mermaid
sequenceDiagram
    participant STAFF1 as Source Staff
    participant STAFF2 as Destination Staff
    participant HMS as HMS System
    participant INVENTORY as Inventory System
    participant DB as Database
    participant TRANSFER as Transfer System
    participant LOCATION as Location System
    participant NOT as Notification Service

    STAFF1->>HMS: Initiate stock transfer
    HMS->>INVENTORY: Access transfer system
    INVENTORY->>DB: Check source stock
    DB-->>INVENTORY: Return source inventory
    INVENTORY-->>HMS: Display available stock
    HMS-->>STAFF1: Show transfer options
    STAFF1->>INVENTORY: Select items for transfer
    INVENTORY->>TRANSFER: Create transfer record
    TRANSFER->>DB: Save transfer data
    TRANSFER->>NOT: Send transfer notification
    NOT->>STAFF2: Transfer notification
    STAFF2->>HMS: Acknowledge transfer
    HMS->>TRANSFER: Process transfer
    TRANSFER->>LOCATION: Update source location
    LOCATION->>DB: Reduce source stock
    TRANSFER->>LOCATION: Update destination location
    LOCATION->>DB: Increase destination stock
    TRANSFER->>DB: Complete transfer record
    TRANSFER->>NOT: Send completion notification
    NOT->>STAFF1: Transfer completed
    TRANSFER-->>STAFF2: Transfer received
```

## Requisition Management Flow

```mermaid
sequenceDiagram
    participant USER as Department User
    participant MANAGER as Department Manager
    participant HMS as HMS System
    participant INVENTORY as Inventory System
    participant DB as Database
    participant APPROVAL as Approval System
    participant PO as Purchase Order System
    participant NOT as Notification Service

    USER->>HMS: Create requisition
    HMS->>INVENTORY: Process requisition
    INVENTORY->>DB: Save requisition data
    INVENTORY->>APPROVAL: Send for approval
    APPROVAL->>NOT: Send approval notification
    NOT->>MANAGER: Requisition approval request
    MANAGER->>HMS: Review requisition
    HMS->>INVENTORY: Access requisition details
    INVENTORY->>DB: Retrieve requisition data
    DB-->>INVENTORY: Return requisition info
    INVENTORY-->>HMS: Display requisition
    HMS-->>MANAGER: Show requisition details
    MANAGER->>APPROVAL: Approve requisition
    APPROVAL->>DB: Update approval status
    APPROVAL->>PO: Create purchase order
    PO->>DB: Save purchase order
    APPROVAL->>NOT: Send approval notification
    NOT->>USER: Requisition approved
    PO->>NOT: Send PO notification
    NOT->>MANAGER: Purchase order created
    INVENTORY-->>USER: Requisition processed
```

## Purchase Order Management Flow

```mermaid
sequenceDiagram
    participant STAFF as Procurement Staff
    participant MANAGER as Finance Manager
    participant HMS as HMS System
    participant PO as Purchase Order System
    participant DB as Database
    participant SUPPLIER as Supplier System
    participant APPROVAL as Approval System
    participant NOT as Notification Service

    STAFF->>HMS: Create purchase order
    HMS->>PO: Process PO creation
    PO->>DB: Save PO data
    PO->>APPROVAL: Send for approval
    APPROVAL->>NOT: Send approval notification
    NOT->>MANAGER: PO approval request
    MANAGER->>HMS: Review purchase order
    HMS->>PO: Access PO details
    PO->>DB: Retrieve PO data
    DB-->>PO: Return PO information
    PO-->>HMS: Display PO details
    HMS-->>MANAGER: Show purchase order
    MANAGER->>APPROVAL: Approve purchase order
    APPROVAL->>DB: Update approval status
    APPROVAL->>SUPPLIER: Send PO to supplier
    SUPPLIER->>PO: Acknowledge PO
    PO->>DB: Update PO status
    PO->>NOT: Send PO notification
    NOT->>STAFF: PO sent to supplier
    PO-->>STAFF: Purchase order processed
```

## Inventory Audit Flow

```mermaid
sequenceDiagram
    participant AUDITOR as Inventory Auditor
    participant STAFF as Inventory Staff
    participant HMS as HMS System
    participant INVENTORY as Inventory System
    participant DB as Database
    participant AUDIT as Audit System
    participant ADJUSTMENT as Adjustment System
    participant NOT as Notification Service

    AUDITOR->>HMS: Initiate inventory audit
    HMS->>AUDIT: Start audit process
    AUDIT->>DB: Get current inventory data
    DB-->>AUDIT: Return inventory records
    AUDIT-->>HMS: Display inventory data
    HMS-->>AUDITOR: Show inventory to audit
    AUDITOR->>STAFF: Conduct physical count
    STAFF->>AUDIT: Enter physical count
    AUDIT->>AUDIT: Compare physical vs system
    AUDIT->>AUDIT: Identify discrepancies
    alt Discrepancies Found
        AUDIT->>ADJUSTMENT: Create adjustment entries
        ADJUSTMENT->>DB: Record adjustments
        ADJUSTMENT->>NOT: Send adjustment notification
        NOT->>AUDITOR: Discrepancy notification
    end
    AUDIT->>DB: Save audit results
    AUDIT->>NOT: Send audit completion
    NOT->>AUDITOR: Audit complete
    AUDIT-->>AUDITOR: Inventory audit finished
```

## Supplier Management Flow

```mermaid
sequenceDiagram
    participant STAFF as Procurement Staff
    participant SUPPLIER as Supplier
    participant HMS as HMS System
    participant VENDOR as Vendor Management
    participant DB as Database
    participant EVALUATION as Evaluation System
    participant PERFORMANCE as Performance System
    participant NOT as Notification Service

    STAFF->>HMS: Access supplier management
    HMS->>VENDOR: Get supplier information
    VENDOR->>DB: Query supplier database
    DB-->>VENDOR: Return supplier data
    VENDOR-->>HMS: Display supplier list
    HMS-->>STAFF: Show supplier information
    STAFF->>VENDOR: Add new supplier
    VENDOR->>DB: Save supplier data
    VENDOR->>EVALUATION: Initiate supplier evaluation
    EVENDOR->>PERFORMANCE: Track supplier performance
    PERFORMANCE->>DB: Record performance metrics
    PERFORMANCE-->>EVALUATION: Return performance data
    EVALUATION->>DB: Save evaluation results
    EVALUATION->>NOT: Send evaluation notification
    NOT->>STAFF: Supplier evaluation complete
    VENDOR-->>STAFF: Supplier management complete
```

## Asset Management Flow

```mermaid
sequenceDiagram
    participant STAFF as Asset Manager
    participant USER as Asset User
    participant HMS as HMS System
    participant ASSET as Asset Management
    participant DB as Database
    participant MAINTENANCE as Maintenance System
    participant TRACKING as Asset Tracking
    participant NOT as Notification Service

    STAFF->>HMS: Access asset management
    HMS->>ASSET: Get asset information
    ASSET->>DB: Query asset database
    DB-->>ASSET: Return asset data
    ASSET-->>HMS: Display asset list
    HMS-->>STAFF: Show asset information
    STAFF->>ASSET: Register new asset
    ASSET->>DB: Save asset data
    ASSET->>TRACKING: Start asset tracking
    TRACKING->>DB: Record tracking information
    USER->>ASSET: Report asset usage
    ASSET->>DB: Update usage records
    ASSET->>MAINTENANCE: Schedule maintenance
    MAINTENANCE->>DB: Record maintenance schedule
    MAINTENANCE->>NOT: Send maintenance notification
    NOT->>STAFF: Maintenance due
    ASSET-->>STAFF: Asset management complete
```

## Expiry Management Flow

```mermaid
sequenceDiagram
    participant SYSTEM as System Monitor
    participant HMS as HMS System
    participant INVENTORY as Inventory System
    participant DB as Database
    participant EXPIRY as Expiry Management
    participant ALERT as Alert System
    participant STAFF as Inventory Staff
    participant DISPOSAL as Disposal System

    SYSTEM->>HMS: Check expiry dates
    HMS->>EXPIRY: Monitor expiry dates
    EXPIRY->>DB: Query inventory expiry
    DB-->>EXPIRY: Return expiry data
    EXPIRY->>EXPIRY: Check expiry status
    alt Near Expiry
        EXPIRY->>ALERT: Generate expiry alert
        ALERT->>NOT: Send expiry notification
        NOT->>STAFF: Near expiry alert
    else Expired Items
        EXPIRY->>ALERT: Generate expired alert
        ALERT->>NOT: Send expired notification
        NOT->>STAFF: Expired items alert
        STAFF->>DISPOSAL: Initiate disposal
        DISPOSAL->>DB: Record disposal
        DISPOSAL->>INVENTORY: Remove from inventory
        INVENTORY->>DB: Update stock levels
    end
    EXPIRY->>DB: Update expiry status
    EXPIRY-->>HMS: Expiry management complete
```

## Inventory Optimization Flow

```mermaid
sequenceDiagram
    participant ADMIN as Administrator
    participant HMS as HMS System
    participant INVENTORY as Inventory System
    participant DB as Database
    participant ANALYTICS as Analytics Engine
    participant OPTIMIZATION as Optimization Engine
    participant FORECASTING as Forecasting System
    participant RECOMMENDATION as Recommendation Engine

    ADMIN->>HMS: Request inventory optimization
    HMS->>INVENTORY: Initiate optimization
    INVENTORY->>DB: Query inventory data
    DB-->>INVENTORY: Return inventory information
    INVENTORY->>ANALYTICS: Analyze inventory patterns
    ANALYTICS->>ANALYTICS: Calculate optimization metrics
    Note over ANALYTICS: - Stock turnover<br/>- Demand patterns<br/>- Cost analysis<br/>- Usage trends
    ANALYTICS-->>INVENTORY: Return analytics results
    INVENTORY->>FORECASTING: Predict demand
    FORECASTING->>DB: Analyze historical data
    DB-->>FORECASTING: Return historical patterns
    FORECASTING-->>INVENTORY: Return demand forecast
    INVENTORY->>OPTIMIZATION: Optimize inventory levels
    OPTIMIZATION->>RECOMMENDATION: Generate recommendations
    RECOMMENDATION->>ANALYTICS: Validate recommendations
    ANALYTICS-->>RECOMMENDATION: Return validation results
    RECOMMENDATION-->>INVENTORY: Return optimization recommendations
    INVENTORY-->>HMS: Return optimization results
    HMS-->>ADMIN: Display inventory optimization insights
```

## Multi-Location Inventory Flow

```mermaid
sequenceDiagram
    participant LOC1 as Location 1 Staff
    participant LOC2 as Location 2 Staff
    participant HMS as HMS System
    participant INVENTORY as Inventory System
    participant DB as Database
    participant CENTRAL as Central Inventory
    participant DISTRIBUTION as Distribution System
    participant NOT as Notification Service

    LOC1->>HMS: Check local inventory
    HMS->>INVENTORY: Query location inventory
    INVENTORY->>DB: Check local stock
    DB-->>INVENTORY: Return local inventory
    INVENTORY-->>HMS: Display local stock
    HMS-->>LOC1: Show local inventory
    LOC1->>INVENTORY: Request stock transfer
    INVENTORY->>CENTRAL: Check central stock
    CENTRAL->>DB: Query central inventory
    DB-->>CENTRAL: Return central stock
    CENTRAL-->>INVENTORY: Central stock available
    INVENTORY->>DISTRIBUTION: Initiate distribution
    DISTRIBUTION->>DB: Create distribution record
    DISTRIBUTION->>NOT: Send distribution notification
    NOT->>LOC2: Stock transfer notification
    LOC2->>HMS: Acknowledge transfer
    HMS->>DISTRIBUTION: Process distribution
    DISTRIBUTION->>DB: Update both locations
    DISTRIBUTION->>NOT: Send completion notification
    NOT->>LOC1: Transfer completed
    DISTRIBUTION-->>LOC2: Stock received
```

## Inventory Analytics Flow

```mermaid
sequenceDiagram
    participant ADMIN as Administrator
    participant HMS as HMS System
    participant INVENTORY as Inventory System
    participant DB as Database
    participant ANALYTICS as Analytics Engine
    participant REPORT as Report Generator
    participant DASHBOARD as Dashboard System

    ADMIN->>HMS: Request inventory analytics
    HMS->>INVENTORY: Initiate analytics
    INVENTORY->>ANALYTICS: Process inventory data
    ANALYTICS->>DB: Query inventory metrics
    DB-->>ANALYTICS: Return inventory data
    ANALYTICS->>ANALYTICS: Calculate performance metrics
    Note over ANALYTICS: - Stock levels<br/>- Turnover rates<br/>- Cost analysis<br/>- Usage patterns
    ANALYTICS-->>INVENTORY: Return analytics results
    INVENTORY->>REPORT: Generate inventory report
    REPORT->>DB: Compile report data
    DB-->>REPORT: Return report information
    REPORT-->>INVENTORY: Inventory report ready
    INVENTORY->>DASHBOARD: Update dashboard
    DASHBOARD->>DB: Save dashboard data
    DASHBOARD-->>INVENTORY: Dashboard updated
    INVENTORY-->>HMS: Return analytics results
    HMS-->>ADMIN: Display inventory analytics
    ADMIN->>HMS: Request trend analysis
    HMS->>ANALYTICS: Analyze historical trends
    ANALYTICS->>DB: Query historical data
    DB-->>ANALYTICS: Return trend data
    ANALYTICS-->>HMS: Trend analysis results
    HMS-->>ADMIN: Inventory trends and recommendations
```
