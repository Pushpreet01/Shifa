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

type Props = NativeStackScreenProps<HomeStackParamList, "VolunteerRewards">;

type IconName = 
  | "notifications-outline"
  | "people-outline"
  | "share-social-outline"
  | "heart-outline"
  | "ribbon-outline"
  | "trophy-outline"
  | "star-outline"
  | "medal-outline";

  // Placeholder data for the progress steps
const VolunteerRewardsScreen: React.FC<Props> = ({ navigation }) => {
  const progressSteps = [
    {
      title: "Register for\nan event",
      icon: "notifications-outline" as IconName,
      completed: true,
    },
    {
      title: "Attend a counselling\nsession",
      icon: "people-outline" as IconName,
      completed: true,
    },
    {
      title: "Refer A friend",
      icon: "share-social-outline" as IconName,
      completed: true,
    },
    {
      title: "Volunteer for\nan event",
      icon: "heart-outline" as IconName,
      completed: false,
    },
  ];

  const badges = [
    { id: 1, earned: true, icon: "ribbon-outline" as IconName },
    { id: 2, earned: true, icon: "trophy-outline" as IconName },
    { id: 3, earned: true, icon: "star-outline" as IconName },
    { id: 4, earned: false, icon: "medal-outline" as IconName },
    { id: 5, earned: false, icon: "ribbon-outline" as IconName },
    { id: 6, earned: false, icon: "trophy-outline" as IconName },
    { id: 7, earned: false, icon: "star-outline" as IconName },
    { id: 8, earned: false, icon: "medal-outline" as IconName },
    { id: 9, earned: false, icon: "ribbon-outline" as IconName },
    { id: 10, earned: false, icon: "trophy-outline" as IconName },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeroBox title="Rewards" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        
        <View style={styles.progressContainer}>
          {progressSteps.map((step, index) => (
            <View key={index} style={styles.progressStep}>
              <View style={[
                styles.progressIcon,
                step.completed && styles.progressIconCompleted
              ]}>
                <Ionicons
                  name={step.icon}
                  size={28}
                  color={step.completed ? "#FFF" : "#A0A0A0"}
                />
              </View>
              <Text style={styles.progressText}>{step.title}</Text>
              {index < progressSteps.length - 1 && (
                <View style={[
                  styles.progressLine,
                  step.completed && styles.progressLineCompleted,
                  {
                    width: "100%",
                  }
                ]} />
              )}
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>My Badges</Text>
        
        <View style={styles.badgesContainer}>
          {badges.map((badge, index) => (
            <View key={index} style={styles.badgeWrapper}>
              <View style={[styles.badge, !badge.earned && styles.badgeUnearned]}>
                <Ionicons
                  name={badge.icon}
                  size={32}
                  color={badge.earned ? "#FFFFFF" : "#A0A0A0"}
                />
              </View>
            </View>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 40,
    position: "relative",
  },
  progressStep: {
    alignItems: "center",
    width: "25%",
    position: "relative",
    zIndex: 1,
  },
  progressIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  progressIconCompleted: {
    backgroundColor: "#1B6B63",
  },
  progressLine: {
    height: 2,
    width: "100%",
    backgroundColor: "#F0F0F0",
    position: "absolute",
    top: 28,
    left: "50%",
    zIndex: 0,
  },
  progressLineCompleted: {
    backgroundColor: "#1B6B63",
  },
  progressText: {
    fontSize: 14,
    color: "#2E2E2E",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  badgeWrapper: {
    width: "20%",
    aspectRatio: 1,
    padding: 8,
  },
  badge: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#1B6B63",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeUnearned: {
    backgroundColor: "#F0F0F0",
  },
});

export default VolunteerRewardsScreen; 