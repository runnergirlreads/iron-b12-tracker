import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { MoreStackParamList, RootTabParamList, SymptomsStackParamList } from './types';

import DashboardScreen from '../screens/DashboardScreen';
import SymptomsScreen from '../screens/SymptomsScreen';
import SymptomTrendsScreen from '../screens/SymptomTrendsScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import LabResultsScreen from '../screens/LabResultsScreen';
import MoreMenuScreen from '../screens/MoreMenuScreen';
import ReportsScreen from '../screens/ReportsScreen';
import PeriodTrackerScreen from '../screens/PeriodTrackerScreen';
import FoodJournalScreen from '../screens/FoodJournalScreen';
import NotesScreen from '../screens/NotesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const SymptomsStack = createNativeStackNavigator<SymptomsStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

function SymptomsNavigator() {
  const { colors } = useTheme();
  return (
    <SymptomsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.primary, fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <SymptomsStack.Screen name="SymptomsMain" component={SymptomsScreen} options={{ title: 'Symptoms' }} />
      <SymptomsStack.Screen name="SymptomTrends" component={SymptomTrendsScreen} options={{ title: 'Symptom Trends' }} />
    </SymptomsStack.Navigator>
  );
}

function MoreNavigator() {
  const { colors } = useTheme();
  return (
    <MoreStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.primary, fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} options={{ title: 'More' }} />
      <MoreStack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports & Insights' }} />
      <MoreStack.Screen name="PeriodTracker" component={PeriodTrackerScreen} options={{ title: 'Period Tracker' }} />
      <MoreStack.Screen name="FoodJournal" component={FoodJournalScreen} options={{ title: 'Food Journal' }} />
      <MoreStack.Screen name="Notes" component={NotesScreen} options={{ title: 'Notes' }} />
      <MoreStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <MoreStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </MoreStack.Navigator>
  );
}

export default function RootNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.primary, fontWeight: '600' },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'home',
            Symptoms: 'pulse',
            Medications: 'medical',
            Labs: 'flask',
            More: 'menu',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Symptoms" component={SymptomsNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Medications" component={MedicationsScreen} />
      <Tab.Screen name="Labs" component={LabResultsScreen} options={{ title: 'Lab Results' }} />
      <Tab.Screen name="More" component={MoreNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}
