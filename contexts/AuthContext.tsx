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

        if (isAuth && user) {
          // Token geçerli, kullanıcıyı otomatik giriş yaptır
          setAuthenticated(true);
          if (user.role === "Mentor") setRole(UserType.Mentor);
          else if (user.role === "Mentee") setRole(UserType.Mentee);
          else if (user.role === "General") setRole(UserType.General);
        } else {
          // Token geçersiz veya kullanıcı bulunamadı, refresh token ile yenilemeyi dene
          await userService.loginWithRefreshToken(
            () => {
              setAuthenticated(true);
              if (user?.role === "Mentor") setRole(UserType.Mentor);
              else if (user?.role === "Mentee") setRole(UserType.Mentee);
              else if (user?.role === "General") setRole(UserType.General);
            },
            () => {
              // Refresh token da geçersiz, kullanıcıyı çıkış yaptır
              setAuthenticated(false);
              setRole(null);
            }
          );
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setAuthenticated(false);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

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
