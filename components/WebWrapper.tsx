import React, { ReactNode } from 'react';
import { Platform, View, StyleSheet } from 'react-native';

type WebWrapperProps = {
  children: ReactNode;
};

const MOBILE_WIDTH = 375;
const MOBILE_HEIGHT = 812;

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
    width: MOBILE_WIDTH,
    height: MOBILE_HEIGHT,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    alignSelf: 'center',
    margin: 20,
    marginBottom: 40,
    borderRadius: 20,
    backgroundColor: 'black',
  },
});

export default WebWrapper;
