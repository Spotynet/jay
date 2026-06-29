import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../../../App'; // Adjust path as needed
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AuthFormType = 'Login' | 'Register';

interface AuthContainerProps {
  children: React.ReactNode;
  formType: AuthFormType;
}

type AuthScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login' | 'Register'>;

export default function AuthContainer({ children, formType }: AuthContainerProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<AuthScreenNavigationProp>();

  const toggleFormType = () => {
    if (formType === 'Login') {
      navigation.replace('Register');
    } else {
      navigation.replace('Login');
    }
  };

  const titleText = "Just A daY";
  const subtitleText = formType === 'Login' ? 'Sign in to your account' : 'Create a new account';
  const toggleText = formType === 'Login' ? "Don't have an account?" : "Already have an account?";
  const toggleLinkText = formType === 'Login' ? "Sign Up" : "Sign In";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.mainTitle, { color: colors.accent }]}>{titleText}</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>{subtitleText}</Text>

      <View style={styles.content}>{children}</View>

      <TouchableOpacity onPress={toggleFormType} style={styles.toggleContainer}>
        <Text style={[styles.toggleText, { color: colors.text }]}>{toggleText} </Text>
        <Text style={[styles.toggleLink, { color: colors.accent }]}>{toggleLinkText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    textAlign: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  toggleText: {
    fontSize: 16,
  },
  toggleLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
