import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import AddButton from './AddButton';
import AlbumComponent from './AlbumComponent';
import NavBar from './NavBar';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import UserMenu from './UserMenu';
import { updateUser, deleteUser } from '../http/userAPI';
import { setUser, logout } from '../slices/userSlice';
import '../styles/reset.scss';
import '../styles/app.scss';

function AlbumsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const defaultFilters = {
    yearA: '',
    yearB: '',
    estimation: false,
    favorite: false,
    nameBand: '',
    nameAlbum: '',
    sortYear: false,
    sortBandName: false,
    sortAlbumName: false,
  };
  const [reloadAlbums, setReloadAlbums] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [reset, setReset] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState(user?.login || '');
  const [password, setPassword] = useState('');
  const [toastMessage, setToastMessage] = useState({ type: '', head: '', body: '' });

  const inputIdLogin = `editLogin-${user?.id ?? 'new'}`;
  const inputIdPassword = `editPassword-${user?.id ?? 'new'}`;

  const isFiltersDefault = JSON.stringify(filters) === JSON.stringify(defaultFilters);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      window.$('#userToast').toast('show');
    }, 0);
  };

  const handleSave = async () => {
    const loginChanged = login !== user?.login;
    const loginValid = /^[a-zA-Z0-9_.]{6,40}$/.test(login);
    const passwordValid = password.length === 0 || (password.length >= 6 && password.length <= 40);

    if (!loginChanged && !password) return;

    if ((loginChanged && !loginValid) || !passwordValid) {
      showToastMessage({
        type: 'error',
        head: t('userMenu.validationErrorHead'),
        body: t('userMenu.validationErrorBody'),
      });
      return;
    }

    const payload = {};
    if (loginChanged) payload.login = login;
    if (password) payload.newPassword = password;

    try {
      const updatedUser = await updateUser(payload);
      if (loginChanged) dispatch(setUser(updatedUser));
      showToastMessage({
        type: 'success',
        head: t('userMenu.successHead'),
        body: t('userMenu.editSuccess'),
      });
      setIsEditModalOpen(false);
      setPassword('');
    } catch (error) {
      showToastMessage({
        type: 'error',
        head: t('userMenu.editErrorHead'),
        body: error.message || t('userMenu.editErrorBody'),
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser();
      setIsDeleteModalOpen(false);
      dispatch(logout());
      // Перезагрузка страницы (например, редирект на /login)
      window.location.href = '/login';
    } catch (error) {
      showToastMessage({
        type: 'error',
        head: t('userMenu.editDeleteHead'),
        body: error.message || t('userMenu.deleteErrorBody'),
      });
    }
  };

  const handleReloadAlbums = (shouldReload) => {
    setReloadAlbums(shouldReload);
  };

  const handleResetFilters = () => {
    setFilters({
      yearA: '',
      yearB: '',
      estimation: false,
      favorite: false,
      nameBand: '',
      nameAlbum: '',
      sortYear: false,
      sortBandName: false,
      sortAlbumName: false,
    });
    setReset(!reset);
    handleReloadAlbums(true);
  };

  useEffect(() => {
    if (isDeleteModalOpen) {
      window.$('#deleteUserModal').modal('show');
    } else {
      window.$('#deleteUserModal').modal('hide');
    }
  }, [isDeleteModalOpen]);

  useEffect(() => {
    if (isEditModalOpen) {
      window.$('#editUserModal').modal('show');
    } else {
      window.$('#editUserModal').modal('hide');
      setLogin(user?.login || '');
      setPassword('');
    }
  }, [isEditModalOpen]);

  return (
    <div className="app-container">
      <div className="btn-container">
        <div className="theme-switcher">
          <ThemeSwitcher />
        </div>
        <div className="language-switcher mb-3">
          <LanguageSwitcher />
        </div>
        <div className="user-menu">
          <UserMenu
            user={user}
            onEditClick={() => setIsEditModalOpen(true)}
            onDeleteClick={() => setIsDeleteModalOpen(true)}
          />
        </div>
      </div>
      <div className="filter-container">
        <NavBar
          filters={filters}
          setFilters={setFilters}
          handleReloadAlbums={handleReloadAlbums}
          reset={reset}
        />
        {!isFiltersDefault && (
          <button
            type="button"
            className="btn btn-secondary reset-filters"
            onClick={handleResetFilters}
          >
            {t('albumsPage.reset')}
          </button>
        )}
      </div>
      <div className="content-container">
        <AlbumComponent
          reload={reloadAlbums}
          handleReloadAlbums={handleReloadAlbums}
          filters={filters}
          showToastMessage={showToastMessage}
        />
        <div className="add-btn-container">
          <AddButton handleReloadAlbums={handleReloadAlbums} />
        </div>
      </div>
      {/* Edit Modal */}
      <div
        className="modal fade edit-user"
        tabIndex="-1"
        id="editUserModal"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t('userMenu.editTitle')}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsEditModalOpen(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id={inputIdLogin}
                  placeholder={t('userMenu.loginPlaceholder')}
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                />
                <label htmlFor={inputIdLogin}>{t('userMenu.loginLabel')}</label>
              </div>

              <div className="form-floating position-relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control pe-5"
                  id={inputIdPassword}
                  placeholder={t('userMenu.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label htmlFor={inputIdPassword}>{t('userMenu.passwordLabel')}</label>
                <i
                  className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'} position-absolute top-50 end-0 translate-middle-y me-3`}
                  style={{ cursor: 'pointer', zIndex: 5 }}
                  onClick={() => setShowPassword((prev) => !prev)}
                ></i>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                {t('userMenu.cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {t('userMenu.save')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <div
        className="modal fade delete-user"
        tabIndex="-1"
        id="deleteUserModal"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t('userMenu.deleteTitle')}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsDeleteModalOpen(false)}
              ></button>
            </div>
            <div className="modal-body">
              {t('userMenu.confirmDelete')} <strong>{user?.login}</strong>?<br />
              <span className="text">{t('userMenu.deleteWarning')}</span>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
                {t('userMenu.cancel')}
              </button>
              <button className="btn btn-danger" onClick={handleDeleteUser}>
                {t('userMenu.delete')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Message (delete)*/}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: '1056' }}>
        <div
          className="toast"
          id="userToast"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ animation: 'slideInRight 0.5s forwards' }}
        >
          <div className={`toast-header ${toastMessage.type === 'error' ? 'error' : 'success'}`}>
            <strong className="me-auto">{toastMessage.head}</strong>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="toast"
              aria-label="Close"
            />
          </div>
          <div className={`toast-body ${toastMessage.type === 'error' ? 'error' : 'success'}`}>
            {toastMessage.body}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlbumsPage;
