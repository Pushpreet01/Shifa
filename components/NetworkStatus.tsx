import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await fetch('https://www.google.com', { mode: 'no-cors' });
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };

    const interval = setInterval(checkConnection, 10000);
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  if (isOnline) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Offline Mode - Some features may be limited</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ff9800',
    padding: 10,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NetworkStatus;