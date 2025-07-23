// navigation/RootNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth, Role } from "../context/AuthContext";

import AuthNavigator from "./AuthNavigator";
import AdminNavigator from "./AdminNavigator";
import AppNavigator from "./AppNavigator";
// Import SuperAdminNavigator (to be created)
import SuperAdminNavigator from "./SuperAdminNavigator";

const RootNavigator = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Add debugging logs
  console.log("[RootNavigator] loading:", loading);
  console.log("[RootNavigator] isAuthenticated:", isAuthenticated);
  console.log("[RootNavigator] user:", user);
  console.log("[RootNavigator] user?.role:", user?.role);

  if (loading) {
    console.log("[RootNavigator] Still loading, returning null");
    return null; // or a splash/loading screen component
  }

  // Roles considered general users
  const generalUserRoles: Role[] = ["Support Seeker", "Event Organizer", "Volunteer"];

  // Determine which navigator to render
  let navigatorToRender = "AuthNavigator";
  if (isAuthenticated) {
    if (user?.role === "Super Admin") {
      navigatorToRender = "SuperAdminNavigator";
    } else if (user?.role === "Admin") {
      navigatorToRender = "AdminNavigator";
    } else if (user?.role && generalUserRoles.includes(user.role)) {
      navigatorToRender = "AppNavigator";
    } else {
      navigatorToRender = "AuthNavigator (fallback)";
    }
  }

  console.log("[RootNavigator] Rendering:", navigatorToRender);

  // Render the selected navigator
  switch (navigatorToRender) {
    case "SuperAdminNavigator":
      return <SuperAdminNavigator />;
    case "AdminNavigator":
      return <AdminNavigator />;
    case "AppNavigator":
      return <AppNavigator />;
    default:
      return <AuthNavigator />;
  }
};

export default RootNavigator;
