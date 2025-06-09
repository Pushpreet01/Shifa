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
import HeroBox from "../../components/HeroBox";
import { Ionicons } from "@expo/vector-icons";

const CounsellingScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBox
          title="Counselling"
          showBackButton={true}
          customBackRoute="ResourcesMain"
        />

        {/* Image Section */}
        <View style={styles.imageWrapper}>
          <Image
            source={require("../../assets/counselling-placeholder.jpg")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Need Counselling?</Text>
          <Text style={styles.infoText}>We are happy to help you !</Text>
        </View>

        {/* Counsellor Buttons */}
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="person-outline" size={20} color="#1B6B63" />
          <Text style={styles.buttonText}>Counsellor 1</Text>
          <Ionicons name="chevron-forward" size={20} color="#1B6B63" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="person-outline" size={20} color="#1B6B63" />
          <Text style={styles.buttonText}>Counsellor 2</Text>
          <Ionicons name="chevron-forward" size={20} color="#1B6B63" />
        </TouchableOpacity>
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
    paddingBottom: 100,
    alignItems: "center",
  },
  imageWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 150,
  },
  infoBox: {
    backgroundColor: "#FCE9C8",
    borderRadius: 30,
    padding: 20,
    marginTop: 30,
    width: "85%",
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B6B63",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#1B6B63",
  },
  contactButton: {
    backgroundColor: "#FCE9C8",
    marginTop: 20,
    width: "85%",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1B6B63",
  },
});

export default CounsellingScreen;
