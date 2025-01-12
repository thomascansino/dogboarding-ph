import { useState, useContext } from 'react'
import { IsAuthContext } from './App.jsx'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import ClipLoader from 'react-spinners/ClipLoader'
import StarRatings from './StarRatings.jsx'
import './App.css'
import './WriteAReview.css'

function WriteAReview({ bookingInfo, completeBooking, selectedSitter, isLoading }) {
    // global states
    const { userData } = useContext(IsAuthContext);

    // local states
    const [ reviewText, setReviewText ] = useState('');
    const [ rating, setRating ] = useState(null);
    const [ hover, setHover] = useState(null);

    // router setups
    const [ searchParams, setSearchParams ] = useSearchParams();

    // submit review and complete booking
    const handleSubmit = async () => {
        if ( !rating ) {
            alert('Please rate the sitter.');
            return;
        };

        try {
            const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/reviews/create-review`, 
                { 
                    clientId: userData._id, 
                    sitterId: selectedSitter._id, 
                    bookingId: bookingInfo._id, 
                    rating,
                    reviewText,  
                },
            );
            completeBooking();
        } catch (err) {
            console.error('Failed submitting review:', err.response.data.message);
        };
    };

    return (
        <div className='modal'>
            <div className='overlay' onClick={() => setSearchParams({})}></div>
            <div className='write-a-review-main-container shadow'>
                <div className='write-a-review-main-section-container'>
                    <div className='write-a-review-main-section-group-container'>
                        <span className='write-a-review-main-section-group-headline'>Submit a review for Thomas Cansino</span>
                    </div>
                    <hr className='write-a-review-main-section-divider'></hr>
                    <div className='write-a-review-main-section-image-container'>
                        <img src={`https://drive.google.com/thumbnail?id=${selectedSitter.profilePicture}`} className='write-a-review-main-section-image' />
                    </div>
                </div>

                <StarRatings 
                rating={rating}
                setRating={setRating}
                hover={hover}
                setHover={setHover}
                size='write-a-review-main-stars' />

                <div className='write-a-review-main-review-container'>
                    <span className='write-a-review-main-review-title'>Write about your experience</span>
                    <textarea 
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder='Aa'
                        className='write-a-review-main-review-text'></textarea>
                    { isLoading ?
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <ClipLoader
                        color='#5E3104'
                        loading={isLoading}
                        size={25}
                        />
                    </div> :
                    <button onClick={handleSubmit} className='write-a-review-main-review-submit shadow'>SUBMIT REVIEW</button>}
                </div>

            </div>
        </div>
    );
};

export default WriteAReview;
