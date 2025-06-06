import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<HomeStackParamList, "OpportunityApplicationForm">;

const OpportunityApplicationFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const { title, description } = route.params;
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    aboutYourself: "",
  });

  const handleSubmit = () => {
    // Here you would typically submit the form data to your backend
    // For now, we'll just go back to the details screen
    navigation.goBack();
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
          <Text style={styles.headerTitle}>Application</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
              <Ionicons name="notifications-outline" size={24} color="#C44536" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sosWrapper} onPress={() => navigation.navigate('Emergency')}>
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tell us about Yourself</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Give us a short description about yourself."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={formData.aboutYourself}
              onChangeText={(text) => setFormData({ ...formData, aboutYourself: text })}
            />
          </View>

          <View style={styles.opportunityInfo}>
            <Text style={styles.opportunityTitle}>{title}</Text>
            <Text style={styles.opportunityDescription}>{description}</Text>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  formContainer: {
    padding: 20,
  },
  inputGroup: {
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  opportunityInfo: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  opportunityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginBottom: 8,
  },
  opportunityDescription: {
    fontSize: 14,
    color: "#2E2E2E",
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: "#1B6B63",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 35,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 15,
    marginBottom: 40,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default OpportunityApplicationFormScreen; 