import './App.css';
import Header from './components/Header/Header';
import SignUp from './components/SignUp/SignUp';
import LogIn from './components/LogIn/LogIn';
import Profile from './components/Profile/Profile';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import EmailVerificationBanner from './components/EmailVerification/EmailVerication';
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Email verification route */}
        <Route path="/verify" element={
          <EmailVerificationBanner />
        } />

        {/* Private routes - require authentication and verification */}
        <Route path="/home" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        {/* Catch-all route */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
