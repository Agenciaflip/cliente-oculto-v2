import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NewAnalysis from './pages/NewAnalysis'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new" element={<NewAnalysis />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
