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

const AwarenessScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBox
          title="Awareness"
          showBackButton={true}
          customBackRoute="ResourcesMain"
        />

        {/* Image placeholder */}
        <View style={styles.imageWrapper}>
          <Image
            source={require("../../assets/awareness-placeholder.jpg")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Intro Text Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>View our Educational Resources</Text>
        </View>

        {/* Resource Buttons */}
        <TouchableOpacity style={styles.resourceButton}>
          <Text style={styles.buttonText}>Suicide Awareness</Text>
          <Ionicons name="chevron-forward" size={20} color="#1B6B63" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.resourceButton}>
          <Text style={styles.buttonText}>Toolkits & Guides</Text>
          <Ionicons name="chevron-forward" size={20} color="#1B6B63" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.resourceButton}>
          <Text style={styles.buttonText}>Parenting and Youth Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#1B6B63" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.resourceButton}>
          <Text style={styles.buttonText}>About Mental Health</Text>
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
    height: 140,
  },
  infoBox: {
    backgroundColor: "#E0F2F1",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginTop: 30,
    width: "85%",
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B6B63",
    textAlign: "center",
  },
  resourceButton: {
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

export default AwarenessScreen;
