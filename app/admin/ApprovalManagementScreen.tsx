import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ApprovalItem = {
  id: string;
  type: 'event' | 'volunteer';
  status: 'pending' | 'approved' | 'denied';
  title: string;
  userName: string;
  date: string;
};

const ApprovalManagementScreen = () => {
  const [activeTab, setActiveTab] = useState<'event' | 'volunteer'>('event');

  // Placeholder data
  const eventApprovals: ApprovalItem[] = [
    {
      id: '1',
      type: 'event',
      status: 'pending',
      title: 'Mental Health Workshop',
      userName: 'Sarah Johnson',
      date: '2024-03-15',
    },
    {
      id: '2',
      type: 'event',
      status: 'pending',
      title: 'Support Group Meeting',
      userName: 'Michael Chen',
      date: '2024-03-16',
    },
    {
      id: '3',
      type: 'event',
      status: 'pending',
      title: 'Wellness Seminar',
      userName: 'Emily Davis',
      date: '2024-03-17',
    },
  ];

  const volunteerApprovals: ApprovalItem[] = [
    {
      id: '4',
      type: 'volunteer',
      status: 'pending',
      title: 'Crisis Helpline Volunteer',
      userName: 'David Wilson',
      date: '2024-03-15',
    },
    {
      id: '5',
      type: 'volunteer',
      status: 'pending',
      title: 'Community Outreach',
      userName: 'Lisa Anderson',
      date: '2024-03-16',
    },
    {
      id: '6',
      type: 'volunteer',
      status: 'pending',
      title: 'Support Group Facilitator',
      userName: 'James Taylor',
      date: '2024-03-17',
    },
  ];

  const approvalItems = activeTab === 'event' ? eventApprovals : volunteerApprovals;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroBox}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Approvals</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'event' && styles.activeTab]}
          onPress={() => setActiveTab('event')}
        >
          <Text style={[styles.tabText, activeTab === 'event' && styles.activeTabText]}>
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'volunteer' && styles.activeTab]}
          onPress={() => setActiveTab('volunteer')}
        >
          <Text style={[styles.tabText, activeTab === 'volunteer' && styles.activeTabText]}>
            Volunteers
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {approvalItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pending approvals</Text>
          </View>
        ) : (
          approvalItems.map((item) => (
            <View key={item.id} style={styles.approvalCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.timestamp}>{item.date}</Text>
              </View>
              <Text style={styles.userName}>By: {item.userName}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => console.log('Approve:', item.id)}
                >
                  <Ionicons name="checkmark-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.denyButton]}
                  onPress={() => console.log('Deny:', item.id)}
                >
                  <Ionicons name="close-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Deny</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroBox: {
    backgroundColor: '#FDF6EC',
    paddingTop: 40,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1B6B63',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#1B6B63',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  approvalCard: {
    backgroundColor: '#FDF6EC',
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B6B63',
    flex: 1,
  },
  timestamp: {
    fontSize: 14,
    color: '#666666',
  },
  userName: {
    fontSize: 14,
    color: '#444444',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#1B6B63',
  },
  denyButton: {
    backgroundColor: '#C44536',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ApprovalManagementScreen; 