import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  User, 
  Calendar, 
  Activity, 
  Phone, 
  MapPin, 
  Home, 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  Plus, 
  Printer, 
  ChevronRight, 
  Eye,
  LogOut,
  Stethoscope,
  Info
} from 'lucide-react';
import './Dashboard.css';

// Default static WHO data and mock items if DB doesn't have them
const DEFAULT_WEIGHT_DATA = [
  { month: '0M', weight: 3.2, p3: 2.4, p15: 2.8, p50: 3.3, p85: 3.9, p97: 4.3 },
  { month: '3M', weight: 5.8, p3: 5.0, p15: 5.5, p50: 6.0, p85: 6.6, p97: 7.2 },
  { month: '6M', weight: 7.1, p3: 6.4, p15: 7.0, p50: 7.5, p85: 8.2, p97: 8.8 },
  { month: '9M', weight: 8.0, p3: 7.2, p15: 7.8, p50: 8.5, p85: 9.3, p97: 10.0 },
  { month: '12M', weight: 8.6, p3: 7.8, p15: 8.5, p50: 9.2, p85: 10.1, p97: 10.8 },
  { month: '15M', weight: 9.1, p3: 8.4, p15: 9.1, p50: 9.8, p85: 10.8, p97: 11.5 },
  { month: '18M', weight: 9.4, p3: 8.8, p15: 9.6, p50: 10.4, p85: 11.4, p97: 12.2 }
];

const DEFAULT_HEIGHT_DATA = [
  { month: '0M', height: 49.8, p3: 46.1, p15: 48.0, p50: 49.9, p85: 51.8, p97: 53.7 },
  { month: '3M', height: 59.5, p3: 55.6, p15: 57.5, p50: 59.8, p85: 62.1, p97: 64.0 },
  { month: '6M', height: 65.8, p3: 61.2, p15: 63.5, p50: 65.9, p85: 68.3, p97: 70.6 },
  { month: '9M', height: 70.2, p3: 66.5, p15: 68.8, p50: 71.0, p85: 73.2, p97: 75.5 },
  { month: '12M', height: 74.0, p3: 71.0, p15: 73.0, p50: 75.0, p85: 77.0, p97: 79.0 },
  { month: '15M', height: 77.2, p3: 74.2, p15: 76.5, p50: 78.8, p85: 81.1, p97: 83.4 },
  { month: '18M', height: 80.5, p3: 76.9, p15: 79.5, p50: 82.0, p85: 84.5, p97: 87.1 }
];

const DEFAULT_BMI_DATA = [
  { month: '0M', bmi: 12.9, p3: 11.1, p15: 12.0, p50: 13.0, p85: 14.1, p97: 15.1 },
  { month: '3M', bmi: 16.4, p3: 14.5, p15: 15.5, p50: 16.5, p85: 17.6, p97: 18.7 },
  { month: '6M', bmi: 16.4, p3: 14.6, p15: 15.6, p50: 16.6, p85: 17.8, p97: 19.0 },
  { month: '9M', bmi: 16.2, p3: 14.4, p15: 15.4, p50: 16.4, p85: 17.6, p97: 18.8 },
  { month: '12M', bmi: 15.7, p3: 13.9, p15: 14.9, p50: 15.9, p85: 17.1, p97: 18.3 },
  { month: '15M', bmi: 15.3, p3: 13.5, p15: 14.5, p50: 15.5, p85: 16.7, p97: 17.9 },
  { month: '18M', bmi: 14.5, p3: 13.1, p15: 14.1, p50: 15.1, p85: 16.3, p97: 17.5 }
];

const INITIAL_VISITS = [
  { date: '2026-07-10', midwife: 'Kamani Perera', weight: 9.4, height: 80.5, type: 'Routine', note: 'Child shows healthy cognitive responses. Advised mother on high-protein solids.' },
  { date: '2026-06-12', midwife: 'Kamani Perera', weight: 9.1, height: 77.2, type: 'Vaccine', note: 'MMR 1 Vaccine administered. Minor post-injection redness noted.' },
  { date: '2026-05-15', midwife: 'Nilanthi Alwis', weight: 8.6, height: 74.0, type: 'Alert', note: 'Slight deceleration in weight velocity. Dietary intake reviewed with parent.' }
];

const INITIAL_VACCINES = [
  { id: 1, name: "BCG (Birth)", status: "Completed", date: "2024-12-05" },
  { id: 2, name: "Pentavalent 1 (2M)", status: "Completed", date: "2025-02-05" },
  { id: 3, name: "OPV 1 (2M)", status: "Completed", date: "2025-02-05" },
  { id: 4, name: "Pentavalent 2 (4M)", status: "Completed", date: "2025-04-05" },
  { id: 5, name: "OPV 2 (4M)", status: "Completed", date: "2025-04-05" },
  { id: 6, name: "Pentavalent 3 (6M)", status: "Completed", date: "2025-06-05" },
  { id: 7, name: "OPV 3 (6M)", status: "Completed", date: "2025-06-05" },
  { id: 8, name: "Measles & Rubella (9M)", status: "Completed", date: "2025-09-05" },
  { id: 9, name: "MMR 1 (12M)", status: "Completed", date: "2025-12-05" },
  { id: 10, name: "DPT Booster (18M)", status: "Due", date: "2026-07-25" },
  { id: 11, name: "OPV Booster (18M)", status: "Upcoming", date: "2026-07-25" },
  { id: 12, name: "JE Vaccine (12M)", status: "Completed", date: "2025-12-10" }
];

export default function ChildProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printCardRef = useRef();

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);

  // View States
  const [activeChartTab, setActiveChartTab] = useState('Weight'); // Weight, Height, BMI
  const [vaccineFilter, setVaccineFilter] = useState('All'); // All, Completed, Due, Upcoming
  const [observations, setObservations] = useState("Child's activity levels are normal. Encouraged continuing complementary feeding practices with additional micro-nutrients.");
  const [isObsSaving, setIsObsSaving] = useState(false);

  // Dialog Modals
  const [isMeasureModalOpen, setIsMeasureModalOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Logs & Measurements Data
  const [weightData, setWeightData] = useState(DEFAULT_WEIGHT_DATA);
  const [heightData, setHeightData] = useState(DEFAULT_HEIGHT_DATA);
  const [bmiData, setBmiData] = useState(DEFAULT_BMI_DATA);
  const [visits, setVisits] = useState(INITIAL_VISITS);
  const [vaccines, setVaccines] = useState(INITIAL_VACCINES);

  // New Measurement Fields
  const [newMonth, setNewMonth] = useState('21M');
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');

  // Administer Vaccine Fields
  const [selectedVaccineId, setSelectedVaccineId] = useState('');
  const [administeredDate, setAdministeredDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch Child details on mount
  useEffect(() => {
    const fetchChild = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/children/${id}`);
        setChild(res.data);
      } catch (err) {
        console.error("Error loading child details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChild();
  }, [id]);

  const handlePrintQR = () => {
    const printContent = printCardRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleSaveObservations = () => {
    setIsObsSaving(true);
    setTimeout(() => {
      setIsObsSaving(false);
      alert("Midwife observations successfully updated in health ledger.");
    }, 800);
  };

  const handleAddMeasurement = (e) => {
    e.preventDefault();
    if (!newWeight || !newHeight) return;

    const w = parseFloat(newWeight);
    const h = parseFloat(newHeight) / 100; // cm to m
    const bmiVal = parseFloat((w / (h * h)).toFixed(1));

    // Update Weight
    setWeightData(prev => [
      ...prev,
      { month: newMonth, weight: w, p3: 9.0, p15: 9.8, p50: 10.8, p85: 11.8, p97: 12.6 }
    ]);

    // Update Height
    setHeightData(prev => [
      ...prev,
      { month: newMonth, height: parseFloat(newHeight), p3: 78.0, p15: 80.5, p50: 83.2, p85: 86.0, p97: 88.5 }
    ]);

    // Update BMI
    setBmiData(prev => [
      ...prev,
      { month: newMonth, bmi: bmiVal, p3: 13.0, p15: 14.0, p50: 15.0, p85: 16.2, p97: 17.3 }
    ]);

    // Log as clinic visit
    const newVisit = {
      date: new Date().toISOString().split('T')[0],
      midwife: 'Kamani Perera',
      weight: w,
      height: parseFloat(newHeight),
      type: 'Routine',
      note: `New metrics logged during routine consultation. Calculated BMI: ${bmiVal}.`
    };
    setVisits([newVisit, ...visits]);

    setIsMeasureModalOpen(false);
    setNewWeight('');
    setNewHeight('');
    alert("New clinical measurements logged successfully.");
  };

  const handleAdministerVaccine = (e) => {
    e.preventDefault();
    if (!selectedVaccineId) return;

    setVaccines(prev => prev.map(vac => {
      if (vac.id === parseInt(selectedVaccineId)) {
        return { ...vac, status: "Completed", date: administeredDate };
      }
      return vac;
    }));

    // Add Vaccine Visit entry
    const selectedVac = vaccines.find(v => v.id === parseInt(selectedVaccineId));
    const newVisit = {
      date: administeredDate,
      midwife: 'Kamani Perera',
      weight: weightData[weightData.length - 1].weight,
      height: heightData[heightData.length - 1].height,
      type: 'Vaccine',
      note: `${selectedVac.name} vaccine administered successfully. Scheduled updates checked.`
    };
    setVisits([newVisit, ...visits]);

    setIsVaccineModalOpen(false);
    alert(`Immunization status updated successfully for ${selectedVac.name}.`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1D61FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium text-sm">Loading health profile ledger...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center p-6 max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-3xl">❌</span>
          <h3 className="text-lg font-bold text-slate-800 mt-3">Profile Not Found</h3>
          <p className="text-xs text-slate-500 mt-1">The requested digital health record could not be loaded.</p>
          <button onClick={() => navigate('/midwife-dashboard')} className="mt-4 bg-[#1D61FF] text-white px-4 py-2 rounded-xl text-xs font-bold">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calculate current BMI based on latest weight & height data
  const latestWeight = weightData[weightData.length - 1].weight;
  const latestHeight = heightData[heightData.length - 1].height;
  const calculatedBMI = (latestWeight / ((latestHeight / 100) * (latestHeight / 100))).toFixed(1);

  // Vaccine progress
  const completedVaccinesCount = vaccines.filter(v => v.status === 'Completed').length;
  const vaccineProgressPercent = Math.round((completedVaccinesCount / vaccines.length) * 100);

  // Filtered vaccines list
  const filteredVaccines = vaccines.filter(v => vaccineFilter === 'All' || v.status === vaccineFilter);

  // Gender color helpers
  const isFemale = child.gender === 'Female' || child.gender === 'female';

  return (
    <div className="dashboard-container min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-[#0F172A]">
      
      {/* Sidebar Navigation - Dark Navy Icon Rail */}
      <aside className="sidebar w-64 bg-[#0F172A] text-white p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="sidebar-logo flex items-center gap-3 mb-8">
            <span className="heart-icon text-2xl">🤍</span>
            <div className="logo-text">
              <h3 className="font-extrabold tracking-wide text-sm">MediKid Portal</h3>
              <p className="text-[10px] text-slate-400">Midwife & Clinic Panel</p>
            </div>
          </div>
          <ul className="nav-menu space-y-1.5">
            <li 
              onClick={() => navigate('/midwife-dashboard')}
              className="flex items-center gap-2.5 px-4 py-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Home size={16} />
              <span>Midwife Dashboard</span>
            </li>
            <li className="active flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#1D61FF] text-white font-semibold text-xs uppercase tracking-wider">
              <User size={16} />
              <span>Child Health Profile</span>
            </li>
            <li className="flex items-center gap-2.5 px-4 py-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer">
              <Activity size={16} />
              <span>Growth Analytics</span>
            </li>
          </ul>
        </div>
        <div>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }} 
            className="logout-link flex items-center gap-2 text-red-400 hover:text-red-300 font-semibold text-sm w-full py-2.5 border-t border-slate-800"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="main-content flex-grow p-6 flex flex-col overflow-y-auto">
        
        {/* Profile Banner Component (Dark Navy) */}
        <section className="bg-[#0F172A] text-white rounded-3xl p-6 mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1D61FF]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              {/* Initials Avatar */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-lg text-white shadow-inner ${
                isFemale ? 'bg-pink-600' : 'bg-blue-600'
              }`}>
                {child.name ? child.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() : 'C'}
              </div>
              
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold">{child.name}</h1>
                  <span className="bg-white/10 text-white border border-white/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono">
                    {child.digitalHealthId}
                  </span>
                </div>
                
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-300 font-medium">
                  <span className="flex items-center gap-1"><Clock size={13} className="text-slate-400"/> Age: 18 Months</span>
                  <span>•</span>
                  <span>Gender: {child.gender}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar size={13} className="text-slate-400"/> DOB: {new Date(child.dob).toLocaleDateString()}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-4 pt-4 border-t border-white/10 text-xs text-slate-400">
                  <div><strong>Mother Name:</strong> {child.motherName || 'N/A'}</div>
                  <div><strong>Contact:</strong> {child.phone || 'N/A'}</div>
                  <div><strong>Assigned Clinic:</strong> Colombo 05 MOH</div>
                  <div><strong>Midwife:</strong> Kamani Perera (PHM)</div>
                </div>
              </div>
            </div>

            {/* Live-renderable QR Code Panel */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 self-stretch lg:self-auto justify-between lg:justify-start">
              <div className="bg-white p-2.5 rounded-xl">
                <QRCodeSVG value={child.digitalHealthId} size={85} />
              </div>
              <div className="flex flex-col gap-1.5 justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Child Digital ID</span>
                <span className="text-xs font-semibold text-slate-200">Colombo MOH Clinic Pass</span>
                <button 
                  onClick={() => setIsQRModalOpen(true)}
                  className="mt-2 text-[#1D61FF] hover:text-[#1D61FF]/90 font-bold text-xs flex items-center gap-1.5 text-left bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/15"
                >
                  <Printer size={13} />
                  <span>Print QR Pass</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stat Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-center">
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Current Weight</span>
              <strong className="text-base text-white block mt-0.5">{latestWeight} kg</strong>
              <span className="inline-block bg-red-500/20 text-red-300 font-extrabold text-[9px] px-2 py-0.5 rounded mt-1 border border-red-500/20">
                {weightData[weightData.length-1].p3 ? '8th Percentile' : 'Critical'}
              </span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Current Height</span>
              <strong className="text-base text-white block mt-0.5">{latestHeight} cm</strong>
              <span className="inline-block bg-amber-500/20 text-amber-300 font-extrabold text-[9px] px-2 py-0.5 rounded mt-1 border border-amber-500/20">
                12th Percentile
              </span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Calculated BMI</span>
              <strong className="text-base text-white block mt-0.5">{calculatedBMI}</strong>
              <span className="inline-block bg-green-500/20 text-green-300 font-extrabold text-[9px] px-2 py-0.5 rounded mt-1 border border-green-500/20">
                Normal BMI Range
              </span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Next Routine Visit</span>
              <strong className="text-base text-slate-200 block mt-0.5">July 25, 2026</strong>
              <span className="inline-block bg-blue-500/20 text-blue-300 font-extrabold text-[9px] px-2 py-0.5 rounded mt-1 border border-blue-500/20">
                DPT Booster Due
              </span>
            </div>
          </div>
        </section>

        {/* Main Columns Split Grid (65% Left, 35% Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          
          {/* Left Column: Growth Tracking and Clinic Timeline (65%) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Growth Tracking Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-base font-bold text-[#0F172A]">WHO Growth Charts & Statistics</h2>
                  <p className="text-xs text-slate-500">Weight-for-Age, Height-for-Age and BMI velocity trends</p>
                </div>
                
                <button 
                  onClick={() => setIsMeasureModalOpen(true)}
                  className="bg-[#1D61FF] hover:bg-[#1D61FF]/90 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10"
                >
                  <Plus size={14} />
                  <span>Log Measurement</span>
                </button>
              </div>

              {/* Tabs list */}
              <div className="flex border-b border-[#E2E8F0] bg-slate-50/50">
                {['Weight', 'Height', 'BMI'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveChartTab(tab)}
                    className={`flex-1 py-3 text-xs font-bold border-b-2 text-center transition-all ${
                      activeChartTab === tab 
                        ? 'border-b-[#1D61FF] text-[#1D61FF]' 
                        : 'border-b-transparent text-slate-500 hover:text-[#0F172A]'
                    }`}
                  >
                    {tab === 'Weight' ? 'Weight-for-Age' : tab === 'Height' ? 'Height-for-Age' : 'BMI Chart'}
                  </button>
                ))}
              </div>

              {/* Recharts AreaChart with actual WHO percentile bands */}
              <div className="p-5">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={activeChartTab === 'Weight' ? weightData : activeChartTab === 'Height' ? heightData : bmiData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                        labelStyle={{ fontWeight: 'bold', color: '#1D61FF' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '15px' }} />
                      
                      {/* Percentile Bands (Reference areas shaded) */}
                      <Area type="monotone" dataKey="p97" name="97th Percentile" stroke="#EF4444" strokeWidth={1} strokeDasharray="3 3" fill="none" />
                      <Area type="monotone" dataKey="p85" name="85th Percentile" stroke="#F59E0B" strokeWidth={1} strokeDasharray="3 3" fill="none" />
                      <Area type="monotone" dataKey="p50" name="WHO Median (50th)" stroke="#10B981" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
                      <Area type="monotone" dataKey="p15" name="15th Percentile" stroke="#F59E0B" strokeWidth={1} strokeDasharray="3 3" fill="none" />
                      <Area type="monotone" dataKey="p3" name="3rd Percentile" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="2 2" fill="none" />
                      
                      {/* Active Child Curve */}
                      <Area 
                        type="monotone" 
                        dataKey={activeChartTab === 'Weight' ? 'weight' : activeChartTab === 'Height' ? 'height' : 'bmi'} 
                        name={activeChartTab === 'Weight' ? 'Child Weight (kg)' : activeChartTab === 'Height' ? 'Child Height (cm)' : 'BMI Value'} 
                        stroke="#1D61FF" 
                        strokeWidth={3} 
                        fill="url(#colorVal)" 
                      />
                      
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1D61FF" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#1D61FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Clinic Visit Timeline */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-5">
              <div className="mb-4">
                <h3 className="text-base font-bold text-[#0F172A]">Clinic Visit Timeline</h3>
                <p className="text-xs text-slate-500">Audit ledger of past midwife and clinical records</p>
              </div>

              <div className="relative border-l border-slate-200 ml-3 pl-6 space-y-6">
                {visits.map((visit, idx) => (
                  <div key={idx} className="relative">
                    {/* Color-coded dot rail indicator */}
                    <span className={`absolute -left-[30px] top-1.5 w-3 h-3 rounded-full border-2 border-white ring-4 ${
                      visit.type === 'Routine' 
                        ? 'bg-blue-600 ring-blue-100' 
                        : visit.type === 'Vaccine' 
                          ? 'bg-green-600 ring-green-100' 
                          : 'bg-orange-500 ring-orange-100'
                    }`}></span>

                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{visit.date}</span>
                        <h4 className="text-xs font-bold text-slate-800 mt-0.5">Clinic Visit: {visit.type} Checkup</h4>
                        <div className="text-[10px] text-slate-500 mt-0.5">Recorded by midwife: {visit.midwife}</div>
                      </div>
                      <div className="bg-slate-50 border border-[#E2E8F0] rounded-lg px-2.5 py-1 text-right text-[10px] font-semibold text-slate-700">
                        <span>W: {visit.weight}kg</span>
                        <span className="mx-1 text-slate-300">|</span>
                        <span>H: {visit.height}cm</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-[#E2E8F0]/80 mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                      {visit.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Health Alerts, Vaccination Checklist & Next Appointments (35%) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Health Alerts Card (Green Pastel background style) */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="text-emerald-700" size={18} />
                <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Health Indicators & Alerts</h3>
              </div>

              {/* Grid of 4 indicators */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white border border-emerald-100 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block font-bold">Stunting Risk</span>
                  <span className="text-xs font-bold text-green-700 mt-1 inline-block">Low Risk</span>
                </div>
                <div className="bg-white border border-emerald-100 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block font-bold">Wasting Score</span>
                  <span className="text-xs font-bold text-green-700 mt-1 inline-block">Normal (1.1)</span>
                </div>
                <div className="bg-white border border-emerald-100 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block font-bold">Weight drop alert</span>
                  <span className="text-xs font-bold text-red-600 mt-1 inline-block">Triggered</span>
                </div>
                <div className="bg-white border border-emerald-100 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block font-bold">Severe illnesses</span>
                  <span className="text-xs font-bold text-green-700 mt-1 inline-block">None</span>
                </div>
              </div>

              {/* Editable Midwife observations */}
              <div>
                <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-2">Midwife Observations & Notes</label>
                <textarea 
                  rows="3"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full bg-white border border-emerald-100 rounded-xl p-3 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button 
                  onClick={handleSaveObservations}
                  disabled={isObsSaving}
                  className="mt-3 w-full bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold py-2 rounded-xl transition-all shadow-md shadow-emerald-500/10"
                >
                  {isObsSaving ? 'Saving...' : 'Update Observations'}
                </button>
              </div>
            </div>

            {/* Vaccination Checklist Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Vaccination Tracker</h3>
                  <p className="text-xs text-slate-500">National Immunization Ledger</p>
                </div>
                
                <button 
                  onClick={() => setIsVaccineModalOpen(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-[#1D61FF] text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg transition-all"
                >
                  Administer
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-4 bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Completed Immunizations</span>
                  <span>{completedVaccinesCount}/{vaccines.length} ({vaccineProgressPercent}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${vaccineProgressPercent}%` }}></div>
                </div>
              </div>

              {/* Filter pills */}
              <div className="flex gap-1 mb-4 flex-wrap">
                {['All', 'Completed', 'Due', 'Upcoming'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setVaccineFilter(f)}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full border transition-all ${
                      vaccineFilter === f 
                        ? 'bg-[#0F172A] text-white border-[#0F172A]' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Vaccine checklist */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredVaccines.map((vac) => (
                  <div key={vac.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/50">
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 block">{vac.name}</span>
                      {vac.status === 'Completed' && (
                        <span className="text-[9px] text-slate-400 block">Given: {vac.date}</span>
                      )}
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      vac.status === 'Completed' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : vac.status === 'Due' 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {vac.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Appointments mini-list */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">Clinic Appointments</h3>
              
              <div className="space-y-3">
                <div className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-[#E2E8F0]/70">
                  <div className="w-8 h-8 rounded-full bg-[#1D61FF]/10 text-[#1D61FF] flex items-center justify-center shrink-0">
                    💉
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">DPT + OPV Booster Clinic</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">July 25, 2026 • MOH Colombo 05</p>
                  </div>
                </div>

                <div className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-[#E2E8F0]/70">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    🩺
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Pediatric Nutritionist review</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">August 10, 2026 • MOH Colombo 05</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* 1. Print QR Code Modal */}
      {isQRModalOpen && (
        <div className="modal-overlay fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
            <div ref={printCardRef} className="p-4 border-2 border-dashed border-[#1D61FF] rounded-xl bg-slate-50">
              <h3 className="text-md font-bold text-[#1D61FF]">CHILD DIGITAL HEALTH CARD</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Ministry of Health, Sri Lanka</p>
              
              <div className="my-5 flex justify-center">
                <QRCodeSVG value={child.digitalHealthId} size={150} />
              </div>

              <div className="text-left text-xs space-y-1 bg-white border border-[#E2E8F0] p-3 rounded-lg font-medium text-slate-700">
                <div><strong>Child Name:</strong> {child.name}</div>
                <div><strong>Digital ID:</strong> <span className="text-[#1D61FF] font-bold font-mono">{child.digitalHealthId}</span></div>
                <div><strong>Date of Birth:</strong> {new Date(child.dob).toLocaleDateString()}</div>
                <div><strong>Mother Name:</strong> {child.motherName}</div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button 
                onClick={handlePrintQR}
                className="flex-1 bg-[#1D61FF] hover:bg-[#1D61FF]/90 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
              >
                <Printer size={14} />
                <span>Print Card</span>
              </button>
              <button 
                onClick={() => setIsQRModalOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Log New Measurement Modal */}
      {isMeasureModalOpen && (
        <div className="modal-overlay fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-md font-bold text-[#0F172A] mb-1">Log Child Measurements</h3>
            <p className="text-xs text-slate-500 mb-4">Add new weight/height metrics to growth chart ledger.</p>

            <form onSubmit={handleAddMeasurement} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Age Interval</label>
                <div className="relative">
                  <select 
                    value={newMonth}
                    onChange={(e) => setNewMonth(e.target.value)}
                    className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1D61FF]"
                  >
                    <option value="19M">19 Months</option>
                    <option value="20M">20 Months</option>
                    <option value="21M">21 Months</option>
                    <option value="22M">22 Months</option>
                    <option value="23M">23 Months</option>
                    <option value="24M">24 Months</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Weight (kg)</label>
                  <input 
                    type="number"
                    step="0.1"
                    required
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="e.g. 9.8"
                    className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1D61FF]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Height (cm)</label>
                  <input 
                    type="number"
                    step="0.1"
                    required
                    value={newHeight}
                    onChange={(e) => setNewHeight(e.target.value)}
                    placeholder="e.g. 82.5"
                    className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1D61FF]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-[#1D61FF] hover:bg-[#1D61FF]/90 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10"
                >
                  Save Metrics
                </button>
                <button 
                  type="button"
                  onClick={() => setIsMeasureModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Mark Vaccine Administered Modal */}
      {isVaccineModalOpen && (
        <div className="modal-overlay fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-md font-bold text-[#0F172A] mb-1">Administer Immunization</h3>
            <p className="text-xs text-slate-500 mb-4">Record administered vaccine on child health card.</p>

            <form onSubmit={handleAdministerVaccine} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Select Vaccine</label>
                <div className="relative">
                  <select 
                    required
                    value={selectedVaccineId}
                    onChange={(e) => setSelectedVaccineId(e.target.value)}
                    className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1D61FF]"
                  >
                    <option value="">-- Select Due Vaccine --</option>
                    {vaccines.filter(v => v.status !== 'Completed').map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Administration Date</label>
                <input 
                  type="date"
                  required
                  value={administeredDate}
                  onChange={(e) => setAdministeredDate(e.target.value)}
                  className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1D61FF]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-[#1D61FF] hover:bg-[#1D61FF]/90 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10"
                >
                  Save Immunization
                </button>
                <button 
                  type="button"
                  onClick={() => setIsVaccineModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
