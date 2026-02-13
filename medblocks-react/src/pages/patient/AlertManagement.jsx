import React, { useState, useEffect } from "react";
import { FaBell, FaExclamationTriangle, FaCheckCircle, FaTimes, FaFilter, FaSearch, FaClock, FaUserMd } from "react-icons/fa";
import "./AlertManagement.css";

const AlertManagement = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // API Configuration
  const API_BASE_URL = 'http://localhost:8002';

  // Mock alerts data - will be replaced with real API calls
  const mockAlerts = [
    {
      id: 1,
      type: "medication_missed",
      priority: "high",
      title: "Medication Missed",
      message: "You missed your Metformin dose scheduled for 9:00 AM today",
      patient_id: "patient_001",
      timestamp: "2026-02-13T09:30:00Z",
      action_required: true,
      acknowledged: false
    },
    {
      id: 2,
      type: "adherence_low",
      priority: "medium",
      title: "Low Adherence Warning",
      message: "Your medication adherence has dropped below 75% this week",
      patient_id: "patient_001",
      timestamp: "2026-02-13T08:00:00Z",
      action_required: true,
      acknowledged: false
    },
    {
      id: 3,
      type: "refill_reminder",
      priority: "low",
      title: "Refill Reminder",
      message: "Your Lisinopril prescription will need refilling in 5 days",
      patient_id: "patient_001",
      timestamp: "2026-02-13T07:00:00Z",
      action_required: false,
      acknowledged: true
    },
    {
      id: 4,
      type: "appointment_reminder",
      priority: "medium",
      title: "Appointment Reminder",
      message: "Doctor appointment scheduled for tomorrow at 2:00 PM",
      patient_id: "patient_001",
      timestamp: "2026-02-12T14:00:00Z",
      action_required: true,
      acknowledged: false
    }
  ];

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For now, use mock data. Later replace with real API call
      // const response = await fetch(`${API_BASE_URL}/alerts/patient_001`);
      // const data = await response.json();
      
      setTimeout(() => {
        setAlerts(mockAlerts);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError("Failed to load alerts");
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      // Update local state
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
      
      // Later: Call real API
      // await fetch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
      //   method: 'POST'
      // });
      
    } catch (err) {
      setError("Failed to acknowledge alert");
    }
  };

  const dismissAlert = async (alertId) => {
    try {
      // Update local state
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      
      // Later: Call real API
      // await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
      //   method: 'DELETE'
      // });
      
    } catch (err) {
      setError("Failed to dismiss alert");
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityBgColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return '#fef2f2';
      case 'medium': return '#fffbeb';
      case 'low': return '#f0fdf4';
      default: return '#f9fafb';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === "all" || alert.priority === filter;
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const alertStats = {
    total: alerts.length,
    high: alerts.filter(a => a.priority === 'high').length,
    medium: alerts.filter(a => a.priority === 'medium').length,
    low: alerts.filter(a => a.priority === 'low').length,
    unacknowledged: alerts.filter(a => !a.acknowledged).length
  };

  return (
    <div className="alert-management-container">
      <div className="alert-header">
        <div className="header-content">
          <div className="header-icon">
            <FaBell />
          </div>
          <div>
            <h1>Alert Management</h1>
            <p>Monitor and manage your health alerts and notifications</p>
          </div>
        </div>
        <div className="alert-stats">
          <div className="stat-item">
            <span className="stat-value">{alertStats.unacknowledged}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item high">
            <span className="stat-value">{alertStats.high}</span>
            <span className="stat-label">High</span>
          </div>
        </div>
      </div>

      <div className="alert-content">
        {/* Filters and Search */}
        <div className="controls-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({alertStats.total})
            </button>
            <button 
              className={`filter-btn high ${filter === 'high' ? 'active' : ''}`}
              onClick={() => setFilter('high')}
            >
              High ({alertStats.high})
            </button>
            <button 
              className={`filter-btn medium ${filter === 'medium' ? 'active' : ''}`}
              onClick={() => setFilter('medium')}
            >
              Medium ({alertStats.medium})
            </button>
            <button 
              className={`filter-btn low ${filter === 'low' ? 'active' : ''}`}
              onClick={() => setFilter('low')}
            >
              Low ({alertStats.low})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading alerts...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <FaExclamationTriangle />
            <p>{error}</p>
            <button onClick={loadAlerts} className="retry-btn">Retry</button>
          </div>
        )}

        {/* Alerts List */}
        {!loading && !error && (
          <div className="alerts-list">
            {filteredAlerts.length === 0 ? (
              <div className="empty-state">
                <FaBell />
                <h3>No alerts found</h3>
                <p>No alerts match your current filters</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`alert-card ${alert.priority} ${alert.acknowledged ? 'acknowledged' : ''}`}
                  style={{ backgroundColor: getPriorityBgColor(alert.priority) }}
                >
                  <div className="alert-left">
                    <div 
                      className="priority-indicator"
                      style={{ backgroundColor: getPriorityColor(alert.priority) }}
                    ></div>
                    <div className="alert-content">
                      <div className="alert-header-info">
                        <h4 className="alert-title">{alert.title}</h4>
                        <div className="alert-meta">
                          <span className="timestamp">
                            <FaClock />
                            {formatTimestamp(alert.timestamp)}
                          </span>
                          <span className={`priority-badge ${alert.priority}`}>
                            {alert.priority.toUpperCase()}
                          </span>
                          {alert.action_required && (
                            <span className="action-badge">Action Required</span>
                          )}
                        </div>
                      </div>
                      <p className="alert-message">{alert.message}</p>
                    </div>
                  </div>
                  
                  <div className="alert-actions">
                    {!alert.acknowledged && (
                      <button 
                        className="acknowledge-btn"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <FaCheckCircle />
                        Acknowledge
                      </button>
                    )}
                    <button 
                      className="dismiss-btn"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertManagement;
