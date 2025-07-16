import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { createUserWithEmailAndPassword, sendEmailVerification, updateEmail, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebaseConfig";

// Navigation types

type AuthStackParamList = {
    Login: undefined;
    EmailVerification: {
        email: string;
        fullName?: string;
        phoneNumber?: string;
        password?: string;
        role?: string;
        profileImage?: string | null;
        notifications?: any;
        emergencyContacts?: any;
    };
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "EmailVerification">;
type EmailVerificationScreenRouteProp = RouteProp<AuthStackParamList, "EmailVerification">;

const EmailVerificationScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<EmailVerificationScreenRouteProp>();
    const {
        email: initialEmail,
        fullName = "",
        phoneNumber = "",
        password = "",
        role = "",
        profileImage = null,
        notifications = {},
        emergencyContacts = [],
    } = route.params;

    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | null, text: string }>({ type: null, text: '' });
    const [resendTimer, setResendTimer] = useState(30);
    const [verificationSent, setVerificationSent] = useState(false);
    const [checking, setChecking] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [userCreated, setUserCreated] = useState(false);

    // Send verification email and start timer
    const sendVerification = async () => {
        setLoading(true);
        setMessage({ type: null, text: '' });
        try {
            if (auth.currentUser) {
                await sendEmailVerification(auth.currentUser);
                setVerificationSent(true);
                setResendTimer(30);
                setMessage({ type: 'success', text: 'Verification email sent! Please check your inbox.' });
            } else {
                setMessage({ type: 'error', text: 'No authenticated user found.' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error?.message || 'Failed to send verification email.' });
        } finally {
            setLoading(false);
        }
    };

    // On mount, send verification
    useEffect(() => {
        sendVerification();
        // eslint-disable-next-line
    }, []);

    // Resend timer logic
    useEffect(() => {
        if (verificationSent && resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [verificationSent, resendTimer]);

    // Poll for verification
    useEffect(() => {
        if (!verificationSent || userCreated) return;
        setChecking(true);
        intervalRef.current = setInterval(async () => {
            if (auth.currentUser) {
                await auth.currentUser.reload();
                if (auth.currentUser.emailVerified) {
                    clearInterval(intervalRef.current!);
                    // Only update emailVerified field in Firestore
                    await setDoc(doc(db, "users", auth.currentUser.uid), { emailVerified: true }, { merge: true });
                    setUserCreated(true);
                    setChecking(false);
                    setMessage({ type: 'success', text: 'Email verified! Account created.' });
                    // Sign out and navigate to Login after a short delay
                    setTimeout(async () => {
                        await signOut(auth);
                        navigation.navigate("Login");
                    }, 2000);
                }
            }
        }, 2000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [verificationSent, userCreated]);

    // Handle email change
    const handleEmailChange = async (newEmail: string) => {
        setEmail(newEmail);
        setVerificationSent(false);
        setResendTimer(0);
        setMessage({ type: null, text: '' });
        // Only update the email field in Firestore
        if (auth.currentUser) {
            await setDoc(doc(db, "users", auth.currentUser.uid), { email: newEmail }, { merge: true });
        }
    };

    // Handle resend
    const handleResend = async () => {
        if (resendTimer > 0) return;
        await sendVerification();
    };

    // Only allow back navigation
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Only allow back
            if (e.data.action.type !== 'GO_BACK') {
                e.preventDefault();
            }
        });
        return unsubscribe;
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Image source={require("../../assets/logo.png")} style={styles.logo} />
            <Text style={styles.title}>Please Confirm Your Email</Text>
            <Text style={styles.subtitle}>A verification link will be sent to the email below. You can change it if needed.</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={handleEmailChange}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading && !checking}
            />
            <TouchableOpacity
                style={[styles.button, (loading || checking) && styles.disabledButton]}
                onPress={() => sendVerification()}
                disabled={loading || checking}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Send Verification Email</Text>
                )}
            </TouchableOpacity>
            {verificationSent && (
                <>
                    <Text style={styles.subtitle}>
                        Please check your inbox and click the link to activate your account.
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, (resendTimer > 0 || loading) && styles.disabledButton]}
                        onPress={handleResend}
                        disabled={resendTimer > 0 || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Verification Email"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </>
            )}
            {checking && (
                <View style={{ marginTop: 20 }}>
                    <ActivityIndicator size="large" color="#008080" />
                    <Text style={styles.subtitle}>Waiting for verification...</Text>
                </View>
            )}
            {message.type && (
                <Text style={message.type === 'success' ? styles.successText : styles.errorText}>
                    {message.text}
                </Text>
            )}
            <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.goBack()}
                disabled={loading || checking}
            >
                <Text style={styles.loginButtonText}>Back</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F5E9",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#008080",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#666666",
        textAlign: "center",
        marginBottom: 10,
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    input: {
        borderWidth: 1,
        borderColor: "#008080",
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        color: "#008080",
        marginBottom: 10,
        width: 250,
        backgroundColor: "#fff",
    },
    button: {
        backgroundColor: "#008080",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginTop: 20,
        minWidth: 200,
        alignItems: "center",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    disabledButton: {
        backgroundColor: "#cccccc",
    },
    successText: {
        color: "#4CAF50",
        fontSize: 14,
        marginTop: 10,
        marginBottom: 10,
        textAlign: "center",
    },
    errorText: {
        color: "#FF4D4D",
        fontSize: 14,
        marginTop: 10,
        marginBottom: 10,
        textAlign: "center",
    },
    loginButton: {
        marginTop: 20,
    },
    loginButtonText: {
        color: "#008080",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default EmailVerificationScreen; 