import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import {
    User,
    Calendar,
    Activity,
    Search,
    Bell,
    ShieldAlert,
    CheckCircle2,
    MapPin,
    Mail,
    Phone,
    Settings as SettingsIcon,
    ClipboardList,
    TrendingUp,
    PlusCircle,
    Smartphone,
    Info,
    QrCode
} from 'lucide-react';
import ChildRegistrationModal from './ChildRegistrationModal';
import ClinicVisitModal from './ClinicVisitModal';
import './Dashboard.css';

const MidwifeDashboard = () => {
    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState({ total: 0, vaccinations: 8, alerts: 2, clinics: 2 });

    // Page view state
    const [activeTab, setActiveTab] = useState('Overview'); // Overview, Records, Growth, Vaccines, Settings

    // Search queries
    const [searchQuery, setSearchQuery] = useState('');

    // Settings / User Profile States (dynamically read logged-in user from localStorage)
    const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem('user')) || {}; } catch (e) { return {}; }
    })();

    const [midwifeName, setMidwifeName] = useState(storedUser.name || 'Nurse Midwife');
    const [midwifeArea, setMidwifeArea] = useState(storedUser.assignedClinic || 'Colombo 05');
    const [midwifeEmail, setMidwifeEmail] = useState(storedUser.email || 'midwife@clinic.com');
    const [midwifePhone, setMidwifePhone] = useState(storedUser.phone || '0771234567');
    const [prefNotifications, setPrefNotifications] = useState(true);
    const [prefAutoSync, setPrefAutoSync] = useState(true);

    // states for QR code
    const [selectedChild, setSelectedChild] = useState(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isScanQRModalOpen, setIsScanQRModalOpen] = useState(false);
    const [manualHealthId, setManualHealthId] = useState('');
    const [isClinicVisitModalOpen, setIsClinicVisitModalOpen] = useState(false);
    const [clinicVisitChild, setClinicVisitChild] = useState(null);
    const cardRef = useRef();

    // fetch children from database
    const fetchChildren = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/children');
            setChildren(res.data);

            // Calculate dynamic stats
            const total = res.data.length;
            // Simulated alerts and vaccinations count
            setStats(prev => ({
                ...prev,
                total,
                alerts: total > 2 ? 3 : 1,
                vaccinations: total > 3 ? 12 : 5
            }));
        } catch (err) {
            console.error("Error fetching children:", err);
        }
    };

    useEffect(() => {
        fetchChildren();
    }, []);

    // QR Scanner Effect
    useEffect(() => {
        if (!isScanQRModalOpen) return;

        let html5QrCode = new Html5Qrcode("qr-reader");
        let isStopped = false;

        const startScanning = async () => {
            try {
                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 220, height: 220 }
                    },
                    (decodedText) => {
                        if (isStopped) return;

                        const healthId = decodedText.trim();
                        const target = children.find(c => c.digitalHealthId && c.digitalHealthId.toLowerCase() === healthId.toLowerCase());

                        if (target) {
                            isStopped = true;
                            html5QrCode.stop().then(() => {
                                html5QrCode.clear();
                                setClinicVisitChild(target);
                                setIsScanQRModalOpen(false);
                                setIsClinicVisitModalOpen(true);
                            }).catch(err => console.error("Failed to stop scanner after match:", err));
                        } else {
                            console.log(`Scanned unknown ID: ${healthId}`);
                        }
                    },
                    (errorMessage) => {
                        // Ignore standard scanning errors
                    }
                );
            } catch (err) {
                console.error("Unable to start QR scanner:", err);
            }
        };

        const timer = setTimeout(() => {
            startScanning();
        }, 150);

        return () => {
            clearTimeout(timer);
            isStopped = true;
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                }).catch(err => console.error("Failed to stop scanner on cleanup:", err));
            }
        };
    }, [isScanQRModalOpen, children]);

    // Print QR
    const handlePrintQR = () => {
        const printContent = cardRef.current.innerHTML;
        const originalContent = document.body.innerHTML;

        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    const handleSendSmsAlert = (childName, vaccineName) => {
        alert(`SMS Alert successfully dispatched to the mother of ${childName} for due vaccine: ${vaccineName}.`);
    };

    // Filter children list based on global search
    const filteredChildren = children.filter(child => {
        const name = child.name || child.childName || '';
        const id = child.digitalHealthId || '';
        const mother = child.motherName || '';
        return (
            name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mother.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <span className="heart-icon">🤍</span>
                    <div className="logo-text">
                        <h3>Healthcare</h3>
                        <p>Midwife Portal</p>
                    </div>
                </div>
                <ul className="nav-menu">
                    <li className={activeTab === 'Overview' ? 'active' : ''} onClick={() => setActiveTab('Overview')}>
                        Dashboard Overview
                    </li>
                    <li onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
                        Register New Child
                    </li>
                    <li className={activeTab === 'Records' ? 'active' : ''} onClick={() => setActiveTab('Records')}>
                        Child Records
                    </li>
                    <li className={activeTab === 'Growth' ? 'active' : ''} onClick={() => setActiveTab('Growth')}>
                        Growth Tracking
                    </li>
                    <li className={activeTab === 'Vaccines' ? 'active' : ''} onClick={() => setActiveTab('Vaccines')}>
                        Vaccination Alerts
                    </li>
                    <li className={activeTab === 'Settings' ? 'active' : ''} onClick={() => setActiveTab('Settings')}>
                        Settings
                    </li>
                </ul>
                <div className="logout-section">
                    <button onClick={handleLogout} className="logout-link">Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <header className="header">
                    <div className="search-container relative flex items-center">
                        <span className="absolute left-3 text-slate-400">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search Child Name, Health ID, or Mother..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '38px', width: '380px' }}
                        />
                    </div>
                    <div className="header-right">
                        <span className="bell relative cursor-pointer">
                            🔔
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                        </span>
                        <div className="user-profile">
                            <div className="avatar">
                                {midwifeName ? midwifeName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'MW'}
                            </div>
                            <div className="user-details">
                                <strong>{midwifeName}</strong>
                                <span>Area: {midwifeArea}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 1. DASHBOARD OVERVIEW VIEW */}
                {activeTab === 'Overview' && (
                    <>
                        {/* Stats Cards */}
                        <div className="stats-row">
                            <div className="stat-box" onClick={() => setActiveTab('Records')} style={{ cursor: 'pointer' }}>
                                <div className="icon-circle blue">👥</div>
                                <h2>{stats.total}</h2>
                                <p>Total Children Registered</p>
                            </div>
                            <div className="stat-box" onClick={() => setActiveTab('Vaccines')} style={{ cursor: 'pointer' }}>
                                <div className="icon-circle purple">💉</div>
                                <h2>{stats.vaccinations}</h2>
                                <p>Vaccination Alerts Due</p>
                            </div>
                            <div className="stat-box" onClick={() => setActiveTab('Growth')} style={{ cursor: 'pointer' }}>
                                <div className="icon-circle orange">⚠️</div>
                                <h2>{stats.alerts}</h2>
                                <p>Growth Retardation Alerts</p>
                            </div>
                            <div className="stat-box" style={{ cursor: 'default' }}>
                                <div className="icon-circle green">📅</div>
                                <h2>{stats.clinics}</h2>
                                <p>MOH Clinics Scheduled</p>
                            </div>
                        </div>

                        {/* Blue Registration Banner */}
                        <div className="registration-banner">
                            <div className="banner-info">
                                <h2>Child Registration Center</h2>
                                <p>Register new infants or quickly access clinical health profile ledgers via QR code</p>
                            </div>
                            <div className="banner-btns flex items-center gap-3">
                                <button className="btn-start flex items-center gap-2" onClick={() => setIsScanQRModalOpen(true)}>
                                    <QrCode size={18} />
                                    <span>📷 Scan QR Code</span>
                                </button>
                                <button className="btn-start" onClick={() => setIsModalOpen(true)}>+ Start New Registration</button>
                            </div>
                        </div>

                        {/* Recently Registered Table */}
                        <div className="table-container">
                            <div className="flex justify-between items-center mb-4">
                                <h3>Recently Registered Children</h3>
                                <button onClick={() => setActiveTab('Records')} className="text-[#1D61FF] font-bold text-xs hover:underline flex items-center gap-1">
                                    <span>View All Records</span>
                                    <span>→</span>
                                </button>
                            </div>
                            <table className="child-table">
                                <thead>
                                    <tr>
                                        <th>CHILD NAME & DIGITAL ID</th>
                                        <th>DATE OF BIRTH</th>
                                        <th>MOTHER/GUARDIAN</th>
                                        <th>PHONE NUMBER</th>
                                        <th>QR CARD</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredChildren.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                                No registered children found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredChildren.slice(0, 5).map(child => (
                                            <tr key={child._id}>
                                                <td>
                                                    <div className="child-name-cell">
                                                        <strong style={{ color: '#1a1a1a', display: 'block' }}>
                                                            {child.name || child.childName}
                                                        </strong>
                                                        <span className="digital-id-sub" style={{ display: 'block', fontSize: '0.85em', color: '#1D61FF', marginTop: '3px', fontWeight: '600', fontFamily: 'monospace' }}>
                                                            {child.digitalHealthId}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>{child.dob ? new Date(child.dob).toLocaleDateString() : "N/A"}</td>
                                                <td>{child.motherName || "N/A"}</td>
                                                <td>{child.phone || "N/A"}</td>
                                                <td>
                                                    <div
                                                        className="qr-code-thumbnail"
                                                        onClick={() => { setSelectedChild(child); setIsQRModalOpen(true); }}
                                                        style={{ cursor: 'pointer', padding: '4px', background: '#fff', display: 'inline-block', borderRadius: '4px', border: '1px solid #ddd' }}
                                                        title="Click to View & Print QR Card"
                                                    >
                                                        {child.digitalHealthId && (
                                                            <QRCodeSVG value={child.digitalHealthId} size={35} />
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <button
                                                        onClick={() => { setClinicVisitChild(child); setIsClinicVisitModalOpen(true); }}
                                                        style={{ background: '#1D61FF', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                                                    >
                                                        Record Visit
                                                    </button>
                                                    <button
                                                        className="btn-view text-lg hover:opacity-85 transition-opacity"
                                                        onClick={() => navigate(`/child-profile/${child._id}`)}
                                                        title="View Full Health Record"
                                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', border: '1px solid #CBD5E1', borderRadius: '6px', background: '#fff' }}
                                                    >
                                                        👁️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* 2. CHILD RECORDS VIEW */}
                {activeTab === 'Records' && (
                    <div className="table-container">
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                            <div>
                                <h3 className="text-lg font-bold text-[#0F172A]">All Child Records</h3>
                                <p className="text-xs text-slate-500">Search and manage clinical records of infants registered in MOH {midwifeArea}</p>
                            </div>
                            <button className="bg-[#1D61FF] text-white text-xs font-bold px-4 py-2.5 rounded-xl" onClick={() => setIsModalOpen(true)}>
                                + Register Child
                            </button>
                        </div>

                        <table className="child-table">
                            <thead>
                                <tr>
                                    <th>Child Name & Digital ID</th>
                                    <th>DOB / Age</th>
                                    <th>Mother Name</th>
                                    <th>Contact</th>
                                    <th>Registered By</th>
                                    <th>QR Card</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredChildren.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                            No children matching the search criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredChildren.map(child => (
                                        <tr key={child._id}>
                                            <td>
                                                <div className="child-name-cell">
                                                    <strong className="text-slate-800">{child.name}</strong>
                                                    <span className="text-xs text-[#1D61FF] font-semibold font-mono block mt-0.5">{child.digitalHealthId}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div>{new Date(child.dob).toLocaleDateString()}</div>
                                                <span className="text-[10px] text-slate-400">18 Months</span>
                                            </td>
                                            <td>{child.motherName}</td>
                                            <td>{child.phone}</td>
                                            <td className="text-xs text-slate-500 font-medium">{child.registeredBy || 'MOH Midwife'}</td>
                                            <td>
                                                <div
                                                    className="qr-code-thumbnail cursor-pointer p-1 bg-white border border-slate-200 inline-block rounded"
                                                    onClick={() => { setSelectedChild(child); setIsQRModalOpen(true); }}
                                                >
                                                    <QRCodeSVG value={child.digitalHealthId} size={30} />
                                                </div>
                                            </td>
                                            <td className="flex gap-2">
                                                <button
                                                    onClick={() => { setClinicVisitChild(child); setIsClinicVisitModalOpen(true); }}
                                                    className="bg-[#1D61FF] text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                                                >
                                                    Record Visit
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/child-profile/${child._id}`)}
                                                    className="bg-slate-100 hover:bg-[#1D61FF]/10 text-[#1D61FF] text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    View Profile
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 3. GROWTH TRACKING VIEW */}
                {activeTab === 'Growth' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 shadow-sm">
                                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Severely Underweight</span>
                                <h3 className="text-3xl font-extrabold text-red-800 mt-1">1</h3>
                                <span className="text-[10px] text-red-600 block mt-1">Critical Grade III Drop alert</span>
                            </div>
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 shadow-sm">
                                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Moderate Underweight</span>
                                <h3 className="text-3xl font-extrabold text-orange-800 mt-1">2</h3>
                                <span className="text-[10px] text-orange-600 block mt-1">Grade II monitoring triggers</span>
                            </div>
                            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 shadow-sm">
                                <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Healthy Status</span>
                                <h3 className="text-3xl font-extrabold text-green-800 mt-1">{Math.max(0, children.length - 3)}</h3>
                                <span className="text-[10px] text-green-600 block mt-1">Active growth progress</span>
                            </div>
                        </div>

                        {/* Growth Retardation Alerts Table */}
                        <div className="table-container">
                            <div className="mb-4">
                                <h3 className="text-base font-bold text-[#0F172A]">Active Growth Retardation & Wasting Alerts</h3>
                                <p className="text-xs text-slate-500">Infants showing deceleration in growth velocity compared to WHO standard percentiles</p>
                            </div>

                            <table className="child-table text-xs">
                                <thead>
                                    <tr>
                                        <th>Child Name</th>
                                        <th>Digital ID</th>
                                        <th>Current Age</th>
                                        <th>Alert Status</th>
                                        <th>Weight Drop Velocity</th>
                                        <th>Assigned Midwife</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {children.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-6 text-slate-400">No registered children.</td>
                                        </tr>
                                    ) : (
                                        <>
                                            <tr>
                                                <td className="font-bold text-slate-800">Senuri Perera</td>
                                                <td className="font-mono text-slate-500">SL-2024-1-30066</td>
                                                <td>18 Months</td>
                                                <td>
                                                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold text-[10px]">Critical</span>
                                                </td>
                                                <td className="text-red-600 font-semibold">8.5kg → 8.2kg (-0.3kg)</td>
                                                <td>Priyanthi (PHM)</td>
                                                <td>
                                                    <button
                                                        onClick={() => navigate(`/child-profile/${children[0]?._id || ''}`)}
                                                        className="text-xs bg-[#1D61FF]/10 text-[#1D61FF] font-bold px-2.5 py-1 rounded"
                                                    >
                                                        Review Growth
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-bold text-slate-800">Dilshan Silva</td>
                                                <td className="font-mono text-slate-500">SL-2025-2-45210</td>
                                                <td>12 Months</td>
                                                <td>
                                                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold text-[10px]">Critical</span>
                                                </td>
                                                <td className="text-red-600 font-semibold">9.1kg → 8.6kg (-0.5kg)</td>
                                                <td>Priyanthi (PHM)</td>
                                                <td>
                                                    <button
                                                        onClick={() => navigate(`/child-profile/${children[1]?._id || ''}`)}
                                                        className="text-xs bg-[#1D61FF]/10 text-[#1D61FF] font-bold px-2.5 py-1 rounded"
                                                    >
                                                        Review Growth
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-bold text-slate-800">Arshad Rahaman</td>
                                                <td className="font-mono text-slate-500">SL-2025-1-10293</td>
                                                <td>9 Months</td>
                                                <td>
                                                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold text-[10px]">High Alert</span>
                                                </td>
                                                <td className="text-amber-600 font-semibold">7.9kg → 7.4kg (-0.5kg)</td>
                                                <td>Fathima (PHM)</td>
                                                <td>
                                                    <button
                                                        onClick={() => navigate(`/child-profile/${children[2]?._id || ''}`)}
                                                        className="text-xs bg-[#1D61FF]/10 text-[#1D61FF] font-bold px-2.5 py-1 rounded"
                                                    >
                                                        Review Growth
                                                    </button>
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 4. VACCINATION ALERTS VIEW */}
                {activeTab === 'Vaccines' && (
                    <div className="table-container">
                        <div className="mb-4">
                            <h3 className="text-base font-bold text-[#0F172A]">Vaccination Defaulters & Alerts</h3>
                            <p className="text-xs text-slate-500">Send reminder SMS notifications to mothers for pending vaccines in the EPI national schedule</p>
                        </div>

                        <table className="child-table text-xs">
                            <thead>
                                <tr>
                                    <th>Child Name</th>
                                    <th>Digital ID</th>
                                    <th>Due Vaccine</th>
                                    <th>Due Date</th>
                                    <th>Mother Name</th>
                                    <th>Phone / Contact</th>
                                    <th>SMS Status</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-bold text-slate-800">Senuri Perera</td>
                                    <td className="font-mono text-slate-500">SL-2024-1-30066</td>
                                    <td><span className="bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded font-medium">DPT Booster (18M)</span></td>
                                    <td className="text-red-600 font-semibold">2026-07-25</td>
                                    <td>Anoma Perera</td>
                                    <td>0779213032</td>
                                    <td><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Not Sent</span></td>
                                    <td className="text-right">
                                        <button
                                            onClick={() => handleSendSmsAlert('Senuri Perera', 'DPT Booster')}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
                                        >
                                            <Smartphone size={13} />
                                            <span>Send SMS Alert</span>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-slate-800">Sahan Perera</td>
                                    <td className="font-mono text-slate-500">SL-2026-1-93929</td>
                                    <td><span className="bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded font-medium">Pentavalent 3 (6M)</span></td>
                                    <td className="text-red-600 font-semibold">2026-06-10</td>
                                    <td>Anoma Perera</td>
                                    <td>0779213032</td>
                                    <td><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Sent (July 15)</span></td>
                                    <td className="text-right">
                                        <button
                                            onClick={() => handleSendSmsAlert('Sahan Perera', 'Pentavalent 3')}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
                                        >
                                            <Smartphone size={13} />
                                            <span>Resend SMS</span>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-slate-800">Arshad Rahaman</td>
                                    <td className="font-mono text-slate-500">SL-2025-1-10293</td>
                                    <td><span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded font-medium">Measles & Rubella (9M)</span></td>
                                    <td className="text-slate-600">2026-07-28</td>
                                    <td>Fathima Rahaman</td>
                                    <td>0769328102</td>
                                    <td><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Scheduled</span></td>
                                    <td className="text-right">
                                        <button
                                            onClick={() => handleSendSmsAlert('Arshad Rahaman', 'Measles & Rubella')}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
                                        >
                                            <Smartphone size={13} />
                                            <span>Send SMS Alert</span>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 5. SETTINGS VIEW */}
                {activeTab === 'Settings' && (
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm max-w-2xl space-y-6">
                        <div>
                            <h3 className="text-base font-bold text-[#0F172A]">Midwife Account & Clinic Settings</h3>
                            <p className="text-xs text-slate-500">Update your clinical profile details and app preferences</p>
                        </div>

                        {/* Profile form */}
                        <div className="space-y-4 pt-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personal Profile Info</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 font-sans">Full Name</label>
                                    <input
                                        type="text"
                                        value={midwifeName}
                                        onChange={(e) => setMidwifeName(e.target.value)}
                                        className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1D61FF]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Designation</label>
                                    <input
                                        type="text"
                                        value="Public Health Midwife (PHM)"
                                        disabled
                                        className="w-full text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl p-3 text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Assigned MOH Area</label>
                                    <input
                                        type="text"
                                        value={midwifeArea}
                                        onChange={(e) => setMidwifeArea(e.target.value)}
                                        className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1D61FF]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Contact Phone</label>
                                    <input
                                        type="text"
                                        value={midwifePhone}
                                        onChange={(e) => setMidwifePhone(e.target.value)}
                                        className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1D61FF]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Official Email Address</label>
                                <input
                                    type="email"
                                    value={midwifeEmail}
                                    onChange={(e) => setMidwifeEmail(e.target.value)}
                                    className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1D61FF]"
                                />
                            </div>
                        </div>

                        {/* App Preferences */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Application & Ledger Preferences</h4>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-slate-700 block">SMS Alerts Auto-notify</span>
                                    <span className="text-[10px] text-slate-400">Send reminder messages automatically 3 days before due vaccines</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={prefNotifications}
                                    onChange={(e) => setPrefNotifications(e.target.checked)}
                                    className="w-4 h-4 text-[#1D61FF] accent-[#1D61FF] cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-slate-700 block">Auto-sync database ledger</span>
                                    <span className="text-[10px] text-slate-400">Keep growth records local cache synced with cloud database</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={prefAutoSync}
                                    onChange={(e) => setPrefAutoSync(e.target.checked)}
                                    className="w-4 h-4 text-[#1D61FF] accent-[#1D61FF] cursor-pointer"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => alert("Settings successfully updated and applied.")}
                            className="bg-[#1D61FF] hover:bg-[#1D61FF]/90 text-white text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-blue-500/10"
                        >
                            Save Settings Changes
                        </button>
                    </div>
                )}
            </main>

            {/* Registration Modal */}
            <ChildRegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                refreshData={fetchChildren}
                staffId={JSON.parse(localStorage.getItem('user'))?.id}
            />

            {/* Scan QR Code Modal */}
            {isScanQRModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="qr-modal-content" style={{ background: '#fff', padding: '25px', borderRadius: '16px', width: '420px', textAlign: 'center', boxShadow: '0px 10px 25px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ color: '#0F172A', margin: 0, fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                📷 Scan Child Health QR Code
                            </h3>
                            <button onClick={() => setIsScanQRModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B' }}>✕</button>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
                            Position the child's Digital Health Card QR code in front of your camera or enter the Digital Health ID manually.
                        </p>

                        <div style={{ background: '#0F172A', borderRadius: '12px', padding: '15px', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden', minHeight: '260px', justifyContent: 'center' }}>
                            <div id="qr-reader" style={{ width: '100%', maxWidth: '280px', borderRadius: '8px', overflow: 'hidden' }}></div>
                            <span style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '12px' }}>Align QR code inside the frame</span>
                        </div>

                        <div style={{ margin: '20px 0 10px 0', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold', color: '#94A3B8', letterSpacing: '1px' }}>
                            - OR ENTER HEALTH ID MANUALLY -
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!manualHealthId.trim()) return;
                            const target = children.find(c => c.digitalHealthId && c.digitalHealthId.toLowerCase() === manualHealthId.trim().toLowerCase());
                            if (target) {
                                setClinicVisitChild(target);
                                setIsScanQRModalOpen(false);
                                setIsClinicVisitModalOpen(true);
                                setManualHealthId('');
                            } else {
                                alert(`No child profile found with Digital Health ID: "${manualHealthId}"`);
                            }
                        }} style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                placeholder="e.g. SL-CHILD-2026-8942"
                                value={manualHealthId}
                                onChange={(e) => setManualHealthId(e.target.value)}
                                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                            />
                            <button type="submit" style={{ background: '#1D61FF', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Search
                            </button>
                        </form>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsScanQRModalOpen(false)} style={{ background: '#F1F5F9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            {/* QR Card Modal */}
            {isQRModalOpen && selectedChild && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="qr-modal-content" style={{ background: '#fff', padding: '25px', borderRadius: '12px', width: '380px', textAlign: 'center', boxShadow: '0px 5px 15px rgba(0,0,0,0.3)' }}>
                        <div ref={cardRef} style={{ padding: '15px', border: '2px dashed #1D61FF', borderRadius: '8px', background: '#f8f9fa' }}>
                            <h3 style={{ color: '#1D61FF', margin: '0 0 5px 0' }}>CHILD DIGITAL HEALTH CARD</h3>
                            <p style={{ fontSize: '0.85em', color: '#666', margin: '0 0 15px 0' }}>Ministry of Healthcare, Sri Lanka</p>

                            <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center' }}>
                                <QRCodeSVG value={selectedChild.digitalHealthId} size={150} />
                            </div>

                            <div style={{ textAlign: 'left', fontSize: '0.9em', lineHeight: '1.6' }}>
                                <div><strong>Child Name:</strong> {selectedChild.name || selectedChild.childName}</div>
                                <div><strong>Digital ID:</strong> <span style={{ color: '#1D61FF', fontWeight: 'bold' }}>{selectedChild.digitalHealthId}</span></div>
                                <div><strong>Date of Birth:</strong> {new Date(selectedChild.dob).toLocaleDateString()}</div>
                                <div><strong>Mother's Name:</strong> {selectedChild.motherName}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                            <button onClick={handlePrintQR} style={{ background: '#1D61FF', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Print Card</button>
                            <button onClick={() => setIsQRModalOpen(false)} style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Clinic Visit Modal */}
            <ClinicVisitModal
                isOpen={isClinicVisitModalOpen}
                onClose={() => { setIsClinicVisitModalOpen(false); setClinicVisitChild(null); }}
                child={clinicVisitChild}
                refreshData={fetchChildren}
                midwifeName={midwifeName}
            />
        </div>
    );
};

export default MidwifeDashboard;