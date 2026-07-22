import axios from 'axios';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = request reset OTP, 2 = verify and reset
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);

  const handleRequestOtp = async () => {
    if (!identifier) {
      Alert.alert('Required Info', 'Please enter your email or phone number.');
      return;
    }

    try {
      const response = await axios.post('http://172.22.74.230:5000/api/auth/forgot-password', {
        identifier
      });

      if (response.status === 200) {
        Alert.alert('OTP Dispatched', 'A mock verification code "1234" has been generated for password reset.');
        setStep(2);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed to verify account. Please try again.');
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      Alert.alert('Required Info', 'Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Match Error', 'New password and confirm password do not match.');
      return;
    }

    try {
      const response = await axios.post('http://172.22.74.230:5000/api/auth/reset-password', {
        identifier,
        otp,
        newPassword
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Your password has been reset successfully.', [
          { text: 'Login', onPress: () => router.replace('/') }
        ]);
      }
    } catch (err) {
      Alert.alert('Reset Failed', err.response?.data?.msg || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>

          <Text style={styles.headerText}>Reset Password</Text>
          
          {step === 1 ? (
            <View style={styles.formContainer}>
              <Text style={styles.subText}>Enter the email address or phone number associated with your account to receive a reset code.</Text>
              
              <Text style={styles.label}>Email Address or Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com or 077XXXXXXX"
                value={identifier}
                onChangeText={setIdentifier}
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity style={styles.primaryButton} onPress={handleRequestOtp}>
                <Text style={styles.primaryButtonText}>Send Reset Code</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.subText}>Enter the 4-digit code and your new password below.</Text>

              <Text style={styles.label}>OTP Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 4-digit code (Use 1234)"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={4}
              />

              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="At least 6 characters"
                  secureTextEntry={!newPasswordVisible}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setNewPasswordVisible(!newPasswordVisible)}>
                  <Ionicons name={newPasswordVisible ? "eye-off" : "eye"} size={20} color="#999" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={[styles.input, { marginBottom: 30 }]}
                placeholder="Re-enter password"
                secureTextEntry={!newPasswordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <TouchableOpacity style={styles.primaryButton} onPress={handleResetPassword}>
                <Text style={styles.primaryButtonText}>Reset Password</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 25, paddingTop: 40, paddingBottom: 40 },
  backButton: { width: 40, height: 40, justifyContent: 'center', marginBottom: 20 },
  headerText: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
  subText: { fontSize: 15, color: '#666', lineHeight: 22, marginBottom: 30 },
  formContainer: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { height: 55, borderWidth: 1, borderColor: '#e1e1e1', borderRadius: 12, paddingHorizontal: 15, fontSize: 16, marginBottom: 20 },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e1e1e1', borderRadius: 12, paddingHorizontal: 15, height: 55, marginBottom: 20 },
  passwordInput: { flex: 1, fontSize: 16 },
  primaryButton: { backgroundColor: '#007bff', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
