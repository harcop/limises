# Role-Based API Design Guide

## Overview

This document provides guidelines for designing role-agnostic APIs that work with the Hospital Management System's role-based access control (RBAC) system. APIs should not hardcode specific roles but instead use generic user/staff identifiers with role-based permissions.

## Core Principles

### 1. **Role-Agnostic Endpoints**
- Use generic identifiers (`userId`, `staffId`) instead of role-specific ones
- Let the RBAC system determine permissions based on user roles
- Avoid endpoints like `/api/doctor/...` or `/api/nurse/...`

### 2. **Permission-Based Access**
- APIs should check user permissions, not roles directly
- Same endpoint can serve different roles with different data/functionality
- Role-specific logic handled in business layer, not API layer

### 3. **Consistent Naming Convention**
- Use consistent parameter names across all endpoints
- Follow RESTful conventions
- Use clear, descriptive endpoint names

## API Design Patterns

### ✅ **Correct Patterns**

#### **User/Staff Management**
```http
GET /api/users/{userId}                    # Get user profile
PUT /api/users/{userId}                    # Update user profile
GET /api/staff/{staffId}/schedule          # Get staff schedule
POST /api/staff/{staffId}/availability     # Update availability
```

#### **Patient Management**
```http
GET /api/patients/{patientId}              # Get patient details
POST /api/patients                         # Create new patient
GET /api/patients/{patientId}/appointments # Get patient appointments
```

#### **Clinical Operations**
```http
GET /api/appointments/{appointmentId}      # Get appointment details
POST /api/appointments                     # Create appointment
GET /api/clinical-notes/{noteId}           # Get clinical note
POST /api/clinical-notes                   # Create clinical note
```

#### **Queue Management**
```http
GET /api/queues/{queueId}                  # Get queue details
GET /api/queues/staff/{staffId}            # Get staff member's queue
POST /api/queues/{queueId}/patients        # Add patient to queue
```

#### **Resource Management**
```http
GET /api/resources/beds                    # Get bed availability
GET /api/resources/equipment               # Get equipment status
POST /api/resources/reservations           # Reserve resource
```

### ❌ **Incorrect Patterns**

#### **Role-Specific Endpoints**
```http
# DON'T DO THIS
GET /api/doctor/{doctorId}/patients
GET /api/nurse/{nurseId}/vitals
GET /api/pharmacist/{pharmacistId}/prescriptions
GET /api/receptionist/{receptionistId}/appointments
```

#### **Hardcoded Role Logic**
```http
# DON'T DO THIS
POST /api/doctor/prescriptions
GET /api/nurse/medications
PUT /api/pharmacist/inventory
```

## Role-Based Access Control Implementation

### **Authentication & Authorization**
```http
# All requests include user context
Authorization: Bearer <jwt_token>
X-User-ID: <user_id>
X-User-Roles: <role1,role2,role3>
```

### **Permission-Based Responses**
```json
{
  "data": {
    "patient": {
      "id": "P001",
      "name": "John Doe",
      "demographics": { /* visible to all clinical staff */ },
      "medicalHistory": { /* visible to doctors, nurses */ },
      "billingInfo": { /* visible to billing staff, admins */ },
      "sensitiveData": { /* visible to doctors only */ }
    }
  },
  "permissions": {
    "canEdit": true,
    "canDelete": false,
    "canViewBilling": true,
    "canViewSensitive": false
  }
}
```

## User Story API Patterns

### **Patient Management Stories**
```http
# Patient Registration
POST /api/patients
GET /api/patients/{patientId}
PUT /api/patients/{patientId}

# Insurance Management
GET /api/patients/{patientId}/insurance
POST /api/patients/{patientId}/insurance
PUT /api/insurance/{insuranceId}
```

### **Clinical Operations Stories**
```http
# Appointment Management
GET /api/appointments
POST /api/appointments
PUT /api/appointments/{appointmentId}
DELETE /api/appointments/{appointmentId}

# Clinical Documentation
GET /api/clinical-notes
POST /api/clinical-notes
PUT /api/clinical-notes/{noteId}
GET /api/clinical-notes/patient/{patientId}
```

### **OPD/IPD Management Stories**
```http
# Queue Management
GET /api/queues
GET /api/queues/staff/{staffId}
POST /api/queues/{queueId}/patients
PUT /api/queues/{queueId}/status

# Bed Management
GET /api/beds
GET /api/beds/available
POST /api/beds/{bedId}/assign
PUT /api/beds/{bedId}/status
```

### **Laboratory & Pharmacy Stories**
```http
# Laboratory Management
GET /api/lab-orders
POST /api/lab-orders
GET /api/lab-results
POST /api/lab-results

# Pharmacy Management
GET /api/prescriptions
POST /api/prescriptions
GET /api/pharmacy/inventory
POST /api/pharmacy/dispense
```

### **Billing & Finance Stories**
```http
# Financial Management
GET /api/charges
POST /api/charges
GET /api/payments
POST /api/payments
GET /api/insurance-claims
POST /api/insurance-claims
```

## Role-Specific Business Logic

### **Frontend Role Handling**
```javascript
// Role-based component rendering
const PatientDetails = ({ patient, userRoles }) => {
  return (
    <div>
      <BasicInfo patient={patient} />
      {userRoles.includes('doctor') && <MedicalHistory patient={patient} />}
      {userRoles.includes('billing') && <BillingInfo patient={patient} />}
      {userRoles.includes('admin') && <SensitiveData patient={patient} />}
    </div>
  );
};
```

### **Backend Permission Checking**
```javascript
// Role-based data filtering
const getPatientData = (patientId, userRoles) => {
  const baseData = getPatientBaseData(patientId);
  
  if (userRoles.includes('doctor')) {
    return { ...baseData, ...getMedicalHistory(patientId) };
  }
  
  if (userRoles.includes('billing')) {
    return { ...baseData, ...getBillingInfo(patientId) };
  }
  
  return baseData;
};
```

## Database Entity Relationships

### **User/Staff Entity**
```sql
-- Generic staff/user table
CREATE TABLE staff (
    staff_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE,
    status ENUM('active', 'inactive', 'terminated'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Role assignments
CREATE TABLE user_roles (
    user_id VARCHAR(20),
    role_name VARCHAR(50),
    assigned_date DATE,
    assigned_by VARCHAR(20),
    PRIMARY KEY (user_id, role_name),
    FOREIGN KEY (user_id) REFERENCES staff(user_id)
);
```

### **Permission-Based Queries**
```sql
-- Get user permissions
SELECT r.role_name, p.permission_name
FROM user_roles r
JOIN role_permissions rp ON r.role_name = rp.role_name
JOIN permissions p ON rp.permission_name = p.permission_name
WHERE r.user_id = ?;

-- Get staff with specific role
SELECT s.*
FROM staff s
JOIN user_roles ur ON s.user_id = ur.user_id
WHERE ur.role_name = 'doctor' AND s.status = 'active';
```

## Implementation Guidelines

### **API Gateway Configuration**
```yaml
# Role-based routing
routes:
  - path: /api/patients
    methods: [GET, POST]
    roles: [doctor, nurse, receptionist, admin]
    permissions: [read_patients, create_patients]
  
  - path: /api/clinical-notes
    methods: [GET, POST, PUT]
    roles: [doctor, nurse]
    permissions: [read_clinical_notes, write_clinical_notes]
  
  - path: /api/billing
    methods: [GET, POST, PUT]
    roles: [billing_staff, admin]
    permissions: [read_billing, write_billing]
```

### **Middleware Implementation**
```javascript
// Role-based access middleware
const checkPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    const userRoles = req.user.roles;
    const userPermissions = getUserPermissions(userRoles);
    
    const hasPermission = requiredPermissions.every(
      permission => userPermissions.includes(permission)
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Usage in routes
app.get('/api/patients', 
  authenticate,
  checkPermissions(['read_patients']),
  getPatients
);
```

## Benefits of Role-Agnostic Design

### **1. Flexibility**
- Easy to add new roles without changing APIs
- Role changes don't require API modifications
- Supports role hierarchies and inheritance

### **2. Maintainability**
- Single API endpoint serves multiple roles
- Consistent API structure across all modules
- Easier to test and debug

### **3. Security**
- Centralized permission management
- Consistent security policies
- Better audit trail and compliance

### **4. Scalability**
- APIs can handle role changes dynamically
- Supports complex permission scenarios
- Future-proof design

## Migration Strategy

### **Phase 1: Update API Endpoints**
- Replace role-specific endpoints with generic ones
- Update parameter names to use `userId`/`staffId`
- Maintain backward compatibility during transition

### **Phase 2: Implement RBAC**
- Add role-based permission system
- Update authentication middleware
- Implement permission checking

### **Phase 3: Update Frontend**
- Modify frontend to use generic endpoints
- Implement role-based UI rendering
- Update error handling for permission failures

### **Phase 4: Testing & Validation**
- Test all role combinations
- Validate permission boundaries
- Performance testing with RBAC

---

*This guide ensures that the Hospital Management System APIs are flexible, maintainable, and secure while supporting the complex role-based access requirements of healthcare organizations.*
