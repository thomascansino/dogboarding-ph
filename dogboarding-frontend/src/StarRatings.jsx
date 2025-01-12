import './StarRatings.css'

function StarRatings({ size, rating, setRating, hover, setHover }) {

    const starArray = [...Array(5)];


    const stars = starArray.map((star, i) => { // iterate 5 stars
        
        const ratingValue = i + 1; // rating value of each star

        return ( // return each star
            <label key={i} > 
                <input 
                value={ratingValue} 
                onClick={() => setRating(ratingValue)} 
                type='radio' 
                name='rating' 
                className='stars-main-radio' />
                <i 
                className={ratingValue <= (hover || rating) ? `fa-solid fa-star stars stars-color ${size}` : `fa-solid fa-star stars ${size}`} 
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(null)}
                ></i>
            </label>
        );
    });

    return (
        <div className='stars-main-container'>  
            {stars}
        </div>
    );
};

export default StarRatings;