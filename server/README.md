# Hospital Management System - Backend Server

A comprehensive Node.js Express server with TypeScript and SQLite database for the Hospital Management System, built based on user stories and end-to-end integration scenarios.

## Features

### Core Modules
- **Patient Management**: Registration, demographics, insurance, billing accounts
- **Staff Management**: User authentication, role-based access control, scheduling
- **Appointment Management**: Scheduling, rescheduling, cancellation, availability
- **Clinical Operations**: Clinical notes, prescriptions, medication management
- **OPD Management**: Outpatient visits, queue management, vital signs
- **IPD Management**: Inpatient admissions, bed management, nursing care
- **Laboratory Management**: Lab orders, samples, results, verification
- **Pharmacy Management**: Drug master, inventory, dispensing, refills
- **Billing & Finance**: Charges, payments, insurance claims, reporting
- **Inventory Management**: Medical supplies, equipment tracking
- **Reports & Analytics**: Comprehensive reporting across all modules

### Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting and CORS protection
- Comprehensive audit logging

### Database Features
- SQLite database with comprehensive schema
- Foreign key constraints and data integrity
- Optimized indexes for performance
- Transaction support for data consistency
- Automated migrations and seeding

## Installation

1. **Clone the repository**
   ```bash
   cd /Users/bamideletoluwalope/Documents/new_project/emr-system/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**
   ```bash
   npm run migrate
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development (with TypeScript compilation)
   npm run dev
   
   # Production (build first, then start)
   npm run build
   npm start
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_PATH=./database/emr_system.db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### Patient Management
- `POST /api/patients` - Register new patient
- `GET /api/patients` - Get all patients (with pagination and search)
- `GET /api/patients/search` - Advanced patient search
- `GET /api/patients/:patientId` - Get patient by ID
- `PUT /api/patients/:patientId` - Update patient information
- `GET /api/patients/:patientId/insurance` - Get patient insurance
- `POST /api/patients/:patientId/insurance` - Add insurance information
- `GET /api/patients/:patientId/appointments` - Get patient appointments
- `GET /api/patients/:patientId/medical-history` - Get medical history

### Appointment Management
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get appointments (with filters)
- `GET /api/appointments/available-slots` - Get available time slots
- `GET /api/appointments/:appointmentId` - Get appointment by ID
- `PUT /api/appointments/:appointmentId` - Update appointment
- `PUT /api/appointments/:appointmentId/confirm` - Confirm appointment
- `PUT /api/appointments/:appointmentId/cancel` - Cancel appointment
- `PUT /api/appointments/:appointmentId/complete` - Mark as completed

### Clinical Operations
- `POST /api/clinical/notes` - Create clinical note
- `GET /api/clinical/notes` - Get clinical notes
- `GET /api/clinical/notes/:noteId` - Get clinical note by ID
- `PUT /api/clinical/notes/:noteId` - Update clinical note
- `POST /api/clinical/notes/:noteId/sign` - Sign clinical note
- `POST /api/clinical/notes/:noteId/amendments` - Create amendment
- `POST /api/clinical/prescriptions` - Create prescription
- `GET /api/clinical/prescriptions` - Get prescriptions
- `PUT /api/clinical/prescriptions/:prescriptionId/refill` - Process refill

### OPD Management
- `POST /api/opd/visits` - Create OPD visit
- `GET /api/opd/visits` - Get OPD visits
- `GET /api/opd/visits/:visitId` - Get OPD visit by ID
- `PUT /api/opd/visits/:visitId` - Update OPD visit
- `POST /api/opd/queue` - Add patient to queue
- `GET /api/opd/queue` - Get OPD queue
- `PUT /api/opd/queue/:queueId/status` - Update queue status

### IPD Management
- `POST /api/ipd/wards` - Create ward
- `GET /api/ipd/wards` - Get all wards
- `POST /api/ipd/beds` - Create bed
- `GET /api/ipd/beds` - Get beds
- `POST /api/ipd/admissions` - Create admission
- `GET /api/ipd/admissions` - Get admissions
- `PUT /api/ipd/admissions/:admissionId/discharge` - Discharge patient
- `POST /api/ipd/nursing-care` - Record nursing care
- `GET /api/ipd/nursing-care/:admissionId` - Get nursing care records

### Laboratory Management
- `POST /api/lab/orders` - Create lab order
- `GET /api/lab/orders` - Get lab orders
- `PUT /api/lab/orders/:orderId/status` - Update order status
- `POST /api/lab/samples` - Create lab sample
- `POST /api/lab/results` - Create lab result
- `GET /api/lab/results` - Get lab results
- `PUT /api/lab/results/:resultId/verify` - Verify lab result

### Pharmacy Management
- `POST /api/pharmacy/drugs` - Add drug to master database
- `GET /api/pharmacy/drugs` - Get drugs
- `POST /api/pharmacy/inventory` - Add to inventory
- `GET /api/pharmacy/inventory` - Get inventory
- `POST /api/pharmacy/dispense` - Dispense medication
- `GET /api/pharmacy/dispense` - Get dispense records

### Billing & Finance
- `POST /api/billing/charges` - Create charge
- `GET /api/billing/charges` - Get charges
- `POST /api/billing/payments` - Record payment
- `GET /api/billing/payments` - Get payments
- `GET /api/billing/accounts/:accountId` - Get billing account
- `POST /api/billing/insurance-claims` - Create insurance claim
- `GET /api/billing/insurance-claims` - Get insurance claims

### Staff Management
- `POST /api/staff` - Create staff member
- `GET /api/staff` - Get all staff
- `GET /api/staff/:staffId` - Get staff by ID
- `PUT /api/staff/:staffId` - Update staff member
- `POST /api/staff/:staffId/schedule` - Add staff schedule
- `GET /api/staff/:staffId/schedule` - Get staff schedule

### Inventory Management
- `POST /api/inventory/items` - Create inventory item
- `GET /api/inventory/items` - Get inventory items
- `POST /api/inventory/stock` - Add inventory stock
- `GET /api/inventory/stock` - Get inventory stock
- `PUT /api/inventory/stock/:stockId` - Update inventory stock

### Reports & Analytics
- `GET /api/reports/patient-summary` - Patient summary report
- `GET /api/reports/appointment-summary` - Appointment summary report
- `GET /api/reports/revenue-summary` - Revenue summary report
- `GET /api/reports/clinical-summary` - Clinical summary report
- `GET /api/reports/opd-summary` - OPD summary report
- `GET /api/reports/ipd-summary` - IPD summary report
- `GET /api/reports/staff-productivity` - Staff productivity report

## User Roles

The system supports the following user roles:

- **admin**: Full system access
- **doctor**: Clinical operations, patient care
- **nurse**: Patient care, clinical documentation
- **receptionist**: Patient registration, appointment scheduling
- **pharmacist**: Pharmacy operations, medication dispensing
- **lab_technician**: Laboratory operations, sample processing
- **billing_staff**: Billing and financial operations
- **inventory_manager**: Inventory management
- **manager**: Department management and reporting
- **patient**: Patient portal access (limited)

## Database Schema

The database includes comprehensive tables for:

- **Core Entities**: patients, staff, users, user_roles
- **Clinical**: appointments, clinical_notes, prescriptions, medications
- **OPD/IPD**: opd_visits, opd_queue, ipd_admissions, beds, wards
- **Laboratory**: lab_orders, lab_samples, lab_results
- **Pharmacy**: drug_master, pharmacy_inventory, pharmacy_dispense
- **Billing**: charges, payments, insurance_claims, billing_accounts
- **Inventory**: inventory_items, inventory_stock
- **Audit**: audit_log, notifications

## Development

### Scripts
- `npm start` - Start production server (compiled JavaScript)
- `npm run dev` - Start development server with TypeScript compilation and hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run clean` - Remove compiled JavaScript files
- `npm run type-check` - Check TypeScript types without compilation
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

### Project Structure
```
server/
├── src/
│   ├── app.ts                # Main application file
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── database/
│   │   ├── connection.ts    # Database connection
│   │   ├── schema.sql       # Database schema
│   │   ├── migrate.ts       # Migration script
│   │   └── seed.ts         # Seed data script
│   ├── middleware/
│   │   ├── auth.ts         # Authentication middleware
│   │   ├── errorHandler.ts # Error handling middleware
│   │   └── validation.ts   # Input validation middleware
│   ├── routes/
│   │   ├── auth.ts         # Authentication routes
│   │   ├── patients.ts     # Patient management routes
│   │   ├── appointments.ts # Appointment routes
│   │   ├── clinical.ts     # Clinical operations routes
│   │   ├── opd.ts         # OPD management routes
│   │   ├── ipd.ts         # IPD management routes
│   │   ├── laboratory.ts  # Laboratory routes
│   │   ├── pharmacy.ts    # Pharmacy routes
│   │   ├── billing.ts     # Billing routes
│   │   ├── staff.ts       # Staff management routes
│   │   ├── inventory.ts   # Inventory routes
│   │   └── reports.ts     # Reports routes
│   └── utils/
│       ├── logger.ts      # Logging utility
│       └── helpers.ts     # Helper functions
├── dist/                   # Compiled JavaScript (generated)
├── database/              # Database files
├── logs/                  # Log files
├── tsconfig.json         # TypeScript configuration
├── package.json
└── README.md
```

## Testing

The server includes comprehensive API endpoints that can be tested using tools like Postman or curl. Sample test data is provided through the seed script.

### Sample API Calls

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Get Patients:**
```bash
curl -X GET http://localhost:3001/api/patients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Role-based access control is implemented
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS protection
- Comprehensive audit logging

## Performance

- SQLite database with optimized indexes
- Connection pooling
- Efficient query design
- Pagination for large datasets
- Caching strategies for frequently accessed data

## Monitoring

- Comprehensive logging with Winston
- Health check endpoint at `/health`
- Performance monitoring
- Error tracking and reporting

## Contributing

1. Follow the existing code structure and patterns
2. Add proper error handling and validation
3. Include comprehensive logging
4. Write tests for new features
5. Update documentation

## License

This project is part of the Hospital Management System and follows the same licensing terms.
