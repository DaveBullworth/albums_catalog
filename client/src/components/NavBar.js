import React, { useState, useRef, useEffect } from 'react';
import Heart from '../components/Heart';
import Star from '../components/Star';
import '../styles/navBar.scss';
import * as bootstrap from 'bootstrap';

const NavBar = ({ filters, setFilters, handleReloadAlbums, reset }) => {
    const [yearAInput, setYearAInput] = useState('');
    const [yearBInput, setYearBInput] = useState('');
    const [nameBandInput, setNameBandInput] = useState('');
    const [nameAlbumInput, setNameAlbumInput] = useState('');
    const [showTooltip, setShowTooltip] = useState(false);

    const [sortYear, setSortYear] = useState(null);
    const [sortBandName, setSortBandName] = useState(null);
    const [sortAlbumName, setSortAlbumName] = useState(null);

    const yearBInputRef = useRef(null);

    useEffect(() => {
        const tooltipElement = yearBInputRef.current;
        if (tooltipElement) {
            const tooltip = new bootstrap.Tooltip(tooltipElement, {
                title: "year 'to' should be bigger than year 'from'",
                placement: 'bottom',
                trigger: 'manual' // Ensure manual trigger
            });
            if (showTooltip) {
                tooltip.show();
            } else {
                tooltip.hide();
            }
            return () => {
                tooltip.dispose();
            };
        }
    }, [yearBInputRef, showTooltip]);       

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if ((name === 'yearA' || name === 'yearB') && /^\d{0,4}$/.test(value)) {
            if (value === '' || parseInt(value) <= 9999) {
                if (name === 'yearA') {
                    setYearAInput(value);
                } else {
                    setYearBInput(value);
                }
            }
        } else if (name === 'nameBand') {
            setNameBandInput(value);
        } else if (name === 'nameAlbum') {
            setNameAlbumInput(value);
        }
    }

    const handleHeartChange = (value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            estimation: value
        }));
        handleReloadAlbums(true);
    }

    const handleStarChange = (value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            favorite: value
        }));
        handleReloadAlbums(true);
    }

    const handleFilterButtonClick = () => {
        if (yearAInput !== '' && yearBInput !== '' && parseInt(yearBInput) < parseInt(yearAInput)) {
            setShowTooltip(true);
            return;
        } else {
            setShowTooltip(false);
        }

        setFilters({
            ...filters,
            yearA: yearAInput,
            yearB: yearBInput,
            nameBand: nameBandInput,
            nameAlbum: nameAlbumInput
        });
        handleReloadAlbums(true);
    }

    // Общая функция для сортировки
    const handleSort = (currentSortValue, sortName, setSortState) => {
        // Определение нового значения сортировки
        const newSortValue = currentSortValue === null ? 'asc' : currentSortValue === 'asc' ? 'desc' : null;

        // Обновляем состояние сортировки (asc, desc или null)
        setSortState(newSortValue);

        // Обновляем фильтры с помощью нового значения сортировки
        setFilters(prevFilters => ({
            ...prevFilters,
            [sortName]: newSortValue ? newSortValue : false
        }));

        handleReloadAlbums(true);
    }

    useEffect(() => {
        setYearAInput('')
        setYearBInput('')
        setNameBandInput('')
        setNameAlbumInput('')
        setShowTooltip(false)
        setSortYear(null)
        setSortBandName(null)
        setSortAlbumName(null)
    }, [reset]);  

    return ( 
        <nav className="navbar bg-body-tertiary">
            <div className="container-fluid">
                <span>Years</span>
                <div className='years'>
                    <div className='years inputs'>
                        <input
                            style={{textAlign: 'center'}}
                            type="text"
                            className="form-control"
                            placeholder="from" 
                            id="yearA"
                            name="yearA"
                            value={yearAInput}
                            onChange={handleInputChange}
                        />
                        <span className="dash">-</span>
                        <input
                            style={{textAlign: 'center'}}
                            type="text"
                            className={`${showTooltip ? 'form-control myshadow' : 'form-control'}`}
                            placeholder="to" 
                            id="yearB"
                            name="yearB"
                            value={yearBInput}
                            onChange={handleInputChange}
                            ref={yearBInputRef}
                        />
                    </div>
                    <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={handleFilterButtonClick}
                    >
                        <i className="bi bi-search"></i>
                    </button>
                </div>
                <span>Band Name</span>
                <form className="d-flex" role="search">
                    <input 
                        className="form-control me-2" 
                        type="search" 
                        placeholder="Search" 
                        aria-label="Search"
                        id="nameBand"
                        name="nameBand"
                        value={nameBandInput}
                        onChange={handleInputChange}
                    />
                    <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={handleFilterButtonClick}
                    >
                        <i className="bi bi-search"></i>
                    </button>
                </form>
                <span>Album Name</span>
                <form className="d-flex" role="search">
                    <input 
                        className="form-control me-2" 
                        type="search" 
                        placeholder="Search" 
                        aria-label="Search"
                        id="nameAlbum"
                        name="nameAlbum"
                        value={nameAlbumInput}
                        onChange={handleInputChange}
                    />
                    <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={handleFilterButtonClick}
                    >
                        <i className="bi bi-search"></i>
                    </button>
                </form>
                <div className='estimations'>
                    <Heart 
                        selected={filters.estimation} 
                        onChange={handleHeartChange} 
                        affiliation={'album'} 
                        index={'navbarHeart'}/>
                    <Star 
                        selected={filters.favorite} 
                        onChange={handleStarChange}
                        index={'navbarStar'}
                    />
                </div>
                <span>Sort by:</span>
                <div className='sort'>
                    <div className='sort-element'>
                        <span onClick={() => handleSort(sortYear, "sortYear", setSortYear)} style={sortYear ? {cursor: 'pointer', color: 'blue', textDecoration: 'underline'}:{cursor: 'pointer'}}>Release Year</span>
                        {sortYear !== null && (
                            <div className='triangles'>
                                <div style={{width: '0', height: '0', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: `5px solid ${sortYear === 'asc' ? 'blue' : 'black'}`, marginBottom: '3px'}}></div>
                                <div style={{width: '0', height: '0', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${sortYear === 'desc' ? 'blue' : 'black'}`}}></div>
                            </div>
                        )}
                        </div>
                    <div className='sort-element'>
                        <span onClick={() => handleSort(sortBandName, "sortBandName", setSortBandName)} style={sortBandName ? {cursor: 'pointer', color: 'blue', textDecoration: 'underline'}:{cursor: 'pointer'}}>Band Name</span>
                        {sortBandName !== null && (
                            <div className='triangles'>
                                <div style={{width: '0', height: '0', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: `5px solid ${sortBandName === 'asc' ? 'blue' : 'black'}`, marginBottom: '3px'}}></div>
                                <div style={{width: '0', height: '0', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${sortBandName === 'desc' ? 'blue' : 'black'}`}}></div>
                            </div>
                        )}
                    </div>
                    <div className='sort-element'>
                        <span onClick={() => handleSort(sortAlbumName, "sortAlbumName", setSortAlbumName)} style={sortAlbumName ? {cursor: 'pointer', color: 'blue', textDecoration: 'underline'}:{cursor: 'pointer'}}>Album Name</span>
                        {sortAlbumName !== null && (
                            <div className='triangles'>
                                <div style={{width: '0', height: '0', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: `5px solid ${sortAlbumName === 'asc' ? 'blue' : 'black'}`, marginBottom: '3px'}}></div>
                                <div style={{width: '0', height: '0', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${sortAlbumName === 'desc' ? 'blue' : 'black'}`}}></div>
                            </div>
                        )}
                    </div>
                </div>
                {/* <span onClick={handleSortByClick} style={sortBy ? {cursor: 'pointer', color: 'blue', textDecoration: 'underline'}:{cursor: 'pointer'}}>Sort by: Release Year</span> */}
            </div>
        </nav>
    );
}
 
export default NavBar;