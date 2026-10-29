import React from 'react';
import { Platform } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme as NavTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';

// Tab Screens
import TodayScreen from '../screens/today/TodayScreen';
import PlanScreen from '../screens/planning/PlanScreen';
import DailyJournalScreen from '../screens/journal/DailyJournalScreen';
import FinanceScreen from '../screens/finance/FinanceScreen';
import ReviewScreen from '../screens/review/ReviewScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Modal Screens
import JournalEntryScreen from '../screens/journal/JournalEntryScreen';
import HabitEntryScreen from '../screens/habits/HabitEntryScreen';
import TaskEntryScreen from '../screens/tasks/TaskEntryScreen';
import EventEntryScreen from '../screens/events/EventEntryScreen';
import ProjectEntryScreen from '../screens/projects/ProjectEntryScreen';
import ProjectTasksScreen from '../screens/planning/ProjectTasksScreen';
import TransactionEntryScreen from '../screens/finance/TransactionEntryScreen';
import CategoryEntryScreen from '../screens/finance/CategoryEntryScreen';
import CategoryItemEntryScreen from '../screens/finance/CategoryItemEntryScreen';
import TransactionDetailScreen from '../screens/finance/TransactionDetailScreen';

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
import ItemDetailsScreen from '../screens/itemDetails/ItemDetailsScreen';
import CalendarPickerScreen from '../screens/calendar/CalendarPickerScreen';

import { TabBar } from './components/TabBar';

/** Content-height day picker — not full/page sheet. */
const calendarPickerOptions = {
  headerShown: false,
  presentation: 'formSheet' as const,
  sheetAllowedDetents: 'fitToContents' as const,
  sheetGrabberVisible: true,
  sheetExpandsWhenScrolledToEdge: false,
  sheetCornerRadius: 16,
};

/** System UITabBar / BottomNavigationView — Liquid Glass on iOS 26+ (Xcode 26 builds). */
const NativeTab = createNativeBottomTabNavigator();
/** JS tab bar retained for web (native tabs are iOS/Android only). */
const JsTab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

type TabIconSpec = {
  sf: string;
  md: string;
};

const TAB_ICONS: Record<string, TabIconSpec> = {
  Today: { sf: 'calendar', md: 'calendar_month' },
  Plan: { sf: 'checklist', md: 'checklist' },
  Journal: { sf: 'book', md: 'menu_book' },
  Financial: { sf: 'creditcard', md: 'account_balance_wallet' },
  Review: { sf: 'chart.bar', md: 'bar_chart' },
};

function nativeTabIcon(routeName: string) {
  const spec = TAB_ICONS[routeName] ?? { sf: 'circle', md: 'circle' };
  return Platform.select({
    ios: { type: 'sfSymbol' as const, name: spec.sf as any },
    android: { type: 'materialSymbol' as const, name: spec.md },
    default: { type: 'sfSymbol' as const, name: spec.sf as any },
  });
}

/** Full-height editors on phone; avoid iOS partial sheets for item details. */
const editorScreenOptions = {
  headerShown: false,
  presentation: (Platform.OS === 'ios' ? 'fullScreenModal' : 'modal') as
    | 'fullScreenModal'
    | 'modal',
  animation: 'slide_from_bottom' as const,
};

function MainTabs() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
      <MainStack.Screen name="Tabs" component={TabNavigator} />
      {/* Entry / details editors — one-step from timeline */}
      <MainStack.Screen name="JournalEntry" component={JournalEntryScreen} options={editorScreenOptions} />
      <MainStack.Screen name="HabitEntry" component={HabitEntryScreen} options={editorScreenOptions} />
      <MainStack.Screen name="TaskEntry" component={TaskEntryScreen} options={editorScreenOptions} />
      <MainStack.Screen name="EventEntry" component={EventEntryScreen} options={editorScreenOptions} />
      <MainStack.Screen name="ProjectEntry" component={ProjectEntryScreen} />
      <MainStack.Screen name="ProjectTasks" component={ProjectTasksScreen} />
      <MainStack.Screen name="TransactionEntry" component={TransactionEntryScreen} />
      <MainStack.Screen name="CategoryEntry" component={CategoryEntryScreen} />
      <MainStack.Screen name="CategoryItemEntry" component={CategoryItemEntryScreen} />
      <MainStack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      {/* Timeline item details — same MainStack modal presentation as Profile */}
      <MainStack.Screen name="ItemDetails" component={ItemDetailsScreen} />
      {/* Today / Journal day picker — formSheet sized to calendar content */}
      <MainStack.Screen
        name="CalendarPicker"
        component={CalendarPickerScreen}
        options={calendarPickerOptions}
      />
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
    </MainStack.Navigator>
  );
}

const TAB_SCREENS = [
  { name: 'Today' as const, component: TodayScreen, title: 'Today' },
  { name: 'Plan' as const, component: PlanScreen, title: 'Plan' },
  { name: 'Journal' as const, component: DailyJournalScreen, title: 'Journal' },
  { name: 'Financial' as const, component: FinanceScreen, title: 'Financial' },
  { name: 'Review' as const, component: ReviewScreen, title: 'Review' },
];

/** Native system tab bar (Liquid Glass on iOS 26+ when built with Xcode 26). */
function NativeTabNavigator() {
  const { accentColor } = useTheme();

  return (
    <NativeTab.Navigator
      screenOptions={{
        headerShown: false,
        // Red selected accent — system owns glass/material on iOS 26+.
        tabBarActiveTintColor: accentColor,
        // Do not set tabBarStyle.backgroundColor — it suppresses Liquid Glass.
      }}
    >
      {TAB_SCREENS.map(({ name, component, title }) => (
        <NativeTab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            title,
            tabBarLabel: title,
            tabBarIcon: nativeTabIcon(name),
          }}
        />
      ))}
    </NativeTab.Navigator>
  );
}

/** Custom JS tab bar — web only (native tabs unsupported). */
function WebTabNavigator() {
  return (
    <JsTab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TAB_SCREENS.map(({ name, component }) => (
        <JsTab.Screen key={name} name={name} component={component} />
      ))}
    </JsTab.Navigator>
  );
}

function TabNavigator() {
  return Platform.OS === 'web' ? <WebTabNavigator /> : <NativeTabNavigator />;
}

export default function AppNavigator() {
  const user = useAuthStore((state) => state.user);
  const { isDark, colors, accentColor } = useTheme();

  // Drive native chrome (incl. Liquid Glass tab material) from the app theme.
  const navigationTheme = React.useMemo<NavTheme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: accentColor,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: accentColor,
      },
    };
  }, [isDark, colors, accentColor]);

  return (
    <NavigationContainer theme={navigationTheme}>
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
