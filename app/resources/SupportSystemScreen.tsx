import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const SupportSystemScreen = () => {
  const navigation = useNavigation<any>();

  const supportResources = [
    {
      label: "Women's Helplines",
      icon: "woman",
    },
    {
      label: "Family and Youth Services",
      icon: "people",
    },
    {
      label: "Transitional Homes",
      icon: "home",
    },
  ];

  const handleBack = () => {
    navigation.navigate("Resources");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Unified Header styled like HeroBox */}
      <View style={styles.heroBox}>
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back-outline" size={24} color="#1B6B63" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Support System</Text>
          </View>

          <View style={styles.rightSection}>
            <TouchableOpacity onPress={() => navigation.navigate("Announcements")}>
              <Ionicons name="notifications-outline" size={24} color="#C44536" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sosWrapper}
              onPress={() => navigation.navigate("Emergency")}
            >
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.container}>
        {supportResources.map((item, index) => (
          <View key={index} style={styles.cardRow}>
            <View style={styles.iconBox}>
              <Ionicons name={item.icon} size={60} color="#1B6B63" />
            </View>
            <TouchableOpacity style={styles.infoButton}>
              <Text style={styles.infoButtonText}>{item.label}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EC",
  },
  heroBox: {
    backgroundColor: "#FDF6EC",
    paddingTop: 40,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B6B63",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
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
  container: {
    paddingBottom: 100,
    alignItems: "center",
    paddingTop: 20,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    width: "90%",
    justifyContent: "space-between",
  },
  iconBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 60, // Half of 120 for a perfect circle
    padding: 16,
    width: 120, // Fixed width to match height
    height: 120, // Fixed height
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  infoButton: {
    backgroundColor: "#A8D8C9",
    borderRadius: 20,
    width: "45%",
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoButtonText: {
    color: "#1B6B63",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
});

export default SupportSystemScreen;