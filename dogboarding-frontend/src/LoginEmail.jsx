import { useState, useContext } from 'react'
import { IsAuthContext, IsSitterAuthContext } from './App.jsx'
import { Link, useNavigate } from 'react-router-dom'
import useGoogleLogin from './hooks/useGoogleLogin.js'
import axios from 'axios'
import Cookies from 'universal-cookie'
import ClipLoader from 'react-spinners/ClipLoader'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import './App.css'
import './Auth.css'

function LoginEmail() {        
    const { setIsAuthenticated, setUserData } = useContext(IsAuthContext);
    const { isSitterAuthenticated, setIsSitterAuthenticated, setSitterData } = useContext(IsSitterAuthContext);
    
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ isLoginLoading, setIsLoginLoading ] = useState(false);
    
    const cookies = new Cookies();
    const navigate = useNavigate();

    const handleEmail = (e) => setEmail(e.target.value);

    const handlePassword = (e) => setPassword(e.target.value);

    // google log in
    useGoogleLogin();

    // local log in
    const handleLogin = async (e) => {
        e.preventDefault();

        if ( !email || !password ) {
            alert('Email and password are required');
            return;
        };

        try {
            setIsLoginLoading(true);
            // give credentials to server to get access token
            const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/users/login`, { email, password });

            // give token to server to be verified and extract user info
            const userInfo = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/users/current`, { 
                headers: {
                    Authorization: `Bearer ${response.data.accessToken}`
                },
            });
            
            // check if a sitter is authenticated
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
            cookies.set('jwt_authorization', response.data.accessToken, {
                path: '/', // Must match the original path used when setting the cookie
                secure: true, // Must match the original secure setting
                sameSite: 'Strict', // Must match the original sameSite setting
            });
            setIsAuthenticated(true);
            setUserData(userInfo.data);
            setIsLoginLoading(false);

            console.log('Logged in user:', userInfo.data);
            navigate('/');
        } catch (err) {
            console.error('Login failed:', err.response?.data?.message || err.message || err);
            alert(err.response?.data?.message || err.message || err);
            setIsLoginLoading(false);
        };

    };

    return (
        <div className='document-container'>
            <Header />
            <main className='content'>
                <div className='auth-main-container'>
                    <span className='auth-headline'>Welcome to DogBoarding! Let's pick up where you left off.</span>
                    <div className='auth-frame'>
                        <form onSubmit={handleLogin} className='auth-form'>
                            <div className='auth-form-group-container'>
                                <div className='auth-form-input-container'>
                                    <input onChange={handleEmail} value={email} className='auth-input' type='email' />
                                    <div className='auth-text'>Email</div>
                                </div>
                                <div className='auth-form-input-container'>
                                    <input onChange={handlePassword} value={password} className='auth-input' type='password' />
                                    <div className='auth-text'>Password</div>
                                </div>
                                { isLoginLoading ?
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <ClipLoader
                                    color='#5E3104'
                                    loading={isLoginLoading}
                                    size={25}
                                    />
                                </div> :
                                <button className='auth-button shadow' type='submit'>Login with Email</button>}
                            </div>
                        </form>
                        <span className='auth-forgot-pass-text'>Forgot your password?</span>
                        <div className='auth-frame-divider'>
                            <span className='middle-text'>or</span>
                        </div>
                        <div className='auth-google-container' id='googleSignInDiv'></div>
                        <hr className='auth-horizontal-line'></hr>
                    </div>
                    <span className='auth-footline'>Don't have an account? <Link to='/signup' className='auth-link'>Sign up</Link></span>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default LoginEmail;