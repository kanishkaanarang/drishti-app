import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useNavigate } from 'react-router-dom'
import ShipmentList from './ShipmentList'

const STATUSES = [
  'All',
  'Booking Confirmed',
  'Cargo Picked Up',
  'Export Customs Clearance',
  'Cargo Handed to Carrier',
  'In Transit',
  'Transshipment',
  'Arrived at Destination',
  'Delivered'
]

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('')
  const [team, setTeam] = useState('export')
  const [filters, setFilters] = useState({
    status: 'All',
    dateFrom: '',
    dateTo: '',
    mode: 'All',
    bookingParty: '',
    queryNo: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate('/')
      else {
        setUser(data.user)
        // Fixed: read from app_metadata not user_metadata
        const r = data.user.app_metadata?.role || 'employee'
        setRole(r)
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const resetFilters = () => {
    setFilters({ status: 'All', dateFrom: '', dateTo: '', mode: 'All', bookingParty: '', queryNo: '' })
  }

  const activeFilterCount = [
    filters.status !== 'All',
    filters.dateFrom !== '',
    filters.dateTo !== '',
    filters.mode !== 'All',
    filters.bookingParty !== '',
    filters.queryNo !== ''
  ].filter(Boolean).length

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, color: '#1A3C6E' }}>Drishti Global — Shipment Portal</h1>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>
            {user?.email} &nbsp;•&nbsp;
            <span style={{
              background: role === 'admin' ? '#E8F5E9' : '#E3F2FD',
              color: role === 'admin' ? '#2E7D32' : '#0D47A1',
              padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
            }}>
              {role === 'admin' ? '⚙ Admin' : '👤 Employee'}
            </span>
          </p>
        </div>
        <button onClick={handleLogout}
          style={{ padding: '8px 20px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          Logout
        </button>
      </div>

      {/* Team Toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button onClick={() => setTeam('export')}
          style={{ padding: '10px 28px', background: team === 'export' ? '#1A3C6E' : '#eee', color: team === 'export' ? 'white' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
          Export Team
        </button>
        <button onClick={() => setTeam('import')}
          style={{ padding: '10px 28px', background: team === 'import' ? '#1A3C6E' : '#eee', color: team === 'import' ? 'white' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
          Import Team
        </button>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, color: '#333' }}>
          {team === 'export' ? 'Export' : 'Import'} Shipments
        </h2>
        <div style={{ display: 'flex', gap: 10 }}>
          {team === 'export' && role === 'admin' && (
            <button
              onClick={() => setShowFilters(f => !f)}
              style={{
                padding: '10px 20px',
                background: showFilters ? '#1A3C6E' : '#f5f5f5',
                color: showFilters ? 'white' : '#333',
                border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: 13
              }}>
              🔍 Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </button>
          )}
          {team === 'export' && (
            <button onClick={() => navigate('/export-form')}
              style={{ padding: '10px 24px', background: '#2E7D32', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
              + New Export Shipment
            </button>
          )}
          {team === 'import' && (
            <button disabled
              style={{ padding: '10px 24px', background: '#ccc', color: 'white', border: 'none', borderRadius: 6, cursor: 'not-allowed', fontWeight: 500 }}>
              + New Import Shipment (Coming Soon)
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel — admin only */}
      {showFilters && team === 'export' && role === 'admin' && (
        <div style={{
          background: '#F8F9FA', border: '1px solid #E0E0E0', borderRadius: 8,
          padding: 20, marginBottom: 20
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>

            {/* Status filter */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>STATUS</label>
              <select
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Mode filter */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>MODE</label>
              <select
                value={filters.mode}
                onChange={e => setFilters(f => ({ ...f, mode: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}>
                {['All', 'Air', 'Sea', 'Land'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>DATE FROM</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            {/* Date To */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>DATE TO</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            {/* Booking Party */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>BOOKING PARTY</label>
              <input
                type="text"
                placeholder="Search client..."
                value={filters.bookingParty}
                onChange={e => setFilters(f => ({ ...f, bookingParty: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            {/* Query No */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>QUERY NO</label>
              <input
                type="text"
                placeholder="Search query no..."
                value={filters.queryNo}
                onChange={e => setFilters(f => ({ ...f, queryNo: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

          </div>

          {/* Reset */}
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={resetFilters}
              style={{ padding: '8px 20px', background: 'white', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#555' }}>
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Shipment List */}
      {team === 'export' && <ShipmentList role={role} filters={filters} />}
      {team === 'import' && (
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 40, textAlign: 'center', color: '#aaa' }}>
          <p>Import team module coming soon.</p>
        </div>
      )}
    </div>
  )
}