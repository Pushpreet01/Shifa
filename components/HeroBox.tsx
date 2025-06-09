import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

interface HeroBoxProps {
  title: string;
  showBackButton?: boolean;
  customBackRoute?: string;
}

const HeroBox: React.FC<HeroBoxProps> = ({
  title,
  showBackButton = false,
  customBackRoute,
}) => {
  const navigation = useNavigation<any>();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfileImage(
          userData.profileImage || require("../assets/image.png")
        );
      } else {
        setProfileImage(require("../assets/image.png"));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfileImage(require("../assets/image.png"));
    }
  };

  const handleProfilePress = () => {
    navigation.navigate("Settings", { screen: "Profile" });
  };

  return (
    <View style={styles.heroBox}>
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity
            onPress={() => {
              if (customBackRoute) {
                navigation.navigate(customBackRoute);
              } else {
                navigation.goBack();
              }
            }}
            style={styles.backButtonContainer}
          >
            <Ionicons name="chevron-back-outline" size={24} color="#1B6B63" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}

        <Text style={styles.headerTitle}>{title}</Text>

        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Announcements")}
          >
            <Ionicons name="notifications-outline" size={24} color="#C44536" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={handleProfilePress}
          >
            <Image
              source={
                profileImage
                  ? typeof profileImage === "string"
                    ? { uri: profileImage }
                    : profileImage
                  : require("../assets/image.png")
              }
              style={styles.profileImage}
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
  );
};

const styles = StyleSheet.create({
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
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B6B63",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  profileImageContainer: {
    marginLeft: 10,
    marginRight: 10,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#1B6B63",
  },
  sosWrapper: {
    backgroundColor: "#C44536",
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  sosText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default HeroBox;
