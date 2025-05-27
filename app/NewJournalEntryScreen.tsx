import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

const NewJournalEntryScreen = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const saveJournal = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Error", "You must be logged in.");

    try {
      await addDoc(collection(db, "journals"), {
        userId: user.uid,
        title,
        body,
        createdAt: serverTimestamp(),
      });
      Alert.alert("Success", "Your journal entry has been saved.");
      setTitle("");
      setBody("");
    } catch (err) {
      console.error("Error saving journal:", err);
      Alert.alert("Error", "Failed to save entry.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Journal</Text>
      <View style={styles.notebook}>
        <TextInput
          style={styles.titleInput}
          placeholder="Enter Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.bodyInput}
          placeholder="How Are You Feeling Today?"
          multiline
          value={body}
          onChangeText={setBody}
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={saveJournal}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f3ec", alignItems: "center", padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#416d3e" },
  notebook: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
    elevation: 4
  },
  titleInput: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
    marginBottom: 15,
  },
  bodyInput: {
    height: 150,
    textAlignVertical: "top",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#416d3e",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  saveButtonText: { color: "#fff", fontSize: 16 },
});

export default NewJournalEntryScreen;
