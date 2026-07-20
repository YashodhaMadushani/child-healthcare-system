import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ChildSelectorScreen() {
  const router = useRouter();
  const { pName, childrenList } = useLocalSearchParams();
  
  const [childrenDetails, setChildrenDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = childrenList ? JSON.parse(childrenList) : [];
    
    const fetchChildrenDetails = async () => {
      try {
        const res = await fetch(`http://172.22.74.230:5000/api/children`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          // Filter data to get only the children that belong to this parent
          const filtered = data.filter(c => ids.includes(c.digitalHealthId));
          setChildrenDetails(filtered);
        }
      } catch (err) {
        console.error("Error fetching children details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (ids.length > 0) {
      fetchChildrenDetails();
    } else {
      setLoading(false);
    }
  }, [childrenList]);

  const handleSelectChild = (digitalHealthId) => {
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
        <Text style={styles.subTitle}>විස්තර බැලීම සඳහා අවශ්‍ය දරුවාගේ නම හෝ Digital ID එක මත ක්ලික් කරන්න.</Text>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
            <ActivityIndicator size="large" color="#007bff" />
          </View>
        ) : childrenDetails.length > 0 ? (
          <FlatList
            data={childrenDetails}
            keyExtractor={(item) => item.digitalHealthId}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => handleSelectChild(item.digitalHealthId)}>
                <View style={styles.avatarBox}>
                  <MaterialCommunityIcons name="baby-face-outline" size={32} color="#007bff" />
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.nameText}>{item.name}</Text>
                  <Text style={styles.dobText}>DOB: {item.dob ? new Date(item.dob).toLocaleDateString() : "N/A"} ({item.gender})</Text>
                  <Text style={styles.idValue}>{item.digitalHealthId}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <Text style={{ color: '#999', fontSize: 16 }}>දරුවන් කිසිවෙකු සොයාගත නොහැකි විය.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { paddingHorizontal: 25, paddingTop: 40, flex: 1 },
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
  nameText: { fontSize: 18, fontWeight: '700', color: '#333' },
  dobText: { fontSize: 13, color: '#666', marginTop: 2 },
  idValue: { fontSize: 12, fontWeight: '600', color: '#999', marginTop: 4 }
});