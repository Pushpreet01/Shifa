/**
 * CounsellingScreen Component
 * 
 * A comprehensive directory of Muslim counselors and mental health professionals.
 * Provides contact information, specialties, and direct links to counseling
 * services with an interactive card-based interface.
 * 
 * Features:
 * - Professional directory listing
 * - Expandable contact cards
 * - Direct phone dialing
 * - Website linking
 * - Animated transitions
 * - Responsive layout
 * 
 * States:
 * - expandedIndices: Tracks which cards are expanded
 * - animations: Animation values for smooth transitions
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Animated,
  Linking,
} from "react-native";
import HeroBox from "../../components/HeroBox";
import { Ionicons } from "@expo/vector-icons";

const CounsellingScreen = ({ navigation }) => {
  // Counselor directory data
  const counselors = [
    {
      name: "Amal Souraya",
      title: "Registered Counselling Psychologist",
      organization: "Inner Strength Counselling",
      phone: "(855) 908 3843",
      website: "http://www.inner-strength.ca/",
    },
    {
      name: "Marwa Fadol",
      title: "Registered Counselling Psychologist",
      organization: "Lantern Psychology and Consulting",
      phone: "(587) 414 6165",
    },
    {
      name: "Salma Mohiuddin",
      title: "Registered Social Worker",
      organization: "Salam Therapy",
      phone: "(825) 258-5956",
      website: "https://www.salamtherapy.com/",
    },
    {
      name: "Rabab Mukred",
      title: "Registered Provisional Psychologist",
      organization: "Vivid Psychology",
      phone: "(587) 907-8057",
      website: "https://www.vividpsychology.com/therapy-staff-biographies/rabab",
    },
    {
      name: "Dr. Al-Noor Mawani",
      title: "Registered Clinical Psychologist",
      organization: "Dr. Al-Noor Mawani & Associates",
      phone: "(844) 311 4875",
      website: "http://www.drmawani.ca/",
    },
    {
      name: "Reem Khawar",
      title: "Registered Provisional Psychologist",
      organization: "Clearview Counselling",
      phone: "(825) 435-1033",
      website: "https://clearviewcounselling.janeapp.com/#/staff_member/3",
    },
    {
      name: "Sadique Pathan",
      title: "Registered Social Worker and Imam",
      organization: "Edmonton, AB",
      phone: "(825) 250-3352",
      website: "https://www.psychologytoday.com/ca/therapists/sadique-ahmed-pathan-edmonton-ab/863246",
    },
    {
      name: "Mahdi Qasqas",
      title: "Registered Psychologist",
      organization: "Qasqas Counselling",
      phone: "(780) 809-8668",
      website: "http://qasqas.com/",
    },
    {
      name: "Islamic Family & Social Services Association",
      title: "Counselling Services",
      organization: "IFSSA (Edmonton, AB)",
      website: "https://www.ifssa.ca/counselling",
    },
    {
      name: "Canadian Muslim Counselling",
      title: "Islamically Integrated Counselling",
      organization: "Toronto, ON",
      email: "info@muslimcounselling.ca",
      website: "https://canadianmuslimcounselling.janeapp.com/",
    },
    {
      name: "Khalil Centre",
      title: "Counselling Services",
      organization: "Toronto, ON",
      website: "https://khalilcenter.com/request-appointment",
    },
  ];

  // State Management
  const [expandedIndices, setExpandedIndices] = useState([]);
  const [animations] = useState(
    counselors.map(() => new Animated.Value(0))
  );

  /**
   * Handles card expansion/collapse
   * Manages animation state for smooth transitions
   * @param index - Index of card to toggle
   */
  const toggleCard = (index) => {
    const isExpanded = expandedIndices.includes(index);
    const newExpandedIndices = isExpanded
      ? expandedIndices.filter((i) => i !== index)
      : [...expandedIndices, index];

    setExpandedIndices(newExpandedIndices);

    // Animate card expansion/collapse
    Animated.timing(animations[index], {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  /**
   * Renders expandable details section
   * Includes contact information and links
   * @param counselor - Counselor data
   * @param index - Index for animation tracking
   */
  const renderDetails = (counselor, index) => {
    const height = animations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, counselor.website ? 120 : 100],
    });

    return (
      <Animated.View style={[styles.detailsContainer, { height }]}>
        <Text style={styles.buttonSubText}>{counselor.title}</Text>
        <Text style={styles.buttonSubText}>{counselor.organization}</Text>
        {/* Phone Link */}
        {counselor.phone && (
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${counselor.phone.replace(/\D/g, '')}`)}>
            <Text style={[styles.buttonSubText, styles.websiteText]}>
              {counselor.phone}
            </Text>
          </TouchableOpacity>
        )}
        {/* Email Display */}
        {counselor.email && (
          <Text style={styles.buttonSubText}>{counselor.email}</Text>
        )}
        {/* Website Link */}
        {counselor.website && (
          <TouchableOpacity onPress={() => Linking.openURL(counselor.website)}>
            <Text style={[styles.buttonSubText, styles.websiteText]}>
              Visit Website
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBox
          title="Counselling"
          showBackButton={true}
          customBackRoute="Resources"
        />

        {/* Featured Image Section */}
        <View style={styles.imageWrapper}>
          <Image
            source={require("../../assets/aiplaceholder.png")}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Information Header */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Need Counselling?</Text>
          <Text style={styles.infoText}>We are happy to help you!</Text>
        </View>

        {/* Counselor Directory */}
        {counselors.map((counselor, index) => (
          <TouchableOpacity
            key={index}
            style={styles.contactButton}
            onPress={() => toggleCard(index)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              {/* Card Main Content */}
              <View style={styles.mainContent}>
                <Ionicons name="person-outline" size={20} color="#1B6B63" />
                <View style={styles.textContainer}>
                  <Text style={styles.buttonText}>{counselor.name}</Text>
                  {renderDetails(counselor, index)}
                </View>
                {/* Expand/Collapse Indicator */}
                {!expandedIndices.includes(index) && (
                  <View style={styles.arrowButton}>
                    <Ionicons name="chevron-forward" size={20} color="#1B6B63" />
                  </View>
                )}
              </View>
              {/* Close Button for Expanded State */}
              {expandedIndices.includes(index) && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => toggleCard(index)}
                >
                  <Ionicons name="close-outline" size={20} color="#1B6B63" />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles: Defines the visual appearance of the counselling screen
const styles = StyleSheet.create({
  // Container styles
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EC", // Warm background color
  },
  container: {
    paddingBottom: 140, // Extra padding for comfortable scrolling
    alignItems: "center",
  },
  
  // Image section styles
  imageWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 2,
    marginTop: 20,
    width: "75%",
    // Image container elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E0F2F1", // Light teal border
  },
  image: {
    width: "100%",
    height: 190,
    borderRadius: 18,
  },
  
  // Info box styles
  infoBox: {
    backgroundColor: "#F-PCE9C8", // Light orange background
    borderRadius: 30,
    padding: 20,
    marginTop: 30,
    width: "85%",
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B6B63", // Teal color for consistency
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#1B6B63",
  },
  
  // Contact button styles
  contactButton: {
    backgroundColor: "#FCE9C8", // Light orange background
    marginTop: 20,
    width: "85%",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    // Button elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "visible",
  },
  cardContent: {
    position: "relative",
    flexDirection: "column",
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  
  // Text styles
  textContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#1B6B63",
  },
  buttonSubText: {
    fontSize: 14,
    color: "#1B6B63",
    marginTop: 4,
    lineHeight: 20,
    fontWeight: "500",
  },
  websiteText: {
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  
  // Animation container styles
  detailsContainer: {
    marginTop: 8,
    overflow: "hidden",
  },
  
  // Button styles
  closeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    padding: 5,
  },
  arrowButton: {
    position: "absolute",
    top: -10,
    right: -10,
    padding: 5,
  },
});

export default CounsellingScreen;