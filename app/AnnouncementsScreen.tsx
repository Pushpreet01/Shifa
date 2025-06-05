import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const announcements = [
  {
    id: 1,
    text: "New Opportunities added ; Please view them in the  Volunteering page.",
    color: "#C7E5C6",
  },
  {
    id: 2,
    text: "New Events added ; Please view them in the Events page.",
    color: "#FFF7CC",
  },
  {
    id: 3,
    text: "New updates made to the Home page with added functionality to some buttons and features, including a hover text and more options to the quick menu.",
    color: "#F8E6E0",
  },
];

const AnnouncementsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroBox}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
            <Ionicons name="chevron-back-outline" size={24} color="#2E2E2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Anouncements</Text>
          <View style={styles.headerIcons}>
            <Ionicons name="notifications-outline" size={24} color="#C44536" style={{ marginRight: 10 }} />
            <TouchableOpacity style={styles.sosWrapper}>
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {announcements.map((item) => (
          <View key={item.id} style={[styles.announcementCard, { backgroundColor: item.color }]}> 
            <Text style={styles.announcementText}>{item.text}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  heroBox: {
    backgroundColor: "#FDF6EC",
    paddingTop: 40,
    paddingBottom: 16,
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B6B63",
    marginLeft: 10,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  sosWrapper: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#C44536",
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sosText: {
    color: "#C44536",
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 20,
  },
  announcementCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 18,
  },
  announcementText: {
    color: "#2E2E2E",
    fontSize: 15,
  },
});

export default AnnouncementsScreen; 