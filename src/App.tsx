import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Players from './pages/Players'
import Picks from './pages/Picks'
import History from './pages/History'
import Results from './pages/Results'
import Archive from './pages/Archive'
import Settings from './pages/Settings'
import Help from './pages/Help'

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
            <Route path="/results" element={<Results />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  )
}
