import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import AdminHeroBox from '../../components/AdminHeroBox';

type ApprovalItem = {
  id: string;
  type: 'event' | 'volunteer' | 'organizer';
  status: 'pending' | 'approved' | 'denied';
  title: string;
  userName: string;
  date: string;
};

const ApprovalManagementScreen = () => {
  const [activeTab, setActiveTab] = useState<'event' | 'volunteer' | 'organizer'>('event');

  const eventApprovals: ApprovalItem[] = [
    { id: '1', type: 'event', status: 'pending', title: 'Mental Health Workshop', userName: 'Sarah Johnson', date: '2024-03-15' },
    { id: '2', type: 'event', status: 'pending', title: 'Support Group Meeting', userName: 'Michael Chen', date: '2024-03-16' },
  ];

  const volunteerApprovals: ApprovalItem[] = [
    { id: '3', type: 'volunteer', status: 'pending', title: 'Community Outreach', userName: 'Lisa Anderson', date: '2024-03-17' },
  ];

  const organizerApprovals: ApprovalItem[] = [
    { id: '4', type: 'organizer', status: 'pending', title: 'Organizer Request', userName: 'Nina Patel', date: '2024-03-18' },
  ];

  const approvalItems = {
    event: eventApprovals,
    volunteer: volunteerApprovals,
    organizer: organizerApprovals,
  }[activeTab];

  const handleApprove = (id: string) => console.log('Approved:', id);
  const handleDeny = (id: string) => console.log('Denied:', id);

  const renderRightActions = (id: string) => (
    <View style={styles.verticalSwipeActions}>
      <TouchableOpacity
        style={[styles.swipeButton, styles.approveBtn]}
        onPress={() => handleApprove(id)}
      >
        <Ionicons name="checkmark-outline" size={20} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeButton, styles.denyBtn]}
        onPress={() => handleDeny(id)}
      >
        <Ionicons name="close-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <AdminHeroBox title="Approvals" showBackButton customBackRoute="AdminDashboard" />

        <View style={styles.tabContainer}>
          {['event', 'volunteer', 'organizer'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.tab, activeTab === type && styles.activeTab]}
              onPress={() => setActiveTab(type as any)}
            >
              <Text style={[styles.tabText, activeTab === type && styles.activeTabText]}>
                {type === 'event'
                  ? 'Events'
                  : type === 'volunteer'
                  ? 'Volunteers'
                  : 'Event Organizers'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.content}>
          {approvalItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No pending approvals</Text>
            </View>
          ) : (
            approvalItems.map((item) => (
              <Swipeable key={item.id} renderRightActions={() => renderRightActions(item.id)}>
                <View style={styles.approvalCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.timestamp}>{item.date}</Text>
                  </View>
                  <Text style={styles.userName}>By: {item.userName}</Text>
                </View>
              </Swipeable>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6EC' },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FDF6EC',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#1B6B63',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: { flex: 1, paddingTop: 12 },
  approvalCard: {
    backgroundColor: '#FDF6EC',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B6B63',
  },
  timestamp: {
    fontSize: 13,
    color: '#666',
  },
  userName: {
    fontSize: 14,
    color: '#444',
  },
  verticalSwipeActions: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  swipeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: '#1B6B63',
  },
  denyBtn: {
    backgroundColor: '#C44536',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default ApprovalManagementScreen;
