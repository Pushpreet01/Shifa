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
import {
  saveJournalEntry,
  updateJournalEntry,
} from "../../services/firebaseJournalService";
import KeyboardAwareWrapper from "../../components/KeyboardAwareWrapper";
import HeroBox from "../../components/HeroBox";
import ProfanityFilterService from "../../services/profanityFilterService";

type ScreenRouteProp = RouteProp<HomeStackParamList, "NewJournalEntryScreen">;

const MAX_CHAR_LIMITS = {
  title: 35, // Changed to characters
  body: 500, // Already in characters
};

const NewJournalEntryScreen = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const route = useRoute<ScreenRouteProp>();
  const entry = route.params?.entry;

  const [title, setTitle] = useState(entry?.title || "");
  const [body, setBody] = useState(entry?.body || "");

  const countChars = (text: string) => {
    return text.length; // Count individual characters
  };

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Error", "Please fill in both title and content.");
      return;
    }

    if (countChars(title) > MAX_CHAR_LIMITS.title) {
      Alert.alert(
        "Error",
        `Title exceeds character limit of ${MAX_CHAR_LIMITS.title}`
      );
      return;
    }

    if (countChars(body) > MAX_CHAR_LIMITS.body) {
      Alert.alert(
        "Error",
        `Content exceeds character limit of ${MAX_CHAR_LIMITS.body}`
      );
      return;
    }

    // Profanity filter check
    try {
      const [titleHasProfanity, bodyHasProfanity] = await Promise.all([
        ProfanityFilterService.hasProfanity(title),
        ProfanityFilterService.hasProfanity(body),
      ]);
      if (titleHasProfanity || bodyHasProfanity) {
        Alert.alert(
          "Inappropriate Content",
          "Your journal entry contains inappropriate language. Please revise it."
        );
        return;
      }
    } catch (error) {
      console.error("Error checking profanity:", error);
      Alert.alert(
        "Error",
        "Failed to check for inappropriate content. Please try again."
      );
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
      <HeroBox
        title={entry ? "Edit Entry" : "New Entry"}
        showBackButton={true}
      />
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
              maxLength={MAX_CHAR_LIMITS.title}
            />
            <Text style={styles.wordCount}>
              {countChars(title)}/{MAX_CHAR_LIMITS.title} words
            </Text>
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
              maxLength={MAX_CHAR_LIMITS.body}
            />
            <Text style={styles.wordCount}>
              {countChars(body)}/{MAX_CHAR_LIMITS.body} words
            </Text>
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
  wordCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "#1B6B63",
    marginTop: 4,
    marginBottom: 10,
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
