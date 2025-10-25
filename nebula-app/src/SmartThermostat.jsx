import React, { useState, useEffect } from 'react';

// --- Fake Data to simulate a smart thermostat ---
const mockThermostatData = {
  unitId: 'Unit 12B',
  currentTemp: 72,
  targetTemp: 70,
  mode: 'Cooling',
  humidity: 45,
  fan: 'Auto', 
  filterLife: 80, // percentage
  battery: 90, // percentage
  status: 'Running',
  dailyUsage: [
    { hour: 0, temp: 68 }, { hour: 4, temp: 69 }, { hour: 8, temp: 72 },
    { hour: 12, temp: 74 }, { hour: 16, temp: 71 }, { hour: 20, temp: 70 },
    { hour: 23, temp: 68 },
  ],
  alerts: [
    { id: 1, code: 'PM-HVAC-001', message: 'Compressor running longer than usual.', severity: 'Medium', timestamp: new Date(Date.now() - 3600000) },
    { id: 2, code: 'PM-TEMP-002', message: 'Temperature sensor anomaly detected.', severity: 'High', timestamp: new Date(Date.now() - 86400000) },
  ],
};
// -----------------------------------------------------------

// Simple component for showing a progress bar (Needed in both files)
function ProgressBar({ label, value, max, unit }) {
  const percentage = (value / max) * 100;
  return (
    <div className="progress-bar-container">
      <label>{label}</label>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
      </div>
      <span>{value}{unit}</span>
    </div>
  );
}

// Full Page Thermostat View (Default Export)
export default function SmartThermostat() {
  const [thermostat, setThermostat] = useState(mockThermostatData);
  const [scheduled, setScheduled] = useState(false); 
  const [alertDismissed, setAlertDismissed] = useState({});

  const handleSchedule = (alertId) => {
    console.log("Technician scheduling initiated for alert:", alertId);
    setScheduled(alertId);
  };

  const handleDismiss = (alertId) => {
    setAlertDismissed(prev => ({ ...prev, [alertId]: true }));
    console.log("Alert dismissed:", alertId);
  };

  const activeAlerts = (thermostat.alerts || []).filter(alert => !alertDismissed[alert.id]);

  return (
    <div className="tab-content thermostat-page">
      <div className="section">
        <h2>Smart Thermostat - {thermostat.unitId}</h2>
        <div className="thermostat-container-box">
          <div className="thermostat-dashboard full-page-grid">
            
            {/* 1. Current Status & Controls */}
            <div className="thermostat-card current-status">
              <h3>Current Status & Controls</h3>
              <div className="temp-display">
                <span className="current-temp">{thermostat.currentTemp}°F</span>
                <span className="target-temp">Target: {thermostat.targetTemp}°F</span>
              </div>
              <p>Mode: <span className={`status-${thermostat.mode.toLowerCase()}`}>{thermostat.mode}</span></p>
              <p>Status: <span className={`status-${thermostat.status.toLowerCase()}`}>{thermostat.status}</span></p>
              
              <div className="controls-group">
                <button className="btn btn-secondary btn-sm" disabled>Adjust Temp</button>
                <button className="btn btn-secondary btn-sm" disabled>Change Mode</button>
              </div>

            </div>

            {/* 2. Maintenance Status */}
            <div className="thermostat-card maintenance-card">
              <h3>Maintenance Metrics</h3>
              <ProgressBar label="Filter Life" value={thermostat.filterLife} max={100} unit="%" />
              <ProgressBar label="Battery" value={thermostat.battery} max={100} unit="%" />
              <p className="detail-item">
                <span className="detail-icon">💧</span> Humidity: <span className="detail-value">{thermostat.humidity}%</span>
              </p>
              <p className="detail-item">
                <span className="detail-icon">🌬️</span> Fan: <span className="detail-value">{thermostat.fan}</span>
              </p>
            </div>

            {/* 3. Alerts List */}
            <div className="thermostat-card alerts-list-card">
              <h3>{activeAlerts.length} Active Alerts</h3>
              {activeAlerts.length === 0 ? (
                <div className="empty-state">✅ No active alerts.</div>
              ) : (
                activeAlerts.map(alert => (
                  <div key={alert.id} className={`alert alert-${alert.severity.toLowerCase()} alert-item`}>
                    <h4>{alert.code} ({alert.severity})</h4>
                    <p>{alert.message}</p>
                    <div className="alert-actions">
                      {scheduled === alert.id ? (
                        <span className="scheduled-message">✅ Scheduled for Inspection</span>
                      ) : (
                        <>
                          <button onClick={() => handleSchedule(alert.id)} className="btn btn-warning btn-sm">
                            Schedule Tech
                          </button>
                          <button onClick={() => handleDismiss(alert.id)} className="btn btn-secondary btn-sm">
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* 4. Usage Chart */}
            <div className="thermostat-card usage-chart">
              <h3>Today's Temperature Trend</h3>
              <div className="mini-chart">
                {thermostat.dailyUsage.map(point => (
                  <div
                    key={point.hour}
                    className="chart-bar"
                    style={{ height: `${(point.temp - 65) * 5}px` }} 
                    title={`Hour ${point.hour}: ${point.temp}°F`}
                  ></div>
                ))}
              </div>
              <p className="chart-legend">Hourly Temperature (°F)</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Widget View (Named Export for DashboardPage)
export function ThermostatWidget({ thermostat, setShowAlertDetails, scheduledAlertId, formatAlertTime }) {
  if (!thermostat) return null;
  const { unitId, currentTemp, targetTemp, mode, status, humidity, fan, filterLife, battery, alerts } = thermostat;

  const activeAlerts = (alerts || []).filter(alert => alert.id !== scheduledAlertId);
  const highestSeverityAlert = activeAlerts.length > 0 ? activeAlerts[0] : null;

  return (
      <div className="thermostat-main-view">
        <div className="thermostat-card current-status">
            <div className="temp-info-grid">
                <div className="current-temp-display">
                    <span className="current-temp">{currentTemp || '--'}°F</span>
                    <span className="target-temp">Target: {targetTemp || '--'}°F</span>
                </div>
                <div className="status-mode-info">
                    <div className="status-item">
                        <span className="status-label">Mode:</span>
                        <span className="status-value">{mode || 'N/A'}</span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">Status:</span>
                        <span className={`status-value status-${status?.toLowerCase()}`}>{status || 'N/A'}</span>
                    </div>
                </div>
            </div>
            <div className="thermostat-details-grid">
                <div className="detail-item">
                    <span className="detail-icon">💧</span> <span className="detail-label">Humidity:</span> <span className="detail-value">{humidity || '--'}%</span>
                </div>
                <div className="detail-item">
                    <span className="detail-icon">🌬️</span> <span className="detail-label">Fan:</span> <span className="detail-value">{fan || 'N/A'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-icon">🍃</span> <span className="detail-label">Filter:</span> <span className="detail-value">{filterLife || '--'}%</span>
                </div>
                <div className="detail-item">
                    <span className="detail-icon">🔋</span> <span className="detail-label">Battery:</span> <span className="detail-value">{battery || '--'}%</span>
                </div>
            </div>
        </div>

        {/* Alert Summary */}
        {highestSeverityAlert ? (
            <div className={`thermostat-card alert-summary alert-${highestSeverityAlert.severity?.toLowerCase()}`}
                 onClick={() => setShowAlertDetails(true)}>
                <div className="alert-icon">⚠️</div>
                <div className="alert-content-summary">
                    <p className="alert-message-summary">
                        {activeAlerts.length} Active Alert{activeAlerts.length > 1 ? 's' : ''}!
                    </p>
                    <span className={`alert-severity-summary severity-${highestSeverityAlert.severity?.toLowerCase()}`}>
                        Highest: {highestSeverityAlert.severity}
                    </span>
                </div>
                <div className="alert-action-summary">View Details →</div>
            </div>
        ) : (
            <div className="thermostat-card no-alerts">
                <span className="no-alert-icon">✅</span>
                <span>No active thermostat alerts.</span>
            </div>
        )}
      </div>
  );
}
