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

export default function App() {
  const tabs = [
    { id: 'requests', label: 'Requests', icon: '📋' },
    { id: 'maintenance', label: 'Maintenance Times', icon: '🕒' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'chat', label: 'Chat', icon: '💬' }
  ]
  const [activeTab, setActiveTab] = useState('requests')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'requests':
        return <Requests />
      case 'maintenance':
        return <MaintenanceTimes />
      case 'payments':
        return <Payments />
      case 'chat':
        return <Chat />
      default:
        return <Requests />
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="logo">🏢</span>
            Nebula Property Management
          </h1>
          <nav className="tab-navigation">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main">
        {renderTabContent()}
      </main>
    </div>
  )
}