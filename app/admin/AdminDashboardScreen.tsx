import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const AdminDashboardScreen = () => {
  const navigation = useNavigation<any>();

  const dashboardItems = [
    {
      title: "Users",
      count: 120,
      icon: "person-outline",
      route: "UserManagement",
      description: "Manage user accounts and roles"
    },
    {
      title: "Approvals",
      count: 45,
      icon: "people-outline",
      route: "ApprovalManagement",
      description: "Review pending volunteer requests"
    },
    {
      title: "Events",
      count: 8,
      icon: "calendar-outline",
      route: "Events",
      description: "Create and manage community events"
    },
    {
      title: "Resources",
      count: 30,
      icon: "book-outline",
      route: "ResourceManagement",
      description: "Update help resources and guides"
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Styled Header */}
        <View style={styles.heroBox}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <View style={styles.avatarContainer}>
            <Image
              source={require("../../assets/image.png")}
              style={styles.avatarImage}
            />
            <Text style={styles.avatarLabel}>Welcome, Admin!</Text>
          </View>
        </View>

        {/* Dashboard Grid */}
        <View style={styles.grid}>
          {dashboardItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => item.route && navigation.navigate(item.route)}
            >
              <Ionicons name={item.icon as any} size={28} color="#1B6B63" />
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.descriptionContainer}>
                <Ionicons name="information-circle-outline" size={16} color="#666" />
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Friendly Reminder */}
        <View style={styles.reminderContainer}>
          <Ionicons name="heart" size={24} color="#1B6B63" />
          <Text style={styles.reminderText}>
            Your dedication makes a difference in our community.{'\n'}
            Remember to take breaks and stay energized!{'\n'}
            Together, we create positive change.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EC",
  },
  container: {
    paddingBottom: 120,
  },
  heroBox: {
    backgroundColor: "#FDF6EC",
    paddingTop: 40,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B6B63",
    marginBottom: 10,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0E0E0",
  },
  avatarLabel: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 30,
  },
  card: {
    backgroundColor: "#E0F2F1",
    width: "47%",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  count: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B6B63",
    marginTop: 10,
  },
  title: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginTop: 10,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 5,
  },
  description: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    textAlign: 'center',
    flex: 1,
  },
  reminderContainer: {
    marginTop: 30,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "#FDF6EC",
    // borderRadius: 18,
    // borderWidth: 4,
    // borderColor: "#E0F2F1",
    alignItems: "center",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 4,
    // elevation: 3,
  },
  reminderText: {
    marginTop: 10,
    fontSize: 14,
    color: "#2E2E2E",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default AdminDashboardScreen;
