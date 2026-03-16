import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Editor from './components/Editor';
import Viewer from './components/Viewer';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
