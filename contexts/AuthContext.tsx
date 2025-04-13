import React, { createContext, useContext, useEffect, useState } from "react";
import userService from "../services/user-service";
import { UserType } from "../domain/user";

interface AuthContextType {
  isAuthenticated: boolean;
  role: UserType | null;
  isLoading: boolean;
  setAuthenticated: (value: boolean) => void;
  setRole: (role: UserType | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  role: null,
  isLoading: true,
  setAuthenticated: () => {},
  setRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<UserType | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const [isAuth, user] = await Promise.all([
          userService.isAuthenticated(),
          userService.getCurrentUser(),
        ]);
        setAuthenticated(isAuth);
        if (user?.role === "Mentor") setRole(UserType.Mentor);
        else if (user?.role === "Mentee") setRole(UserType.Mentee);
        else if (user?.role === "General") setRole(UserType.General);
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, role]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        isLoading,
        setAuthenticated,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
