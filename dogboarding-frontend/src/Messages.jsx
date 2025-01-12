import { useState, useEffect, useRef, useContext } from 'react'
import { IsAuthContext, IsSitterAuthContext } from './App.jsx'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import ClipLoader from 'react-spinners/ClipLoader'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import TimeAgo from './hooks/TimeAgo.jsx'
import './App.css'
import './Messages.css'

function Messages() {
    // global states
    const { userData, isAuthenticated } = useContext(IsAuthContext);
    const { sitterData, isSitterAuthenticated } = useContext(IsSitterAuthContext);

    // local states
    const [ currentUser, setCurrentUser ] = useState(null);
    const [ conversations, setConversations ] = useState([]);
    const [ currentPage, setCurrentPage ] = useState(1); // handle pagination
    const [ totalPages, setTotalPages ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(true);

    const navigate = useNavigate();
    
    // create ref to hold the socket object
    const socketRef = useRef(null);

    useEffect(() => {
        // if client is the current user
        if ( isAuthenticated ) {
            setCurrentUser(userData);
        };

        // if sitter is the current user
        if ( isSitterAuthenticated ) {
            setCurrentUser(sitterData);
        };
    }, []);

    useEffect(() => {
        if ( currentUser ) { // only run after currentUser is updated
            
            // initialize socket connection to the backend
            socketRef.current = io(import.meta.env.VITE_REACT_APP_BACKEND_BASEURL);
            
            // send request to backend to load conversations of the current user
            socketRef.current.emit('loadConversations', { currentUser, currentPage });

            // get loaded conversations from backend
            socketRef.current.on('conversationsLoaded', ({ conversations, totalPages }) => {
                console.log('Loaded conversations:', conversations);
                setConversations(conversations);
                setTotalPages(totalPages);
                setIsLoading(false);
            });
            
            // cleanup on unmount
            return () => {
                // disconnect the socket upon component unmount
                socketRef.current.disconnect();
            };
        };

    }, [currentUser]);

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

    // handle conversation click
    const handleConversationClick = (clientId, sitterId) => {
        if ( isAuthenticated ) {
            navigate(`/message/sitter/${sitterId}`);
        };
        if ( isSitterAuthenticated ) {
            navigate(`/message/client/${clientId}`);
        };
    };

    const messageContainer = conversations.map((conversation, i) => {
        const sitter = conversation.sitterId; // get populated sitterId obj
        const client = conversation.clientId; // get populated clientId obj
        const lastMessage = conversation.lastMessageId; // get populated lastMessageId obj
        
        // format data
        const receiverName = isAuthenticated ? `${sitter.firstName} ${sitter.lastName}` : client.username;
        const imageSrc = isAuthenticated ?
            `https://drive.google.com/thumbnail?id=${sitter.profilePicture}` :
            ( 
                client.profilePicture.includes('googleusercontent') ?
                client.profilePicture :
                `https://drive.google.com/thumbnail?id=${client.profilePicture}`
            );
        
        const handleRecentMessage = () => {
            // check if last message is from current user
            const isCurrentUserSender = lastMessage?.senderId === currentUser._id;

            if ( lastMessage?.text ) {
                return isCurrentUserSender ? `You: ${lastMessage.text}` : `${lastMessage.text}`;
            } else if ( lastMessage?.fileUrl) {
                return isCurrentUserSender ? `You sent a photo.` : 
                lastMessage.senderId === client._id ? `${client.username} sent a photo.` : `${sitter.firstName} ${sitter.lastName} sent a photo.`;
            } else {
                return 'Click to chat'
            };
        };
        
        // handle status of each conversation
        const handleStatus = () => {
            const clientStatus = conversation.mostRecentBookingId?.clientStatus; // pending, cancelled, completed
            const sitterStatus = conversation.mostRecentBookingId?.sitterStatus; // pending, cancelled, completed
            const status = conversation.mostRecentBookingId?.status; // pending, accepted, completed

            if ( !conversation.mostRecentBookingId ) {
                return 'No bookings yet.';
            };

            switch (status) {
                case 'pending':
                    if ( clientStatus === 'pending' && sitterStatus === 'pending' ) {
                        return isAuthenticated ? `Please wait for ${sitter.firstName} ${sitter.lastName} to accept your booking.` : `${client.username} booked you.`;
                    } else {
                        return `This ${status} case was not anticipated.`;
                    };
                case 'accepted':
                    if ( clientStatus === 'pending' && sitterStatus === 'pending' ) {
                        return isAuthenticated ? `${sitter.firstName} ${sitter.lastName} accepted the booking.` : 'You accepted the booking.';
                    } else if ( clientStatus === 'pending' && sitterStatus === 'completed' ) {
                        return isAuthenticated ? `${sitter.firstName} ${sitter.lastName} marked the booking as completed.` : 'You marked the booking as completed.';
                    } else if ( clientStatus === 'completed' && sitterStatus === 'pending' ) {
                        return isAuthenticated ? `You marked the booking as completed.` : `${client.username} marked the booking as completed.`;
                    } else {
                        return `This ${status} case was not anticipated.`;
                    };
                case 'completed': 
                    if ( clientStatus === 'completed' && sitterStatus === 'completed' ) {
                        return isAuthenticated ? `You've recently completed a booking with ${sitter.firstName} ${sitter.lastName}.` : `You've recently completed a booking with ${client.username}.`;
                    } else if ( clientStatus === 'pending' && sitterStatus === 'cancelled' ) {
                        return isAuthenticated ?  `${sitter.firstName} ${sitter.lastName} cancelled the booking.` : 'You cancelled the booking.';
                    } else if ( clientStatus === 'cancelled' && sitterStatus === 'pending' ) {
                        return isAuthenticated ? 'You cancelled the booking.' : `${client.username} cancelled the booking.`;
                    } else {
                        return `This ${status} case was not anticipated.`;
                    };
            };
        };

        // handle class of each status
        const handleClass = () => {
            const clientStatus = conversation.mostRecentBookingId?.clientStatus; // pending, cancelled, completed
            const sitterStatus = conversation.mostRecentBookingId?.sitterStatus; // pending, cancelled, completed
            const status = conversation.mostRecentBookingId?.status; // pending, accepted, completed

            if ( !conversation.mostRecentBookingId ) {
                return 'grey-shape';
            };

            switch (status) {
                case 'pending':
                    if ( clientStatus === 'pending' && sitterStatus === 'pending' ) {
                        return 'yellow-shape';
                    } else {
                        return 'grey-shape';
                    };
                case 'accepted':
                    if ( clientStatus === 'pending' && sitterStatus === 'pending' ) {
                        return 'green-shape';
                    } else if ( clientStatus === 'pending' && sitterStatus === 'completed' ) {
                        return 'green-shape';
                    } else if ( clientStatus === 'completed' && sitterStatus === 'pending' ) {
                        return 'green-shape';
                    } else {
                        return 'grey-shape';
                    };
                case 'completed': 
                    if ( clientStatus === 'completed' && sitterStatus === 'completed' ) {
                        return 'grey-shape';
                    } else if ( clientStatus === 'pending' && sitterStatus === 'cancelled' ) {
                        return 'red-shape';
                    } else if ( clientStatus === 'cancelled' && sitterStatus === 'pending' ) {
                        return 'red-shape';
                    } else {
                        return 'grey-shape';
                    };
            };
        };

        return (
            <div key={i} className='messages-main-section-card-container'>            
                <div onClick={() => handleConversationClick(client._id, sitter._id)} className='messages-main-section-card-container-image-info-container'>
                    <div className='messages-main-section-card-container-image-container'>
                        <img 
                        src={imageSrc}
                        alt='profile pic' 
                        className='messages-main-section-card-container-image'/>
                    </div>

                    <div className='messages-main-section-card-container-info-container'>
                        <div className='messages-main-section-card-container-info-container-name'>{receiverName}</div>
                        <div className='messages-main-section-card-container-info-container-recentMessage'>{handleRecentMessage()}</div>
                        <div className='messages-main-section-card-container-info-container-lastUpdated'><TimeAgo lastInteracted={conversation.updatedAt} /></div>
                        <div className={`messages-main-section-card-container-info-container-status ${handleClass()}`}>{handleStatus()}</div>
                    </div>
                </div>

                <hr className='messages-main-section-card-container-divider'></hr>
            </div>
        )
    });

    return (
        <div className='document-container'>
            <Header />
            <main className='content'>
                <div className='messages-main-container'>
                    <div className='messages-main-section-container'>
                        <div className='messages-main-section-container-headline'>MESSAGES</div>
                        <div>
                            <hr className='messages-main-section-card-container-divider'></hr>
                        </div>
                        <ClipLoader
                        color='#5E3104'
                        loading={isLoading}
                        size={25}
                        />
                        {messageContainer}
                    </div>

                    <div className='messages-main-page-container'>
                        <i onClick={handlePreviousPage} className={isTherePreviousPage() ? 'fa-solid fa-circle-chevron-left page-icon' : 'fa-solid fa-circle-chevron-left disable-page-icon'}></i>
                        <i onClick={handleNextPage} className={isThereNextPage() ? 'fa-solid fa-circle-chevron-right page-icon' : 'fa-solid fa-circle-chevron-right disable-page-icon'}></i>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Messages;