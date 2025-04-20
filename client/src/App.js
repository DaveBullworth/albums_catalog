import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginPage from './components/LoginPage';
import AlbumsPage from './components/AlbumsPage';
import { AuthProvider, useAuth } from './components/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return isAuth ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/albums"
            element={
              <PrivateRoute>
                <AlbumsPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
