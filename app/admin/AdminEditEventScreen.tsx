/**
 * AdminEditEventScreen Component
 * 
 * A detailed form interface for administrators to edit existing events and their
 * associated volunteer opportunities. Provides comprehensive event management with
 * character limits and validation.
 * 
 * Features:
 * - Event details editing (title, date, time, location, description)
 * - Volunteer opportunity management
 * - Character limit validation
 * - Real-time character counting
 * - Loading and saving states
 * 
 * Navigation Parameters:
 * - eventId: ID of the event to edit
 * 
 * States:
 * - loading: Initial data loading indicator
 * - saving: Save operation indicator
 * - event: Current event data
 * - opportunity: Associated volunteer opportunity data
 * - Form fields: title, date, startTime, endTime, location, description, needsVolunteers
 * - Opportunity fields: noVolunteersNeeded, timings, rewards, refreshments
 */

import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    SafeAreaView,
    Switch,
    ActivityIndicator,
} from "react-native";
import { useRoute } from '@react-navigation/native';
import AdminHeroBox from '../../components/AdminHeroBox';
import * as adminEventService from '../../services/adminEventService';
import FirebaseOpportunityService from '../../services/FirebaseOpportunityService';

// Character limits for form fields
const MAX_CHAR_LIMITS = {
  title: 30,
  description: 500,
  rewards: 100,
  refreshments: 100,
};

const AdminEditEventScreen = () => {
    const route = useRoute<any>();
    const { eventId } = route.params || {};

    // Loading and data states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [event, setEvent] = useState<any>(null);
    const [opportunity, setOpportunity] = useState<any>(null);

    // Event form fields
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [needsVolunteers, setNeedsVolunteers] = useState(false);

    // Volunteer opportunity form fields
    const [noVolunteersNeeded, setNoVolunteersNeeded] = useState(1);
    const [timings, setTimings] = useState('');
    const [rewards, setRewards] = useState('');
    const [refreshments, setRefreshments] = useState('');

    /**
     * Counts characters in a text field
     * Used for character limit validation
     * @param text - Text to count characters in
     */
    const countChars = (text: string) => {
      return text.length;
    };

    /**
     * Fetches event and associated opportunity data
     * Initializes form fields with fetched data
     */
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch event details
            const eventData = await adminEventService.getEventById(eventId);
            if (!eventData) {
                Alert.alert('Error', 'Event not found');
                setLoading(false);
                return;
            }
            setEvent(eventData);

            // Initialize event form fields
            setTitle(eventData.title || '');
            setDate(eventData.date?.toDate ? eventData.date.toDate() : new Date(eventData.date));
            setStartTime(eventData.startTime || '');
            setEndTime(eventData.endTime || '');
            setLocation(eventData.location || '');
            setDescription(eventData.description || '');
            setNeedsVolunteers(!!eventData.needsVolunteers);

            // Fetch and initialize opportunity data if needed
            if (eventData.needsVolunteers) {
                const opp = await FirebaseOpportunityService.getOpportunityByEventId(eventId);
                if (opp) {
                    setOpportunity(opp);
                    setNoVolunteersNeeded(opp.noVolunteersNeeded || 1);
                    setTimings(opp.timings || '');
                    setRewards(opp.rewards || '');
                    setRefreshments(opp.refreshments || '');
                } else {
                    setOpportunity(null);
                }
            } else {
                setOpportunity(null);
            }
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount and when eventId changes
    useEffect(() => {
        fetchData();
    }, [eventId]);

    /**
     * Handles form submission
     * Validates character limits and updates event and opportunity data
     */
    const handleSave = async () => {
        setSaving(true);
        try {
            // Validate character limits for all fields
            if (countChars(title) > MAX_CHAR_LIMITS.title) {
              Alert.alert(`Error`, `Title exceeds character limit of ${MAX_CHAR_LIMITS.title}.`);
              setSaving(false);
              return;
            }
            if (countChars(description) > MAX_CHAR_LIMITS.description) {
              Alert.alert(`Error`, `Description exceeds character limit of ${MAX_CHAR_LIMITS.description}.`);
              setSaving(false);
              return;
            }
            if (countChars(rewards) > MAX_CHAR_LIMITS.rewards) {
              Alert.alert(`Error`, `Rewards exceeds character limit of ${MAX_CHAR_LIMITS.rewards}.`);
              setSaving(false);
              return;
            }
            if (countChars(refreshments) > MAX_CHAR_LIMITS.refreshments) {
              Alert.alert(`Error`, `Refreshments exceeds character limit of ${MAX_CHAR_LIMITS.refreshments}.`);
              setSaving(false);
              return;
            }

            // Update event details
            await adminEventService.updateEvent(eventId, {
                title,
                date,
                startTime,
                endTime,
                location,
                description,
                needsVolunteers,
            });

            // Handle volunteer opportunity updates
            if (needsVolunteers) {
                if (opportunity) {
                    // Update existing opportunity
                    await FirebaseOpportunityService.updateOpportunity(opportunity.opportunityId, {
                        noVolunteersNeeded,
                        timings,
                        rewards,
                        refreshments,
                    });
                } else {
                    // Create new opportunity
                    await FirebaseOpportunityService.createOpportunity({
                        opportunityId: `${eventId}_opportunity`,
                        eventId,
                        title,
                        noVolunteersNeeded,
                        description,
                        timings,
                        location,
                        rewards,
                        refreshments,
                    });
                }
            }
            Alert.alert('Success', 'Event updated successfully');
            await fetchData(); // Refresh data
        } catch (err) {
            Alert.alert('Error', 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    // Loading state display
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <AdminHeroBox title="Edit Event" showBackButton customBackRoute="Events" />
                <ActivityIndicator size="large" color="#1B6B63" style={{ marginTop: 40 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <AdminHeroBox title="Edit Event" showBackButton customBackRoute="Events" />
            <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 130 }}>
                {/* Event Details Section */}
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={MAX_CHAR_LIMITS.title}
                />
                <Text style={styles.charCount}>
                  {countChars(title)}/{MAX_CHAR_LIMITS.title}
                </Text>

                <Text style={styles.label}>Date</Text>
                <TextInput
                    style={styles.input}
                    value={date.toISOString().split('T')[0]}
                    onChangeText={d => setDate(new Date(d))}
                />

                <Text style={styles.label}>Start Time</Text>
                <TextInput
                    style={styles.input}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="e.g. 9:00 AM"
                />

                <Text style={styles.label}>End Time</Text>
                <TextInput
                    style={styles.input}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="e.g. 5:00 PM"
                />

                <Text style={styles.label}>Location</Text>
                <TextInput style={styles.input} value={location} onChangeText={setLocation} />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, { height: 80 }]}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    maxLength={MAX_CHAR_LIMITS.description}
                />
                <Text style={styles.charCount}>
                  {countChars(description)}/{MAX_CHAR_LIMITS.description}
                </Text>

                {/* Volunteer Toggle */}
                <View style={styles.switchRow}>
                    <Text style={styles.label}>Needs Volunteers</Text>
                    <Switch value={needsVolunteers} onValueChange={setNeedsVolunteers} />
                </View>

                {/* Volunteer Opportunity Section */}
                {needsVolunteers && (
                    <>
                        <Text style={styles.sectionHeader}>Opportunity Details</Text>
                        <Text style={styles.label}>Number of Volunteers Needed</Text>
                        <TextInput
                            style={styles.input}
                            value={String(noVolunteersNeeded)}
                            onChangeText={v => setNoVolunteersNeeded(Number(v))}
                            keyboardType="numeric"
                        />
                        <Text style={styles.label}>Timings</Text>
                        <TextInput style={styles.input} value={timings} onChangeText={setTimings} />
                        <Text style={styles.label}>Rewards</Text>
                        <TextInput
                            style={styles.input}
                            value={rewards}
                            onChangeText={setRewards}
                            maxLength={MAX_CHAR_LIMITS.rewards}
                        />
                        <Text style={styles.charCount}>
                          {countChars(rewards)}/{MAX_CHAR_LIMITS.rewards}
                        </Text>
                        <Text style={styles.label}>Refreshments</Text>
                        <TextInput
                            style={styles.input}
                            value={refreshments}
                            onChangeText={setRefreshments}
                            maxLength={MAX_CHAR_LIMITS.refreshments}
                        />
                        <Text style={styles.charCount}>
                          {countChars(refreshments)}/{MAX_CHAR_LIMITS.refreshments}
                        </Text>
                    </>
                )}

                {/* Save Button */}
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

// Styles: Defines the visual appearance of the event edit form
const styles = StyleSheet.create({
    // Container styles
    container: {
        flex: 1,
        backgroundColor: '#FDF6EC', // Warm background color
    },
    formContainer: {
        padding: 20,
    },
    
    // Form field styles
    label: {
        fontWeight: 'bold',
        color: '#1B6B63',
        marginBottom: 6,
        fontSize: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        backgroundColor: '#fff',
        fontSize: 15,
    },
    charCount: {
      alignSelf: 'flex-end',
      fontSize: 12,
      color: '#1B6B63', // Teal color to match other screens
      marginBottom: 16,
    },
    
    // Switch row styles
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    
    // Section header styles
    sectionHeader: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#C44536', // Highlight color for section headers
        marginTop: 16,
        marginBottom: 8,
    },
    
    // Save button styles
    saveButton: {
        backgroundColor: '#1B6B63',
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 24,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 17,
    },
});

export default AdminEditEventScreen;