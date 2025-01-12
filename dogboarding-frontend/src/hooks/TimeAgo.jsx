import { useState, useEffect } from 'react'

function TimeAgo({ lastInteracted }) {
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        setTimeAgo(getRelativeTime(lastInteracted));
    }, [lastInteracted]);

    const getRelativeTime = (date) => {
        const now = new Date(); // get current time
        const interactedDate = new Date(date); // get time of recent interaction
        const seconds = Math.floor((now - interactedDate) / 1000); // get difference of current time and the time of recent interaction

        const intervals = {
            y: 31536000,   // Number of seconds in a year
            mo: 2592000,   // Number of seconds in a month
            w: 604800,     // Number of seconds in a week
            d: 86400,       // Number of seconds in a day
            h: 3600,       // Number of seconds in an hour
            m: 60,       // Number of seconds in a minute
        };

        for (let interval in intervals) { // loop through every property in intervals object (top to bottom)
            const timeInterval = Math.floor(seconds / intervals[interval]); // divide seconds for every interval

            if ( timeInterval >= 1 ) { // stop the loop at the largest interval that fits into the seconds difference
                return `${timeInterval}${interval} ago`; // return the string '1h ago' or '2d ago' or etc. 
            };

            // if reached bottom property without stopping, it will go to the next
        };

        return 'just now'; // return 'just now' for time interval that is less than a minute ago
        
    };

    return (
        <div>
            {!lastInteracted ? '' : `• ${timeAgo}`}
        </div>
    );
};

export default TimeAgo;