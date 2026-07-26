import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, 
  FileText, 
  Search, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  MapPin, 
  User, 
  LogOut, 
  ArrowRight, 
  TrendingDown, 
  PlusCircle,
  Stethoscope,
  ChevronDown,
  Bell,
  BarChart2,
  TrendingUp,
  Download,
  AlertCircle,
  Printer
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './Dashboard.css';

export default function DoctorDashboard() {
  const [queue, setQueue] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('All'); // All, Critical, High, Moderate
  const [activeTab, setActiveTab] = useState('Consultation'); // Consultation, Case History
  const [toastMessage, setToastMessage] = useState(null);

  // My Consultations View State
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, consultations, growth-charts
  const [reviewedConsultations, setReviewedConsultations] = useState([]);
  const [loadingReviewed, setLoadingReviewed] = useState(false);
  const [selectedReviewed, setSelectedReviewed] = useState(null);
  const [consultationSearch, setConsultationSearch] = useState('');
  const [consultationFilter, setConsultationFilter] = useState('All');

  // Growth Charts View State
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildForCharts, setSelectedChildForCharts] = useState(null);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [childSearchTerm, setChildSearchTerm] = useState('');
  const [activeChartTab, setActiveChartTab] = useState('Weight'); // Weight, Height, BMI
  const [chartWeightData, setChartWeightData] = useState([]);
  const [chartHeightData, setChartHeightData] = useState([]);
  const [chartBmiData, setChartBmiData] = useState([]);

  // Clinic Referrals View State
  const [clinicReferralsList, setClinicReferralsList] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [referralSearchTerm, setReferralSearchTerm] = useState('');
  const [selectedReferralForLetter, setSelectedReferralForLetter] = useState(null);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch (e) {
      return {};
    }
  });

  const getInitials = (fullName) => {
    if (!fullName) return 'DR';
    return fullName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // Form Fields
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('Thriposha Double Allowance + Iron Syrup');
  const [referral, setReferral] = useState('None');
  const [parentNotes, setParentNotes] = useState('');
  const [referToHospital, setReferToHospital] = useState(false);
  const [specialistHospital, setSpecialistHospital] = useState('Lady Ridgeway Hospital for Children');
  const [reviewDate, setReviewDate] = useState('');
  
  // Vitals Form Fields
  const [temp, setTemp] = useState('');
  const [hr, setHr] = useState('');
  const [bp, setBp] = useState('');

  // Daily statistics
  const [examinedCount, setExaminedCount] = useState(0);
  const totalPatientsScheduled = 24;
  const [criticalReviewedCount, setCriticalReviewedCount] = useState(2);

  // Fetch referrals from backend
  const fetchReferrals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/referrals');
      const data = res.data || {};
      const fetchedQueue = Array.isArray(data) ? data : (data.queue || []);
      const examinedToday = Array.isArray(data) ? 0 : (data.examinedToday || 0);

      setQueue(fetchedQueue);
      setExaminedCount(examinedToday);
      if (fetchedQueue.length > 0) {
        setSelectedChild(fetchedQueue[0]);
        setTemp(fetchedQueue[0].vitals?.temp?.replace(/[^0-9.]/g, '') || '');
        setHr(fetchedQueue[0].vitals?.hr?.replace(/[^0-9]/g, '') || '');
        setBp(fetchedQueue[0].vitals?.bp || '');
      } else {
        setSelectedChild(null);
      }
    } catch (err) {
      console.error("Failed to fetch referrals:", err);
    }
  };

  const fetchReviewed = async () => {
    setLoadingReviewed(true);
    try {
      const res = await axios.get('http://localhost:5000/api/referrals/reviewed');
      setReviewedConsultations(res.data || []);
    } catch (err) {
      console.error("Failed to fetch reviewed consultations:", err);
      showToast("Failed to load consultations history.");
    } finally {
      setLoadingReviewed(false);
    }
  };

  const handleSelectChildForCharts = (childData) => {
    setSelectedChildForCharts(childData);
    if (childData.growthRecords && childData.growthRecords.length > 0) {
      const wLogs = childData.growthRecords.map(r => ({
        month: r.ageInterval,
        weight: r.weight,
        p3: r.ageInterval === '0M' ? 2.4 : 8.8,
        p15: r.ageInterval === '0M' ? 2.8 : 9.6,
        p50: r.ageInterval === '0M' ? 3.3 : 10.4,
        p85: r.ageInterval === '0M' ? 3.9 : 11.4,
        p97: r.ageInterval === '0M' ? 4.3 : 12.2
      }));
      setChartWeightData(wLogs);

      const hLogs = childData.growthRecords.map(r => ({
        month: r.ageInterval,
        height: r.height,
        p3: r.ageInterval === '0M' ? 46.1 : 76.9,
        p15: r.ageInterval === '0M' ? 48.0 : 79.5,
        p50: r.ageInterval === '0M' ? 49.9 : 82.0,
        p85: r.ageInterval === '0M' ? 51.8 : 84.5,
        p97: r.ageInterval === '0M' ? 53.7 : 87.1
      }));
      setChartHeightData(hLogs);

      const bLogs = childData.growthRecords.map(r => ({
        month: r.ageInterval,
        bmi: r.bmi,
        p3: r.ageInterval === '0M' ? 11.1 : 13.1,
        p15: r.ageInterval === '0M' ? 12.0 : 14.1,
        p50: r.ageInterval === '0M' ? 13.0 : 15.1,
        p85: r.ageInterval === '0M' ? 14.1 : 16.3,
        p97: r.ageInterval === '0M' ? 15.1 : 17.5
      }));
      setChartBmiData(bLogs);
    } else {
      setChartWeightData([]);
      setChartHeightData([]);
      setChartBmiData([]);
    }
  };

  const fetchChildrenForCharts = async () => {
    setLoadingChildren(true);
    try {
      const res = await axios.get('http://localhost:5000/api/children');
      const data = res.data || [];
      setChildrenList(data);
      if (data.length > 0) {
        handleSelectChildForCharts(data[0]);
      } else {
        setSelectedChildForCharts(null);
        setChartWeightData([]);
        setChartHeightData([]);
        setChartBmiData([]);
      }
    } catch (err) {
      console.error("Failed to fetch children for charts:", err);
      showToast("Failed to fetch children records.");
    } finally {
      setLoadingChildren(false);
    }
  };


  const fetchClinicReferrals = async () => {
    setLoadingReferrals(true);
    try {
      const res = await axios.get('http://localhost:5000/api/referrals/specialist-referrals');
      setClinicReferralsList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch clinic referrals:", err);
      showToast("Failed to load clinic referrals.");
    } finally {
      setLoadingReferrals(false);
    }
  };


  useEffect(() => {
    fetchReferrals();
  }, []);


  const handleResetReferrals = async () => {
    try {
      await axios.post('http://localhost:5000/api/referrals/reset');
      setQueue([]);
      setExaminedCount(0);
      setSelectedChild(null);
      setTemp('');
      setHr('');
      setBp('');
      showToast("Referral queue cleared successfully.");
    } catch (err) {
      console.error("Failed to clear referrals:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const showToast = (message) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setToastMessage({ text: message, time: timestamp });
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleStartReview = (child) => {
    setSelectedChild(child);
    setDiagnosis('');
    setTreatment('Thriposha Double Allowance + Iron Syrup');
    setReferral('None');
    setParentNotes('');
    setReferToHospital(false);
    setReviewDate('');
    setTemp(child.vitals?.temp?.replace(/[^0-9.]/g, '') || '');
    setHr(child.vitals?.hr?.replace(/[^0-9]/g, '') || '');
    setBp(child.vitals?.bp || '');
    showToast(`Started medical review for ${child.name}`);
  };

  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) return;

    try {
      await axios.post(`http://localhost:5000/api/referrals/${selectedChild._id}/assess`, {
        diagnosis,
        treatment: referToHospital ? `${treatment} (Ref: ${specialistHospital})` : treatment,
        specialistReferral: referToHospital ? specialistHospital : 'None',
        parentNotes,
        reviewDate,
        vitals: {
          temp: temp ? `${temp}°C` : undefined,
          hr: hr ? `${hr} bpm` : undefined,
          bp: bp || undefined
        }
      });

      showToast(`Assessment saved to DB for ${selectedChild.name}.`);

      // Remove from local queue
      const updatedQueue = queue.filter(p => p._id !== selectedChild._id);
      setQueue(updatedQueue);

      // Update progress stats
      setExaminedCount(prev => prev + 1);
      if (selectedChild.alertLevel === 'Critical') {
        setCriticalReviewedCount(prev => prev + 1);
      }

      // Auto-select next child if available
      if (updatedQueue.length > 0) {
        setSelectedChild(updatedQueue[0]);
        setTemp(updatedQueue[0].vitals?.temp?.replace(/[^0-9.]/g, '') || '');
        setHr(updatedQueue[0].vitals?.hr?.replace(/[^0-9]/g, '') || '');
        setBp(updatedQueue[0].vitals?.bp || '');
      } else {
        setSelectedChild(null);
        setTemp('');
        setHr('');
        setBp('');
      }

      // Reset Form
      setDiagnosis('');
      setParentNotes('');
    } catch (err) {
      console.error("Failed to save assessment:", err);
      showToast("Error saving assessment to backend.");
    }
  };

  // Filter logic
  const filteredQueue = queue.filter(child => {
    const nameStr = child.name || '';
    const idStr = child.digitalHealthId || '';
    const matchesSearch = 
      nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idStr.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterLevel === 'All' || child.alertLevel === filterLevel;

    return matchesSearch && matchesFilter;
  });

  // Color helper for progress percentiles
  const getPercentileColor = (val) => {
    if (val < 15) return 'bg-red-500';
    if (val < 30) return 'bg-amber-400';
    return 'bg-green-500';
  };

  const criticalCount = queue.filter(p => p.alertLevel === 'Critical').length;
  const pendingCount = queue.length;
  const totalConsultations = queue.length + examinedCount;
  const filteredReviewed = reviewedConsultations.filter(item => {
    const nameStr = item.name || '';
    const idStr = item.digitalHealthId || '';
    const diagStr = item.assessment?.diagnosis || '';
    const matchesSearch = 
      nameStr.toLowerCase().includes(consultationSearch.toLowerCase()) ||
      idStr.toLowerCase().includes(consultationSearch.toLowerCase()) ||
      diagStr.toLowerCase().includes(consultationSearch.toLowerCase());
      
    const matchesFilter = consultationFilter === 'All' || item.alertLevel === consultationFilter;
    
    return matchesSearch && matchesFilter;
  });

  const filteredChildrenForCharts = childrenList.filter(c => {
    const nameStr = c.name || '';
    const idStr = c.digitalHealthId || '';
    return nameStr.toLowerCase().includes(childSearchTerm.toLowerCase()) ||
           idStr.toLowerCase().includes(childSearchTerm.toLowerCase());
  });

  const filteredClinicReferrals = clinicReferralsList.filter(item => {
    const nameStr = item.name || '';
    const idStr = item.digitalHealthId || '';
    const diagStr = item.assessment?.diagnosis || '';
    const hospStr = item.assessment?.specialistReferral || '';
    return nameStr.toLowerCase().includes(referralSearchTerm.toLowerCase()) ||
           idStr.toLowerCase().includes(referralSearchTerm.toLowerCase()) ||
           diagStr.toLowerCase().includes(referralSearchTerm.toLowerCase()) ||
           hospStr.toLowerCase().includes(referralSearchTerm.toLowerCase());
  });

  return (
    <div className="dashboard-container min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-[#0F172A]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 right-6 z-50 bg-[#0F172A] text-white border border-[#E2E8F0]/10 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="text-green-400" size={18} />
          <div>
            <p className="text-sm font-semibold">{toastMessage.text}</p>
            <span className="text-[10px] text-slate-400">Logged at {toastMessage.time}</span>
          </div>
        </div>
      )}

      {/* Sidebar - Consistent with Midwife but adapted */}
      <aside className="sidebar w-64 bg-[#0F172A] text-white p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="sidebar-logo flex items-center gap-3 mb-8">
            <span className="heart-icon text-2xl">🤍</span>
            <div className="logo-text">
              <h3 className="font-extrabold tracking-wide text-sm">MediKid Portal</h3>
              <p className="text-[10px] text-slate-400">Doctor Panel</p>
            </div>
          </div>
          <ul className="nav-menu space-y-1.5">
            <li 
              onClick={() => {
                setCurrentView('dashboard');
                setSelectedReviewed(null);
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-[#1D61FF] text-white font-semibold text-xs uppercase tracking-wider'
                  : 'hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider'
              }`}
            >
              <Stethoscope size={16} />
              <span>Doctor's Dashboard</span>
            </li>
            <li 
              onClick={() => {
                setCurrentView('consultations');
                fetchReviewed();
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                currentView === 'consultations'
                  ? 'bg-[#1D61FF] text-white font-semibold text-xs uppercase tracking-wider'
                  : 'hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider'
              }`}
            >
              <User size={16} />
              <span>My Consultations</span>
            </li>
            <li 
              onClick={() => {
                setCurrentView('growth-charts');
                fetchChildrenForCharts();
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                currentView === 'growth-charts'
                  ? 'bg-[#1D61FF] text-white font-semibold text-xs uppercase tracking-wider'
                  : 'hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider'
              }`}
            >
              <FileText size={16} />
              <span>Growth Charts</span>
            </li>
            <li 
              onClick={() => {
                setCurrentView('clinic-referrals');
                fetchClinicReferrals();
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                currentView === 'clinic-referrals'
                  ? 'bg-[#1D61FF] text-white font-semibold text-xs uppercase tracking-wider'
                  : 'hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider'
              }`}
            >
              <Activity size={16} />
              <span>Clinic Referrals</span>
            </li>
          </ul>

        </div>
        <div>
          <button onClick={handleLogout} className="logout-link flex items-center gap-2 text-red-400 hover:text-red-300 font-semibold text-sm w-full py-2.5 border-t border-slate-800">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main-content flex-grow p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header Component */}
          <header className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1D61FF] text-white font-bold flex items-center justify-center text-sm shadow-md">
                  {getInitials(currentUser.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-[#0F172A]">{currentUser.name || 'Dr. Nimal Silva'}</h1>
                    <span className="bg-[#1D61FF]/10 text-[#1D61FF] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Pediatrician'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                    <span>{currentUser.assignedClinic || 'MOH Primary Clinic Center'}</span>
                    <span className="text-slate-300">•</span>
                    <Calendar size={13} className="text-slate-400" />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Notifications */}
              <div className="flex items-center gap-3">
                {currentView === 'dashboard' ? (
                  <>
                    <button 
                      onClick={() => showToast('Monthly/Daily report generated and downloaded.')}
                      className="bg-white border border-[#E2E8F0] hover:bg-slate-50 text-xs font-bold text-slate-700 px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Download size={14} />
                      <span>Daily Report</span>
                    </button>
                    <button 
                      onClick={handleResetReferrals}
                      className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <AlertCircle size={14} />
                      <span>Clear Queue</span>
                    </button>
                  </>
                ) : currentView === 'consultations' ? (
                  <button 
                    onClick={fetchReviewed}
                    className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Clock size={14} />
                    <span>Refresh History</span>
                  </button>
                ) : (
                  <button 
                    onClick={fetchChildrenForCharts}
                    className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Clock size={14} />
                    <span>Refresh Children</span>
                  </button>
                )}
                <div className="relative cursor-pointer p-2 bg-white rounded-xl border border-[#E2E8F0] hover:bg-slate-50 transition-all font-bold">
                  <Bell size={18} className="text-slate-600" />
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center border-2 border-white">
                    3
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard-specific Search Bar */}
            {currentView === 'dashboard' && (
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} className="text-slate-400" />
                </span>
                <input 
                  type="text" 
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1D61FF] focus:border-[#1D61FF] text-sm text-[#0F172A] transition-all" 
                  placeholder="Search Child Name, Digital Health ID, or Mother's Phone..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </header>

          {currentView === 'dashboard' ? (
            <>
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                {/* Card 1: Critical Growth Retardation */}
                <div className="bg-red-50/70 border border-red-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-red-700 text-[10px] font-bold tracking-wider uppercase">Growth Retardation Cases</p>
                    <h3 className="text-3xl font-extrabold text-red-800 mt-1">{criticalCount}</h3>
                    <span className="text-[10px] text-red-600 font-bold block mt-1.5">
                      ⚠️ Severe Underweight
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="bg-red-100/80 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold">
                      Critical
                    </span>
                  </div>
                </div>

                {/* Card 2: Midwife Referrals Pending */}
                <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-amber-700 text-[10px] font-bold tracking-wider uppercase">Midwife Referrals Pending</p>
                    <h3 className="text-3xl font-extrabold text-amber-800 mt-1">{pendingCount}</h3>
                    <span className="text-[10px] text-amber-600 font-bold block mt-1.5">
                      ⏱️ Awaiting review
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="bg-amber-100/80 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold">
                      Pending
                    </span>
                  </div>
                </div>

                {/* Card 3: Today's Scheduled Patients */}
                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-blue-700 text-[10px] font-bold tracking-wider uppercase">Today's Clinic Consultations</p>
                    <h3 className="text-3xl font-extrabold text-[#1D61FF] mt-1">{totalConsultations}</h3>
                    <span className="text-[10px] text-blue-600 font-bold block mt-1.5">
                      📊 Clinic Capacity
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="bg-blue-100/80 text-[#1D61FF] text-[10px] px-2 py-0.5 rounded font-bold">
                      Info
                    </span>
                  </div>
                </div>

                {/* Card 4: Examined Today */}
                <div className="bg-green-50/70 border border-green-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-green-700 text-[10px] font-bold tracking-wider uppercase">Examined Today</p>
                    <h3 className="text-3xl font-extrabold text-green-800 mt-1">{examinedCount}</h3>
                    <span className="text-[10px] text-green-600 font-bold block mt-1.5">
                      ✅ Targets met
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100/80 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold">
                      Success
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Grid View */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                
                {/* Left Side: Patient Queue (60%) */}
                <div className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                    <div>
                      <h2 className="text-base font-bold text-[#0F172A]">Urgent Referral & High-Risk Queue</h2>
                      <p className="text-xs text-slate-500">Select a child profile to open clinical consultation & prescription panel</p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-1.5 flex-wrap">
                      {['All', 'Critical', 'High', 'Moderate'].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setFilterLevel(lvl)}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-all border ${
                            filterLevel === lvl
                              ? 'bg-[#1D61FF] text-white border-[#1D61FF]'
                              : 'bg-slate-50 text-slate-600 border-[#E2E8F0] hover:bg-slate-100'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Queue Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-[#E2E8F0] text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                          <th className="px-4 py-3.5">Child Details & Digital ID</th>
                          <th className="px-4 py-3.5">Age</th>
                          <th className="px-4 py-3.5">Referral Reason</th>
                          <th className="px-4 py-3.5">Referred By</th>
                          <th className="px-4 py-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredQueue.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-4 py-10 text-center text-slate-400">
                              No matching profiles in this queue tier.
                            </td>
                          </tr>
                        ) : (
                          filteredQueue.map((child) => (
                            <tr 
                              key={child._id}
                              onClick={() => handleStartReview(child)}
                              className={`hover:bg-slate-50/70 transition-all cursor-pointer ${
                                selectedChild?._id === child._id 
                                  ? 'bg-[#1D61FF]/5 border-l-4 border-l-[#1D61FF]' 
                                  : 'border-l-4 border-l-transparent'
                              }`}
                            >
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-[#0F172A]/10 text-[#0F172A] font-bold flex items-center justify-center text-[10px]">
                                    {child.initials || 'CH'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800">{child.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{child.digitalHealthId}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="font-semibold text-slate-700">{child.age}</div>
                                <div className="text-slate-400 mt-0.5">{child.gender}</div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className={`inline-block w-2 h-2 rounded-full ${
                                    child.alertLevel === 'Critical' 
                                      ? 'bg-red-500' 
                                      : child.alertLevel === 'High' 
                                        ? 'bg-amber-500' 
                                        : 'bg-blue-400'
                                  }`}></span>
                                  <span className="font-bold text-slate-700">{child.alertReason}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 block">⏱️ {child.waitTime}</span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="font-medium text-slate-700">{child.referredBy}</div>
                                <div className="text-[9px] text-slate-400 uppercase tracking-tight">Midwife</div>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartReview(child);
                                  }}
                                  className={`text-[10px] font-bold px-3 py-2 rounded-lg transition-all ${
                                    selectedChild?._id === child._id
                                      ? 'bg-[#1D61FF] text-white shadow-sm'
                                      : 'bg-[#1D61FF] text-white hover:bg-blue-700'
                                  }`}
                                >
                                  Start Review
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Side: Medical Consultation & Prescription Panel (40%) */}
                <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col overflow-hidden">
                  {selectedChild ? (
                    <>
                      {/* Dark Navy Patient Header */}
                      <div className="bg-[#0F172A] text-white p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#1D61FF]">Active Consultation</span>
                            <h3 className="text-base font-bold mt-0.5">{selectedChild.name}</h3>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                              <span>{selectedChild.digitalHealthId}</span>
                              <span>•</span>
                              <span>{selectedChild.age} ({selectedChild.gender})</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            selectedChild.alertLevel === 'Critical' 
                              ? 'bg-red-500 text-white' 
                              : selectedChild.alertLevel === 'High' 
                                ? 'bg-amber-500 text-white' 
                                : 'bg-[#1D61FF] text-white'
                          }`}>
                            {selectedChild.alertLevel}
                          </span>
                        </div>

                        {/* Vitals Strip - Highlight abnormal in orange */}
                        <div className="grid grid-cols-3 gap-2 mt-4 bg-white/5 border border-white/10 rounded-xl p-2.5 text-center text-xs">
                          <div className={(parseFloat(temp) > 37.5 || parseFloat(temp) < 36.0) ? 'bg-amber-500/20 text-amber-300 rounded p-1 border border-amber-500/20' : 'text-slate-300 p-1'}>
                            <span className="text-[10px] block text-slate-400">Temp</span>
                            <strong className="text-[11px]">{temp ? `${temp}°C` : '36.8°C'}</strong>
                          </div>
                          <div className={(parseInt(hr) > 120 || parseInt(hr) < 65) ? 'bg-amber-500/20 text-amber-300 rounded p-1 border border-amber-500/20' : 'text-slate-300 p-1'}>
                            <span className="text-[10px] block text-slate-400">Heart Rate</span>
                            <strong className="text-[11px]">{hr ? `${hr} bpm` : '98 bpm'}</strong>
                          </div>
                          <div className="text-slate-300 p-1">
                            <span className="text-[10px] block text-slate-400">BP</span>
                            <strong className="text-[11px]">{bp || '90/60 mmHg'}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Mini Health Trend Card */}
                      <div className="px-5 py-3 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Mini Health Trend</span>
                          <strong className="text-slate-700">{selectedChild.weightHistory || 'Normal growth curve'}</strong>
                        </div>
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold text-[9px] uppercase">
                          {selectedChild.alertReason}
                        </span>
                      </div>

                      {/* Two Tabs Menu */}
                      <div className="flex border-b border-[#E2E8F0]">
                        <button
                          onClick={() => setActiveTab('Consultation')}
                          className={`flex-1 text-center py-3 text-xs font-bold transition-all border-b-2 ${
                            activeTab === 'Consultation' 
                              ? 'border-b-[#1D61FF] text-[#1D61FF]' 
                              : 'border-b-transparent text-slate-500 hover:text-[#0F172A]'
                          }`}
                        >
                          Consultation Form
                        </button>
                        <button
                          onClick={() => setActiveTab('Case History')}
                          className={`flex-1 text-center py-3 text-xs font-bold transition-all border-b-2 ${
                            activeTab === 'Case History' 
                              ? 'border-b-[#1D61FF] text-[#1D61FF]' 
                              : 'border-b-transparent text-slate-500 hover:text-[#0F172A]'
                          }`}
                        >
                          Case History & Notes
                        </button>
                      </div>

                      {/* Tab Contents */}
                      <div className="p-5 flex-grow overflow-y-auto">
                        {activeTab === 'Consultation' ? (
                          <form onSubmit={handleSaveAssessment} className="space-y-4">
                            {/* Vitals Input Fields */}
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Temp (°C)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  required
                                  value={temp}
                                  onChange={(e) => setTemp(e.target.value)}
                                  placeholder="36.8"
                                  className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#1D61FF]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">HR (bpm)</label>
                                <input
                                  type="number"
                                  required
                                  value={hr}
                                  onChange={(e) => setHr(e.target.value)}
                                  placeholder="98"
                                  className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#1D61FF]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">BP (mmHg)</label>
                                <input
                                  type="text"
                                  required
                                  value={bp}
                                  onChange={(e) => setBp(e.target.value)}
                                  placeholder="90/60"
                                  className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#1D61FF]"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                                Clinical Diagnosis & Findings *
                              </label>
                              <textarea
                                rows="3"
                                required
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                placeholder="Enter physical findings, symptoms, growth deceleration details..."
                                className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1D61FF]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                                Prescribed Supplements / Treatment
                              </label>
                              <div className="relative">
                                <select 
                                  value={treatment}
                                  onChange={(e) => setTreatment(e.target.value)}
                                  className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-2.5 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1D61FF] cursor-pointer"
                                >
                                  <option value="Thriposha Double Allowance + Iron Syrup">Thriposha Double Allowance + Iron Syrup</option>
                                  <option value="Pediatric Specialist Hospital Referral">Pediatric Specialist Hospital Referral</option>
                                  <option value="Vitamin A Booster">Vitamin A Booster</option>
                                  <option value="Routine Nutritional Follow-up">Routine Nutritional Follow-up</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                                Doctor Notes & Advice for Parent
                              </label>
                              <textarea
                                rows="2.5"
                                value={parentNotes}
                                onChange={(e) => setParentNotes(e.target.value)}
                                placeholder="Advice on solid feeding, micro-nutrients etc. (Syncs to parent mobile app)"
                                className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1D61FF]"
                              />
                            </div>

                            {/* Tertiary referral toggle */}
                            <div className="flex items-center justify-between py-2 border-t border-slate-100">
                              <div>
                                <span className="text-xs font-bold text-slate-700 block">Refer to Tertiary Hospital / Specialist?</span>
                                <span className="text-[10px] text-slate-400">Transfer case out of primary MOH clinic scope</span>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={referToHospital} 
                                onChange={(e) => setReferToHospital(e.target.checked)}
                                className="w-4 h-4 text-[#1D61FF] accent-[#1D61FF] cursor-pointer"
                              />
                            </div>

                            {referToHospital && (
                              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                                  Specialist Hospital Destination
                                </label>
                                <div className="relative">
                                  <select 
                                    value={specialistHospital}
                                    onChange={(e) => setSpecialistHospital(e.target.value)}
                                    className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-2.5 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1D61FF] cursor-pointer"
                                  >
                                    <option value="Lady Ridgeway Hospital for Children">Lady Ridgeway Hospital for Children (Colombo)</option>
                                    <option value="Sirimavo Bandaranaike Children's Hospital">Sirimavo Bandaranaike Children's Hospital (Peradeniya)</option>
                                    <option value="Teaching Hospital Karapitiya (Pediatric Ward)">Teaching Hospital Karapitiya (Pediatric Ward)</option>
                                  </select>
                                  <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                                Next Doctor Review Date
                              </label>
                              <input
                                type="date"
                                value={reviewDate}
                                onChange={(e) => setReviewDate(e.target.value)}
                                className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#1D61FF]"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={!diagnosis.trim()}
                              className={`w-full font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 ${
                                diagnosis.trim() 
                                  ? 'bg-[#1D61FF] text-white hover:bg-[#1D61FF]/95 cursor-pointer shadow-blue-500/20' 
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                              }`}
                            >
                              <CheckCircle2 size={16} />
                              <span>Save Diagnosis & Sync to Mobile App</span>
                            </button>
                          </form>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-3.5">
                              <h4 className="text-xs font-bold text-[#0F172A] mb-1">Midwife Field Notes</h4>
                              <p className="text-xs text-slate-600 leading-relaxed italic">
                                "{selectedChild.historyNotes || 'Referred for specialist pediatrician assessment'}"
                              </p>
                              <span className="text-[9px] font-bold text-slate-400 block mt-2">
                                SUBMITTED BY: {selectedChild.referredBy?.toUpperCase() || 'PHM'}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Birth & Clinic Facts</h4>
                              <div className="grid grid-cols-2 gap-3">
                                {(selectedChild.keyFacts || [
                                  { label: "Birth Weight", value: "3.2 kg" },
                                  { label: "Blood Group", value: "O+" }
                                ]).map((fact, idx) => (
                                  <div key={idx} className="bg-slate-50 border border-[#E2E8F0] p-2.5 rounded-xl text-center">
                                    <span className="text-[10px] text-slate-400 block">{fact.label}</span>
                                    <strong className="text-xs text-[#0F172A] mt-0.5 inline-block">{fact.value}</strong>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="p-10 text-center flex-grow flex flex-col items-center justify-center text-slate-400">
                      <Stethoscope size={40} className="text-slate-300 mb-3" />
                      <p className="text-xs">No patient selected for review.</p>
                      <p className="text-[10px] text-slate-400 mt-1">Select a profile from the urgent patient queue to start assessment.</p>
                    </div>
                  )}
                </div>

              </div>
            </>
          ) : currentView === 'consultations' ? (
            <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease' }}>
              {/* History Search & Filters bar */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search size={16} className="text-slate-400" />
                  </span>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D61FF] transition-all"
                    placeholder="Search past consultations by name, ID, diagnosis..."
                    value={consultationSearch}
                    onChange={(e) => setConsultationSearch(e.target.value)}
                  />
                </div>
                
                {/* Filter Pills */}
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Severity:</span>
                  {['All', 'Critical', 'High', 'Moderate'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setConsultationFilter(lvl)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all border ${
                        consultationFilter === lvl
                          ? 'bg-[#1D61FF] text-white border-[#1D61FF] shadow-sm'
                          : 'bg-white text-slate-600 border-[#E2E8F0] hover:bg-slate-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-[#1D61FF]/10 rounded-xl text-[#1D61FF]">
                    <User size={20} />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase block">Total Reviews</span>
                    <h3 className="text-2xl font-extrabold text-[#0F172A] mt-0.5">{reviewedConsultations.length}</h3>
                  </div>
                </div>
                
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-red-50 rounded-xl text-red-500">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase block">Critical Addressed</span>
                    <h3 className="text-2xl font-extrabold text-[#0F172A] mt-0.5">
                      {reviewedConsultations.filter(c => c.alertLevel === 'Critical').length}
                    </h3>
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-xl text-green-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase block">Specialist Referrals</span>
                    <h3 className="text-2xl font-extrabold text-[#0F172A] mt-0.5">
                      {reviewedConsultations.filter(c => c.assessment?.specialistReferral && c.assessment.specialistReferral !== 'None').length}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Main content table & details preview side-by-side */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* List Table */}
                <div className={`bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden flex flex-col ${selectedReviewed ? 'lg:col-span-6' : 'lg:col-span-10'}`}>
                  <div className="p-5 border-b border-[#E2E8F0] bg-white flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">Historical Logs</h3>
                      <p className="text-xs text-slate-400 mt-0.5">List of all finalized consultations and assessments</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-[#E2E8F0] text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                          <th className="px-4 py-3.5">Child Name & ID</th>
                          <th className="px-4 py-3.5">Review Date</th>
                          <th className="px-4 py-3.5">Diagnosis</th>
                          <th className="px-4 py-3.5">Treatment</th>
                          <th className="px-4 py-3.5">Severity</th>
                          <th className="px-4 py-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loadingReviewed ? (
                          <tr>
                            <td colSpan="6" className="px-4 py-10 text-center text-slate-400">
                              Loading history...
                            </td>
                          </tr>
                        ) : filteredReviewed.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-4 py-10 text-center text-slate-400">
                              No consultations found.
                            </td>
                          </tr>
                        ) : (
                          filteredReviewed.map((item) => (
                            <tr
                              key={item._id}
                              onClick={() => setSelectedReviewed(item)}
                              className={`hover:bg-slate-50/70 transition-all cursor-pointer ${
                                selectedReviewed?._id === item._id
                                  ? 'bg-[#1D61FF]/5 border-l-4 border-l-[#1D61FF]'
                                  : 'border-l-4 border-l-transparent'
                              }`}
                            >
                              <td className="px-4 py-4">
                                <div className="font-bold text-slate-800">{item.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.digitalHealthId}</div>
                              </td>
                              <td className="px-4 py-4 text-slate-600 font-medium">
                                {item.assessment?.reviewedAt ? new Date(item.assessment.reviewedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'N/A'}
                              </td>
                              <td className="px-4 py-4 font-semibold text-slate-700 max-w-[150px] truncate">
                                {item.assessment?.diagnosis}
                              </td>
                              <td className="px-4 py-4 text-slate-600 max-w-[150px] truncate">
                                {item.assessment?.treatment}
                              </td>
                              <td className="px-4 py-4">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 vertical-middle ${
                                  item.alertLevel === 'Critical'
                                    ? 'bg-red-500'
                                    : item.alertLevel === 'High'
                                      ? 'bg-amber-500'
                                      : 'bg-blue-400'
                                }`}></span>
                                <span className="font-bold text-slate-700">{item.alertLevel}</span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedReviewed(item);
                                  }}
                                  className="text-[10px] font-bold text-[#1D61FF] hover:underline"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Detail View Pane (visible if selectedReviewed is set) */}
                {selectedReviewed && (
                  <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div className="bg-[#0F172A] text-white p-4 flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#1D61FF]">Consultation Summary</span>
                        <h3 className="text-base font-bold mt-0.5">{selectedReviewed.name}</h3>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          {selectedReviewed.digitalHealthId} • {selectedReviewed.age} ({selectedReviewed.gender})
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedReviewed(null)}
                        className="text-slate-400 hover:text-white font-bold text-sm bg-white/10 px-2 py-0.5 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-5 space-y-4 overflow-y-auto max-h-[500px]">
                      {/* Vitals during consultation */}
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vitals Recorded</h4>
                        <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-[#E2E8F0] rounded-xl p-2.5 text-center text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Temp</span>
                            <strong className="text-[11px] text-slate-700">{selectedReviewed.vitals?.temp || '36.8°C'}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">HR</span>
                            <strong className="text-[11px] text-slate-700">{selectedReviewed.vitals?.hr || '98 bpm'}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">BP</span>
                            <strong className="text-[11px] text-slate-700">{selectedReviewed.vitals?.bp || '90/60 mmHg'}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Diagnosis & Findings */}
                      <div className="bg-slate-50 border border-[#E2E8F0] p-3.5 rounded-xl">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clinical Diagnosis & Findings</h4>
                        <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                          {selectedReviewed.assessment?.diagnosis}
                        </p>
                      </div>

                      {/* Treatment & Specialist Referral */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
                          <span className="text-[9px] font-bold text-blue-700 uppercase block">Treatment Plan</span>
                          <strong className="text-xs text-slate-800 mt-1 inline-block">{selectedReviewed.assessment?.treatment}</strong>
                        </div>
                        <div className="bg-purple-50/50 border border-purple-100 p-3 rounded-xl">
                          <span className="text-[9px] font-bold text-purple-700 uppercase block">Specialist Referral</span>
                          <strong className="text-xs text-slate-800 mt-1 inline-block">
                            {selectedReviewed.assessment?.specialistReferral && selectedReviewed.assessment?.specialistReferral !== 'None' 
                              ? selectedReviewed.assessment?.specialistReferral 
                              : 'No Referral'}
                          </strong>
                        </div>
                      </div>

                      {/* Next Review Date */}
                      {selectedReviewed.assessment?.reviewDate && (
                        <div className="bg-amber-50/40 border border-amber-100 p-3 rounded-xl flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Next Doctor Review Date:</span>
                          <strong className="text-amber-800">{new Date(selectedReviewed.assessment.reviewDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}</strong>
                        </div>
                      )}

                      {/* Original Midwife field notes */}
                      <div className="border-t border-slate-100 pt-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Original Referral Context</h4>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[9px] text-[#1D61FF] font-bold block uppercase mb-1">
                            Alert: {selectedReviewed.alertReason}
                          </span>
                          <p className="text-xs text-slate-500 italic">
                            "{selectedReviewed.historyNotes || 'No notes provided by midwife.'}"
                          </p>
                          <span className="text-[9px] text-slate-400 block mt-2 font-semibold">
                            BY: {selectedReviewed.referredBy} (MOH Midwife)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : currentView === 'growth-charts' ? (
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.4s ease' }}>
              {/* Left Column: Children Selection (30%) */}
              <div className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[#E2E8F0] bg-slate-50">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Registered Children</h3>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                      <Search size={14} className="text-slate-400" />
                    </span>
                    <input
                      type="text"
                      className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-8 pr-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D61FF] transition-all"
                      placeholder="Search child name or ID..."
                      value={childSearchTerm}
                      onChange={(e) => setChildSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px] flex-grow">
                  {loadingChildren ? (
                    <div className="p-5 text-center text-slate-400 text-xs">Loading children...</div>
                  ) : filteredChildrenForCharts.length === 0 ? (
                    <div className="p-5 text-center text-slate-400 text-xs">No children found.</div>
                  ) : (
                    filteredChildrenForCharts.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleSelectChildForCharts(item)}
                        className={`p-3.5 hover:bg-slate-50 transition-all cursor-pointer border-l-4 ${
                          selectedChildForCharts?._id === item._id
                            ? 'bg-[#1D61FF]/5 border-l-[#1D61FF]'
                            : 'border-l-transparent'
                        }`}
                      >
                        <div className="font-bold text-slate-800 text-xs">{item.name}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                          <span>{item.digitalHealthId}</span>
                          <span>•</span>
                          <span>{item.gender}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Growth Charts and Ledger (70%) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {selectedChildForCharts ? (
                  <>
                    {/* Active Child Profile Card */}
                    <div className="bg-[#0F172A] text-white rounded-2xl p-5 shadow-md flex justify-between items-center flex-wrap gap-4">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#1D61FF]">Child Health Profile</span>
                        <h2 className="text-base font-bold mt-0.5">{selectedChildForCharts.name}</h2>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-mono">
                          <span>ID: {selectedChildForCharts.digitalHealthId}</span>
                          <span>•</span>
                          <span>Gender: {selectedChildForCharts.gender}</span>
                          <span>•</span>
                          <span>DOB: {new Date(selectedChildForCharts.dob).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center text-xs">
                        <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Birth Weight</span>
                          <strong className="text-white block mt-0.5">{selectedChildForCharts.birthWeight} kg</strong>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Birth Height</span>
                          <strong className="text-white block mt-0.5">{selectedChildForCharts.birthHeight} cm</strong>
                        </div>
                      </div>
                    </div>

                    {/* Growth Chart Panel */}
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-[#E2E8F0] bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">WHO Growth Charts</h3>
                          <p className="text-[10px] text-slate-400">Comparing weight, height and BMI velocity trends against standard WHO bands</p>
                        </div>
                        
                        <div className="flex border border-[#E2E8F0] rounded-xl overflow-hidden bg-white text-xs">
                          {['Weight', 'Height', 'BMI'].map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setActiveChartTab(tab)}
                              className={`px-3 py-1.5 font-bold transition-all ${
                                activeChartTab === tab
                                  ? 'bg-[#1D61FF] text-white'
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-5">
                        {chartWeightData.length === 0 ? (
                          <div className="py-20 text-center text-slate-400 text-xs">No growth record metrics registered for this child.</div>
                        ) : (
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={activeChartTab === 'Weight' ? chartWeightData : activeChartTab === 'Height' ? chartHeightData : chartBmiData}
                                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                                <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                                  labelStyle={{ fontWeight: 'bold', color: '#1D61FF' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '15px' }} />

                                {/* WHO Percentiles */}
                                <Area type="monotone" dataKey="p97" name="97th Percentile" stroke="#EF4444" strokeWidth={1} strokeDasharray="3 3" fill="none" />
                                <Area type="monotone" dataKey="p85" name="85th Percentile" stroke="#F59E0B" strokeWidth={1} strokeDasharray="3 3" fill="none" />
                                <Area type="monotone" dataKey="p50" name="WHO Median (50th)" stroke="#10B981" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
                                <Area type="monotone" dataKey="p15" name="15th Percentile" stroke="#F59E0B" strokeWidth={1} strokeDasharray="3 3" fill="none" />
                                <Area type="monotone" dataKey="p3" name="3rd Percentile" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="2 2" fill="none" />

                                {/* Child Series */}
                                <Area
                                  type="monotone"
                                  dataKey={activeChartTab === 'Weight' ? 'weight' : activeChartTab === 'Height' ? 'height' : 'bmi'}
                                  name={activeChartTab === 'Weight' ? 'Weight (kg)' : activeChartTab === 'Height' ? 'Height (cm)' : 'BMI Value'}
                                  stroke="#1D61FF"
                                  strokeWidth={3}
                                  fill="url(#colorValDoctor)"
                                />

                                <defs>
                                  <linearGradient id="colorValDoctor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1D61FF" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#1D61FF" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Historical Ledger Table */}
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-[#E2E8F0] bg-slate-50/50">
                        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Growth Record Ledger</h3>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-[#E2E8F0] text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                              <th className="px-4 py-3">Age Interval</th>
                              <th className="px-4 py-3">Recorded Date</th>
                              <th className="px-4 py-3">Weight (kg)</th>
                              <th className="px-4 py-3">Height (cm)</th>
                              <th className="px-4 py-3">BMI</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedChildForCharts.growthRecords && selectedChildForCharts.growthRecords.length > 0 ? (
                              selectedChildForCharts.growthRecords.map((rec, index) => (
                                <tr key={index} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-3 font-semibold text-slate-700">{rec.ageInterval}</td>
                                  <td className="px-4 py-3 text-slate-500">{new Date(rec.date).toLocaleDateString()}</td>
                                  <td className="px-4 py-3 font-bold text-[#1D61FF]">{rec.weight} kg</td>
                                  <td className="px-4 py-3 text-slate-700">{rec.height} cm</td>
                                  <td className="px-4 py-3 text-slate-700">{rec.bmi}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="px-4 py-6 text-center text-slate-400">No measurements logged yet.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-10 text-center bg-white border border-[#E2E8F0] rounded-2xl shadow-sm text-slate-400 flex flex-col items-center justify-center">
                    <FileText size={40} className="text-slate-300 mb-3" />
                    <p className="text-xs">No child selected.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Select a child from the left panel to display growth charts.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease' }}>
              {/* Referrals Search bar */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search size={16} className="text-slate-400" />
                  </span>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D61FF] transition-all"
                    placeholder="Search outbound referrals by child name, ID, hospital..."
                    value={referralSearchTerm}
                    onChange={(e) => setReferralSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-[#1D61FF]/10 rounded-xl text-[#1D61FF]">
                    <Activity size={20} />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase block">Outbound Specialist Referrals</span>
                    <h3 className="text-2xl font-extrabold text-[#0F172A] mt-0.5">{clinicReferralsList.length}</h3>
                  </div>
                </div>
                
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-red-50 rounded-xl text-red-500">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase block">Critical Referred</span>
                    <h3 className="text-2xl font-extrabold text-[#0F172A] mt-0.5">
                      {clinicReferralsList.filter(c => c.alertLevel === 'Critical').length}
                    </h3>
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase block">Lady Ridgeway Transfers</span>
                    <h3 className="text-2xl font-extrabold text-[#0F172A] mt-0.5">
                      {clinicReferralsList.filter(c => c.assessment?.specialistReferral?.includes('Lady Ridgeway')).length}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Referrals table list */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-[#E2E8F0] bg-white">
                  <h3 className="text-sm font-bold text-[#0F172A]">Clinic Outbound Transfers</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Generate official tertiary hospital referral letters for parents</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#E2E8F0] text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                        <th className="px-4 py-3.5">Child Details & ID</th>
                        <th className="px-4 py-3.5">Referred Date</th>
                        <th className="px-4 py-3.5">Clinical Diagnosis</th>
                        <th className="px-4 py-3.5">Destination Specialist Hospital</th>
                        <th className="px-4 py-3.5">Severity</th>
                        <th className="px-4 py-3.5 text-right">Referral Letter</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingReferrals ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-10 text-center text-slate-400">Loading clinic referrals...</td>
                        </tr>
                      ) : filteredClinicReferrals.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-10 text-center text-slate-400">No outbound referrals matching query.</td>
                        </tr>
                      ) : (
                        filteredClinicReferrals.map((item) => (
                          <tr key={item._id} className="hover:bg-slate-50/70 transition-all">
                            <td className="px-4 py-4">
                              <div className="font-bold text-slate-800">{item.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.digitalHealthId}</div>
                            </td>
                            <td className="px-4 py-4 text-slate-600 font-medium">
                              {item.assessment?.reviewedAt ? new Date(item.assessment.reviewedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-4 font-semibold text-slate-700 max-w-[200px] truncate">
                              {item.assessment?.diagnosis}
                            </td>
                            <td className="px-4 py-4 text-slate-800 font-bold max-w-[200px] truncate">
                              📍 {item.assessment?.specialistReferral}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 vertical-middle ${
                                item.alertLevel === 'Critical' ? 'bg-red-500' : item.alertLevel === 'High' ? 'bg-amber-500' : 'bg-blue-400'
                              }`}></span>
                              <span className="font-bold text-slate-700">{item.alertLevel}</span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={() => setSelectedReferralForLetter(item)}
                                className="bg-[#1D61FF] hover:bg-blue-700 text-white text-[10px] font-bold px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 ml-auto"
                              >
                                <FileText size={12} />
                                <span>Generate Letter</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Referral Letter Modal overlay */}
              {selectedReferralForLetter && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Modal Control Header */}
                    <div className="bg-[#0F172A] text-white p-4 flex justify-between items-center px-6">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Official Outpatient Referral Document</span>
                      <button 
                        onClick={() => setSelectedReferralForLetter(null)}
                        className="text-slate-400 hover:text-white font-bold text-sm bg-white/10 px-2 py-0.5 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Letter Body (Print target) */}
                    <div className="p-8 overflow-y-auto flex-grow text-slate-800 space-y-6" id="printable-referral-letter">
                      {/* Sri Lanka Health Ministry Header */}
                      <div className="text-center border-b-2 border-slate-900 pb-4">
                        <h2 className="text-sm font-extrabold tracking-widest uppercase text-slate-900">{currentUser.assignedClinic || 'MOH Primary Child Health Clinic'}</h2>
                        <p className="text-[10px] text-slate-500 font-semibold tracking-wider mt-0.5">Ministry of Health, Sri Lanka</p>
                        <p className="text-[9px] text-slate-400 mt-1">Ref ID: {selectedReferralForLetter.digitalHealthId}-REF</p>
                      </div>

                      {/* Recipient details */}
                      <div className="flex justify-between items-start text-xs">
                        <div>
                          <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">To Hospital:</p>
                          <strong className="text-slate-900 text-sm block mt-0.5">The Pediatrician-in-Charge</strong>
                          <span className="text-slate-700 font-semibold">{selectedReferralForLetter.assessment?.specialistReferral}</span>
                          <span className="text-slate-500 block">Sri Lanka</span>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Date of Referral:</p>
                          <strong className="text-slate-900 block mt-0.5">
                            {selectedReferralForLetter.assessment?.reviewedAt ? new Date(selectedReferralForLetter.assessment.reviewedAt).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'long', day: 'numeric'
                            }) : new Date().toLocaleDateString()}
                          </strong>
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="bg-slate-100 border-l-4 border-l-[#1D61FF] p-3 text-xs">
                        <strong className="text-slate-900 font-bold">SUBJECT: CLINICAL REFERRAL FOR {selectedReferralForLetter.name.toUpperCase()}</strong>
                        <div className="text-[10px] text-slate-600 mt-1 font-mono">
                          Digital Health ID: {selectedReferralForLetter.digitalHealthId} • Gender: {selectedReferralForLetter.gender} • Age: {selectedReferralForLetter.age}
                        </div>
                      </div>

                      {/* Clinical Details */}
                      <div className="space-y-4 text-xs leading-relaxed">
                        <p>Dear Colleague,</p>
                        <p>
                          I am referring this child for specialist pediatric evaluation and management. The child was referred to our clinic by the Grama Niladhari division midwife due to <strong>{selectedReferralForLetter.alertReason}</strong>.
                        </p>

                        {/* Vitals table */}
                        <div>
                          <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[9px] mb-1.5">Registered Vitals</h4>
                          <table className="w-full text-left border-collapse border border-slate-200">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase">
                                <th className="p-2 border-r border-slate-200">Temperature</th>
                                <th className="p-2 border-r border-slate-200">Heart Rate</th>
                                <th className="p-2">Blood Pressure</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="text-slate-700 font-medium">
                                <td className="p-2 border-r border-slate-200">{selectedReferralForLetter.vitals?.temp || '36.8°C'}</td>
                                <td className="p-2 border-r border-slate-200">{selectedReferralForLetter.vitals?.hr || '98 bpm'}</td>
                                <td className="p-2">{selectedReferralForLetter.vitals?.bp || '90/60 mmHg'}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Clinical assessment info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <strong className="text-[9px] uppercase tracking-wider text-slate-500 block">Primary Diagnosis & Findings</strong>
                            <p className="mt-1 font-semibold text-slate-800">{selectedReferralForLetter.assessment?.diagnosis}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <strong className="text-[9px] uppercase tracking-wider text-slate-500 block">Immediate Treatment Initiated</strong>
                            <p className="mt-1 font-semibold text-slate-800">{selectedReferralForLetter.assessment?.treatment}</p>
                          </div>
                        </div>

                        {/* Midwife's notes */}
                        {selectedReferralForLetter.historyNotes && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                            <strong className="text-[9px] uppercase tracking-wider text-slate-400 not-italic block mb-1">Midwife Field Observations:</strong>
                            "{selectedReferralForLetter.historyNotes}"
                          </div>
                        )}

                        <p className="pt-3">
                          Thank you for taking over the management of this case. Please sync clinical feedback to our database upon discharge.
                        </p>
                      </div>

                      {/* Doctor Signature Block */}
                      <div className="pt-8 border-t border-slate-100 flex justify-between items-end text-xs">
                        <div>
                          <p className="text-slate-500">Kind regards,</p>
                          <strong className="text-slate-800 block mt-4">{currentUser.name || 'Dr. Nimal Silva'}</strong>
                          <span className="text-slate-500">{currentUser.assignedClinic || 'MOH Primary Pediatric Clinic'}</span>
                        </div>
                        <div className="text-center w-28 h-12 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-mono">
                          Official Stamp
                        </div>
                      </div>
                    </div>

                    {/* Print letter controls */}
                    <div className="p-4 bg-slate-50 border-t border-[#E2E8F0] flex gap-3 justify-end px-6">
                      <button
                        onClick={() => setSelectedReferralForLetter(null)}
                        className="bg-white border border-[#E2E8F0] hover:bg-slate-50 text-xs font-bold text-slate-700 px-4 py-2.5 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="bg-[#1D61FF] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Printer size={14} />
                        <span>Print Document</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Bottom Progress Strip */}
        <footer className="mt-8 pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span>Daily Consultation Progress:</span>
            <div className="w-48 bg-slate-200 h-2.5 rounded-full overflow-hidden inline-block">
              <div 
                className="h-full bg-green-500 transition-all duration-500" 
                style={{ width: `${(examinedCount / totalPatientsScheduled) * 100}%` }}
              ></div>
            </div>
            <span>{examinedCount}/{totalPatientsScheduled} ({Math.round((examinedCount / totalPatientsScheduled) * 100)}%)</span>
          </div>

          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#1D61FF]" />
              <span>Avg Consultation: 8.5 mins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertCircle size={14} className="text-red-500" />
              <span>Critical Reviewed: {criticalReviewedCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-green-500" />
              <span>Referrals Cleared: {examinedCount}</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
