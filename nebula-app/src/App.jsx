import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

function Requests() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
      if (body.request) setTickets(prev => [body.request, ...prev])
      setText('')
      setPhotoUrl('')
      setTenantId('')
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="tab-content">
      <div className="section">
        <h2>Submit a New Request</h2>
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
            />
          </div>
          <div className="form-group">
            <label htmlFor="photoUrl">Photo URL (optional)</label>
            <input 
              id="photoUrl"
              type="url"
              value={photoUrl} 
              onChange={e => setPhotoUrl(e.target.value)} 
              placeholder="https://example.com/photo.jpg"
            />
          </div>
          <div className="form-group">
            <label htmlFor="tenantId">Tenant ID (optional)</label>
            <input 
              id="tenantId"
              value={tenantId} 
              onChange={e => setTenantId(e.target.value)} 
              placeholder="Enter your tenant ID"
            />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
            <button type="button" onClick={loadTickets} className="btn btn-secondary">
              Refresh
            </button>
          </div>
        </form>
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="section">
        <h2>Recent Requests</h2>
        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">No requests yet — submit one above.</div>
        ) : (
          <div className="tickets-list">
            {tickets.map(t => (
              <div key={t.id} className="ticket-card">
                <div className="ticket-header">
                  <span className="ticket-category">{t.category ?? 'Uncategorized'}</span>
                  <span className="ticket-date">
                    {t.created_at ? new Date(t.created_at).toLocaleString() : ''}
                  </span>
                </div>
                <p className="ticket-description">{t.description}</p>
                <div className="ticket-meta">
                  <span className={`status status-${t.status?.toLowerCase()}`}>
                    {t.status}
                  </span>
                  <span className={`severity severity-${t.severity?.toLowerCase()}`}>
                    {t.severity}
                  </span>
                </div>
                {t.photo_url && (
                  <div className="ticket-photo">
                    <img src={t.photo_url} alt="Request photo" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MaintenanceTimes() {
  return (
    <div className="tab-content">
      <div className="section">
        <h2>Maintenance Times</h2>
        <div className="maintenance-info">
          <div className="info-card">
            <h3>Regular Maintenance Hours</h3>
            <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
            <p>Saturday: 9:00 AM - 3:00 PM</p>
            <p>Sunday: Emergency only</p>
          </div>
          <div className="info-card">
            <h3>Emergency Maintenance</h3>
            <p>Available 24/7 for urgent issues</p>
            <p>Call: (555) 123-MAINT</p>
          </div>
          <div className="info-card">
            <h3>Scheduled Maintenance</h3>
            <p>Monthly building inspections: First Monday of each month</p>
            <p>HVAC maintenance: Quarterly</p>
            <p>Elevator service: Bi-weekly</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Payments() {
  return (
    <div className="tab-content">
      <div className="section">
        <h2>Payment Center</h2>
        <div className="payment-info">
          <div className="info-card">
            <h3>Current Balance</h3>
            <div className="balance-display">
              <span className="balance-amount">$0.00</span>
              <p>No outstanding payments</p>
            </div>
          </div>
          <div className="info-card">
            <h3>Payment Methods</h3>
            <p>Credit Card, Bank Transfer, Check</p>
            <button className="btn btn-primary">Add Payment Method</button>
          </div>
          <div className="info-card">
            <h3>Payment History</h3>
            <p>No recent payments to display</p>
            <button className="btn btn-secondary">View Full History</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to Nebula PM Chat! How can we help you today?", sender: 'system', timestamp: new Date() }
  ])
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    
    const message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    }
    
    setMessages([...messages, message])
    setNewMessage('')
    
    // Simulate response
    setTimeout(() => {
      const response = {
        id: messages.length + 2,
        text: "Thank you for your message. Our team will get back to you shortly.",
        sender: 'system',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, response])
    }, 1000)
  }

  return (
    <div className="tab-content">
      <div className="section">
        <h2>Live Chat Support</h2>
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  {message.text}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="message-input"
            />
            <button type="submit" className="btn btn-primary">Send</button>
          </form>
        </div>
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
    { id: 4, title: "System Update", message: "Nebula PM has been updated with new features", time: "2 days ago", type: "system" }
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

function HomeScreen({ onNavigate }) {
  const mainTabs = [
    { 
      id: 'requests', 
      label: 'Requests', 
      icon: '📋', 
      description: 'Submit and track maintenance requests',
      color: 'blue',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    { 
      id: 'maintenance', 
      label: 'Maintenance Times', 
      icon: '🕒', 
      description: 'View maintenance schedules and hours',
      color: 'purple',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
    },
    { 
      id: 'payments', 
      label: 'Payments', 
      icon: '💳', 
      description: 'Manage payments and billing',
      color: 'pink',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)'
    },
    { 
      id: 'chat', 
      label: 'Chat Support', 
      icon: '💬', 
      description: 'Get help from our support team',
      color: 'red',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)'
    }
  ]

  return (
    <div className="home-screen">
      <div className="home-content">
        <div className="welcome-section">
          <h1 className="welcome-title">
            <span className="welcome-icon">🏢</span>
            Welcome to Nebula PM
          </h1>
          <p className="welcome-subtitle">
            Your comprehensive property management solution
          </p>
        </div>
        
        <div className="tabs-grid">
          {mainTabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`tab-card tab-card-${tab.color}`}
              style={{ background: tab.gradient }}
            >
              <div className="tab-card-content">
                <div className="tab-card-icon">{tab.icon}</div>
                <h3 className="tab-card-title">{tab.label}</h3>
                <p className="tab-card-description">{tab.description}</p>
                <div className="tab-card-arrow">→</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Navigation Component
function Navigation({ currentView, onNavigate, onBackToHome }) {
  const topNavTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'help', label: 'Help', icon: '❓' }
  ]

  return (
    <div className="top-navigation">
      <div className="top-nav-content">
        <div className="top-nav-brand">
          <span className="brand-icon">🏢</span>
          <span className="brand-text">Nebula PM</span>
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
        {currentView !== 'home' && (
          <button onClick={onBackToHome} className="back-button">
            <span className="back-icon">←</span>
            Home
          </button>
        )}
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

  const handleBackToHome = () => {
    setCurrentView('home')
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />
      case 'requests':
        return <Requests />
      case 'maintenance':
        return <MaintenanceTimes />
      case 'payments':
        return <Payments />
      case 'chat':
        return <Chat />
      case 'dashboard':
        return <Dashboard />
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
        onBackToHome={handleBackToHome} 
      />

      <main className="app-main">
        {renderContent()}
      </main>
    </div>
  )
}