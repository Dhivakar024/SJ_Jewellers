import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Phone, Eye, EyeOff } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { CUSTOMER_SUPPORT_PHONE } from '../constants/config';
import { cleanIndianMobileDigits, formatToE164, isValidIndianMobile } from '../utils/phoneUtils';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { globalStyles } from '../styles/globalStyles';

export default function SignInScreen({ navigation }) {
  const { loginUser } = useApp();
  const [mobileDigits, setMobileDigits] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMobileChange = (val) => {
    const cleaned = cleanIndianMobileDigits(val);
    setMobileDigits(cleaned);
    setErrorMessage('');
  };

  const handleSignIn = async () => {
    if (isLoading) return;
    setErrorMessage('');

    if (!mobileDigits) {
      setErrorMessage('Mobile number is required');
      return;
    }

    if (mobileDigits.length !== 10 || !isValidIndianMobile(mobileDigits)) {
      setErrorMessage('Enter a valid 10-digit mobile number');
      return;
    }

    const pass = password.trim();
    if (!pass) {
      setErrorMessage('Password is required');
      return;
    }

    setIsLoading(true);
    try {
      const formattedMobile = formatToE164(mobileDigits);
      const user = await loginUser({
        identifier: formattedMobile,
        mobile: formattedMobile,
        password: pass,
      });

      if (!user.profileCompleted) {
        navigation.replace('CreateProfile', { mode: 'create' });
      } else {
        navigation.replace('Home');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid mobile number or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallSupport = () => {
    const digits = CUSTOMER_SUPPORT_PHONE.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${digits}`).catch((err) => {
      console.warn('Cannot open phone dialer:', err);
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Centered Heading */}
        <View style={styles.authHeader}>
          <Text style={styles.headingTitle}>
            Welcome !{'\n'}Glad to see you !
          </Text>
        </View>

        {/* Error Alert */}
        {errorMessage ? (
          <View style={globalStyles.errorBox}>
            <Text style={globalStyles.errorBoxText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Form Card */}
        <View style={styles.formContainer}>
          {/* Mobile Number */}
          <View style={globalStyles.inputGroup}>
            <Text style={globalStyles.inputLabel}>Mobile Number</Text>
            <TextInput
              style={globalStyles.inputField}
              placeholder="Enter 10-digit Mobile Number"
              placeholderTextColor={COLORS.textMuted}
              value={mobileDigits}
              onChangeText={handleMobileChange}
              keyboardType="number-pad"
              maxLength={10}
              editable={!isLoading}
            />
          </View>

          {/* Password */}
          <View style={globalStyles.inputGroup}>
            <Text style={globalStyles.inputLabel}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[globalStyles.inputField, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#8b849c" />
                ) : (
                  <Eye size={20} color="#8b849c" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotPassBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPassText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Submit Sign In Button */}
          <TouchableOpacity
            style={[globalStyles.primaryButton, isLoading && { opacity: 0.7 }]}
            onPress={handleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={globalStyles.primaryButtonText}>Sign in</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Customer Support Card */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Need help signing in?</Text>
          <Text style={styles.supportDesc}>
            If you forgot your password or are unable to access your account, please contact Customer Support for account verification and assistance.
          </Text>
          <TouchableOpacity
            style={styles.supportCallBtn}
            onPress={handleCallSupport}
            activeOpacity={0.8}
          >
            <Phone size={14} color={COLORS.primaryPurple} />
            <Text style={styles.supportCallText}>{CUSTOMER_SUPPORT_PHONE}</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Navigation Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
            activeOpacity={0.7}
          >
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLavender,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  authHeader: {
    marginBottom: 20,
    marginTop: 10,
  },
  headingTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textDark,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  formContainer: {
    marginBottom: 16,
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  forgotPassText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryPurple,
  },
  supportCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.lg,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e8e2fa',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  supportDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 10,
  },
  supportCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryPurpleLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#ded5fb',
  },
  supportCallText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.primaryPurple,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  signUpLink: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.primaryPurple,
  },
});
