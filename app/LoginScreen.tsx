import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const validEmail = 'pushpreetsingh9@gmail.com';
    const validPassword = 'p123';

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password.');
      return;
    }

    if (email === validEmail && password === validPassword) {
      navigation.navigate('Events');
    } else {
      Alert.alert('Error', 'Invalid email or password.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />

      {/* Username Field */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Username"
          placeholderTextColor="#3A7D44"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      {/* Password Field with Forgot Password Link */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#3A7D44" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Log In Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5E9', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 80,
  },
  inputContainer: {
    width: '75%',
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#9DC08B', 
    padding: 10,
    fontSize: 14,
    color: '#3A7D44'
    ,
  },
  forgotPassword: {
    color: '#000',
    fontSize: 14,
    textAlign: 'right',
    marginTop: 5,
  },
  loginButton: {
    backgroundColor: '#9DC08B', 
    paddingVertical: 7,
    paddingHorizontal: 100,
    borderRadius: 25,
    marginTop: 50,
  },
  loginButtonText: {
    color: '#F8F5E9',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;