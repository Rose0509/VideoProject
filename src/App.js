import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { CallPage } from './pages/CallPage';
import Layout from './components/Layout';
import { WebRTCProvider } from './context/WebRTCContext';

// Composant principal de l'application
const App = () => {
  return (
    <WebRTCProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/call/:callId" element={<CallPage />} />
        </Routes>
      </Layout>
    </WebRTCProvider>
  );
};

export default App;
