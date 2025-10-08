# Hospital Management System - MongoDB Schema Overview

## Overview

This document provides a comprehensive overview of the MongoDB database schema for the Hospital Management System, including collections, document structures, and relationships.

**Database Technology**: MongoDB (NoSQL Document Database)
**ORM/ODM**: Mongoose
**Connection**: MongoDB Atlas or Local MongoDB Instance

## Database Configuration

### Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017/emr_system
MONGODB_DATABASE=emr_system
```

### Connection Options
- **Max Pool Size**: 10 connections
- **Server Selection Timeout**: 5 seconds
- **Socket Timeout**: 45 seconds
- **Buffer Commands**: Disabled

## Core Collections

### 1. Patients Collection
**Collection Name**: `patients`

```javascript
{
  _id: ObjectId,
  patientId: String (unique, indexed),
  firstName: String (required),
  lastName: String (required),
  middleName: String,
  dateOfBirth: Date (required),
  gender: String (enum: ['male', 'female', 'other']),
  phone: String (unique, sparse),
  email: String (unique, sparse),
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String (default: 'USA'),
  emergencyContactName: String,
  emergencyContactPhone: String,
  emergencyContactRelationship: String,
  bloodType: String,
  allergies: String,
  medicalConditions: String,
  photoUrl: String,
  status: String (enum: ['active', 'inactive', 'deceased'], default: 'active'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `patientId` (unique)
- `firstName + lastName` (compound)
- `phone` (unique, sparse)
- `email` (unique, sparse)
- `status`
- `createdAt` (descending)

### 2. Staff Collection
**Collection Name**: `staff`

```javascript
{
  _id: ObjectId,
  staffId: String (unique, indexed),
  employeeId: String (unique, required),
  firstName: String (required),
  lastName: String (required),
  middleName: String,
  email: String (unique, required),
  phone: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String (default: 'USA'),
  department: String (required),
  position: String (required),
  hireDate: Date (required),
  terminationDate: Date,
  salary: Number,
  employmentType: String (enum: ['full_time', 'part_time', 'contract', 'intern']),
  status: String (enum: ['active', 'inactive', 'terminated', 'on_leave'], default: 'active'),
  photoUrl: String,
  emergencyContactName: String,
  emergencyContactPhone: String,
  emergencyContactRelationship: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `staffId` (unique)
- `employeeId` (unique)
- `email` (unique)
- `firstName + lastName` (compound)
- `department`
- `position`
- `status`

### 3. Staff Authentication Collection
**Collection Name**: `staff_auth`

```javascript
{
  _id: ObjectId,
  authId: String (unique, indexed),
  staffId: String (unique, ref: 'Staff'),
  email: String (unique, required),
  username: String (unique, required),
  password: String (required, hashed),
  isActive: Boolean (default: true),
  emailVerified: Boolean (default: false),
  lastLogin: Date,
  failedLoginAttempts: Number (default: 0),
  lockedUntil: Date,
  twoFactorEnabled: Boolean (default: false),
  twoFactorSecret: String,
  roles: [String] (ref: 'StaffRole'),
  permissions: [String] (ref: 'Permission'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `authId` (unique)
- `staffId` (unique)
- `email` (unique)
- `username` (unique)
- `isActive`

### 4. Appointments Collection
**Collection Name**: `appointments`

```javascript
{
  _id: ObjectId,
  appointmentId: String (unique, indexed),
  patientId: String (ref: 'Patient'),
  staffId: String (ref: 'Staff'),
  appointmentDate: Date (required),
  appointmentTime: String (required),
  appointmentType: String (enum: ['consultation', 'follow_up', 'procedure', 'emergency']),
  status: String (enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], default: 'scheduled'),
  duration: Number (default: 30, minutes),
  notes: String,
  roomNumber: String,
  reason: String,
  followUpRequired: Boolean (default: false),
  followUpDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `appointmentId` (unique)
- `patientId`
- `staffId`
- `appointmentDate`
- `status`
- `appointmentType`
- `appointmentDate + appointmentTime` (compound)

### 5. Clinical Notes Collection
**Collection Name**: `clinical_notes`

```javascript
{
  _id: ObjectId,
  noteId: String (unique, indexed),
  patientId: String (ref: 'Patient'),
  staffId: String (ref: 'Staff'),
  appointmentId: String (ref: 'Appointment'),
  admissionId: String (ref: 'IPDAdmission'),
  noteType: String (enum: ['consultation', 'progress', 'discharge', 'procedure', 'emergency']),
  chiefComplaint: String,
  historyOfPresentIllness: String,
  physicalExamination: String,
  assessment: String,
  plan: String,
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number
  },
  isSigned: Boolean (default: false),
  signedBy: String (ref: 'Staff'),
  signedAt: Date,
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `noteId` (unique)
- `patientId`
- `staffId`
- `appointmentId`
- `admissionId`
- `noteType`
- `isSigned`
- `createdAt` (descending)

### 6. Prescriptions Collection
**Collection Name**: `prescriptions`

```javascript
{
  _id: ObjectId,
  prescriptionId: String (unique, indexed),
  patientId: String (ref: 'Patient'),
  staffId: String (ref: 'Staff'),
  drugId: String (ref: 'DrugMaster'),
  dosage: String (required),
  frequency: String (required),
  duration: String (required),
  quantity: Number (required),
  refillsAllowed: Number (default: 0),
  refillsUsed: Number (default: 0),
  instructions: String,
  prescribedAt: Date (default: Date.now),
  isActive: Boolean (default: true),
  status: String (enum: ['active', 'completed', 'cancelled', 'expired'], default: 'active'),
  expiryDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `prescriptionId` (unique)
- `patientId`
- `staffId`
- `drugId`
- `isActive`
- `status`
- `prescribedAt` (descending)

### 7. Drug Master Collection
**Collection Name**: `drug_master`

```javascript
{
  _id: ObjectId,
  drugId: String (unique, indexed),
  drugName: String (required),
  genericName: String,
  drugClass: String,
  dosageForm: String,
  strength: String,
  manufacturer: String,
  ndcNumber: String (unique, sparse),
  isControlled: Boolean (default: false),
  controlledSchedule: String (enum: ['I', 'II', 'III', 'IV', 'V']),
  isActive: Boolean (default: true),
  description: String,
  sideEffects: [String],
  contraindications: [String],
  interactions: [String],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `drugId` (unique)
- `drugName`
- `genericName`
- `drugClass`
- `isControlled`
- `isActive`
- `ndcNumber` (unique, sparse)

### 8. Billing Accounts Collection
**Collection Name**: `billing_accounts`

```javascript
{
  _id: ObjectId,
  accountId: String (unique, indexed),
  patientId: String (ref: 'Patient'),
  accountNumber: String (unique, required),
  balance: Number (default: 0),
  status: String (enum: ['active', 'inactive', 'closed'], default: 'active'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `accountId` (unique)
- `patientId`
- `accountNumber` (unique)
- `status`

## Relationships

### Document References
- **Patient → BillingAccount**: One-to-One (via `patientId`)
- **Patient → Appointments**: One-to-Many (via `patientId`)
- **Patient → ClinicalNotes**: One-to-Many (via `patientId`)
- **Patient → Prescriptions**: One-to-Many (via `patientId`)
- **Staff → Appointments**: One-to-Many (via `staffId`)
- **Staff → ClinicalNotes**: One-to-Many (via `staffId`)
- **Staff → Prescriptions**: One-to-Many (via `staffId`)
- **Drug → Prescriptions**: One-to-Many (via `drugId`)

### Aggregation Pipelines
The system uses MongoDB aggregation pipelines for complex queries:

1. **Patient with Billing Info**:
```javascript
PatientModel.aggregate([
  { $match: query },
  {
    $lookup: {
      from: 'billing_accounts',
      localField: 'patientId',
      foreignField: 'patientId',
      as: 'billingAccount'
    }
  },
  {
    $addFields: {
      billingAccount: { $arrayElemAt: ['$billingAccount', 0] }
    }
  }
])
```

## Data Validation

### Mongoose Schemas
All collections use Mongoose schemas with:
- **Required field validation**
- **Enum validation** for status fields
- **Unique constraints** for identifiers
- **Sparse indexes** for optional unique fields
- **Timestamps** (createdAt, updatedAt)
- **Virtual fields** for computed properties

### Pre-save Hooks
- **Password hashing** for staff authentication
- **ID generation** for all entities
- **Data sanitization** for text fields

## Performance Optimizations

### Indexing Strategy
- **Compound indexes** for common query patterns
- **Sparse indexes** for optional unique fields
- **Text indexes** for search functionality
- **TTL indexes** for temporary data

### Query Optimization
- **Projection** to limit returned fields
- **Aggregation pipelines** for complex joins
- **Pagination** using skip/limit
- **Connection pooling** for concurrent requests

## Security Considerations

### Data Protection
- **Password hashing** using bcrypt
- **JWT tokens** for authentication
- **Role-based access control**
- **Input validation** and sanitization

### Database Security
- **Connection encryption** (TLS/SSL)
- **Authentication** with username/password
- **Network access control**
- **Audit logging** for sensitive operations

## Migration from SQLite

### Key Changes
1. **Schema Structure**: Relational → Document-based
2. **Query Language**: SQL → MongoDB Query Language
3. **Relationships**: Foreign Keys → Document References
4. **Transactions**: ACID → Eventual Consistency
5. **Data Types**: SQL types → BSON types

### Migration Benefits
- **Flexible Schema**: Easy to add new fields
- **Horizontal Scaling**: Better for large datasets
- **JSON Support**: Native document storage
- **Aggregation Framework**: Powerful analytics
- **Geospatial Queries**: Built-in location support

## Backup and Recovery

### Backup Strategy
- **MongoDB Atlas**: Automated backups
- **Local Backups**: mongodump utility
- **Point-in-time Recovery**: Oplog-based
- **Cross-region Replication**: High availability

### Recovery Procedures
- **Full Database Restore**: mongorestore
- **Collection-level Restore**: Selective recovery
- **Index Rebuilding**: After restore operations
- **Data Validation**: Integrity checks

## Monitoring and Maintenance

### Performance Monitoring
- **Query Performance**: Slow query logs
- **Index Usage**: Index statistics
- **Connection Metrics**: Pool utilization
- **Memory Usage**: Working set analysis

### Maintenance Tasks
- **Index Optimization**: Regular analysis
- **Data Archiving**: Old record management
- **Statistics Updates**: Query planner optimization
- **Compaction**: Storage optimization
