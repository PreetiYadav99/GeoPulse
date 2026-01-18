
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import UploadImage from './pages/UploadImage';
import UploadLive from './pages/UploadLive';
import UploadManual from './pages/UploadManual';
import Results from './pages/Results';
import About from './pages/About';
import Contact from './pages/Contact';
import './pages/Home.css';       // Home styling globally import karen
import './components/Navbar.css'; // Navbar styling
import './components/Footer.css'; // Footer styling


// Additional pages jaise Upload, About, Contact yahan import kar sakte hain


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* some parts of the code navigate to /home, ensure it works */}
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/upload" element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            } />
            <Route path="/upload/image" element={
              <ProtectedRoute>
                <UploadImage />
              </ProtectedRoute>
            } />
            <Route path="/upload/live" element={
              <ProtectedRoute>
                <UploadLive />
              </ProtectedRoute>
            } />
            <Route path="/upload/manual" element={
              <ProtectedRoute>
                <UploadManual />
              </ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
};

export default App;