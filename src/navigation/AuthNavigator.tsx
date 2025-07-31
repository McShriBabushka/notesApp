import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthScreen from '../screens/AuthScreen';

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

type AuthNavigatorProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Auth'>;
};

export default function AuthNavigator({ navigation }: AuthNavigatorProps) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      // Navigate to main tabs when user is authenticated
      navigation.replace('Main');
    }
  }, [user, loading, navigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen navigation={navigation} />;
  }

  return null;
}