import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { IUser } from "@ping/db";
import AuthService from "@/api/services/auth";
import { socket } from "@/lib/socket";

export type CurrentUser = Pick<IUser, "_id" | "fullName" | "email">;

interface IAuthContext {
  auth: CurrentUser | null;
  setAuth: (user: CurrentUser | null) => void;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
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
        const { fullName, email, _id } = await AuthService.checkAuth();
        setAuth({ fullName, email, _id });
        localStorage.setItem("user", JSON.stringify({ fullName, email, _id }));
        socket.connect();
        socket.emit("join_global", _id);
      } catch (error) {
        setAuth(null);
        localStorage.removeItem("user");
      }
    };

    fetchUser();

    return () => {
      socket.disconnect();
    };
  }, []);

  const login = async (data: { email: string; password: string }) => {
    try {
      const { fullName, email, _id } = await AuthService.login(data);
      setAuth({ fullName, email, _id });
      localStorage.setItem("user", JSON.stringify({ fullName, email, _id }));
      socket.connect();
      socket.emit("join_global", _id);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setAuth(null);
    localStorage.removeItem("user");
    socket.disconnect();
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        login,
        logout,
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
