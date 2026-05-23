/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage on initial load
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Assuming you might have a /auth/me endpoint.
          // If not, we can decode the JWT token to get user info, or just store the token.
          // For now, let's just set the user to true if token exists to keep it simple,
          // or we can decode it if `jwt-decode` is installed.
          // Let's rely on a protected route request to verify it.
          // For simplicity, we'll store { token } in user state if it exists.
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser({ token }); 
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem('token');
          delete API.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser({ token: res.data.token, ...res.data.user });
    return res.data;
  };

  const registerUser = async (name, email, password, role) => {
    const res = await API.post("/auth/register", { name, email, password, role });
    // Registration doesn't return a token in this backend, so we don't automatically log them in
    // They will need to log in after successful registration.
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, registerUser, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
