import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CustomTabBar from "./CustomTabBar";

const Tab = createBottomTabNavigator();

// Simple placeholder screen that shows "Coming Soon"
const ComingSoonScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Coming Soon</Text>
  </View>
);

const AdminNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      initialRouteName="ComingSoon1"
    >
      <Tab.Screen name="ComingSoon1" component={ComingSoonScreen} />
      <Tab.Screen name="ComingSoon2" component={ComingSoonScreen} />
      <Tab.Screen name="ComingSoon3" component={ComingSoonScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // or your app background color
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default AdminNavigator;
