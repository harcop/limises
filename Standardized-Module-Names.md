# Standardized Module Names for Hospital Management System

## Module Naming Convention

Based on the analysis of PRD-1, PRD-2, and PRD-3, the following standardized module names should be used across all documentation:

### Core Patient & Clinical Modules
1. **Patient Management & Registration Module**
2. **Appointment & Scheduling Module**
3. **Clinical Management & Documentation Module**
4. **Outpatient Department (OPD) Management Module**
5. **Inpatient Department (IPD) Management Module**

### Specialized Clinical Modules
6. **Doctor & Staff Management Module**
7. **Laboratory Management Module**
8. **Radiology & Imaging Module**
9. **Pharmacy Management Module**
10. **Operation Theatre (OT) Management Module**

### Emergency & Support Modules
11. **Emergency & Ambulance Management Module**
12. **Inventory & Supply Chain Management Module**

### Business & Administrative Modules
13. **Billing & Finance Module**
14. **Human Resources Management Module**
15. **Reports & Analytics Module**
16. **System Integration & Security Module**

## Mapping from Current Names

### PRD-1 to Standardized Names
- "Patient Management Module" → "Patient Management & Registration Module"
- "Appointment & Scheduling Module" → "Appointment & Scheduling Module" ✓
- "Clinical Management Module" → "Clinical Management & Documentation Module"
- "Pharmacy Management Module" → "Pharmacy Management Module" ✓
- "Laboratory Management Module" → "Laboratory Management Module" ✓
- "Billing & Finance Module" → "Billing & Finance Module" ✓
- "Inventory Management Module" → "Inventory & Supply Chain Management Module"
- "Human Resources Module" → "Human Resources Management Module"
- "Reporting & Analytics Module" → "Reports & Analytics Module"
- "System Integration & Security Module" → "System Integration & Security Module" ✓

### PRD-2 to Standardized Names
- "Patient Management Module" → "Patient Management & Registration Module"
- "Doctor & Staff Management Module" → "Doctor & Staff Management Module" ✓
- "Appointment & OPD Management" → Split into "Appointment & Scheduling Module" and "Outpatient Department (OPD) Management Module"
- "In-Patient Department (IPD) Management" → "Inpatient Department (IPD) Management Module"
- "Pharmacy Management" → "Pharmacy Management Module"
- "Laboratory Management" → "Laboratory Management Module"
- "Radiology & Imaging" → "Radiology & Imaging Module"
- "Billing & Finance" → "Billing & Finance Module"
- "Inventory & Supply Chain" → "Inventory & Supply Chain Management Module"
- "Emergency & Ambulance Management" → "Emergency & Ambulance Management Module"
- "Operation Theatre Management" → "Operation Theatre (OT) Management Module"
- "Reports & Analytics" → "Reports & Analytics Module"

### PRD-3 to Standardized Names
- All module names in PRD-3 are already standardized ✓

## Implementation Plan

1. **Update PRD-1**: Apply standardized naming to all module references
2. **Update PRD-2**: Apply standardized naming and split combined modules
3. **Update Sequence Diagrams**: Ensure all diagrams use standardized names
4. **Create Missing Diagrams**: Add sequence diagrams for missing modules
5. **Update Cross-References**: Ensure all internal references use standardized names

## Benefits of Standardization

- **Consistency**: Uniform naming across all documentation
- **Clarity**: Clear module boundaries and responsibilities
- **Maintainability**: Easier to update and maintain documentation
- **Development**: Clearer development planning and resource allocation
- **Integration**: Better understanding of module interactions
