import React from "react";
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ViewStyle,
  TextStyle,
} from "react-native";

interface KeyboardAwareInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

const KeyboardAwareInput: React.FC<KeyboardAwareInputProps> = ({
  containerStyle,
  inputStyle,
  ...props
}) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, containerStyle]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <TextInput
        style={[styles.input, inputStyle]}
        placeholderTextColor="#666"
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default KeyboardAwareInput;
