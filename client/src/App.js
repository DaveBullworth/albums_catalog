import React, { useState } from 'react';
import AddButton from './components/AddButton';
import AlbumComponent from './components/AlbumComponent';
import NavBar from './components/NavBar';
import './styles/reset.css';
import './styles/app.css';

function App() {
  const [reloadAlbums, setReloadAlbums] = useState(false);
  const [filters, setFilters] = useState({
    yearA: '',
    yearB: '',
    estimation: false,
    favorite: false,
    nameBand: ''
  });
  const handleReloadAlbums = (shouldReload) => {
    setReloadAlbums(shouldReload);
  };
  //console.log(filters)
  
  return (
    <div className="app-container">
      <div className="filter-container">
        <NavBar filters={filters} setFilters={setFilters}/>
      </div>
      <div className="content-container">
        <AlbumComponent reload={reloadAlbums} handleReloadAlbums={handleReloadAlbums}/>
        <AddButton handleReloadAlbums={handleReloadAlbums}/>
      </div>
    </div>
  );
}

export default App;