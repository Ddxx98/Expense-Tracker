import './App.css'
import Header from './components/Header/Header'
import SignUp from './components/SignUp/SignUp'
import LogIn from './components/LogIn/LogIn'  
import Profile from './components/Profile/Profile'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import EmailVerificationBanner from './components/EmailVerification/EmailVerication'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/email" element={<EmailVerificationBanner />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
