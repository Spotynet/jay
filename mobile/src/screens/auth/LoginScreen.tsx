import React, { useState } from 'react';
import { View, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthLayout } from './components/AuthLayout';
import { AuthInput } from './components/AuthInput';
import { AuthButton } from './components/AuthButton';
import { ErrorMessage } from './components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { IconMail, IconLock } from 'tabler-icons-react-native';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try { await signIn(email, password); } 
    catch (e: any) { setError(e.message || 'Login failed'); } 
    finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to manage your daily system">
      <AuthInput icon={IconMail} placeholder="Email" value={email} onChangeText={(t) => { setEmail(t); setError(null); }} autoCapitalize="none" />
      <AuthInput icon={IconLock} placeholder="Password" value={password} onChangeText={(t) => { setPassword(t); setError(null); }} secureTextEntry />
      
      <ErrorMessage message={error} />
      
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgot}>
        <AppText style={{ color: colors.subtext }}>Forgot password?</AppText>
      </TouchableOpacity>
      
      <AuthButton title="Sign In" loading={loading} onPress={handleLogin} />
      
      <TouchableOpacity onPress={() => navigation.replace('Register')} style={styles.footer}>
        <AppText style={{ color: colors.subtext }}>Don't have an account? <AppText style={{ color: colors.accent, fontWeight: '700' }}>Register</AppText></AppText>
      </TouchableOpacity>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  forgot: { alignItems: 'center', marginTop: -8 },
  footer: { alignItems: 'center', marginTop: 16 }
});
