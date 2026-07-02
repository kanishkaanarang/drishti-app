import { useState } from 'react'
import { supabase } from './supabase'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
})

export default function AISummary({ shipment, isAdmin, onSummaryGenerated }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateSummary = async () => {
    setLoading(true)
    setError('')

    try {
      const prompt = `You are a freight forwarding expert assistant for Drishti Global Private Limited, a DGFT and Customs consulting company in New Delhi.

Generate a professional shipment summary report based on the following shipment data. Write it in clear, professional English suitable for sharing with the client. Include all relevant details that are available (skip fields that are empty/null). Structure it with sections.

SHIPMENT DATA:
- Query No: ${shipment.query_no || 'N/A'}
- Booking Party: ${shipment.booking_party || 'N/A'}
- Shipper: ${shipment.shipper || 'N/A'}
- Consignee: ${shipment.consignee || 'N/A'}
- IEC Code: ${shipment.iec_code || 'N/A'}
- Commodity: ${shipment.commodity || 'N/A'}
- Mode: ${shipment.mode || 'N/A'}
- Shipment Terms: ${shipment.shipment_terms || 'N/A'}
- Current Status: ${shipment.shipment_status || 'Booking Confirmed'}
- Invoice No: ${shipment.inv_no || 'N/A'}
- Invoice Date: ${shipment.inv_date || 'N/A'}
- SB/BE No: ${shipment.sb_be_no || 'N/A'}
- Quantity: ${shipment.qty || 'N/A'} ${shipment.unit || ''}
- Gross Weight: ${shipment.gross_weight || 'N/A'} KGS
- Scheme: ${shipment.scheme || 'N/A'}
- EPCG/Advance Licence No: ${shipment.epcg_licence_no || 'N/A'}
- CHA: ${shipment.cha || 'N/A'}
- Origin Port: ${shipment.origin_port || 'N/A'}
- POL/POA: ${shipment.pol_poa || 'N/A'}
- Destination Port: ${shipment.destination_port || 'N/A'}
- Country of Origin: ${shipment.country_origin || 'N/A'}
- Country of Destination: ${shipment.country_destination || 'N/A'}
- ETD: ${shipment.etd || 'N/A'}
- ETA: ${shipment.eta || 'N/A'}
- Vessel/Flight: ${shipment.vessel_flight || 'N/A'}
- Shipping Line/Airline: ${shipment.shipping_airline || 'N/A'}
- BL/AWB No (Master): ${shipment.bl_awb_master || 'N/A'}
- BL/AWB No (House): ${shipment.bl_awb_house || 'N/A'}
- Container No: ${shipment.cnt_no || 'N/A'}
- Transshipment Port: ${shipment.transshipment_port || 'N/A'}
- Insurance Required: ${shipment.insurance_required || 'N/A'}
- Insurance Amount: ${shipment.insurance_amount || 'N/A'}
- COO Status: ${shipment.coo_status || 'N/A'}
- DBK Amount: ${shipment.dbk_amount || 'N/A'}
- GST Amount: ${shipment.gst_amount || 'N/A'}
- Total: ${shipment.total || 'N/A'}
- Job Status: ${shipment.job_status || 'N/A'}
- Special Instructions: ${shipment.special_instructions || 'N/A'}
- Additional Remarks: ${shipment.additional_remarks || 'N/A'}

Write a professional summary with these sections:
1. Shipment Overview
2. Current Status & Progress
3. Route & Logistics Details
4. Documentation Status
5. Financial Summary (only if amounts available)
6. Next Steps / Remarks

Keep it concise, professional, and factual. Do not include N/A fields in the output.`

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })

      const summary = message.content[0].text

      // Save to Supabase
      const { error: saveError } = await supabase
        .from('export_shipments')
        .update({
          ai_summary: summary,
          ai_summary_generated_at: new Date().toISOString()
        })
        .eq('id', shipment.id)

      if (saveError) throw saveError

      onSummaryGenerated(summary)
      setLoading(false)

    } catch (err) {
      setError(err.message || 'Failed to generate summary')
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 40, borderTop: '2px solid #1A3C6E', paddingTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, color: '#1A3C6E', textTransform: 'uppercase', letterSpacing: 1 }}>AI Shipment Summary</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>
            {shipment.ai_summary_generated_at
              ? `Last generated: ${new Date(shipment.ai_summary_generated_at).toLocaleString()}`
              : 'No summary generated yet'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={generateSummary}
            disabled={loading}
            style={{
              padding: '10px 24px',
              background: loading ? '#ccc' : '#6A1B9A',
              color: 'white', border: 'none', borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 500, fontSize: 14
            }}>
            {loading ? '✨ Generating...' : '✨ Generate AI Summary'}
          </button>
        )}
      </div>

      {error && (
        <p style={{ color: 'red', fontSize: 13 }}>{error}</p>
      )}

      {shipment.ai_summary && (
        <div style={{
          background: '#F3E5F5',
          border: '1px solid #CE93D8',
          borderRadius: 8, padding: 24,
          fontSize: 14, lineHeight: 1.8,
          color: '#1a1a1a', whiteSpace: 'pre-wrap'
        }}>
          {shipment.ai_summary}
        </div>
      )}
    </div>
  )
}