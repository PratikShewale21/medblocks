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
        
        // Calculate real adherence data from stored medications
        const currentTime = new Date();
        const sevenDaysAgo = new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Calculate actual missed doses in last 7 days
        let missedDoses7Days = 0;
        let totalDelayMinutes = 0;
        let takenCount = 0;
        
        meds.forEach(med => {
          if (med.taken_times && med.taken_times.length > 0) {
            med.taken_times.forEach(takenTime => {
              if (takenTime.date) {
                const takenDate = new Date(takenTime.timestamp);
                if (takenDate >= sevenDaysAgo) {
                  takenCount++;
                  // Calculate delay from the specific time slot that was taken
                  if (takenTime.timeSlot && takenTime.timeSlot !== 'Unscheduled') {
                    const scheduledTimeStr = takenTime.timeSlot;
                    const [hours, minutes] = scheduledTimeStr.match(/\d+:/g)?.[0].split(':') || [0, 0];
                    const period = scheduledTimeStr.toLowerCase().includes('pm') && parseInt(hours) !== 12 ? 'PM' : 'AM';
                    
                    let scheduledHour = parseInt(hours);
                    if (period === 'PM' && scheduledHour !== 12) scheduledHour += 12;
                    if (period === 'AM' && scheduledHour === 12) scheduledHour = 0;
                    
                    const scheduledTime = new Date(takenDate);
                    scheduledTime.setHours(scheduledHour, parseInt(minutes), 0, 0);
                    
                    if (takenDate > scheduledTime) {
                      const delay = Math.floor((takenDate - scheduledTime) / (1000 * 60));
                      totalDelayMinutes += delay;
                      console.log(`🔍 Delay for ${takenTime.timeSlot}: ${delay} minutes`);
                    }
                  }
                }
              }
            });
          }
          
          // Check for missed scheduled doses in last 7 days
          const timeSlots = med.time.split(',').map(t => t.trim());
          for (let i = 0; i < 7; i++) {
            const checkDate = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
            const checkDateStr = checkDate.toDateString();
            
            // Check each time slot for this day
            timeSlots.forEach(timeSlot => {
              if (timeSlot && timeSlot !== 'Unscheduled') {
                const [hours, minutes] = timeSlot.match(/\d+:/g)?.[0].split(':') || [0, 0];
                const period = timeSlot.toLowerCase().includes('pm') && parseInt(hours) !== 12 ? 'PM' : 'AM';
                
                let scheduledHour = parseInt(hours);
                if (period === 'PM' && scheduledHour !== 12) scheduledHour += 12;
                if (period === 'AM' && scheduledHour === 12) scheduledHour = 0;
                
                const scheduledTime = new Date(checkDate);
                scheduledTime.setHours(scheduledHour, parseInt(minutes), 0, 0);
                
                // Only count if scheduled time has passed
                if (scheduledTime <= currentTime) {
                  const wasTaken = med.taken_times && med.taken_times.some(takenTime => {
                    return takenTime.date === checkDateStr && takenTime.timeSlot === timeSlot;
                  });
                  
                  if (!wasTaken) {
                    missedDoses7Days++;
                    console.log(`🔍 Missed dose: ${med.name} - ${timeSlot} on ${checkDateStr}`);
                  }
                }
              }
            });
          }
        });
        
        const avgDelay = takenCount > 0 ? Math.floor(totalDelayMinutes / takenCount) : 0;
        
        setAdherenceData({
          missed_doses_last_7_days: missedDoses7Days,
          avg_delay_minutes: avgDelay,
          adherence_rate_30_days: 0 // ML model will calculate this
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
      nextDose: newMedication.time.split(',')[0] || newMedication.time,
      taken: false,
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
    if (medications.length === 0) {
      alert('Please add medications first to analyze adherence.');
      return;
    }

    try {
      // Test ML model with different inputs to prove it's working
      console.log('🔍 Testing ML model with different inputs...');
      try {
        const testResponse = await fetch(`${API_BASE_URL}/test-ml`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        const testResult = await testResponse.json();
        console.log('🔍 ML Test Results:', testResult);
        console.log('🔍 Poor adherence prediction:', testResult.poor_adherence_prediction);
        console.log('🔍 Good adherence prediction:', testResult.good_adherence_prediction);
        
        if (testResult.poor_adherence_prediction.risk_percentage !== testResult.good_adherence_prediction.risk_percentage) {
          console.log('✅ ML MODEL IS WORKING - Predictions are different for different inputs!');
        } else {
          console.log('❌ ML model might be returning same values');
        }
      } catch (testError) {
        console.log('Test error:', testError);
        // Continue with main analysis even if test fails
      }

      // Prepare data for ML model prediction
      const predictionTime = new Date();
      
      // Calculate actual missed doses from today
      const todayMissedDoses = medications.filter(med => {
        const scheduledTime = new Date();
        const [hours, minutes] = med.nextDose.split(':');
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return predictionTime > scheduledTime && !med.taken;
      }).length;
      
      // Calculate actual delay for last taken dose
      const lastTakenMed = medications.find(med => med.last_taken);
      let actualDelay = 0;
      if (lastTakenMed) {
        const scheduledTime = new Date();
        const [hours, minutes] = lastTakenMed.nextDose.split(':');
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        actualDelay = Math.max(0, Math.floor((predictionTime - scheduledTime) / (1000 * 60)));
      }
      
      // Prepare patient data for ML model
      const patientData = {
        patient_id: currentPatient.id,
        wallet_address: currentPatient.wallet_address,
        current_time: predictionTime.toISOString(),
        medications: medications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          scheduled_time: med.time,
          taken_today: med.taken,
          last_taken: med.last_taken,
          taken_times: med.taken_times || []
        })),
        adherence_metrics: {
          missed_doses_last_7_days: adherenceData.missed_doses_last_7_days,
          avg_delay_minutes: adherenceData.avg_delay_minutes,
          missed_doses_today: todayMissedDoses,
          current_delay_minutes: actualDelay
        },
        temporal_features: {
          hour_of_day: predictionTime.getHours(),
          day_of_week: predictionTime.getDay(),
          day_of_month: predictionTime.getDate(),
          month: predictionTime.getMonth() + 1,
          is_weekend: predictionTime.getDay() === 0 || predictionTime.getDay() === 6
        }
      };

      try {
        // Call ML backend API
        const response = await fetch(`${API_BASE_URL}/predict/adherence`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(patientData)
        });

        if (!response.ok) {
          throw new Error('ML model prediction failed');
        }

        const mlResult = await response.json();
        
        // Use ML model predictions
        const result = {
          will_miss_next_dose: mlResult.will_miss_next_dose,
          risk_percentage: mlResult.risk_percentage,
          risk_level: mlResult.risk_level,
          recommendations: mlResult.recommendations,
          adherence_score: mlResult.adherence_score,
          next_risk_time: mlResult.next_risk_time,
          model_confidence: mlResult.model_confidence,
          ml_features: mlResult.ml_features || {
            actual_missed_today: todayMissedDoses,
            actual_delay_minutes: actualDelay,
            model_predictions: true
          }
        };

        console.log('ML Model Result:', mlResult);
        console.log('Setting result:', result);
        setResult(result);
        alert('ML Analysis complete! Check below for personalized predictions.');

      } catch (mlError) {
        console.error('ML Model Error:', mlError);
        alert('ML model is required for analysis. Please start the ML backend server.');
      }
    } catch (error) {
      console.error('Error analyzing adherence:', error);
      alert("Unable to analyze adherence");
    }
  };

  const handleMarkAsTaken = async (medication) => {
    try {
      // Update medication taken status for current time slot
      const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      const updatedMedications = medications.map(med => {
        if (med.id === medication.id) {
          // Initialize taken_times array if it doesn't exist
          const takenTimes = med.taken_times || [];
          
          // Get all time slots for this medication
          const timeSlots = medication.time.split(',').map(t => t.trim());
          
          // Find current time slot
          const currentHour = new Date().getHours();
          let currentTimeSlot = null;
          
          timeSlots.forEach(slot => {
            const slotHour = parseInt(slot.match(/\d+/)?.[0] || '0');
            const slotPeriod = slot.toLowerCase().includes('pm') && slotHour !== 12 ? slotHour + 12 : 
                             slot.toLowerCase().includes('am') && slotHour === 12 ? 0 : slotHour;
            
            // Check if current time is within 2 hours of the scheduled time
            if (Math.abs(currentHour - slotPeriod) <= 2) {
              currentTimeSlot = slot;
            }
          });
          
          if (currentTimeSlot) {
            // Check if this time slot has already been taken today
            const today = new Date().toDateString();
            const alreadyTaken = takenTimes.some(taken => 
              taken.date === today && 
              taken.timeSlot === currentTimeSlot
            );
            
            if (!alreadyTaken) {
              // Add new taken time
              takenTimes.push({
                date: today,
                time: currentTime,
                timeSlot: currentTimeSlot,
                timestamp: Date.now()
              });
              
              return { 
                ...med, 
                taken_times: takenTimes,
                last_taken: currentTime
              };
            }
          } else {
            // Allow taking medication outside scheduled time
            const today = new Date().toDateString();
            const alreadyTakenToday = takenTimes.some(taken => 
              taken.date === today
            );
            
            if (!alreadyTakenToday) {
              // Add as unscheduled dose
              takenTimes.push({
                date: today,
                time: currentTime,
                timeSlot: 'Unscheduled',
                timestamp: Date.now()
              });
              
              return { 
                ...med, 
                taken_times: takenTimes,
                last_taken: currentTime
              };
            }
          }
          
          return med;
        }
        return med;
      });
      
      saveMedications(updatedMedications);

      // Prepare data for ML model prediction
      const predictionTime = new Date();
      const adherenceScore = Math.floor(updatedMedications.reduce((sum, med) => sum + med.adherence, 0) / updatedMedications.length);
      
      // Calculate actual missed doses from today
      const todayMissedDoses = updatedMedications.filter(med => {
        const scheduledTime = new Date();
        const [hours, minutes] = med.nextDose.split(':');
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return predictionTime > scheduledTime && !med.taken;
      }).length;
      
      // Calculate actual delay for last taken dose (moved from handleMarkAsTaken)
      let actualDelay = 0;
      if (medications.length > 0) {
        // Find the most recent taken dose across all medications
        let mostRecentTakenOverall = null;
        let mostRecentMed = null;
        
        medications.forEach(med => {
          if (med.taken_times && med.taken_times.length > 0) {
            const recentTaken = med.taken_times
              .filter(taken => taken.date === new Date().toDateString())
              .sort((a, b) => b.timestamp - a.timestamp)[0];
            
            if (recentTaken && (!mostRecentTakenOverall || recentTaken.timestamp > mostRecentTakenOverall.timestamp)) {
              mostRecentTakenOverall = recentTaken;
              mostRecentMed = med;
            }
          }
        });
        
        if (mostRecentTakenOverall && mostRecentMed && mostRecentTakenOverall.timeSlot) {
          // Parse the scheduled time for this specific time slot
          const scheduledTimeStr = mostRecentTakenOverall.timeSlot;
          const [hours, minutes] = scheduledTimeStr.match(/\d+:/g)?.[0].split(':') || [0, 0];
          const period = scheduledTimeStr.toLowerCase().includes('pm') && parseInt(hours) !== 12 ? 'PM' : 'AM';
          
          let scheduledHour = parseInt(hours);
          if (period === 'PM' && scheduledHour !== 12) scheduledHour += 12;
          if (period === 'AM' && scheduledHour === 12) scheduledHour = 0;
          
          const scheduledTime = new Date();
          scheduledTime.setHours(scheduledHour, parseInt(minutes), 0, 0);
          
          const takenTime = new Date(mostRecentTakenOverall.timestamp);
          actualDelay = Math.max(0, Math.floor((takenTime - scheduledTime) / (1000 * 60)));
          console.log(`🔍 Frontend delay calculation: scheduled=${scheduledTimeStr}, scheduled_time=${scheduledTime}, taken_time=${takenTime}, delay=${actualDelay} minutes`);
        }
      }
      
      // Prepare patient data for ML model
      const patientData = {
        patient_id: currentPatient.id,
        wallet_address: currentPatient.wallet_address,
        current_time: predictionTime.toISOString(),
        medications: updatedMedications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          scheduled_time: med.time,
          adherence_score: med.adherence,
          taken_today: med.taken,
          last_taken: med.last_taken,
          taken_times: med.taken_times || []
        })),
        adherence_metrics: {
          adherence_score_30_days: adherenceScore,
          missed_doses_last_7_days: adherenceData.missed_doses_last_7_days,
          avg_delay_minutes: adherenceData.avg_delay_minutes,
          missed_doses_today: todayMissedDoses,
          current_delay_minutes: actualDelay
        },
        temporal_features: {
          hour_of_day: predictionTime.getHours(),
          day_of_week: predictionTime.getDay(),
          day_of_month: predictionTime.getDate(),
          month: predictionTime.getMonth() + 1,
          is_weekend: predictionTime.getDay() === 0 || predictionTime.getDay() === 6
        }
      };

      try {
        // Call ML backend API
        const response = await fetch(`${API_BASE_URL}/predict/adherence`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(patientData)
        });

        if (!response.ok) {
          throw new Error('ML model prediction failed');
        }

        const mlResult = await response.json();
        
        // Use ML model predictions
        const result = {
          will_miss_next_dose: mlResult.will_miss_next_dose || false,
          risk_percentage: mlResult.risk_percentage || 15,
          risk_level: mlResult.risk_level || 'LOW',
          recommendations: mlResult.recommendations || [
            'Continue taking medications on time',
            'Keep track of your medication schedule',
            'Use phone reminders for medication times'
          ],
          adherence_score: mlResult.adherence_score || adherenceScore,
          next_risk_time: mlResult.next_risk_time || `Today, ${updatedMedications[0]?.nextDose || 'No scheduled doses'}`,
          model_confidence: mlResult.model_confidence || 0.95,
          missed_doses_last_7_days: mlResult.missed_doses_last_7_days || 0,
          avg_delay_minutes: mlResult.avg_delay_minutes || 0,
          ml_features: mlResult.ml_features || {
            actual_missed_today: todayMissedDoses,
            actual_delay_minutes: actualDelay,
            adherence_trend: adherenceScore > 80 ? 'improving' : 'needs_attention',
            model_predictions: true
          }
        };

        console.log('ML Model Result:', mlResult);
        console.log('Setting result:', mlResult);
        console.log('Missed doses from result:', mlResult.missed_doses_last_7_days);
        console.log('Avg delay from result:', mlResult.avg_delay_minutes);
        setResult(result);
        alert('ML Analysis complete! Check below for personalized predictions.');

      } catch (mlError) {
        console.error('ML Model Error:', mlError);
        
        // Fallback to simple calculation if ML fails
        const fallbackResult = {
          will_miss_next_dose: todayMissedDoses > 0 || adherenceScore < 70,
          risk_percentage: Math.max(5, Math.min(95, 100 - adherenceScore + (todayMissedDoses * 10))),
          risk_level: adherenceScore > 80 ? 'LOW' : adherenceScore > 60 ? 'MODERATE' : 'HIGH',
          recommendations: [
            'Continue taking medications on time',
            'Keep track of your medication schedule',
            'Use phone reminders for medication times'
          ],
          adherence_score: adherenceScore,
          next_risk_time: `Today, ${updatedMedications[0]?.nextDose || 'No scheduled doses'}`,
          model_confidence: 0.5,
          ml_features: {
            actual_missed_today: todayMissedDoses,
            actual_delay_minutes: actualDelay,
            adherence_trend: adherenceScore > 80 ? 'improving' : 'needs_attention',
            model_predictions: false,
            fallback_used: true
          }
        };

        console.log('Using fallback result:', fallbackResult);
        setResult(fallbackResult);
        alert('ML model unavailable, using basic analysis. Check below for results.');
      }
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      alert("Unable to update medication status");
    }
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

  const getButtonStatus = (medication) => {
    const today = new Date().toDateString();
    const currentHour = new Date().getHours();
    
    // Get all time slots for this medication
    const timeSlots = medication.time.split(',').map(t => t.trim());
    let currentTimeSlot = null;
    
    // Find current time slot
    timeSlots.forEach(slot => {
      const slotHour = parseInt(slot.match(/\d+/)?.[0] || '0');
      const slotPeriod = slot.toLowerCase().includes('pm') && slotHour !== 12 ? slotHour + 12 : 
                       slot.toLowerCase().includes('am') && slotHour === 12 ? 0 : slotHour;
      
      // Check if current time is within 2 hours of the scheduled time
      if (Math.abs(currentHour - slotPeriod) <= 2) {
        currentTimeSlot = slot;
      }
    });
    
    if (currentTimeSlot) {
      // Check if this specific time slot has already been taken today
      const alreadyTakenThisSlot = medication.taken_times?.some(
        taken => taken.date === today && taken.timeSlot === currentTimeSlot
      );
      
      return alreadyTakenThisSlot ? 'taken' : 'available';
    } else {
      // No current time slot, check if any dose was taken today
      const takenToday = medication.taken_times?.some(
        taken => taken.date === today
      );
      return takenToday ? 'taken' : 'available';
    }
  };

  const getButtonText = (medication) => {
    const status = getButtonStatus(medication);
    return status === 'taken' 
        ? <><FaCheckCircle /> Already Taken</>
        : <><FaPills /> Mark as Taken</>;
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
                  
                  {/* Show taken times for today */}
                  {med.taken_times && med.taken_times.length > 0 && (
                    <div className="taken-times">
                      <span className="taken-label">Taken today:</span>
                      <div className="taken-list">
                        {med.taken_times
                          .filter(taken => taken.date === new Date().toDateString())
                          .map((taken, index) => (
                            <span key={index} className="taken-time">
                              {taken.timeSlot} at {taken.time}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Show current time slot status */}
                  {(() => {
                    const currentHour = new Date().getHours();
                    const timeSlots = med.time.split(',').map(t => t.trim());
                    let currentTimeSlot = null;
                    
                    timeSlots.forEach(slot => {
                      const slotHour = parseInt(slot.match(/\d+/)?.[0] || '0');
                      const slotPeriod = slot.toLowerCase().includes('pm') && slotHour !== 12 ? slotHour + 12 : 
                                       slot.toLowerCase().includes('am') && slotHour === 12 ? 0 : slotHour;
                      
                      if (Math.abs(currentHour - slotPeriod) <= 2) {
                        currentTimeSlot = slot;
                      }
                    });
                    
                    if (currentTimeSlot) {
                      const today = new Date().toDateString();
                      const alreadyTaken = med.taken_times?.some(taken => 
                        taken.date === today && 
                        taken.timeSlot === currentTimeSlot
                      );
                      
                      return (
                        <div className={`time-slot-status ${alreadyTaken ? 'taken' : 'pending'}`}>
                          {alreadyTaken ? '✅ Taken' : '⏰ Due now'}
                        </div>
                      );
                    }
                    
                    return null;
                  })()}
                  
                                  </div>
                
                <button 
                  className={`mark-taken-btn ${getButtonStatus(med)}`}
                  onClick={() => handleMarkAsTaken(med)}
                  disabled={getButtonStatus(med) === 'taken'}
                >
                  {getButtonText(med)}
                </button>
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
                  <div className="score-value">{result.adherence_score}%</div>
                  <div className="score-label">Adherence Score</div>
                </div>
                <div className="prediction-info">
                  <div className="prediction-item">
                    <span className="prediction-label">Next Dose Risk:</span>
                    <span className={`prediction-value ${result.will_miss_next_dose ? 'high-risk' : 'low-risk'}`}>
                      {result.will_miss_next_dose ? 'Likely to Miss' : 'Likely to Take'}
                    </span>
                  </div>
                  <div className="prediction-item">
                    <span className="prediction-label">Risk Time:</span>
                    <span className="prediction-value">{result.next_risk_time}</span>
                  </div>
                </div>
              </div>

              <div className="metrics-summary">
                <div className="metric-card">
                  <div className="metric-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="metric-content">
                    <span className="metric-value">{result?.missed_doses_last_7_days || 0}</span>
                    <span className="metric-label">Missed (7 days)</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">
                    <FaClock />
                  </div>
                  <div className="metric-content">
                    <span className="metric-value">{result?.avg_delay_minutes || 0}m</span>
                    <span className="metric-label">Avg Delay</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">
                    <FaChartLine />
                  </div>
                  <div className="metric-content">
                    <span className="metric-value">{result.risk_percentage}%</span>
                    <span className="metric-label">Risk Score</span>
                  </div>
                </div>
              </div>

              <div className="recommendations">
                <h4>
                  <FaUserMd />
                  AI Recommendations
                </h4>
                <div className="recommendations-grid">
                  {result.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <FaBell />
                      <span>{rec}</span>
                    </div>
                  ))}
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
                <button className="btn-primary">Set Reminders</button>
                <button className="btn-secondary">View History</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PillTracker;
