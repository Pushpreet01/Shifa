import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'EventsForm'>;

const EventsFormScreen: React.FC<Props> = () => {
  return (
    <View>
      <Text>Events Form Page</Text>
    </View>
  );
};

export default EventsFormScreen;