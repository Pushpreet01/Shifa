import React from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingViewProps,
} from "react-native";

interface KeyboardAwareWrapperProps extends KeyboardAvoidingViewProps {
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  scrollEnabled?: boolean;
}

const KeyboardAwareWrapper: React.FC<KeyboardAwareWrapperProps> = ({
  children,
  containerStyle,
  scrollEnabled = true,
  ...props
}) => {
  const content = scrollEnabled ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, containerStyle]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      {...props}
    >
      {content}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default KeyboardAwareWrapper;
