import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from "../config/firebaseConfig";
import { User, onAuthStateChanged } from 'firebase/auth';

// Extend the AuthContextType to include isAuthenticated
interface AuthContextType {
  user: User | null | { uid: string; email: string; displayName: string };
  loading: boolean;
  setUser: (user: any) => void;
  isAuthenticated: boolean; // ✅ Added here
}

// Provide default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  isAuthenticated: false, // ✅ Added default
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null | { uid: string; email: string; displayName: string }>(null);
  const [loading, setLoading] = useState(true);

  // isAuthenticated is derived from whether user exists
  const isAuthenticated = !!user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
