import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useGoogleLogin from './hooks/useGoogleLogin.js'
import axios from 'axios'
import ClipLoader from 'react-spinners/ClipLoader'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import './App.css'
import './Auth.css'

function SignupEmail() {    
    const [ email, setEmail ] = useState('');
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ confirmPassword, setConfirmPassword ] = useState('');
    const [ isSignupLoading, setIsSignupLoading ] = useState(false);

    const navigate = useNavigate();

    const handleEmail = (e) => setEmail(e.target.value);

    const handleUsername = (e) => setUsername(e.target.value);

    const handlePassword = (e) => setPassword(e.target.value);

    const handleConfirmPassword = (e) => setConfirmPassword(e.target.value);

    // google log in
    useGoogleLogin();

    const handleSignup = async (e) => {
        e.preventDefault();

        if ( !email || !username || !password || !confirmPassword ) {
            alert('All fields are mandatory');
            return;
        };

        if ( password !== confirmPassword ) {
            alert('Passwords do not match');
            return;
        };

        try {
            setIsSignupLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/users/register`, { email, username, password, confirmPassword });
            console.log('Registered successfully:', response.data);
            alert('Registered successfully');
            setIsSignupLoading(false);
            navigate('/login/email');
        } catch (err) {
            console.error('Signup failed:', err.response?.data?.message || err.message || err);
            alert(err.response?.data?.message || err.message || err);
            setIsSignupLoading(false);
        };
    };

    return (
        <div className='document-container'>
            <Header />
            <main className='content'>
                <div className='auth-main-container'>
                    <span className='auth-headline'>Welcome to DogBoarding! Sign up with us for FREE.</span>
                    <div className='auth-frame'>
                        <form onSubmit={handleSignup} className='auth-form'>
                            <div className='auth-form-group-container'>
                                <div className='auth-form-input-container'>
                                    <input onChange={handleEmail} value={email} className='auth-input' type='email' />
                                    <div className='auth-text'>Email</div>
                                </div>
                                <div className='auth-form-input-container'>
                                    <input onChange={handleUsername} value={username} className='auth-input' type='text' />
                                    <div className='auth-text'>Username</div>
                                </div>
                                <div className='auth-form-input-container'>
                                    <input onChange={handlePassword} value={password} className='auth-input' type='password' />
                                    <div className='auth-text'>Password</div>
                                </div>
                                <div className='auth-form-input-container'>
                                    <input onChange={handleConfirmPassword} value={confirmPassword} className='auth-input' type='password' />
                                    <div className='auth-text'>Confirm Password</div>
                                </div>
                                { isSignupLoading ?
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <ClipLoader
                                    color='#5E3104'
                                    loading={isSignupLoading}
                                    size={25}
                                    />
                                </div> :
                                <button className='auth-button shadow' type='submit'>Sign up</button>}
                            </div>
                        </form>
                        <div className='auth-frame-divider'>
                            <span className='middle-text'>or</span>
                        </div>
                        <div className='auth-google-container' id='googleSignInDiv'></div>
                        <hr className='auth-horizontal-line'></hr>
                    </div>
                    <span className='auth-footline'>Already have an account? <Link to='/login' className='auth-link'>Login</Link></span>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SignupEmail;