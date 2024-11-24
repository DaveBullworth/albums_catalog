import React, { useState } from 'react';
import AddButton from './components/AddButton';
import AlbumComponent from './components/AlbumComponent';
import NavBar from './components/NavBar';
import './styles/reset.scss';
import './styles/app.scss';

function App() {
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

  return (
    <div className="app-container">
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

export default App;
