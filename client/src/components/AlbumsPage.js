import React, { useState } from 'react';
import AddButton from './AddButton';
import AlbumComponent from './AlbumComponent';
import NavBar from './NavBar';
import LanguageSwitcher from './LanguageSwitcher';
import '../styles/reset.scss';
import '../styles/app.scss';
import { logout } from '../http/userAPI';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../slices/userSlice';
import { useTranslation } from 'react-i18next';

function AlbumsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
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

  const isFiltersDefault = JSON.stringify(filters) === JSON.stringify(defaultFilters);

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

  const handleLogout = async () => {
    try {
      await logout(); // отправка запроса на сервер
      dispatch(setUser(null)); // сбрасываем пользователя в redux
      navigate('/login'); // редирект на логин
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      // можно показать уведомление или тост
    }
  };

  return (
    <div className="app-container">
      <div className="btn-container">
        <div className="language-switcher mb-3">
          <LanguageSwitcher />
        </div>
        <button className="logout-button" onClick={handleLogout}>
          {t('albumsPage.logout')} <i className="bi bi-box-arrow-right"></i>
        </button>
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
        />
        <div className="add-btn-container">
          <AddButton handleReloadAlbums={handleReloadAlbums} />
        </div>
      </div>
    </div>
  );
}

export default AlbumsPage;
