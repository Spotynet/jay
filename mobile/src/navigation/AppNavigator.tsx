import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';

// Tab Screens
import TodayScreen from '../screens/today/TodayScreen';
import TasksTabScreen from '../screens/tasks/TasksTabScreen';
import DailyJournalScreen from '../screens/journal/DailyJournalScreen';
import PlaceholderScreen from '../screens/common/PlaceholderScreen';
import FinanceScreen from '../screens/finance/FinanceScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Modal Screens
import JournalEntryScreen from '../screens/journal/JournalEntryScreen';
import JournalDetailScreen from '../screens/journal/JournalDetailScreen';
import HabitEntryScreen from '../screens/habits/HabitEntryScreen';
import TaskEntryScreen from '../screens/tasks/TaskEntryScreen';
import EventEntryScreen from '../screens/events/EventEntryScreen';
import ProjectEntryScreen from '../screens/projects/ProjectEntryScreen';
import FinanceEntryScreen from '../screens/finance/FinanceEntryScreen';
import TransactionEntryScreen from '../screens/finance/TransactionEntryScreen';
import AccountEntryScreen from '../screens/finance/AccountEntryScreen';
import CategoryEntryScreen from '../screens/finance/CategoryEntryScreen';
import BudgetEntryScreen from '../screens/finance/BudgetEntryScreen';

// Settings Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import AccountScreen from '../screens/profile/AccountScreen';
import SecurityScreen from '../screens/profile/SecurityScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import DaySetupScreen from '../screens/profile/DaySetupScreen';
import TasksSettingsScreen from '../screens/manage/TasksSettingsScreen';
import HabitsSettingsScreen from '../screens/manage/HabitsSettingsScreen';
import CalendarSettingsScreen from '../screens/manage/CalendarSettingsScreen';
import JournalSettingsScreen from '../screens/manage/JournalSettingsScreen';
import FinanceSettingsScreen from '../screens/manage/FinanceSettingsScreen';
import ManageFinanceScreen from '../screens/manage/ManageFinanceScreen';

import { TabBar } from './components/TabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

function MainTabs() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
      <MainStack.Screen name="Tabs" component={TabNavigator} />
      {/* Entry Screens */}
      <MainStack.Screen name="JournalEntry" component={JournalEntryScreen} />
      <MainStack.Screen name="JournalDetail" component={JournalDetailScreen} />
      <MainStack.Screen name="HabitEntry" component={HabitEntryScreen} />
      <MainStack.Screen name="TaskEntry" component={TaskEntryScreen} />
      <MainStack.Screen name="EventEntry" component={EventEntryScreen} />
      <MainStack.Screen name="ProjectEntry" component={ProjectEntryScreen} />
      <MainStack.Screen name="FinanceEntry" component={FinanceEntryScreen} />
      <MainStack.Screen name="TransactionEntry" component={TransactionEntryScreen} />
      <MainStack.Screen name="AccountEntry" component={AccountEntryScreen} />
      <MainStack.Screen name="CategoryEntry" component={CategoryEntryScreen} />
      <MainStack.Screen name="BudgetEntry" component={BudgetEntryScreen} />
      {/* Settings Screens */}
      <MainStack.Screen name="Profile" component={ProfileScreen} />
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
    </MainStack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Plan" component={TasksTabScreen} />
      <Tab.Screen name="Journal" component={DailyJournalScreen} />
      <Tab.Screen name="Fitness" component={() => (
        <PlaceholderScreen 
          title="FITNESS" 
          message="Track your fitness, sets, and reps. Coming soon to help you stay on top of your fitness game."
        />
      )} />
      <Tab.Screen name="Financial" component={FinanceScreen} />
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
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
          <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
