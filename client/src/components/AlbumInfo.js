import React, { forwardRef } from 'react';
import { useSelector } from 'react-redux';
import tinycolor from 'tinycolor2';
import '../styles/albumInfo.scss';

const AlbumInfo = forwardRef(({ albumData }, ref) => {
  const { id, tracks, review } = albumData || {};
  const dominantColor = useSelector((state) => {
    const album = state.album.albums.find((album) => album.id === id);
    return album ? album.dominantColor : '#ffffff'; // Значение по умолчанию, если не найдено
  });
  const isColorDark = tinycolor(dominantColor).isDark();

  // Стиль для всех блоков внутри album-info
  const innerBlockStyle = {
    background: dominantColor,
    color: isColorDark ? 'white' : 'black',
    borderColor: isColorDark ? 'white' : 'black',
  };
  return (
    <div className="album-info" ref={ref} style={{ background: dominantColor }}>
      <div className="table-container" style={innerBlockStyle}>
        <table className="table table-striped" style={innerBlockStyle}>
          <thead>
            <tr>
              <th scope="col" style={innerBlockStyle}>
                #
              </th>
              <th scope="col" style={innerBlockStyle}>
                Name
              </th>
              <th scope="col" style={innerBlockStyle}>
                Mark
              </th>
            </tr>
          </thead>
          <tbody>
            {tracks &&
              tracks.map((track) => (
                <tr key={track.id}>
                  <th scope="row" style={innerBlockStyle}>
                    {track.order}
                  </th>
                  <td style={innerBlockStyle}>
                    <a
                      href={track.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'inherit' }}
                    >
                      {track.nameTrack}
                    </a>
                  </td>
                  <td style={innerBlockStyle}>
                    {track.estimation && <i className="m-2 bi bi-star"></i>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <p className="text-center fw-bold fs-5" style={innerBlockStyle}>
        Album Review
      </p>
      <div className="text-block" style={innerBlockStyle}>
        <p className="p_review">{review}</p>
      </div>
    </div>
  );
});

export default AlbumInfo;
