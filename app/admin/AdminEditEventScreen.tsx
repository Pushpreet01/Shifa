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

const AdminEditEventScreen = () => {
    const route = useRoute<any>();
    const { eventId } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [event, setEvent] = useState<any>(null);
    const [opportunity, setOpportunity] = useState<any>(null);

    // Editable fields
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [needsVolunteers, setNeedsVolunteers] = useState(false);

    // Opportunity fields
    const [noVolunteersNeeded, setNoVolunteersNeeded] = useState(1);
    const [timings, setTimings] = useState('');
    const [rewards, setRewards] = useState('');
    const [refreshments, setRefreshments] = useState('');

    // Fetch event and opportunity
    const fetchData = async () => {
        setLoading(true);
        try {
            const eventData = await adminEventService.getEventById(eventId);
            if (!eventData) {
                Alert.alert('Error', 'Event not found');
                setLoading(false);
                return;
            }
            setEvent(eventData);
            setTitle(eventData.title || '');
            setDate(eventData.date?.toDate ? eventData.date.toDate() : new Date(eventData.date));
            setStartTime(eventData.startTime || '');
            setEndTime(eventData.endTime || '');
            setLocation(eventData.location || '');
            setDescription(eventData.description || '');
            setNeedsVolunteers(!!eventData.needsVolunteers);
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

    useEffect(() => {
        fetchData();
    }, [eventId]);

    // Save handler
    const handleSave = async () => {
        setSaving(true);
        try {
            // Update event
            await adminEventService.updateEvent(eventId, {
                title,
                date,
                startTime,
                endTime,
                location,
                description,
                needsVolunteers,
            });
            // Update or create opportunity if needed
            if (needsVolunteers) {
                if (opportunity) {
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
                <Text style={styles.label}>Title</Text>
                <TextInput style={styles.input} value={title} onChangeText={setTitle} />

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
                />

                <View style={styles.switchRow}>
                    <Text style={styles.label}>Needs Volunteers</Text>
                    <Switch value={needsVolunteers} onValueChange={setNeedsVolunteers} />
                </View>

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
                        <TextInput style={styles.input} value={rewards} onChangeText={setRewards} />
                        <Text style={styles.label}>Refreshments</Text>
                        <TextInput style={styles.input} value={refreshments} onChangeText={setRefreshments} />
                    </>
                )}

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDF6EC',
    },
    formContainer: {
        padding: 20,
    },
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
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    sectionHeader: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#C44536',
        marginTop: 16,
        marginBottom: 8,
    },
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