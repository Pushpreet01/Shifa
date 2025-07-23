import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../navigation/AppNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeroBox from "../../components/HeroBox";

type Props = NativeStackScreenProps<HomeStackParamList, "Emergency">;

interface Contact {
  name: string;
  phone: string;
}

const EmergencyScreen: React.FC<Props> = ({ navigation }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const loadContacts = useCallback(async () => {
    try {
      const storedContacts = await AsyncStorage.getItem("emergency_contacts");
      if (storedContacts) {
        setContacts(JSON.parse(storedContacts));
      }
    } catch (error) {
      console.error("Failed to load contacts.", error);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const formatPhoneNumber = (input: string) => {
    const digits = input.replace(/\D/g, "");
    let formatted = digits;
    if (digits.length > 0) {
      formatted = `(${digits.substring(0, 3)}`;
    }
    if (digits.length >= 4) {
      formatted += `) ${digits.substring(3, 6)}`;
    }
    if (digits.length >= 7) {
      formatted += `-${digits.substring(6, 10)}`;
    }
    return formatted;
  };

  const saveContacts = async (newContacts: Contact[]) => {
    try {
      await AsyncStorage.setItem(
        "emergency_contacts",
        JSON.stringify(newContacts)
      );
      setContacts(newContacts);
    } catch (error) {
      console.error("Failed to save contacts.", error);
    }
  };

  const handleAddContact = () => {
    const digits = phone.replace(/\D/g, "");
    if (name.trim() && digits.length === 10) {
      const newContacts = [...contacts, { name, phone: digits }];
      saveContacts(newContacts);
      setModalVisible(false);
      setName("");
      setPhone("");
    } else {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid name and a 10-digit phone number."
      );
    }
  };

  const handleCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert("Error", "Unable to make phone calls from this device.");
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  const defaultContacts: Contact[] = [
    { name: "Community Hotline", phone: "988" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add New Contact</Text>
            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Phone Number"
              value={phone}
              onChangeText={(text) => setPhone(formatPhoneNumber(text))}
              keyboardType="phone-pad"
              style={styles.input}
              maxLength={14}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSave]}
                onPress={handleAddContact}
              >
                <Text style={styles.textStyle}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <HeroBox title="Emergency" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="list" size={60} color="#1B6B63" />
        </View>
        <Text style={styles.callListText}>Call List</Text>
        <View style={styles.separatorContainer}>
          <View style={styles.separatorDot}></View>
          <View style={styles.separatorLine}></View>
          <View style={styles.separatorDot}></View>
        </View>

        {defaultContacts.map((contact, index) => (
          <TouchableOpacity
            key={index}
            style={styles.emergencyButton}
            onPress={() => handleCall(contact.phone)}
          >
            <Text style={styles.emergencyButtonText}>{contact.name}</Text>
            <Ionicons name="call" size={24} color="#F4A941" />
          </TouchableOpacity>
        ))}

        {contacts.map((contact, index) => (
          <TouchableOpacity
            key={index}
            style={styles.emergencyButton}
            onPress={() => handleCall(contact.phone)}
          >
            <Text style={styles.emergencyButtonText}>{contact.name}</Text>
            <Ionicons name="call" size={24} color="#F4A941" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.addContactButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addContactButtonText}>Add Emergency Contact</Text>
          <MaterialIcons name="add-call" size={30} color="#ffffff" />
        </TouchableOpacity>
      </ScrollView>
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
    paddingLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 60,
    padding: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  callListText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B6B63",
    marginBottom: 20,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 30,
    marginTop: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1B6B63",
  },
  separatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1B6B63",
    marginHorizontal: 5,
  },
  emergencyButton: {
    flexDirection: "row",
    backgroundColor: "#EFF6F6",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  emergencyButtonText: {
    fontSize: 18,
    color: "#2E2E2E",
    fontWeight: "700",
  },
  addContactButton: {
    marginTop: 20,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B6B63",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  addContactButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "700",
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: "48%",
  },
  buttonClose: {
    backgroundColor: "#A9A9A9",
  },
  buttonSave: {
    backgroundColor: "#1B6B63",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default EmergencyScreen;
