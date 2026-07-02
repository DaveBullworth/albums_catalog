import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginPage from './components/LoginPage';
import AlbumsPage from './components/AlbumsPage';
import { check } from './http/userAPI';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, logout } from './slices/userSlice';

const PrivateRoute = ({ children, isAuth }) => {
  return isAuth ? children : <Navigate to="/login" />;
};

function App() {
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.user.isAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // если уже знаем, что авторизован — не запрашиваем снова
    if (isAuth !== null) {
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await check();
        if (res.isAuth) {
          dispatch(setUser(res.user));
        } else {
          dispatch(logout());
        }
      } catch {
        dispatch(logout());
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [dispatch, isAuth]);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/albums"
          element={
            <PrivateRoute isAuth={isAuth}>
              <AlbumsPage />
            </PrivateRoute>
          }
        />
        <Route path="/" element={isAuth ? <Navigate to="/albums" /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
