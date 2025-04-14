import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../app/LoginScreen';
import EventsScreen from '../app/EventsScreen';
import EventsFormScreen from '../app/EventsFormScreen';
import RegisterEventScreen from '../app/RegisterEventScreen'; //  NEW IMPORT

export type RootStackParamList = {
  Login: undefined;
  Events: undefined;
  EventsForm: undefined;
  RegisterEvent: { eventId: string }; //  NEW ROUTE
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Events"
          component={EventsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EventsForm"
          component={EventsFormScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RegisterEvent"
          component={RegisterEventScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
