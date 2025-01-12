import { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IsSitterAuthContext } from './App.jsx'
import axios from 'axios'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import Chat from './Chat.jsx'
import SitterDeclineModal from './SitterDeclineModal.jsx'
import './App.css'
import './Message.css'

function MessageClient() {
    // global states
    const { sitterData } = useContext(IsSitterAuthContext);

    // local states
    const [ selectedClient, setSelectedClient ] = useState(null);
    const [ isSitterDeclineModalOpen, setIsSitterDeclineModalOpen ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ sitterBookingStatus, setSitterBookingStatus ] = useState('');
    const [ bookingInfo, setBookingInfo ] = useState(null); // store booking info

    // router setups
    const navigate = useNavigate();
    const { clientId } = useParams();

    useEffect(() => {
        getSelectedClient(); // define selectedClient variable
    }, []);

    useEffect(() => {
        if ( selectedClient ) { // only run after selectedClient is updated
            getBooking();
        };
    }, [selectedClient]);

    // this function must go first to define selectedClient variable
    const getSelectedClient = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/users/${clientId}`);
            setSelectedClient(response.data);
            setIsLoading(false);
            console.log('Selected client:', response.data);
        } catch (err) {
            navigate('/sitter/messages');
            setIsLoading(false);
            console.error('Failed to get selected user:', err.response.data.message);
        };
    };

    // this function must go 2nd after defining selectedClient variable
    const getBooking = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/bookings/get-booking?clientId=${clientId}&sitterId=${sitterData._id}`);
            
            if ( response.data.status === 'pending' ) {
                setSitterBookingStatus('PENDING');
            };

            if ( response.data.status === 'accepted' ) {
                response.data.sitterStatus === 'completed' ? setSitterBookingStatus('COMPLETED BY SITTER') : setSitterBookingStatus('ACCEPTED');
            };

            setBookingInfo(response.data);
            console.log('Booking info:', response.data);
        } catch (err) {
            console.error("Failed to get booking if there's any:", err.response.data.message);
        };
    };

    // handle modals
    const openSitterDeclineModal = () => {
        setIsSitterDeclineModalOpen(true);
        document.body.classList.add('blocked');
    };
    
    const closeSitterDeclineModal = () => {
        setIsSitterDeclineModalOpen(false);
        document.body.classList.remove('blocked');
    };

    // cancel booking
    const confirmSitterDeclineModal = async () => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/bookings/cancel-booking?clientId=${selectedClient._id}&sitterId=${sitterData._id}&role=sitter`);
            setSitterBookingStatus('');
            closeSitterDeclineModal();
            console.log('Cancelled booking:', response.data);
        } catch (err) {
            console.error('Failed to cancel booking:', err.response.data.message);
        } 
    };

    // accept booking
    const handleAcceptClick = async () => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/bookings/accept-booking?clientId=${selectedClient._id}&sitterId=${sitterData._id}`);
            setSitterBookingStatus('ACCEPTED');
            console.log(response.data);
        } catch (err) {
            console.error('Failed to accept booking:', err.response.data.message);
        };
    };

    // complete booking sitter side
    const completeBooking = async () => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/bookings/complete-booking?clientId=${selectedClient._id}&sitterId=${sitterData._id}&role=sitter&action=complete`);
            setSitterBookingStatus('COMPLETED BY SITTER');
            console.log('Completed booking on the sitter side:', response.data);
        } catch (err) {
            console.error('Failed to complete booking:', err.response.data.message);
        };
    };

    // handle dynamic icons
    const handleBookingStatusIcons = () => {
        switch (sitterBookingStatus) {
            case 'ACCEPTED':
                return <i className="fa-solid fa-circle-check message-success-icon"></i>;
            case 'PENDING':
                return <i className="fa-solid fa-circle-minus message-pending-icon"></i>;
            case 'COMPLETED BY SITTER':
                return <i className="fa-solid fa-circle-check message-success-icon"></i>;
            default:
                return;
        };
    };

    // handle dynamic details
    const handleMainInfoDetails = () => {
        switch (sitterBookingStatus) {
            case 'ACCEPTED':
                return mainInfoDetails;
            case 'PENDING':
                return mainInfoDetails;
            case 'COMPLETED BY SITTER':
                return mainInfoDetails;
            default:
                return;
        };
    };

    // handle dynamic buttons
    const handleMainInfoButtons = () => {
        switch (sitterBookingStatus) {
            case 'ACCEPTED':
                return <button onClick={completeBooking} className='message-main-info-button message-green-bg'>Click to complete booking</button>;
            case 'PENDING':
                return (
                    <>
                        <button onClick={handleAcceptClick} className='message-main-info-button message-green-bg'>ACCEPT</button>
                        <button onClick={openSitterDeclineModal} className='message-main-info-button message-red-bg'>DECLINE</button>
                    </>
                );
            case 'COMPLETED BY SITTER':
                return <span className='message-main-info-button-confirmation-text'>Pending confirmation of client...</span>
            default:
                return;
        }; 
    }; 

    // handle loading state
    if ( isLoading ) {
        return <div className='center'>Loading...Please wait</div>;
    };

    const formattedStartDate = new Date(bookingInfo?.startDateAndTime).toLocaleDateString('en-US');
    const formattedEndDate = new Date(bookingInfo?.endDateAndTime).toLocaleDateString('en-US');

    // handle main info details
    const mainInfoDetails = 
    <div className='message-main-info-details-container'>
        <div className='message-main-info-details-group'>
            <span className='message-main-info-details-title'>Date Of Boarding</span>
            <span className='message-main-info-details-text'>{`${formattedStartDate} - ${formattedEndDate}`}</span>
        </div>

        <div className='message-main-info-details-group'>
            <span className='message-main-info-details-title'>Booking Status</span>
            <span className='message-main-info-details-text'>
                {handleBookingStatusIcons()}
            </span>
        </div>

        <div className='message-main-info-details-group'>
            <span className='message-main-info-details-title'>Preferred Method</span>
            <span className='message-main-info-details-text'>{bookingInfo?.preferredMethod}</span>
        </div>

        <div className='message-main-info-details-group'>
            <span className='message-main-info-details-title'>Dogs needed to board</span>
            <span className='message-main-info-details-text'>{bookingInfo?.dogsNeededToBoard}</span>
        </div>

        <div className='message-main-info-details-group'>
            <span className='message-main-info-details-title'>Breed of dogs</span>
            <span className='message-main-info-details-text'>{bookingInfo?.breedOfDogs ? bookingInfo.breedOfDogs : '—'}</span>
        </div>

        <div className='message-main-info-details-group'>
            <span className='message-main-info-details-title'>Size of dog</span>
            <span className='message-main-info-details-text'>{bookingInfo?.sizeOfDogs.map(size => (<div key={size}>{size}</div>))}</span>
        </div>

        <div className='message-main-info-details-group'>
            <span className='message-main-info-details-title'>Anything else the sitter will need to know</span>
            <span className='message-main-info-details-text'>{bookingInfo?.additionalDetails ? bookingInfo.additionalDetails : '—'}</span>
        </div>
    </div>;

    return (
        <div className='document-container'>
            <Header />
            <main className='content'>
                <div className='message-main-container'>
                    <div className='message-main-chatbox-container'>
                        <Chat selectedClient={selectedClient} />
                    </div>

                    <div className='message-main-info-container'>
                        <div className='message-main-info-image-name-container'>
                            <div className='message-main-info-image-container'>
                                <img 
                                src={selectedClient.profilePicture.includes('googleusercontent') ?
                                    selectedClient.profilePicture :
                                    `https://drive.google.com/thumbnail?id=${selectedClient.profilePicture}`
                                    }
                                className='message-main-info-image' />
                            </div>
                            <span className='message-main-info-name'>{selectedClient.username}</span>
                            <span className='message-main-info-status'>{sitterBookingStatus === '' ? 'No booking requests yet' : ''}</span>
                            <span className='message-main-info-verified'><i className="fa-regular fa-circle-check"></i> Verified</span>
                        </div>

                        <div className='message-client-main-info-button-container'>
                            {handleMainInfoButtons()}
                        </div>

                        {handleMainInfoDetails()}
                    </div>
                </div>
            </main>
            <Footer />

            {isSitterDeclineModalOpen &&
            <SitterDeclineModal 
            closeSitterDeclineModal={closeSitterDeclineModal}
            confirmSitterDeclineModal={confirmSitterDeclineModal}
            />}
        </div>
    );
};

export default MessageClient;