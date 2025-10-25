import { useEffect, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

function App() {
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
      // prepend new ticket
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
    <div style={{ maxWidth: 900, margin: '32px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Nebula PM — Tickets</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Submit a new ticket</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
          <label>
            Description
            <textarea value={text} onChange={e => setText(e.target.value)} rows={4} style={{ width: '100%' }} />
          </label>
          <label>
            Photo URL (optional)
            <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label>
            Tenant ID (optional)
            <input value={tenantId} onChange={e => setTenantId(e.target.value)} style={{ width: '100%' }} />
          </label>
          <div>
            <button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit ticket'}</button>
            <button type="button" onClick={loadTickets} style={{ marginLeft: 8 }}>Refresh</button>
          </div>
        </form>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </section>

      <section>
        <h2>Recent tickets</h2>
        {loading ? (
          <p>Loading…</p>
        ) : tickets.length === 0 ? (
          <p>No tickets yet — submit one above.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {tickets.map(t => (
              <li key={t.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 8, borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <strong>{t.category ?? 'Uncategorized'}</strong>
                  <small>{new Date(t.created_at).toLocaleString()}</small>
                </div>
                <p style={{ margin: '8px 0' }}>{t.description}</p>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <small>Status: {t.status}</small>
                  <small>Severity: {t.severity}</small>
                </div>
                {t.photo_url && (
                  <div style={{ marginTop: 8 }}>
                    <img src={t.photo_url} alt="ticket" style={{ maxWidth: 240, borderRadius: 4 }} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default App
