import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ ඔබේ Backend URL එක මෙතනට දාන්න (උදා: Localhost වෙනුවට ඔබේ IP Address එක)
const API_URL = 'http://192.168.x.x:5000/api/auth'; 

// 1. මව්පියන් ලියාපදිංචි කිරීම (Signup)
export const registerParent = async (name, digitalHealthId, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register-parent`, {
      name,
      digitalHealthId,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'Signup failed. Please try again.';
  }
};

// 2. ඇතුළු වීම (Login)
export const loginUser = async (identifier, password, role) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      identifier,
      password,
      role,
    });

    if (response.data.token) {
      // Token එක සහ User විස්තර (ළමයි ලැයිස්තුවත් එක්කම) AsyncStorage එකේ සේව් කරනවා
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'Login failed. Please try again.';
  }
};

// 3. තවත් දරුවෙක් එකතු කිරීම (Add Another Child)
export const addAdditionalChild = async (userId, digitalHealthId) => {
  try {
    const response = await axios.post(`${API_URL}/add-child`, {
      userId,
      digitalHealthId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'Failed to add child.';
  }
};