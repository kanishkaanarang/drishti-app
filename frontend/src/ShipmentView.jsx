import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useNavigate, useParams } from 'react-router-dom'

const Field = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <span style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
    <span style={{ fontSize: 14, color: value ? '#111' : '#ccc', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
      {value || '—'}
    </span>
  </div>
)

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <h3 style={{ fontSize: 14, color: '#1A3C6E', borderBottom: '2px solid #1A3C6E', paddingBottom: 6, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
      {children}
    </div>
  </div>
)

export default function ShipmentView() {
  const { id } = useParams()
  const [shipment, setShipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('export_shipments').select('*').eq('id', id).single()
      .then(({ data }) => { setShipment(data); setLoading(false) })
  }, [id])

  // No screenshot protection
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('')
        alert('Screenshots are not permitted on this platform.')
      }
    }
    document.addEventListener('keyup', handleKey)
    return () => document.removeEventListener('keyup', handleKey)
  }, [])

  if (loading) return <p style={{ padding: 40, color: '#888' }}>Loading...</p>
  if (!shipment) return <p style={{ padding: 40, color: '#888' }}>Shipment not found.</p>

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto', position: 'relative' }}>

      {/* Watermark */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 9999, overflow: 'hidden'
      }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${15 + i * 18}%`,
            left: '50%',
            transform: 'translateX(-50%) rotate(-30deg)',
            fontSize: 18, fontWeight: 700,
            color: 'rgba(26, 60, 110, 0.06)',
            whiteSpace: 'nowrap',
            letterSpacing: 4,
            userSelect: 'none'
          }}>
            DRISHTI GLOBAL CONFIDENTIAL — {new Date().toLocaleDateString('en-IN')}
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: '#1A3C6E' }}>
            Shipment Record — {shipment.query_no || 'No Query No.'}
          </h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
              {shipment.shipment_status}
            </span>
            {shipment.is_locked && (
              <span style={{ background: '#FFEBEE', color: '#C62828', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                🔒 Locked Record
              </span>
            )}
          </div>
        </div>
        <button onClick={() => navigate('/dashboard')}
          style={{ padding: '8px 20px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          ← Back
        </button>
      </div>

      {/* No copy CSS */}
      <style>{`
        .shipment-content { user-select: none; -webkit-user-select: none; }
      `}</style>

      <div className="shipment-content">
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

        <Section title="3. Cargo Dates">
          <Field label="Carting Date" value={shipment.carting_date} />
          <Field label="Release From Custom" value={shipment.release_from_custom} />
          <Field label="Cargo Handover Date" value={shipment.cargo_handover_date} />
          <Field label="Date of Stuffing" value={shipment.date_of_stuffing} />
          <Field label="TR Submission Date" value={shipment.tr_submission_date} />
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
          <Field label="Transshipment" value={shipment.transshipment} />
          <Field label="Transshipment Port" value={shipment.transshipment_port} />
          <Field label="Transshipment ETA" value={shipment.transshipment_eta} />
          <Field label="Transshipment ETD" value={shipment.transshipment_etd} />
          <Field label="ETD" value={shipment.etd} />
          <Field label="ETA" value={shipment.eta} />
          <Field label="Transit / Delivery Time" value={shipment.transit_delivery_time} />
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
          <Field label="Rate" value={shipment.rate} />
          <Field label="Detention" value={shipment.detention} />
          <Field label="Off Load / Misc" value={shipment.off_load_misc} />
          <Field label="KANTA Charges" value={shipment.kanta_charges} />
          <Field label="Green Tax" value={shipment.green_tax} />
          <Field label="Total" value={shipment.total} />
          <Field label="Tax Rate" value={shipment.tax_rate} />
          <Field label="Tax Amount" value={shipment.tax_amount} />
          <Field label="Invoice Value" value={shipment.invoice_value} />
        </Section>

        <Section title="8. Brokerage & Status">
          <Field label="Brokerage Remarks" value={shipment.brokerage_remarks} />
          <Field label="Brokerage Bill No" value={shipment.brokerage_bill_no} />
          <Field label="Billing for FRC" value={shipment.billing_frc} />
          <Field label="FRC Bill" value={shipment.frc_bill} />
          <Field label="Billing Status" value={shipment.billing_status} />
          <Field label="Bill Number" value={shipment.bill_number} />
          <Field label="Job Status" value={shipment.job_status} />
          <Field label="Additional Remarks" value={shipment.additional_remarks} />
          <Field label="Remark" value={shipment.remark} />
          <Field label="Special Instructions" value={shipment.special_instructions} />
        </Section>
      </div>
    </div>
  )
}