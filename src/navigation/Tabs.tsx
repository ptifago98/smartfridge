import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FridgeScreen from '../screens/FridgeScreen';
import RecipesScreen from '../screens/RecipesScreen';
import StatsScreen from '../screens/StatScreen';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export default function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Fridge"
        component={FridgeScreen}
        options={{
          title: 'My fridge',
          tabBarLabel: 'Fridge',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="fridge-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Recipes"
        component={RecipesScreen}
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="silverware-fork-knife" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: 'My stats',
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-donut" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}