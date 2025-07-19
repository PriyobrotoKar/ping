import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { IUser } from "@ping/db";
import AuthService from "@/api/services/auth";

export type CurrentUser = Pick<IUser, "fullName" | "email">;

interface IAuthContext {
  auth: CurrentUser | null;
  setAuth: (user: CurrentUser | null) => void;
  login: (data: { email: string; password: string }) => Promise<void>;
}

const AuthContext = createContext<IAuthContext | null>(null);

function AuthContextProvider({ children }: { children: ReactNode }) {
  const storageUser = localStorage.getItem("user");
  const [auth, setAuth] = useState<CurrentUser | null>(
    storageUser ? JSON.parse(storageUser) : null,
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { fullName, email } = await AuthService.checkAuth();
        setAuth({ fullName, email });
        localStorage.setItem("user", JSON.stringify({ fullName, email }));
      } catch (error) {
        setAuth(null);
        localStorage.removeItem("user");
      }
    };

    fetchUser();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    try {
      const { fullName, email } = await AuthService.login(data);
      setAuth({ fullName, email });
      localStorage.setItem("user", JSON.stringify({ fullName, email }));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth should be used within AuthContextProvider");
  }

  return context;
}
