import React, { useState } from 'react';
import { Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthLayout } from './components/AuthLayout';
import { AuthInput } from './components/AuthInput';
import { AuthButton } from './components/AuthButton';
import { ErrorMessage } from './components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { IconMail, IconLock } from 'tabler-icons-react-native';
import { useNavigation } from '@react-navigation/native';
import { checkEmailExists } from '../../api/emailCheck';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      const { exists } = await checkEmailExists(email);
      if (exists) {
        setError('This email is already registered');
      } else {
        setError(null);
        setStep(1);
      }
    } catch {
      setError('Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, confirm); 
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isStepOne = step === 0;

  return (
    <AuthLayout 
      title={isStepOne ? "Create account" : "Set password"} 
      subtitle={isStepOne ? "Enter your email address" : "Create and confirm your password"} 
      showSocial={false} 
      progress={isStepOne ? 0.5 : 1}
    >
      {isStepOne ? (
        <>
          <AuthInput icon={IconMail} placeholder="Email" value={email} onChangeText={(t) => { setEmail(t); setError(null); }} autoCapitalize="none" />
          <ErrorMessage message={error} />
          <AuthButton title="Next" onPress={handleNextStep} />
        </>
      ) : (
        <>
          <AuthInput icon={IconLock} placeholder="Password" value={password} onChangeText={(t) => { setPassword(t); setError(null); }} secureTextEntry />
          <AuthInput icon={IconLock} placeholder="Confirm password" value={confirm} onChangeText={(t) => { setConfirm(t); setError(null); }} secureTextEntry />
          <ErrorMessage message={error} />
          <AuthButton title="Register" loading={loading} onPress={handleRegister} />
          <TouchableOpacity onPress={() => setStep(0)} style={styles.footer}>
            <AppText style={{ color: colors.subtext }}>Back</AppText>
          </TouchableOpacity>
        </>
      )}

      {isStepOne && (
        <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.footer}>
          <AppText style={{ color: colors.subtext }}>Already have an account? <AppText style={{ color: colors.accent, fontWeight: '700' }}>Sign in</AppText></AppText>
        </TouchableOpacity>
      )}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  footer: { alignItems: 'center', marginTop: 16 }
});
