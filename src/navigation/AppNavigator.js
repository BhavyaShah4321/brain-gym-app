/**
 * OVERLOAD App Navigator
 * Central stack navigation configured for light theme with Firebase Auth integration
 */

import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import colors from '../theme/colors';
import { ROUTES } from '../constants/routes';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AppTabs from './AppTabs';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import GameScreen from '../screens/GameScreen';
import FocusGameScreen from '../screens/FocusGameScreen';
import ReactionGameScreen from '../screens/ReactionGameScreen';
import ProcessingGameScreen from '../screens/ProcessingGameScreen';
import DecisionGameScreen from '../screens/DecisionGameScreen';
import SpatialGameScreen from '../screens/SpatialGameScreen';
import FlexibilityGameScreen from '../screens/FlexibilityGameScreen';
import LogicGameScreen from '../screens/LogicGameScreen';
import MindRushGameScreen from '../screens/MindRushGameScreen';
import ResultsScreen from '../screens/ResultsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

const OverloadLightTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surfacePrimary,
    text: colors.textPrimary,
    border: colors.borderDefault,
    notification: colors.accentLavender,
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={OverloadLightTheme}>
      <Stack.Navigator
        initialRouteName={ROUTES.SPLASH}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name={ROUTES.SPLASH}
          component={SplashScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name={ROUTES.ONBOARDING}
          component={OnboardingScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name={ROUTES.LOGIN}
          component={LoginScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name={ROUTES.REGISTER}
          component={RegisterScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name={ROUTES.MAIN_TABS}
          component={AppTabs}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name={ROUTES.CATEGORY_DETAIL}
          component={CategoryDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name={ROUTES.GAME}
          component={GameScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name={ROUTES.FOCUS_GAME}
          component={FocusGameScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name={ROUTES.REACTION_GAME}
          component={ReactionGameScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name={ROUTES.PROCESSING_GAME}
          component={ProcessingGameScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name={ROUTES.DECISION_GAME}
          component={DecisionGameScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name={ROUTES.SPATIAL_GAME}
          component={SpatialGameScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name={ROUTES.FLEXIBILITY_GAME}
          component={FlexibilityGameScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name={ROUTES.LOGIC_GAME}
          component={LogicGameScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name={ROUTES.MIND_RUSH_GAME}
          component={MindRushGameScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name={ROUTES.RESULTS}
          component={ResultsScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name={ROUTES.SETTINGS}
          component={SettingsScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
