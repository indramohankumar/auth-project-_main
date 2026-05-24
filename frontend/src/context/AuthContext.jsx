/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

const AUTH_TOKEN_KEY = 'token';
const AUTH_USER_KEY = 'auth_user';

const safeParseUser = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('Failed to parse stored auth user:', error);
    return null;
  }
};

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;

  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to decode auth token:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        try {
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await API.get('/auth/me');
          const currentUser = response.data.user || null;

          if (currentUser) {
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
            setUser({ token, ...currentUser });
          } else {
            const storedUser = safeParseUser(localStorage.getItem(AUTH_USER_KEY));
            const tokenUser = storedUser || decodeJwtPayload(token);
            setUser(tokenUser ? { token, ...tokenUser } : { token });
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          const storedUser = safeParseUser(localStorage.getItem(AUTH_USER_KEY));
          const tokenUser = storedUser || decodeJwtPayload(token);

          if (tokenUser) {
            setUser({ token, ...tokenUser });
          } else {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
            delete API.defaults.headers.common['Authorization'];
          }
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    const userData = res.data.user || null;
    localStorage.setItem(AUTH_TOKEN_KEY, res.data.token);
    if (userData) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    }
    API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser({ token: res.data.token, ...userData });
    return res.data;
  };

  const registerUser = async (name, email, password, role) => {
    const res = await API.post("/auth/register", { name, email, password, role });
    // Registration doesn't return a token in this backend, so we don't automatically log them in
    // They will need to log in after successful registration.
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, registerUser, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
