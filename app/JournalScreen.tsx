import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";

const JournalScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="chevron-back-outline" size={24} color="#3A7D44" />
      </TouchableOpacity>

      <Text style={styles.header}>Journal</Text>

      <Image
        source={require("../assets/journalcover.png")}
        style={styles.journalImage}
        resizeMode="contain"
      />

      <Text style={styles.label}>My Journal</Text>

      {/* Unified Button Container */}
      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={styles.openButton}
          onPress={() => navigation.navigate("NewJournalEntryScreen")}
        >
          <Text style={styles.openButtonText}>Open</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => navigation.navigate("MyJournalsScreen")}
        >
          <Text style={styles.viewText}>View My Entries</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
    backgroundColor: "#f7f3ec",
  },
  backBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#416d3e",
  },
  journalImage: {
    height: Dimensions.get("window").height * 0.6 ,
    width: Dimensions.get("window").width * 0.9,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#2b4d2c",
  },
  buttonArea: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  openButton: {
    backgroundColor: "#416d3e",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  openButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  viewBtn: {
    padding: 8,
  },
  viewText: {
    color: "#527754",
    textDecorationLine: "underline",
    fontSize: 14,
  },
});

export default JournalScreen;
