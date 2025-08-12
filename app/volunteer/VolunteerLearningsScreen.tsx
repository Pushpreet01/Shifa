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
import { HomeStackParamList } from "../../navigation/AppNavigator";
import HeroBox from "../../components/HeroBox";

type Props = NativeStackScreenProps<HomeStackParamList, "VolunteerLearnings">;

const VolunteerLearningsScreen: React.FC<Props> = ({ navigation }) => {
  const learningModules = [
    {
      title: "Introduction to Volunteering",
      duration: "15 mins",
      status: "Completed",
    },
    {
      title: "Communication Skills",
      duration: "30 mins",
      status: "In Progress",
    },
    {
      title: "Safety Guidelines",
      duration: "20 mins",
      status: "Not Started",
    },
    {
      title: "Cultural Sensitivity",
      duration: "25 mins",
      status: "Not Started",
    },
  ];

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <Ionicons name="checkmark-circle" size={24} color="#1B6B63" />;
      case "In Progress":
        return <Ionicons name="time" size={24} color="#F4A941" />;
      default:
        return <Ionicons name="play-circle" size={24} color="#A0A0A0" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeroBox title="My Learnings" showBackButton={true} />
      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Modules{"\n"}Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Hours of{"\n"}Learning</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Skills{"\n"}Gained</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Learning Modules</Text>
        
        <View style={styles.modulesContainer}>
          {learningModules.map((module, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.moduleCard}
              onPress={() => {
                // Navigation to module content will be implemented later
                console.log(`Opening module: ${module.title}`);
              }}
            >
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDuration}>{module.duration}</Text>
              </View>
              <View style={styles.moduleStatus}>
                {renderStatusIcon(module.status)}
                <Text style={[
                  styles.moduleStatusText,
                  { color: module.status === "Completed" ? "#1B6B63" : 
                         module.status === "In Progress" ? "#F4A941" : "#A0A0A0" }
                ]}>
                  {module.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1B6B63",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#2E2E2E",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  modulesContainer: {
    paddingHorizontal: 20,
  },
  moduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#F4A941",
  },
  moduleInfo: {
    flex: 1,
    marginRight: 10,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 4,
  },
  moduleDuration: {
    fontSize: 14,
    color: "#666666",
  },
  moduleStatus: {
    alignItems: "center",
  },
  moduleStatusText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});

export default VolunteerLearningsScreen; 