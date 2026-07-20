import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Dashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [parentName, setParentName] = useState(params.pName || "Parent");
  const [childrenIds, setChildrenIds] = useState([]);
  const [allChildrenData, setAllChildrenData] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(params.selectedChildId || params.cId || "");
  const [loading, setLoading] = useState(true);

  // Load user data from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          if (user.name) setParentName(user.name);
          if (user.children && Array.isArray(user.children)) {
            setChildrenIds(user.children);
            // Default to the first child in children array if not already selected
            const initialChildId = params.selectedChildId || params.cId || "";
            if (!initialChildId && user.children.length > 0) {
              setSelectedChildId(user.children[0]);
            }
          }
        }
      } catch (err) {
        console.error("Error loading user data from AsyncStorage:", err);
      }
    };
    loadUserData();
  }, [params.selectedChildId, params.cId]);

  // Fetch children details from the backend
  useEffect(() => {
    const fetchChildData = async () => {
      try {
        const res = await fetch(`http://172.22.74.230:5000/api/children`);
        const data = await res.json();

        if (Array.isArray(data)) {
          // If we have childrenIds, filter data to match only this parent's children
          if (childrenIds.length > 0) {
            const filtered = data.filter(c => childrenIds.includes(c.digitalHealthId));
            setAllChildrenData(filtered);
          } else {
            // Fallback: If no childrenIds loaded yet but we have selectedChildId, filter by that
            const targetId = selectedChildId || params.selectedChildId || params.cId;
            if (targetId) {
              const filtered = data.filter(c => c.digitalHealthId === targetId);
              setAllChildrenData(filtered);
            }
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildData();
  }, [childrenIds, selectedChildId, params.selectedChildId, params.cId]);

  const child = allChildrenData.find(c => c.digitalHealthId === selectedChildId);
  const displayChildName = child?.name || "Child";
  const displayChildId = selectedChildId || "N/A";
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

  if (!loading && allChildrenData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF9800" />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 15 }}>No Child Profile Linked</Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, marginBottom: 25 }}>
            Please contact the clinic or register a child profile to view health details.
          </Text>
          <TouchableOpacity style={{ backgroundColor: '#1E75FF', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 }} onPress={() => router.replace('/')}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBackToSelector = () => {
    router.replace({
      pathname: '/child-selector',
      params: {
        pName: parentName,
        childrenList: JSON.stringify(childrenIds)
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {allChildrenData.length > 1 && (
              <TouchableOpacity style={styles.backBtn} onPress={handleBackToSelector}>
                <Ionicons name="arrow-back" size={24} color="white" style={{ marginRight: 15 }} />
              </TouchableOpacity>
            )}
            <View>
              <Text style={styles.helloText}>Hello, {parentName}!</Text>
              <Text style={styles.profileTitle}>{`Baby ${displayChildName}'s Profile`}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/')}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Child Switcher Tabs (Only shown if parent has multiple children) */}
        {allChildrenData.length > 1 && (
          <View style={styles.switcherContainer}>
            <Text style={styles.switcherLabel}>Select Baby Profile:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switcherScroll}>
              {allChildrenData.map((item) => {
                const isSelected = item.digitalHealthId === selectedChildId;
                return (
                  <TouchableOpacity
                    key={item.digitalHealthId}
                    style={[styles.switcherTab, isSelected && styles.switcherTabActive]}
                    onPress={() => setSelectedChildId(item.digitalHealthId)}
                  >
                    <MaterialCommunityIcons
                      name="baby-face-outline"
                      size={18}
                      color={isSelected ? 'white' : '#1E75FF'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.switcherTabText, isSelected && styles.switcherTabTextActive]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Growth Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8EFFF' }]}>
              <MaterialCommunityIcons name="scale-bathroom" size={24} color="#4A90E2" />
            </View>
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={styles.statValue}>{weight}</Text>
            <Text style={styles.statDate}>Updated: {lastUpdate}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
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
    <View style={[styles.menuIconBox, { backgroundColor: `${color}15` }]}>
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
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  switcherContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 5,
  },
  switcherLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  switcherScroll: {
    paddingVertical: 5,
  },
  switcherTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  switcherTabActive: {
    backgroundColor: '#1E75FF',
    borderColor: '#1E75FF',
  },
  switcherTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  switcherTabTextActive: {
    color: 'white',
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20 },
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

