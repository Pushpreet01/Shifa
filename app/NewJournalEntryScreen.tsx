import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { saveJournalEntry } from "../services/firebaseJournalService";


const NewJournalEntryScreen = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

 const handleSave = async () => {
  try {
    await saveJournalEntry(title, body);
    Alert.alert("Success", "Journal saved successfully.");
    navigation.goBack();
  } catch (error) {
    console.error("Error saving:", error);
    Alert.alert("Error", error instanceof Error ? error.message : "Unknown error");
  }
};
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.wrapper}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back-outline" size={24} color="#3A7D44" />
        </TouchableOpacity>

        <Text style={styles.title}>New Journal Entry</Text>

        <TextInput
          placeholder="Enter Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="How Are You Feeling Today?"
          value={body}
          onChangeText={setBody}
          multiline
          style={[styles.input, styles.textArea]}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F5E9",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  backBtn: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3A7D44",
    textAlign: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  textArea: {
    height: 220,
  },
  button: {
    backgroundColor: "#527754",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NewJournalEntryScreen;
