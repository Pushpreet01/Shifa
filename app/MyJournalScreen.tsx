import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { getUserJournals } from "../services/firebaseJournalService";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

const MyJournalsScreen = () => {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const data = await getUserJournals();
        setJournals(data);
      } catch (err) {
        console.error("Error loading journals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJournals();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#527754"
        style={{ marginTop: 100 }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={26} color="#3A7D44" />
      </TouchableOpacity>

      <Text style={styles.header}>My Journal Entries</Text>

      {journals.length === 0 ? (
        <Text style={styles.emptyMessage}>No journal entries found.</Text>
      ) : (
        <FlatList
          data={journals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.entry}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.date}>
                {item.createdAt?.toDate?.().toLocaleString?.() || "No Date"}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#F8F5E9",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3A7D44",
    marginBottom: 20,
    textAlign: "center",
  },
  entry: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  body: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  backBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#888",
    marginTop: 40,
  },
});

export default MyJournalsScreen;
