import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { SuperAdminStackParamList } from "../types/navigation";
import SuperAdminDashboardScreen from "../app/superadmin/SuperAdminDashboardScreen";
import CreateAdminScreen from "../app/superadmin/CreateAdminScreen";

const Stack = createStackNavigator<SuperAdminStackParamList>();

const SuperAdminNavigator = () => (
    <Stack.Navigator initialRouteName="SuperAdminDashboard">
        <Stack.Screen
            name="SuperAdminDashboard"
            component={SuperAdminDashboardScreen}
            options={{ title: "Super Admin Dashboard" }}
        />
        <Stack.Screen
            name="CreateAdmin"
            component={CreateAdminScreen}
            options={{ title: "Create Admin" }}
        />
        {/* Add AdminDetails, CreateAdmin, EditAdmin screens here as needed */}
    </Stack.Navigator>
);

export default SuperAdminNavigator; 