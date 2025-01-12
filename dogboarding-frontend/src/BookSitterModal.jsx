import { useState, useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import { IsAuthContext } from './App'
import { FormDataContext } from './MessageSitter'
import axios from 'axios'
import ClipLoader from 'react-spinners/ClipLoader'
import './App.css'
import './BookSitterModal.css'

function BookSitterModal({ setClientBookingStatus, selectedSitter }) {
    // global states
    const { userData } = useContext(IsAuthContext);
    
    // local states
    const [ isLoading, setIsLoading ] = useState(false);

    // global state for message sitter route
    const {
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
        setPreferredMethod,
    } = useContext(FormDataContext);

    // local states
    const [ currentModal, setCurrentModal ] = useState(1);

    const dogsNeededToBoardOptions = ['1', '2', '3', '4', '5', '6', '7+'];
    const sizeOfDogsOptions = ['1-5kg', '5-10kg', '10-20kg', '20-40kg', '40+kg'];
    const preferredMethodOptions = ['🏠 Pick-up at the residence of client', '🤝 Meet-up at designated place', '🚗 Drop-off at the residence of sitter'];

    // router setups
    const [ searchParams, setSearchParams ] = useSearchParams();

    const closeBookingForm = () => {
        setSearchParams({});
    };

    const handleFormSubmission = async (isFieldComplete) => {
        if ( !isFieldComplete ) {
            return;
        };

        const formData = {
            dogsNeededToBoard,
            breedOfDogs,
            sizeOfDogs,
            additionalDetails,
            startDate,
            startTime,
            endDate,
            endTime,
            preferredMethod,
            clientId: userData._id,
            sitterId: selectedSitter._id,
        };

        try {
            setIsLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/bookings/create-booking`, formData);
            console.log('Successfully created boooking', response.data);
            setClientBookingStatus('BOOKED');
            setIsLoading(false);
            closeBookingForm();
        } catch (err) {
            console.error('Failed to book sitter:', err.response.data.message);
            setIsLoading(false);
        }; 
    };
    
    // handle changes in checkbox
    const handleCheckboxChange = (e, setSelectedCheckbox) => {
        const { value, checked } = e.target; // destructure value and checked attributes from input element

        if ( checked ) {
            setSelectedCheckbox((prev) => [...prev, value]); // get the current array and add the new value
        } else {
            setSelectedCheckbox((prev) => prev.filter((item) => item !== value)); // filter the current array, check each index if it's equal to the new value, if yes, remove it from array.
        };
    };

    // handle pagination
    const totalModals = 7;

    const handleNextPage = (isFieldComplete) => {
        if ( !isFieldComplete ) {
            return;
        };
        
        if ( currentModal < totalModals ) {
            setCurrentModal(currentModal + 1);
        };
    };

    const handlePreviousPage = () => {
        if ( currentModal > 1 ) {
            setCurrentModal(currentModal - 1);
        };
    };

    const isThereNextPage = (isFieldComplete) => {
        if ( !isFieldComplete ) {
            return false;
        };

        return currentModal <= totalModals;
    };

    const isTherePreviousPage = () => currentModal > 1;

    const pageOne = (
        <div className='book-sitter-modal-main-container'>
            <span className='book-sitter-modal-main-question'>How many dogs do you need to board? 🐾</span>

            <div className='book-sitter-modal-main-form-input-container'>
                {dogsNeededToBoardOptions.map((option) => (
                    <label key={option} className='book-sitter-modal-main-form-input-container-label'>
                        <input 
                        onChange={() => setDogsNeededToBoard(option)}
                        value={option}
                        checked={dogsNeededToBoard === option} // return true if current value of state is equal to selected option
                        type='radio' 
                        name='numberOfDogs' 
                        className='book-sitter-modal-main-form-input-container-radio' />
                        {option}
                    </label>
                ))}
            </div>

            <div className='book-sitter-modal-main-page-container'>
                <i onClick={handlePreviousPage} className={isTherePreviousPage() ? 'fa-solid fa-circle-chevron-left page-icon' : 'fa-solid fa-circle-chevron-left disable-page-icon'}></i>
                <i onClick={() => handleNextPage(dogsNeededToBoard)} className={isThereNextPage(dogsNeededToBoard) ? 'fa-solid fa-circle-chevron-right page-icon' : 'fa-solid fa-circle-chevron-right disable-page-icon'}></i>
            </div>
        </div>
    );

    const pageTwo = (
        <div className='book-sitter-modal-main-container'>
            <span className='book-sitter-modal-main-question'>What breed are your dogs? 🐶(optional)</span>

            <div className='book-sitter-modal-main-form-input-container'>
                <input 
                onChange={(e) => setBreedOfDogs(e.target.value)}
                value={breedOfDogs}
                type='text' 
                placeholder='e.g. 2 aspin, 1 golden ret, 1 german shepherd, 3 shih tzu, etc..' 
                className='book-sitter-modal-main-form-input-container-text' 
                />
            </div>

            <div className='book-sitter-modal-main-page-container'>
                <i onClick={handlePreviousPage} className={isTherePreviousPage() ? 'fa-solid fa-circle-chevron-left page-icon' : 'fa-solid fa-circle-chevron-left disable-page-icon'}></i>
                <i onClick={() => handleNextPage(true)} className={isThereNextPage(true) ? 'fa-solid fa-circle-chevron-right page-icon' : 'fa-solid fa-circle-chevron-right disable-page-icon'}></i>
            </div>
        </div>
    );

    const pageThree = (
        <div className='book-sitter-modal-main-container'>
            <span className='book-sitter-modal-main-question'>What is the size of your dog? 🐕</span>

            <div className='book-sitter-modal-main-form-input-container'>
                {sizeOfDogsOptions.map((option) => (
                    <label key={option} className='book-sitter-modal-main-form-input-container-label'>
                        <input 
                        onChange={(e) => handleCheckboxChange(e, setSizeOfDogs)}
                        value={option}
                        checked={sizeOfDogs.includes(option)} // return true if array includes the current option
                        type='checkbox' 
                        name='dog-size' 
                        className='book-sitter-modal-main-form-input-container-checkbox' />
                        {option}
                    </label>
                ))}
            </div>

            <div className='book-sitter-modal-main-page-container'>
                <i onClick={handlePreviousPage} className={isTherePreviousPage() ? 'fa-solid fa-circle-chevron-left page-icon' : 'fa-solid fa-circle-chevron-left disable-page-icon'}></i>
                <i onClick={() => handleNextPage(sizeOfDogs.length)} className={isThereNextPage(sizeOfDogs.length) ? 'fa-solid fa-circle-chevron-right page-icon' : 'fa-solid fa-circle-chevron-right disable-page-icon'}></i>
            </div>
        </div>
    );

    const pageFour = (
        <div className='book-sitter-modal-main-container'>
            <span className='book-sitter-modal-main-question'>Anything else the sitter will need to know? 📋(optional)</span>

            <div className='book-sitter-modal-main-form-input-container'>
                <input 
                onChange={(e) => setAdditionalDetails(e.target.value)}
                value={additionalDetails}
                type='text' 
                placeholder='Aa' 
                className='book-sitter-modal-main-form-input-container-text' />
            </div>

            <div className='book-sitter-modal-main-page-container'>
                <i onClick={handlePreviousPage} className={isTherePreviousPage() ? 'fa-solid fa-circle-chevron-left page-icon' : 'fa-solid fa-circle-chevron-left disable-page-icon'}></i>
                <i onClick={() => handleNextPage(true)} className={isThereNextPage(true) ? 'fa-solid fa-circle-chevron-right page-icon' : 'fa-solid fa-circle-chevron-right disable-page-icon'}></i>
            </div>
        </div>
    );

    const pageFive = (
        <div className='book-sitter-modal-main-container'>
            <span className='book-sitter-modal-main-question'>Start date of boarding: ⌛</span>

            <div className='book-sitter-modal-main-form-input-container'>
                <div className='book-sitter-modal-main-form-input-container-date-time-container'>
                    <input 
                    onChange={(e) => setStartDate(e.target.value)}
                    value={startDate}
                    type='date' 
                    name='date' 
                    className='book-sitter-modal-main-form-input-container-date-time' />
                    <input 
                    onChange={(e) => setStartTime(e.target.value)}
                    value={startTime}
                    type='time' 
                    name='time' 
                    className='book-sitter-modal-main-form-input-container-date-time' />
                </div>
            </div>

            <div className='book-sitter-modal-main-page-container'>
                <i onClick={handlePreviousPage} className={isTherePreviousPage() ? 'fa-solid fa-circle-chevron-left page-icon' : 'fa-solid fa-circle-chevron-left disable-page-icon'}></i>
                <i onClick={() => handleNextPage(startDate && startTime)} className={isThereNextPage(startDate && startTime) ? 'fa-solid fa-circle-chevron-right page-icon' : 'fa-solid fa-circle-chevron-right disable-page-icon'}></i>
            </div>
        </div>
    );

    const pageSix = (
        <div className='book-sitter-modal-main-container'>
            <span className='book-sitter-modal-main-question'>End date of boarding: 🏁</span>

            <div className='book-sitter-modal-main-form-input-container'>
                <div className='book-sitter-modal-main-form-input-container-date-time-container'>
                    <input 
                    onChange={(e) => setEndDate(e.target.value)}
                    value={endDate}
                    type='date' 
                    name='date' 
                    className='book-sitter-modal-main-form-input-container-date-time' />
                    <input 
                    onChange={(e) => setEndTime(e.target.value)}
                    value={endTime}
                    type='time' 
                    name='time' 
                    className='book-sitter-modal-main-form-input-container-date-time' />
                </div>
            </div>

            <div className='book-sitter-modal-main-page-container'>
                <i onClick={handlePreviousPage} className={isTherePreviousPage() ? 'fa-solid fa-circle-chevron-left page-icon' : 'fa-solid fa-circle-chevron-left disable-page-icon'}></i>
                <i onClick={() => handleNextPage(endDate && endTime)} className={isThereNextPage(endDate && endTime) ? 'fa-solid fa-circle-chevron-right page-icon' : 'fa-solid fa-circle-chevron-right disable-page-icon'}></i>
            </div>
        </div>
    );

    const pageSeven = (
        <div className='book-sitter-modal-main-container'>
            <span className='book-sitter-modal-main-question'>Choose preferred method:</span>

            <div className='book-sitter-modal-main-form-input-container'>
                {preferredMethodOptions.map((option) => (
                    <label key={option} className='book-sitter-modal-main-form-input-container-label'>
                        <input 
                        onChange={() => setPreferredMethod(option)}
                        value={option}
                        checked={preferredMethod === option} // return true if current value of state is equal to selected option
                        type='radio' 
                        name='methodOfExchange' 
                        className='book-sitter-modal-main-form-input-container-radio' />
                        {option}
                    </label>
                ))}
            </div>
            
            { isLoading ?
            <div className='book-sitter-modal-main-page-container' style={{ display: 'flex', justifyContent: 'center' }}>
                <ClipLoader
                color='#5E3104'
                loading={isLoading}
                size={25}
                />
            </div> :
            <div className='book-sitter-modal-main-page-container'>
                <i onClick={handlePreviousPage} className={isTherePreviousPage() ? 'fa-solid fa-circle-chevron-left page-icon' : 'fa-solid fa-circle-chevron-left disable-page-icon'}></i>
                <i onClick={() => handleFormSubmission(preferredMethod)} className={isThereNextPage(preferredMethod) ? 'fa-solid fa-circle-chevron-right page-icon' : 'fa-solid fa-circle-chevron-right disable-page-icon'}></i>
            </div>}
        </div>
    );

    const modals = () => {
        switch (currentModal) {
            case 1:
                return pageOne;
            case 2:
                return pageTwo;
            case 3:
                return pageThree;
            case 4:
                return pageFour;
            case 5:
                return pageFive;
            case 6:
                return pageSix;
            case 7:
                return pageSeven;
            default:
                return pageOne;
        };
    };

    return (
        <div className='modal'>
            <div className='overlay' onClick={closeBookingForm}>
                
            </div>
            <div className='modal-form-container'>
                <div className='book-sitter-modal-progress-bar-container shadow'>
                    <div className={`book-sitter-modal-progress-bar-filler-${currentModal}`}></div>
                </div>
                <div className='modal-form shadow'>
                    {modals()}
                </div>
            </div>
        </div>
    );
};

export default BookSitterModal;