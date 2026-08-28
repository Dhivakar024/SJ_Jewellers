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
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { cleanIndianMobileDigits, isValidIndianMobile } from '../utils/phoneUtils';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { globalStyles } from '../styles/globalStyles';

export default function ForgotPasswordScreen({ navigation }) {
  // Steps: 'mobile' -> 'otp' -> 'new-password'
  const [step, setStep] = useState('mobile');

  const [mobileDigits, setMobileDigits] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMobileChange = (val) => {
    const cleaned = cleanIndianMobileDigits(val);
    setMobileDigits(cleaned);
    if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: '' }));
    setErrorMessage('');
  };

  const handleOtpChange = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
    if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
    setErrorMessage('');
  };

  const handleBack = () => {
    if (step === 'new-password') {
      setStep('otp');
      setErrors({});
      setErrorMessage('');
    } else if (step === 'otp') {
      setStep('mobile');
      setErrors({});
      setErrorMessage('');
      setSuccessMessage('');
    } else {
      navigation.goBack();
    }
  };

  // STEP 1: Get OTP
  const handleGetOtp = () => {
    if (isLoading) return;
    setErrorMessage('');
    setSuccessMessage('');

    const cleanMobile = cleanIndianMobileDigits(mobileDigits);
    if (!cleanMobile || cleanMobile.length !== 10 || !isValidIndianMobile(cleanMobile)) {
      setErrors({ mobile: 'Enter a valid 10-digit mobile number' });
      return;
    }
    setErrors({});

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('OTP has been sent to your registered mobile number.');
      setStep('otp');
    }, 400);
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = () => {
    if (isLoading) return;
    setErrorMessage('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setErrors({ otp: 'Please enter the complete OTP' });
      return;
    }
    setErrors({});

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('');
      setStep('new-password');
    }, 300);
  };

  // STEP 3: Reset Password
  const handleResetPassword = () => {
    if (isLoading) return;
    setErrorMessage('');

    const newErrors = {};
    const uPass = password.trim();
    const uConfirmPass = confirmPassword.trim();

    if (!uPass) {
      newErrors.password = 'Please enter a new password';
    } else if (uPass.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!uConfirmPass) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (uPass !== uConfirmPass) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Password reset successful! Please sign in with your new password.');
      navigation.navigate('SignIn');
    }, 500);
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
        {/* Header with Back Button */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Back"
          >
            <ArrowLeft size={22} color="#1e1b2e" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Forgot Password?</Text>
            <Text style={styles.headerSubtitle}>
              Reset your password with mobile OTP
            </Text>
          </View>
        </View>

        {/* Messages */}
        {errorMessage ? (
          <View style={globalStyles.errorBox}>
            <Text style={globalStyles.errorBoxText}>{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={globalStyles.successBox}>
            <Text style={globalStyles.successBoxText}>{successMessage}</Text>
          </View>
        ) : null}

        {/* STEP 1: Enter Mobile */}
        {step === 'mobile' && (
          <View style={styles.formContainer}>
            <View style={globalStyles.inputGroup}>
              <Text style={globalStyles.inputLabel}>Registered Mobile Number</Text>
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
              {errors.mobile ? <Text style={globalStyles.fieldErrorText}>{errors.mobile}</Text> : null}
            </View>

            <TouchableOpacity
              style={[globalStyles.primaryButton, { marginTop: 8 }, isLoading && { opacity: 0.7 }]}
              onPress={handleGetOtp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={globalStyles.primaryButtonText}>Get OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 'otp' && (
          <View style={styles.formContainer}>
            <Text style={styles.otpNotice}>
              Enter the OTP sent to <Text style={styles.otpMobileText}>+91 {mobileDigits}</Text>
            </Text>

            <View style={globalStyles.inputGroup}>
              <Text style={globalStyles.inputLabel}>OTP Code</Text>
              <TextInput
                style={[globalStyles.inputField, styles.otpInput]}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor={COLORS.textMuted}
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isLoading}
              />
              {errors.otp ? <Text style={globalStyles.fieldErrorText}>{errors.otp}</Text> : null}
            </View>

            <TouchableOpacity
              style={[globalStyles.primaryButton, { marginTop: 8 }, isLoading && { opacity: 0.7 }]}
              onPress={handleVerifyOtp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={globalStyles.primaryButtonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={handleGetOtp}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: New Password */}
        {step === 'new-password' && (
          <View style={styles.formContainer}>
            <View style={globalStyles.inputGroup}>
              <Text style={globalStyles.inputLabel}>New Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[globalStyles.inputField, styles.passwordInput]}
                  placeholder="Min 8 characters"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#8b849c" />
                  ) : (
                    <Eye size={20} color="#8b849c" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={globalStyles.fieldErrorText}>{errors.password}</Text> : null}
            </View>

            <View style={globalStyles.inputGroup}>
              <Text style={globalStyles.inputLabel}>Confirm New Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[globalStyles.inputField, styles.passwordInput]}
                  placeholder="Confirm New Password"
                  placeholderTextColor={COLORS.textMuted}
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    setErrorMessage('');
                  }}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#8b849c" />
                  ) : (
                    <Eye size={20} color="#8b849c" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? <Text style={globalStyles.fieldErrorText}>{errors.confirmPassword}</Text> : null}
            </View>

            <TouchableOpacity
              style={[globalStyles.primaryButton, { marginTop: 8 }, isLoading && { opacity: 0.7 }]}
              onPress={handleResetPassword}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={globalStyles.primaryButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Footer to Sign In */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Remember your password? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.7}
          >
            <Text style={styles.signInLink}>Sign In</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 20,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    ...SHADOWS.light,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  headerSubtitle: {
    fontSize: 13.5,
    color: COLORS.primaryPurple,
    fontWeight: '700',
    marginTop: 4,
  },
  formContainer: {
    marginBottom: 16,
  },
  otpNotice: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  otpMobileText: {
    fontWeight: '800',
    color: COLORS.textDark,
  },
  otpInput: {
    textAlign: 'center',
    letterSpacing: 6,
    fontSize: 18,
    fontWeight: '800',
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
  resendBtn: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 8,
  },
  resendText: {
    color: COLORS.primaryPurple,
    fontSize: 14,
    fontWeight: '800',
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
  signInLink: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.primaryPurple,
  },
});
