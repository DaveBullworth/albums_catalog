import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../http/userAPI';
import { logout as logout_ } from '../slices/userSlice';
import { useTranslation } from 'react-i18next';
import '../styles/userMenu.scss';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const UserMenu = ({ user, onEditClick, onDeleteClick }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logout_());
      navigate('/login');
    } catch (error) {
      showToastMessage({
        type: 'error',
        head: t('userMenu.logoutErrorHead'),
        body: error.message || t('userMenu.logoutErrorBody'),
      });
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      window.$('#delToast').toast('show');
    }, 0);
  };

  return (
    <>
      {/* Dropdown */}
      <div className="dropdown">
        <button
          className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2"
          type="button"
          id="userDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="bi bi-person-circle"></i>
          {user?.login}
        </button>
        <ul className="dropdown-menu" aria-labelledby="userDropdown">
          <li>
            <button className="dropdown-item edit" onClick={onEditClick}>
              <i className="bi bi-pencil-square"></i>
              <span>{t('userMenu.edit')}</span>
            </button>
          </li>
          <li>
            <button className="dropdown-item delete" onClick={onDeleteClick}>
              <i className="bi bi-trash3"></i>
              <span>{t('userMenu.delete')}</span>
            </button>
          </li>
          <li>
            <button className="dropdown-item logout" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i>
              <span>{t('userMenu.logout')}</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Toast Message (delete)*/}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: '11' }}>
        <div
          className="toast"
          id="delToast"
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
    </>
  );
};

export default UserMenu;
