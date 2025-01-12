import { useState, useEffect, useContext } from 'react'
import { GlobalStatesContext } from './App.jsx'
import { useNavigate } from 'react-router-dom'
import StarRatings from 'react-star-ratings'
import Autocomplete from 'react-google-autocomplete'
import ClipLoader from 'react-spinners/ClipLoader'
import axios from 'axios'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import landscapeImg from './assets/dog-landscape.png'
import './App.css'
import './List.css'

function List() {
    const { sittersList, setSittersList } = useContext(GlobalStatesContext);

    const [ searchQuery, setSearchQuery ] = useState(''); // stored city name (Manila, Taguig, Pasay, Pasig, Makati, etc)
    const [ currentPage, setCurrentPage ] = useState(1); // handle pagination
    const [ totalPages, setTotalPages ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        getAllSitters();
    }, [currentPage, searchQuery]);

    const getAllSitters = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings?page=${currentPage}&city=${searchQuery}`);
            setSittersList(response.data.listedSitters);
            setTotalPages(response.data.totalPages);
            setIsLoading(false);
            console.log('Listed sitters:', response.data);
        } catch (err) {
            setIsLoading(false);
            console.error('Failed to get all sitters:', err);
        };
    };

    // format returned city data
    const handleSearchCity = (place) => {
        
        if ( place.name === '' ) {
            setSearchQuery('');
            return;
        };

        const formattedPlace = place.address_components[0].long_name.toLowerCase(); // returns (e.g. manila, pasay city, pasay, san juan, quezon city, etc.)
        const formattedCity = formattedPlace.replace('city', '').trim(); // remove 'city' substring from the location string, if there are any.
        console.log('Searched city:', formattedCity);
        setSearchQuery(formattedCity);
    };

    // map the sorted list
    const formattedList = sittersList.map((sitter, i) => {
        
        const averageRating = Math.round((sitter.ratings['totalRating'] / sitter.ratings['numberOfRatings']) * 10)/10;
        const sitterLocation = sitter.location.split(', ')[0];
        const formattedLocation = sitterLocation.includes('City') ? sitterLocation : `${sitterLocation} City`; // if the location string has a 'City' in it, remove it to avoid redundancy

        return (
            <div key={i} onClick={() => navigate(`/sitter-profile/${sitter._id}`)} className='listing-card shadow'>
                <div className='listing-card-image-container'>
                    <img src={`https://drive.google.com/thumbnail?id=${sitter.profilePicture}`} alt='profile pic' className='listing-card-image' />
                </div>
                
                <div className='listing-card-info'>
                    <div className='listing-card-info-container'>
                        <div className='listing-card-info-name'>{`${sitter.firstName} ${sitter.lastName}`}</div>
                        <div className='listing-card-info-city'>
                            <i className="fa-solid fa-location-dot"></i> {formattedLocation}
                        </div>
                        <div className='listing-card-info-summary'>
                            {sitter.summary}
                        </div>
                    </div>
                        
                    <div>
                        <div className='listing-card-info-group-reviews'>
                            <span className='listing-card-info-stars'>
                                <StarRatings 
                                rating={isNaN(averageRating) ? 0 : averageRating}
                                starRatedColor='#FFC600'
                                starEmptyColor='#C9C9C9'
                                starDimension='18px'
                                starSpacing='0'
                                />
                            </span>
                            <span className='listing-card-info-reviews'>{` ${sitter.ratings['numberOfRatings']} Reviews`}</span>
                        </div>
                        <div className='listing-card-info-group-bookings'>
                            <i className="fa-regular fa-calendar"></i>
                            <div>
                                <span className='listing-card-info-bookings'>{sitter.completedBookings}</span> Completed Bookings
                            </div>
                        </div>
                    </div>
                </div>

                <div className='listing-card-price'>
                    <div className='listing-card-price-text'>From</div>
                    <div className='listing-card-price-cost'>{`₱ ${sitter.price}`}</div>
                    <div className='listing-card-price-text'>/night</div>
                </div>
            </div>
        );
    });

    // handle pagination
    const handleNextPage = () => {
        if ( currentPage < totalPages ) {
            setCurrentPage(currentPage + 1);
        };
    };

    const handlePreviousPage = () => {
        if ( currentPage > 1 ) {
            setCurrentPage(currentPage - 1);
        };
    };

    const isThereNextPage = () => currentPage < totalPages;

    const isTherePreviousPage = () => currentPage > 1;
    
    return (
        <div className='document-container'>
            <Header />
            <main className='content'>
                <div className='list-container'>
                    <div className='landscapeImg-container'>
                        <img className='landscapeImg' src={landscapeImg} alt='a bunch of happy dogs'></img>
                    </div>
                    <div className='list-main-container'>
                        <div className='list-main-search-container shadow'>
                            <span className='list-main-search-headline'>I am looking for Dog Boarding in</span>
                            <div className='list-main-search-bar'>
                                <Autocomplete 
                                apiKey={import.meta.env.VITE_REACT_APP_GOOGLE_PLACES_API_KEY}
                                onPlaceSelected={(place) => handleSearchCity(place)}
                                options={{
                                    types: ['(cities)'], 
                                    componentRestrictions: { country: 'ph' },
                                }}
                                placeholder='e.g. Manila City'
                                className='list-main-search-input'
                                />
                                <i className="list-main-search-icon fa-solid fa-magnifying-glass"></i>
                            </div>
                        </div>

                        <div className='list-group-container'>
                            <div className='list-frame'>
                                { isLoading ?
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <ClipLoader
                                    color='#5E3104'
                                    loading={isLoading}
                                    size={50}
                                    />
                                </div> : formattedList}
                                <div className='list-frame-page-container'>
                                    <i onClick={handlePreviousPage} className={isTherePreviousPage() ? 'fa-solid fa-circle-chevron-left page-icon' : 'fa-solid fa-circle-chevron-left disable-page-icon'}></i>
                                    <i onClick={handleNextPage} className={isThereNextPage() ? 'fa-solid fa-circle-chevron-right page-icon' : 'fa-solid fa-circle-chevron-right disable-page-icon'}></i>
                                </div>
                            </div>

                            <div className='list-fixed-frame'>
                                <div className='list-fixed-container'>
                                    <i className="list-left-container fa-solid fa-money-bill-transfer list-left-container-icon"></i>
                                    <div className='list-right-container'>
                                        <span className='list-right-container-title'>Direct Payment to Sitter</span>
                                        <span className='list-right-container-text'>Payments are made directly to the sitter, allowing for a transparent and seamless transaction between the owner and sitter.</span>
                                    </div>
                                </div>
                                <div className='list-fixed-container'>
                                    <i className="list-left-container fa-solid fa-user-shield list-left-container-icon"></i>
                                    <div className='list-right-container'>
                                        <span className='list-right-container-title'>Payment Protection</span>
                                        <span className='list-right-container-text'>For security, payments are only completed at the end of the boarding period, with clients paying sitters directly in cash, GCash, or other preferred methods at pick-up/drop-off.</span>
                                    </div>
                                </div>
                                <div className='list-fixed-container'>
                                    <span className="list-left-container material-symbols-outlined list-left-container-icon-moneyOff">money_off</span>   
                                    <div className='list-right-container'>
                                        <span className='list-right-container-title'>No additional fees</span>
                                        <span className='list-right-container-text'>Enjoy straightforward pricing with no hidden charges or middleman fees, ensuring affordability and transparency.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default List;