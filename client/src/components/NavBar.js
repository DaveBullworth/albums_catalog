import React, { useState, useRef, useEffect } from 'react';
import Heart from '../components/Heart';
import Star from '../components/Star';
import '../styles/navBar.scss';
import * as bootstrap from 'bootstrap';

const NavBar = ({ filters, setFilters }) => {
    const [yearAInput, setYearAInput] = useState('');
    const [yearBInput, setYearBInput] = useState('');
    const [nameBandInput, setNameBandInput] = useState('');
    const [showTooltip, setShowTooltip] = useState(false);
    const [sortBy, setSortBy] = useState(null); // State to track sorting

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
        }
    }

    const handleHeartChange = (value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            estimation: value
        }));
    }

    const handleStarChange = (value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            favorite: value
        }));
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
            nameBand: nameBandInput
        });
    }

    const handleSortByClick = () => {
        if (sortBy === null) {
            setSortBy('asc');
        } else if (sortBy === 'asc') {
            setSortBy('desc');
        } else if ( sortBy === 'desc') {
            setSortBy(null); 
        }
    }

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
                    <span onClick={handleSortByClick} style={sortBy ? {cursor: 'pointer', color: 'blue', textDecoration: 'underline'}:{cursor: 'pointer'}}>Release Year</span>
                    {sortBy !== null && (
                        <div style={{position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)'}}>
                            <div style={{width: '0', height: '0', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: `5px solid ${sortBy === 'asc' ? 'blue' : 'black'}`, marginBottom: '3px'}}></div>
                            <div style={{width: '0', height: '0', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${sortBy === 'desc' ? 'blue' : 'black'}`}}></div>
                        </div>
                    )}
                </div>
                {/* <span onClick={handleSortByClick} style={sortBy ? {cursor: 'pointer', color: 'blue', textDecoration: 'underline'}:{cursor: 'pointer'}}>Sort by: Release Year</span> */}
            </div>
        </nav>
    );
}
 
export default NavBar;