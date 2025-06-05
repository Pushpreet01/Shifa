// components/HeroBox.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HeroBoxProps {
  title: string;
}

const HeroBox: React.FC<HeroBoxProps> = ({ title }) => (
  <View style={styles.heroBox}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerIcons}>
        <Ionicons name="notifications-outline" size={24} color="#C44536" />
        <View style={styles.sosWrapper}>
          <Text style={styles.sosText}>SOS</Text>
        </View>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  heroBox: {
    backgroundColor: "#F8F5E9",
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
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#3A7D44",
    marginLeft: 10,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  sosWrapper: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#C44536",
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sosText: {
    color: "#C44536",
    fontWeight: "bold",
  },
});

export default HeroBox;
