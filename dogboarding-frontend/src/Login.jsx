import { Link, useNavigate } from 'react-router-dom'
import useGoogleLogin from './hooks/useGoogleLogin.js'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import './App.css'
import './Auth.css'

function Login() {
    const navigate = useNavigate();

    const handleEmailClick = () => {
        navigate('/login/email');
    };

    // google log in
    useGoogleLogin();

    return (
        <div className='document-container'>
            <Header />
            <main className='content'>
                <div className='auth-main-container'>
                    <span className='auth-headline'>Welcome to DogBoarding! Let's pick up where you left off.</span>
                    <div className='auth-frame'>
                        <div onClick={handleEmailClick} className='email-button shadow'>
                            <div><i className="fa-solid fa-envelope"></i></div>
                            <span>Email</span>
                        </div>
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

export default Login;