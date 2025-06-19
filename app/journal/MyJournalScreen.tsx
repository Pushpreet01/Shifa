import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { getUserJournals } from "../../services/firebaseJournalService";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { HomeStackParamList } from "../../navigation/AppNavigator";

const MyJournalsScreen = () => {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B6B63" />
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>My Entries</Text>
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

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.newEntryButton}
          onPress={() => navigation.navigate("NewJournalEntryScreen")}
        >
          <Text style={styles.newEntryButtonText}>New Entry</Text>
        </TouchableOpacity>

        {journals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyMessage}>No journal entries found.</Text>
            <Text style={styles.emptySubMessage}>Start your journaling journey by adding your first entry.</Text>
          </View>
        ) : (
          <FlatList
            data={journals}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View style={styles.entry}>
                <Text style={styles.entryTitle}>{item.title}</Text>
                <Text style={styles.entryBody}>{item.body}</Text>
                <Text style={styles.entryDate}>
                  {item.createdAt?.toDate?.().toLocaleString?.() || "No Date"}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF6EC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    padding: 20,
  },
  newEntryButton: {
    backgroundColor: "#1B6B63",
    borderRadius: 30,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  newEntryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 20,
  },
  entry: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#F4A941",
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 8,
  },
  entryBody: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
    lineHeight: 20,
  },
  entryDate: {
    fontSize: 12,
    color: "#999999",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyMessage: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubMessage: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default MyJournalsScreen;
