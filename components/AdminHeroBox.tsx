import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface AdminHeroBoxProps {
  title: string;
  showBackButton?: boolean;
  customBackRoute?: string;
}

const AdminHeroBox: React.FC<AdminHeroBoxProps> = ({
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
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back-outline" size={24} color="#1B6B63" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{title}</Text>
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
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B6B63",
  },
});

export default AdminHeroBox;
