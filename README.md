# LIMISES - Electronic Medical Records System

A comprehensive Electronic Medical Records (EMR) system built with Next.js, TypeScript, and Tailwind CSS, designed to streamline healthcare workflows and improve patient care.

## 🏥 Features

### Core Modules

- **Dashboard** - Overview of key metrics, recent activity, and quick actions
- **Patient Management** - Patient registration, search, and profile management
- **Clinical Documentation** - SOAP notes, progress notes, and encounter documentation
- **Order Entry (CPOE)** - Computerized Provider Order Entry for labs, medications, and procedures
- **Lab Results Management** - View and manage laboratory test results with critical value alerts
- **Medication Management** - Track medications, allergies, and drug interactions
- **Appointment Scheduling** - Manage patient appointments and provider schedules
- **Settings** - User account management and system preferences

### Key Features

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode Support** - Built-in dark/light theme toggle
- **Real-time Alerts** - Critical lab results and drug interaction notifications
- **Search & Filtering** - Advanced search capabilities across all modules
- **Role-based Access** - Secure access control for different user types
- **HIPAA Compliance Ready** - Security features designed for healthcare data protection

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd emr-system
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Icons**: Heroicons
- **State Management**: React Hooks

## 📁 Project Structure

```
emr-system/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard page
│   ├── patients/          # Patient management
│   ├── clinical-notes/    # Clinical documentation
│   ├── orders/            # Order entry
│   ├── lab-results/       # Lab results management
│   ├── medications/       # Medication management
│   ├── scheduling/        # Appointment scheduling
│   └── settings/          # User settings
├── components/            # Reusable components
│   ├── Sidebar.tsx        # Navigation sidebar
│   └── Header.tsx         # Top header
├── Tailwind-UI/          # Reference UI components
└── prd.txt               # Product Requirements Document
```

## 🎨 Design System

The application uses a consistent design system based on Tailwind CSS with:

- **Primary Colors**: Indigo-based color scheme for medical professionalism
- **Medical Colors**: Green accents for positive health indicators
- **Status Colors**: 
  - Green: Normal/Active/Completed
  - Yellow: Warning/Abnormal/Pending
  - Red: Critical/Error/Cancelled
  - Blue: Information/Scheduled

## 🔒 Security Features

- Role-based access control
- Secure form handling
- Input validation
- Audit trail ready
- HIPAA compliance considerations

## 📊 Modules Overview

### Dashboard
- Key performance indicators
- Recent activity feed
- Upcoming appointments
- Quick action buttons

### Patient Management
- Patient registration forms
- Advanced search and filtering
- Patient profile management
- Medical record numbers (MRN)

### Clinical Documentation
- SOAP note templates
- Progress notes
- Encounter summaries
- Clinical note history

### Order Entry (CPOE)
- Lab test orders
- Medication prescriptions
- Imaging orders
- Procedure scheduling
- Order status tracking

### Lab Results
- Result viewing and interpretation
- Critical value alerts
- Reference ranges
- Result history

### Medication Management
- Active medication lists
- Allergy tracking
- Drug interaction alerts
- Medication history

### Scheduling
- Appointment booking
- Provider availability
- Appointment types
- Status tracking

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Create a `.env.local` file for environment-specific configurations:

```env
NEXT_PUBLIC_APP_NAME=LIMISES
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏥 Healthcare Compliance

This EMR system is designed with healthcare compliance in mind:

- **HIPAA Ready**: Security features for protected health information
- **Audit Trails**: Comprehensive logging for compliance
- **Data Encryption**: Secure data handling
- **Access Controls**: Role-based permissions

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is a demonstration EMR system. For production use in healthcare environments, additional security measures, compliance certifications, and integration with existing healthcare systems would be required.
