import axios from 'axios';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async () => {
    // empty fields validation
    if (!identifier || !password) {
      Alert.alert('Required Information', 'Please enter your email/phone number and password.');
      return;
    }

    try {
      const response = await axios.post('http://10.49.217.230:5000/api/auth/login', {
        identifier, 
        password,
        role: 'parent'
      });

      if (response.status === 200) {
        const { name, children } = response.data.user; // array coming from backend

        // Validation & Navigation Logic: changing according to the number of children
        if (!children || children.length === 0) {
          Alert.alert('No Profiles Found', 'There are no child profiles linked to this account.');
        } else if (children.length > 1) {
          // 2 children or more -> navigate to child-selector screen
          router.replace({
            pathname: '/child-selector',
            params: { 
              pName: name,
              childrenList: JSON.stringify(children) 
            }
          });
        } else {
          // 1 child -> navigate directly to dashboard with that child's ID
          router.replace({
            pathname: '/dashboard',
            params: {
              pName: name,
              selectedChildId: children[0]
            }
          });
        }
      }
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.msg || 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.logoContainer}>
             <View style={styles.iconBox}>
                <Ionicons name="heart" size={40} color="white" />
             </View>
          </View>
          <Text style={styles.headerText1}>MediKid</Text>
          <Text style={styles.headerText}>Welcome Back</Text>
          <Text style={styles.subText}>{"Sign in to access your child's health records"}</Text>

          <View style={styles.inputSection}>
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

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput 
                style={styles.passwordInput} 
                placeholder="Enter your password" 
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{"Don't have an account?"}</Text>
            <TouchableOpacity onPress={() => router.navigate('/signup')}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 25, paddingTop: 60, paddingBottom: 40 },
  logoContainer: { marginBottom: 30 },
  iconBox: { backgroundColor: '#007bff', width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  headerText1: { fontSize: 32, fontWeight: 'bold', color: '#007bff' },
  headerText: { fontSize: 30, fontWeight: 'bold', color: '#1a1a1a' },
  subText: { fontSize: 16, color: '#666', marginTop: 8, marginBottom: 30 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { height: 55, borderWidth: 1, borderColor: '#e1e1e1', borderRadius: 12, paddingHorizontal: 15, fontSize: 16, marginBottom: 20 },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e1e1e1', borderRadius: 12, paddingHorizontal: 15, height: 55, marginBottom: 10 },
  passwordInput: { flex: 1, fontSize: 16 },
  signInButton: { backgroundColor: '#007bff', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  signInButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#666' },
  signUpText: { color: '#007bff', fontWeight: 'bold' }
});