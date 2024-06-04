import React, { useState, useEffect } from 'react';
import '../styles/addButton.scss';
import Star from './Star'
import Heart from './Heart';
import { createAlbum, editAlbum, parseAlbumLink } from '../http/albumApi';


const AddButton = ({ onClick, handleReloadAlbums, editedAlbum }) => {
  const initialTrack = { order: 1, nameTrack: '', estimation: false, link: '' };

  const [toastMessage, setToastMessage] = useState('');
  
  const [albumData, setAlbumData] = useState({
    nameAlbum: '',
    nameBand: '',
    review: '',
    estimation: false,
    favorite: false,
    year: '',
    cover: null,
    link: '',
    tracks: [initialTrack],
  });

  useEffect(() => {
    if (editedAlbum) {
      const modal = new window.bootstrap.Modal(document.getElementById('exampleModal'));
      modal.show();
      setAlbumData({
        nameAlbum: editedAlbum.nameAlbum,
        nameBand: editedAlbum.nameBand,
        review: editedAlbum.review,
        estimation: editedAlbum.estimation,
        favorite: editedAlbum.favorite,
        year: editedAlbum.year,
        cover: editedAlbum.cover,
        link: editedAlbum.link,
        tracks: editedAlbum.tracks || [initialTrack],
      });
    } else {
      setAlbumData({
        nameAlbum: '',
        nameBand: '',
        review: '',
        estimation: false,
        favorite: false,
        year: '',
        cover: null,
        link: '',
        tracks: [initialTrack],
      });
    }
  }, [editedAlbum]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      window.$("#resToast").toast('show')
    }, 0)
  };

  const handleInputChange = (e, index) => {
    const { name, value, type, checked } = e.target;
  
    if (name === 'year') {
      // Проверяем, что введенное значение состоит из цифр и не превышает 4 символов
      const isValidYear = /^\d{0,4}$/.test(value);
  
      if (isValidYear || value === '') {
        setAlbumData((prevData) => ({ ...prevData, [name]: value }));
      }
    }
    else if (name.includes("tracks")) {
      const newTracks = [...albumData.tracks];
      const [trackIndex, trackField] = name.match(/\[(\d+)\]\.(\w+)/).slice(1);
  
      if (trackField === 'estimation') {
        // Handle track estimation using Heart component
        newTracks[trackIndex][trackField] = checked;
      } else {
        newTracks[trackIndex][trackField] = type === "checkbox" ? checked : value;
      }
  
      setAlbumData((prevData) => ({ ...prevData, tracks: newTracks }));
    } else {
      setAlbumData((prevData) => ({ ...prevData, [name]: type === "checkbox" ? checked : value }));
    }
  };  

  const handleAddTrack = () => {
    const newTrack = { order: albumData.tracks.length + 1, nameTrack: '', estimation: false, link: '' };
    setAlbumData((prevData) => ({ ...prevData, tracks: [...prevData.tracks, newTrack] }));
  };

  const handleRemoveTrack = (index) => {
    const newTracks = [...albumData.tracks];
    newTracks.splice(index, 1); // Удаляем трек с указанным индексом
  
    // Обновляем порядок у оставшихся треков
    newTracks.forEach((track, i) => {
      track.order = i + 1;
    });
  
    setAlbumData((prevData) => ({ ...prevData, tracks: newTracks }));
  };  

  const handleAddButtonClick = async () => {
    const formData = new FormData();
    formData.append('cover', albumData.cover);
    formData.append('nameAlbum', albumData.nameAlbum);
    formData.append('nameBand', albumData.nameBand);
    formData.append('year', albumData.year);
    formData.append('review', albumData.review);
    formData.append('estimation', albumData.estimation);
    formData.append('favorite', albumData.favorite);
    formData.append('link', albumData.link);

    const tracksArray = albumData.tracks.map((track) => ({
      order: track.order,
      nameTrack: track.nameTrack,
      estimation: track.estimation,
      link: track.link,
    }));
    
    formData.append('tracks', JSON.stringify(tracksArray));    

    try {
      let response;
      let actionVerb = editedAlbum ? 'edit' : 'add';
    
      if (editedAlbum) {
        // If editing an album, call the editAlbum function
        response = await editAlbum(editedAlbum.id, formData);
      } else {
        // If creating a new album, call the createAlbum function
        response = await createAlbum(formData);
      }
    
      if (response) {
        showToastMessage({
          type: 'success',
          head: `Success ${actionVerb}ing!`,
          body: (
            <span>
              Successfully {actionVerb}ed: <strong>{albumData.nameBand}</strong> - <strong>{albumData.nameAlbum}</strong>
            </span>
          )
        });
        setAlbumData({
          nameAlbum: '',
          nameBand: '',
          review: '',
          estimation: false,
          favorite: false,
          year: '',
          cover: null,
          link: '',
          tracks: [initialTrack],
        });
        handleReloadAlbums(true);
      }
    } catch (error) {
      showToastMessage({ 
        type: 'error', 
        head: `Error! [${error.message}]`, 
        body: (editedAlbum ? `Error editing album:${albumData.nameBand}-${albumData.nameAlbum}` : 'Error adding album!') 
      });
    }      
  };

  const handleModalClose = () => {
    setAlbumData({
      nameAlbum: '',
      nameBand: '',
      review: '',
      estimation: false,
      favorite: false,
      year: '',
      cover: null,
      link: '',
      tracks: [initialTrack],
    });
    handleReloadAlbums(true);
    // Установить значение editedAlbum в null
    if(editedAlbum) onClick(); // Это предполагает, что onClick также устанавливает editedAlbum в null
  };

  const parseAlbumData = () => {
    const { link } = albumData;
    if (!link) {
      showToastMessage('Please provide a Spotify link');
      return;
    }

    // Call parseAlbumLink function and handle the response
    parseAlbumLink(link)
      .then(albumInfo => {
        if (!albumInfo) {
          showToastMessage('Failed to fetch album data');
          return;
        }
        // Update albumData state with fetched album info
        setAlbumData(prevData => ({
          ...prevData,
          nameAlbum: albumInfo.albumName,
          nameBand: albumInfo.bandName,
          review: albumInfo.cover,
          year:  albumInfo.year,
          tracks:  albumInfo.tracks.map((track, index) => ({
            order: index + 1,
            nameTrack: track.trackName,
            link: track.trackLink,
            estimation: false
          }))
          // Update other fields accordingly
        }));
      })
      .catch(error => {
        console.error('Error parsing album link:', error);
        showToastMessage('Error parsing album link');
      });
  };

  return (
    <>
      { !editedAlbum && 
        <button className="neumorphic" onClick={onClick} data-bs-toggle="modal" data-bs-target="#exampleModal">
          <i className="fas fa-plus"></i>
        </button>
      }
      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Adding new album
              </h1>
              <button 
                type="button" 
                className="btn-close" 
                data-bs-dismiss="modal" 
                aria-label="Close" 
                onClick={handleModalClose}>
              </button>
            </div>
            <div className="modal-body d-flex">
              {/* Left side - Inputs */}
              <div className="w-50 p-3 leftInputs" >
                <div className="mb-3">
                  <label htmlFor="albumName" className="form-label">
                    Album Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="albumName"
                    name="nameAlbum"
                    value={albumData.nameAlbum}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="bandName" className="form-label">
                    Band Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="bandName"
                    name="nameBand"
                    value={albumData.nameBand}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="review" className="form-label">
                    Review
                  </label>
                  <textarea
                    className="form-control review"
                    id="review"
                    name="review"
                    value={albumData.review}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="spotifyLink" className="form-label">
                    Spotify Link
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="link"
                    name="link"
                    value={albumData.link}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <button 
                    type="button" 
                    style={{width:"70%", marginLeft:"auto"}}
                    className="btn btn-primary"
                    onClick={parseAlbumData}
                  >
                      GET INFO FROM SPOTIFY
                  </button>
                </div>
              </div>
  
              {/* Right side - Other elements */}
              <div className="w-50 p-3 rightInputs">
                <div className='year_estimation_favorite'>
                  <div className="mb-3 row align-items-center">
                    <label htmlFor="releaseYear" className="col-sm-4 col-form-label">
                      Release Year
                    </label>
                    <div className="col-sm-3">
                      <input
                        style={{textAlign: 'center'}}
                        type="text"
                        className="form-control"
                        id="year"
                        name="year"
                        value={albumData.year}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3 form-check">
                    <Heart
                      selected={albumData.estimation}
                      onChange={(value) => setAlbumData({ ...albumData, estimation: value })}
                      affiliation={'album'}
                    />
                    <label className="form-check-label" htmlFor="estimation">
                      Estimation
                    </label>
                  </div>
                  <div className="mb-3 form-check">
                    <Star
                      selected={albumData.favorite}
                      onChange={(value) => setAlbumData({ ...albumData, favorite: value })}
                      index={'modalStar'}
                    />
                    <label className="form-check-label" htmlFor="favorite">
                      Favorite
                    </label>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="cover" className="form-label">
                    Album Cover
                  </label>
                  <input
                    type="file"
                    className="form-control cover"
                    id="cover"
                    name="cover"
                    accept="image/*"
                    onChange={(e) => setAlbumData({ ...albumData, cover: e.target.files[0] })}
                  />
                </div>
  
                {/* Tracks */}
                {albumData.tracks.map((track, index) => (
                  <div key={index} className="mb-3">
                    <label className="form-label">Track {index + 1}</label>
                    <div className="d-flex">
                      <input
                        style={{width:'15%', textAlign: 'center'}}
                        type="text"
                        className="form-control me-2"
                        placeholder="Order"
                        name={`tracks[${index}].order`}
                        value={track.order}
                        readOnly
                      />
                      <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Track Name"
                        name={`tracks[${index}].nameTrack`}
                        value={track.nameTrack}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                      <Heart 
                        selected={track.estimation}
                        onChange={(value) => handleInputChange({ target: { name: `tracks[${index}].estimation`, checked: value } }, index)}
                        affiliation={`track`}
                        index={index}
                      />
                      <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Spotify Link"
                        name={`tracks[${index}].link`}
                        value={track.link}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleRemoveTrack(index)}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                ))}
                {/* Add Track Button */}
                <button type="button" className="btn btn-success" onClick={handleAddTrack}>
                  <i className="bi bi-plus"></i>
                </button>
              </div>
            </div>
  
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={handleModalClose}>
                Close
              </button>
              <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={handleAddButtonClick}>
                {editedAlbum ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Toast Message (edit/add)*/}
      <div className="position-fixed bottom-0 end-0 p-3" style={{zIndex: "11"}}>
        <div 
          className='toast'
          id="resToast"
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true" 
          style={{ animation: "slideInRight 0.5s forwards" }}
          >
          <div className={`toast-header ${toastMessage.type === 'error' ? 'error' : 'success'}`}>
            <strong className="me-auto">{toastMessage.head}</strong>
            <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div className={`toast-body ${toastMessage.type === 'error' ? 'error' : 'success'}`}>
            {toastMessage.body}
          </div>
        </div>
      </div>
    </>
  );  

};

export default AddButton;