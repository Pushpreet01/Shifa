// navigation/RootNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth, Role } from "../context/AuthContext";

import AuthNavigator from "./AuthNavigator";
import AdminNavigator from "./AdminNavigator";
import AppNavigator from "./AppNavigator";

const RootNavigator = () => {
  const { user, isAuthenticated, loading } = useAuth(); 

  if (loading) {
    return null; // or a splash/loading screen component
  }

  // Roles considered general users
  const generalUserRoles: Role[] = ["Support Seeker", "Event Organizer", "Volunteer"];

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        user?.role === "Admin" ? (
          <AdminNavigator />
        ) : user?.role && generalUserRoles.includes(user.role) ? (
          <AppNavigator />
        ) : (
          // If role is missing or invalid, fall back to AuthNavigator (with error message)
          <AuthNavigator />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
