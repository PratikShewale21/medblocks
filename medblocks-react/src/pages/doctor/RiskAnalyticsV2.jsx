import React, { useMemo, useState } from 'react';
import { FaArrowDown, FaArrowUp, FaChartPie, FaDownload, FaLink, FaSearch, FaExclamationTriangle, FaUsers, FaRobot, FaExternalLinkAlt } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import './RiskAnalytics.css';

ChartJS.register(...registerables);

const RiskAnalyticsV2 = () => {
  const [timeFilter, setTimeFilter] = useState('1M');
  const [query, setQuery] = useState('');

  const metrics = [
    {
      title: 'Total Patients',
      value: '1,248',
      icon: <FaUsers />,
      iconColor: '#3B82F6',
      changeType: 'positive',
      changeIcon: <FaArrowUp />,
      changeText: '12% from last month'
    },
    {
      title: 'High Risk Patients',
      value: '87',
      icon: <FaExclamationTriangle />,
      iconColor: '#EF4444',
      changeType: 'positive',
      changeIcon: <FaArrowDown />,
      changeText: '5% from last month'
    },
    {
      title: 'Avg. Risk Score',
      value: '42.5',
      icon: <FaChartPie />,
      iconColor: '#F59E0B',
      changeType: 'negative',
      changeIcon: <FaArrowUp />,
      changeText: '2.3% from last month'
    },
    {
      title: 'AI Predictions',
      value: '94%',
      icon: <FaRobot />,
      iconColor: '#10B981',
      changeType: 'positive',
      changeIcon: <FaArrowUp />,
      changeText: '3% improvement'
    }
  ];

  const highRiskPatients = useMemo(
    () => [
      {
        initials: 'JD',
        name: 'John Doe',
        id: '#PT-1001',
        riskScore: 87,
        riskLevel: 'High Risk',
        riskLevelClass: 'risk-high',
        trend: '+12%',
        trendDir: 'up',
        lastCheckup: 'May 20, 2023'
      },
      {
        initials: 'AS',
        name: 'Alice Smith',
        id: '#PT-1002',
        riskScore: 73,
        riskLevel: 'Medium Risk',
        riskLevelClass: 'risk-medium',
        trend: '-5%',
        trendDir: 'down',
        lastCheckup: 'May 18, 2023'
      },
      {
        initials: 'RJ',
        name: 'Robert Johnson',
        id: '#PT-1003',
        riskScore: 92,
        riskLevel: 'Critical',
        riskLevelClass: 'risk-high',
        trend: '+18%',
        trendDir: 'up',
        lastCheckup: 'May 15, 2023'
      }
    ],
    []
  );

  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return highRiskPatients;
    return highRiskPatients.filter((p) => `${p.name} ${p.id} ${p.riskLevel}`.toLowerCase().includes(q));
  }, [highRiskPatients, query]);

  const trendData = useMemo(() => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    return {
      labels,
      datasets: [
        {
          label: 'High Risk',
          data: [12, 15, 18, 22, 25, 28, 32],
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        },
        {
          label: 'Medium Risk',
          data: [25, 28, 30, 32, 35, 38, 40],
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        },
        {
          label: 'Low Risk',
          data: [63, 60, 58, 55, 52, 50, 48],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }
      ]
    };
  }, []);

  const trendOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { drawBorder: false, color: '#E2E8F0' },
          ticks: {
            callback: (value) => `${value}%`
          }
        },
        x: { grid: { display: false } }
      }
    }),
    []
  );

  return (
    <>
      <div className="header">
        <div className="search-bar">
          <FaSearch style={{ color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search analytics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="wallet"><FaLink /> 0x71C...A4f</div>
        </div>
      </div>

      <div className="analytics-container">
        <h2>Risk Analytics Dashboard</h2>
        <p style={{ color: '#64748B', marginBottom: '25px' }}>Monitor and analyze patient risk factors and trends</p>

        <div className="metrics-grid">
          {metrics.map((m) => (
            <div className="metric-card" key={m.title}>
              <div className="metric-header">
                <div className="metric-title">{m.title}</div>
                <div className="metric-icon" style={{ color: m.iconColor }}>{m.icon}</div>
              </div>
              <div className="metric-value">{m.value}</div>
              <div className={`metric-change ${m.changeType}`}>
                {m.changeIcon} {m.changeText}
              </div>
            </div>
          ))}
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <div className="chart-title">Risk Score Trend</div>
            <div className="chart-actions">
              <div className="time-filter">
                {['1W', '1M', '3M', '1Y'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`time-btn ${timeFilter === t ? 'active' : ''}`}
                    onClick={() => setTimeFilter(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-wrapper">
            <Line data={trendData} options={trendOptions} />
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <div className="chart-title">High-Risk Patients</div>
            <button
              type="button"
              className="btn"
              style={{ background: '#F1F5F9', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => console.log('Export high-risk')}
            >
              <FaDownload /> Export
            </button>
          </div>

          <div className="table-responsive">
            <table className="risk-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Trend</th>
                  <th>Last Checkup</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="patient-info">
                        <div className="patient-avatar">{p.initials}</div>
                        <div>
                          <div className="patient-name">{p.name}</div>
                          <div className="patient-id">{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="risk-score">{p.riskScore}</td>
                    <td><span className={`risk-level ${p.riskLevelClass}`}>{p.riskLevel}</span></td>
                    <td>
                      <span className="risk-score">{p.trend}</span>
                      {p.trendDir === 'up' ? (
                        <FaArrowUp className="trend-icon trend-up" />
                      ) : (
                        <FaArrowDown className="trend-icon trend-down" />
                      )}
                    </td>
                    <td>{p.lastCheckup}</td>
                    <td>
                      <button className="action-btn" title="View Details" onClick={() => console.log('View', p.id)}>
                        <FaExternalLinkAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default RiskAnalyticsV2;
