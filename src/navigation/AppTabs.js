/**
 * OVERLOAD AppTabs
 * Premium light theme bottom tab navigation
 * Auto-adjusts for system navigation bar (3-button) vs gesture navigation
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import typography from '../theme/typography';
import { triggerHaptic } from '../utils/haptics';

/* ── Luxury Palette ── */
const P = {
  surface: '#FFFFFF',
  border: '#E8E4DE',
  navy: '#1B2A4A',
  textMuted: '#9E9EAE',
};

import HomeScreen from '../screens/HomeScreen';
import TrainingScreen from '../screens/TrainingScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const insets = useSafeAreaInsets();

  // Dynamic bottom padding:
  // - Gesture navigation: insets.bottom ≈ 0, use minimum 20
  // - 3-button navigation: insets.bottom ≈ 20-48, use it directly
  const bottomPad = Math.max(insets.bottom, 20);

  // Dynamic height: base height + bottom inset
  const tabBarHeight = Platform.OS === 'android' ? 60 + bottomPad : 84;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: P.navy,
        tabBarInactiveTintColor: P.textMuted,
        tabBarStyle: {
          backgroundColor: P.surface,
          borderTopWidth: 1,
          borderTopColor: P.border,
          height: tabBarHeight,
          paddingBottom: bottomPad,
          paddingTop: 8,
          elevation: 4,
          shadowColor: '#101828',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: typography.sizes.micro,
          fontWeight: typography.weights.semibold,
          letterSpacing: 0,
          marginTop: 2,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'TrainingTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'ProgressTab') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={focused ? styles.activeIconWrapper : null}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },
      })}
      screenListeners={{
        tabPress: () => {
          triggerHaptic('light');
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="TrainingTab"
        component={TrainingScreen}
        options={{ tabBarLabel: 'Training' }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={ProgressScreen}
        options={{ tabBarLabel: 'Progress' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  activeIconWrapper: {
    transform: [{ scale: 1.05 }],
  },
});
