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
  AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

export default function DoctorDashboard() {
  const [queue, setQueue] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('All'); // All, Critical, High, Moderate
  const [activeTab, setActiveTab] = useState('Consultation'); // Consultation, Case History
  const [toastMessage, setToastMessage] = useState(null);

  // Form Fields
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('Thriposha Double Allowance + Iron Syrup');
  const [referral, setReferral] = useState('None');
  const [parentNotes, setParentNotes] = useState('');
  const [referToHospital, setReferToHospital] = useState(false);
  const [specialistHospital, setSpecialistHospital] = useState('Lady Ridgeway Hospital for Children');
  const [reviewDate, setReviewDate] = useState('');

  // Daily statistics
  const [examinedCount, setExaminedCount] = useState(11);
  const [criticalReviewedCount, setCriticalReviewedCount] = useState(2);

  const totalPatientsScheduled = 24;

  // Fetch referrals from backend
  const fetchReferrals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/referrals');
      setQueue(res.data);
      if (res.data.length > 0) {
        setSelectedChild(res.data[0]);
      } else {
        setSelectedChild(null);
      }
    } catch (err) {
      console.error("Failed to fetch referrals:", err);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleResetReferrals = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/referrals/reset');
      setQueue(res.data.referrals);
      if (res.data.referrals.length > 0) {
        setSelectedChild(res.data.referrals[0]);
      } else {
        setSelectedChild(null);
      }
      showToast("Referral database reset to initial high-risk patients.");
    } catch (err) {
      console.error("Failed to reset referrals:", err);
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
    showToast(`Started medical review for ${child.name}`);
  };

  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) return;

    try {
      await axios.post(`http://localhost:5000/api/referrals/${selectedChild._id}/assess`, {
        diagnosis,
        treatment: referToHospital ? `${treatment} (Ref: ${specialistHospital})` : treatment,
        specialistReferral: referral,
        parentNotes,
        reviewDate
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
      } else {
        setSelectedChild(null);
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
            <li className="active flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#1D61FF] text-white font-semibold text-xs uppercase tracking-wider">
              <Stethoscope size={16} />
              <span>Doctor's Dashboard</span>
            </li>
            <li className="flex items-center gap-2.5 px-4 py-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer">
              <User size={16} />
              <span>My Consultations</span>
            </li>
            <li className="flex items-center gap-2.5 px-4 py-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer">
              <FileText size={16} />
              <span>Growth Charts</span>
            </li>
            <li className="flex items-center gap-2.5 px-4 py-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer">
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
                  NS
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-[#0F172A]">Dr. Nimal Silva</h1>
                    <span className="bg-[#1D61FF]/10 text-[#1D61FF] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Pediatrician
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                    <span>MOH Colombo 05 Clinic</span>
                    <span className="text-slate-300">•</span>
                    <Calendar size={13} className="text-slate-400" />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Notifications */}
              <div className="flex items-center gap-3">
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
                  <span>Reset Queue</span>
                </button>
                <div className="relative cursor-pointer p-2 bg-white rounded-xl border border-[#E2E8F0] hover:bg-slate-50 transition-all">
                  <Bell size={18} className="text-slate-600" />
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center border-2 border-white">
                    3
                  </span>
                </div>
              </div>
            </div>

            {/* Full-width Search Bar */}
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
          </header>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {/* Card 1: Critical Growth Retardation */}
            <div className="bg-red-50/70 border border-red-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-red-700 text-[10px] font-bold tracking-wider uppercase">Growth Retardation Cases</p>
                <h3 className="text-3xl font-extrabold text-red-800 mt-1">5</h3>
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
                <h3 className="text-3xl font-extrabold text-amber-800 mt-1">8</h3>
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
                <h3 className="text-3xl font-extrabold text-[#1D61FF] mt-1">24</h3>
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
                <h3 className="text-3xl font-extrabold text-green-800 mt-1">11</h3>
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
                      <div className={selectedChild.vitals?.tempAbnormal ? 'bg-amber-500/20 text-amber-300 rounded p-1 border border-amber-500/20' : 'text-slate-300 p-1'}>
                        <span className="text-[10px] block text-slate-400">Temp</span>
                        <strong className="text-[11px]">{selectedChild.vitals?.temp || '36.8°C'}</strong>
                      </div>
                      <div className={selectedChild.vitals?.hrAbnormal ? 'bg-amber-500/20 text-amber-300 rounded p-1 border border-amber-500/20' : 'text-slate-300 p-1'}>
                        <span className="text-[10px] block text-slate-400">Heart Rate</span>
                        <strong className="text-[11px]">{selectedChild.vitals?.hr || '98 bpm'}</strong>
                      </div>
                      <div className="text-slate-300 p-1">
                        <span className="text-[10px] block text-slate-400">BP</span>
                        <strong className="text-[11px]">{selectedChild.vitals?.bp || '90/60 mmHg'}</strong>
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
              <span>Referrals Cleared: {examinedCount - 11}</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
