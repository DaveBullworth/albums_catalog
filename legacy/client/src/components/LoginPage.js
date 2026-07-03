import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../slices/userSlice';
import { login as login_, registration, check } from '../http/userAPI';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import '../styles/login.scss';

const LoginPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Простая валидация
    const loginValid = /^[a-zA-Z0-9_.]{6,40}$/.test(login);
    const passwordValid = password.length >= 6 && password.length <= 40;

    if (mode === 'register' && !loginValid) {
      return setError(t('loginPage.invalidLogin'));
    }

    if (mode === 'register' && !passwordValid) {
      return setError(t('loginPage.invalidPassword'));
    }
    try {
      if (mode === 'login') {
        await login_(login, password);
      } else {
        await registration({ login, password });
      }
      const res = await check(); // затем проверяем авторизацию

      if (res.isAuth) {
        dispatch(setUser(res.user));
        navigate('/albums');
      } else {
        setError(t('loginPage.authorizationFailed'));
      }
    } catch (err) {
      const defaultError =
        mode === 'login' ? t('loginPage.loginFailed') : t('loginPage.registerFailed');

      setError(err.response?.data?.message || defaultError);
    }
  };

  return (
    <div className="login-page">
      <div className="theme-switcher">
        <ThemeSwitcher />
      </div>
      <div className="login-form-container">
        <h2 className="text-center mb-4 title">
          {' '}
          {mode === 'login' ? t('loginPage.enter') : t('loginPage.registration')}
        </h2>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="login" className="form-label">
              {t('loginPage.login')}
            </label>
            <input
              type="text"
              className="form-control"
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              {t('loginPage.password')}
            </label>
            <div className="password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100">
            {mode === 'login' ? t('loginPage.toEnter') : t('loginPage.register')}
          </button>
        </form>
        <p className="text-center mt-3">
          {mode === 'login' ? (
            <>
              <span className="add-text">{t('loginPage.noAccount')} </span>
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => setMode('register')}
              >
                {t('loginPage.registerHere')}
              </button>
            </>
          ) : (
            <>
              <span className="add-text">{t('loginPage.haveAccount')} </span>
              <button type="button" className="btn btn-link p-0" onClick={() => setMode('login')}>
                {t('loginPage.loginHere')}
              </button>
            </>
          )}
        </p>
      </div>
      <div className="language-switcher mb-3">
        <LanguageSwitcher />
      </div>
    </div>
  );
};

export default LoginPage;
