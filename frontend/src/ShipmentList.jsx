import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useNavigate } from 'react-router-dom'

const STATUS_COLORS = {
  'Booking Confirmed':        { bg: '#E3F2FD', color: '#0D47A1' },
  'Cargo Picked Up':          { bg: '#F3E5F5', color: '#6A1B9A' },
  'Export Customs Clearance': { bg: '#FFF8E1', color: '#F57F17' },
  'Cargo Handed to Carrier':  { bg: '#FBE9E7', color: '#BF360C' },
  'In Transit':               { bg: '#E8F5E9', color: '#1B5E20' },
  'Transshipment':            { bg: '#E0F2F1', color: '#004D40' },
  'Arrived at Destination':   { bg: '#E8EAF6', color: '#1A237E' },
  'Delivered':                { bg: '#F1F8E9', color: '#33691E' },
}

export default function ShipmentList({ role, filters = {} }) {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [generatingReport, setGeneratingReport] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchShipments()
  }, [filters])

  const fetchShipments = async () => {
    setLoading(true)

    let query = supabase
      .from('export_shipments')
      .select('id, query_no, booking_party, shipper, commodity, shipment_status, created_at, is_locked, eta, destination_port, mode, ai_summary')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.status && filters.status !== 'All') {
      query = query.eq('shipment_status', filters.status)
    }
    if (filters.mode && filters.mode !== 'All') {
      query = query.ilike('mode', `%${filters.mode}%`)
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    if (filters.dateTo) {
      // Add 1 day to include the full end date
      const endDate = new Date(filters.dateTo)
      endDate.setDate(endDate.getDate() + 1)
      query = query.lte('created_at', endDate.toISOString())
    }
    if (filters.bookingParty) {
      query = query.ilike('booking_party', `%${filters.bookingParty}%`)
    }
    if (filters.queryNo) {
      query = query.ilike('query_no', `%${filters.queryNo}%`)
    }

    const { data, error } = await query
    if (!error) setShipments(data)
    setLoading(false)
  }

  const handleGenerateReport = async (shipment) => {
    setGeneratingReport(shipment.id)
    // For now navigate to shipment view where AI summary lives
    // Later this will generate a full PDF
    navigate(`/shipment/${shipment.id}`)
    setGeneratingReport(null)
  }

  if (loading) return <p style={{ color: '#888', padding: 20 }}>Loading shipments...</p>

  if (shipments.length === 0) return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 40, textAlign: 'center', color: '#aaa' }}>
      <p style={{ fontSize: 15 }}>No shipments found.</p>
    </div>
  )

  return (
    <div>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>{shipments.length} shipment(s) found</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {shipments.map(s => {
          const statusStyle = STATUS_COLORS[s.shipment_status] || { bg: '#f5f5f5', color: '#333' }
          return (
            <div key={s.id}
              style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '16px 20px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

              {/* Left info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 15, color: '#1A3C6E' }}>
                    {s.query_no || 'No Query No.'}
                  </span>
                  <span style={{
                    background: statusStyle.bg, color: statusStyle.color,
                    padding: '2px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600
                  }}>
                    {s.shipment_status || 'Booking Confirmed'}
                  </span>
                  {s.is_locked && (
                    <span style={{ background: '#FFEBEE', color: '#C62828', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      🔒 Locked
                    </span>
                  )}
                  {s.ai_summary && (
                    <span style={{ background: '#F3E5F5', color: '#6A1B9A', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      ✨ AI Ready
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#555', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <span>📦 {s.commodity || '—'}</span>
                  <span>🏢 {s.booking_party || '—'}</span>
                  <span>🚢 {s.shipper || '—'}</span>
                  {s.mode && <span>✈️ {s.mode}</span>}
                  {s.destination_port && <span>📍 {s.destination_port}</span>}
                  {s.eta && <span>📅 ETA: {new Date(s.eta).toLocaleDateString('en-IN')}</span>}
                </div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                  Added {new Date(s.created_at).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Right actions */}
              <div style={{ display: 'flex', gap: 8, marginLeft: 16, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => navigate(`/shipment/${s.id}`)}
                  style={{ padding: '7px 16px', background: '#E3F2FD', color: '#0D47A1', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                  View
                </button>
                {role === 'admin' && (
                  <>
                    <button
                      onClick={() => navigate(`/shipment/${s.id}/edit`)}
                      style={{ padding: '7px 16px', background: '#FFF8E1', color: '#F57F17', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleGenerateReport(s)}
                      disabled={generatingReport === s.id}
                      style={{
                        padding: '7px 16px',
                        background: generatingReport === s.id ? '#ccc' : '#6A1B9A',
                        color: 'white', border: 'none', borderRadius: 6,
                        cursor: generatingReport === s.id ? 'not-allowed' : 'pointer',
                        fontSize: 13, fontWeight: 500
                      }}>
                      {generatingReport === s.id ? '...' : '📄 Report'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}