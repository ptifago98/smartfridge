import { NavigationContainer } from '@react-navigation/native';
import { setupNotifications } from './src/services/notifications';
import { useEffect } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, PaperProvider, Text } from 'react-native-paper';
import { useAuth } from './src/hooks/useAuth';
import RootNavigator from './src/navigation/RootNavigator';
import { theme, navigationTheme } from './src/theme';

export default function App() {
  const { user, loading, error } = useAuth();
  
  useEffect(() => {
    setupNotifications();
  }, []);

  

  return (
    
    <PaperProvider theme={theme}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      ) : error || !user ? (
        <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
          <Text>Could not connect: {error}</Text>
        </View>
      ) : (
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
        
      )}
    </PaperProvider>
  );
}