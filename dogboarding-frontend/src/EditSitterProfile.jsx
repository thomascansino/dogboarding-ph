import { useState, useEffect, useContext } from 'react'
import { IsSitterAuthContext } from './App.jsx'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import StarRatings from 'react-star-ratings'
import ClipLoader from 'react-spinners/ClipLoader'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import './App.css'
import './SitterProfile.css'
import './EditSitterProfile.css'

function EditSitterProfile() {
    // global states
    const { sitterData } = useContext(IsSitterAuthContext);

    // local states
    const [ sitterProfile, setSitterProfile ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ isProfileImagesLoading, setIsProfileImagesLoading ] = useState(false);
    const [ isProfilePictureLoading, setIsProfilePictureLoading ] = useState(false);
    const [ currentPage, setCurrentPage ] = useState(1); // handle pagination
    const [ reviews, setReviews ] = useState([]);
    const [ totalPages, setTotalPages ] = useState(null);

    // editing modal states
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [isEditingSummary, setIsEditingSummary] = useState(false);
    const [isEditingNumberOfDogsToWatch, setIsEditingNumberOfDogsToWatch] = useState(false);
    const [isEditingAcceptedDogSize, setIsEditingAcceptedDogSize] = useState(false);
    const [isEditingLevelOfAdultSupervision, setIsEditingLevelOfAdultSupervision] = useState(false);
    const [isEditingPlaceOfDogWhenUnsupervised, setIsEditingPlaceOfDogWhenUnsupervised] = useState(false);
    const [isEditingPlaceOfDogWhenSleeping, setIsEditingPlaceOfDogWhenSleeping] = useState(false);
    const [isEditingNumberOfPottyBreaks, setIsEditingNumberOfPottyBreaks] = useState(false);
    const [isEditingNumberOfWalks, setIsEditingNumberOfWalks] = useState(false);
    const [isEditingTypeOfHome, setIsEditingTypeOfHome] = useState(false);
    const [isEditingOutdoorAreaSize, setIsEditingOutdoorAreaSize] = useState(false);
    const [isEditingEmergencyTransport, setIsEditingEmergencyTransport] = useState(false);

    // editing states
    const [description, setDescription] = useState('');
    const [summary, setSummary] = useState('');
    const [numberOfDogsToWatch, setNumberOfDogsToWatch] = useState('');
    const [acceptedDogSize, setAcceptedDogSize] = useState([]);
    const [levelOfAdultSupervision, setLevelOfAdultSupervision] = useState('');
    const [placeOfDogWhenUnsupervised, setPlaceOfDogWhenUnsupervised] = useState('');
    const [placeOfDogWhenSleeping, setPlaceOfDogWhenSleeping] = useState('');
    const [numberOfPottyBreaks, setNumberOfPottyBreaks] = useState('');
    const [numberOfWalks, setNumberOfWalks] = useState('');
    const [typeOfHome, setTypeOfHome] = useState('');
    const [outdoorAreaSize, setOutdoorAreaSize] = useState('');
    const [emergencyTransport, setEmergencyTransport] = useState('');
    const [ profilePicture, setProfilePicture ] = useState('');
    const [ profileImages, setProfileImages ] = useState([]);

    // router setups
    const navigate = useNavigate();
    
    useEffect(() => {
        getSitterProfile();
    }, []);

    useEffect(() => {
        getReviews();
    }, [currentPage]);

    const getSitterProfile = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/${sitterData._id}`);
            setSitterProfile(response.data);
            setDescription(response.data.description);
            setSummary(response.data.summary);
            setNumberOfDogsToWatch(response.data.numberOfDogsToWatch);
            setAcceptedDogSize(response.data.acceptedDogSize);
            setLevelOfAdultSupervision(response.data.levelOfAdultSupervision);
            setPlaceOfDogWhenUnsupervised(response.data.placeOfDogWhenUnsupervised);
            setPlaceOfDogWhenSleeping(response.data.placeOfDogWhenSleeping);
            setNumberOfPottyBreaks(response.data.numberOfPottyBreaks);
            setNumberOfWalks(response.data.numberOfWalks);
            setTypeOfHome(response.data.typeOfHome);
            setOutdoorAreaSize(response.data.outdoorAreaSize);
            setEmergencyTransport(response.data.emergencyTransport);
            setProfilePicture(response.data.profilePicture);
            setProfileImages(response.data.images);
            setIsLoading(false);
            console.log('Sitter profile info:', response.data);
        } catch (err) {
            navigate('/list');
            setIsLoading(false);
            console.error('Failed to get selected sitter:', err);
        };
    };

    const getReviews = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/reviews/get-reviews/${sitterData._id}?page=${currentPage}`);
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
    const averageRating = Math.round((sitterProfile?.ratings?.totalRating / sitterProfile?.ratings?.numberOfRatings) * 10)/10;

    const formattedAcceptedDogSize = acceptedDogSize.map(size => <div key={size}>{size}</div>);

    const formattedLocation = sitterProfile?.location.replace(', Philippines', '');

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

    // client reviews
    const showReviews = reviews.map(client => {
        
        // date string --> date object --> format to (e.g. January 10, 2025)
        const formattedDate = new Date(client.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }); 

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
                                <span className='sitter-profile-review-card-info-container-date'>{formattedDate}</span>
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
    
    // map options
    const acceptedDogSizeOptions = ['1-5kg', '5-10kg', '10-20kg', '20-40kg', '40+kg'];
    const levelOfAdultSupervisionOptions = ['Dogs will never be left unattended', 'Dogs might be left unattended for less than 1 hour', 'Dogs might be left unattended for more than 2 hours'];
    const placeOfDogWhenUnsupervisedOptions = ['🏠 Free roam of the house', '🚪 Sectioned off area of the house', '🌳 Outdoor area'];
    const placeOfDogWhenSleepingOptions = ['On a Dog Bed', 'In a Crate or Kennel', `Sitter's Bedroom`, 'Sectioned off area of the house'];
    const typeOfHomeOptions = ['🏠 House', '🚪 Apartment/Condo', '🛏️ Bedspace'];
    const outdoorAreaSizeOptions = ['Small (atleast the size of a balcony)', 'Medium (atleast the size of a half basketball court)', 'Large (atleast the size of a full basketball court)'];
    const emergencyTransportOptions = ['✅ Yes', '❌ No'];

    const handleCheckboxChange = (e, setSelectedCheckbox) => {
        const { value, checked } = e.target; // destructure value and checked attributes from input element

        if ( checked ) {
            setSelectedCheckbox((prev) => [...prev, value]); // get the current array and add the new value
        } else {
            setSelectedCheckbox((prev) => prev.filter((item) => item !== value)); // filter the current array, check each index if it's equal to the new value, if yes, remove it from array.
        };
    };

    // handle editing modals
    const editDescription = async () => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/edit-profile/${sitterData._id}`, { description });
            console.log('Edited description:', response.data);
            setIsEditingDescription(false);
        } catch (err) {
            console.error('Failed editing description:', err.response.data.message);
        };
    };

    const editSummary = async () => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/edit-profile/${sitterData._id}`, { summary });
            console.log('Edited summary:', response.data);
            setIsEditingSummary(false);
        } catch (err) {
            console.error('Failed editing description:', err.response.data.message);
        };
    };

    const editNumberOfDogsToWatch = async () => { 
        try {
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/edit-profile/${sitterData._id}`, { numberOfDogsToWatch });
            console.log('Edited number of dogs to watch:', response.data);
            setIsEditingNumberOfDogsToWatch(false); 
        } catch (err) {
            console.error('Failed to edit number of dogs to watch:', err.response.data.message); 
        };
    };

    const editAcceptedDogSize = async () => { 
        try {
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/edit-profile/${sitterData._id}`, { acceptedDogSize });
            console.log('Edited accepted dog size:', response.data);
            setIsEditingAcceptedDogSize(false); 
        } catch (err) {
            console.error('Failed to edit accepted dog size:', err.response.data.message); 
        };
    };
    
    const editLevelOfAdultSupervision = async () => { 
        try {
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/edit-profile/${sitterData._id}`, { levelOfAdultSupervision });
            console.log('Edited level of adult supervision:', response.data);
            setIsEditingLevelOfAdultSupervision(false); 
        } catch (err) {
            console.error('Failed to edit level of adult supervision:', err.response.data.message); 
        };
    };
    
    const editPlaceOfDogWhenUnsupervised = async () => { 
        try {
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/edit-profile/${sitterData._id}`, { placeOfDogWhenUnsupervised });
            console.log('Edited place of dog when unsupervised:', response.data);
            setIsEditingPlaceOfDogWhenUnsupervised(false); 
        } catch (err) {
            console.error('Failed to edit place of dog when unsupervised:', err.response.data.message); 
        };
    };
    
    const editPlaceOfDogWhenSleeping = async () => { 
        try {
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/edit-profile/${sitterData._id}`, { placeOfDogWhenSleeping });
            console.log('Edited place of dog when sleeping:', response.data);
            setIsEditingPlaceOfDogWhenSleeping(false); 
        } catch (err) {
            console.error('Failed to edit place of dog when sleeping:', err.response.data.message); 
        };
    };
    
    const editNumberOfPottyBreaks = async () => { 
        try {
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/edit-profile/${sitterData._id}`, { numberOfPottyBreaks });
            console.log('Edited number of potty breaks:', response.data);
            setIsEditingNumberOfPottyBreaks(false); 
        } catch (err) {
            console.error('Failed to edit number of potty breaks:', err.response.data.message); 
        };
    };
    
    const editNumberOfWalks = async () => { 
        try {
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/edit-profile/${sitterData._id}`, { numberOfWalks });
            console.log('Edited number of walks:', response.data);
            setIsEditingNumberOfWalks(false); 
        } catch (err) {
            console.error('Failed to edit number of walks:', err.response.data.message); 
        };
    };
    
    const editTypeOfHome = async () => { 
        try {
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/edit-profile/${sitterData._id}`, { typeOfHome });
            console.log('Edited type of home:', response.data);
            setIsEditingTypeOfHome(false); 
        } catch (err) {
            console.error('Failed to edit type of home:', err.response.data.message); 
        };
    };
    
    const editOutdoorAreaSize = async () => { 
        try {
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/edit-profile/${sitterData._id}`, { outdoorAreaSize });
            console.log('Edited outdoor area size:', response.data);
            setIsEditingOutdoorAreaSize(false); 
        } catch (err) {
            console.error('Failed to edit outdoor area size:', err.response.data.message); 
        };
    };
    
    const editEmergencyTransport = async () => { 
        try {
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/edit-profile/${sitterData._id}`, { emergencyTransport });
            console.log('Edited emergency transport:', response.data);
            setIsEditingEmergencyTransport(false); 
        } catch (err) {
            console.error('Failed to edit emergency transport:', err.response.data.message); 
        };
    };
    

    // handle file uploads
    const handleProfilePictureUpload = async (e) => {
        try {
            const file = e.target.files[0];

            const formData = new FormData();
            formData.append('file', file);
            formData.append('email', sitterData.email);
            
            setIsProfilePictureLoading(true);
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/edit-profile/${sitterData._id}`, formData);
            setProfilePicture(response.data.profilePicture);
            setIsProfilePictureLoading(false);
            console.log('Edited profile picture:', response.data);
        } catch (err) {
            console.error('Failed to edit profile picture:', err.response.data.message);
            setIsProfilePictureLoading(false);
        };
    };

    const handleProfileImagesUpload = async (e) => {
        try {
            const image = e.target.files[0]; 

            const formData = new FormData();
            formData.append('image', image);
            formData.append('email', sitterData.email);

            setIsProfileImagesLoading(true);
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/edit-profile/profile-images/${sitterData._id}`, formData);
            setProfileImages(response.data.images);
            setIsProfileImagesLoading(false);
            console.log('Edited profile images:', response.data);
        } catch (err) {
            setIsProfileImagesLoading(false);
            console.error('Failed to edit profile images:', err.response.data.message);
        };
    };

    // handle delete image 
    const handleDeleteImage = async (imageId) => {
        try {
            setIsProfileImagesLoading(true);
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/listings/delete-image/${sitterData._id}`, { imageId });
            setProfileImages(response.data.images);
            setIsProfileImagesLoading(false);
            console.log('Deleted image in database and drive:', response.data.images);
        } catch (err) {
            setIsProfileImagesLoading(false);
            console.error('Failed to delete image:', err.response.data.message);
        };
    };

    return (
        <div className='document-container'>
            <Header />
            <main className='content'>
                <div className='sitter-profile-main-container'>
                    <div className='sitter-profile-section-container'>
                        <div className='sitter-profile-info-container'>
                            {isProfilePictureLoading ?
                            <ClipLoader
                            color='#5E3104'
                            loading={isProfilePictureLoading}
                            size={25}
                            /> :
                            <div onClick={() => document.getElementById('file-upload').click()} className='edit-sitter-profile-info-container-image-container'>
                                <input 
                                onChange={handleProfilePictureUpload}
                                id='file-upload'
                                type='file' 
                                accept='image/*'
                                className='edit-sitter-profile-info-container-image-container-input'
                                />
                                <i className="fa-solid fa-camera edit-sitter-profile-info-container-image-icon"></i>
                                <img 
                                src={`https://drive.google.com/thumbnail?id=${profilePicture}`} 
                                alt='profile pic' 
                                className='edit-sitter-profile-info-container-image'/>
                            </div>}
                            <div className='sitter-profile-info-container-info'>
                                <div className='sitter-profile-info-container-name'>{`${sitterProfile.firstName} ${sitterProfile.lastName}`}</div>
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
                                    <span className='sitter-profile-info-reviews'>{sitterProfile.ratings.numberOfRatings} Reviews</span>
                                </div>
                                <div className='sitter-profile-info-group-bookings'>
                                    <i className="fa-regular fa-calendar"></i>
                                    <span className='sitter-profile-info-bookings'>{sitterProfile.completedBookings}</span> Completed Bookings
                                </div>
                            </div>
                        </div>

                        <div>
                            <hr></hr>
                        </div>

                        <div className='sitter-profile-description-container'>
                            <div className='sitter-profile-description-container-title'>
                                <i onClick={() => document.getElementById('images-upload').click()} className="fa-regular fa-images brown-text edit-sitter-profile-info-container-description-icon">
                                    <input
                                    onChange={handleProfileImagesUpload}
                                    id='images-upload'
                                    type='file'
                                    accept='image/*'
                                    className='edit-sitter-profile-info-container-image-container-input'
                                    />
                                </i>
                                {`${sitterProfile.firstName} ${sitterProfile.lastName}'s Pets`}
                            </div>
                            <div className='sitter-profile-description-images-container'>
                                { isProfileImagesLoading ?
                                <ClipLoader
                                color='#5E3104'
                                loading={isProfileImagesLoading}
                                size={25}
                                /> :
                                profileImages.length > 0 ? profileImages.map((image, i) => 
                                    <div onClick={() => handleDeleteImage(image)} key={i} className='edit-sitter-profile-description-images-image-container'>
                                        <i className="fa-solid fa-trash edit-sitter-profile-description-images-icon"></i>
                                        <img 
                                        src={`https://drive.google.com/thumbnail?id=${image}`}
                                        alt={`Image ${i + 1}`} 
                                        className='edit-sitter-profile-description-images-image' 
                                        />
                                    </div>
                                ) : 'No images to show.'}
                            </div>
                            <div className='edit-sitter-profile-description-container-description'>
                                <div className='sitter-profile-summary-title'>
                                    { !isEditingDescription && <i onClick={() => setIsEditingDescription(true)} className="fa-regular fa-pen-to-square edit-sitter-profile-title-icons"></i> }
                                    { isEditingDescription && <i onClick={editDescription} className="fa-regular fa-circle-check edit-sitter-profile-title-icons-submit"></i> }
                                    About Me 📃
                                </div>
                                { isEditingDescription ? 
                                <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows='20'
                                className='edit-sitter-profile-textarea'
                                /> :
                                <pre className='edit-sitter-profile-pre-format-text'>{description}</pre>}
                            </div>
                        </div>

                        <div>
                            <hr></hr>
                        </div>

                        <div className='sitter-profile-summary-preference-container'>
                            <div className='sitter-profile-summary-container'>
                                <span className='sitter-profile-summary-title'>
                                    { !isEditingSummary && <i onClick={() => setIsEditingSummary(true)} className="fa-regular fa-pen-to-square edit-sitter-profile-title-icons"></i> }
                                    { isEditingSummary && <i onClick={editSummary} className="fa-regular fa-circle-check edit-sitter-profile-title-icons-submit"></i> }
                                    Summary ✍️
                                </span>
                                <span className='sitter-profile-summary-text'>
                                    { isEditingSummary ? 
                                    <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    rows='20'
                                    className='edit-sitter-profile-textarea'
                                    /> :
                                    <pre className='edit-sitter-profile-pre-format-text'>{summary}</pre>}
                                </span>
                            </div>

                            <div className='sitter-profile-preference-container'>
                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>
                                        { !isEditingNumberOfDogsToWatch && <i onClick={() => setIsEditingNumberOfDogsToWatch(true)} className="fa-regular fa-pen-to-square edit-sitter-profile-title-icons"></i> }
                                        { isEditingNumberOfDogsToWatch && <i onClick={editNumberOfDogsToWatch} className="fa-regular fa-circle-check edit-sitter-profile-title-icons-submit"></i> }
                                        Number of dogs that will be watched at one time 🐾</span>
                                    <span className='sitter-profile-preference-text'>
                                        { isEditingNumberOfDogsToWatch ? 
                                        <input
                                        value={numberOfDogsToWatch}
                                        onChange={(e) => setNumberOfDogsToWatch(e.target.value)}
                                        type='text' 
                                        placeholder='e.g. 5-10' 
                                        className='edit-sitter-profile-input'
                                        /> :
                                        numberOfDogsToWatch}
                                    </span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>
                                        { !isEditingAcceptedDogSize && <i onClick={() => setIsEditingAcceptedDogSize(true)} className="fa-regular fa-pen-to-square edit-sitter-profile-title-icons"></i> }
                                        { isEditingAcceptedDogSize && <i onClick={editAcceptedDogSize} className="fa-regular fa-circle-check edit-sitter-profile-title-icons-submit"></i> }
                                        Accepted dog size 🐕
                                    </span>
                                    <span className='sitter-profile-preference-text'>
                                        { isEditingAcceptedDogSize ? 
                                        acceptedDogSizeOptions.map((option) => (
                                            <label key={option} className='be-a-dog-sitter-form-input-container-label'>
                                                <input 
                                                onChange={(e) => handleCheckboxChange(e, setAcceptedDogSize)}
                                                value={option}
                                                checked={acceptedDogSize.includes(option)} // return true if array includes the current option
                                                type='checkbox' 
                                                name='dog-size' 
                                                className='be-a-dog-sitter-form-input-container-checkbox' />
                                                {option}
                                            </label>
                                        )) :
                                        formattedAcceptedDogSize}
                                    </span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>
                                        { !isEditingLevelOfAdultSupervision && <i onClick={() => setIsEditingLevelOfAdultSupervision(true)} className="fa-regular fa-pen-to-square edit-sitter-profile-title-icons"></i> }
                                        { isEditingLevelOfAdultSupervision && <i onClick={editLevelOfAdultSupervision} className="fa-regular fa-circle-check edit-sitter-profile-title-icons-submit"></i> }
                                        Level of adult supervision 🦮🚶
                                    </span>
                                    <span className='sitter-profile-preference-text'>
                                        { isEditingLevelOfAdultSupervision ? 
                                        levelOfAdultSupervisionOptions.map((option) => (
                                            <label key={option} className='be-a-dog-sitter-form-input-container-label'>
                                                <input 
                                                onChange={() => setLevelOfAdultSupervision(option)}
                                                value={option}
                                                checked={levelOfAdultSupervision === option} // return true if current value of state is equal to selected option
                                                type='radio' 
                                                name='adult-supervision' 
                                                className='be-a-dog-sitter-form-input-container-radio' />
                                                {option}
                                            </label>
                                        )) :
                                        levelOfAdultSupervision}
                                    </span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>
                                        { !isEditingPlaceOfDogWhenUnsupervised && <i onClick={() => setIsEditingPlaceOfDogWhenUnsupervised(true)} className="fa-regular fa-pen-to-square edit-sitter-profile-title-icons"></i> }
                                        { isEditingPlaceOfDogWhenUnsupervised && <i onClick={editPlaceOfDogWhenUnsupervised} className="fa-regular fa-circle-check edit-sitter-profile-title-icons-submit"></i> }
                                        The place your dog will be if they are left unsupervised at home.
                                    </span>
                                    <span className='sitter-profile-preference-text'>
                                        { isEditingPlaceOfDogWhenUnsupervised ?
                                        placeOfDogWhenUnsupervisedOptions.map((option) => (
                                            <label key={option} className='be-a-dog-sitter-form-input-container-label'>
                                                <input 
                                                onChange={() => setPlaceOfDogWhenUnsupervised(option)}
                                                value={option}
                                                checked={placeOfDogWhenUnsupervised === option} // return true if current value of state is equal to selected option
                                                type='radio' 
                                                name='place-unsupervised' 
                                                className='be-a-dog-sitter-form-input-container-radio' />
                                                {option}
                                            </label>
                                        )) :
                                        placeOfDogWhenUnsupervised}
                                    </span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>
                                        { !isEditingPlaceOfDogWhenSleeping && <i onClick={() => setIsEditingPlaceOfDogWhenSleeping(true)} className="fa-regular fa-pen-to-square edit-sitter-profile-title-icons"></i> }
                                        { isEditingPlaceOfDogWhenSleeping && <i onClick={editPlaceOfDogWhenSleeping} className="fa-regular fa-circle-check edit-sitter-profile-title-icons-submit"></i> }
                                        The place your dog will sleep at night. 🛏️💤
                                    </span>
                                    <span className='sitter-profile-preference-text'>
                                        { isEditingPlaceOfDogWhenSleeping ? 
                                        placeOfDogWhenSleepingOptions.map((option) => (
                                            <label key={option} className='be-a-dog-sitter-form-input-container-label'>
                                                <input 
                                                onChange={() => setPlaceOfDogWhenSleeping(option)}
                                                value={option}
                                                checked={placeOfDogWhenSleeping === option} // return true if current value of state is equal to selected option
                                                type='radio' 
                                                name='place-sleep' 
                                                className='be-a-dog-sitter-form-input-container-radio' />
                                                {option}
                                            </label>
                                        )) :
                                        placeOfDogWhenSleeping}
                                    </span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>
                                        { !isEditingNumberOfPottyBreaks && <i onClick={() => setIsEditingNumberOfPottyBreaks(true)} className="fa-regular fa-pen-to-square edit-sitter-profile-title-icons"></i> }
                                        { isEditingNumberOfPottyBreaks && <i onClick={editNumberOfPottyBreaks} className="fa-regular fa-circle-check edit-sitter-profile-title-icons-submit"></i> }
                                        The number of potty breaks provided per day. 💦
                                    </span>
                                    <span className='sitter-profile-preference-text'>
                                        { isEditingNumberOfPottyBreaks ?
                                        <input 
                                        value={numberOfPottyBreaks}
                                        onChange={(e) => setNumberOfPottyBreaks(e.target.value)}
                                        type='text' 
                                        placeholder='e.g. 6+' 
                                        className='edit-sitter-profile-input' /> :
                                        numberOfPottyBreaks}
                                    </span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>
                                        { !isEditingNumberOfWalks && <i onClick={() => setIsEditingNumberOfWalks(true)} className="fa-regular fa-pen-to-square edit-sitter-profile-title-icons"></i> }
                                        { isEditingNumberOfWalks && <i onClick={editNumberOfWalks} className="fa-regular fa-circle-check edit-sitter-profile-title-icons-submit"></i> }
                                        The number of walks provided per day. 🐾
                                    </span>
                                    <span className='sitter-profile-preference-text'>
                                        { isEditingNumberOfWalks ?
                                        <input 
                                        value={numberOfWalks}
                                        onChange={(e) => setNumberOfWalks(e.target.value)}
                                        type='text' 
                                        placeholder='e.g. 3' 
                                        className='edit-sitter-profile-input' /> :
                                        numberOfWalks}
                                    </span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>
                                        { !isEditingTypeOfHome && <i onClick={() => setIsEditingTypeOfHome(true)} className="fa-regular fa-pen-to-square edit-sitter-profile-title-icons"></i> }
                                        { isEditingTypeOfHome && <i onClick={editTypeOfHome} className="fa-regular fa-circle-check edit-sitter-profile-title-icons-submit"></i> }
                                        The type of home I stay in.
                                    </span>
                                    <span className='sitter-profile-preference-text'>
                                        { isEditingTypeOfHome ?
                                        typeOfHomeOptions.map((option) => (
                                            <label key={option} className='be-a-dog-sitter-form-input-container-label'>
                                                <input 
                                                onChange={() => setTypeOfHome(option)}
                                                value={option}
                                                checked={typeOfHome === option} // return true if current value of state is equal to selected option
                                                type='radio' 
                                                name='home-type' 
                                                className='be-a-dog-sitter-form-input-container-radio' />
                                                {option}
                                            </label>
                                        )) :
                                        typeOfHome}
                                    </span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>
                                        { !isEditingOutdoorAreaSize && <i onClick={() => setIsEditingOutdoorAreaSize(true)} className="fa-regular fa-pen-to-square edit-sitter-profile-title-icons"></i> }
                                        { isEditingOutdoorAreaSize && <i onClick={editOutdoorAreaSize} className="fa-regular fa-circle-check edit-sitter-profile-title-icons-submit"></i> }
                                        My outdoor area size. 🌳
                                    </span>
                                    <span className='sitter-profile-preference-text'>
                                        { isEditingOutdoorAreaSize ?
                                        outdoorAreaSizeOptions.map((option) => (
                                            <label key={option} className='be-a-dog-sitter-form-input-container-label'>
                                                <input 
                                                onChange={() => setOutdoorAreaSize(option)}
                                                value={option}
                                                checked={outdoorAreaSize === option} // return true if current value of state is equal to selected option
                                                type='radio' 
                                                name='outdoor-size' 
                                                className='be-a-dog-sitter-form-input-container-radio' />
                                                {option}
                                            </label>
                                        )) :
                                        outdoorAreaSize}
                                    </span>
                                </div>

                                <div className='sitter-profile-preference-group-container'>
                                    <span className='sitter-profile-preference-title'>
                                        { !isEditingEmergencyTransport && <i onClick={() => setIsEditingEmergencyTransport(true)} className="fa-regular fa-pen-to-square edit-sitter-profile-title-icons"></i> }
                                        { isEditingEmergencyTransport && <i onClick={editEmergencyTransport} className="fa-regular fa-circle-check edit-sitter-profile-title-icons-submit"></i> }
                                        Emergency transport. 🚘
                                    </span>
                                    <span className='sitter-profile-preference-text'>
                                        { isEditingEmergencyTransport ?
                                        emergencyTransportOptions.map((option) => (
                                            <label key={option} className='be-a-dog-sitter-form-input-container-label'>
                                                <input 
                                                onChange={() => setEmergencyTransport(option)}
                                                value={option}
                                                checked={emergencyTransport === option} // return true if current value of state is equal to selected option
                                                type='radio' 
                                                name='emergency-transport' 
                                                className='be-a-dog-sitter-form-input-container-radio' />
                                                {option}
                                            </label>
                                        )) :
                                        emergencyTransport}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='sitter-profile-reviews-container'>
                            <div>
                                <hr></hr>
                            </div>

                            <div className='sitter-profile-group-reviews'>
                                <span className='sitter-profile-group-reviews-text'>{sitterProfile.ratings.numberOfRatings} Reviews</span>
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
                                className='sitter-profile-sticky-main-group-headline-button disable-brown-button shadow'>SEND A MESSAGE</button>
                            </div>

                            <div className='sitter-profile-sticky-main-group-container'>
                                <div className='sitter-profile-sticky-main-group-headline'>
                                    <div className='sitter-profile-sticky-main-group-headline-title'>
                                        <i className="fa-solid fa-house green-text"></i>
                                        <span>Dog Boarding</span>
                                    </div>

                                    <div className='sitter-profile-sticky-main-group-headline-text'>
                                        From <span className='bold'>₱ {sitterProfile.price}</span> /night
                                    </div>
                                </div>

                                <button 
                                className='sitter-profile-sticky-main-group-headline-button disable-green-button shadow'>BOOK NOW</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default EditSitterProfile;