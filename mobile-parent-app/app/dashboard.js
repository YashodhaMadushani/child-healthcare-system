import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Dashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetching the Child ID and Parent Name from the login
  const parentName = params.pName || "Parent";
  const childIdFromLogin = params.cId || ""; 

  useEffect(() => {
    const fetchChildData = async () => {
      if (!childIdFromLogin) {
        setLoading(false);
        return;
      }
      try {
        // Sending a request to the backend 
        const res = await fetch(`http://10.161.5.230:5000/api/children?childId=${childIdFromLogin}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          
          const currentChild = data.find(c => c.childId === childIdFromLogin);
          setChild(currentChild);
        } else {
          setChild(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildData();
  }, [childIdFromLogin]);

  
  const displayChildName = child?.childName || "Child";
  const displayChildId = childIdFromLogin || "N/A";
  const weight = child?.birthWeight ? `${child.birthWeight} kg` : "-- kg";
  const height = child?.birthHeight ? `${child.birthHeight} cm` : "-- cm";
  const lastUpdate = child?.updatedAt ? new Date(child.updatedAt).toLocaleDateString() : "Pending";

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E75FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.helloText}>Hello, {parentName}!</Text>
            <Text style={styles.profileTitle}>{`Baby ${displayChildName}'s Profile`}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/')}> 
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Growth Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, {backgroundColor: '#E8EFFF'}]}>
              <MaterialCommunityIcons name="scale-bathroom" size={24} color="#4A90E2" />
            </View>
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={styles.statValue}>{weight}</Text>
            <Text style={styles.statDate}>Updated: {lastUpdate}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, {backgroundColor: '#E8F5E9'}]}>
              <MaterialCommunityIcons name="ruler" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statLabel}>Height</Text>
            <Text style={styles.statValue}>{height}</Text>
            <Text style={styles.statDate}>Updated: {lastUpdate}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <MenuButton icon="trending-up" title="Growth Charts" color="#4A90E2" />
          <MenuButton icon="shield-check-outline" title="Vaccination Status" color="#9C27B0" />
          <MenuButton icon="calendar-month-outline" title="Upcoming Clinics" color="#FF9800" />
        </View>

        {/* Digital Clinic ID Section */}
        <View style={styles.qrSection}>
          <Text style={styles.qrHeading}>Digital Clinic ID</Text>
          <View style={styles.qrWhiteBox}>
            <QRCode value={displayChildId} size={160} />
          </View>
          <Text style={styles.childIdLabel}>Child ID</Text>
          <Text style={styles.childIdValue}>{displayChildId}</Text>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>Show this QR code to the Midwife at the clinic.</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Component for Menu
const MenuButton = ({ icon, title, color }) => (
  <TouchableOpacity style={styles.menuItem}>
    <View style={[styles.menuIconBox, {backgroundColor: `${color}15`}]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.menuTitle}>{title}</Text>
    <Ionicons name="chevron-forward" size={20} color="#CCC" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  headerContainer: { 
    backgroundColor: '#1E75FF', 
    paddingHorizontal: 25, paddingVertical: 40,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  helloText: { color: '#E0EFFF', fontSize: 16 },
  profileTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: -30 },
  statCard: { backgroundColor: 'white', width: '47%', padding: 20, borderRadius: 20, elevation: 4 },
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statLabel: { color: '#888', fontSize: 14 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  statDate: { color: '#AAA', fontSize: 11 },
  menuContainer: { paddingHorizontal: 20, marginTop: 25 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 12 },
  menuIconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#444' },
  qrSection: { backgroundColor: '#EBF5FF', margin: 20, padding: 25, borderRadius: 25, alignItems: 'center' },
  qrHeading: { fontSize: 18, color: '#555', marginBottom: 20 },
  qrWhiteBox: { backgroundColor: 'white', padding: 15, borderRadius: 20, marginBottom: 15 },
  childIdLabel: { color: '#888', fontSize: 13 },
  childIdValue: { fontSize: 18, fontWeight: 'bold', color: '#1E75FF', marginBottom: 15 },
  instructionBox: { backgroundColor: 'white', padding: 12, borderRadius: 12, width: '100%' },
  instructionText: { color: '#666', fontSize: 13, textAlign: 'center' }
}); 

