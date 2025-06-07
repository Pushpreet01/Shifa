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

type Props = NativeStackScreenProps<HomeStackParamList, "OpportunityDetails">;

export type OpportunityDetailsParams = {
  title: string;
  organization: string;
  timing: string;
  tasks?: string;
};

const OpportunityDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { title, organization, timing, tasks } = route.params as OpportunityDetailsParams;

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
          <Text style={styles.headerTitle}>Details</Text>
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

      <ScrollView style={styles.content}>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{title}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timing</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>{timing}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organiser</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>{organization}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                {tasks || "No specific tasks listed for this opportunity."}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => navigation.navigate('OpportunityApplicationForm', {
              title,
              description: `Join us for a week to get experience in ${title.toLowerCase()} and gain valuable skills.`
            })}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
  },
  detailsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  section: {
    marginBottom: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
  },
  sectionText: {
    fontSize: 16,
    color: "#2E2E2E",
    lineHeight: 24,
  },
  applyButton: {
    backgroundColor: "#1B6B63",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 35,
    marginTop: 15,
    marginBottom: 40,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default OpportunityDetailsScreen; 