import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Game1 from './pages/Game1'
import Game2 from './pages/Game2'
import Game3 from './pages/Game3'
import Game4 from './pages/Game4'
import MailPage from './pages/MailPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/supersecretpage21" element={<Game1 />} />
        <Route path="/supersecretpage113" element={<Game2 />} />
        <Route path="/supersecretpage258" element={<Game3 />} />
        <Route path="/supersecretpage400" element={<Game4 />} />
        <Route path="/supersecretmail400" element={<MailPage />} />
        <Route path="/supersecretmail400/read/:mailId" element={<MailPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}
