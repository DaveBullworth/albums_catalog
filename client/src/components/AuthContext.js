import { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { check } from '../http/userAPI';
import { setUser, logout } from '../slices/userSlice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuth, user } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(true); // ⬅️ добавляем флаг загрузки

  useEffect(() => {
    const checkAuthStatus = async () => {
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
        setIsLoading(false); // ⬅️ завершаем загрузку
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ isAuth, user, isLoading }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
