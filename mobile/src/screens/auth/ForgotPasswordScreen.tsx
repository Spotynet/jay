import React, { useState } from 'react';
import { View, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthLayout } from './components/AuthLayout';
import { AuthInput } from './components/AuthInput';
import { AuthButton } from './components/AuthButton';
import { CodeInput } from './components/CodeInput';
import { ErrorMessage } from './components/ErrorMessage';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../../components/ui/AppText';
import { IconMail, IconLock, IconKey } from 'tabler-icons-react-native';
import { useNavigation } from '@react-navigation/native';
import { checkEmailExists } from '../../api/emailCheck';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleNext = async () => {
    if (step === 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) { setError('Please enter a valid email address'); return; }
      
      setLoading(true);
      try {
        const { exists } = await checkEmailExists(email);
        if (!exists) {
          setError('No account found with this email');
        } else {
          setError(null);
          setStep(1);
        }
      } catch {
        setError('Failed to verify email');
      } finally {
        setLoading(false);
      }
    } else if (step === 1) {
      if (code !== '111111') { setError('Invalid code'); return; }
      setStep(2);
    }
  };

  const handleReset = () => {
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <AuthLayout title="Success" tagline="PASSWORD UPDATED">
        <AppText style={{ textAlign: 'center', marginBottom: 24, color: colors.text }}>Your password has been updated successfully.</AppText>
        <AuthButton title="Return to Login" onPress={() => navigation.replace('Login')} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title={step === 0 ? "Reset password" : step === 1 ? "Verify code" : "New password"} 
      subtitle={step === 0 ? "Enter your email" : step === 1 ? "Enter 111111" : "Create new credentials"}
      showSocial={false}
      progress={(step + 1) / 3}
    >
      {step === 0 && (
        <>
          <AuthInput icon={IconMail} placeholder="Email" value={email} onChangeText={(t) => { setEmail(t); setError(null); }} autoCapitalize="none" />
          <ErrorMessage message={error} />
          <AuthButton title="Next" onPress={handleNext} />
        </>
      )}
      {step === 1 && (
        <>
          <CodeInput code={code} setCode={(t) => { setCode(t); setError(null); }} />
          <ErrorMessage message={error} />
          <AuthButton title="Verify" onPress={handleNext} />
        </>
      )}
      {step === 2 && (
        <>
          <AuthInput icon={IconLock} placeholder="New password" value={password} onChangeText={setPassword} secureTextEntry />
          <AuthInput icon={IconLock} placeholder="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry />
          <ErrorMessage message={error} />
          <AuthButton title="Reset Password" loading={loading} onPress={handleReset} />
        </>
      )}
      
      <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.footer}>
        <AppText style={{ color: colors.subtext }}>Back to sign in</AppText>
      </TouchableOpacity>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  footer: { alignItems: 'center', marginTop: 16 }
});
