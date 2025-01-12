import { useState, useEffect, useContext, createContext } from 'react'
import { IsAuthContext } from './App.jsx'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import StarRatings from 'react-star-ratings'
import ClipLoader from 'react-spinners/ClipLoader'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import BookSitterModal from './BookSitterModal.jsx'
import WriteAReview from './WriteAReview.jsx'
import ClientCancelModal from './ClientCancelModal.jsx'
import Chat from './Chat.jsx'
import './App.css'
import './Message.css'

export const FormDataContext = createContext();

function MessageSitter() {
    // global states
    const { userData } = useContext(IsAuthContext);
    
    // global state for MessageSitter child components to prevent states from resetting every time the modal closes
    const [ dogsNeededToBoard, setDogsNeededToBoard ] = useState('');
    const [ breedOfDogs, setBreedOfDogs ] = useState('');
    const [ sizeOfDogs, setSizeOfDogs ] = useState([]);
    const [ additionalDetails, setAdditionalDetails ] = useState('');
    const [ startDate, setStartDate ] = useState('');
    const [ startTime, setStartTime ] = useState('');
    const [ endDate, setEndDate ] = useState('');
    const [ endTime, setEndTime ] = useState('');
    const [ preferredMethod, setPreferredMethod ] = useState('');

    // local states
    const [ selectedSitter, setSelectedSitter ] = useState(null);
    const [ isClientCancelModalOpen, setIsClientCancelModalOpen ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ clientBookingStatus, setClientBookingStatus ] = useState('');
    const [ bookingInfo, setBookingInfo ] = useState(null); // store booking info

    // router setups
    const navigate = useNavigate();
    const { sitterId } = useParams();
    const [ searchParams, setSearchParams ] = useSearchParams();
    const action = searchParams.get('action');
    
    useEffect(() => {
        getSelectedSitter(); // define selectedSitter variable
    }, []);

    useEffect(() => {
        if ( selectedSitter ) {
            getBooking(); // only run after selectedSitter is updated
        };
    }, [selectedSitter]);

    // this function must go first to define selectedSitter variable
    const getSelectedSitter = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/${sitterId}`);
            setSelectedSitter(response.data);
            setIsLoading(false);
            console.log('Selected sitter:', response.data);
        } catch (err) {
            navigate('/list');
            console.error('Failed to get selected sitter:', err);
        };
    };

    // this function must go 2nd after defining selectedSitter variable
    const getBooking = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/bookings/get-booking?clientId=${userData._id}&sitterId=${sitterId}`);
            
            if ( response.data.status === 'pending' ) {
                setClientBookingStatus('BOOKED');
            };

            if ( response.data.status === 'accepted' ) {
                response.data.clientStatus === 'completed' ? setClientBookingStatus('COMPLETED BY CLIENT') : setClientBookingStatus('ACCEPTED');
            };

            setBookingInfo(response.data);
            console.log('Booking info:', response.data);
        } catch (err) {
            console.error("Failed to get booking if there's any:", err.response.data.message);
        };
    };

    // handle loading state
    if ( isLoading ) {
        return <div className='center'>Loading...Please wait</div>;
    };

    const averageRating = Math.round((selectedSitter?.ratings?.totalRating / selectedSitter?.ratings?.numberOfRatings) * 10)/10;
    
    const formattedAcceptedDogSize = selectedSitter?.acceptedDogSize.join(', '); // add whitespace after comma in every index of the array

    const formattedLocation = selectedSitter?.location.replace(', Philippines', '');


    // handle modal
    const openClientCancelModal = () => {
        setIsClientCancelModalOpen(true);
        document.body.classList.add('blocked');
    };

    const closeClientCancelModal = () => {
        setIsClientCancelModalOpen(false);
        document.body.classList.remove('blocked');
    };

    // cancel booking
    const confirmClientCancelModal = async () => {
        try {
            setIsLoading(true);
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/bookings/cancel-booking?clientId=${userData._id}&sitterId=${selectedSitter._id}&role=client`);
            setClientBookingStatus('');
            closeClientCancelModal();
            setIsLoading(false);
            console.log('Cancelled booking:', response.data);
        } catch (err) {
            console.error('Failed to cancel booking:', err.response.data.message);
            setIsLoading(false);
        };
    };

    // complete booking client side
    const completeBooking = async () => {
        try {
            setIsLoading(true);
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/bookings/complete-booking?clientId=${userData._id}&sitterId=${selectedSitter._id}&role=client&action=complete`);
            setClientBookingStatus('COMPLETED BY CLIENT');
            setSearchParams({});
            setIsLoading(false);
            console.log('Completed booking on the client side:', response.data);
        } catch (err) {
            console.error('Failed to complete booking:', err.response.data.message);
            setIsLoading(false);
        };
    };

    // handle book button
    const handlePendingHover = (e) => {
        e.target.textContent = 'CANCEL';
        e.target.className = 'message-main-info-button message-red-bg'
    };

    const handlePendingMouseOut = (e) => {
        e.target.textContent = 'PENDING'
        e.target.className = 'message-main-info-button message-yellow-bg'
    };

    const handleBookingStatusChange = () => {
        switch (clientBookingStatus) {
            case 'BOOKED':
                return <button 
                onMouseOver={handlePendingHover} 
                onMouseOut={handlePendingMouseOut}
                onClick={openClientCancelModal}
                className='message-main-info-button message-yellow-bg'>PENDING</button>
            case 'ACCEPTED':
                return <button
                onClick={() => setSearchParams({ action: 'write-a-review' })}
                className='message-main-info-button message-green-bg'>Click to complete booking</button>
            case 'COMPLETED BY CLIENT':
                return <span className='message-main-info-button-confirmation-text'>Pending confirmation of sitter...</span>
            default:
                return <button 
                onClick={() => setSearchParams({ action: 'booking-form'})}
                className='message-main-info-button message-green-bg'>BOOK NOW</button>
        };
    };

    return (
        <div className='document-container'>
            <Header />
            <main className='content'>
                <div className='message-main-container'>
                    <div className='message-main-chatbox-container'>
                        <Chat selectedSitter={selectedSitter} />
                    </div>

                    <div className='message-main-info-container'>
                        <div className='message-main-info-image-name-container'>
                            <div className='message-main-info-image-container'>
                                <img 
                                src={`https://drive.google.com/thumbnail?id=${selectedSitter.profilePicture}`} 
                                alt='profile pic' 
                                className='message-main-info-image'/>
                            </div>
                            <span className='message-main-info-name'>{`${selectedSitter.firstName} ${selectedSitter.lastName}`}</span>
                            <span className='message-main-info-city'><i className="fa-solid fa-location-dot"></i> {formattedLocation}</span>
                            <div className='message-main-info-group-reviews'>
                                <span className='message-main-info-stars'>
                                    <StarRatings 
                                    rating={isNaN(averageRating) ? 0 : averageRating}
                                    starRatedColor='#FFC600'
                                    starEmptyColor='#C9C9C9'
                                    starDimension='18px'
                                    starSpacing='0'
                                    />
                                </span>
                                <span className='message-main-info-reviews'>{selectedSitter.ratings.numberOfRatings} Reviews</span>
                            </div>
                            <div className='message-main-info-group-bookings'>
                                <i className="fa-regular fa-calendar"></i>
                                <div>
                                    <span className='message-main-info-bookings'>{selectedSitter.completedBookings}</span> Completed Bookings
                                </div>
                            </div>
                        </div>

                        <div className='message-sitter-main-info-button-container'>
                            <div className='message-main-info-price'>
                                From <span className='bold'>₱ {selectedSitter.price}</span> /night
                            </div>
                            { isLoading ?
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <ClipLoader
                                color='#5E3104'
                                loading={isLoading}
                                size={15}
                                />
                            </div> :
                            handleBookingStatusChange()}
                        </div>

                        <div className='message-main-info-details-container'>
                            <div className='message-main-info-details-group'>
                                <span className='message-main-info-details-title'>Number of dogs that will be watched at one time 🐾</span>
                                <span className='message-main-info-details-text'>{selectedSitter.numberOfDogsToWatch}</span>
                            </div>

                            <div className='message-main-info-details-group'>
                                <span className='message-main-info-details-title'>Accepted dog size 🐕</span>
                                <span className='message-main-info-details-text'>{formattedAcceptedDogSize}</span>
                            </div>

                            <div className='message-main-info-details-group'>
                                <span className='message-main-info-details-title'>Level of adult supervision 🦮🚶</span>
                                <span className='message-main-info-details-text'>{selectedSitter.levelOfAdultSupervision}</span>
                            </div>

                            <div className='message-main-info-details-group'>
                                <span className='message-main-info-details-title'>The place your dog will be if they are left unsupervised at home.</span>
                                <span className='message-main-info-details-text'>{selectedSitter.placeOfDogWhenUnsupervised}</span>
                            </div>

                            <div className='message-main-info-details-group'>
                                <span className='message-main-info-details-title'>The place your dog will sleep at night. 🛏️💤</span>
                                <span className='message-main-info-details-text'>{selectedSitter.placeOfDogWhenSleeping}</span>
                            </div>

                            <div className='message-main-info-details-group'>
                                <span className='message-main-info-details-title'>The number of potty breaks provided per day. 💦</span>
                                <span className='message-main-info-details-text'>{selectedSitter.numberOfPottyBreaks}</span>
                            </div>

                            <div className='message-main-info-details-group'>
                                <span className='message-main-info-details-title'>The number of walks provided per day. 🐾</span>
                                <span className='message-main-info-details-text'>{selectedSitter.numberOfWalks}</span>
                            </div>

                            <div className='message-main-info-details-group'>
                                <span className='message-main-info-details-title'>The type of home I stay in.</span>
                                <span className='message-main-info-details-text'>{selectedSitter.typeOfHome}</span>
                            </div>

                            <div className='message-main-info-details-group'>
                                <span className='message-main-info-details-title'>My outdoor area size. 🌳</span>
                                <span className='message-main-info-details-text'>{selectedSitter.outdoorAreaSize}</span>
                            </div>

                            <div className='message-main-info-details-group'>
                                <span className='message-main-info-details-title'>Emergency transport. 🚘</span>
                                <span className='message-main-info-details-text'>{selectedSitter.emergencyTransport}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            
            {/* handle booking form modal */}
            {action === 'booking-form' && 
                <FormDataContext.Provider value={{
                    dogsNeededToBoard,
                    setDogsNeededToBoard,
                    breedOfDogs,
                    setBreedOfDogs,
                    sizeOfDogs,
                    setSizeOfDogs,
                    additionalDetails,
                    setAdditionalDetails,
                    startDate,
                    setStartDate,
                    startTime,
                    setStartTime,
                    endDate,
                    setEndDate,
                    endTime,
                    setEndTime,
                    preferredMethod,
                    setPreferredMethod
                }}>
                    <BookSitterModal 
                    setClientBookingStatus={setClientBookingStatus} 
                    selectedSitter={selectedSitter}
                    />
                </FormDataContext.Provider>
            }

            {/* handle review modal */}
            {action === 'write-a-review' &&
                <WriteAReview 
                bookingInfo={bookingInfo}
                completeBooking={completeBooking}
                selectedSitter={selectedSitter}
                isLoading={isLoading}
                />
            }

            {/* handle cancel modal confirmation */}
            {isClientCancelModalOpen &&
                <ClientCancelModal 
                closeClientCancelModal={closeClientCancelModal}
                confirmClientCancelModal={confirmClientCancelModal}
                isLoading={isLoading}
                />
            }
        </div>
    );
};

export default MessageSitter;