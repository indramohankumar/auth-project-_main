
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/Dashboard';
import Visitors from './pages/visitors';
import Appointment from './pages/appointement';
import Check from './pages/check';
import Users from './pages/users';
import PreRegister from './pages/PreRegister';
import ViewPass from './pages/ViewPass';
import Navbar from './components/navbar';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pre-register" element={<PreRegister />} />
          <Route path="/view-pass" element={<ViewPass />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/visitors" element={<ProtectedRoute allowedRoles={["admin", "security", "employee"]}><Visitors /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute allowedRoles={["admin", "employee"]}><Appointment /></ProtectedRoute>} />
          <Route path="/check" element={<ProtectedRoute allowedRoles={["admin"]}><Check /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={["admin"]}><Users /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
