import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const [name, setName] = useState(''); 
  const [digitalHealthId, setDigitalHealthId] = useState(''); 
  const [contactMethod, setContactMethod] = useState('email'); 
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  const router = useRouter();
  const BACKEND_URL = 'http://10.49.217.230:5000/api/auth/register-parent';

  const handleSignup = async () => {
    
    if (!name || !digitalHealthId || !password) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    if (contactMethod === 'email' && !email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    if (contactMethod === 'phone' && !phone) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    try {
      // step 1 : request OTP code from backend
      if (!otpRequired) {
        const response = await axios.post(BACKEND_URL, {
          name,
          digitalHealthId,
          email: contactMethod === 'email' ? email : undefined,
          phone: contactMethod === 'phone' ? phone : undefined,
          password,
          isOtpVerification: false
        });

        if (response.status === 200) {
          setOtpRequired(true);
          Alert.alert("Verification", "A verification OTP code has been sent. (Use '1234' for testing)");
        }
        return;
      }

      // step 2: verify the account with the OTP code
      if (!otpCode) {
        Alert.alert("Error", "Please enter the OTP code");
        return;
      }

      const finalResponse = await axios.post(BACKEND_URL, {
        name,
        digitalHealthId,
        email: contactMethod === 'email' ? email : undefined,
        phone: contactMethod === 'phone' ? phone : undefined,
        password,
        otp: otpCode,
        isOtpVerification: true
      });

      if (finalResponse.status === 201) {
        Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => router.push('/') }
        ]);
      }

    } catch (error) {
      console.log("Error details:", error.response?.data);
      Alert.alert("Error", error.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerText}>Create Account</Text>
        <Text style={styles.subText}>{"Enter details to monitor your child's health"}</Text>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter your name" 
            value={name}
            onChangeText={setName}
            editable={!otpRequired}
          />

          <Text style={styles.label}>Digital Health ID</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. SL-2026-01" 
            value={digitalHealthId}
            onChangeText={setDigitalHealthId}
            editable={!otpRequired}
          />

         
          <Text style={styles.label}>Register Using</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, contactMethod === 'email' && styles.activeTab]} 
              onPress={() => !otpRequired && setContactMethod('email')}
            >
              <Text style={[styles.tabText, contactMethod === 'email' && styles.activeTabText]}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, contactMethod === 'phone' && styles.activeTab]} 
              onPress={() => !otpRequired && setContactMethod('phone')}
            >
              <Text style={[styles.tabText, contactMethod === 'phone' && styles.activeTabText]}>Phone Number</Text>
            </TouchableOpacity>
          </View>

          {contactMethod === 'email' ? (
            <View>
              <Text style={styles.label}>Email Address</Text>
              <TextInput 
                style={styles.input} 
                placeholder="parent@example.com" 
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!otpRequired}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. 0771234567" 
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!otpRequired}
              />
            </View>
          )}

          <Text style={styles.label}>Password</Text>
          <View style={{ position: 'relative' }}>
            <TextInput 
              style={styles.input} 
              placeholder="Create a password" 
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
              editable={!otpRequired}
            />
            <TouchableOpacity
              style={{ position: 'absolute', right: 15, top: 18 }}
              onPress={() => setPasswordVisible(v => !v)}
            >
              <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={22} color="#888" />
            </TouchableOpacity>
          </View>

          
          {otpRequired && (
            <View style={styles.otpBox}>
              <Text style={[styles.label, { color: '#007bff' }]}>Enter 4-Digit OTP Code</Text>
              <TextInput 
                style={[styles.input, { borderColor: '#007bff', borderWidth: 2, textDisplay: 'center', fontSize: 20 }]} 
                placeholder="X - X - X - X" 
                value={otpCode}
                onChangeText={otpCode => setOtpCode(otpCode)}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.signUpButton} onPress={handleSignup}>
          <Text style={styles.signUpButtonText}>
            {otpRequired ? "Verify & Register" : "Send OTP"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 25, paddingTop: 50, paddingBottom: 40 },
  headerText: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },
  subText: { fontSize: 16, color: '#666', marginTop: 8, marginBottom: 30 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { height: 55, borderWidth: 1, borderColor: '#e1e1e1', borderRadius: 12, paddingHorizontal: 15, marginBottom: 20, fontSize: 16 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 10, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
  tabText: { fontSize: 14, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#007bff', fontWeight: 'bold' },
  otpBox: { marginTop: 10, backgroundColor: '#f0f7ff', padding: 15, borderRadius: 12, marginBottom: 20 },
  signUpButton: { backgroundColor: '#007bff', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  signUpButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});