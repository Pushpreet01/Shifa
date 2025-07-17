import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { AntDesign } from "@expo/vector-icons";
import { doc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
    ForgotPassword: undefined;
    RoleSelection?: undefined;
    UserSettings?: { role: string };
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "ForgotPassword">;

const ForgotPassword = () => {
    const navigation = useNavigation<NavigationProp>();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!email.trim()) {
            newErrors.email = "Please enter your email address.";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email address.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResetPassword = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setEmailSent(true);
            setErrors({ success: "Password reset email sent! Please check your inbox and follow the instructions to reset your password." });
            // Navigate back to login after 45 seconds
            setTimeout(() => {
                navigation.navigate("Login");
            }, 45000);
        } catch (error: any) {
            console.log("Error sending reset email:", error);
            let errorMessage = "Failed to send reset email. Please try again.";
            if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email format.";
            } else if (error.code === "auth/user-not-found") {
                errorMessage = "No user found with this email address.";
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many attempts. Please try again later.";
            }
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigation.navigate("Login");
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToLogin}
            >
                <AntDesign name="arrowleft" size={24} color="#008080" />
            </TouchableOpacity>

            <Image source={require("../../assets/logo.png")} style={styles.logo} />

            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password.
            </Text>

            {!!errors.general && (
                <Text style={[styles.errorText, { marginBottom: 10 }]}>
                    {errors.general}
                </Text>
            )}

            {!!errors.success && (
                <Text style={[styles.successText, { marginBottom: 10 }]}>
                    {errors.success}
                </Text>
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#008080"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) setErrors((e) => ({ ...e, email: "" }));
                        if (errors.general) setErrors((e) => ({ ...e, general: "" }));
                        if (errors.success) setErrors((e) => ({ ...e, success: "" }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    editable={!loading}
                />
                {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                )}
            </View>

            <TouchableOpacity
                style={[styles.resetButton, loading && styles.disabledButton]}
                onPress={handleResetPassword}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                    <Text style={styles.resetButtonText}>Send Reset Email</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={handleBackToLogin}
                disabled={loading}
            >
                <Text style={styles.backToLoginText}>Back to Login</Text>
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
    backButton: {
        position: "absolute",
        top: 50,
        left: 20,
        padding: 10,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 40,
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
        marginBottom: 40,
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    inputContainer: {
        width: "75%",
        marginBottom: 30,
    },
    input: {
        borderBottomWidth: 2,
        borderBottomColor: "#F6A800",
        padding: 10,
        fontSize: 16,
        color: "#008080",
    },
    resetButton: {
        backgroundColor: "#008080",
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 25,
        marginBottom: 20,
        minWidth: 200,
        alignItems: "center",
    },
    disabledButton: {
        backgroundColor: "#cccccc",
    },
    resetButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    backToLoginButton: {
        marginTop: 10,
    },
    backToLoginText: {
        color: "#008080",
        fontSize: 16,
        fontWeight: "bold",
    },
    errorText: {
        color: "#FF4D4D",
        fontSize: 12,
        marginTop: 4,
    },
    successText: {
        color: "#4CAF50",
        fontSize: 12,
        marginTop: 4,
    },
});

export default ForgotPassword;
