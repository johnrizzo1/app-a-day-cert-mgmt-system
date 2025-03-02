import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import Navigation from './components/Navigation';
import CertificateList from './pages/CertificateList';
import CertificateDetail from './pages/CertificateDetail';
import CertificateCreate from './pages/CertificateCreate';
import CertificateEdit from './pages/CertificateEdit';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="App">
      <Navigation />
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<CertificateList />} />
          <Route path="/certificates" element={<CertificateList />} />
          <Route path="/certificates/new" element={<CertificateCreate />} />
          <Route path="/certificates/:id" element={<CertificateDetail />} />
          <Route path="/certificates/:id/edit" element={<CertificateEdit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;