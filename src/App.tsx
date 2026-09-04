import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Players from './pages/Players'
import Picks from './pages/Picks'
import History from './pages/History'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/players" element={<Players />} />
            <Route path="/picks" element={<Picks />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  )
}
