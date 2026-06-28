import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [team, setTeam] = useState('export')
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate('/')
      else setUser(data.user)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, color: '#1A3C6E' }}>Drishti Global — Shipment Portal</h1>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>{user?.email}</p>
        </div>
        <button onClick={handleLogout}
          style={{ padding: '8px 20px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          Logout
        </button>
      </div>

      {/* Team Toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, color: '#333' }}>
          {team === 'export' ? 'Export' : 'Import'} Shipments
        </h2>
        {team === 'export' && (
          <button onClick={() => navigate('/export-form')}
            style={{ padding: '10px 24px', background: '#2E7D32', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
            + New Export Shipment
          </button>
        )}
        {team === 'import' && (
          <button
            style={{ padding: '10px 24px', background: '#ccc', color: 'white', border: 'none', borderRadius: 6, cursor: 'not-allowed', fontWeight: 500 }}
            disabled>
            + New Import Shipment (Coming Soon)
          </button>
        )}
      </div>

      {/* Placeholder Table */}
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 40, textAlign: 'center', color: '#aaa' }}>
        <p style={{ fontSize: 15 }}>No shipments yet. Add your first one using the button above.</p>
      </div>

    </div>
  )
}