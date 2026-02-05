import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCapsules, 
  FaPills, 
  FaRobot, 
  FaLink, 
  FaSignOutAlt,
  FaLightbulb,
  FaCheck,
  FaSpinner
} from 'react-icons/fa';
import './PillTracker.css';

const PillTracker = () => {
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: 'Metformin (500mg)',
      time: '09:00 AM',
      instructions: 'Before Breakfast',
      taken: false,
      upcoming: false,
      icon: 'capsules',
      iconBg: 'icon-warning-bg'
    },
    {
      id: 2,
      name: 'Lisinopril (10mg)',
      time: '08:00 PM',
      instructions: 'With Water',
      taken: false,
      upcoming: true,
      icon: 'pills',
      iconBg: 'icon-primary-bg'
    }
  ]);

  const handleLogMedication = (medId) => {
    // Show loading state
    setMedications(prev => prev.map(med => 
      med.id === medId ? { ...med, loading: true } : med
    ));

    // Simulate API call
    setTimeout(() => {
      setMedications(prev => prev.map(med => 
        med.id === medId ? { 
          ...med, 
          taken: true, 
          loading: false 
        } : med
      ));
    }, 1000);
  };

  return (
    <>
      <header>
        <Link to="/patient" className="logo">
          Med<span>Blocks</span>
        </Link>
        <div className="header-actions">
          <div className="model-badge">
            <FaRobot style={{ color: '#3B82F6' }} />
            Behavioral Engine Active
          </div>
          <div className="wallet">
            <FaLink />
            <span>0x71C...A4f</span>
          </div>
          <button className="logout-btn">
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </header>

      <section className="hero">
        <h1>Pill Tracker</h1>
        <p className="hero-subtitle">Smart reminders powered by your historical adherence patterns.</p>
      </section>

      <main className="container pill-container">
        <div className="card">
          <h3 className="card-title">Today's Schedule</h3>
          
          {medications.map((med) => (
            <div key={med.id} className="pill-item">
              <div className="pill-info">
                <div className={`pill-icon ${med.iconBg}`}>
                  {med.icon === 'capsules' ? (
                    <FaCapsules />
                  ) : (
                    <FaPills />
                  )}
                </div>
                <div>
                  <div className="pill-name">{med.name}</div>
                  <div className="pill-meta">
                    Time: {med.time} • {med.instructions}
                  </div>
                </div>
              </div>
              
              {med.upcoming ? (
                <div className="upcoming-tag">UPCOMING</div>
              ) : (
                <button 
                  className="btn-log"
                  onClick={() => handleLogMedication(med.id)}
                  disabled={med.taken || med.loading}
                  style={{
                    background: med.taken ? '#D1FAE5' : undefined,
                    color: med.taken ? '#065F46' : undefined
                  }}
                >
                  {med.loading ? (
                    <>
                      <FaSpinner className="fa-spin" />
                      Logging...
                    </>
                  ) : med.taken ? (
                    <>
                      <FaCheck />
                      Taken
                    </>
                  ) : (
                    'Mark as Taken'
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        <aside className="ai-sidebar">
          <h4 className="sidebar-label">AI Adherence Analysis</h4>
          <div className="probability-val">65% Prob.</div>
          <p className="sidebar-text">
            Our model predicts a high chance of a missed dose tonight based on your late-night activity patterns.
          </p>
          
          <div className="risk-meter">
            <div className="risk-fill"></div>
          </div>
          
          <div className="suggestion-box">
            <div className="suggestion-header">
              <FaLightbulb className="icon-warning" />
              Smart Suggestion
            </div>
            <p className="suggestion-text">
              Keep your evening meds on your bedside table to increase adherence by 40%.
            </p>
          </div>
        </aside>
      </main>
    </>
  );
};

export default PillTracker;
