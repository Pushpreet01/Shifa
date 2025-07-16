// app/SettingsScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HeroBox from "../../components/HeroBox";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { SettingsStackParamList } from "../../navigation/AppNavigator";
import { deleteCurrentUserAndData } from '../../services/firebaseUserService';

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList & { Login: undefined }>;

const SettingsScreen = () => {
  const { signOut } = useAuth();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [deleting, setDeleting] = React.useState(false);

  const handleOptionPress = (option: string) => {
    switch (option) {
      case "Profile":
        navigation.navigate("Profile");
        break;
      case "Feedback":
        navigation.navigate("Feedback");
        break;
      case "About Us":
        navigation.navigate("AboutUs");
        break;
      default:
        console.log(`${option} pressed`);
    }
  };

  const settingsOptions = [
    {
      title: "Account",
      icon: "person-circle-outline" as const,
      items: [
        {
          name: "Profile",
          icon: "person-outline" as const,
          description: "View and edit your profile information"
        },
        {
          name: "Privacy",
          icon: "shield-checkmark-outline" as const,
          description: "Manage your privacy settings"
        },
        {
          name: "Security",
          icon: "lock-closed-outline" as const,
          description: "Update your security preferences"
        },
        {
          name: "Notifications",
          icon: "notifications-outline" as const,
          description: "Customize your notification preferences"
        }
      ]
    },
    {
      title: "Support & Info",
      icon: "information-circle-outline" as const,
      items: [
        {
          name: "Feedback",
          icon: "chatbox-outline" as const,
          description: "Share your thoughts with us"
        },
        {
          name: "Help Center",
          icon: "help-circle-outline" as const,
          description: "Get help and support"
        },
        {
          name: "About Us",
          icon: "heart-outline" as const,
          description: "Learn more about Shifa"
        }
      ]
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteCurrentUserAndData();
              setDeleting(false);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              setDeleting(false);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBox title="Settings" showBackButton customBackRoute="Home" />

        {settingsOptions.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon} size={24} color="#1B6B63" />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.optionButton}
                onPress={() => handleOptionPress(item.name)}
              >
                <View style={styles.optionLeft}>
                  <Ionicons name={item.icon} size={22} color="#1B6B63" />
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{item.name}</Text>
                    <Text style={styles.optionDescription}>{item.description}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward-outline" size={20} color="#1B6B63" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.accountActions}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDeleteAccount} 
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
                <Text style={styles.deleteText}>Delete Account</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
    paddingBottom: 120,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B6B63",
    marginLeft: 10,
  },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: "#2E2E2E",
    fontWeight: "500",
  },
  optionDescription: {
    fontSize: 13,
    color: "#666666",
    marginTop: 2,
  },
  accountActions: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C44536",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#B00020',
    padding: 15,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SettingsScreen;
