// OpportunitiesScreen.tsx with custom dropdown filters

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../navigation/AppNavigator";
import { format, getDay } from "date-fns";
import FirebaseOpportunityService from "../../services/FirebaseOpportunityService";
import FirebaseVolunteerApplicationService from "../../services/FirebaseVolunteerApplicationService";
import { useAuth } from "../../context/AuthContext";
import { VolunteerOpportunity, VolunteerApplication } from "../../types/volunteer";
import HeroBox from "../../components/HeroBox";

const FILTERS = [
  { label: "All", value: "All" },
  { label: "Weekends", value: "Weekends" },
];

const TIME_OPTIONS = [
  { label: "Any Time", value: "any" },
  { label: "After 9 AM", value: 9 },
  { label: "After 12 PM", value: 12 },
  { label: "After 3 PM", value: 15 },
];

type Props = NativeStackScreenProps<HomeStackParamList, "Opportunities">;

const OpportunitiesScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();

  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [userApplications, setUserApplications] = useState<VolunteerApplication[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeTime, setActiveTime] = useState("any");
  const [activeLocation, setActiveLocation] = useState("All");
  const [locations, setLocations] = useState<string[]>([]);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovedOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const allOpportunities = await FirebaseOpportunityService.getAllOpportunities();
      // Only show opportunities with approvalStatus: 'approved'
      const approved = allOpportunities.filter((opp) => opp.approvalStatus.status === "Approved");
      setOpportunities(approved);
      const locs = Array.from(new Set(approved.map((opp) => opp.location).filter(Boolean)));
      setLocations(["All", ...locs]);
    } catch (err) {
      console.error(err);
      setError("Failed to load volunteer opportunities.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserApplications = useCallback(async () => {
    if (!user) return;
    try {
      const apps = await FirebaseVolunteerApplicationService.getApplicationsByUser(user.uid);
      setUserApplications(apps);
    } catch (err) {
      console.error("Failed to load your applications", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchApprovedOpportunities();
      fetchUserApplications();
    } else {
      setLoading(false);
      setError("Please log in to view opportunities.");
    }
  }, [fetchApprovedOpportunities, fetchUserApplications, user]);

  useEffect(() => {
    let filtered = opportunities;

    // Tag Filter
    if (activeFilter === "Weekends") {
      filtered = filtered.filter((opp) => {
        const date = opp.createdAt instanceof Date ? opp.createdAt : opp.createdAt?.toDate?.() || new Date();
        const day = getDay(date);
        return day === 0 || day === 6;
      });
    }

    // Time Filter
    if (activeTime !== "any") {
      filtered = filtered.filter((opp) => {
        const time = parseInt((opp.timings?.split(":")[0]) || "0");
        return time >= Number(activeTime);
      });
    }

    // Location Filter
    if (activeLocation !== "All") {
      filtered = filtered.filter((opp) => opp.location === activeLocation);
    }

    // Search Filter
    if (search.trim()) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (opp) =>
          opp.title?.toLowerCase().includes(lower) ||
          opp.description?.toLowerCase().includes(lower) ||
          opp.location?.toLowerCase().includes(lower) ||
          opp.timings?.toLowerCase().includes(lower)
      );
    }

    setFilteredOpportunities(filtered);
  }, [opportunities, search, activeFilter, activeTime, activeLocation]);

  const handleSearch = () => setSearch(searchInput);

  const hasApplied = (id: string) => userApplications.some((app) => app.opportunityId === id);
  const getApplicationStatus = (id: string) => userApplications.find((a) => a.opportunityId === id)?.status || null;

  const handleDetails = (opportunity: VolunteerOpportunity) => {
    const createdAtDate =
      opportunity.createdAt instanceof Date
        ? opportunity.createdAt
        : typeof opportunity.createdAt?.toDate === "function"
          ? opportunity.createdAt.toDate()
          : new Date();

    navigation.navigate("OpportunityDetails", {
      title: opportunity.title,
      timing: opportunity.timings,
      eventId: opportunity.eventId,
      opportunityId: opportunity.opportunityId,
      description: opportunity.description,
      date: format(createdAtDate, "MMM d, yyyy"),
      location: opportunity.location,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeroBox title="Opportunities" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search volunteer opportunities"
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="arrow-forward-circle" size={28} color="#1B6B63" />
          </TouchableOpacity>
        </View>

        {/* Tag Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterButtonsContainer}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[styles.filterButton, activeFilter === filter.value && styles.filterButtonActive]}
              onPress={() => setActiveFilter(filter.value)}
            >
              <Text style={[styles.filterButtonText, activeFilter === filter.value && styles.filterButtonTextActive]}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Time Filter Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity onPress={() => setShowTimeDropdown(!showTimeDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>Time: {TIME_OPTIONS.find(t => t.value === activeTime)?.label}</Text>
            <Ionicons name={showTimeDropdown ? "chevron-up" : "chevron-down"} size={18} color="#1B6B63" />
          </TouchableOpacity>
          {showTimeDropdown && (
            <View style={styles.dropdownList}>
              {TIME_OPTIONS.map(option => (
                <TouchableOpacity key={option.value.toString()} onPress={() => { setActiveTime(option.value.toString()); setShowTimeDropdown(false); }}>
                  <Text style={styles.dropdownItem}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Location Filter Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity onPress={() => setShowLocationDropdown(!showLocationDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>Location: {activeLocation}</Text>
            <Ionicons name={showLocationDropdown ? "chevron-up" : "chevron-down"} size={18} color="#1B6B63" />
          </TouchableOpacity>
          {showLocationDropdown && (
            <View style={styles.dropdownList}>
              {locations.map(loc => (
                <TouchableOpacity key={loc} onPress={() => { setActiveLocation(loc); setShowLocationDropdown(false); }}>
                  <Text style={styles.dropdownItem}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Opportunities Display */}
        {loading ? (
          <ActivityIndicator size="large" color="#1B6B63" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={{ textAlign: "center", marginTop: 40, color: "#C44536" }}>{error}</Text>
        ) : filteredOpportunities.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 40, color: "#999" }}>No opportunities found.</Text>
        ) : (
          filteredOpportunities.map((opp) => (
            <View style={styles.opportunityCard} key={opp.opportunityId}>
              <Text style={styles.opportunityCardTitle}>{opp.title}</Text>
              <Text style={styles.opportunityCardSubtitle}>{opp.timings}</Text>
              {opp.location && (
                <Text style={styles.opportunityCardDetails}><Ionicons name="location-outline" size={15} color="#1B6B63" /> {opp.location}</Text>
              )}
              <Text style={styles.opportunityCardDescription}>{opp.description}</Text>
              {hasApplied(opp.opportunityId) && (
                <Text style={{ color: "#1B6B63", fontWeight: "bold", marginBottom: 4 }}>Status: {getApplicationStatus(opp.opportunityId)}</Text>
              )}
              <TouchableOpacity style={styles.detailsButton} onPress={() => handleDetails(opp)}>
                <Text style={styles.detailsButtonText}>Details</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};


// Styles remain unchanged
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
    backgroundColor: "#FFFFFF",
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
  searchButton: {
    marginLeft: 6,
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
    marginBottom: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  opportunityCardDescription: {
    color: "#444",
    fontSize: 14,
    marginTop: 6,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 4,
  },
  tag: {
    backgroundColor: "#F4A941",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  detailsButton: {
    alignSelf: "flex-end",
    backgroundColor: "#1B6B63",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginTop: 6,
  },
  detailsButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  // New styles for dropdowns
  dropdownContainer: {
    marginBottom: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    marginBottom: 4,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1B6B63',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
  },
  dropdownItem: {
    paddingVertical: 6,
    fontSize: 15,
    color: '#2E2E2E',
  },
});

export default OpportunitiesScreen;

/*
  CHANGES MADE:
  - When mapping opportunities from backend, ensured all fields have default values (empty string or empty array).
  - When navigating to OpportunityDetails, only pass the minimal required fields (id, title, organization, timing, date, location, description, tags), matching the logic in VolunteerScreen.tsx.
  - Added comments to explain the changes.
*/
