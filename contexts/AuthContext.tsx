import React, { createContext, useContext, useEffect, useState } from "react";
import userService from "../services/user-service";
import { UserType } from "../domain/user";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  // Load initial auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        // First try to get stored auth state
        const storedAuth = await AsyncStorage.getItem("isAuthenticated");
        const storedRole = await AsyncStorage.getItem("role");

        console.log("Stored auth:", storedAuth);
        console.log("Stored role:", storedRole);

        if (storedAuth === "true" && storedRole) {
          console.log("Found stored auth state, verifying tokens...");
          // Verify if the stored tokens are still valid
          const [isAuth, user] = await Promise.all([
            userService.isAuthenticated(),
            userService.getCurrentUser(),
          ]);

          console.log("Token valid:", isAuth);
          console.log("Current user:", user);

          if (isAuth && user) {
            console.log("Setting auth state from valid token");
            setAuthenticated(true);
            if (user.role === "Mentor") setRole(UserType.Mentor);
            else if (user.role === "Mentee") setRole(UserType.Mentee);
            else if (user.role === "General") setRole(UserType.General);
          } else {
            console.log("Tokens invalid, trying refresh...");
            // If tokens are invalid, try refresh
            await userService.loginWithRefreshToken(
              () => {
                console.log("Refresh successful");
                setAuthenticated(true);
                if (storedRole === "Mentor") setRole(UserType.Mentor);
                else if (storedRole === "Mentee") setRole(UserType.Mentee);
                else if (storedRole === "General") setRole(UserType.General);
              },
              () => {
                console.log("Refresh failed, clearing auth state");
                // If refresh fails, clear everything
                setAuthenticated(false);
                setRole(null);
                AsyncStorage.removeItem("isAuthenticated");
                AsyncStorage.removeItem("role");
              }
            );
          }
        } else {
          console.log("No stored auth state found");
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setAuthenticated(false);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Persist auth state changes
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem("isAuthenticated", isAuthenticated.toString());
      if (role) {
        AsyncStorage.setItem("role", role.toString());
      } else {
        AsyncStorage.removeItem("role");
      }
    }
  }, [isAuthenticated, role, isLoading]);

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
