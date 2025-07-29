import './App.css'
import Header from './components/Header/Header'
import SignUp from './components/SignUp/SignUp'
import LogIn from './components/LogIn/LogIn'
import { Routes, Route, BrowserRouter } from 'react-router-dom'

function App() {

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/signup" element={<SignUp />} />
      </Routes>
      <Routes>
        <Route path="/login" element={<LogIn />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
