import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductFormScreen from '../screens/ProductFormScreen';
import Tabs from './Tabs';
import type { RootStackParamList } from './types';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ScannerScreen from '../screens/ScannerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      {/* First screen = shown at launch = the whole tab bar */}
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />

      {/* Screens opened on top of the tabs */}
      <Stack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={{ title: 'Add product', presentation: 'modal' }}
      />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
      <Stack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Scan a product' }} />
    </Stack.Navigator>
  );
}