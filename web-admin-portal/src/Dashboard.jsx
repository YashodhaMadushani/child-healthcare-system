import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AddStaffModal from './AddStaffModal';

const chartData = [
  { name: 'Jan', count: 250 },
  { name: 'Feb', count: 320 },
  { name: 'Mar', count: 280 },
  { name: 'Apr', count: 390 },
  { name: 'May', count: 410 },
  { name: 'Jun', count: 428 },
];

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffData, setStaffData] = useState([]);

  const fetchStaff = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/staff'); 
      setStaffData(res.data);
    } catch (err) {
      console.error("Data fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar */}
      <div className="w-72 bg-[#001529] text-white p-6 flex flex-col shadow-2xl sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <span className="text-2xl text-white">🤍</span>
          <h2 className="text-xl font-bold tracking-tight">Healthcare Admin</h2>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button className="w-full text-left p-4 rounded-xl bg-blue-600 font-semibold shadow-lg shadow-blue-900/40 transition-all">Dashboard Overview</button>
          <button className="w-full text-left p-4 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">Doctor Management</button>
          <button className="w-full text-left p-4 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">Midwife Management</button>
          <button className="w-full text-left p-4 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">Child Records</button>
          <button className="w-full text-left p-4 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">Clinic Schedules</button>
        </nav>

        <button 
          onClick={handleLogout}
          className="w-full text-left p-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-all border border-red-900/20 mt-auto flex items-center gap-2"
        >
          Logout
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 p-10 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="relative w-96">
            <input 
              type="text" 
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              placeholder="Search patients, staff, records..." 
            />
          </div>
          <button className="bg-[#00b96b] hover:bg-[#00a862] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2">
            📄 Generate Monthly Report
          </button>
        </header>

        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-slate-800">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1 font-medium">Monitor and manage your child healthcare system</p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Registered Children" value="1,248" change="+12%" color="bg-blue-500" />
          <StatCard title="Active Doctors" value={staffData.filter(s => s.role.toLowerCase() === 'doctor').length || 45} change="+3 new" color="bg-emerald-500" />
          <StatCard title="Midwives" value={staffData.filter(s => s.role.toLowerCase() === 'midwife').length || 32} change="+2 new" color="bg-purple-500" />
          <StatCard title="Vaccinations" value="428" change="+6.7%" color="bg-amber-500" />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Table Container */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Recently Joined Staff</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-sm uppercase tracking-wider border-b border-slate-50">
                    <th className="pb-4 font-semibold">Name</th>
                    <th className="pb-4 font-semibold">Role</th>
                    <th className="pb-4 font-semibold">Assigned Clinic</th>
                    <th className="pb-4 font-semibold">Status</th>
                    <th className="pb-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {staffData.length > 0 ? (
                    staffData.map((staff, index) => (
                      <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 font-bold text-slate-700">{staff.name}</td>
                        <td className="py-5 text-slate-500 font-medium">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                            staff.role.toLowerCase() === 'doctor' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                          }`}>
                            {staff.role}
                          </span>
                        </td>
                        <td className="py-5 text-slate-500">{staff.clinic || 'N/A'}</td>
                        <td className="py-5">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">Active</span>
                        </td>
                        <td className="py-5 text-center">
                          <button className="text-blue-500 font-bold hover:underline">Edit</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-10 text-center text-slate-400 font-medium italic">No staff data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Container */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Monthly Vaccination Progress</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">Vaccinations administered (Last 6 months)</p>
            <div className="h-64 mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-10 right-10 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-500/50 hover:bg-blue-700 transition-all flex items-center justify-center text-3xl font-light hover:rotate-90"
      >
        +
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
const StatCard = ({ title, value, change, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className={`w-10 h-1 rounded-full ${color} mb-5`}></div>
    <p className="text-slate-400 text-[11px] uppercase font-black tracking-widest leading-none">{title}</p>
    <h2 className="text-3xl font-black text-slate-800 my-3 tracking-tight">{value}</h2>
    <p className="text-emerald-500 text-xs font-bold flex items-center gap-1">
      ↑ {change} <span className="text-slate-300 font-medium">from last month</span>
    </p>
  </div>
);

export default Dashboard;