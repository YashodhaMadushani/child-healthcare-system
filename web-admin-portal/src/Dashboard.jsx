import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Activity, 
  Users, 
  User, 
  Search, 
  Calendar, 
  LogOut, 
  Download, 
  Plus, 
  Trash2, 
  Shield, 
  AlertCircle,
  CheckCircle2,
  FileText,
  MapPin,
  Heart,
  TrendingUp,
  Activity as VitalsIcon
} from 'lucide-react';
import AddStaffModal from './AddStaffModal';

const chartData = [
  { name: 'Jan', count: 250 },
  { name: 'Feb', count: 320 },
  { name: 'Mar', count: 280 },
  { name: 'Apr', count: 390 },
  { name: 'May', count: 410 },
  { name: 'Jun', count: 428 },
];

const ASSIGNED_CLINICS = [
  "Imaduwa Central",
  "Dikkumbura",
  "Thittagalla",
  "Paragoda",
  "Kombala",
  "Bedipita",
  "Hatangala",
  "Puswelkada",
  "Danduwana",
  "Angulugaha",
  "Dorape",
  "Kahanda",
  "Induranvila",
  "Deegoda",
  "Kodagoda",
  "Andugoda",
  "Hettiagoda"
];

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffData, setStaffData] = useState([]);
  const [currentTab, setCurrentTab] = useState('overview'); // overview, doctors, midwives, children, schedules
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedClinicFilter, setSelectedClinicFilter] = useState('all');
  const [user, setUser] = useState(null);

  // Child Records States
  const [childrenList, setChildrenList] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [selectedChildReport, setSelectedChildReport] = useState(null);
  const [activeReportTab, setActiveReportTab] = useState('growth'); // growth, vaccines, assessments, nutrition

  // Parent Records States
  const [parentsList, setParentsList] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);

  // Clinic Schedules States
  const [schedulesList, setSchedulesList] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [schedClinicCenter, setSchedClinicCenter] = useState(ASSIGNED_CLINICS[0]);
  const [schedSessionType, setSchedSessionType] = useState('Immunization Clinic');
  const [schedDate, setSchedDate] = useState('');
  const [schedStaff, setSchedStaff] = useState('');
  const [schedCapacity, setSchedCapacity] = useState(30);

  // Fetching staff data from the backend 
  const fetchStaff = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/staff'); 
      setStaffData(res.data);
    } catch (err) {
      console.error("Data fetch failed:", err);
      showToast("Failed to load staff records.");
    }
  };

  const fetchChildren = async () => {
    setLoadingChildren(true);
    try {
      const res = await axios.get('http://localhost:5000/api/children');
      setChildrenList(res.data || []);
    } catch (err) {
      console.error("Failed to load children records:", err);
      showToast("Failed to fetch children records.");
    } finally {
      setLoadingChildren(false);
    }
  };

  const fetchParents = async () => {
    setLoadingParents(true);
    try {
      const res = await axios.get('http://localhost:5000/api/auth/parents');
      setParentsList(res.data || []);
    } catch (err) {
      console.error("Failed to load parent records:", err);
      showToast("Failed to fetch parent records.");
    } finally {
      setLoadingParents(false);
    }
  };

  const fetchSchedules = async () => {
    setLoadingSchedules(true);
    try {
      const res = await axios.get('http://localhost:5000/api/schedules');
      setSchedulesList(res.data || []);
    } catch (err) {
      console.error("Failed to load schedules:", err);
      showToast("Failed to fetch schedules.");
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!schedDate) return;

    try {
      await axios.post('http://localhost:5000/api/schedules', {
        clinicCenter: schedClinicCenter,
        sessionType: schedSessionType,
        date: schedDate,
        assignedStaff: schedStaff || "MOH Doctor",
        expectedCapacity: schedCapacity
      });

      showToast("Clinic session scheduled successfully.");
      fetchSchedules();

      // Reset Form fields
      setSchedDate('');
      setSchedStaff('');
      setSchedCapacity(30);
    } catch (err) {
      console.error("Scheduling failed:", err);
      const errMsg = err.response?.data?.msg || err.message;
      showToast(`Failed to create clinic session: ${errMsg}`);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm("Are you sure you want to cancel this clinic session?")) {
      try {
        await axios.delete(`http://localhost:5000/api/schedules/${id}`);
        showToast("Clinic session cancelled.");
        fetchSchedules();
      } catch (err) {
        console.error("Cancellation failed:", err);
        showToast("Error cancelling session.");
      }
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchChildren();
    fetchSchedules();
    fetchParents();

    // Get logged in user profile
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed.assignedClinic && parsed.assignedClinic !== 'N/A') {
          setSelectedClinicFilter(parsed.assignedClinic);
        }
      } catch (e) {
        console.error("Failed to parse logged-in user details", e);
      }
    }
  }, []);

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

  const handleDeleteStaff = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} from the staff records?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/auth/staff/${id}`);
        showToast(`Staff member ${name} deleted successfully.`);
        fetchStaff();
      } catch (err) {
        console.error("Delete failed:", err);
        showToast("Error deleting staff member.");
      }
    }
  };

  const handleGenerateReport = () => {
    const totalStaff = staffData.length;
    const docCount = staffData.filter(s => s.role?.toLowerCase() === 'doctor').length;
    const midCount = staffData.filter(s => s.role?.toLowerCase() === 'midwife').length;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "MediKid Clinic System - MOH Master Summary Report\n";
    csvContent += `Report Generated: ${new Date().toLocaleDateString()}\n\n`;
    csvContent += `Total Children Registered: ${childrenList.length}\n`;
    csvContent += `Total Staff: ${totalStaff}\n`;
    csvContent += `Active Doctors: ${docCount}\n`;
    csvContent += `Active Midwives: ${midCount}\n\n`;
    csvContent += "Child Name,Digital Health ID,Gender,Birth Weight (kg),Birth Height (cm),Clinic Center,Mother Name\n";
    
    childrenList.forEach(c => {
      csvContent += `"${c.name}","${c.digitalHealthId}","${c.gender}","${c.birthWeight || 0}","${c.birthHeight || 0}","${c.assignedClinicCenter || 'N/A'}","${c.motherName || 'N/A'}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MOH_Master_Clinic_Report_${new Date().getMonth() + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("MOH Monthly Summary Report generated.");
  };

  const doctorCount = staffData.filter(s => s.role && s.role.toLowerCase() === 'doctor').length;
  const midwifeCount = staffData.filter(s => s.role && s.role.toLowerCase() === 'midwife').length;
  const totalCompletedVaccinations = childrenList.reduce((acc, child) => {
    const completed = child.vaccinations?.filter(v => v.status?.toLowerCase() === 'completed').length || 0;
    return acc + completed;
  }, 0);

  const filteredStaff = staffData.filter(s => {
    const nameStr = s.name || '';
    const clinicStr = s.assignedClinic || '';
    const nicStr = s.nicNo || '';
    const matchesSearch = 
      nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinicStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nicStr.toLowerCase().includes(searchTerm.toLowerCase());

    if (currentTab === 'doctors') return matchesSearch && s.role?.toLowerCase() === 'doctor';
    if (currentTab === 'midwives') return matchesSearch && s.role?.toLowerCase() === 'midwife';
    return matchesSearch;
  });

  const filteredChildren = childrenList.filter(c => {
    if (selectedClinicFilter !== 'all' && c.assignedClinicCenter !== selectedClinicFilter) {
      return false;
    }
    const nameStr = c.name || '';
    const idStr = c.digitalHealthId || '';
    const clinicStr = c.assignedClinicCenter || '';
    const motherStr = c.motherName || '';
    return nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
           idStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
           clinicStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
           motherStr.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredParents = parentsList.filter(p => {
    const nameStr = p.name || '';
    const emailStr = p.email || '';
    const phoneStr = p.phone || '';
    return nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
           emailStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
           phoneStr.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-[#0F172A]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 right-6 z-50 bg-[#0F172A] text-white border border-slate-700/50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="text-green-400" size={18} />
          <div>
            <p className="text-sm font-semibold">{toastMessage.text}</p>
            <span className="text-[10px] text-slate-400">Logged at {toastMessage.time}</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-[#0F172A] text-white p-6 flex flex-col shadow-2xl sticky top-0 h-screen shrink-0 justify-between">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <span className="text-2xl">🤍</span>
            <div>
              <h2 className="text-sm font-extrabold tracking-wide uppercase">MediKid MOH</h2>
              <p className="text-[9px] text-slate-400">Medical Officer of Health</p>
            </div>
          </div>
          
          <nav className="space-y-1.5">
            <button 
              onClick={() => setCurrentTab('overview')}
              className={`w-full text-left p-3.5 rounded-xl font-semibold transition-all flex items-center gap-2.5 text-xs uppercase tracking-wider ${
                currentTab === 'overview' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Activity size={16} />
              <span>Dashboard Overview</span>
            </button>
            <button 
              onClick={() => setCurrentTab('doctors')}
              className={`w-full text-left p-3.5 rounded-xl font-semibold transition-all flex items-center gap-2.5 text-xs uppercase tracking-wider ${
                currentTab === 'doctors' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Shield size={16} />
              <span>Doctor Management</span>
            </button>
            <button 
              onClick={() => setCurrentTab('midwives')}
              className={`w-full text-left p-3.5 rounded-xl font-semibold transition-all flex items-center gap-2.5 text-xs uppercase tracking-wider ${
                currentTab === 'midwives' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users size={16} />
              <span>Midwife Management</span>
            </button>
            <button 
              onClick={() => {
                setCurrentTab('children');
                fetchChildren();
              }}
              className={`w-full text-left p-3.5 rounded-xl font-semibold transition-all flex items-center gap-2.5 text-xs uppercase tracking-wider ${
                currentTab === 'children' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <User size={16} />
              <span>Child Records</span>
            </button>
            <button 
              onClick={() => {
                setCurrentTab('schedules');
                fetchSchedules();
              }}
              className={`w-full text-left p-3.5 rounded-xl font-semibold transition-all flex items-center gap-2.5 text-xs uppercase tracking-wider ${
                currentTab === 'schedules' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Calendar size={16} />
              <span>Clinic Schedules</span>
            </button>
            <button 
              onClick={() => {
                setCurrentTab('parents');
                fetchParents();
              }}
              className={`w-full text-left p-3.5 rounded-xl font-semibold transition-all flex items-center gap-2.5 text-xs uppercase tracking-wider ${
                currentTab === 'parents' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users size={16} />
              <span>Registered Parents</span>
            </button>
          </nav>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full text-left p-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all border border-red-950/40 flex items-center gap-2 text-xs uppercase font-bold tracking-wider"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Area */}
      <main className="flex-grow p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </span>
            <input 
              type="text" 
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs" 
              placeholder={
                currentTab === 'children' 
                  ? "Search children by name, ID, clinic center, mother..." 
                  : currentTab === 'parents'
                  ? "Search parents by name, email, phone..."
                  : "Search staff by name, NIC, or assigned clinic..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleGenerateReport}
            className="bg-[#00b96b] hover:bg-[#00a862] text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 text-xs"
          >
            <Download size={14} />
            <span>Generate Monthly Report</span>
          </button>
        </header>

        {/* Title details */}
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight capitalize">
            {currentTab === 'overview' ? 'Dashboard Overview' : `${currentTab} Management`}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Monitor and manage your child healthcare clinic personnel</p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard title="Registered Children" value={childrenList.length} change={`+${childrenList.length} total`} color="bg-blue-500" onClick={() => setCurrentTab('children')} />
          <StatCard title="Active Doctors" value={doctorCount} change={`+${doctorCount} total`} color="bg-emerald-500" onClick={() => setCurrentTab('doctors')} />
          <StatCard title="Midwives" value={midwifeCount} change={`+${midwifeCount} total`} color="bg-purple-500" onClick={() => setCurrentTab('midwives')} />
          <StatCard title="Vaccinations" value={totalCompletedVaccinations} change={`+${totalCompletedVaccinations} total`} color="bg-amber-500" onClick={() => setCurrentTab('overview')} />
        </div>

        {/* Dynamic Views */}
        {currentTab === 'children' ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Master Children Health Registry</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Showing records filtered by clinic center</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Filter Clinic:</span>
                <select
                  value={selectedClinicFilter}
                  onChange={(e) => setSelectedClinicFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">All Clinics ({childrenList.length})</option>
                  {ASSIGNED_CLINICS.map(clinic => {
                    const count = childrenList.filter(c => c.assignedClinicCenter === clinic).length;
                    return (
                      <option key={clinic} value={clinic}>
                        {clinic} ({count})
                      </option>
                    );
                  })}
                </select>
                {user?.assignedClinic && user.assignedClinic !== 'N/A' && (
                  <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-[9px] font-bold">
                    📍 Assigned: {user.assignedClinic}
                  </span>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-100 font-bold text-[10px]">
                    <th className="pb-3">Child Name & Digital ID</th>
                    <th className="pb-3">DOB & Gender</th>
                    <th className="pb-3">Mother Name</th>
                    <th className="pb-3">Assigned Clinic Center</th>
                    <th className="pb-3">Birth Weight & Height</th>
                    <th className="pb-3">Status / Risk Level</th>
                    <th className="pb-3 text-right">MOH Health File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingChildren ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">Loading children directory...</td>
                    </tr>
                  ) : filteredChildren.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 font-medium italic">No children records registered.</td>
                    </tr>
                  ) : (
                    filteredChildren.map((child) => {
                      const hasAlert = child.doctorAssessments?.length > 0 || child.riskIndicators?.lowBirthWeight;
                      return (
                        <tr key={child._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 font-bold text-slate-800">
                            <div>{child.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{child.digitalHealthId}</div>
                          </td>
                          <td className="py-4 text-slate-600 font-medium">
                            <div>{new Date(child.dob).toLocaleDateString()}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{child.gender}</div>
                          </td>
                          <td className="py-4 text-slate-600 font-semibold">{child.motherName || 'N/A'}</td>
                          <td className="py-4 text-slate-600">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700">
                              🏠 {child.assignedClinicCenter || 'MOH Center'}
                            </span>
                          </td>
                          <td className="py-4 text-slate-500">
                            <div>{child.birthWeight} kg</div>
                            <div className="text-[10px] text-slate-400">{child.birthHeight} cm</div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                              hasAlert 
                                ? 'bg-amber-50 text-amber-600 border-amber-100' 
                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                              {hasAlert ? 'Special Care' : 'Healthy'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedChildReport(child);
                                setActiveReportTab('growth');
                              }}
                              className="bg-[#1D61FF] hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm"
                            >
                              View Health File
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : currentTab === 'parents' ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 mb-5">Registered Parents Directory</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-100 font-bold text-[10px]">
                    <th className="pb-3">Parent Name</th>
                    <th className="pb-3">Contact Email</th>
                    <th className="pb-3">Phone Number</th>
                    <th className="pb-3">Linked Children IDs</th>
                    <th className="pb-3">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingParents ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">Loading parents directory...</td>
                    </tr>
                  ) : filteredParents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 font-medium italic">No parents found.</td>
                    </tr>
                  ) : (
                    filteredParents.map((parent) => (
                      <tr key={parent._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 font-bold text-slate-800">
                          {parent.name}
                        </td>
                        <td className="py-4 text-slate-600 font-medium">
                          {parent.email || 'N/A'}
                        </td>
                        <td className="py-4 text-slate-600 font-medium">
                          {parent.phone || 'N/A'}
                        </td>
                        <td className="py-4 text-slate-600">
                          {parent.children && parent.children.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {parent.children.map((childId, idx) => (
                                <span key={idx} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                                  {childId}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No linked children</span>
                          )}
                        </td>
                        <td className="py-4 text-slate-500">
                          {parent.createdAt ? new Date(parent.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : currentTab === 'schedules' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Left Side: Schedules Timeline (65%) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-slate-800">Scheduled Clinic Sessions</h3>
                <button 
                  onClick={fetchSchedules}
                  className="text-xs font-bold text-[#1D61FF] hover:underline"
                >
                  Refresh Timeline
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-100 font-bold text-[10px]">
                      <th className="pb-3">Clinic Center</th>
                      <th className="pb-3">Session Type</th>
                      <th className="pb-3">Date & Time</th>
                      <th className="pb-3">Assigned Staff</th>
                      <th className="pb-3">Capacity</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingSchedules ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400">Loading schedules...</td>
                      </tr>
                    ) : schedulesList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400 font-medium italic">No active clinic sessions scheduled.</td>
                      </tr>
                    ) : (
                      schedulesList.map((sched) => (
                        <tr key={sched._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 font-bold text-slate-800">
                            📍 {sched.clinicCenter}
                          </td>
                          <td className="py-4">
                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                              {sched.sessionType}
                            </span>
                          </td>
                          <td className="py-4 text-slate-600 font-medium">
                            {new Date(sched.date).toLocaleString([], {
                              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td className="py-4 text-slate-700 font-semibold">
                            👤 {sched.assignedStaff}
                          </td>
                          <td className="py-4 text-slate-500 font-mono">
                            {sched.expectedCapacity || 30} Kids
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                              sched.status === 'Completed'
                                ? 'bg-slate-100 text-slate-500 border-slate-200'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                              {sched.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button 
                              onClick={() => handleDeleteSchedule(sched._id)}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                              title="Cancel clinic session"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Side: Create Schedule Form (35%) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <h3 className="text-sm font-bold text-slate-800 mb-5">Create Clinic Session</h3>
              <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Clinic Center Destination</label>
                  <select
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    value={schedClinicCenter}
                    onChange={(e) => setSchedClinicCenter(e.target.value)}
                  >
                    {ASSIGNED_CLINICS.map(clinic => (
                      <option key={clinic} value={clinic}>{clinic}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Session Classification</label>
                  <select
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={schedSessionType}
                    onChange={(e) => setSchedSessionType(e.target.value)}
                  >
                    <option value="Immunization Clinic">Immunization Clinic</option>
                    <option value="Growth Monitoring Clinic">Growth Monitoring Clinic</option>
                    <option value="Doctor Consultations">Doctor Consultations</option>
                    <option value="Nutrition Audit & Packets Issue">Nutrition Audit & Packets Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Date & Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Assigned Medical Personnel</label>
                  <select
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={schedStaff}
                    onChange={(e) => setSchedStaff(e.target.value)}
                  >
                    <option value="">-- Choose Assigned Staff --</option>
                    {staffData.map((s) => (
                      <option key={s._id} value={`${s.name} (${s.role})`}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Expected Daily Attendance Limit</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={schedCapacity}
                    onChange={(e) => setSchedCapacity(parseInt(e.target.value))}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Schedule Clinic Session</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table Container */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <h3 className="text-sm font-bold text-slate-800 mb-5">
                {currentTab === 'overview' ? 'Recently Joined Staff' : `All Registered ${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}`}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-100 font-bold text-[10px]">
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">NIC & SLMC No</th>
                      <th className="pb-3">Contact Phone</th>
                      <th className="pb-3">Assigned Clinic</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStaff.length > 0 ? (
                      filteredStaff.map((staff) => (
                        <tr key={staff._id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 font-bold text-slate-800">
                            <div>{staff.name}</div>
                            {staff.gender && staff.age && (
                              <span className="text-[10px] text-slate-400 font-normal">{staff.gender}, {staff.age} yrs</span>
                            )}
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              staff.role?.toLowerCase() === 'doctor' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                            }`}>
                              {staff.role}
                            </span>
                          </td>
                          <td className="py-4 text-[10px] text-slate-500">
                            <div><span className="font-bold">NIC:</span> {staff.nicNo || 'N/A'}</div>
                            {staff.role?.toLowerCase() === 'doctor' && (
                              <div><span className="font-bold">SLMC:</span> {staff.slmcRegNo || 'N/A'}</div>
                            )}
                          </td>
                          <td className="py-4 text-slate-600 font-medium">{staff.phone || 'N/A'}</td>
                          <td className="py-4 text-slate-600 font-semibold">{staff.assignedClinic || 'N/A'}</td>
                          <td className="py-4">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-extrabold uppercase border border-emerald-100">Active</span>
                          </td>
                          <td className="py-4 text-right">
                            <button 
                              onClick={() => handleDeleteStaff(staff._id, staff.name)}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete staff record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400 font-medium italic">No staff entries matched the selection.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart Container */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">Monthly Vaccination Progress</h3>
                <p className="text-slate-400 text-[11px] mb-6 font-medium">Vaccinations administered (Last 6 months)</p>
              </div>
              <div className="h-60 mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}} 
                      contentStyle={{borderRadius: '12px', border: 'none', fontSize: '11px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Child Health Report Modal overlay */}
      {selectedChildReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-xs">
            {/* Modal Header */}
            <div className="bg-[#0F172A] text-white p-5 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1D61FF]">MOH Official Child Health File</span>
                <h3 className="text-base font-bold mt-1">{selectedChildReport.name}</h3>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  ID: {selectedChildReport.digitalHealthId} • Gender: {selectedChildReport.gender} • DOB: {new Date(selectedChildReport.dob).toLocaleDateString()}
                </div>
              </div>
              <button 
                onClick={() => setSelectedChildReport(null)}
                className="text-slate-400 hover:text-white font-bold text-sm bg-white/10 px-2 py-0.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Vitals Summary Banner */}
            <div className="bg-slate-50 border-b border-slate-100 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Birth Weight</span>
                <strong className="text-slate-700 text-xs mt-0.5 block">{selectedChildReport.birthWeight} kg</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Birth Height</span>
                <strong className="text-slate-700 text-xs mt-0.5 block">{selectedChildReport.birthHeight} cm</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Assigned Clinic Center</span>
                <strong className="text-[#1D61FF] text-xs mt-0.5 block">{selectedChildReport.assignedClinicCenter || 'MOH Center'}</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Blood Group</span>
                <strong className="text-slate-700 text-xs mt-0.5 block">{selectedChildReport.bloodGroup || 'Unknown'}</strong>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-slate-100 bg-white">
              {['growth', 'vaccines', 'assessments', 'nutrition'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveReportTab(tab)}
                  className={`flex-1 py-3 text-center font-bold border-b-2 text-[10px] uppercase tracking-wider transition-all ${
                    activeReportTab === tab 
                      ? 'border-[#1D61FF] text-[#1D61FF]' 
                      : 'border-transparent text-slate-400 hover:text-slate-800'
                  }`}
                >
                  {tab === 'growth' && 'Growth History'}
                  {tab === 'vaccines' && 'Immunization Card'}
                  {tab === 'assessments' && 'Pediatric Assessments'}
                  {tab === 'nutrition' && 'Supplement History'}
                </button>
              ))}
            </div>

            {/* Modal Body Scroll Container */}
            <div className="p-6 overflow-y-auto flex-grow max-h-[50vh] space-y-4">
              
              {/* Tab 1: Growth History */}
              {activeReportTab === 'growth' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Measurements Ledger</h4>
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold text-[9px]">
                          <th className="p-3">Age Interval</th>
                          <th className="p-3">Weight (kg)</th>
                          <th className="p-3">Height (cm)</th>
                          <th className="p-3">BMI Value</th>
                          <th className="p-3">Recorded Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedChildReport.growthRecords?.length > 0 ? (
                          selectedChildReport.growthRecords.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="p-3 font-semibold text-slate-700">{r.ageInterval}</td>
                              <td className="p-3 font-bold text-[#1D61FF]">{r.weight} kg</td>
                              <td className="p-3 text-slate-600">{r.height} cm</td>
                              <td className="p-3 text-slate-600">{r.bmi}</td>
                              <td className="p-3 text-slate-400">{new Date(r.date).toLocaleDateString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="p-4 text-center text-slate-400 italic">No measurement logs registered.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Immunization Card */}
              {activeReportTab === 'vaccines' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Vaccination Card</h4>
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold text-[9px]">
                          <th className="p-3">Vaccine Name</th>
                          <th className="p-3">Scheduled Date</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedChildReport.vaccinations?.length > 0 ? (
                          selectedChildReport.vaccinations.map((v, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="p-3 font-semibold text-slate-700">{v.name}</td>
                              <td className="p-3 text-slate-500">{v.date}</td>
                              <td className="p-3 text-right">
                                <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  v.status === 'Completed' 
                                    ? 'bg-green-50 text-green-600 border border-green-100' 
                                    : v.status === 'Due' 
                                      ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                                      : 'bg-slate-50 text-slate-400'
                                }`}>
                                  {v.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="p-4 text-center text-slate-400 italic">No immunizations recorded.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Pediatric Assessments & Observations */}
              {activeReportTab === 'assessments' && (
                <div className="space-y-4">
                  {/* Midwife Field Notes */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <strong className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Clinic Midwife Observations:</strong>
                    <p className="italic text-slate-600 font-medium">"{selectedChildReport.observations || 'Normal developmental progress. Continuing nutritional schedules.'}"</p>
                  </div>

                  {/* Doctor Reviews */}
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mt-4">Pediatrician Consultations</h4>
                  <div className="space-y-3">
                    {selectedChildReport.doctorAssessments?.length > 0 ? (
                      selectedChildReport.doctorAssessments.map((a, i) => (
                        <div key={i} className="bg-blue-50/30 border border-blue-100 rounded-xl p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="bg-[#1D61FF]/10 text-[#1D61FF] px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                              Consultation Logged
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{new Date(a.date).toLocaleDateString()}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                            <div>
                              <strong className="text-[9px] uppercase tracking-wider text-slate-400 block">Diagnosis</strong>
                              <p className="font-bold text-slate-700 mt-0.5">{a.diagnosis}</p>
                            </div>
                            <div>
                              <strong className="text-[9px] uppercase tracking-wider text-slate-400 block">Treatment</strong>
                              <p className="font-semibold text-slate-600 mt-0.5">{a.treatment}</p>
                            </div>
                            <div>
                              <strong className="text-[9px] uppercase tracking-wider text-slate-400 block">Specialist Referral</strong>
                              <p className="font-bold text-[#1D61FF] mt-0.5">📍 {a.specialistReferral || 'None'}</p>
                            </div>
                          </div>
                          {a.remarks && (
                            <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                              "Note: {a.remarks}"
                            </div>
                          )}
                          <div className="text-[9px] text-slate-400 pt-1 font-semibold">
                            BY: {a.doctorName || 'Dr. Nimal Silva'} (Pediatric Specialist)
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl italic">
                        No doctor reviews or tertiary referrals filed yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Thriposha Supplement Distribution */}
              {activeReportTab === 'nutrition' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Thriposha Packages Logs</h4>
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold text-[9px]">
                          <th className="p-3">Packets Issued</th>
                          <th className="p-3">Batch Number</th>
                          <th className="p-3">Date Disbursed</th>
                          <th className="p-3 text-right">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedChildReport.thriposhaHistory?.length > 0 ? (
                          selectedChildReport.thriposhaHistory.map((t, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="p-3 font-extrabold text-slate-700">{t.packetsIssued || 2} Packets</td>
                              <td className="p-3 text-slate-600 font-mono">{t.batchNo || 'MOH-TH-982'}</td>
                              <td className="p-3 text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                              <td className="p-3 text-right text-slate-500 font-medium">{t.remarks || 'Standard allowance issued'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="p-4 text-center text-slate-400 italic">No thriposha supplements disbursed.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedChildReport(null)}
                className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md"
              >
                Close File
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-10 right-10 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all hover:rotate-90"
        title="Register new staff member"
      >
        <Plus size={20} />
      </button>

      <AddStaffModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        refreshData={fetchStaff} 
      />
    </div>
  );
};

// Stats Card Component
const StatCard = ({ title, value, change, color, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
  >
    <div className={`w-8 h-1 rounded-full ${color} mb-4`}></div>
    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider leading-none">{title}</p>
    <h2 className="text-2xl font-black text-slate-800 my-2.5 tracking-tight">{value}</h2>
    <p className="text-emerald-500 text-[10px] font-bold flex items-center gap-0.5">
      ↑ {change} <span className="text-slate-400 font-medium">overall</span>
    </p>
  </div>
);

export default Dashboard;