import React from 'react';
import '../styles/heart.scss';

const Heart = ({ selected, onChange, affiliation, index }) => {
  const id = `${affiliation}-${index}`;

  const handleClick = () => {
    onChange(!selected);
  };

  return (
    <form className="rating">
      <div className="rating__hearts" data-affiliation={affiliation}>
        <input
          id={id}
          className="rating__input rating__input-1"
          type="checkbox"
          name="rating"
          checked={selected}
          onChange={handleClick}
        />
        <label className="rating__label" htmlFor={id}>
          <svg
            className="rating__heart"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <g transform="translate(16,16)">
              <circle
                className="rating__heart-ring"
                fill="none"
                stroke="#000"
                strokeWidth="16"
                r="8"
                transform="scale(0)"
              />
            </g>
            <g stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {affiliation === 'album' && (
                <g>
                  <path
                    className="rating__heart-stroke"
                    d="m28.6667,11.3844c0-3.7693-3.0557-6.8249-6.8259-6.8249-2.4815,0-4.6472,1.3288-6.0417,3.3096-1.1945-1.9805-3.3602-3.3096-5.8417-3.3096-3.7693,0-6.8249,3.0556-6.8249,6.8249,0,0.8617,0.1664,1.6827,0.4577,2.4418,2.2567,6.4912,12.8756,12.6143,12.6143,12.1756,0,0,10.9512-5.7898,12.6143-13.6143,1.2904-0.756,-1.4578-0.0801,0.4578-2.4418Z"
                    fill="none"
                  />
                  <path
                    className="rating__heart-fill"
                    d="m28.6667,11.3844c0-3.7693-3.0557-6.8249-6.8259-6.8249-2.4815,0-4.6472,1.3288-6.0417,3.3096-1.1945-1.9805-3.3602-3.3096-5.8417-3.3096-3.7693,0-6.8249,3.0556-6.8249,6.8249,0,0.8617,0.1664,1.6827,0.4577,2.4418,2.2567,6.4912,12.8756,12.6143,12.6143,12.1756,0,0,10.9512-5.7898,12.6143-13.6143,1.2904-0.756,-1.4578-0.0801,0.4578-2.4418Z"
                    fill="#000"
                  />
                </g>
              )}
              {affiliation === 'track' && (
                <g transform="translate(4,4)">
                  <path
                    className="rating__heart-stroke"
                    d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
                    fill="none"
                  />
                  <path
                    className="rating__heart-fill"
                    d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
                    fill="#000"
                  />
                </g>
              )}
              <g transform="translate(16,16)" strokeDasharray="12 12" strokeDashoffset="12">
                <polyline className="rating__heart-line" transform="rotate(0)" points="0 4,0 16" />
                <polyline className="rating__heart-line" transform="rotate(72)" points="0 4,0 16" />
                <polyline
                  className="rating__heart-line"
                  transform="rotate(144)"
                  points="0 4,0 16"
                />
                <polyline
                  className="rating__heart-line"
                  transform="rotate(216)"
                  points="0 4,0 16"
                />
                <polyline
                  className="rating__heart-line"
                  transform="rotate(288)"
                  points="0 4,0 16"
                />
              </g>
            </g>
          </svg>
        </label>
      </div>
    </form>
  );
};

export default Heart;

// M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z
// m28.6667,11.3844c0-3.7693-3.0557-6.8249-6.8259-6.8249-2.4815,0-4.6472,1.3288-6.0417,3.3096-1.1945-1.9805-3.3602-3.3096-5.8417-3.3096-3.7693,0-6.8249,3.0556-6.8249,6.8249,0,0.8617,0.1664,1.6827,0.4577,2.4418,2.2567,6.4912,12.8756,12.6143,12.6143,12.1756,0,0,10.9512-5.7898,12.6143-13.6143,1.2904-0.756,-1.4578-0.0801,0.4578-2.4418Z
