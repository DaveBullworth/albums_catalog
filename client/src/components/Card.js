import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setDominantColor } from '../store';
import ColorThief from 'colorthief';
import tinycolor from 'tinycolor2';
import '../styles/card.css';
import '../../node_modules/bootstrap-icons/font/bootstrap-icons.css';

const Card = ({ _key, number, year, imageSrc, albumName, bandName, icon1, icon2, link, actions, isExpanded }) => {
  const dispatch = useDispatch();
  const [dominantColor, setDominantColorLocal] = useState('#ffffff'); 
  const [rippleColor, setRippleColor] = useState('#ffffff');
  const isColorDark = tinycolor(dominantColor).isDark();

  const albumId = _key;

  useEffect(() => {
    const img = new Image();
    img.src = process.env.REACT_APP_API_URL + imageSrc;
    img.crossOrigin = 'Anonymous';
  
    img.onload = async () => {
      const colorThief = new ColorThief();
      const color = colorThief.getColor(img);
  
      const rgbColor = `rgb(${color.join(',')})`;
      let dominantColor;
      if(tinycolor(rgbColor).getBrightness()<20){
        dominantColor = tinycolor(rgbColor).lighten(10).toRgbString();
      } else {
        dominantColor = tinycolor(rgbColor).toRgbString();
      }
      
      dispatch(setDominantColor({ albumId, dominantColor }));
      // Обновить локальное состояние
      setDominantColorLocal(dominantColor);
  
      const lightenedColor = tinycolor(rgbColor).lighten(30).toRgbString();
      setRippleColor(lightenedColor);
    };
  }, [imageSrc, dispatch, albumId]);

  const handleCardClick = (e) => {
    // Проверка, не было ли нажато на кнопку edit или delete
    if (actions && typeof actions.expand === 'function') {
      actions.expand(e);
    }
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    actions.edit();
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    actions.delete();
  };

  const handleImageClick = (event) => {
    event.stopPropagation();
    console.log(link)
    window.open(link, '_blank');
  };

  const handleRippleClick = (event) => {
    const element = event.currentTarget;
    const ink = document.createElement('span');
    ink.classList.add('ink');

    ink.style.backgroundColor = rippleColor; 

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ink.style.width = ink.style.height = size + 'px';
    ink.style.top = y + 'px';
    ink.style.left = x + 'px';

    element.appendChild(ink);

    ink.classList.add('animate');
  };

  const getBandNameClass = () => {
    if (bandName.length > 50) {
      return 'small-font tight-spacing';
    } else if (bandName.length > 35) {
      return 'tight-spacing';
    }
    return '';
  };

  const getAlbumNameClass = () => {
    if (albumName.length > 40) {
      return 'small-font';
    } else if (albumName.length > 30) {
      return 'tight-spacing';
    }
    return '';
  };

  return (
    <div className="card-wrapper" onClick={handleCardClick} style={{ margin: isExpanded ? '0' : '0 0 10px' }}>
      <div className={`card ripple ${isExpanded ? 'expanded' : ''}`} 
          onClick={handleRippleClick}  
          style={{ backgroundColor: dominantColor }}>
        <div className="block" style={{ color: isColorDark ? 'white' : 'black' }}>
          <div className="number">{number+1}</div>
          <div className="year">{year}</div>
        </div>
        <div className="block" onClick={handleImageClick}>
          <img className="album-cover" src={process.env.REACT_APP_API_URL + imageSrc} alt="Album Cover" />
        </div>
        <div className="block" style={{ color: isColorDark ? 'white' : 'black' }}>
          <div className={`albumName ${getAlbumNameClass()}`}>{albumName}</div>
          <div className={`bandName ${getBandNameClass()}`}>{bandName}</div>
        </div>
        <div className="block" style={{ fontSize: '1.5rem' }}>
          <div className="icon1">{icon1 ? <i className={`bi bi-heart-fill ${isColorDark ? 'text-white' : ''}`}></i> 
            : <i className={`bi-hand-thumbs-down-fill ${isColorDark ? 'text-white' : ''}`}></i>}
          </div>
          <div className="icon2">{icon2 ? <i className={`bi bi-star-fill ${isColorDark ? 'text-white' : ''}`}></i> : ''}</div>
        </div>
        <div className="block">
          <button type="button" className={`${isColorDark ? 'btn btn-outline-light' : 'btn btn-outline-dark'}`} onClick={handleEditClick}>
            <i className="bi bi-pen-fill"></i>
          </button>
          <button type="button" className={`${isColorDark ? 'btn btn-outline-light' : 'btn btn-outline-dark'}`} onClick={handleDeleteClick}>
            <i className="bi bi-trash-fill"></i>
          </button>
          <i className={`bi bi-triangle-fill ${isExpanded ? 'rotate' : ''} ${isColorDark ? 'text-white' : ''}`}></i>
        </div>
      </div>
    </div>
  );
};

export default Card;