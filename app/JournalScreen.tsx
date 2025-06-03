import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

const JournalScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={26} color="#3A7D44" />
      </TouchableOpacity>

      <Text style={styles.header}>Journal</Text>

      <Image
        source={require("../assets/journalcover.png")}
        style={styles.journalImage}
        resizeMode="contain"
      />

      <Text style={styles.label}>My Journal</Text>

      <TouchableOpacity
        style={styles.openButton}
        onPress={() => navigation.navigate("NewJournalEntryScreen")}
      >
        <Text style={styles.openButtonText}>Open</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 30, backgroundColor: "#f7f3ec" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#416d3e" },
  journalImage: { height: 350, width: 350, marginBottom: 20 }, // reduced size
  label: { fontSize: 18, fontWeight: "600", marginBottom: 20 },
  openButton: {
    backgroundColor: "#416d3e",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  openButtonText: { color: "#fff", fontSize: 16 },
  backBtn: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
});

export default JournalScreen;
