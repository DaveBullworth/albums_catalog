import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/addButton.scss';
import Star from './Star';
import Heart from './Heart';
import { createAlbum, editAlbum, parseAlbumLink } from '../http/albumApi';

const AddButton = ({ onClick, handleReloadAlbums, editedAlbum }) => {
  const { t } = useTranslation();
  const initialTrack = { order: 1, nameTrack: '', estimation: false, link: '' };
  const emptyAlbumData = {
    nameAlbum: '',
    nameBand: '',
    review: '',
    estimation: false,
    favorite: false,
    year: '',
    cover: null,
    link: '',
    tracks: [initialTrack],
  };
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [toastMessage, setToastMessage] = useState('');
  const [albumData, setAlbumData] = useState(emptyAlbumData);
  const [initialAlbumData, setInitialAlbumData] = useState(emptyAlbumData);
  const [mainModal, setMainModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 1000);
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      window.$('#resToast').toast('show');
    }, 0);
  };

  const handleInputChange = (e, index) => {
    const { name, value, type, checked } = e.target;

    if (name === 'year') {
      // Проверяем, что введенное значение состоит из цифр и не превышает 4 символов
      const isValidYear = /^\d{0,4}$/.test(value);

      if (isValidYear || value === '') {
        setAlbumData((prevData) => ({ ...prevData, [name]: value }));
      }
    } else if (['nameBand', 'nameAlbum', 'review', 'spotifyLink'].includes(name)) {
      const maxLengths = {
        nameBand: 200,
        nameAlbum: 200,
        spotifyLink: 200,
        review: 1500,
      };

      if (value.length <= maxLengths[name]) {
        setAlbumData((prevData) => ({ ...prevData, [name]: value }));
      }
    } else if (name.includes('tracks')) {
      const newTracks = [...albumData.tracks];
      const [trackIndex, trackField] = name.match(/\[(\d+)\]\.(\w+)/).slice(1);

      if (trackField === 'estimation') {
        // Handle track estimation using Heart component
        newTracks[trackIndex][trackField] = checked;
      } else {
        const valueToSet = type === 'checkbox' ? checked : value;
        // Валидация длины nameTrack и link
        if (
          (trackField === 'nameTrack' || trackField === 'link') &&
          typeof valueToSet === 'string' &&
          valueToSet.length < 200
        ) {
          newTracks[trackIndex][trackField] = type === 'checkbox' ? checked : value;
        }
      }

      setAlbumData((prevData) => ({ ...prevData, tracks: newTracks }));
    } else {
      setAlbumData((prevData) => ({ ...prevData, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleAddTrack = () => {
    const newTrack = {
      order: albumData.tracks.length + 1,
      nameTrack: '',
      estimation: false,
      link: '',
    };
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
    if (!hasFormChanged()) {
      return false; // Возвращаем false — модалку не закрываем
    }

    // Валидация обязательных полей
    const requiredFields = ['cover', 'nameAlbum', 'nameBand', 'year', 'review'];
    const missingFields = requiredFields.filter((field) => !albumData[field]);

    if (missingFields.length > 0) {
      showToastMessage({
        type: 'error',
        head: t('addButton.validationErrorHead'),
        body: t('addButton.validationErrorBody', {
          fields: missingFields.map((field) => t(`addButton.fields.${field}`)).join(', '),
        }),
      });

      return false; // Возвращаем false — модалку не закрываем
    }

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
          head: t(`addButton.successHead_${actionVerb}`), // e.g. "Success editing!" / "Success adding!"
          body: (
            <span>
              {t(`addButton.successBody_${actionVerb}`, {
                band: albumData.nameBand,
                album: albumData.nameAlbum,
              })}
            </span>
          ),
        });
        setAlbumData(emptyAlbumData);
        handleReloadAlbums(true);
        return true; // Всё прошло успешно — можно закрывать модалку
      }
    } catch (error) {
      showToastMessage({
        type: 'error',
        head: t('addButton.errorHead', { message: error.message }),
        body: editedAlbum
          ? t('addButton.errorBodyEdit', {
              band: albumData.nameBand,
              album: albumData.nameAlbum,
            })
          : t('addButton.errorBodyAdd'),
      });
    }
    return false; // Если в try не получилось, модалку тоже не закрываем
  };

  const deepEqual = (a, b) => {
    if (a === b) return true;

    if (typeof a !== typeof b) return false;

    if (typeof a !== 'object' || a === null || b === null) return false;

    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    for (let key of keysA) {
      if (!deepEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  };

  const hasFormChanged = () => {
    return !deepEqual(albumData, initialAlbumData);
  };

  const handleModalClose = () => {
    if (hasFormChanged()) {
      mainModal.hide();
      confirmModal.show();
    } else {
      actuallyCloseModal();
    }
  };

  const actuallyCloseModal = () => {
    setAlbumData(emptyAlbumData);
    handleReloadAlbums(true);
    if (editedAlbum) onClick();
  };

  const parseAlbumData = () => {
    const { link } = albumData;
    if (!link) {
      showToastMessage({
        type: 'error',
        head: t('addButton.errorHead', { message: t('addButton.noLinkMessage') }),
        body: t('addButton.noLinkBody'),
      });
      return;
    }

    setIsParsing(true); // <-- включаем затемнение

    // Call parseAlbumLink function and handle the response
    parseAlbumLink(link)
      .then((albumInfo) => {
        if (!albumInfo) {
          showToastMessage({
            type: 'error',
            head: t('addButton.errorHead', { message: t('addButton.fetchFailed') }),
            body: t('addButton.fetchFailedBody'),
          });
          return;
        }
        // Update albumData state with fetched album info
        setAlbumData((prevData) => ({
          ...prevData,
          nameAlbum: albumInfo.albumName,
          nameBand: albumInfo.bandName,
          review: albumInfo.cover,
          year: albumInfo.year,
          tracks: albumInfo.tracks.map((track, index) => ({
            order: index + 1,
            nameTrack: track.trackName,
            link: track.trackLink,
            estimation: false,
          })),
          // Update other fields accordingly
        }));
      })
      .catch((error) => {
        console.error('Error parsing album link:', error);
        showToastMessage({
          type: 'error',
          head: t('addButton.errorHead', { message: error.message }),
          body: t('addButton.parseErrorBody'),
        });
      })
      .finally(() => {
        setIsParsing(false); // <-- выключаем затемнение
      });
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const main = new window.bootstrap.Modal(document.getElementById('exampleModal'));
    const confirm = new window.bootstrap.Modal(document.getElementById('confirmModal'));
    setMainModal(main);
    setConfirmModal(confirm);

    if (editedAlbum) {
      main.show();
    }

    const album = editedAlbum
      ? {
          nameAlbum: editedAlbum.nameAlbum,
          nameBand: editedAlbum.nameBand,
          review: editedAlbum.review,
          estimation: editedAlbum.estimation,
          favorite: editedAlbum.favorite,
          year: editedAlbum.year,
          cover: editedAlbum.cover,
          link: editedAlbum.link,
          tracks: editedAlbum.tracks || [initialTrack],
        }
      : emptyAlbumData;

    setAlbumData(album);
    setInitialAlbumData(JSON.parse(JSON.stringify(album))); // ← Сохраняем изначальное состояние
  }, [editedAlbum]);

  return (
    <>
      {!editedAlbum && (
        <button className="neumorphic" onClick={() => mainModal.show()}>
          <i className="fas fa-plus"></i>
        </button>
      )}
      <div
        className="modal fade album-modal"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                {editedAlbum ? t('addButton.editAlbumTitle') : t('addButton.addNewAlbum')}
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleModalClose}
              ></button>
            </div>
            <div className="modal-body d-flex">
              {/* Left side - Inputs */}
              <div className={`p-3 ${isMobile ? '' : 'w-50'} leftInputs`}>
                <div className="mb-3">
                  <label htmlFor="albumName" className="form-label">
                    {t('addButton.albumName')}
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
                    {t('addButton.bandName')}
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
                    {t('addButton.review')}
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
                    {t('addButton.spotifyLink')}
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
                  <button type="button" className="btn btn-primary" onClick={parseAlbumData}>
                    {t('addButton.getInfoFromSpotify')}
                  </button>
                </div>
              </div>

              {/* Right side - Other elements */}
              <div className={`p-3 ${isMobile ? '' : 'w-50'} rightInputs`}>
                <div className="year_estimation_favorite">
                  <div className="mb-3 row align-items-center releaseYear">
                    <label htmlFor="releaseYear" className="col-sm-4 col-form-label">
                      {t('addButton.releaseYear')}
                    </label>
                    <div className="col-sm-3">
                      <input
                        style={{ textAlign: 'center' }}
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
                      {t('addButton.estimation')}
                    </label>
                  </div>
                  <div className="mb-3 form-check">
                    <Star
                      selected={albumData.favorite}
                      onChange={(value) => setAlbumData({ ...albumData, favorite: value })}
                      index={'modalStar'}
                    />
                    <label className="form-check-label" htmlFor="favorite">
                      {t('addButton.favorite')}
                    </label>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="cover" className="form-label">
                    {t('addButton.albumCover')}
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
                    <label className="form-label">
                      {t('addButton.track')} {index + 1}
                    </label>
                    <div className="d-flex">
                      <input
                        style={{ width: '15%', textAlign: 'center' }}
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
                        placeholder={t('addButton.trackName')}
                        name={`tracks[${index}].nameTrack`}
                        value={track.nameTrack}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                      <Heart
                        selected={track.estimation}
                        onChange={(value) =>
                          handleInputChange(
                            { target: { name: `tracks[${index}].estimation`, checked: value } },
                            index
                          )
                        }
                        affiliation={`track`}
                        index={index}
                      />
                      <input
                        type="text"
                        className="form-control me-2"
                        placeholder={t('addButton.spotifyLink')}
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
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={handleModalClose}
              >
                {t('addButton.close')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  const success = await handleAddButtonClick();
                  if (success) {
                    mainModal.hide();
                  }
                }}
              >
                {editedAlbum ? t('addButton.save') : t('addButton.add')}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Toast Message (edit/add)*/}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: '1056' }}>
        <div
          className="toast"
          id="resToast"
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
            ></button>
          </div>
          <div className={`toast-body ${toastMessage.type === 'error' ? 'error' : 'success'}`}>
            {toastMessage.body}
          </div>
        </div>
      </div>
      <div
        className="modal fade confirm"
        id="confirmModal"
        tabIndex="-1"
        aria-labelledby="confirmModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t('addButton.attention')}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  confirmModal.hide();
                  mainModal.show();
                }}
              />
            </div>
            <div className="modal-body">
              <p>{t('addButton.unsavedChangesConfirm')}</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  confirmModal.hide();
                  mainModal.show();
                }}
              >
                {t('addButton.cancel')}
              </button>
              <button
                className="btn btn-danger confrim-modal"
                onClick={() => {
                  confirmModal.hide();
                  actuallyCloseModal();
                }}
              >
                {t('addButton.confirm')}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isParsing && (
        <div className="loader-container">
          <div className="loader-text">{t('addButton.apiLoading')}</div>
          <div className="loader" />
        </div>
      )}
    </>
  );
};

export default AddButton;
