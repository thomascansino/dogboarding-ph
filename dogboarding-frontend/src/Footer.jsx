import { Link } from 'react-router-dom'
import './App.css'
import './Footer.css'

function Footer() {

    return (
        <footer className='footer-container'>
            <div className='footer-frame'>
                <div className='icons-container'>
                    <i className="fa-brands fa-facebook"></i>
                    <i className="fa-brands fa-square-instagram"></i>
                    <i className="fa-brands fa-facebook-messenger"></i>
                    <i className="fa-solid fa-envelope"></i>
                    <i className="fa-brands fa-linkedin"></i>
                </div>

                <span>{new Date().getFullYear()} © DogBoarding | <Link to='/privacy-policy' className='disable-link'>Terms & Conditions</Link> | <Link to='/privacy-policy' className='disable-link'>Privacy Policy</Link></span>
            </div>
        </footer>
    );
};

export default Footer;