import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

// Utility functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

function Requests() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [text, setText] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadTickets()
  }, [])

  async function loadTickets() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/tickets`)
      if (!res.ok) throw new Error(await res.text())
      const body = await res.json()
      setTickets(body.tickets ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text || text.length < 5) {
      setError('Please enter at least 5 characters of description')
      return
    }
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = { text, photoUrl: photoUrl || null, tenantId: tenantId || null }
      const res = await fetch(`${API_BASE}/tickets/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Request failed: ${res.status}`)
      }
      const body = await res.json()
      if (body.request) {
        setTickets(prev => [body.request, ...prev])
        setSuccess('Request submitted successfully!')
        setText('')
        setPhotoUrl('')
        setTenantId('')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="requests-page">
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-icon">📋</span>
          Maintenance Requests
        </h1>
        <p className="page-subtitle">Submit and track maintenance requests for your property</p>
      </div>

      <div className="requests-content">
        <div className="request-form-section">
          <div className="form-card">
            <h2 className="form-title">Submit a New Request</h2>
            <form onSubmit={handleSubmit} className="request-form">
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea 
                  id="description"
                  value={text} 
                  onChange={e => setText(e.target.value)} 
                  rows={4} 
                  placeholder="Describe your maintenance request in detail..."
                  required
                  className="form-textarea"
                />
                <div className="form-hint">Minimum 5 characters required</div>
              </div>
              <div className="form-group">
                <label htmlFor="photoUrl">Photo URL (optional)</label>
                <input 
                  id="photoUrl"
                  type="url"
                  value={photoUrl} 
                  onChange={e => setPhotoUrl(e.target.value)} 
                  placeholder="https://example.com/photo.jpg"
                  className="form-input"
                />
                <div className="form-hint">Add a photo to help us understand the issue better</div>
              </div>
              <div className="form-group">
                <label htmlFor="tenantId">Tenant ID (optional)</label>
                <input 
                  id="tenantId"
                  value={tenantId} 
                  onChange={e => setTenantId(e.target.value)} 
                  placeholder="Enter your tenant ID"
                  className="form-input"
                />
                <div className="form-hint">Your unique tenant identifier</div>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={submitting} className="btn btn-primary btn-large">
                  <span className="btn-icon">{submitting ? '⏳' : '📤'}</span>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button type="button" onClick={loadTickets} className="btn btn-secondary">
                  <span className="btn-icon">🔄</span>
                  Refresh
                </button>
              </div>
            </form>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
          </div>
        </div>

        <div className="tickets-section">
          <div className="section-header">
            <h2 className="section-title">Recent Requests</h2>
            <div className="ticket-stats">
              <span className="stat-item">
                <span className="stat-number">{tickets.length}</span>
                <span className="stat-label">Total Requests</span>
              </span>
              <span className="stat-item">
                <span className="stat-number">{tickets.filter(t => t.status === 'Triaged').length}</span>
                <span className="stat-label">Pending</span>
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading requests...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No requests yet</h3>
              <p>Submit your first maintenance request using the form above.</p>
            </div>
          ) : (
            <div className="tickets-grid">
              {tickets.map(t => (
                <div key={t.id} className="ticket-card">
                  <div className="ticket-header">
                    <div className="ticket-category-badge">
                      {t.category ?? 'Uncategorized'}
                    </div>
                    <div className="ticket-date">
                      {t.created_at ? formatDate(t.created_at) : ''}
                    </div>
                  </div>
                  <div className="ticket-content">
                    <p className="ticket-description">{t.description}</p>
                    {t.photo_url && (
                      <div className="ticket-photo">
                        <img src={t.photo_url} alt="Request photo" />
                      </div>
                    )}
                  </div>
                  <div className="ticket-footer">
                    <div className="ticket-status">
                      <span className={`status-badge status-${t.status?.toLowerCase()}`}>
                        {t.status}
                      </span>
                      <span className={`severity-badge severity-${t.severity?.toLowerCase()}`}>
                        {t.severity}
                      </span>
                    </div>
                    <div className="ticket-time">
                      {t.created_at ? formatTime(t.created_at) : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MaintenanceTimes() {
  const [tickets, setTickets] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, scheduled, completed

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      // Load tickets first
      const ticketsRes = await fetch(`${API_BASE}/tickets`)
      if (!ticketsRes.ok) throw new Error(await ticketsRes.text())
      const ticketsData = await ticketsRes.json()
      setTickets(ticketsData.tickets ?? [])
      
      // Try to load technicians, but don't fail if the table doesn't exist
      try {
        const techniciansRes = await fetch(`${API_BASE}/technicians`)
        if (techniciansRes.ok) {
          const techniciansData = await techniciansRes.json()
          setTechnicians(techniciansData.technicians ?? [])
        } else {
          // If technicians endpoint fails, just use empty array
          setTechnicians([])
        }
      } catch (technicianError) {
        // If technicians table doesn't exist, just use empty array
        setTechnicians([])
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Get technician name by ID
  const getTechnicianName = (technicianId) => {
    if (!technicianId) return 'Unassigned'
    const technician = technicians.find(t => t.id === technicianId)
    return technician ? technician.name : `Technician ${technicianId}`
  }

  // Categorize tickets by status and time
  const now = new Date()
  const categorizedTickets = {
    pending: tickets.filter(ticket => ticket.status === 'Triaged'),
    scheduled: tickets.filter(ticket => {
      if (ticket.status === 'Scheduled') return true
      if (ticket.scheduled_at) {
        const scheduledDate = new Date(ticket.scheduled_at)
        return scheduledDate >= now
      }
      return false
    }),
    completed: tickets.filter(ticket => ticket.status === 'Completed'),
    urgent: tickets.filter(ticket => ticket.severity === 'high' && ticket.status !== 'Completed')
  }

  const filteredTickets = filter === 'all' ? tickets : categorizedTickets[filter]

  const getStatusColor = (status, severity) => {
    if (status === 'Completed') return 'completed'
    if (status === 'Scheduled') return 'scheduled'
    if (severity === 'high') return 'urgent'
    return 'pending'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return '✅'
      case 'Scheduled': return '📅'
      case 'Triaged': return '⏳'
      default: return '🔧'
    }
  }

  if (loading) {
    return (
      <div className="maintenance-page">
        <div className="page-header">
          <h1 className="page-title">
            <span className="page-icon">🔧</span>
            Maintenance Schedule
          </h1>
          <p className="page-subtitle">View maintenance hours and scheduled services</p>
        </div>
        <div className="maintenance-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading maintenance data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="maintenance-page">
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-icon">🔧</span>
          Maintenance Schedule
        </h1>
        <p className="page-subtitle">View maintenance hours and scheduled services</p>
      </div>

      <div className="maintenance-content">
        {/* Filter Tabs */}
        <div className="maintenance-filters">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({tickets.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({categorizedTickets.pending.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'scheduled' ? 'active' : ''}`}
            onClick={() => setFilter('scheduled')}
          >
            Scheduled ({categorizedTickets.scheduled.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({categorizedTickets.completed.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'urgent' ? 'active' : ''}`}
            onClick={() => setFilter('urgent')}
          >
            Urgent ({categorizedTickets.urgent.length})
          </button>
        </div>

        {/* Maintenance Hours Info */}
        <div className="maintenance-info-section">
          <div className="maintenance-grid">
            <div className="maintenance-card">
              <div className="card-header">
                <div className="card-icon">⏰</div>
                <h3 className="card-title">Regular Hours</h3>
              </div>
              <div className="card-content">
                <div className="schedule-item">
                  <span className="schedule-days">Monday - Friday</span>
                  <span className="schedule-time">8:00 AM - 5:00 PM</span>
                </div>
                <div className="schedule-item">
                  <span className="schedule-days">Saturday</span>
                  <span className="schedule-time">9:00 AM - 3:00 PM</span>
                </div>
                <div className="schedule-item">
                  <span className="schedule-days">Sunday</span>
                  <span className="schedule-time">Emergency only</span>
                </div>
              </div>
            </div>

            <div className="maintenance-card emergency">
              <div className="card-header">
                <div className="card-icon">🚨</div>
                <h3 className="card-title">Emergency Service</h3>
              </div>
              <div className="card-content">
                <p className="emergency-text">Available 24/7 for urgent issues</p>
                <div className="contact-info">
                  <span className="contact-label">Emergency Hotline:</span>
                  <span className="contact-value">(555) 123-MAINT</span>
                </div>
                <div className="emergency-note">
                  <strong>Note:</strong> Emergency calls are for urgent safety issues only
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Requests List */}
        <div className="maintenance-requests-section">
          <h3 className="section-title">
            {filter === 'all' && 'All Maintenance Requests'}
            {filter === 'pending' && 'Pending Requests'}
            {filter === 'scheduled' && 'Scheduled Maintenance'}
            {filter === 'completed' && 'Completed Maintenance'}
            {filter === 'urgent' && 'Urgent Requests'}
          </h3>

          {error ? (
            <div className="alert alert-error">
              <p>Error loading maintenance requests: {error}</p>
              <button onClick={loadData} className="btn btn-sm">Retry</button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔧</div>
              <h3>No maintenance requests found</h3>
              <p>
                {filter === 'all' && 'No maintenance requests have been submitted yet.'}
                {filter === 'pending' && 'No pending maintenance requests found.'}
                {filter === 'scheduled' && 'No scheduled maintenance requests found.'}
                {filter === 'completed' && 'No completed maintenance requests found.'}
                {filter === 'urgent' && 'No urgent maintenance requests found.'}
              </p>
            </div>
          ) : (
            <div className="maintenance-requests-grid">
              {filteredTickets.map(ticket => (
                <div key={ticket.id} className={`maintenance-request-card ${getStatusColor(ticket.status, ticket.severity)}`}>
                  <div className="request-header">
                    <div className="request-status">
                      <span className="status-icon">{getStatusIcon(ticket.status)}</span>
                      <span className="status-text">{ticket.status}</span>
                    </div>
                    <div className="request-meta">
                      <span className="request-category">{ticket.category}</span>
                      <span className={`severity-badge ${ticket.severity}`}>
                        {ticket.severity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="request-content">
                    <p className="request-description">{ticket.description}</p>
                    {ticket.photo_url && (
                      <div className="request-photo">
                        <img src={ticket.photo_url} alt="Request photo" />
                      </div>
                    )}
                  </div>
                  
                  <div className="request-footer">
                    <div className="request-dates">
                      <div className="date-item">
                        <span className="date-label">Created:</span>
                        <span className="date-value">{formatDate(ticket.created_at)}</span>
                      </div>
                      {ticket.scheduled_at && (
                        <div className="date-item">
                          <span className="date-label">Scheduled:</span>
                          <span className="date-value">{formatDate(ticket.scheduled_at)}</span>
                        </div>
                      )}
                    </div>
                    <div className="request-technician">
                      <span className="technician-label">Technician:</span>
                      <span className="technician-name">{getTechnicianName(ticket.technician_id)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Payments() {
  const [balance] = useState(0.00)
  const [recentPayments] = useState([])
  
  return (
    <div className="payments-page">
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-icon">💳</span>
          Payment Center
        </h1>
        <p className="page-subtitle">Manage your payments and billing information</p>
      </div>

      <div className="payments-content">
        <div className="balance-section">
          <div className="balance-card">
            <div className="balance-header">
              <h2 className="balance-title">Current Balance</h2>
              <div className="balance-status">All caught up!</div>
            </div>
            <div className="balance-amount">
              <span className="currency">$</span>
              <span className="amount">{balance.toFixed(2)}</span>
            </div>
            <p className="balance-description">No outstanding payments at this time</p>
          </div>
        </div>

        <div className="payments-grid">
          <div className="payment-card">
            <div className="card-header">
              <div className="card-icon">💳</div>
              <h3 className="card-title">Payment Methods</h3>
            </div>
            <div className="card-content">
              <div className="payment-methods">
                <div className="method-item">
                  <span className="method-icon">💳</span>
                  <span className="method-name">Credit Card</span>
                  <span className="method-status">Active</span>
                </div>
                <div className="method-item">
                  <span className="method-icon">🏦</span>
                  <span className="method-name">Bank Transfer</span>
                  <span className="method-status">Active</span>
                </div>
                <div className="method-item">
                  <span className="method-icon">📄</span>
                  <span className="method-name">Check</span>
                  <span className="method-status">Active</span>
                </div>
              </div>
              <button className="btn btn-primary btn-full">
                <span className="btn-icon">➕</span>
                Add Payment Method
              </button>
            </div>
          </div>

          <div className="payment-card">
            <div className="card-header">
              <div className="card-icon">📊</div>
              <h3 className="card-title">Payment History</h3>
            </div>
            <div className="card-content">
              {recentPayments.length === 0 ? (
                <div className="empty-history">
                  <div className="empty-icon">📝</div>
                  <p>No recent payments to display</p>
                </div>
              ) : (
                <div className="payment-list">
                  {recentPayments.map((payment, index) => (
                    <div key={index} className="payment-item">
                      <div className="payment-info">
                        <span className="payment-description">{payment.description}</span>
                        <span className="payment-date">{payment.date}</span>
                      </div>
                      <span className="payment-amount">${payment.amount}</span>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn btn-secondary btn-full">
                <span className="btn-icon">📋</span>
                View Full History
              </button>
            </div>
          </div>

          <div className="payment-card">
            <div className="card-header">
              <div className="card-icon">⚙️</div>
              <h3 className="card-title">Billing Settings</h3>
            </div>
            <div className="card-content">
              <div className="setting-item">
                <span className="setting-label">Auto-pay</span>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <span className="setting-label">Email notifications</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <span className="setting-label">Paperless billing</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Chat() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Welcome to Nebula STAT Chat! How can we help you today?", 
      sender: 'system', 
      timestamp: new Date(),
      avatar: '🤖'
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    
    const message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      avatar: '👤'
    }
    
    setMessages(prev => [...prev, message])
    setNewMessage('')
    setIsTyping(true)
    
    // Simulate response
    setTimeout(() => {
      const responses = [
        "Thank you for your message. Our team will get back to you shortly.",
        "I understand your concern. Let me help you with that.",
        "That's a great question! Let me check our records for you.",
        "I'll forward this to our maintenance team right away.",
        "Is there anything else I can help you with today?"
      ]
      
      const response = {
        id: messages.length + 2,
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'system',
        timestamp: new Date(),
        avatar: '🤖'
      }
      setMessages(prev => [...prev, response])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="chat-page">
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-icon">💬</span>
          Live Chat Support
        </h1>
        <p className="page-subtitle">Get instant help from our support team</p>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-status">
            <div className="status-indicator online"></div>
            <span className="status-text">Support team online</span>
          </div>
          <div className="chat-actions">
            <button className="btn btn-secondary btn-sm">
              <span className="btn-icon">📞</span>
              Call Support
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-avatar">
                {message.avatar}
              </div>
              <div className="message-bubble">
                <div className="message-content">
                  {message.text}
                </div>
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message system">
              <div className="message-avatar">🤖</div>
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="chat-input">
          <div className="input-group">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="message-input"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="btn btn-primary send-button"
              disabled={!newMessage.trim() || isTyping}
            >
              <span className="btn-icon">📤</span>
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// New Page Components
function Dashboard() {
  return (
    <div className="tab-content">
      <div className="section">
        <h2>Dashboard</h2>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>📊 Overview</h3>
            <p>Welcome to your property management dashboard. Here you can see all your key metrics and recent activity.</p>
          </div>
          <div className="dashboard-card">
            <h3>🏠 Properties</h3>
            <p>Manage your properties, view occupancy rates, and track maintenance schedules.</p>
          </div>
          <div className="dashboard-card">
            <h3>💰 Financials</h3>
            <p>Track rent collection, expenses, and financial performance across all properties.</p>
          </div>
          <div className="dashboard-card">
            <h3>📈 Analytics</h3>
            <p>View detailed reports and analytics to make informed decisions about your properties.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Notifications() {
  const notifications = [
    { id: 1, title: "New Maintenance Request", message: "A new maintenance request has been submitted for Unit 3A", time: "2 hours ago", type: "maintenance" },
    { id: 2, title: "Payment Received", message: "Rent payment received from John Smith for Unit 2B", time: "4 hours ago", type: "payment" },
    { id: 3, title: "Scheduled Maintenance", message: "HVAC maintenance scheduled for tomorrow at 10 AM", time: "1 day ago", type: "schedule" },
    { id: 4, title: "System Update", message: "Nebula STAT has been updated with new features", time: "2 days ago", type: "system" }
  ]

  return (
    <div className="tab-content">
      <div className="section">
        <h2>Notifications</h2>
        <div className="notifications-list">
          {notifications.map(notification => (
            <div key={notification.id} className={`notification-card notification-${notification.type}`}>
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Profile() {
  return (
    <div className="tab-content">
      <div className="section">
        <h2>Profile Settings</h2>
        <div className="profile-content">
          <div className="profile-info">
            <div className="profile-avatar">
              <span className="avatar-icon">👤</span>
            </div>
            <div className="profile-details">
              <h3>John Doe</h3>
              <p>Property Manager</p>
              <p>john.doe@nebula-pm.com</p>
            </div>
          </div>
          <div className="profile-sections">
            <div className="profile-section">
              <h4>Personal Information</h4>
              <p>Update your personal details and contact information.</p>
              <button className="btn btn-secondary">Edit Profile</button>
            </div>
            <div className="profile-section">
              <h4>Account Settings</h4>
              <p>Manage your account preferences and security settings.</p>
              <button className="btn btn-secondary">Account Settings</button>
            </div>
            <div className="profile-section">
              <h4>Notifications</h4>
              <p>Configure how you receive notifications and updates.</p>
              <button className="btn btn-secondary">Notification Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Settings() {
  return (
    <div className="tab-content">
      <div className="section">
        <h2>Settings</h2>
        <div className="settings-grid">
          <div className="settings-card">
            <h3>🔧 General Settings</h3>
            <p>Configure general application preferences and display options.</p>
            <button className="btn btn-primary">Configure</button>
          </div>
          <div className="settings-card">
            <h3>🔔 Notification Preferences</h3>
            <p>Set up how and when you want to receive notifications.</p>
            <button className="btn btn-primary">Configure</button>
          </div>
          <div className="settings-card">
            <h3>🔒 Security Settings</h3>
            <p>Manage your password, two-factor authentication, and security options.</p>
            <button className="btn btn-primary">Configure</button>
          </div>
          <div className="settings-card">
            <h3>🎨 Appearance</h3>
            <p>Customize the look and feel of your dashboard and interface.</p>
            <button className="btn btn-primary">Configure</button>
          </div>
          <div className="settings-card">
            <h3>📊 Data & Privacy</h3>
            <p>Control your data sharing preferences and privacy settings.</p>
            <button className="btn btn-primary">Configure</button>
          </div>
          <div className="settings-card">
            <h3>🔄 Integrations</h3>
            <p>Connect with third-party services and manage API integrations.</p>
            <button className="btn btn-primary">Configure</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Help() {
  return (
    <div className="tab-content">
      <div className="section">
        <h2>Help & Support</h2>
        <div className="help-content">
          <div className="help-search">
            <input type="text" placeholder="Search help articles..." className="help-search-input" />
            <button className="btn btn-primary">Search</button>
          </div>
          <div className="help-sections">
            <div className="help-section">
              <h3>📚 Getting Started</h3>
              <ul>
                <li><a href="#">How to submit a maintenance request</a></li>
                <li><a href="#">Setting up your profile</a></li>
                <li><a href="#">Understanding the dashboard</a></li>
                <li><a href="#">Payment processing guide</a></li>
              </ul>
            </div>
            <div className="help-section">
              <h3>🔧 Common Issues</h3>
              <ul>
                <li><a href="#">Troubleshooting login problems</a></li>
                <li><a href="#">Payment processing errors</a></li>
                <li><a href="#">Notification not working</a></li>
                <li><a href="#">Mobile app issues</a></li>
          </ul>
            </div>
            <div className="help-section">
              <h3>📞 Contact Support</h3>
              <p>Need more help? Our support team is here for you.</p>
              <div className="contact-options">
                <button className="btn btn-primary">Live Chat</button>
                <button className="btn btn-secondary">Email Support</button>
                <button className="btn btn-secondary">Phone: (555) 123-HELP</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modern Landing Home Page
function HomeScreen({ onNavigate }) {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <div className="hero-particles"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              Trusted by 100+ Properties
            </div>
            <h1 className="hero-title">
              <span className="title-highlight">Nebula</span> STAT
              <span className="title-sub">Smart Home Technology & Property Management</span>
            </h1>
            <p className="hero-description">
              Your all-in-one smart home technology and property management platform. We combine smart 
              thermostats, climate control, tech integration, and comprehensive home care—from plumbing 
              to HVAC to emergency services.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">100+</span>
                <span className="stat-label">Properties Managed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">200+</span>
                <span className="stat-label">Happy Tenants</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">95%</span>
                <span className="stat-label">Occupancy Rate</span>
              </div>
            </div>
            <div className="hero-actions">
              <button 
                className="cta-primary"
                onClick={() => onNavigate('dashboard')}
              >
                <span className="cta-icon">🚀</span>
                Launch Dashboard
                <span className="cta-arrow">→</span>
              </button>
              <button 
                className="cta-secondary"
                onClick={() => onNavigate('help')}
              >
                <span className="cta-icon">📖</span>
                View Demo
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="preview-title">Nebula Dashboard</div>
              </div>
              <div className="preview-content">
                <div className="preview-widgets">
                  <div className="preview-widget small"></div>
                  <div className="preview-widget large"></div>
                  <div className="preview-widget medium"></div>
                  <div className="preview-widget small"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Complete Smart Home & Property Solutions</h2>
            <p className="section-subtitle">
              Comprehensive services for homeowners and property investors
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card" onClick={() => onNavigate('requests')}>
              <div className="feature-icon">🌡️</div>
              <h3>Smart Thermostats</h3>
              <p>Climate control and tech integration with intelligent monitoring</p>
              <div className="feature-badge">New</div>
            </div>
            <div className="feature-card" onClick={() => onNavigate('maintenance')}>
              <div className="feature-icon">🔧</div>
              <h3>HVAC & Electrical</h3>
              <p>Complete heating, cooling, and electrical maintenance services</p>
            </div>
            <div className="feature-card" onClick={() => onNavigate('maintenance')}>
              <div className="feature-icon">💧</div>
              <h3>Plumbing & Repairs</h3>
              <p>Expert plumbing services and emergency repairs available 24/7</p>
            </div>
            <div className="feature-card" onClick={() => onNavigate('payments')}>
              <div className="feature-icon">💳</div>
              <h3>Service Plans</h3>
              <p>Flexible tiers from Starter to Elite starting at $299</p>
            </div>
            <div className="feature-card" onClick={() => onNavigate('dashboard')}>
              <div className="feature-icon">🏠</div>
              <h3>Property Marketplace</h3>
              <p>Hand-picked rental properties with real-time performance metrics</p>
            </div>
            <div className="feature-card" onClick={() => onNavigate('dashboard')}>
              <div className="feature-icon">📊</div>
              <h3>Investor Dashboard</h3>
              <p>Track yield, IRR, occupancy rates, and rental income in real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <h2 className="about-title">Why Choose Nebula STAT?</h2>
            <p className="about-description">
              Nebula STAT combines smart home technology with comprehensive property management. 
              From smart thermostats and climate control to plumbing, HVAC, electrical, and emergency 
              services—we offer convenient, all-in-one home maintenance with tiered service plans.
            </p>
            <div className="about-features">
              <div className="about-feature">
                <div className="feature-check">✓</div>
                <span>Smart home technology & climate control</span>
              </div>
              <div className="about-feature">
                <div className="feature-check">✓</div>
                <span>24/7 emergency repair services</span>
              </div>
              <div className="about-feature">
                <div className="feature-check">✓</div>
                <span>Flexible service plans starting at $19.99/month</span>
              </div>
              <div className="about-feature">
                <div className="feature-check">✓</div>
                <span>Property marketplace with 5-12% rental yields</span>
              </div>
            </div>
            <button 
              className="about-cta"
              onClick={() => onNavigate('dashboard')}
            >
              Get Started Today
              <span className="cta-arrow">→</span>
            </button>
            <div className="about-visual">
              <div className="about-image">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80" 
                  alt="Happy family in their home" 
                />
                <div className="image-overlay">
                  <div className="overlay-stats">
                    <div className="overlay-stat">
                      <span className="stat-number">100</span>
                      <span className="stat-label">Properties</span>
                    </div>
                    <div className="overlay-stat">
                      <span className="stat-number">200+</span>
                      <span className="stat-label">Tenants</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Property Management?</h2>
            <p className="cta-description">
              Join thousands of property managers who trust Nebula to streamline their operations
            </p>
            <div className="cta-actions">
              <button 
                className="cta-primary large"
                onClick={() => onNavigate('dashboard')}
              >
                <span className="cta-icon">🚀</span>
                Start Free Trial
                <span className="cta-arrow">→</span>
              </button>
              <button 
                className="cta-secondary large"
                onClick={() => onNavigate('help')}
              >
                <span className="cta-icon">📞</span>
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Enhanced Dashboard Page
function DashboardPage({ onNavigate }) {
  const [thermostat, setThermostat] = useState({ unitId: 'Unit 12B', currentTemp: 72, targetTemp: 70, mode: 'Cooling', status: 'Running', humidity: 45, fan: 'Auto', filterLife: 80, battery: 90, alerts: [ { id: 1, code: 'PM-HVAC-001', message: 'Compressor running longer than usual.', severity: 'Medium', timestamp: new Date(Date.now() - 3600000) }, { id: 2, code: 'PM-TEMP-002', message: 'Temperature sensor anomaly detected.', severity: 'High', timestamp: new Date(Date.now() - 86400000) }, { id: 3, code: 'PM-FILT-003', message: 'Air filter needs replacement soon.', severity: 'Low', timestamp: new Date(Date.now() - 172800000) }, ], });
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [scheduledAlertId, setScheduledAlertId] = useState(null);

  const handleScheduleAlert = (alertId) => { console.log(`Scheduling tech for alert ${alertId}...`); setScheduledAlertId(alertId); };
  const handleDismissAlert = (alertId) => { console.log(`Dismissing alert ${alertId}...`); setThermostat(prev => ({ ...prev, alerts: (prev.alerts || []).filter(alert => alert.id !== alertId) })); setScheduledAlertId(null); };
  const formatAlertTime = (date) => { const now = new Date(); const alertDate = new Date(date); if (isNaN(alertDate)) return 'Invalid date'; const diffMs = now - alertDate; const diffHours = Math.round(diffMs / (1000 * 60 * 60)); const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)); if (diffMs < 0) return 'Future date'; if (diffHours < 1) return 'Just now'; if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`; else return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`; };
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadTickets()
  }, [])

  async function loadTickets() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/tickets`)
      if (!res.ok) throw new Error(await res.text())
      const body = await res.json()
      setTickets(body.tickets ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate maintenance statistics from real data
  const maintenanceStats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'Triaged').length,
    scheduled: tickets.filter(t => t.status === 'Scheduled').length,
    completed: tickets.filter(t => t.status === 'Completed').length,
    highPriority: tickets.filter(t => t.severity === 'high').length,
    urgent: tickets.filter(t => t.severity === 'high' && t.status === 'Triaged').length
  }

  // Enhanced sample data for other sections
  const dashboardStats = {
    totalProperties: 100,
    totalUnits: 400,
    occupancyRate: 95.5,
    totalRevenue: 520000,
    monthlyRevenue: 52000,
    pendingRequests: maintenanceStats.pending,
    completedRequests: maintenanceStats.completed,
    overduePayments: 8,
    maintenanceScheduled: maintenanceStats.scheduled
  }

  const recentActivity = [
    { id: 1, type: "request", message: "New maintenance request from Unit 3A - Leaky faucet", time: "2 hours ago", priority: "medium", unit: "3A" },
    { id: 2, type: "payment", message: "Payment received from John Smith - $1,200", time: "4 hours ago", amount: 1200, unit: "2B" },
    { id: 3, type: "maintenance", message: "HVAC maintenance completed in Unit 1C", time: "6 hours ago", status: "completed", unit: "1C" },
    { id: 4, type: "tenant", message: "New tenant application for Unit 4B", time: "1 day ago", status: "pending", unit: "4B" },
    { id: 5, type: "alert", message: "Overdue payment reminder sent to Unit 2A", time: "1 day ago", priority: "high", unit: "2A" }
  ]

  const financialData = {
    monthlyRevenue: 52000,
    totalRevenue: 520000,
    expenses: 13000,
    netIncome: 39000,
    occupancyRate: 95.5,
    averageRent: 1300,
    collectionRate: 97.2
  }

  // Convert real tickets to maintenance data format
  const getMaintenanceData = () => {
    return tickets.slice(0, 4).map(ticket => {
      const createdDate = new Date(ticket.created_at)
      const now = new Date()
      const daysSinceCreated = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24))
      
      return {
        id: ticket.id,
        unit: `Unit ${ticket.tenant_id || 'N/A'}`,
        issue: ticket.description,
        priority: ticket.severity === 'high' ? 'High' : ticket.severity === 'medium' ? 'Medium' : 'Low',
        daysLeft: Math.max(0, 7 - daysSinceCreated), // Assume 7 days to complete
        assignedTo: ticket.technician_id ? `Technician ${ticket.technician_id}` : 'Unassigned',
        status: ticket.status.toLowerCase().replace('_', ' ')
      }
    })
  }

  const upcomingEvents = [
    { id: 1, title: "Building Inspection", date: "Tomorrow 10:00 AM", type: "inspection", location: "Main Building" },
    { id: 2, title: "Fire Safety Drill", date: "Friday 2:00 PM", type: "safety", location: "All Buildings" },
    { id: 3, title: "New Tenant Orientation", date: "Next Monday 9:00 AM", type: "tenant", location: "Office" },
    { id: 4, title: "Maintenance Training", date: "Next Wednesday 1:00 PM", type: "training", location: "Conference Room" }
  ]

  const propertyPerformance = [
    { name: "Sunset Apartments", occupancy: 96, revenue: 15200, maintenance: 2100, rating: 4.8 },
    { name: "Garden View Complex", occupancy: 94, revenue: 13800, maintenance: 1800, rating: 4.7 },
    { name: "Downtown Plaza", occupancy: 98, revenue: 16800, maintenance: 2400, rating: 4.9 },
    { name: "Ocean Breeze Estates", occupancy: 97, revenue: 14500, maintenance: 1900, rating: 4.8 }
  ]

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="dashboard-title">
              <span className="dashboard-icon">📊</span>
              Property Management Dashboard
            </h1>
            <p className="dashboard-subtitle">
              Welcome back! Here's what's happening with your properties today.
            </p>
          </div>
          <div className="header-right">
            <div className="date-time">
              <span className="date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="time">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
        
        {/* Key Metrics Row */}
        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-icon">🏢</div>
            <div className="metric-content">
              <span className="metric-number">{dashboardStats.totalProperties}</span>
              <span className="metric-label">Properties</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🏠</div>
            <div className="metric-content">
              <span className="metric-number">{dashboardStats.totalUnits}</span>
              <span className="metric-label">Total Units</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📈</div>
            <div className="metric-content">
              <span className="metric-number">{dashboardStats.occupancyRate}%</span>
              <span className="metric-label">Occupancy Rate</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">💰</div>
            <div className="metric-content">
              <span className="metric-number">${dashboardStats.monthlyRevenue.toLocaleString()}</span>
              <span className="metric-label">Monthly Revenue</span>
            </div>
          </div>
        </div>

        {/* Maintenance Statistics Row */}
        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-icon">🔧</div>
            <div className="metric-content">
              <span className="metric-number">{maintenanceStats.total}</span>
              <span className="metric-label">Total Requests</span>
            </div>
          </div>
          <div className="metric-card urgent">
            <div className="metric-icon">⚠️</div>
            <div className="metric-content">
              <span className="metric-number">{maintenanceStats.urgent}</span>
              <span className="metric-label">Urgent</span>
            </div>
          </div>
          <div className="metric-card pending">
            <div className="metric-icon">⏳</div>
            <div className="metric-content">
              <span className="metric-number">{maintenanceStats.pending}</span>
              <span className="metric-label">Pending</span>
            </div>
          </div>
          <div className="metric-card completed">
            <div className="metric-icon">✅</div>
            <div className="metric-content">
              <span className="metric-number">{maintenanceStats.completed}</span>
              <span className="metric-label">Completed</span>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
        {/* --- FANCY & PROFESSIONAL SMART THERMOSTAT WIDGET --- */}
        <div className="widget widget-thermostat">
            {/* Header (retains previous good structure) */}
            <div className="widget-header">
              <div className="widget-icon">🔥</div>
              <h3>Smart Thermostat</h3>
              <div className="widget-unit">{thermostat?.unitId || 'N/A'}</div>
            </div>

            <div className="widget-content thermostat-professional-content">

              {/* SECTION 1: Current Temperature & Controls/Status */}
              <div className="thermostat-section thermostat-temp-status">
                <div className="current-temp-display-pro">
                  <span className="current-temp-pro">{thermostat?.currentTemp || '--'}°F</span>
                  <span className="target-temp-pro">Target: {thermostat?.targetTemp || '--'}°F</span>
                </div>
                <div className="mode-status-pro">
                  <div className="status-item-pro">
                    <span className="status-label-pro">Mode</span>
                    <span className="status-value-pro">{thermostat?.mode || 'N/A'}</span>
                  </div>
                  <div className="status-item-pro">
                    <span className="status-label-pro">Status</span>
                    <span className={`status-value-pro status-${thermostat?.status?.toLowerCase()}`}>{thermostat?.status || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Environmental Details (Humidity, Fan, Filter, Battery) */}
              <div className="thermostat-section thermostat-details-pro">
                <div className="detail-item-pro">
                  <span className="detail-icon-pro">💧</span>
                  <span className="detail-value-pro">{thermostat?.humidity || '--'}%</span>
                  <span className="detail-label-pro">Humidity</span>
                </div>
                 <div className="detail-item-pro">
                  <span className="detail-icon-pro">🌬️</span>
                  <span className="detail-value-pro">{thermostat?.fan || 'N/A'}</span>
                   <span className="detail-label-pro">Fan</span>
                </div>
                 <div className="detail-item-pro">
                  <span className="detail-icon-pro">🍃</span>
                   <span className="detail-value-pro">{thermostat?.filterLife || '--'}%</span>
                   <span className="detail-label-pro">Filter</span>
                </div>
                 <div className="detail-item-pro">
                  <span className="detail-icon-pro">🔋</span>
                  <span className="detail-value-pro">{thermostat?.battery || '--'}%</span>
                   <span className="detail-label-pro">Battery</span>
                </div>
              </div>

              {/* SECTION 3: Alert Summary (or No Alerts) */}
              {thermostat?.alerts && Array.isArray(thermostat.alerts) && thermostat.alerts.length > 0 ? (
                <div
                  className={`thermostat-section thermostat-alert-summary alert-${thermostat.alerts[0].severity?.toLowerCase()}`}
                  onClick={() => setShowAlertDetails(true)} /* Opens modal */
                >
                  <span className="alert-icon-pro">⚠️</span>
                  <div className="alert-content-pro">
                    <span className="alert-message-pro">
                      {thermostat.alerts.length} Active Alert{thermostat.alerts.length > 1 ? 's' : ''}!
                    </span>
                    <span className={`alert-severity-pro severity-${thermostat.alerts[0].severity?.toLowerCase()}`}>
                       Highest: {thermostat.alerts[0].severity}
                    </span>
                  </div>
                  <span className="alert-action-pro">View  →</span>
                </div>
              ) : (
                <div className="thermostat-section thermostat-no-alerts">
                  <span className="no-alert-icon-pro">✅</span>
                  <span className="no-alert-message-pro">No active alerts.</span>
                </div>
              )}

            </div> {/* End thermostat-professional-content */}
          </div>
          {/* --- END FANCY & PROFESSIONAL THERMOSTAT WIDGET --- */}
          {/* Recent Activity */}
          <div className="widget widget-activity" onClick={() => onNavigate('notifications')}>
            <div className="widget-header">
              <div className="widget-icon">🔔</div>
              <h3>Recent Activity</h3>
              <div className="widget-badge">{recentActivity.length}</div>
            </div>
            <div className="widget-content">
              <div className="activity-list">
                {recentActivity.slice(0, 4).map(activity => (
                  <div key={activity.id} className={`activity-item activity-${activity.type}`}>
                    <div className="activity-icon">
                      {activity.type === 'request' && '📋'}
                      {activity.type === 'payment' && '💳'}
                      {activity.type === 'maintenance' && '🔧'}
                      {activity.type === 'tenant' && '👤'}
                      {activity.type === 'alert' && '⚠️'}
                    </div>
                    <div className="activity-content">
                      <p className="activity-message">{activity.message}</p>
                      <div className="activity-meta">
                        <span className="activity-time">{activity.time}</span>
                        {activity.unit && <span className="activity-unit">{activity.unit}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="widget widget-financial" onClick={() => onNavigate('payments')}>
            <div className="widget-header">
              <div className="widget-icon">💳</div>
              <h3>Financial Overview</h3>
              <div className="widget-arrow">→</div>
            </div>
            <div className="widget-content">
              <div className="financial-summary">
                <div className="financial-item">
                  <span className="financial-label">Monthly Revenue</span>
                  <span className="financial-value positive">${financialData.monthlyRevenue.toLocaleString()}</span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Net Income</span>
                  <span className="financial-value positive">${financialData.netIncome.toLocaleString()}</span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Collection Rate</span>
                  <span className="financial-value positive">{financialData.collectionRate}%</span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Overdue Payments</span>
                  <span className="financial-value negative">{dashboardStats.overduePayments}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Status */}
          <div className="widget widget-maintenance" onClick={() => onNavigate('maintenance')}>
            <div className="widget-header">
              <div className="widget-icon">🔧</div>
              <h3>Maintenance Status</h3>
              <div className="widget-badge">{maintenanceStats.total}</div>
            </div>
            <div className="widget-content">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading maintenance requests...</p>
                </div>
              ) : error ? (
                <div className="alert alert-error">
                  <p>Error loading maintenance data: {error}</p>
                  <button onClick={loadTickets} className="btn btn-sm">Retry</button>
                </div>
              ) : tickets.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔧</div>
                  <h3>No maintenance requests</h3>
                  <p>Maintenance requests will appear here once submitted.</p>
                </div>
              ) : (
                <div className="maintenance-list">
                  {getMaintenanceData().slice(0, 3).map(maintenance => (
                    <div key={maintenance.id} className={`maintenance-item priority-${maintenance.priority.toLowerCase()}`}>
                      <div className="maintenance-info">
                        <span className="maintenance-unit">{maintenance.unit}</span>
                        <span className="maintenance-issue">{maintenance.issue}</span>
                        <span className="maintenance-assigned">Assigned: {maintenance.assignedTo}</span>
                      </div>
                      <div className="maintenance-meta">
                        <span className={`maintenance-priority priority-${maintenance.priority.toLowerCase()}`}>
                          {maintenance.priority}
                        </span>
                        <span className="maintenance-days">{maintenance.daysLeft}d</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="widget widget-events" onClick={() => onNavigate('notifications')}>
            <div className="widget-header">
              <div className="widget-icon">📅</div>
              <h3>Upcoming Events</h3>
              <div className="widget-badge">{upcomingEvents.length}</div>
            </div>
            <div className="widget-content">
              <div className="events-list">
                {upcomingEvents.slice(0, 3).map(event => (
                  <div key={event.id} className={`event-item event-${event.type}`}>
                    <div className="event-info">
                      <span className="event-title">{event.title}</span>
                      <span className="event-date">{event.date}</span>
                      <span className="event-location">{event.location}</span>
                    </div>
                    <div className={`event-type event-${event.type}`}>{event.type}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Property Performance */}
          <div className="widget widget-performance">
            <div className="widget-header">
              <div className="widget-icon">📊</div>
              <h3>Property Performance</h3>
            </div>
            <div className="widget-content">
              <div className="performance-list">
                {propertyPerformance.map((property, index) => (
                  <div key={index} className="performance-item">
                    <div className="performance-name">{property.name}</div>
                    <div className="performance-stats">
                      <div className="performance-stat">
                        <span className="stat-label">Occupancy</span>
                        <span className="stat-value">{property.occupancy}%</span>
                      </div>
                      <div className="performance-stat">
                        <span className="stat-label">Revenue</span>
                        <span className="stat-value">${property.revenue.toLocaleString()}</span>
                      </div>
                      <div className="performance-stat">
                        <span className="stat-label">Rating</span>
                        <span className="stat-value">⭐ {property.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="widget widget-actions">
            <div className="widget-header">
              <div className="widget-icon">⚡</div>
              <h3>Quick Actions</h3>
            </div>
            <div className="widget-content">
              <div className="action-grid">
                <button 
                  className="action-btn action-primary" 
                  onClick={(e) => { e.stopPropagation(); onNavigate('requests'); }}
                >
                  <span className="action-icon">📋</span>
                  New Request
                </button>
                <button 
                  className="action-btn action-secondary" 
                  onClick={(e) => { e.stopPropagation(); onNavigate('payments'); }}
                >
                  <span className="action-icon">💳</span>
                  Process Payment
                </button>
                <button 
                  className="action-btn action-secondary" 
                  onClick={(e) => { e.stopPropagation(); onNavigate('maintenance'); }}
                >
                  <span className="action-icon">🔧</span>
                  Schedule Maintenance
                </button>
                <button 
                  className="action-btn action-secondary" 
                  onClick={(e) => { e.stopPropagation(); onNavigate('chat'); }}
                >
                  <span className="action-icon">💬</span>
                  Tenant Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* --- RENDER THE ALERT MODAL CONDITIONALLY --- */}
      {showAlertDetails && (
        <AlertsModal
          alerts={thermostat.alerts}
          onClose={() => setShowAlertDetails(false)}
          onSchedule={handleScheduleAlert}
          onDismiss={handleDismissAlert}
          scheduledAlertId={scheduledAlertId}
          formatAlertTime={formatAlertTime}
        />
      )}
      {/* ------------------------------------------- */}
    </div>
  )
}

// Navigation Component
function Navigation({ currentView, onNavigate }) {
  const topNavTabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'help', label: 'Help', icon: '❓' }
  ]

  return (
    <div className="top-navigation">
      <div className="top-nav-content">
        <div className="top-nav-brand" onClick={() => onNavigate('home')}>
          <span className="brand-icon">🏢</span>
          <span className="brand-text">Nebula STAT</span>
        </div>
        <nav className="top-nav-tabs">
          {topNavTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`top-nav-tab ${currentView === tab.id ? 'active' : ''}`}
            >
              <span className="top-nav-icon">{tab.icon}</span>
              <span className="top-nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default function App() {
  const [currentView, setCurrentView] = useState('home')
  const [activeTab, setActiveTab] = useState('requests')

  const handleNavigate = (tabId) => {
    setCurrentView(tabId)
    if (['requests', 'maintenance', 'payments', 'chat'].includes(tabId)) {
      setActiveTab(tabId)
    }
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />
      case 'requests':
        return <Requests />
      case 'maintenance':
        return <MaintenanceTimes />
      case 'payments':
        return <Payments />
      case 'chat':
        return <Chat />
      case 'notifications':
        return <Notifications />
      case 'profile':
        return <Profile />
      case 'settings':
        return <Settings />
      case 'help':
        return <Help />
      default:
        return <HomeScreen onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="app">
      <Navigation 
        currentView={currentView} 
        onNavigate={handleNavigate} 
      />

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}