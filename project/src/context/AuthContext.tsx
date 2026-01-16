import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  uid: number | null;
  username: string | null;
  password: string | null;
  login: (uid: number, username: string, password: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [uid, setUid] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  const login = (newUid: number, newUsername: string, newPassword: string) => {
    setUid(newUid);
    setUsername(newUsername);
    setPassword(newPassword);
  };

  const logout = () => {
    setUid(null);
    setUsername(null);
    setPassword(null);
    
    // Clear localStorage on logout
    localStorage.removeItem('odoo_uid');
    localStorage.removeItem('odoo_username');
    localStorage.removeItem('odoo_password');
  };

  const isAuthenticated = uid !== null;

  return (
    <AuthContext.Provider value={{ uid, username, password, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
