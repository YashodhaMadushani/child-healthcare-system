import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ChildSelectorScreen() {
  const router = useRouter();
  const { pName, childrenList } = useLocalSearchParams();
  
  // Stringify කරලා එවපු Array එක නැවත Parse කරගන්නවා
  const children = childrenList ? JSON.parse(childrenList) : [];

  const handleSelectChild = (digitalHealthId) => {
    // තෝරාගත් දරුවාගේ ID එකත් අරන් Dashboard එකට යනවා
    router.replace({
      pathname: '/dashboard',
      params: {
        pName: pName,
        selectedChildId: digitalHealthId
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>ආයුබෝවන්, {pName} 👋</Text>
        <Text style={styles.title}>දරුවා තෝරන්න</Text>
        <Text style={styles.subTitle}>විස්තර බැලීම සඳහා අවශ්‍ය දරුවාගේ Digital ID එක මත ක්ලික් කරන්න.</Text>

        <FlatList
          data={children}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleSelectChild(item)}>
              <View style={styles.avatarBox}>
                <Ionicons name="person" size={28} color="#007bff" />
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.idLabel}>Digital Health ID</Text>
                <Text style={styles.idValue}>{item}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { paddingHorizontal: 25, paddingTop: 40 },
  welcomeText: { fontSize: 16, color: '#666', fontWeight: '500' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginTop: 5 },
  subTitle: { fontSize: 14, color: '#666', marginTop: 8, marginBottom: 30 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#efefef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  avatarBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#e6f2ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoBox: { flex: 1 },
  idLabel: { fontSize: 12, color: '#999', fontWeight: '600', uppercase: true },
  idValue: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 2 }
});