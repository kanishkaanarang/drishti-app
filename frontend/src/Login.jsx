import { useState } from 'react'
import { supabase } from './supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else window.location.href = '/dashboard'}

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 32, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2 style={{ marginBottom: 24 }}>Drishti Global — Login</h2>
      <input
        type="email" placeholder="Email"
        value={email} onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 12, boxSizing: 'border-box' }}
      />
      <input
        type="password" placeholder="Password"
        value={password} onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 12, boxSizing: 'border-box' }}
      />
      {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
      <button onClick={handleLogin}
        style={{ width: '100%', padding: 12, background: '#1A3C6E', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
        Login
      </button>
    </div>
  )
}