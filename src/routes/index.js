import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Login from '../screens/Login';
import Register from '../screens/Register';
import Dashboard from '../screens/Dashboard';
import KDS from '../screens/KDS';
import PizzaForm from '../screens/PizzaForm';
import ClientMenu from '../screens/ClientMenu'; // 1. Importação da nova tela
import MyOrders from '../screens/MyOrders';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ea580c',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen 
        name="VisaoGeral" 
        component={Dashboard} 
        options={{
          tabBarLabel: 'Visão Geral',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="KDS" 
        component={KDS} 
        options={{
          tabBarLabel: 'Cozinha (KDS)',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-outline" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

export default function Routes() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#111827' }
      }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="AppTabs" component={AppTabs} />
      <Stack.Screen name="PizzaForm" component={PizzaForm} />
      {/* 2. Registo da tela no navegador */}
      <Stack.Screen name="ClientMenu" component={ClientMenu} />
      <Stack.Screen name="MyOrders" component={MyOrders} />
    </Stack.Navigator>
  );
}