import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Autocomplete from 'react-google-autocomplete'
import axios from 'axios'
import ClipLoader from 'react-spinners/ClipLoader'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import CompleteProfileModal from './CompleteProfileModal.jsx'
import './App.css'
import './BeADogSitter.css'

function CompleteProfile() {
    const [ isModalOpen, setIsModalOpen ] = useState(false);
    const [ profilePicture, setProfilePicture ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ confirmPassword, setConfirmPassword ] = useState('');
    const [ location, setLocation ] = useState('');
    const [ summary, setSummary ] = useState('');
    const [ numberOfDogsToWatch, setNumberOfDogsToWatch ] = useState('');
    const [ acceptedDogSize, setAcceptedDogSize ] = useState([]);
    const [ levelOfAdultSupervision, setLevelOfAdultSupervision ] = useState('');
    const [ placeOfDogWhenUnsupervised, setPlaceOfDogWhenUnsupervised ] = useState('');
    const [ placeOfDogWhenSleeping, setPlaceOfDogWhenSleeping ] = useState('');
    const [ numberOfPottyBreaks, setNumberOfPottyBreaks ] = useState('');
    const [ numberOfWalks, setNumberOfWalks ] = useState('');
    const [ typeOfHome, setTypeOfHome ] = useState('');
    const [ outdoorAreaSize, setOutdoorAreaSize ] = useState('');
    const [ emergencyTransport, setEmergencyTransport ] = useState('');
    const [ price, setPrice ] = useState('');

    const [ isLoading, setIsLoading ] = useState(false);
    const { token } = useParams();

    const handleCheckboxChange = (e, setSelectedCheckbox) => {
        const { value, checked } = e.target; // destructure value and checked attributes from input element

        if ( checked ) {
            setSelectedCheckbox((prev) => [...prev, value]); // get the current array and add the new value
        } else {
            setSelectedCheckbox((prev) => prev.filter((item) => item !== value)); // filter the current array, check each index if it's equal to the new value, if yes, remove it from array.
        };
    };

    // list of options for each question
    const acceptedDogSizeOptions = ['1-5kg', '5-10kg', '10-20kg', '20-40kg', '40+kg'];
    const levelOfAdultSupervisionOptions = ['Dogs will never be left unattended', 'Dogs might be left unattended for less than 1 hour', 'Dogs might be left unattended for more than 2 hours'];
    const placeOfDogWhenUnsupervisedOptions = ['🏠 Free roam of the house', '🚪 Sectioned off area of the house', '🌳 Outdoor area'];
    const placeOfDogWhenSleepingOptions = ['On a Dog Bed', 'In a Crate or Kennel', `Sitter's Bedroom`, 'Sectioned off area of the house'];
    const typeOfHomeOptions = ['🏠 House', '🚪 Apartment/Condo', '🛏️ Bedspace'];
    const outdoorAreaSizeOptions = ['Small (atleast the size of a balcony)', 'Medium (atleast the size of a half basketball court)', 'Large (atleast the size of a full basketball court)'];
    const emergencyTransportOptions = ['✅ Yes', '❌ No'];

    const openModal = () => {
        setIsModalOpen(true);
        document.body.classList.add('blocked');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        document.body.classList.remove('blocked');
    };

    const handleProfilePicUpload = (e) => {
        const img = e.target.files[0];
        setProfilePicture(img);
        console.log(img);
    };
    
    const summaryPlaceholder = `In this section: 
• You can describe your process of dog boarding from the start until the end of boarding date. 
• Things you need from the owner. 
• Some general reminder before being left with their dogs. 
• Some other things you want to add.`;
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (
            !profilePicture || 
            !password || 
            !confirmPassword ||
            !location || 
            !summary || 
            !numberOfDogsToWatch || 
            !acceptedDogSize.length ||
            !levelOfAdultSupervision || 
            !placeOfDogWhenUnsupervised || 
            !placeOfDogWhenSleeping || 
            !numberOfPottyBreaks || 
            !numberOfWalks || 
            !typeOfHome || 
            !outdoorAreaSize || 
            !emergencyTransport ||
            !price
        ) {
            alert('Fill up all the fields required');
            return;
        };

        if ( password !== confirmPassword ) {
            alert('Passwords do not match');
            return;
        };

        const formData = new FormData();

        formData.append('profilePicture', profilePicture);
        formData.append('password', password);
        formData.append('confirmPassword', confirmPassword);
        formData.append('location', location);
        formData.append('summary', summary);
        formData.append('numberOfDogsToWatch', numberOfDogsToWatch);
        formData.append('acceptedDogSize', JSON.stringify(acceptedDogSize)); // note: FormData appends array as a single string
        formData.append('levelOfAdultSupervision', levelOfAdultSupervision);
        formData.append('placeOfDogWhenUnsupervised', placeOfDogWhenUnsupervised);
        formData.append('placeOfDogWhenSleeping', placeOfDogWhenSleeping);
        formData.append('numberOfPottyBreaks', numberOfPottyBreaks);
        formData.append('numberOfWalks', numberOfWalks);
        formData.append('typeOfHome', typeOfHome);
        formData.append('outdoorAreaSize', outdoorAreaSize);
        formData.append('emergencyTransport', emergencyTransport);
        formData.append('price', price);

        try {
            setIsLoading(true);
            const response = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/applications/complete-profile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            console.log(response.data);
            setIsLoading(false);
            openModal();
        } catch (err) {
            console.error('Failed to submit form:', err.response?.data?.message || err.message || err);
            setIsLoading(false);
        };
        
    };
    
    return (
        <div className='document-container'>
            <Header />
            <main className='content'>
                <div className='be-a-dog-sitter-main-container'>
                    <form onSubmit={handleSubmit} className='be-a-dog-sitter-form-container'>
                        <div className='be-a-dog-sitter-form-headline'>
                            <span className='be-a-dog-sitter-form-title'>Ready to become a dog sitter?</span>
                            <span className='be-a-dog-sitter-form-text'>Let’s get you started! Please fill in the information below to create your sitter profile and join our community. 🐾</span>
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>Upload profile picture (.png, .jpg)</span>
                            <input 
                            onChange={handleProfilePicUpload}
                            type='file' 
                            accept='image/*' 
                            className='be-a-dog-sitter-form-input-container-upload' 
                            />
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>Password 🔒</span>
                            <input 
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type='password' 
                            placeholder='Aa' 
                            className='be-a-dog-sitter-form-input-container-password' />
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>Confirm Password 🔒</span>
                            <input 
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            value={confirmPassword}
                            type='password' 
                            placeholder='Aa' 
                            className='be-a-dog-sitter-form-input-container-password' />
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>City your boarding house is located at 📍</span>
                            <Autocomplete 
                            apiKey={import.meta.env.VITE_REACT_APP_GOOGLE_PLACES_API_KEY}
                            onPlaceSelected={(place) => setLocation(place.formatted_address)}
                            options={{
                                componentRestrictions: { country: 'ph' },
                            }}
                            placeholder='e.g. Manila City'
                            className='be-a-dog-sitter-form-input-container-search'
                            />
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>Summary ✍️</span>
                            <textarea 
                            onChange={(e) => setSummary(e.target.value)}
                            value={summary}
                            placeholder={summaryPlaceholder} 
                            className='be-a-dog-sitter-form-input-container-textarea'></textarea>
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>Number of dogs that will be watched at one time 🐾</span>
                            <input 
                            onChange={(e) => setNumberOfDogsToWatch(e.target.value)}
                            value={numberOfDogsToWatch}
                            type='text' 
                            placeholder='e.g. 5' 
                            className='be-a-dog-sitter-form-input-container-input' />
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>Accepted dog size 🐕</span>
                            {acceptedDogSizeOptions.map((option) => (
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
                            ))}
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>Level of adult supervision 🦮🚶</span>
                            {levelOfAdultSupervisionOptions.map((option) => (
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
                            ))}
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>The place of dogs if they are left unsupervised at home.</span>
                            {placeOfDogWhenUnsupervisedOptions.map((option) => (
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
                            ))}
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>The place where dogs will sleep at night. 🛏️💤</span>
                            {placeOfDogWhenSleepingOptions.map((option) => (
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
                            ))}
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>The number of potty breaks provided per day. 💦</span>
                            <input 
                            onChange={(e) => setNumberOfPottyBreaks(e.target.value)}
                            value={numberOfPottyBreaks}
                            type='text' 
                            placeholder='e.g. 6+' 
                            className='be-a-dog-sitter-form-input-container-input' />
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>The number of walks provided per day. 🐾</span>
                            <input 
                            onChange={(e) => setNumberOfWalks(e.target.value)}
                            value={numberOfWalks}
                            type='text' 
                            placeholder='e.g. 3' 
                            className='be-a-dog-sitter-form-input-container-input' />
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>The type of home I stay in.</span>
                            {typeOfHomeOptions.map((option) => (
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
                            ))}
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>My outdoor area size. 🌳</span>
                            {outdoorAreaSizeOptions.map((option) => (
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
                            ))}
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>Emergency transport 🚘</span>
                            {emergencyTransportOptions.map((option) => (
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
                            ))}
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>Price per night (₱)</span>
                            <input 
                            onChange={(e) => setPrice(e.target.value)}
                            value={price}
                            type='number'
                            placeholder='0' 
                            className='be-a-dog-sitter-form-input-container-number' />
                        </div>

                        <div className='be-a-dog-sitter-form-submit-container'>
                            <div></div>
                            { isLoading ? 
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <ClipLoader
                                color='#5E3104'
                                loading={isLoading}
                                size={25}
                                />
                            </div> : 
                            <button type='submit' className='be-a-dog-sitter-form-submit shadow'>Submit</button>}
                        </div>
                    </form>
                </div>
            </main>
            <Footer />

            {isModalOpen &&
            <CompleteProfileModal 
            closeModal={closeModal}
            />}
        </div>
    );
};

export default CompleteProfile;