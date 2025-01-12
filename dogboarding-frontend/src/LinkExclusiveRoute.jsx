import { useEffect, useContext } from 'react'
import { IsSitterAuthContext } from './App.jsx'
import axios from 'axios'
import { Navigate, Outlet, useParams } from 'react-router-dom'
import './App.css'

function LinkExclusiveRoute() {
    const { isEmailLinkAuthenticated, setIsEmailLinkAuthenticated } = useContext(IsSitterAuthContext);
    const { token } = useParams();
    
    useEffect(() => {
        verifyToken();
    }, []);

    const verifyToken = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/applications/initialize-profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setIsEmailLinkAuthenticated(true);
        } catch (err) {
            console.error('Verification failed:', err.response?.data?.message || err.message || err);
            setIsEmailLinkAuthenticated(false);
        };
    };

    if ( isEmailLinkAuthenticated ) {
        return <Outlet />
    } else if ( isEmailLinkAuthenticated === null ) {
        return <div className='center'>Loading...Please wait</div>
    } else {
        return <Navigate to='/sitter/login' />
    };

};

export default LinkExclusiveRoute;