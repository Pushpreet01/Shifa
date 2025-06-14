import React, { ReactNode } from 'react';
import { Platform, View, StyleSheet, Dimensions } from 'react-native';

type WebWrapperProps = {
  children: ReactNode;
};

const WebWrapper: React.FC<WebWrapperProps> = ({ children }) => {
  if (Platform.OS !== 'web') return <>{children}</>;

  return (
    <View style={styles.mobileWrapper}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  mobileWrapper: {
    flex: 1, // Allow the wrapper to expand to full screen height
    width: '100%', // Use full screen width
    backgroundColor: 'black', // Retain background color
    overflow: 'hidden', // Prevent content overflow
    padding: 1, // Optional padding for content spacing
  },
});

export default WebWrapper;