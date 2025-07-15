import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";
import { doc, addDoc, collection } from "firebase/firestore";
import { db, auth } from "../../config/firebaseConfig";
import StarRating from "../../components/StarRating";
import KeyboardAwareWrapper from "../../components/KeyboardAwareWrapper";
import ProfanityFilterService from "../../services/profanityFilterService";

type Props = NativeStackScreenProps<SettingsStackParamList, "Feedback">;

const FeedbackScreen: React.FC<Props> = ({ navigation }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Please give a rating to submit your feedback");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (comment.trim()) {
        const hasProfanity = await ProfanityFilterService.hasProfanity(comment);
        if (hasProfanity) {
          Alert.alert(
            "Inappropriate Content Detected",
            "Your feedback contains inappropriate language. Please revise it before submitting."
          );
          setIsSubmitting(false);
          return;
        }
      }

      await addDoc(collection(db, "feedback"), {
        userId: user.uid,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        "Thank You!",
        "Your feedback has been submitted successfully.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Error", "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          <Text style={styles.headerTitle}>Feedback</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Announcements")}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#C44536"
              />
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
        <View style={styles.content}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>
              How would you rate your experience?
            </Text>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size={45}
              starColor="#F4A941"
              inactiveStarColor="#D1D1D1"
            />
            <Text style={styles.ratingValue}>
              {rating > 0
                ? `${rating.toFixed(1)} / 5.0`
                : "Tap or slide to rate"}
            </Text>
          </View>

          <View style={styles.commentContainer}>
            <Text style={styles.commentTitle}>Additional Comments</Text>
            <TextInput
              style={styles.commentInput}
              multiline
              numberOfLines={6}
              placeholder="Tell us what you think..."
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 16,
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
    padding: 20,
  },
  ratingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginBottom: 20,
  },
  ratingValue: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  commentContainer: {
    marginTop: 20,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2E2E2E",
    marginBottom: 10,
  },
  commentInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 12,
    fontSize: 16,
    color: "#2E2E2E",
    height: 120,
  },
  submitButton: {
    backgroundColor: "#F4A941",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 30,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default FeedbackScreen;
