import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'

const STAGES = [
  'Booking Confirmed',
  'Cargo Picked Up',
  'Export Customs Clearance',
  'Cargo Handed to Carrier',
  'In Transit',
  'Transshipment',
  'Arrived at Destination',
  'Delivered'
]

const Field = ({ label, name, value, onChange, type = 'text' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <label style={{ fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</label>
    <input
      type={type} name={name} value={value ?? ''} onChange={onChange}
      style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, outline: 'none', background: 'white' }}
    />
  </div>
)

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <h3 style={{ fontSize: 13, color: '#1A3C6E', borderBottom: '2px solid #1A3C6E', paddingBottom: 6, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {children}
    </div>
  </div>
)

export default function AdminEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/'); return }

      const role = user.app_metadata?.role
      if (role !== 'admin') { navigate('/dashboard'); return }

      const { data, error } = await supabase
        .from('export_shipments')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) { navigate('/dashboard'); return }
      setForm(data)
      setLoading(false)
    }
    init()
  }, [id])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    const numericFields = ['qty','gross_weight','dbk_amount','gst_amount','transit_days_pol',
      'insurance_amount','rate','detention','off_load_misc','kanta_charges','green_tax',
      'total','tax_rate','tax_amount','invoice_value']
    const dateFields = ['inv_date','sb_date','carting_date','release_from_custom',
      'cargo_handover_date','date_of_stuffing','tr_submission_date','railing_date',
      'arrival_date_pol','bl_awb_issue_date','transshipment_eta','transshipment_etd',
      'etd','eta','bill_date','bill_handover_dt']

    const payload = { ...form, status_updated_at: new Date().toISOString() }
    numericFields.forEach(f => { if (payload[f] === '' || payload[f] === undefined) payload[f] = null })
    dateFields.forEach(f => { if (payload[f] === '' || payload[f] === undefined) payload[f] = null })

    const { error } = await supabase
      .from('export_shipments')
      .update(payload)
      .eq('id', id)

    if (error) { setError(error.message); setSaving(false); return }
    setSuccess(true)
    setSaving(false)
    setTimeout(() => navigate(`/shipment/${id}`, { replace: true }), 1500)  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>

  if (success) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <h2 style={{ color: '#2E7D32' }}>✓ Shipment updated successfully!</h2>
      <p style={{ color: '#888' }}>Redirecting back to shipment view...</p>
    </div>
  )

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: '#1A3C6E' }}>Edit Shipment — {form.query_no}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#e53935', fontWeight: 500 }}>⚠️ Admin only — changes are permanent</p>
        </div>
        <button onClick={() => navigate(`/shipment/${id}`)}
          style={{ padding: '8px 20px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}>
          ← Cancel
        </button>
      </div>

      {/* Status Update - Most Important Field */}
      <div style={{ background: '#E8EAF6', border: '1px solid #C5CAE9', borderRadius: 8, padding: 20, marginBottom: 32, marginTop: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#1A237E', display: 'block', marginBottom: 8 }}>
          SHIPMENT STATUS — Update Stage
        </label>
        <select
          name="shipment_status"
          value={form.shipment_status || 'Booking Confirmed'}
          onChange={handleChange}
          style={{ padding: '10px 16px', border: '1px solid #9FA8DA', borderRadius: 6, fontSize: 14, fontWeight: 500, color: '#1A237E', background: 'white', width: '100%', maxWidth: 400 }}
        >
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Section title="1. Basic Information">
        <Field label="Query No" name="query_no" value={form.query_no} onChange={handleChange} />
        <Field label="Booking Party" name="booking_party" value={form.booking_party} onChange={handleChange} />
        <Field label="Shipper" name="shipper" value={form.shipper} onChange={handleChange} />
        <Field label="IEC Code" name="iec_code" value={form.iec_code} onChange={handleChange} />
        <Field label="AD Code" name="ad_code" value={form.ad_code} onChange={handleChange} />
        <Field label="Consignee" name="consignee" value={form.consignee} onChange={handleChange} />
        <Field label="Commodity" name="commodity" value={form.commodity} onChange={handleChange} />
        <Field label="Moving Through" name="moving_through" value={form.moving_through} onChange={handleChange} />
        <Field label="Working Type" name="working_type" value={form.working_type} onChange={handleChange} />
        <Field label="Mode" name="mode" value={form.mode} onChange={handleChange} />
        <Field label="Shipment Terms" name="shipment_terms" value={form.shipment_terms} onChange={handleChange} />
      </Section>

      <Section title="2. Invoice & Customs">
        <Field label="Invoice No" name="inv_no" value={form.inv_no} onChange={handleChange} />
        <Field label="Invoice Date" name="inv_date" value={form.inv_date} onChange={handleChange} type="date" />
        <Field label="SB/BE No" name="sb_be_no" value={form.sb_be_no} onChange={handleChange} />
        <Field label="SB Date" name="sb_date" value={form.sb_date} onChange={handleChange} type="date" />
        <Field label="Qty" name="qty" value={form.qty} onChange={handleChange} type="number" />
        <Field label="Unit" name="unit" value={form.unit} onChange={handleChange} />
        <Field label="Gross Weight (KGS)" name="gross_weight" value={form.gross_weight} onChange={handleChange} type="number" />
        <Field label="Scheme" name="scheme" value={form.scheme} onChange={handleChange} />
        <Field label="EPCG Licence No" name="epcg_licence_no" value={form.epcg_licence_no} onChange={handleChange} />
        <Field label="DBK Amount" name="dbk_amount" value={form.dbk_amount} onChange={handleChange} type="number" />
        <Field label="GST Amount" name="gst_amount" value={form.gst_amount} onChange={handleChange} type="number" />
        <Field label="CHA" name="cha" value={form.cha} onChange={handleChange} />
      </Section>

      <Section title="3. Cargo Dates & Movement">
        <Field label="Carting Date" name="carting_date" value={form.carting_date} onChange={handleChange} type="date" />
        <Field label="Release From Custom" name="release_from_custom" value={form.release_from_custom} onChange={handleChange} type="date" />
        <Field label="Cargo Handover Date" name="cargo_handover_date" value={form.cargo_handover_date} onChange={handleChange} type="date" />
        <Field label="Date of Stuffing" name="date_of_stuffing" value={form.date_of_stuffing} onChange={handleChange} type="date" />
        <Field label="TR Submission Date" name="tr_submission_date" value={form.tr_submission_date} onChange={handleChange} type="date" />
        <Field label="Remark" name="remark" value={form.remark} onChange={handleChange} />
        <Field label="Movement Type" name="movement_type" value={form.movement_type} onChange={handleChange} />
        <Field label="Container No" name="cnt_no" value={form.cnt_no} onChange={handleChange} />
        <Field label="Size" name="size" value={form.size} onChange={handleChange} />
        <Field label="Railing Date" name="railing_date" value={form.railing_date} onChange={handleChange} type="date" />
        <Field label="Arrival Date at POL" name="arrival_date_pol" value={form.arrival_date_pol} onChange={handleChange} type="date" />
        <Field label="Transit Days upto POL" name="transit_days_pol" value={form.transit_days_pol} onChange={handleChange} type="number" />
      </Section>

      <Section title="4. Shipping Details">
        <Field label="SI Submission Status" name="si_submission_status" value={form.si_submission_status} onChange={handleChange} />
        <Field label="Draft Approval Status" name="draft_approval_status" value={form.draft_approval_status} onChange={handleChange} />
        <Field label="BL/AWB No (Master)" name="bl_awb_master" value={form.bl_awb_master} onChange={handleChange} />
        <Field label="BL/AWB No (House)" name="bl_awb_house" value={form.bl_awb_house} onChange={handleChange} />
        <Field label="BL/AWB Issue Date" name="bl_awb_issue_date" value={form.bl_awb_issue_date} onChange={handleChange} type="date" />
        <Field label="Shipping / Airline" name="shipping_airline" value={form.shipping_airline} onChange={handleChange} />
        <Field label="Actual Forwarder" name="actual_forwarder" value={form.actual_forwarder} onChange={handleChange} />
        <Field label="Forwarder" name="forwarder" value={form.forwarder} onChange={handleChange} />
        <Field label="Vessel / Flight" name="vessel_flight" value={form.vessel_flight} onChange={handleChange} />
      </Section>

      <Section title="5. Ports & Route">
        <Field label="Country (Origin)" name="country_origin" value={form.country_origin} onChange={handleChange} />
        <Field label="Origin Port" name="origin_port" value={form.origin_port} onChange={handleChange} />
        <Field label="POL / POA" name="pol_poa" value={form.pol_poa} onChange={handleChange} />
        <Field label="Destination Port" name="destination_port" value={form.destination_port} onChange={handleChange} />
        <Field label="Country (Destination)" name="country_destination" value={form.country_destination} onChange={handleChange} />
        <Field label="Special Instructions" name="special_instructions" value={form.special_instructions} onChange={handleChange} />
        <Field label="Transshipment" name="transshipment" value={form.transshipment} onChange={handleChange} />
        <Field label="Transshipment Port Country" name="transshipment_port_country" value={form.transshipment_port_country} onChange={handleChange} />
        <Field label="Transshipment Port" name="transshipment_port" value={form.transshipment_port} onChange={handleChange} />
        <Field label="Transshipment ETA" name="transshipment_eta" value={form.transshipment_eta} onChange={handleChange} type="date" />
        <Field label="Transshipment ETD" name="transshipment_etd" value={form.transshipment_etd} onChange={handleChange} type="date" />
        <Field label="ETD" name="etd" value={form.etd} onChange={handleChange} type="date" />
        <Field label="ETA" name="eta" value={form.eta} onChange={handleChange} type="date" />
        <Field label="Transit / Delivery Time" name="transit_delivery_time" value={form.transit_delivery_time} onChange={handleChange} />
        <Field label="Additional Remarks" name="additional_remarks" value={form.additional_remarks} onChange={handleChange} />
      </Section>

      <Section title="6. Insurance & COO">
        <Field label="Insurance Required" name="insurance_required" value={form.insurance_required} onChange={handleChange} />
        <Field label="Insurance Amount (INR)" name="insurance_amount" value={form.insurance_amount} onChange={handleChange} type="number" />
        <Field label="COO" name="coo" value={form.coo} onChange={handleChange} />
        <Field label="COO Status" name="coo_status" value={form.coo_status} onChange={handleChange} />
      </Section>

      <Section title="7. Transport & Billing">
        <Field label="Transport" name="transport" value={form.transport} onChange={handleChange} />
        <Field label="Transporter" name="transporter" value={form.transporter} onChange={handleChange} />
        <Field label="Bill No" name="bill_no" value={form.bill_no} onChange={handleChange} />
        <Field label="Bill Date" name="bill_date" value={form.bill_date} onChange={handleChange} type="date" />
        <Field label="Original Recd. Dt" name="original_recd_dt" value={form.original_recd_dt} onChange={handleChange} />
        <Field label="Bill Handover Dt" name="bill_handover_dt" value={form.bill_handover_dt} onChange={handleChange} type="date" />
        <Field label="Rate" name="rate" value={form.rate} onChange={handleChange} type="number" />
        <Field label="Detention" name="detention" value={form.detention} onChange={handleChange} type="number" />
        <Field label="Off Load / Misc" name="off_load_misc" value={form.off_load_misc} onChange={handleChange} type="number" />
        <Field label="KANTA Charges" name="kanta_charges" value={form.kanta_charges} onChange={handleChange} type="number" />
        <Field label="Green Tax" name="green_tax" value={form.green_tax} onChange={handleChange} type="number" />
        <Field label="Total" name="total" value={form.total} onChange={handleChange} type="number" />
        <Field label="Tax Rate" name="tax_rate" value={form.tax_rate} onChange={handleChange} type="number" />
        <Field label="Tax Amount" name="tax_amount" value={form.tax_amount} onChange={handleChange} type="number" />
        <Field label="Invoice Value" name="invoice_value" value={form.invoice_value} onChange={handleChange} type="number" />
        <Field label="Remark (Final)" name="remark_final" value={form.remark_final} onChange={handleChange} />
      </Section>

      <Section title="8. Brokerage & Job Status">
        <Field label="Brokerage Remarks" name="brokerage_remarks" value={form.brokerage_remarks} onChange={handleChange} />
        <Field label="Brokerage Bill No" name="brokerage_bill_no" value={form.brokerage_bill_no} onChange={handleChange} />
        <Field label="Billing for FRC" name="billing_frc" value={form.billing_frc} onChange={handleChange} />
        <Field label="FRC Bill" name="frc_bill" value={form.frc_bill} onChange={handleChange} />
        <Field label="Billing Status" name="billing_status" value={form.billing_status} onChange={handleChange} />
        <Field label="Bill Number" name="bill_number" value={form.bill_number} onChange={handleChange} />
        <Field label="Job Status" name="job_status" value={form.job_status} onChange={handleChange} />
      </Section>

      {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16, borderTop: '1px solid #eee' }}>
        <button onClick={() => navigate(`/shipment/${id}`)}
          style={{ padding: '12px 28px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '12px 32px', background: saving ? '#ccc' : '#1A3C6E', color: 'white', border: 'none', borderRadius: 6, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500 }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

    </div>
  )
}