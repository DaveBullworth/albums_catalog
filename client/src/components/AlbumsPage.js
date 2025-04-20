import React, { useState } from 'react';
import AddButton from './AddButton';
import AlbumComponent from './AlbumComponent';
import NavBar from './NavBar';
import '../styles/reset.scss';
import '../styles/app.scss';
import { logout } from '../http/userAPI';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../slices/userSlice';

function AlbumsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [reloadAlbums, setReloadAlbums] = useState(true);
  const [filters, setFilters] = useState({
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
  const [reset, setReset] = useState(false);

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
      <button className="logout-button" onClick={handleLogout}>
        Logout <i className="bi bi-box-arrow-right"></i>
      </button>
      <div className="filter-container">
        <NavBar
          filters={filters}
          setFilters={setFilters}
          handleReloadAlbums={handleReloadAlbums}
          reset={reset}
        />
        <button
          type="button"
          className="btn btn-secondary reset-filters"
          onClick={handleResetFilters}
        >
          Reset
        </button>
      </div>
      <div className="content-container">
        <AlbumComponent
          reload={reloadAlbums}
          handleReloadAlbums={handleReloadAlbums}
          filters={filters}
        />
        <AddButton handleReloadAlbums={handleReloadAlbums} />
      </div>
    </div>
  );
}

export default AlbumsPage;
