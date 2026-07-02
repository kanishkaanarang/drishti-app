import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import Dashboard from './Dashboard'
import ExportForm from './ExportForm'
import ShipmentView from './ShipmentView'
import AdminEditForm from './AdminEditForm'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/export-form" element={<ExportForm />} />
        <Route path="/shipment/:id" element={<ShipmentView />} />
        <Route path="/shipment/:id/edit" element={<AdminEditForm />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App