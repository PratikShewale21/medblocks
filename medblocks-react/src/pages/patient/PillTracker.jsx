import React, { useState, useEffect } from "react";
import { FaPills, FaClock, FaCheckCircle, FaExclamationTriangle, FaCalendarAlt, FaChartLine, FaBell, FaUserMd, FaSignOutAlt, FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./PillTracker.css";

const PillTracker = () => {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [selectedMedication, setSelectedMedication] = useState(null);
    const [medications, setMedications] = useState([]);
    const [adherenceData, setAdherenceData] = useState({
      missed_doses_last_7_days: 0,
      avg_delay_minutes: 0,
      adherence_rate_30_days: 0
    });
    const [currentPatient, setCurrentPatient] = useState(null);
    const [showAddMedication, setShowAddMedication] = useState(false);
    const [newMedication, setNewMedication] = useState({
      name: '',
      dosage: '',
      frequency: '',
      time: '',
      duration: '',
      color: '#3B82F6'
    });
  
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const API_BASE_URL = 'http://localhost:8002';

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    
    // Create patient data from AuthContext user
    const patientData = {
      id: user.id,
      name: user.name,
      email: user.email,
      condition: "General",
      wallet_address: user.walletAddress
    };
    
    setCurrentPatient(patientData);
  }, [user, isAuthenticated, navigate]);

  // Load medications from localStorage when patient is available
  useEffect(() => {
    if (currentPatient) {
      loadPatientMedications();
    }
  }, [currentPatient]);

  const loadPatientMedications = () => {
    try {
      // Get medications from localStorage for this patient
      const storageKey = `medications_${currentPatient.wallet_address}`;
      const storedMedications = localStorage.getItem(storageKey);
      
      if (storedMedications) {
        const meds = JSON.parse(storedMedications);
        setMedications(meds);
        
        // ❌ REMOVED: Frontend should NEVER calculate adherence, delay, or risk
        // Only backend does that.
        
        // Set minimal default data - backend will calculate real values
        setAdherenceData({
          missed_doses_last_7_days: 0,
          avg_delay_minutes: 0,
          adherence_rate_30_days: 0
        });
      } else {
        // First time patient - no medications yet
        setMedications([]);
        setAdherenceData({
          missed_doses_last_7_days: 0,
          avg_delay_minutes: 0,
          adherence_rate_30_days: 0
        });
      }
    } catch (err) {
      console.error('Error loading medications:', err);
      setMedications([]);
    }
  };

  const saveMedications = (updatedMedications) => {
    try {
      const storageKey = `medications_${currentPatient.wallet_address}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedMedications));
      setMedications(updatedMedications);
    } catch (err) {
      console.error('Error saving medications:', err);
    }
  };

  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage || !newMedication.frequency || !newMedication.time) {
      alert('Please fill in all medication fields');
      return;
    }

    const medication = {
      id: Date.now(),
      name: newMedication.name,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      time: newMedication.time,
      duration: newMedication.duration,
      nextDose: newMedication.time.split(',')[0] || newMedication.time,
      taken: {}, // Initialize as empty object
      takenAt: {}, // Initialize as empty object
      adherence: 0, // ML model will calculate this
      color: newMedication.color
    };

    const updatedMedications = [...medications, medication];
    saveMedications(updatedMedications);

    // Reset form
    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      time: '',
      duration: '',
      color: '#3B82F6'
    });
    setShowAddMedication(false);
  };

  const handleDeleteMedication = (medicationId) => {
    if (window.confirm('Are you sure you want to remove this medication?')) {
      const updatedMedications = medications.filter(med => med.id !== medicationId);
      saveMedications(updatedMedications);
    }
  };

  const handleLogout = () => {
    const redirectPath = logout();
    navigate(redirectPath);
  };

  const handleAnalyzeAdherence = async () => {
    try {
      console.log('🔍 Starting adherence analysis...');
      console.log('📊 Current medications:', medications);

      // FIX 1: Ensure ALL doses are sent (taken + missed)
      const doses = medications.flatMap((med) =>
        med.time.split(',').map((time) => {
          const timeSlot = time.trim();
          // Convert "8:00 AM" to "08:00" format for backend
          const [timePart, period] = timeSlot.split(' ');
          let [hours, minutes] = (timePart || '0:00').split(':');
          hours = parseInt(hours) || 0;
          minutes = parseInt(minutes) || 0;
          
          if (period?.toLowerCase() === 'pm' && hours !== 12) hours += 12;
          if (period?.toLowerCase() === 'am' && hours === 12) hours = 0;
          
          const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          
          return {
            scheduled_time: formattedTime,
            taken: med.taken?.[timeSlot] === true,   // false if not clicked
            taken_at: med.takenAt?.[timeSlot] || null
          };
        })
      );

      console.log('📋 Sending doses to backend:', doses);

      const response = await fetch("http://localhost:8002/predict/adherence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ doses })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ ML Result:', result);

      // FIX 4: STOP using fallback numbers - use ONLY backend response
      setResult(result);
      alert('Adherence analysis complete! Check below for results.');

    } catch (error) {
      console.error("❌ Adherence prediction failed:", error);
      alert('Analysis failed. Please try again.');
    }
  };

  const handleMarkAsTaken = (medId, time) => {
    // Check if medication time has passed
    const currentTime = new Date();
    const [timePart, period] = time.trim().split(' ');
    let [hours, minutes] = (timePart || '0:00').split(':');
    hours = parseInt(hours) || 0;
    minutes = parseInt(minutes) || 0;
    
    if (period?.toLowerCase() === 'pm' && hours !== 12) hours += 12;
    if (period?.toLowerCase() === 'am' && hours === 12) hours = 0;
    
    const medicationTime = new Date();
    medicationTime.setHours(hours, minutes, 0, 0);
    
    // Allow marking as taken only within 2 hours after medication time
    const timeDiff = currentTime - medicationTime;
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    
    if (timeDiff > twoHoursInMs) {
      alert('Cannot mark medication as taken. More than 2 hours have passed since the scheduled time.');
      return;
    }
    
    setMedications((prev) =>
      prev.map((med) =>
        med.id === medId
          ? {
              ...med,
              taken: { ...med.taken, [time]: true },
              takenAt: { ...med.takenAt, [time]: Date.now() - (5 * 60 * 1000) }
            }
          : med
      )
    );
  };

  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'moderate': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getAdherenceColor = (adherence) => {
    if (adherence >= 80) return '#10b981';
    if (adherence >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getButtonStatusForTime = (medication, time) => {
    const today = new Date().toDateString();
    const alreadyTaken = medication.taken?.[time.trim()] === true;
    return alreadyTaken ? 'taken' : 'available';
  };

  const getRiskTime = () => {
  if (!medications.length) return "--";

  const upcomingDoses = medications.flatMap((med) =>
    med.time.split(',')  // ✅ Use med.time, not med.times
      .filter((time) => !med.taken?.[time.trim()]) // ONLY untaken doses
      .map((time) => ({
        time: time.trim(),
      }))
  );

  if (upcomingDoses.length === 0) return "No pending doses";

  // Sort times properly (AM/PM safe)
  upcomingDoses.sort((a, b) => {
    const toMinutes = (t) => {
      const [time, modifier] = t.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    return toMinutes(a.time) - toMinutes(b.time);
  });

  return `TODAY, ${upcomingDoses[0].time}`;
};


const getNextDoseRisk = () => {
  console.log("getNextDoseRisk called", result);

  if (!result) return "--";

  const risk = result.prediction.risk_score * 100;
  console.log("Computed risk:", risk);

  if (risk >= 70) return "LIKELY TO MISS";
  if (risk >= 40) return "MODERATE RISK";
  return "LIKELY TO MISS ";
};


  return (
    <div className="pill-tracker-container">
      <div className="tracker-header">
        <div className="header-content">
          <div className="header-icon">
            <FaPills />
          </div>
          <div>
            <h1>Medication Adherence Tracker</h1>
            <p>AI-powered medical adherence monitoring and predictions</p>
          </div>
        </div>
        <div className="header-controls">
          {/* Patient Info Display */}
          {currentPatient && (
            <div className="patient-info">
              <div className="patient-details">
                <span className="patient-name">{currentPatient.name}</span>
                <span className="patient-condition">{currentPatient.condition}</span>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="tracker-content">
        <div className="medications-section">
          <div className="section-header">
            <h3>Today's Medications</h3>
            <div className="header-actions">
              <button 
                className="add-medication-btn"
                onClick={() => setShowAddMedication(true)}
              >
                <FaPlus /> Add Medication
              </button>
              <button 
                className="analyze-btn"
                onClick={handleAnalyzeAdherence}
                disabled={medications.length === 0}
              >
                <FaChartLine /> Analyze Adherence
              </button>
            </div>
          </div>
          
          {/* Add Medication Form */}
          {showAddMedication && (
            <div className="add-medication-form">
              <h4>Add New Medication</h4>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Medication Name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g., 500mg)"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Frequency (e.g., Twice daily)"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Time (e.g., 8:00 AM, 8:00 PM)"
                  value={newMedication.time}
                  onChange={(e) => setNewMedication({...newMedication, time: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="For how many days?"
                  value={newMedication.duration}
                  onChange={(e) => setNewMedication({...newMedication, duration: e.target.value})}
                />
                <select
                  value={newMedication.color}
                  onChange={(e) => setNewMedication({...newMedication, color: e.target.value})}
                >
                  <option value="#3B82F6">Blue</option>
                  <option value="#10B981">Green</option>
                  <option value="#F59E0B">Yellow</option>
                  <option value="#EF4444">Red</option>
                  <option value="#8B5CF6">Purple</option>
                </select>
              </div>
              <div className="form-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowAddMedication(false)}
                >
                  Cancel
                </button>
                <button 
                  className="save-btn"
                  onClick={handleAddMedication}
                >
                  Add Medication
                </button>
              </div>
            </div>
          )}
          
          {/* No Medications Message */}
          {medications.length === 0 && !showAddMedication && (
            <div className="no-medications">
              <FaPills />
              <h4>No medications added yet</h4>
              <p>Click "Add Medication" to get started with tracking your medications.</p>
            </div>
          )}
          
          <div className="medications-grid">
            {medications.map((med) => (
              <div key={med.id} className={`medication-card ${med.taken ? 'taken' : ''}`}>
                <div className="medication-header" style={{ borderColor: med.color }}>
                  <div className="medication-info">
                    <h4>{med.name}</h4>
                    <p>{med.dosage} • {med.frequency}</p>
                  </div>
                  <div className="medication-actions">
                    <div className="medication-icon" style={{ backgroundColor: med.color }}>
                      <FaPills />
                    </div>
                    <button 
                      className="delete-medication-btn"
                      onClick={() => handleDeleteMedication(med.id)}
                      title="Remove medication"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <div className="medication-details">
                  <div className="time-info">
                    <FaClock />
                    <span>{med.time}</span>
                  </div>
                  
                  {/* Individual Time Slot Buttons */}
                  {med.time.split(',').map((time) => (
                    <button 
                      key={time.trim()}
                      className={`mark-taken-btn ${getButtonStatusForTime(med, time)}`}
                      onClick={() => handleMarkAsTaken(med.id, time.trim())}
                      disabled={med.taken?.[time.trim()] === true}
                    >
                      {med.taken?.[time.trim()] ? `${time.trim()} ✔` : `Take ${time.trim()}`}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="error-section">
            <div className="error-card">
              <FaExclamationTriangle />
              <p>{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="results-section">
            <div className="result-card">
              <div className="result-header">
                <h3>AI Adherence Analysis</h3>
                <div className="header-badges">
                  <div 
                    className="risk-badge" 
                    style={{ backgroundColor: getRiskColor(result.risk_level) }}
                  >
                    {result.risk_level} RISK
                  </div>
                  {result.model_confidence && (
                    <div className="ml-badge">
                      🤖 ML Model
                    </div>
                  )}
                  {result.fallback_mode && (
                    <div className="fallback-badge">
                      ⚠️ Fallback Mode
                    </div>
                  )}
                </div>
              </div>

              <div className="adherence-score-display">
                <div className="score-circle">
                  <div className="score-value">{result?.metrics?.adherence_rate_30_days !== undefined ? `${result.metrics.adherence_rate_30_days}%` : "--%"}</div>
                  <div className="score-label">Adherence Score</div>
                </div>
                <div className="prediction-info">
                  <div className="prediction-item">
                    <span className="prediction-label">Next Dose Risk:</span>
                    <p className="font-semibold">
  {getNextDoseRisk()}
</p>
                  </div>
                  <div className="prediction-item">
                    <span className="prediction-label">Risk Time:</span>
                    <span className="prediction-value">{getRiskTime()}</span>
                  </div>
                </div>
              </div>

              <div className="metrics-summary">
                <div className="metric-card">
                  <div className="metric-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="metric-content">
                    <span className="metric-value">{result?.metrics?.missed_doses_last_7_days !== undefined ? result.metrics.missed_doses_last_7_days : "--"} </span>
                    <span className="metric-label">MISSED (7 DAYS)</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">
                    <FaClock />
                  </div>
                  <div className="metric-content">
                    <span className="metric-value">{result?.metrics?.avg_delay_minutes !== undefined ? `${result.metrics.avg_delay_minutes}m` : "--m"} </span>
                    <span className="metric-label">AVG DELAY</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">
                    <FaChartLine />
                  </div>
                  <div className="metric-content">
                    <span className="metric-value">{result?.prediction?.risk_percentage !== undefined ? `${Math.round(result.prediction.risk_percentage)}%` : "--%"}%</span>
                    <span className="metric-label">RISK SCORE</span>
                  </div>
                </div>
              </div>

              <div className="recommendations">
                <h4>
                  <FaUserMd />
                  AI Recommendations
                </h4>
                <div className="recommendations-grid">
                  {result.prediction?.recommendations ? result.prediction.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <FaBell />
                      <span>{rec}</span>
                    </div>
                  )) : (
                    <div className="recommendation-item">
                      <FaBell />
                      <span>No recommendations available</span>
                    </div>
                  )}
                </div>
              </div>

              {result.alerts && result.alerts.length > 0 && (
                <div className="alerts-section">
                  <h4>
                    <FaExclamationTriangle />
                    Active Alerts
                  </h4>
                  <div className="alerts-grid">
                    {result.alerts.map((alert, index) => (
                      <div key={index} className={`alert-item ${alert.priority}`}>
                        <div className="alert-header">
                          <span className="alert-title">{alert.title}</span>
                          <span className="alert-priority">{alert.priority.toUpperCase()}</span>
                        </div>
                        <p className="alert-message">{alert.message}</p>
                        {alert.action_required && (
                          <div className="alert-action">
                            <span className="action-badge">Action Required</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="action-buttons">
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PillTracker;