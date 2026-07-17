import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SelectChild() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Login එකෙන් එවූ childIds string එක නැවත Array එකක් බවට පත් කිරීම
  const children = params.childIds ? JSON.parse(params.childIds) : [];
  const parentName = params.pName || "Parent";

  const handleSelect = (selectedId) => {
  router.push({
    pathname: '/dashboard',
    params: { 
      cId: selectedId, // මෙන්න මේ ID එක Dashboard එකේ QR එකට පාවිච්චි වෙනවා
      pName: parentName 
    }
  });
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Select Your Child</Text>
        <Text style={styles.subtitle}>Welcome, {parentName}. Please select a profile to continue.</Text>
        
        {children.length > 0 ? (
          children.map((id, index) => (
            <TouchableOpacity key={index} style={styles.card} onPress={() => handleSelect(id)}>
              <View style={styles.avatarBox}>
                <MaterialCommunityIcons name="baby-face-outline" size={30} color="#007bff" />
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.childIdText}>Child ID: {id}</Text>
                <Text style={styles.viewText}>Click to view profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#CCC" />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noData}>No children linked to this account.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 25 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#666', marginTop: 10, marginBottom: 40 },
  card: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    padding: 20, borderRadius: 18, marginBottom: 15, 
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 
  },
  avatarBox: { backgroundColor: '#E7F1FF', padding: 12, borderRadius: 12 },
  infoBox: { flex: 1, marginLeft: 15 },
  childIdText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  viewText: { fontSize: 13, color: '#007bff', marginTop: 2 },
  noData: { textAlign: 'center', color: '#999', marginTop: 50 }
});