import { useState, useContext } from 'react'
import { IsSitterAuthContext, IsAuthContext } from './App.jsx'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import ClipLoader from 'react-spinners/ClipLoader'
import Cookies from 'universal-cookie'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import './App.css'
import './Auth.css'

function SitterLogin() {        
    const { isAuthenticated, setIsAuthenticated, setUserData } = useContext(IsAuthContext);
    const { setIsSitterAuthenticated, setSitterData } = useContext(IsSitterAuthContext);
    
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ isLoginLoading, setIsLoginLoading ] = useState(false);
    
    const cookies = new Cookies();
    const navigate = useNavigate();

    const handleEmail = (e) => setEmail(e.target.value);

    const handlePassword = (e) => setPassword(e.target.value);

    // local log in
    const handleLogin = async (e) => {
        e.preventDefault();

        if ( !email || !password ) {
            alert('Email and password are required');
            return;
        };

        try {
            setIsLoginLoading(true);
            // give credentials to server
            const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/sitters/login`, { email, password });
            
            // get sitter info from database based on given credentials
            const sitterInfo = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/sitters/current`, { 
                headers: {
                    Authorization: `Bearer ${response.data.accessToken}`
                },
            });
  
            // check if a user is authenticated
            if ( isAuthenticated ) {
                // if yes, remove user auth
                cookies.remove('jwt_authorization', {
                    path: '/',
                    secure: true,
                    sameSite: 'Strict',
                });
                setIsAuthenticated(false);
                setUserData(null);
            };
            
            // setup sitter auth
            cookies.set('jwt_sitter_authorization', response.data.accessToken, {
                path: '/', // Must match the original path used when setting the cookie
                secure: true, // Must match the original secure setting
                sameSite: 'Strict', // Must match the original sameSite setting
            });
            setIsSitterAuthenticated(true);
            setSitterData(sitterInfo.data);
            
            console.log('Logged in sitter:', sitterInfo.data);
            setIsLoginLoading(false);
            navigate(`/sitter-profile/${sitterInfo.data._id}`);
        } catch (err) {
            console.error('Login failed:', err.response?.data?.message || err.message || err);
            setIsLoginLoading(false);
        };

    };

    return (
        <div className='document-container'>
            <Header />
            <main className='content'>
                <div className='auth-main-container'>
                    <span className='auth-headline'>Hello! Log in as a sitter.</span>
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
                                <ClipLoader
                                color='#5E3104'
                                loading={isLoginLoading}
                                size={25}
                                /> :
                                <button className='auth-button shadow' type='submit'>Login</button>}
                            </div>
                        </form>
                        <span className='auth-forgot-pass-text'>Forgot your password?</span>
                        <hr className='auth-horizontal-line'></hr>
                    </div>
                    <span className='auth-footline'>Not a sitter? <Link to='/be-a-dog-sitter' className='auth-link'>Become one!</Link></span>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SitterLogin;