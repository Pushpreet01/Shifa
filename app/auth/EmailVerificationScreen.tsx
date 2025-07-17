/*
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";

// Navigation types

type AuthStackParamList = {
    Login: undefined;
    EmailVerification: { email: string };
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "EmailVerification">;
type EmailVerificationScreenRouteProp = RouteProp<AuthStackParamList, "EmailVerification">;

const EmailVerificationScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<EmailVerificationScreenRouteProp>();
    const { email } = route.params;
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | null, text: string }>({ type: null, text: '' });

    const handleResend = async () => {
        setLoading(true);
        setMessage({ type: null, text: '' });
        try {
            if (auth.currentUser) {
                await sendEmailVerification(auth.currentUser);
                setMessage({ type: 'success', text: 'Verification email resent! Please check your inbox.' });
            } else {
                setMessage({ type: 'error', text: 'User not found. Please log in again.' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error?.message || 'Failed to resend verification email.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require("../../assets/logo.png")} style={styles.logo} />
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
                A verification link has been sent to:
            </Text>
            <Text style={styles.email}>{email}</Text>
            <Text style={styles.subtitle}>
                Please check your inbox and click the link to activate your account.
            </Text>
            {message.type && (
                <Text style={message.type === 'success' ? styles.successText : styles.errorText}>
                    {message.text}
                </Text>
            )}
            <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                onPress={handleResend}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Resend Verification Email</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate("Login")}
            >
                <Text style={styles.loginButtonText}>Back to Login</Text>
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
    email: {
        fontSize: 16,
        color: "#008080",
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    button: {
        backgroundColor: "#008080",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginTop: 30,
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
        marginBottom: 10,
        textAlign: "center",
    },
    errorText: {
        color: "#FF4D4D",
        fontSize: 14,
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
*/ 