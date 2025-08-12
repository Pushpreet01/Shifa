import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SuperAdminStackParamList } from '../../types/navigation';
import { useNavigation } from '@react-navigation/native';
import { createAdminUser } from '../../services/firebaseUserService';
import { Ionicons } from '@expo/vector-icons';

// This function should be implemented in the service layer
// It should create a Firebase Auth user and a Firestore user document with role 'Admin'

const CreateAdminScreen: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<SuperAdminStackParamList, 'CreateAdmin'>>();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleCreate = async () => {
        if (!fullName || !email || !phoneNumber || !password) {
            Alert.alert('All fields are required');
            return;
        }
        if (phoneNumber.length !== 10) {
            Alert.alert('Phone number must be 10 digits');
            return;
        }
        setLoading(true);
        try {
            await createAdminUser({ fullName, email, phoneNumber, password });
            Alert.alert('Success', 'Admin created successfully');
            navigation.navigate('SuperAdminDashboard');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create New Admin</Text>
            <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
            />
            <View style={styles.passwordInputContainer}>
                <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#888" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.createButton} onPress={handleCreate} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createButtonText}>Create Admin</Text>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
    input: { backgroundColor: '#F4F4F4', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 16 },
    createButton: { backgroundColor: '#1B6B63', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F4F4',
        borderRadius: 8,
        marginBottom: 16,
        paddingRight: 10,
    },
    eyeIcon: {
        padding: 8,
    },
});

export default CreateAdminScreen; 