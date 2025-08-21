import React, { Component, ReactNode } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Alert,
} from 'react-native';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: any;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        // Log the error
        console.error('Error Boundary caught an error:', error);
        console.error('Error info:', errorInfo);

        // You can also send this to a logging service here
        // Example: AnalyticsService.logError(error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleReportError = () => {
        if (this.state.error) {
            Alert.alert(
                'Error Details',
                `Error: ${this.state.error.message}\n\nStack: ${this.state.error.stack}`,
                [{ text: 'OK' }]
            );
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <Modal
                    visible={true}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => { }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.errorTitle}>Oops!</Text>
                            <Text style={styles.errorMessage}>
                                Something went wrong. Please try again.
                            </Text>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={this.handleRetry}
                                >
                                    <Text style={styles.retryButtonText}>Try Again</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.reportButton}
                                    onPress={this.handleReportError}
                                >
                                    <Text style={styles.reportButtonText}>Report Issue</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#F8F5E9',
        borderRadius: 20,
        padding: 30,
        margin: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#008080',
        marginBottom: 10,
    },
    errorMessage: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 15,
    },
    retryButton: {
        backgroundColor: '#008080',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        minWidth: 100,
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    reportButton: {
        backgroundColor: 'transparent',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#008080',
        minWidth: 100,
        alignItems: 'center',
    },
    reportButtonText: {
        color: '#008080',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ErrorBoundary;
