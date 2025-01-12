import { useState, useEffect, useRef, useContext } from 'react'
import { IsAuthContext, IsSitterAuthContext } from './App'
import { io } from 'socket.io-client'
import ClipLoader from 'react-spinners/ClipLoader'
import axios from 'axios'
import './App.css'
import './Message.css'

const Chat = ({ selectedSitter, selectedClient }) => {
    // global states
    const { userData, isAuthenticated } = useContext(IsAuthContext);
    const { sitterData, isSitterAuthenticated } = useContext(IsSitterAuthContext);
    
    // local states
    const [ message, setMessage ] = useState(''); // state for new message
    const [ messages, setMessages ] = useState([]); // store message history of chat room
    const [ chatId, setChatId ] = useState('');
    const [ currentUser, setCurrentUser ] = useState(null);
    const [ isDeleteLoading, setIsDeleteLoading ] = useState(false);
    const [ isChatLoading, setIsChatLoading ] = useState(true);

    // create ref to hold the socket object
    const socketRef = useRef(null);

    // create ref to hold the bottom of the message container
    const messageEndRef = useRef(null);

    useEffect(() => {
        // if client is the sender
        if ( isAuthenticated ) {
            setCurrentUser(userData);
        };

        // if sitter is the sender
        if ( isSitterAuthenticated ) {
            setCurrentUser(sitterData);
        };
    }, []);

    useEffect(() => {
        if ( currentUser ) { // only run after currentUser is updated
            
            // initialize socket connection to the backend
            socketRef.current = io(import.meta.env.VITE_REACT_APP_BACKEND_BASEURL);

            // send a request to backend to create a chat room once connected
            socketRef.current.emit('joinChat', {
                clientId: isAuthenticated ? currentUser._id : selectedClient._id,
                sitterId: isAuthenticated ? selectedSitter._id : currentUser._id,
            });

            // setup listener to get created (or existing) chatId from backend
            socketRef.current.on('chatId', (chatId) => setChatId(chatId));

            // setup listener to get chat history from backend
            socketRef.current.on('chatHistory', (messages) => {
                setMessages(messages);
                setIsChatLoading(false);
            });

            // setup listener to receive messages from backend
            socketRef.current.on('receiveMessage', (newMessage) => {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            });

            // cleanup on unmount
            return () => {
                // disconnect the socket upon component unmount
                socketRef.current.disconnect();
            };
        };

    }, [currentUser]);

    useEffect(() => {
        // scroll to the bottom when new message is added
        if ( messageEndRef.current ) { // if div element is rendered, scroll there
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        };
    }, [messages]);

    const handleSendMessage = () => {
        if ( chatId && message ) {
            // send 'sendMessage' event to backend with chatId and content of message
            socketRef.current.emit('sendMessage', {
                chatId,
                senderId: currentUser._id,
                senderModel: isAuthenticated ? 'User' : 'DogSitter',
                text: message,
            });
            // clear input for every send
            setMessage('');
        };
    };

    // handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];

        if ( chatId && file ) {
            const formData = new FormData();
            formData.append('email', currentUser.email);
            formData.append('chatId', chatId);
            formData.append('senderId', currentUser._id);
            formData.append('senderModel', isAuthenticated ? 'User' : 'DogSitter' );
            formData.append('file', file);
            
            try {
                // send file to the server using an HTTP POST request
                const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/messages/send-file`, formData);
                
                // send 'sendFile' event to backend with formData
                socketRef.current.emit('sendFile', {
                    chatId: chatId,
                    senderId: currentUser._id,
                    senderModel: isAuthenticated ? 'User' : 'DogSitter',
                    fileUrl: `https://drive.google.com/thumbnail?id=${response.data}`,
                });
            } catch (err) {
                console.error('Error uploading file:', err);
            };
        };
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        };
    };

    // conditional renders
    const handleProfilePicture = () => {
        if ( isAuthenticated ) {
            return `https://drive.google.com/thumbnail?id=${selectedSitter.profilePicture}`
        };

        if ( isSitterAuthenticated ) {
            return selectedClient.profilePicture.includes('googleusercontent') ? 
            selectedClient.profilePicture : 
            `https://drive.google.com/thumbnail?id=${selectedClient.profilePicture}`;
        };
    };

    const handleChatBoxName = () => {
        if ( isAuthenticated ) {
            return `${selectedSitter.firstName} ${selectedSitter.lastName}`;
        };

        if ( isSitterAuthenticated ) {
            return selectedClient.username;
        };
    };

    // delete messages in chat
    const deleteMessages = async () => {
        try {
            setIsDeleteLoading(true);
            const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/messages/delete-messages/${chatId}`);
            setMessages([]);
            setIsDeleteLoading(false);
            console.log(response.data);
        } catch (err) {
            setIsDeleteLoading(false);
            console.error('Failed deleting messages:', err.response.data.message);
        };
    };

    return (
        <>
            <div className='message-main-chatbox-details-container'>
                <div className='message-main-chatbox-image-name-container'>
                    <div className='message-main-chatbox-image-container'>
                        <img 
                        src={handleProfilePicture()} 
                        alt='profile pic' 
                        className='message-main-chatbox-image'/>
                    </div>
                    <span className='message-main-chatbox-name'>{handleChatBoxName()}</span>
                    { isDeleteLoading ? 
                    <ClipLoader
                    color='#5E3104'
                    loading={isDeleteLoading}
                    size={25}
                    /> :
                    <i onClick={deleteMessages} className="fa-solid fa-trash-can message-main-chatbox-delete-icon"></i>}
                </div>
                
                <div>
                    <hr className='message-main-chatbox-details-divider'></hr>
                </div>
            </div>
            
            <div className='message-main-chatbox-convo-container'>
                { isChatLoading ?
                <ClipLoader
                color='#5E3104'
                loading={isChatLoading}
                size={25}
                /> :
                messages.map((message, i) => {
                    // check if current message is from current user
                    const isCurrentUserSender = message.senderId === currentUser._id;
                    const isMessage = Boolean(message.text);
                    
                    return (
                        <div key={i} className={`message-main-chatbox-convo-${isCurrentUserSender ? `sender` : `receiver`}-container`}>
                            { isCurrentUserSender ? (
                                <div className='message-main-chatbox-convo-sender-frame'>
                                    {isMessage ? 
                                    <span className='message-main-chatbox-convo-sender-chat'>{message.text}</span> :
                                    <div className='message-main-chatbox-convo-sender-file-container'>
                                        <img 
                                        src={message.fileUrl}
                                        alt='Chat attachment'
                                        loading='lazy'/>
                                    </div>}
                                </div>
                            ) : (
                                <>
                                <div className='message-main-chatbox-convo-receiver-image-container'>
                                    <img 
                                    src={handleProfilePicture()}
                                    alt='profile pic'
                                    className='message-main-chatbox-convo-receiver-image' />
                                </div>
                                <div className='message-main-chatbox-convo-receiver-frame'>
                                    {isMessage ? 
                                    <span className='message-main-chatbox-convo-receiver-chat'>{message.text}</span> :
                                    <div className='message-main-chatbox-convo-receiver-file-container'>
                                        <img 
                                        src={message.fileUrl}
                                        alt='Chat attachment'
                                        loading='lazy'/>
                                    </div>}
                                </div>
                                </>
                            )}
                        </div>
                    );
                })}

                {/* basis of the scroll */}
                <div ref={messageEndRef} />
            </div>

            <div className='message-main-chatbox-chat-container'>
                <i onClick={() => document.getElementById('chat-file-upload').click()} className="fa-solid fa-image message-main-chatbox-image-icon">
                    <input
                    onChange={handleFileUpload}
                    type='file'
                    id='chat-file-upload'
                    style={{ display: 'none' }}
                    />
                </i>
                <div className='message-main-chatbox-chat-bar-container'>
                    <input 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    type='text' 
                    placeholder='Aa' 
                    className='message-main-chatbox-chat-input'/>
                </div>
                <i onClick={handleSendMessage} className="fa-solid fa-paper-plane message-main-chatbox-send-icon"></i>
            </div>
        </>
    );
};

export default Chat;