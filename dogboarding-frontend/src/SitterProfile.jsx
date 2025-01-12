import { useState, useEffect, useContext } from 'react'
import { IsSitterAuthContext } from './App.jsx'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import StarRatings from 'react-star-ratings'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import ImageModal from './ImageModal.jsx'
import TimeAgo from './hooks/TimeAgo.jsx'
import './App.css'
import './SitterProfile.css'

function SitterProfile() {
    // global states
    const { isSitterAuthenticated } = useContext(IsSitterAuthContext);

    // local states
    const [ selectedSitter, setSelectedSitter ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ isImageModalOpen, setIsImageModalOpen ] = useState(false);
    const [ selectedImage, setSelectedImage ] = useState('');
    const [ currentPage, setCurrentPage ] = useState(1); // handle pagination
    const [ reviews, setReviews ] = useState([]);
    const [ totalPages, setTotalPages ] = useState(null);
    
    // router setups
    const { sitterId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        getSelectedSitter();
    }, [sitterId]);

    useEffect(() => {
        getReviews();
    }, [currentPage, sitterId]);

    const getSelectedSitter = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/${sitterId}`);
            setSelectedSitter(response.data);
            setIsLoading(false);
            console.log('Selected sitter info:', response.data);
        } catch (err) {
            navigate('/list');
            setIsLoading(false);
            console.error('Failed to get selected sitter:', err);
        };
    };

    const getReviews = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/reviews/get-reviews/${sitterId}?page=${currentPage}`);
            setReviews(response.data.reviews);
            setTotalPages(response.data.totalPages);
            setIsLoading(false);
            console.log('Reviews of selected sitter:', response.data);
        } catch (err) {
            console.error('Failed to get reviews:', err.response.data.message);
            setIsLoading(false);
        };
    };

    // formatted data
    const averageRating = Math.round((selectedSitter?.ratings?.totalRating / selectedSitter?.ratings?.numberOfRatings) * 10)/10;

    const formattedAcceptedDogSize = selectedSitter?.acceptedDogSize.map(size => <div key={size}>{size}</div>);

    const formattedLocation = selectedSitter?.location.replace(', Philippines', '');

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
    
    // handle modals
    const openImageModal = (image) => {
        setIsImageModalOpen(true);
        document.body.classList.add('blocked');
        setSelectedImage(image);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
        document.body.classList.remove('blocked');
    };

    // client reviews
    const showReviews = reviews.map(client => {

        return (
            <div key={client._id} className='sitter-profile-review-card-container'>
                <div className='sitter-profile-review-card'>
                    <div className='sitter-profile-review-card-info-container'>
                        <div className='sitter-profile-review-card-info-container-image-container'>
                            <img 
                            src={client.user.profilePicture.includes('googleusercontent') ?
                                client.user.profilePicture :
                                `https://drive.google.com/thumbnail?id=${client.user.profilePicture}`
                                } className='sitter-profile-review-card-info-container-image'
                            alt='profile pic' />
                        </div>

                        <div className='sitter-profile-review-card-info-container-info'>
                            <div className='sitter-profile-review-card-info-container-name-date'>
                                <span className='sitter-profile-review-card-info-container-name'>{client.user.username}</span>
                                <span className='sitter-profile-review-card-info-container-date'><TimeAgo lastInteracted={client.createdAt}/></span>
                            </div>

                            <div className='sitter-profile-review-card-info-container-stars-verified'>
                                <span className='sitter-profile-review-card-info-container-stars'>
                                    <StarRatings 
                                        rating={client.rating}
                                        starRatedColor='#FFC600'
                                        starEmptyColor='#C9C9C9'
                                        starDimension='15px'
                                        starSpacing='0'
                                    />
                                </span>
                                <span className='sitter-profile-review-card-info-container-verified'><i className="fa-regular fa-circle-check"></i> Verified</span>
                            </div>
                        </div>
                    </div>

                    <div className='sitter-profile-review-card-info-container-text'>
                        {client.comment}
                    </div>
                </div>

                <div>
                    <hr></hr>
                </div>
            </div>
    )});

    // handle loading state
    if ( isLoading ) {
        return <div className='center'>Loading...Please wait</div>;
    };


    return (
        <div className='document-container'>
            <Header />
            <main className='content'>
                <div className='sitter-profile-main-container'>
                    <div className='sitter-profile-section-container'>
                        <div className='sitter-profile-info-container'>
                            <div className='sitter-profile-info-container-image-container'>
                                <img src={`https://drive.google.com/thumbnail?id=${selectedSitter.profilePicture}`} alt='profile pic' className='sitter-profile-info-container-image'/>
                            </div>
                            <div className='sitter-profile-info-container-info'>
                                <div className='sitter-profile-info-container-name'>{`${selectedSitter.firstName} ${selectedSitter.lastName}`}</div>
                                <div className='sitter-profile-info-container-city'>
                                    <i className="fa-solid fa-location-dot"></i> {formattedLocation}
                                </div>
                                <div className='sitter-profile-info-group-reviews'>
                                    <span className='sitter-profile-info-stars'>
                                        <StarRatings 
                                        rating={isNaN(averageRating) ? 0 : averageRating}
                                        starRatedColor='#FFC600'
                                        starEmptyColor='#C9C9C9'
                                        starDimension='18px'
                                        starSpacing='0'
                                        />
                                    </span>
                                    <span className='sitter-profile-info-reviews'>{selectedSitter.ratings.numberOfRatings} Reviews</span>
                                </div>
                                <div className='sitter-profile-info-group-bookings'>
                                    <i className="fa-regular fa-calendar"></i>
                                    <span className='sitter-profile-info-bookings'>{selectedSitter.completedBookings}</span> Completed Bookings
                                </div>
                            </div>
                        </div>

                        <div>
                            <hr></hr>
                        </div>

                        <div className='sitter-profile-description-container'>
                            <div className='sitter-profile-description-container-title'>
                                {`${selectedSitter.firstName} ${selectedSitter.lastName}'s Pets`}
                            </div>
                            <div className='sitter-profile-description-images-container'>
                                {selectedSitter.images.length > 0 ? selectedSitter.images.map((image, i) => 
                                    <img 
                                    onClick={() => openImageModal(image)}
                                    src={`https://drive.google.com/thumbnail?id=${image}`}
                                    alt={`Image ${i + 1}`} 
                                    className='sitter-profile-description-images-image' 
                                    key={i}
                                    />
                                ) : 'No images to show.'}
                            </div>
                            <div className='sitter-profile-description-container-description'>
                                <div className='sitter-profile-summary-title'>
                                    About Me 📃
                                </div>
                                <pre className='sitter-profile-pre-format-text'>{selectedSitter.description}</pre>
                            </div>
                        </div>

                        <div>
                            <hr></hr>
                        </div>

                        <div className='sitter-profile-summary-preference-container'>
                            <div className='sitter-profile-summary-container'>
                                <span className='sitter-profile-summary-title'>Summary ✍️</span>
                                <span className='sitter-profile-summary-text'>
                                    <pre className='edit-sitter-profile-pre-format-text'>{selectedSitter.summary}</pre>
                                </span>
                            </div>

                            <div className='sitter-profile-preference-container'>
                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>Number of dogs that will be watched at one time 🐾</span>
                                    <span className='sitter-profile-preference-text'>{selectedSitter.numberOfDogsToWatch}</span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>Accepted dog size 🐕</span>
                                    <span className='sitter-profile-preference-text'>{formattedAcceptedDogSize}</span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>Level of adult supervision 🦮🚶</span>
                                    <span className='sitter-profile-preference-text'>{selectedSitter.levelOfAdultSupervision}</span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>The place your dog will be if they are left unsupervised at home.</span>
                                    <span className='sitter-profile-preference-text'>{selectedSitter.placeOfDogWhenUnsupervised}</span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>The place your dog will sleep at night. 🛏️💤</span>
                                    <span className='sitter-profile-preference-text'>{selectedSitter.placeOfDogWhenSleeping}</span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>The number of potty breaks provided per day. 💦</span>
                                    <span className='sitter-profile-preference-text'>{selectedSitter.numberOfPottyBreaks}</span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>The number of walks provided per day. 🐾</span>
                                    <span className='sitter-profile-preference-text'>{selectedSitter.numberOfWalks}</span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>The type of home I stay in.</span>
                                    <span className='sitter-profile-preference-text'>{selectedSitter.typeOfHome}</span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>My outdoor area size. 🌳</span>
                                    <span className='sitter-profile-preference-text'>{selectedSitter.outdoorAreaSize}</span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>Emergency transport. 🚘</span>
                                    <span className='sitter-profile-preference-text'>{selectedSitter.emergencyTransport}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className='sitter-profile-sticky-container-mobile'>
                            <div className='sitter-profile-sticky-main-container'>
                                <div className='sitter-profile-sticky-main-group-container'>
                                    <div className='sitter-profile-sticky-main-group-headline'>
                                        <div className='sitter-profile-sticky-main-group-headline-title'>
                                            <i className="fa-solid fa-comments brown-text"></i>
                                            <span>Talk & Greet</span>
                                        </div>

                                        <div className='sitter-profile-sticky-main-group-headline-text'>
                                            Get to know each other first.
                                        </div>
                                    </div>

                                    <button 
                                    onClick={isSitterAuthenticated ? null : () => navigate(`/message/sitter/${selectedSitter._id}`)} 
                                    className={`sitter-profile-sticky-main-group-headline-button ${isSitterAuthenticated ? 'disable-' : ''}brown-button shadow`}>SEND A MESSAGE</button>
                                </div>

                                <div className='sitter-profile-sticky-main-group-container'>
                                    <div className='sitter-profile-sticky-main-group-headline'>
                                        <div className='sitter-profile-sticky-main-group-headline-title'>
                                            <i className="fa-solid fa-house green-text"></i>
                                            <span>Dog Boarding</span>
                                        </div>

                                        <div className='sitter-profile-sticky-main-group-headline-text'>
                                            From <span className='bold'>₱ {selectedSitter.price}</span> /night
                                        </div>
                                    </div>

                                    <button 
                                    onClick={isSitterAuthenticated ? null: () => navigate(`/message/sitter/${selectedSitter._id}?action=booking-form`)} 
                                    className={`sitter-profile-sticky-main-group-headline-button ${isSitterAuthenticated ? 'disable-' : ''}green-button shadow`}>BOOK NOW</button>
                                </div>
                            </div>
                        </div>

                        <div className='sitter-profile-reviews-container'>
                            <div>
                                <hr></hr>
                            </div>

                            <div className='sitter-profile-group-reviews'>
                                <span className='sitter-profile-group-reviews-text'>{selectedSitter.ratings.numberOfRatings} Reviews</span>
                            </div>

                            <div>
                                <hr></hr>
                            </div>
                        </div>
                        
                        {showReviews}

                        <div className='sitter-profile-page-container'>
                            <i onClick={handlePreviousPage} className={isTherePreviousPage() ? 'fa-solid fa-circle-chevron-left page-icon' : 'fa-solid fa-circle-chevron-left disable-page-icon'}></i>
                            <i onClick={handleNextPage} className={isThereNextPage() ? 'fa-solid fa-circle-chevron-right page-icon' : 'fa-solid fa-circle-chevron-right disable-page-icon'}></i>
                        </div>
                    </div>


                    <div className='sitter-profile-sticky-container'>
                        <div className='sitter-profile-sticky-main-container'>
                            <div className='sitter-profile-sticky-main-group-container'>
                                <div className='sitter-profile-sticky-main-group-headline'>
                                    <div className='sitter-profile-sticky-main-group-headline-title'>
                                        <i className="fa-solid fa-comments brown-text"></i>
                                        <span>Talk & Greet</span>
                                    </div>

                                    <div className='sitter-profile-sticky-main-group-headline-text'>
                                        Get to know each other first.
                                    </div>
                                </div>

                                <button 
                                onClick={isSitterAuthenticated ? null : () => navigate(`/message/sitter/${selectedSitter._id}`)} 
                                className={`sitter-profile-sticky-main-group-headline-button ${isSitterAuthenticated ? 'disable-' : ''}brown-button shadow`}>SEND A MESSAGE</button>
                            </div>

                            <div className='sitter-profile-sticky-main-group-container'>
                                <div className='sitter-profile-sticky-main-group-headline'>
                                    <div className='sitter-profile-sticky-main-group-headline-title'>
                                        <i className="fa-solid fa-house green-text"></i>
                                        <span>Dog Boarding</span>
                                    </div>

                                    <div className='sitter-profile-sticky-main-group-headline-text'>
                                        From <span className='bold'>₱ {selectedSitter.price}</span> /night
                                    </div>
                                </div>

                                <button 
                                onClick={isSitterAuthenticated ? null: () => navigate(`/message/sitter/${selectedSitter._id}?action=booking-form`)} 
                                className={`sitter-profile-sticky-main-group-headline-button ${isSitterAuthenticated ? 'disable-' : ''}green-button shadow`}>BOOK NOW</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {isImageModalOpen &&
            <ImageModal 
            closeImageModal={closeImageModal}
            selectedImage={selectedImage}
            />
            }
            <Footer />
        </div>
    );
};

export default SitterProfile;