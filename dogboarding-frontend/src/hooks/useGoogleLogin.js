import { useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { IsAuthContext, IsSitterAuthContext } from '../App'
import Cookies from 'universal-cookie'
import axios from 'axios'

const useGoogleLogin = () => {
    const { setIsAuthenticated, setUserData } = useContext(IsAuthContext);
    const { isSitterAuthenticated, setIsSitterAuthenticated, setSitterData } = useContext(IsSitterAuthContext);

    const navigate = useNavigate();
    const cookies = new Cookies();

    // google log in
    useEffect(() => {
        // load google identity script on page mount
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            /* global google */
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID,
                callback: handleGoogleLogin,
            });
    
            window.google.accounts.id.renderButton(
                document.getElementById('googleSignInDiv'),
                { theme: 'outline', size: 'large' },
            );
        };
        document.body.appendChild(script);

        // cleanup script on page unmount
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // google log in callback
    const handleGoogleLogin = async (response) => {
        try {
            const googleToken = response.credential;

            // give google token to the server to be verified
            // register the google user into the database if first time logging in
            // extract user info (from local db)
            const userInfo = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/users/register-google-user`, 
                {}, // empty req.body for post method
                { 
                headers: {
                    Authorization: `Bearer ${googleToken}`
                },
            });

            // sign a new JWT for my app with the user info
            const token = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/users/login-google-user`, userInfo.data);

            // give jwt token to the server to be verified
            // extract the payload (user info from local db)
            const payload = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/users/current`, { 
                headers: {
                    Authorization: `Bearer ${token.data.accessToken}`
                },
            });

            // check if sitter is authenticated
            if ( isSitterAuthenticated ) {
                // if yes, remove sitter auth
                cookies.remove('jwt_sitter_authorization', {
                    path: '/',
                    secure: true,
                    sameSite: 'Strict',
                });
                setIsSitterAuthenticated(false);
                setSitterData(null);
            };

            // setup user auth
            cookies.set('jwt_authorization', token.data.accessToken, {
                path: '/', // Must match the original path used when setting the cookie
                secure: true, // Must match the original secure setting
                sameSite: 'Strict', // Must match the original sameSite setting
            });
            setIsAuthenticated(true);
            setUserData(payload.data);

            navigate('/');
        } catch (err) {
            console.error('Google login failed:', err.message);
            setIsAuthenticated(false);
        };

    };
};

export default useGoogleLogin;