import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Editor from './components/Editor';
import Viewer from './components/Viewer';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PrivacyPage from './components/static/PrivacyPage';
import SupportPage from './components/static/SupportPage';
import TermsPage from './components/static/TermsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />
        <Route path="/invite/:id" element={<Viewer />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
