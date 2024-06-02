import React, { useState } from 'react';
import AddButton from './components/AddButton';
import AlbumComponent from './components/AlbumComponent';
import NavBar from './components/NavBar';
import './styles/reset.css';
import './styles/app.css';

function App() {
  const [reloadAlbums, setReloadAlbums] = useState(true);
  const [filters, setFilters] = useState({
    yearA: '',
    yearB: '',
    estimation: false,
    favorite: false,
    nameBand: '',
    nameAlbum: '',
    sortYear: false
  });
  const handleReloadAlbums = (shouldReload) => {
    setReloadAlbums(shouldReload);
  };
  
  return (
    <div className="app-container">
      <div className="filter-container">
        <NavBar 
          filters={filters} 
          setFilters={setFilters}
          handleReloadAlbums={handleReloadAlbums} 
        />
      </div>
      <div className="content-container">
        <AlbumComponent 
          reload={reloadAlbums} 
          handleReloadAlbums={handleReloadAlbums} 
          filters={filters} 
        />
        <AddButton handleReloadAlbums={handleReloadAlbums}/>
      </div>
    </div>
  );
}

export default App;