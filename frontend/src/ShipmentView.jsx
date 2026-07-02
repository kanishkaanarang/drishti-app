import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import AISummary from './AISummary'

const Field = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <label style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>
    <div style={{ fontSize: 14, color: '#f9f8f8', borderBottom: '1px solid #eee', paddingBottom: 8, minHeight: 24 }}>
      {value || '—'}
    </div>
  </div>
)

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <h3 style={{ fontSize: 13, color: '#1A3C6E', borderBottom: '2px solid #1A3C6E', paddingBottom: 6, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
      {children}
    </div>
  </div>
)

export default function ShipmentView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shipment, setShipment] = useState(null)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [blurred, setBlurred] = useState(false)
  const [aiSummary, setAiSummary] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/'); return }
      setUser(user)

      const role = user.app_metadata?.role
      if (role === 'admin') setIsAdmin(true)

      const { data, error } = await supabase
        .from('export_shipments')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) { navigate('/dashboard'); return }
      setShipment(data)
      setAiSummary(data.ai_summary || '')
      setLoading(false)
    }
    init()
  }, [id])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        setBlurred(true)
        navigator.clipboard.writeText('')
        setTimeout(() => setBlurred(false), 3000)
      }
      if ((e.ctrlKey && e.shiftKey && e.key === 'S') ||
          (e.ctrlKey && e.key === 'p') ||
          (e.ctrlKey && e.key === 'P')) {
        e.preventDefault()
        setBlurred(true)
        setTimeout(() => setBlurred(false), 3000)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setBlurred(true)
        setTimeout(() => setBlurred(false), 3000)
      }
    }

    const handleContextMenu = (e) => e.preventDefault()

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading shipment...</div>
  if (!shipment) return null

  const statusColors = {
    'Booking Confirmed': '#1565C0',
    'Cargo Picked Up': '#6A1B9A',
    'Export Customs Clearance': '#E65100',
    'Cargo Handed to Carrier': '#2E7D32',
    'In Transit': '#00838F',
    'Transshipment': '#AD1457',
    'Arrived at Destination': '#558B2F',
    'Delivered': '#1B5E20'
  }

  const statusColor = statusColors[shipment.shipment_status] || '#333'

  return (
    <div style={{ position: 'relative' }}>

      {blurred && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.95)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
          <h2 style={{ color: 'white', margin: 0 }}>Screenshots are not permitted</h2>
          <p style={{ color: '#aaa', marginTop: 8 }}>This content is confidential. Screen will restore shortly.</p>
        </div>
      )}

      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', zIndex: 100, overflow: 'hidden'
      }}>
        {Array.from({ length: 6 }).map((_, i) =>
          Array.from({ length: 8 }).map((_, j) => (
            <div key={`${i}-${j}`} style={{
              position: 'absolute',
              left: `${i * 18}%`,
              top: `${j * 14}%`,
              transform: 'rotate(-30deg)',
              fontSize: 11,
              color: 'rgba(148, 145, 145, 0.06)',
              whiteSpace: 'nowrap',
              fontWeight: 600,
              userSelect: 'none'
            }}>
              {user?.email} • CONFIDENTIAL • {new Date().toLocaleDateString()}
            </div>
          ))
        )}
      </div>

      <div style={{
        padding: 32, maxWidth: 1200, margin: '0 auto',
        userSelect: 'none', WebkitUserSelect: 'none',
        MozUserSelect: 'none', msUserSelect: 'none'
      }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, color: '#1A3C6E' }}>
              Shipment — {shipment.query_no || 'No Query No'}
            </h1>
            <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center' }}>
              <span style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: statusColor + '22', color: statusColor, border: `1px solid ${statusColor}44`
              }}>
                {shipment.shipment_status || 'Booking Confirmed'}
              </span>
              <span style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: shipment.is_locked ? '#FFEBEE' : '#E8F5E9',
                color: shipment.is_locked ? '#C62828' : '#2E7D32'
              }}>
                {shipment.is_locked ? '🔒 Locked' : '🔓 Unlocked'}
              </span>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#aaa' }}>
              Added {new Date(shipment.created_at).toLocaleString()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {isAdmin && (
              <button onClick={() => navigate(`/shipment/${id}/edit`)}
                style={{ padding: '10px 24px', background: '#1A3C6E', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
                Edit Shipment
              </button>
            )}
            <button onClick={() => navigate('/dashboard')}
              style={{ padding: '10px 20px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}>
              ← Dashboard
            </button>
          </div>
        </div>

        <Section title="1. Basic Information">
          <Field label="Query No" value={shipment.query_no} />
          <Field label="Booking Party" value={shipment.booking_party} />
          <Field label="Shipper" value={shipment.shipper} />
          <Field label="IEC Code" value={shipment.iec_code} />
          <Field label="AD Code" value={shipment.ad_code} />
          <Field label="Consignee" value={shipment.consignee} />
          <Field label="Commodity" value={shipment.commodity} />
          <Field label="Moving Through" value={shipment.moving_through} />
          <Field label="Working Type" value={shipment.working_type} />
          <Field label="Mode" value={shipment.mode} />
          <Field label="Shipment Terms" value={shipment.shipment_terms} />
        </Section>

        <Section title="2. Invoice & Customs">
          <Field label="Invoice No" value={shipment.inv_no} />
          <Field label="Invoice Date" value={shipment.inv_date} />
          <Field label="SB/BE No" value={shipment.sb_be_no} />
          <Field label="SB Date" value={shipment.sb_date} />
          <Field label="Qty" value={shipment.qty} />
          <Field label="Unit" value={shipment.unit} />
          <Field label="Gross Weight (KGS)" value={shipment.gross_weight} />
          <Field label="Scheme" value={shipment.scheme} />
          <Field label="EPCG Licence No" value={shipment.epcg_licence_no} />
          <Field label="DBK Amount" value={shipment.dbk_amount} />
          <Field label="GST Amount" value={shipment.gst_amount} />
          <Field label="CHA" value={shipment.cha} />
        </Section>

        <Section title="3. Cargo Dates & Movement">
          <Field label="Carting Date" value={shipment.carting_date} />
          <Field label="Release From Custom" value={shipment.release_from_custom} />
          <Field label="Cargo Handover Date" value={shipment.cargo_handover_date} />
          <Field label="Date of Stuffing" value={shipment.date_of_stuffing} />
          <Field label="TR Submission Date" value={shipment.tr_submission_date} />
          <Field label="Remark" value={shipment.remark} />
          <Field label="Movement Type" value={shipment.movement_type} />
          <Field label="Container No" value={shipment.cnt_no} />
          <Field label="Size" value={shipment.size} />
          <Field label="Railing Date" value={shipment.railing_date} />
          <Field label="Arrival Date at POL" value={shipment.arrival_date_pol} />
          <Field label="Transit Days upto POL" value={shipment.transit_days_pol} />
        </Section>

        <Section title="4. Shipping Details">
          <Field label="SI Submission Status" value={shipment.si_submission_status} />
          <Field label="Draft Approval Status" value={shipment.draft_approval_status} />
          <Field label="BL/AWB No (Master)" value={shipment.bl_awb_master} />
          <Field label="BL/AWB No (House)" value={shipment.bl_awb_house} />
          <Field label="BL/AWB Issue Date" value={shipment.bl_awb_issue_date} />
          <Field label="Shipping / Airline" value={shipment.shipping_airline} />
          <Field label="Actual Forwarder" value={shipment.actual_forwarder} />
          <Field label="Forwarder" value={shipment.forwarder} />
          <Field label="Vessel / Flight" value={shipment.vessel_flight} />
        </Section>

        <Section title="5. Ports & Route">
          <Field label="Country (Origin)" value={shipment.country_origin} />
          <Field label="Origin Port" value={shipment.origin_port} />
          <Field label="POL / POA" value={shipment.pol_poa} />
          <Field label="Destination Port" value={shipment.destination_port} />
          <Field label="Country (Destination)" value={shipment.country_destination} />
          <Field label="Special Instructions" value={shipment.special_instructions} />
          <Field label="Transshipment" value={shipment.transshipment} />
          <Field label="Transshipment Port Country" value={shipment.transshipment_port_country} />
          <Field label="Transshipment Port" value={shipment.transshipment_port} />
          <Field label="Transshipment ETA" value={shipment.transshipment_eta} />
          <Field label="Transshipment ETD" value={shipment.transshipment_etd} />
          <Field label="ETD" value={shipment.etd} />
          <Field label="ETA" value={shipment.eta} />
          <Field label="Transit / Delivery Time" value={shipment.transit_delivery_time} />
          <Field label="Additional Remarks" value={shipment.additional_remarks} />
        </Section>

        <Section title="6. Insurance & COO">
          <Field label="Insurance Required" value={shipment.insurance_required} />
          <Field label="Insurance Amount (INR)" value={shipment.insurance_amount} />
          <Field label="COO" value={shipment.coo} />
          <Field label="COO Status" value={shipment.coo_status} />
        </Section>

        <Section title="7. Transport & Billing">
          <Field label="Transport" value={shipment.transport} />
          <Field label="Transporter" value={shipment.transporter} />
          <Field label="Bill No" value={shipment.bill_no} />
          <Field label="Bill Date" value={shipment.bill_date} />
          <Field label="Original Recd. Dt" value={shipment.original_recd_dt} />
          <Field label="Bill Handover Dt" value={shipment.bill_handover_dt} />
          <Field label="Rate" value={shipment.rate} />
          <Field label="Detention" value={shipment.detention} />
          <Field label="Off Load / Misc" value={shipment.off_load_misc} />
          <Field label="KANTA Charges" value={shipment.kanta_charges} />
          <Field label="Green Tax" value={shipment.green_tax} />
          <Field label="Total" value={shipment.total} />
          <Field label="Tax Rate" value={shipment.tax_rate} />
          <Field label="Tax Amount" value={shipment.tax_amount} />
          <Field label="Invoice Value" value={shipment.invoice_value} />
          <Field label="Remark (Final)" value={shipment.remark_final} />
        </Section>

        <Section title="8. Brokerage & Job Status">
          <Field label="Brokerage Remarks" value={shipment.brokerage_remarks} />
          <Field label="Brokerage Bill No" value={shipment.brokerage_bill_no} />
          <Field label="Billing for FRC" value={shipment.billing_frc} />
          <Field label="FRC Bill" value={shipment.frc_bill} />
          <Field label="Billing Status" value={shipment.billing_status} />
          <Field label="Bill Number" value={shipment.bill_number} />
          <Field label="Job Status" value={shipment.job_status} />
        </Section>

        <AISummary
          shipment={{ ...shipment, ai_summary: aiSummary }}
          isAdmin={isAdmin}
          onSummaryGenerated={(summary) => {
            setAiSummary(summary)
            setShipment(prev => ({ ...prev, ai_summary: summary }))
          }}
        />

      </div>
    </div>
  )
}