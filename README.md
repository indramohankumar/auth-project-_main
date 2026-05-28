# 🏢 VisitorPass - Enterprise Visitor Management System

An intuitive, secure, and modern MERN-stack application designed to streamline visitor check-ins, manage appointments, and generate digital entry passes for corporate front-desks.

<div align="center">
  <img src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" alt="Express.js" />
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

<br />

## 🎥 Project Demo
*(Replace this link with your actual YouTube or Loom video link!)*
[👉 **Watch the Full Video Walkthrough Here**](https://youtube.com/)

---

## 📸 Screenshots

*(Create a folder called `screenshots` in your repository and upload your images there to make these visible!)*

| Admin Dashboard | Visitor Registration |
| :---: | :---: |
| ![Dashboard](screenshots/dashboard.png) | ![Registration](screenshots/register.png) |
| **Pass Generation** | **Security Check-In** |
| ![Pass](screenshots/pass.png) | ![Check-In](screenshots/checkin.png) |

---

## 🚀 Key Features

* **Role-Based Access Control (RBAC):** Distinct dashboards for `Admin`, `Security`, and `Employee` roles.
* **Digital Pass Generation:** Automatically generates downloadable PDF visitor passes with dynamic data.
* **Secure API:** Built-in protection against brute-force attacks (`express-rate-limit`) and strict input validation (`Joi`).
* **Advanced Logging:** Production-ready backend logging via `Winston`.
* **Beautiful UI:** Responsive, modern interfaces styled purely with Tailwind CSS.

---

## 📂 Project Structure

```text
VisitorPass/
├── backend/
│   ├── middleware/        # JWT Auth, RBAC, and Validation
│   ├── models/            # Mongoose Schemas (User, Visitor, Pass)
│   ├── routes/            # Express API Endpoints
│   ├── utils/             # PDF Generators & Winston Logger
│   ├── validation/        # Joi Schemas
│   ├── seedDemoData.js    # Database population script
│   └── server.js          # Express entry point
│
└── frontend/
    ├── src/
    │   ├── components/    # Reusable modular UI components
    │   ├── context/       # React Context (Auth State)
    │   ├── pages/         # Core routes (Dashboard, Appointments)
    │   └── services/      # Axios API call wrappers
    ├── index.html
    └── vite.config.js
```

---

## 🛠️ Local Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and a [MongoDB](https://www.mongodb.com/) instance running.

### 1. Clone the Repository
```bash
git clone https://github.com/indramohankumar/auth-project-_main.git
cd auth-project-_main
```

### 2. Environment Variables
Create a `.env` file in the **backend** folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/visitorpass
JWT_SECRET=your_super_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
# Leave FRONTEND_URL blank for local testing
```

Create a `.env` file in the **frontend** folder:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies
Open two separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

### 4. Seed the Database
To easily test the application, populate the database with demo users:
```bash
cd backend
npm run seed:demo
```
You can now log in using the following test accounts:
- **Admin:** `admin@gmail.com` / `admin123`
- **Security:** `security@gmail.com` / `security123`
- **Employee:** `employee@gmail.com` / `employee123`

---

## 🌐 Deployment Guidelines

- **Frontend:** Deployed to Vercel. Ensure `VITE_API_URL` is set to your backend URL in the Vercel dashboard.
- **Backend:** Deployed to Render. Ensure `FRONTEND_URL` is set to your Vercel URL in the Render dashboard to allow CORS.

*(Note: The advanced backend packages `joi` and `winston` are configured to degrade gracefully if they fail to install on local networks, ensuring a smooth local developer experience while maintaining strict production security).*
