# VisitorPass Management System

A full-stack Role-Based Access Control (RBAC) web application to manage visitor registrations, appointments, and check-ins.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas cluster)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd authproject
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and setup your environment variables.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/visitorpass
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```
*(The server should run on `http://localhost:5000`)*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, install dependencies, and start the app.

```bash
cd frontend
npm install
```

Start the frontend Vite development server:
```bash
npm run dev
```
*(The app should run on `http://localhost:5173`)*

---

## Seeding Demo Data

To quickly test the application with pre-configured users (Admin, Employee, Security), you can seed the database.

1. Ensure your MongoDB instance is running and the backend `.env` is configured.
2. In the `backend` directory, run:
```bash
npm run seed:demo
```
3. Wait for the success message. You can now log in using the following test accounts:
   - **Admin:** `admin@gmail.com` / `admin123`
   - **Security:** `security@gmail.com` / `security123`
   - **Employee:** `employee@gmail.com` / `employee123`

---

## Troubleshooting

- **MongoDB Connection Error:** Ensure your MongoDB service is running locally, or verify that your Atlas IP whitelist allows your current IP.
- **CORS Errors on Login/Register:** Verify that the `FRONTEND_URL` in the backend `.env` matches the URL Vite is running on exactly (no trailing slashes).
- **Port Conflicts:** If port 5000 is taken, update the `PORT` in the backend `.env` and ensure the frontend's API calls point to the correct port.
