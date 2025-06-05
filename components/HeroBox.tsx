import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface HeroBoxProps {
  title: string;
  showBackButton?: boolean;
  customBackRoute?: string;
}

const HeroBox: React.FC<HeroBoxProps> = ({ title, showBackButton = false, customBackRoute }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.heroBox}>
      <View style={styles.header}>
        {/* Left: Back Button + Title */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              onPress={() =>
                customBackRoute ? navigation.navigate(customBackRoute) : navigation.goBack()
              }
              style={styles.backIcon}
            >
              <Ionicons name="chevron-back" size={24} color="#1B6B63" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        {/* Right: Notifications + SOS */}
        <View style={styles.headerIcons}>
          <Ionicons name="notifications-outline" size={24} color="#F4A941" />
          <View style={styles.sosWrapper}>
            <Text style={styles.sosText}>SOS</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroBox: {
    backgroundColor: "#FDF6EC",
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
    width: "100%",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  backIcon: {
    marginRight: 10, 
    marginTop:4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B6B63",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  sosWrapper: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#F4A941",
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sosText: {
    color: "#F4A941",
    fontWeight: "bold",
  },
});

export default HeroBox;
