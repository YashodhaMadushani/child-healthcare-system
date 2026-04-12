import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChildRegistrationModal from './ChildRegistrationModal';
import './Dashboard.css';

const MidwifeDashboard = () => {
    const [children, setChildren] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState({ total: 0, vaccinations: 15, alerts: 3, clinics: 2 });

    // fecting data from database
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
                    {/* 1. Sidebar onclick */}
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
                        {/* 2. Button*/}
                        <button className="btn-start" onClick={() => setIsModalOpen(true)}>+ Start New Registration</button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="table-container">
                    <h3>Recently Registered Children</h3>
                    <table className="child-table">
                        <thead>
                            <tr>
                                <th>CHILD NAME</th>
                                <th>DATE OF BIRTH</th>
                                <th>MOTHER/GUARDIAN</th>
                                <th>PHONE NUMBER</th>
                                <th>QR CARD</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {children.map(child => (
                                <tr key={child._id}>
                                    <td>
                                        <div className="child-name-cell">
                                            <strong>{child.childName}</strong>
                                            <span>{child.childId}</span>
                                        </div>
                                    </td>
                                    <td>{new Date(child.dob).toLocaleDateString()}</td>
                                    <td>{child.motherName}</td>
                                    <td>{child.phone}</td>
                                    <td><span className="qr-thumbnail">🔳</span></td>
                                    <td><button className="btn-view">👁️</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* 3. Modal  */}
            <ChildRegistrationModal 
             isOpen={isModalOpen} 
             onClose={() => setIsModalOpen(false)} 
             refreshData={fetchChildren}
             
             staffId={JSON.parse(localStorage.getItem('user'))?.id} 
            />
        </div>
    );
};

export default MidwifeDashboard;