import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Line, Circle, Polyline, Text as SvgText } from 'react-native-svg';
import { translations } from '../constants/translations';

const GrowthChart = ({ records, type }) => {
  if (!records || records.length === 0) return null;

  const width = 330;
  const height = 190;
  const paddingLeft = 40;
  const paddingBottom = 30;
  const paddingTop = 20;
  const paddingRight = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = records.map(r => type === 'weight' ? r.weight : r.height).filter(v => v !== undefined && v !== null);
  if (values.length === 0) {
    return <Text style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13, marginVertical: 20 }}>No records found</Text>;
  }

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const valueRange = maxValue - minValue || 1;

  // Buffer at top and bottom
  const yMax = maxValue + (valueRange * 0.1);
  const yMin = Math.max(0, minValue - (valueRange * 0.1));
  const yRange = yMax - yMin || 1;

  const points = records.map((r, i) => {
    const val = type === 'weight' ? r.weight : r.height;
    const x = paddingLeft + (i * (chartWidth / (records.length - 1 || 1)));
    const y = paddingTop + chartHeight - (((val - yMin) / yRange) * chartHeight);
    return { x, y, value: val, label: r.ageInterval || 'Birth' };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={{ alignItems: 'center', marginVertical: 10, backgroundColor: '#F8FAFC', borderRadius: 15, padding: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
      <Svg width={width} height={height}>
        {/* Y Axis Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = paddingTop + chartHeight * ratio;
          const val = (yMax - (ratio * yRange)).toFixed(1);
          return (
            <React.Fragment key={index}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <SvgText
                x={paddingLeft - 8}
                y={y + 4}
                fontSize="10"
                fill="#94A3B8"
                textAnchor="end"
              >
                {val}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* X Axis Labels */}
        {points.map((p, i) => (
          <SvgText
            key={i}
            x={p.x}
            y={height - 8}
            fontSize="9"
            fill="#94A3B8"
            textAnchor="middle"
          >
            {p.label}
          </SvgText>
        ))}

        {/* Trend Line */}
        {points.length > 1 && (
          <Polyline
            points={polylinePoints}
            fill="none"
            stroke={type === 'weight' ? '#1E75FF' : '#4CAF50'}
            strokeWidth="3"
          />
        )}

        {/* Data Points */}
        {points.map((p, i) => (
          <React.Fragment key={i}>
            <Circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill="white"
              stroke={type === 'weight' ? '#1E75FF' : '#4CAF50'}
              strokeWidth="2.5"
            />
            <SvgText
              x={p.x}
              y={p.y - 8}
              fontSize="9"
              fontWeight="bold"
              fill="#334155"
              textAnchor="middle"
            >
              {p.value}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};

const MILESTONES_DATA = {
  '6m': ['m1_6', 'm2_6', 'm3_6'],
  '12m': ['m1_12', 'm2_12', 'm3_12'],
  '18m': ['m1_18', 'm2_18', 'm3_18'],
};

export default function Dashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [parentName, setParentName] = useState(params.pName || "Parent");
  const [parentPhone, setParentPhone] = useState("");
  const [childrenIds, setChildrenIds] = useState([]);
  const [allChildrenData, setAllChildrenData] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(params.selectedChildId || params.cId || "");
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'growth', 'vaccines', 'clinics', null
  const [chartType, setChartType] = useState('weight'); // 'weight' or 'height'
  const [lang, setLang] = useState('en');
  const [milestoneAgeTab, setMilestoneAgeTab] = useState('6m');
  const [checkedMilestones, setCheckedMilestones] = useState({});

  useEffect(() => {
    const loadMilestones = async () => {
      try {
        const stored = await AsyncStorage.getItem('checkedMilestones');
        if (stored) {
          setCheckedMilestones(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Failed to load milestones:", err);
      }
    };
    loadMilestones();
  }, []);

  const toggleMilestone = async (key) => {
    const newChecked = {
      ...checkedMilestones,
      [key]: !checkedMilestones[key]
    };
    setCheckedMilestones(newChecked);
    try {
      await AsyncStorage.setItem('checkedMilestones', JSON.stringify(newChecked));
    } catch (err) {
      console.error("Failed to save milestones:", err);
    }
  };

  // Load language settings on mount
  useEffect(() => {
    const loadLang = async () => {
      const savedLang = await AsyncStorage.getItem('lang');
      if (savedLang) setLang(savedLang);
    };
    loadLang();
  }, []);

  const changeLanguage = async (newLang) => {
    setLang(newLang);
    await AsyncStorage.setItem('lang', newLang);
  };

  const t = translations[lang];

  // Load user data from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          if (user.name) setParentName(user.name);
          if (user.phone) setParentPhone(user.phone);
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
          // Filter data to match parent's children by either childrenIds OR matching phone number
          const filtered = data.filter(c => 
            childrenIds.includes(c.digitalHealthId) || 
            (parentPhone && (c.phone === parentPhone || c.secondaryPhone === parentPhone))
          );
          
          setAllChildrenData(filtered);

          // Update childrenIds and AsyncStorage if new children were discovered
          const foundIds = filtered.map(c => c.digitalHealthId);
          if (foundIds.length > 0) {
            const needsUpdate = foundIds.some(id => !childrenIds.includes(id)) || foundIds.length !== childrenIds.length;
            if (needsUpdate) {
              setChildrenIds(foundIds);
              const userJson = await AsyncStorage.getItem('user');
              if (userJson) {
                const user = JSON.parse(userJson);
                user.children = foundIds;
                await AsyncStorage.setItem('user', JSON.stringify(user));
              }
              // Set selected child if not already selected
              if (!selectedChildId && foundIds.length > 0) {
                setSelectedChildId(foundIds[0]);
              }
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
  }, [childrenIds, selectedChildId, parentPhone, params.selectedChildId, params.cId]);

  const child = allChildrenData.find(c => c.digitalHealthId === selectedChildId);
  const displayChildName = child?.name || "Child";
  const displayChildId = selectedChildId || "N/A";
  const latestGrowthRecord = child?.growthRecords && child.growthRecords.length > 0
    ? child.growthRecords[child.growthRecords.length - 1]
    : null;

  const currentWeight = latestGrowthRecord?.weight ?? child?.birthWeight;
  const currentHeight = latestGrowthRecord?.height ?? child?.birthHeight;

  const weight = currentWeight ? `${currentWeight} kg` : "-- kg";
  const height = currentHeight ? `${currentHeight} cm` : "-- cm";
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
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
            {allChildrenData.length > 1 && (
              <TouchableOpacity style={styles.backBtn} onPress={handleBackToSelector}>
                <Ionicons name="arrow-back" size={24} color="white" style={{ marginRight: 15 }} />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.helloText}>{t.hello}, {parentName}!</Text>
              <Text style={styles.profileTitle} numberOfLines={1} adjustsFontSizeToFit>{t.babyProfile.replace('{name}', displayChildName)}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', marginRight: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 3 }}>
              <TouchableOpacity onPress={() => changeLanguage('en')} style={{ paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, backgroundColor: lang === 'en' ? 'white' : 'transparent' }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: lang === 'en' ? '#1E75FF' : 'white' }}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => changeLanguage('si')} style={{ paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, backgroundColor: lang === 'si' ? 'white' : 'transparent', marginLeft: 2 }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: lang === 'si' ? '#1E75FF' : 'white' }}>සිං</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => changeLanguage('ta')} style={{ paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, backgroundColor: lang === 'ta' ? 'white' : 'transparent', marginLeft: 2 }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: lang === 'ta' ? '#1E75FF' : 'white' }}>தம்</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/')}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Child Switcher Tabs (Only shown if parent has multiple children) */}
        {allChildrenData.length > 1 && (
          <View style={styles.switcherContainer}>
            <Text style={styles.switcherLabel}>{t.selectBaby}</Text>
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
            <Text style={styles.statLabel}>{t.weight}</Text>
            <Text style={styles.statValue}>{weight}</Text>
            <Text style={styles.statDate}>{t.updated}: {lastUpdate}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="ruler" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statLabel}>{t.height}</Text>
            <Text style={styles.statValue}>{height}</Text>
            <Text style={styles.statDate}>{t.updated}: {lastUpdate}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <MenuButton icon="trending-up" title={t.growthCharts} color="#4A90E2" onPress={() => setActiveModal('growth')} />
          <MenuButton icon="shield-check-outline" title={t.vaccinationStatus} color="#9C27B0" onPress={() => setActiveModal('vaccines')} />
          <MenuButton icon="calendar-month-outline" title={t.upcomingClinics} color="#FF9800" onPress={() => setActiveModal('clinics')} />
          <MenuButton icon="doctor" title={t.doctorConsultations} color="#E91E63" onPress={() => setActiveModal('doctors')} />
          <MenuButton icon="baby-face-outline" title={t.milestoneTracker} color="#E040FB" onPress={() => setActiveModal('milestones')} />
        </View>

        {/* Digital Clinic ID Section */}
        <View style={styles.qrSection}>
          <Text style={styles.qrHeading}>{t.digitalClinicId}</Text>
          <View style={styles.qrWhiteBox}>
            <QRCode value={displayChildId} size={160} />
          </View>
          <Text style={styles.childIdLabel}>{t.childId}</Text>
          <Text style={styles.childIdValue}>{displayChildId}</Text>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>{t.qrInstruction}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Interactive Information Modals */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={activeModal !== null}
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeModal === 'growth' && t.growthHistory}
                {activeModal === 'vaccines' && t.vaccinationChecklist}
                {activeModal === 'clinics' && t.clinicSchedules}
                {activeModal === 'doctors' && t.doctorConsultations}
                {activeModal === 'milestones' && t.milestoneTracker}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Modal Scrollable Body */}
            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              {activeModal === 'growth' && (
                <View>
                  {/* Chart Type Selector */}
                  {child?.growthRecords && child.growthRecords.length > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 15, backgroundColor: '#F1F5F9', borderRadius: 10, padding: 4 }}>
                      <TouchableOpacity
                        style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: chartType === 'weight' ? 'white' : 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: chartType === 'weight' ? 0.05 : 0, shadowRadius: 2, elevation: chartType === 'weight' ? 1 : 0 }}
                        onPress={() => setChartType('weight')}
                      >
                        <Text style={{ fontWeight: '700', fontSize: 13, color: chartType === 'weight' ? '#1E75FF' : '#64748B' }}>{t.weightTrend}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: chartType === 'height' ? 'white' : 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: chartType === 'height' ? 0.05 : 0, shadowRadius: 2, elevation: chartType === 'height' ? 1 : 0 }}
                        onPress={() => setChartType('height')}
                      >
                        <Text style={{ fontWeight: '700', fontSize: 13, color: chartType === 'height' ? '#4CAF50' : '#64748B' }}>{t.heightTrend}</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Growth SVG Chart */}
                  {child?.growthRecords && child.growthRecords.length > 0 && (
                    <GrowthChart records={child.growthRecords} type={chartType} />
                  )}

                  {child?.growthRecords && child.growthRecords.length > 0 && (
                    <Text style={[styles.sectionSubtitle, { marginTop: 15, marginBottom: 10 }]}>{t.measurementHistory}</Text>
                  )}

                  {child?.growthRecords && child.growthRecords.length > 0 ? (
                    child.growthRecords.map((record, index) => (
                      <View key={index} style={styles.recordCard}>
                        <View style={styles.recordHeader}>
                          <Text style={styles.recordAge}>{record.ageInterval || 'N/A'}</Text>
                          <Text style={styles.recordDate}>
                            {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.recordDetailsRow}>
                          <View style={styles.recordDetailItem}>
                            <Text style={styles.recordDetailLabel}>{t.weight}</Text>
                            <Text style={styles.recordDetailValue}>{record.weight ? `${record.weight} kg` : '--'}</Text>
                          </View>
                          <View style={styles.recordDetailItem}>
                            <Text style={styles.recordDetailLabel}>{t.height}</Text>
                            <Text style={styles.recordDetailValue}>{record.height ? `${record.height} cm` : '--'}</Text>
                          </View>
                          <View style={styles.recordDetailItem}>
                            <Text style={styles.recordDetailLabel}>{t.bmi}</Text>
                            <Text style={styles.recordDetailValue}>{record.bmi ? record.bmi.toFixed(1) : '--'}</Text>
                          </View>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>{t.noGrowthRecord}</Text>
                  )}
                </View>
              )}

              {activeModal === 'vaccines' && (
                <View>
                  {child?.vaccinations && child.vaccinations.length > 0 ? (
                    child.vaccinations.map((vac, index) => {
                      const isCompleted = vac.status?.toLowerCase() === 'completed';
                      const isDue = vac.status?.toLowerCase() === 'due';
                      return (
                        <View key={index} style={styles.vaccineCard}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.vaccineName}>{vac.name}</Text>
                            {vac.date && <Text style={styles.vaccineDate}>Scheduled: {vac.date}</Text>}
                          </View>
                          <View style={[
                            styles.statusBadge,
                            isCompleted ? styles.statusBadgeCompleted : isDue ? styles.statusBadgeDue : styles.statusBadgeUpcoming
                          ]}>
                            <Text style={[
                              styles.statusBadgeText,
                              isCompleted ? styles.statusBadgeTextCompleted : isDue ? styles.statusBadgeTextDue : styles.statusBadgeTextUpcoming
                            ]}>
                              {vac.status || 'Upcoming'}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.emptyText}>{t.noVaccineRecord}</Text>
                  )}
                </View>
              )}

              {activeModal === 'clinics' && (
                <View>
                  <Text style={styles.sectionSubtitle}>{t.nextClinicAppointment}</Text>
                  <View style={styles.appointmentCard}>
                    <Ionicons name="calendar" size={28} color="#FF9800" style={{ marginRight: 15 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.appointmentDate}>
                        {child?.nextClinicDate ? new Date(child.nextClinicDate).toLocaleDateString(lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-LK' : undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : t.noAppointment}
                      </Text>
                      <Text style={styles.appointmentCenter}>
                        🏠 {child?.assignedClinicCenter || 'Your Local MOH Center'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.sectionSubtitle, { marginTop: 20 }]}>{t.generalInfo}</Text>
                  <View style={styles.infoCard}>
                    <Ionicons name="information-circle-outline" size={20} color="#1E75FF" style={{ marginRight: 10 }} />
                    <Text style={styles.infoText}>{t.chdrReminder}</Text>
                  </View>
                </View>
              )}

              {activeModal === 'doctors' && (
                <View>
                  {child?.doctorAssessments && child.doctorAssessments.length > 0 ? (
                    child.doctorAssessments.map((doc, index) => (
                      <View key={index} style={styles.recordCard}>
                        <View style={styles.recordHeader}>
                          <Text style={styles.doctorName}>Dr. {doc.doctorName || 'MOH Doctor'}</Text>
                          <Text style={styles.recordDate}>
                            {doc.date ? new Date(doc.date).toLocaleDateString() : 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.assessmentDetails}>
                          <Text style={styles.detailLabel}>{t.diagnosis}:</Text>
                          <Text style={styles.detailText}>{doc.diagnosis || 'N/A'}</Text>

                          <Text style={[styles.detailLabel, { marginTop: 8 }]}>{t.treatment}:</Text>
                          <Text style={styles.detailText}>{doc.treatment || 'N/A'}</Text>

                          {doc.specialistReferral && (
                            <View style={styles.referralBadge}>
                              <Ionicons name="share-social-outline" size={14} color="#D81B60" style={{ marginRight: 5 }} />
                              <Text style={styles.referralText}>{t.referral}: {doc.specialistReferral}</Text>
                            </View>
                          )}

                          {doc.remarks && (
                            <View style={styles.remarksBox}>
                              <Text style={styles.remarksLabel}>{t.doctorNotes}:</Text>
                              <Text style={styles.remarksText}>{doc.remarks}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>{t.noDoctorRecord}</Text>
                  )}
                </View>
              )}

              {activeModal === 'milestones' && (
                <View>
                  {/* Age Group Selector Tabs */}
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20, backgroundColor: '#F1F5F9', borderRadius: 10, padding: 4 }}>
                    {['6m', '12m', '18m'].map((age) => {
                      const isActive = milestoneAgeTab === age;
                      const label = age === '6m' ? t.months6 : age === '12m' ? t.months12 : t.months18;
                      return (
                        <TouchableOpacity
                          key={age}
                          style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: isActive ? 'white' : 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isActive ? 0.05 : 0, shadowRadius: 2, elevation: isActive ? 1 : 0 }}
                          onPress={() => setMilestoneAgeTab(age)}
                        >
                          <Text style={{ fontWeight: '700', fontSize: 13, color: isActive ? '#E040FB' : '#64748B' }}>{label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Checklist */}
                  <View style={{ marginBottom: 15 }}>
                    {MILESTONES_DATA[milestoneAgeTab].map((key) => {
                      const storageKey = `${selectedChildId}_${key}`;
                      const isChecked = !!checkedMilestones[storageKey];
                      return (
                        <TouchableOpacity
                          key={key}
                          onPress={() => toggleMilestone(storageKey)}
                          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: '#EBF1F5' }}
                        >
                          <Ionicons
                            name={isChecked ? "checkbox" : "square-outline"}
                            size={22}
                            color={isChecked ? "#E040FB" : "#CCC"}
                            style={{ marginRight: 12 }}
                          />
                          <Text style={{ flex: 1, fontSize: 14, color: '#333', fontWeight: '500' }}>
                            {t[key]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Dynamic Caution Advice */}
                  {(() => {
                    const activeKeys = MILESTONES_DATA[milestoneAgeTab];
                    const uncheckedCount = activeKeys.filter(key => !checkedMilestones[`${selectedChildId}_${key}`]).length;
                    if (uncheckedCount > 0) {
                      return (
                        <View style={{ flexDirection: 'row', backgroundColor: '#FFF3E0', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#FFE0B2', alignItems: 'flex-start' }}>
                          <Ionicons name="warning" size={22} color="#EF6C00" style={{ marginRight: 10, marginTop: 2 }} />
                          <Text style={{ flex: 1, fontSize: 12.5, color: '#E65100', lineHeight: 18, fontWeight: '500' }}>
                            {t.milestoneAdvice}
                          </Text>
                        </View>
                      );
                    }
                    return null;
                  })()}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helper Component for Menu
const MenuButton = ({ icon, title, color, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
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
  instructionText: { color: '#666', fontSize: 13, textAlign: 'center' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EBF1F5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginVertical: 40,
    fontStyle: 'italic',
  },

  // Growth Styles
  recordCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBF1F5',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordAge: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E75FF',
  },
  recordDate: {
    fontSize: 12,
    color: '#888',
  },
  recordDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  recordDetailLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  recordDetailValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },

  // Vaccine Styles
  vaccineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBF1F5',
  },
  vaccineName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  vaccineDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeDue: {
    backgroundColor: '#FFF3E0',
  },
  statusBadgeUpcoming: {
    backgroundColor: '#E8EFFF',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusBadgeTextCompleted: {
    color: '#2E7D32',
  },
  statusBadgeTextDue: {
    color: '#EF6C00',
  },
  statusBadgeTextUpcoming: {
    color: '#1565C0',
  },

  // Clinic Appointment Styles
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFF59D',
  },
  appointmentDate: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentCenter: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    padding: 12,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#1E75FF',
    flex: 1,
    lineHeight: 18,
  },

  // Doctor Assessment Styles
  doctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E91E63',
  },
  assessmentDetails: {
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
    marginBottom: 8,
  },
  referralBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE4EC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#F8BBD0',
  },
  referralText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C2185B',
  },
  remarksBox: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  remarksLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  remarksText: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
  },
});

