import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Text } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// Redux Store
import { store, persistor } from './src/store/store';
import { useAppSelector } from './src/store/hooks';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NewsScreen from './src/screens/NewsScreen';
import LocationScreen from './src/screens/LocationScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ name, color, focused }: { 
  name: string; 
  color: string; 
  focused: boolean; 
}) => {
  const getIcon = () => {
    switch (name) {
      case 'home': return '🏠';
      case 'news': return '📰';
      case 'location': return '📍';
      case 'profile': return '👤';
      default: return '●';
    }
  };

  return (
    <Text style={{
      fontSize: focused ? 24 : 20,
      color: color,
    }}>
      {getIcon()}
    </Text>
  );
};

// Tabs Navigator-when the user is authenticated
function TabsNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="news" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Location"
        component={LocationScreen}
        options={{
          title: 'Location',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="location" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="profile" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAppSelector((state) => state.auth);
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={TabsNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator size="large" color="#3B82F6" />} persistor={persistor}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}