import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<HomeStackParamList, "Opportunities">;

const OpportunitiesScreen: React.FC<Props> = ({ navigation }) => {
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
          <Text style={styles.headerTitle}>Opportunities</Text>
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
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search volunteer opportunities"
            placeholderTextColor="#999"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterButtonsContainer}>
          <TouchableOpacity style={[styles.filterButton, styles.filterButtonActive]}>
            <Text style={[styles.filterButtonText, styles.filterButtonTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Remote</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>One-time</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Weekends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Family-friendly</Text>
          </TouchableOpacity>
        </ScrollView>
        {/* Placeholder Opportunity Cards */}
        <View style={styles.opportunityCard}>
          <Text style={styles.opportunityCardTitle}>Meal Delivery Driver</Text>
          <Text style={styles.opportunityCardSubtitle}>Caring Communities</Text>
          <Text style={styles.opportunityCardDetails}>2-4 hours weekly</Text>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => navigation.navigate('OpportunityDetails', {
              title: 'Meal Delivery Driver',
              organization: 'Caring Communities',
              timing: '2-4 hours weekly',
              tasks: 'Deliver prepared meals to community members in need, following provided routes and schedules.'
            })}
          >
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.opportunityCard}>
          <Text style={styles.opportunityCardTitle}>Crisis Hotline Support</Text>
          <Text style={styles.opportunityCardSubtitle}>Mental Health Alliance</Text>
          <Text style={styles.opportunityCardDetails}>4 hours weekly</Text>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => navigation.navigate('OpportunityDetails', {
              title: 'Crisis Hotline Support',
              organization: 'Mental Health Alliance',
              timing: '4 hours weekly',
              tasks: 'Provide emotional support and crisis intervention to callers in need. Training will be provided.'
            })}
          >
            <Text style={styles.detailsButtonText}>Details</Text>
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
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: "#2E2E2E",
  },
  filterButtonsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: "#1B6B63",
  },
  filterButtonText: {
    color: "#2E2E2E",
    fontSize: 14,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  opportunityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#F4A941",
  },
  opportunityCardTitle: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#2E2E2E",
    marginBottom: 2,
  },
  opportunityCardSubtitle: {
    color: "#2E2E2E",
    fontSize: 15,
    marginBottom: 2,
  },
  opportunityCardDetails: {
    color: "#2E2E2E",
    fontSize: 14,
    marginBottom: 10,
  },
  detailsButton: {
    alignSelf: "flex-end",
    backgroundColor: "#1B6B63",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  detailsButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default OpportunitiesScreen; 