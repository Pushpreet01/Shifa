import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

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

  const handleBack = () => {
    if (customBackRoute) {
      navigation.navigate(customBackRoute);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.heroBox}>
      <View style={styles.header}>
        {/* Left: Back Button */}
        {showBackButton ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButtonContainer}>
            <Ionicons name="chevron-back-outline" size={24} color="#1B6B63" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonContainer} />
        )}

        {/* Center: Title */}
        <Text style={styles.headerTitle}>{title}</Text>

        {/* Right: Icons */}
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate("Announcements")}>
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
  );
};

const styles = StyleSheet.create({
  heroBox: {
    backgroundColor: "#FDF6EC",
    paddingTop: Platform.OS === "android" ? 50 : 40,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    width: 40,
    alignItems: "flex-start",
  },
  headerTitle: {
    flex: 1,
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B6B63",
    textAlign: "center",
  },
  headerIcons: {
    width: 70,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
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
});

export default HeroBox;
