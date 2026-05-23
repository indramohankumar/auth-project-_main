# 🚪 Visitor Pass Management System (VPMS)

<div align="center">

### Enterprise-Grade Digital Visitor Management Platform

Transforming traditional visitor entry processes into a secure, intelligent, and fully digital experience using the MERN Stack.

![MERN](https://img.shields.io/badge/MERN-Stack-green)
![React](https://img.shields.io/badge/Frontend-React-blue)
![Node](https://img.shields.io/badge/Backend-Node.js-success)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

</div>

---

# 📌 Overview

The **Visitor Pass Management System (VPMS)** is a full-stack enterprise solution designed to modernize and automate visitor handling processes for organizations, offices, campuses, and institutions.

The platform eliminates manual visitor registers by introducing:

* Secure digital visitor onboarding
* QR-based pass verification
* Real-time check-in/check-out tracking
* Appointment scheduling & approval workflows
* Analytics and reporting dashboards

Built using the **MERN Stack**, the application focuses on scalability, security, maintainability, and modern UI/UX principles.

---

# ✨ Core Features

## 🔐 Authentication & Authorization

* JWT-based secure authentication
* Role-based access control (RBAC)
* Protected routes & APIs
* Secure password hashing with bcrypt

---

## 👥 Multi-Role Access System

| Role                     | Responsibilities                                  |
| ------------------------ | ------------------------------------------------- |
| **Admin**                | Manage users, system analytics, reports           |
| **Security / Frontdesk** | Verify visitors, scan QR passes, manage check-ins |
| **Employee / Host**      | Invite and approve visitors                       |
| **Visitor**              | Pre-register and access digital visitor pass      |

---

## 📋 Visitor Registration

* Visitor profile creation
* Photo upload support
* Contact & identification details
* Visitor history management

---

## 📅 Appointment & Invitation Management

* Pre-registration workflow
* Host approval/rejection system
* Scheduled appointments
* Visitor invitation handling

---

## 🎟️ Smart Pass Generation

* Dynamic QR code generation
* PDF badge/pass creation
* Unique pass identification
* Downloadable digital passes

---

## 📲 QR-Based Check-In / Check-Out

* Real-time QR scanning
* Automated attendance logging
* Entry & exit timestamp recording
* Secure verification workflow

---

## 📧 Notification Services

* Email notifications
* SMS integration support
* Approval & reminder alerts
* Visitor status updates

---

## 📊 Dashboard & Reporting

* Visitor analytics dashboard
* Search, filter & export capabilities
* Daily/monthly visitor statistics
* System activity monitoring

---

# 🛠️ Technology Stack

## Frontend

* React.js
* React Router DOM
* Axios
* Tailwind CSS
* Context API

## Backend

* Node.js
* Express.js
* REST API Architecture
* JWT Authentication

## Database

* MongoDB
* Mongoose ODM

## Integrations & Utilities

* QRCode Generator
* PDFKit
* Multer
* Nodemailer
* Twilio API

---

# 🧱 System Architecture

```bash id="w5r1b4"
Client (React.js)
       ↓
REST API (Express.js)
       ↓
Authentication Layer (JWT)
       ↓
Business Logic Layer
       ↓
MongoDB Database
```

---

# 📂 Project Structure

```bash id="j7kw6k"
visitor-pass-management-system/
│
├── client/                         # Frontend Application
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── routes/
│       ├── services/
│       ├── context/
│       └── utils/
│
├── server/                         # Backend Application
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── uploads/
│
├── screenshots/
├── README.md
└── package.json
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash id="kxyr34"
git clone https://github.com/your-username/visitor-pass-management-system.git
cd visitor-pass-management-system
```

---

## 2️⃣ Install Dependencies

### Backend

```bash id="x0jcq0"
cd server
npm install
```

### Frontend

```bash id="6ndfii"
cd client
npm install
```

---

# 🔑 Environment Configuration

Create a `.env` file inside the `server/` directory.

```env id="jgm0k6"
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key

EMAIL_USER=your_email
EMAIL_PASS=your_email_password

TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE=your_twilio_phone_number
```

---

# ▶️ Running the Application

## Start Backend Server

```bash id="lmr9cn"
cd server
npm run dev
```

## Start Frontend Application

```bash id="h9b42v"
cd client
npm start
```

---

# 🔐 Demo Credentials

## Administrator

```bash id="d3pzy8"
Email: admin@gmail.com
Password: admin123
```

## Security Staff

```bash id="l9qfwm"
Email: security@gmail.com
Password: security123
```

## Employee

```bash id="4j7n1q"
Email: employee@gmail.com
Password: employee123
```

---

# 🔄 Application Workflow

```text id="x4s25q"
Visitor Registration
        ↓
Appointment Request
        ↓
Host Approval Process
        ↓
QR Pass Generation
        ↓
Security Verification
        ↓
Check-In Logging
        ↓
Check-Out Completion
```

---

# 🗄️ Database Collections

```bash id="rq0kk6"
Users
Visitors
Appointments
Passes
CheckLogs
Notifications
```

---

# 🔒 Security Implementation

* JWT Authentication & Authorization
* Password Encryption using bcrypt
* Protected API Routes
* Input Validation & Sanitization
* Secure File Upload Handling
* Role-Based Access Control (RBAC)

---

# 📈 Key Functionalities Delivered

| Module                | Status |
| --------------------- | ------ |
| Authentication System | ✅      |
| Visitor Registration  | ✅      |
| QR Pass Generation    | ✅      |
| PDF Badge Creation    | ✅      |
| Appointment Workflow  | ✅      |
| Check-In / Check-Out  | ✅      |
| Dashboard Analytics   | ✅      |
| Notifications         | ✅      |

---

# 📸 Application Screenshots

| Module               | Preview        |
| -------------------- | -------------- |
| Authentication Page  | Add Screenshot |
| Admin Dashboard      | Add Screenshot |
| Visitor Registration | Add Screenshot |
| QR Pass System       | Add Screenshot |
| Analytics Dashboard  | Add Screenshot |

---

# 🎥 Demonstration

> Add project demo video link here

---

# 🚀 Future Enhancements

* OTP-Based Verification
* Face Recognition Entry System
* Multi-Organization Architecture
* Docker & Nginx Deployment
* Cloud Storage Integration
* Mobile Application Support

---

# 🧪 Testing & Validation

* API testing with Postman
* Route protection testing
* Authentication validation
* QR verification testing
* Responsive UI testing

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 🤝 Contribution Guidelines

Contributions, issues, and feature requests are welcome.

```bash id="2rzn6r"
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request
```

---

# 👨‍💻 Author

## **Indramohan Kumar**

### MERN Stack Developer

---

<div align="center">

### ⭐ If you found this project helpful, consider giving it a star on GitHub.

</div>
