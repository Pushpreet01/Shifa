// screens/EventsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import eventData from '../data/events.json';

type Props = NativeStackScreenProps<RootStackParamList, 'Events'>;

const EventsScreen: React.FC<Props> = ({ navigation }) => {
  const handlePress = (id: string) => {
    navigation.navigate('RegisterEvent', { eventId: id });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={eventData.events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePress(item.id)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.location}</Text>
            <Text>{new Date(item.date).toDateString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};



export default EventsScreen;
