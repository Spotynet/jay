import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';

// Screens
import TodayScreen from '../screens/today/TodayScreen';
import PlanScreen from '../screens/planning/PlanScreen';
import SystemsScreen from '../screens/manage/SystemsScreen';
import StatsScreen from '../screens/stats/StatsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

import { TabBar } from './components/TabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
import JournalEntryScreen from '../screens/journal/JournalEntryScreen';
import HabitEntryScreen from '../screens/habits/HabitEntryScreen';
import TaskEntryScreen from '../screens/tasks/TaskEntryScreen';
import EventEntryScreen from '../screens/events/EventEntryScreen';

// ...

const MainStack = createNativeStackNavigator();

import TasksSettingsScreen from '../screens/manage/TasksSettingsScreen';
import HabitsSettingsScreen from '../screens/manage/HabitsSettingsScreen';
import CalendarSettingsScreen from '../screens/manage/CalendarSettingsScreen';
import JournalSettingsScreen from '../screens/manage/JournalSettingsScreen';
import FinanceSettingsScreen from '../screens/manage/FinanceSettingsScreen';
import ManageFinanceScreen from '../screens/manage/ManageFinanceScreen';
import FinanceEntryScreen from '../screens/finance/FinanceEntryScreen';
import AccountScreen from '../screens/profile/AccountScreen';
import SecurityScreen from '../screens/profile/SecurityScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import DaySetupScreen from '../screens/profile/DaySetupScreen';

// ...

import JournalHistoryScreen from '../screens/journal/JournalHistoryScreen';
import JournalDetailScreen from '../screens/journal/JournalDetailScreen';

function MainTabs() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
      <MainStack.Screen name="Tabs" component={TabNavigator} />
      <MainStack.Screen name="JournalEntry" component={JournalEntryScreen} />
      <MainStack.Screen name="JournalHistory" component={JournalHistoryScreen} />
      <MainStack.Screen name="JournalDetail" component={JournalDetailScreen} />
      <MainStack.Screen name="HabitEntry" component={HabitEntryScreen} />
      <MainStack.Screen name="TaskEntry" component={TaskEntryScreen} />
      <MainStack.Screen name="EventEntry" component={EventEntryScreen} />
      <MainStack.Screen name="Account" component={AccountScreen} />
      <MainStack.Screen name="Security" component={SecurityScreen} />
      <MainStack.Screen name="Notifications" component={NotificationsScreen} />
      <MainStack.Screen name="DaySetup" component={DaySetupScreen} />
      <MainStack.Screen name="TasksSettings" component={TasksSettingsScreen} />
      <MainStack.Screen name="HabitsSettings" component={HabitsSettingsScreen} />
      <MainStack.Screen name="CalendarSettings" component={CalendarSettingsScreen} />
      <MainStack.Screen name="JournalSettings" component={JournalSettingsScreen} />
      <MainStack.Screen name="FinanceSettings" component={FinanceSettingsScreen} />
      <MainStack.Screen name="ManageFinance" component={ManageFinanceScreen} />
      <MainStack.Screen name="FinanceEntry" component={FinanceEntryScreen} />
    </MainStack.Navigator>
  );
}

import JayScreen from '../screens/jay/JayScreen';

// ...

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Manage" component={SystemsScreen} />
      <Tab.Screen name="Jay" component={JayScreen} />
      <Tab.Screen name="Reflect" component={StatsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const user = useAuthStore((state) => state.user);

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
      ) : (
// ... rest of the code
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
          <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
