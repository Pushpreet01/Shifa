import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/AppNavigator";
import { MaterialIcons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<HomeStackParamList, "Emergency">;

const EmergencyScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroBox}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonContainer}
          >
            <Ionicons name="chevron-back-outline" size={24} color="#1B6B63" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
              <Ionicons name="notifications-outline" size={24} color="#C44536" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sosWrapper} onPress={() => navigation.navigate('Emergency')}>
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="list" size={60} color="#1B6B63" />
        </View>
        <Text style={styles.callListText}>Call List</Text>

        <View style={styles.separatorContainer}>
          <View style={styles.separatorDot}></View>
          <View style={styles.separatorLine}></View>
          <View style={styles.separatorDot}></View>
        </View>

        <TouchableOpacity style={styles.emergencyButton}>
          <Text style={styles.emergencyButtonText}>Community Hotline</Text>
          <Ionicons name="call" size={24} color="#F4A941" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.emergencyButton}>
          <Text style={styles.emergencyButtonText}>Emergency Contact 1</Text>
          <Ionicons name="call" size={24} color="#F4A941" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.emergencyButton}>
          <Text style={styles.emergencyButtonText}>Emergency Contact 2</Text>
          <Ionicons name="call" size={24} color="#F4A941" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.addContactButton}>
          <Text style={styles.addContactButtonText}>Add Emergency Contact</Text>
          <MaterialIcons
            name="add-call"
            size={30}
            color="#ffffff"
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF6EC", // Matching the background color from the image
  },
  heroBox: {
    backgroundColor: "#FDF6EC", // Matching the heroBox background color
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
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B6B63",
    marginLeft: 8,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  sosWrapper: {
    backgroundColor: "#C44536",
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sosText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    alignItems: "center", // Center content vertically and horizontally
  },
  iconContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 60,
    padding: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  callListText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B6B63",
    marginBottom: 20,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 30,
    marginTop: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1B6B63",
  },
  separatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1B6B63",
    marginHorizontal: 5,
  },
  emergencyButton: {
    flexDirection: "row",
    backgroundColor: "#EFF6F6",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  emergencyButtonText: {
    fontSize: 18,
    color: "#2E2E2E",
    fontWeight: "700",
  },
  addContactButton: {
    marginTop: 20,
    alignSelf: "center", // Center the button horizontally
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B6B63", // Teal background
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 0, // Remove border
  },
  addContactButtonText: {
    fontSize: 16,
    color: "#fff", // White text
    fontWeight: "700",
    marginRight: 10,
  },
});

export default EmergencyScreen;
