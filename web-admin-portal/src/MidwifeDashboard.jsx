import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import ChildRegistrationModal from './ChildRegistrationModal';
import './Dashboard.css';

const MidwifeDashboard = () => {
    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState({ total: 0, vaccinations: 15, alerts: 3, clinics: 2 });
    
    // states for QR code
    const [selectedChild, setSelectedChild] = useState(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const cardRef = useRef();

    //fetch data from database
    const fetchChildren = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/children');
            setChildren(res.data);
            setStats(prev => ({ ...prev, total: res.data.length }));
        } catch (err) {
            console.error("Error fetching children:", err);
        }
    };

    useEffect(() => {
        fetchChildren();
    }, []);

    // QR code print function
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

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <span className="heart-icon">🤍</span>
                    <div className="logo-text">
                        <h3>Healthcare</h3>
                        <p>Midwife</p>
                    </div>
                </div>
                <ul className="nav-menu">
                    <li className="active">Dashboard Overview</li>
                    <li onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
                        Register New Child
                    </li>
                    <li>Child Records</li>
                    <li>Growth Tracking</li>
                    <li>Vaccination Alerts</li>
                    <li>Settings</li>
                </ul>
                <div className="logout-section">
                    <button onClick={handleLogout} className="logout-link">Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="header">
                    <div className="search-container">
                        <input type="text" placeholder="Search Child Name or ID..." />
                    </div>
                    <div className="header-right">
                        <span className="bell">🔔</span>
                        <div className="user-profile">
                            <div className="avatar">NK</div>
                            <div className="user-details">
                                <strong>Nurse Kamani</strong>
                                <span>Area: Colombo 05</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="stats-row">
                    <div className="stat-box">
                        <div className="icon-circle blue">👥</div>
                        <h2>{stats.total}</h2>
                        <p>Total Children Registered</p>
                    </div>
                    <div className="stat-box">
                        <div className="icon-circle purple">💉</div>
                        <h2>{stats.vaccinations}</h2>
                        <p>Upcoming Vaccinations</p>
                    </div>
                    <div className="stat-box">
                        <div className="icon-circle orange">⚠️</div>
                        <h2>{stats.alerts}</h2>
                        <p>Growth Retardation Alerts</p>
                    </div>
                    <div className="stat-box">
                        <div className="icon-circle green">📅</div>
                        <h2>{stats.clinics}</h2>
                        <p>Clinics Scheduled</p>
                    </div>
                </div>

                {/* Blue Banner */}
                <div className="registration-banner">
                    <div className="banner-info">
                        <h2>Child Registration Center</h2>
                        <p>Register new children or quickly access records using QR codes</p>
                    </div>
                    <div className="banner-btns">
                        <button className="btn-scan">Quick Scan</button>
                        <button className="btn-start" onClick={() => setIsModalOpen(true)}>+ Start New Registration</button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="table-container">
                    <h3>Recently Registered Children</h3>
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
                            {children.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                        No registered children found.
                                    </td>
                                </tr>
                            ) : (
                                children.map(child => (
                                    <tr key={child._id}>
                                        <td>
                                            <div className="child-name-cell">
                                                <strong style={{ color: '#1a1a1a', display: 'block' }}>
                                                    {child.name || child.childName || "No Name Found"}
                                                </strong>
                                                <span className="digital-id-sub" style={{ display: 'block', fontSize: '0.85em', color: '#0056b3', marginTop: '3px', fontWeight: '500' }}>
                                                    {child.digitalHealthId || "No ID Assigned"}
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
                                                {child.digitalHealthId ? (
                                                    <QRCodeSVG value={child.digitalHealthId} size={35} />
                                                ) : (
                                                    "❌"
                                                )}
                                            </div>
                                        </td>

                                        
                                        <td>
                                            <button 
                                                className="btn-view" 
                                                onClick={() => navigate(`/child-profile/${child._id}`)}
                                                style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2em' }}
                                                title="View Full Health Record"
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
            </main>

            {/* Registration Modal */}
            <ChildRegistrationModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
              refreshData={fetchChildren}
              staffId={JSON.parse(localStorage.getItem('user'))?.id} 
            />

           
            {isQRModalOpen && selectedChild && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="qr-modal-content" style={{ background: '#fff', padding: '25px', borderRadius: '12px', width: '380px', textAlign: 'center', boxShadow: '0px 5px 15px rgba(0,0,0,0.3)' }}>
                        
                       
                        <div ref={cardRef} style={{ padding: '15px', border: '2px dashed #0056b3', borderRadius: '8px', background: '#f8f9fa' }}>
                            <h3 style={{ color: '#0056b3', margin: '0 0 5px 0' }}>CHILD DIGITAL HEALTH CARD</h3>
                            <p style={{ fontSize: '0.85em', color: '#666', margin: '0 0 15px 0' }}>Ministry of Healthcare, Sri Lanka</p>
                            
                            <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center' }}>
                                <QRCodeSVG value={selectedChild.digitalHealthId} size={150} />
                            </div>

                            <div style={{ textAlign: 'left', fontSize: '0.9em', lineHeight: '1.6' }}>
                                <div><strong>Child Name:</strong> {selectedChild.name || selectedChild.childName}</div>
                                <div><strong>Digital ID:</strong> <span style={{ color: '#0056b3', fontWeight: 'bold' }}>{selectedChild.digitalHealthId}</span></div>
                                <div><strong>Date of Birth:</strong> {new Date(selectedChild.dob).toLocaleDateString()}</div>
                                <div><strong>Mother's Name:</strong> {selectedChild.motherName}</div>
                            </div>
                        </div>
                        

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                            <button onClick={handlePrintQR} style={{ background: '#0056b3', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Print Card</button>
                            <button onClick={() => setIsQRModalOpen(false)} style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MidwifeDashboard;