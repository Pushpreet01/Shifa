import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { HomeStackParamList } from "../../navigation/AppNavigator";
import { saveJournalEntry, updateJournalEntry } from "../../services/firebaseJournalService";
import KeyboardAwareWrapper from "../../components/KeyboardAwareWrapper";

// 📦 Accepting entry from params
type ScreenRouteProp = RouteProp<HomeStackParamList, "NewJournalEntryScreen">;

const NewJournalEntryScreen = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const route = useRoute<ScreenRouteProp>();
  const entry = route.params?.entry;

  // 📝 Prefill if editing
  const [title, setTitle] = useState(entry?.title || "");
  const [body, setBody] = useState(entry?.body || "");

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Error", "Please fill in both title and content.");
      return;
    }

    try {
      if (entry?.id) {
        await updateJournalEntry(entry.id, title, body); // EDIT
        Alert.alert("Success", "Journal updated successfully.");
      } else {
        await saveJournalEntry(title, body); // NEW
        Alert.alert("Success", "Journal saved successfully.");
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error saving:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

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
          <Text style={styles.headerTitle}>
            {entry ? "Edit Entry" : "New Entry"}
          </Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Announcements")}
            >
              <Ionicons name="notifications-outline" size={24} color="#C44536" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sosWrapper}
              onPress={() => navigation.navigate("Emergency")}
            >
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <KeyboardAwareWrapper>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              placeholder="Give your entry a title..."
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              placeholderTextColor="#999999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>How are you feeling today?</Text>
            <TextInput
              placeholder="Express your thoughts and feelings..."
              value={body}
              onChangeText={setBody}
              multiline
              style={[styles.input, styles.textArea]}
              textAlignVertical="top"
              placeholderTextColor="#999999"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {entry ? "Update Entry" : "Save Entry"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAwareWrapper>
    </SafeAreaView>
  );
};

// ⏬ Keep your same styles
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: "#2E2E2E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  textArea: {
    height: 220,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#1B6B63",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default NewJournalEntryScreen;
