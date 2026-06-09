import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface GoogleUser {
  sub: string;
  name: string;
  email: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

interface GoogleAuthContextValue {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (user: GoogleUser) => void;
  logout: () => void;
}

const STORAGE_KEY = "hvac_google_user";

const GoogleAuthContext = createContext<GoogleAuthContextValue | null>(null);

export function GoogleAuthProvider({
  children,
}: { children: React.ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored) as GoogleUser);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const login = useCallback((googleUser: GoogleUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser));
    setUser(googleUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <GoogleAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitializing,
        login,
        logout,
      }}
    >
      {children}
    </GoogleAuthContext.Provider>
  );
}

export function useGoogleAuth() {
  const ctx = useContext(GoogleAuthContext);
  if (!ctx)
    throw new Error("useGoogleAuth must be used within GoogleAuthProvider");
  return ctx;
}
