import React, { useLayoutEffect, useState, useRef, useEffect } from 'react';
import AddButton from './AddButton';
import Card from './Card';
import AlbumInfo from './AlbumInfo';
import '../styles/albumComponent.scss';
import '../http/albumApi';
import { fetchAlbums, fetchOneAlbum, deleteAlbum } from '../http/albumApi';

const AlbumComponent = ({reload, handleReloadAlbums, filters}) => {
  const [albumData, setAlbumData] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [albumInfoHeight, setAlbumInfoHeight] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [_deleteAlbum, setDeleteAlbum] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAlbumData, setEditAlbumData] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 4;

  const albumInfoRef = useRef(null);

  useLayoutEffect(() => {
    const fetchData = async () => {
      const data = await fetchAlbums(currentPage, PAGE_SIZE, filters);
      setTotalPages(Math.ceil(data.count / PAGE_SIZE));
      setAlbumData(data.rows);
    };

    setTimeout(() => {
      if (albumInfoRef.current) {
        const height = albumInfoRef.current.scrollHeight;
        setAlbumInfoHeight(height);
      }
    }, 100);
  
    if (reload) {
      handleCollapse();
      fetchData();
      handleReloadAlbums(false); 
    }
  }, [selectedAlbum, currentPage, reload]);

  useEffect(() => {
    if (isDeleteModalOpen) {
      window.$('#deleteModal').modal('show');
    } else {
      window.$('#deleteModal').modal('hide');
    }
  }, [isDeleteModalOpen]);

  useEffect(() => {
    setCurrentPage(1)
  }, [filters]);
  
  const handleCardClick = (albumId, index) => {
    if (expandedCardIndex === index) {
      // Нажатие на уже раскрытую карточку должно закрывать ее
      handleCollapse();
    } else {
      // Нажатие на другую карточку: сначала закрываем текущую, затем открываем новую
      handleCollapse();
      handleExpand(albumId, index);
    }
  };

  const handleExpand = async (albumId, index) => {
    setExpandedCardIndex(index);
    // Получаем данные альбома для выбранной карточки
    await fetchOneAlbum(albumId).then((data) => {
      setSelectedAlbum(data);
    });
  };

  const handleCollapse = () => {
    setExpandedCardIndex(null);
  };

  const handleDeleteClick = (index) => {
    setDeleteAlbum(albumData[index]);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAlbum(_deleteAlbum.id);
      showToastMessage({
        type: 'success',
        head: `Success!`,
        body: (
          <span>
            Successfully deleted: <strong>{_deleteAlbum.nameBand}</strong> - <strong>{_deleteAlbum.nameAlbum}</strong>
          </span>
        )
      });
      closeDeleteModal();
      handleReloadAlbums(true); 
    } catch (error) {
      showToastMessage({
        type: 'error',
        head: `Error! [${error.message}]`,
        body: (
          <span>
            Unable to deleted: <strong>{_deleteAlbum.nameBand}</strong> - <strong>{_deleteAlbum.nameAlbum}</strong>
          </span>
        )
      });
      closeDeleteModal();
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteAlbum(null);
  };

  const handleEditClick = async (albumId) => {
    await fetchOneAlbum(albumId).then((data) => {
      setEditAlbumData(data);
    });
    setIsEditModalOpen(true);
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      window.$("#delToast").toast('show')
    }, 0)
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }
    return pages;
  };

  return (
    <div className="list">
      {albumData.map((album, index) => (
        <React.Fragment key={album.id}>
          <Card
            _key={album.id}
            number={index}
            year={album.year}
            imageSrc={album.cover}
            albumName={album.nameAlbum}
            bandName={album.nameBand}
            icon1={album.estimation}
            icon2={album.favorite}
            link={album.link}
            actions={{
              edit: () => handleEditClick(album.id),
              delete: () => handleDeleteClick(index),
              expand: () => handleCardClick(album.id, index),
            }}
            isExpanded={expandedCardIndex === index}
          />
          <div className={`album-info ${expandedCardIndex === index ? 'expanded' : ''}`} 
              style={{ maxHeight: expandedCardIndex === index ? albumInfoHeight + 'px' : '0',
              transition: `max-height 0.3s ease-out` }}>
            {expandedCardIndex === index && (
              <AlbumInfo
                albumData={selectedAlbum}
                ref={albumInfoRef}
              />
            )}
          </div>
        </React.Fragment>
      ))}
      {/* Pagination */}
      <nav aria-label="Page navigation example">
        <ul className="pagination justify-content-center">
          {renderPagination()}
        </ul>
      </nav>
      {/* Modal for Editing Album */}
      {isEditModalOpen && (
        <AddButton
          onClick={() => setIsEditModalOpen(false)}
          handleReloadAlbums={handleReloadAlbums}
          editedAlbum={editAlbumData} // Pass edited album data to AddButton
        />
      )}
      {/* Modal for Deleting Album */}
      <div className="modal fade" id="deleteModal" tabIndex="-1" role="dialog" aria-labelledby="deleteModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteModalLabel">Delete Album</h5>
              <button 
                type="button" 
                className="close" 
                data-dismiss="modal" 
                aria-label="Close" 
                onClick={closeDeleteModal}
              >
                <span aria-hidden="true">
                  <i 
                    style={{ color: 'red' }} 
                    className="bi bi-x-circle-fill" 
                    onMouseOver={(e) => e.target.className = 'bi bi-x-circle'} 
                    onMouseOut={(e) => e.target.className = 'bi bi-x-circle-fill'}>
                  </i>
                </span>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete</p>
              <p><b>{` ${_deleteAlbum?.nameBand} - ${_deleteAlbum?.nameAlbum} (${_deleteAlbum?.year})`}</b> album?</p>
              <img 
                src={_deleteAlbum && process.env.REACT_APP_API_URL + _deleteAlbum?.cover} 
                alt="Album Cover"
                style={{ width: '200px', height: '200px', marginTop: '10px' }}
              />
            </div>
            <div className="modal-footer" style={{justifyContent: 'center', gap: '40px'}}>
              <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={closeDeleteModal}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      </div>
      {/* Toast Message (delete)*/}
      <div className="position-fixed bottom-0 end-0 p-3" style={{zIndex: "11"}}>
        <div 
          className='toast'
          id="delToast"
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
    </div>
  );
};

export default AlbumComponent;