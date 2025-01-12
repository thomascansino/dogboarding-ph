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

                <span>{new Date().getFullYear()} © DogBoarding | Terms & Conditions | Privacy Policy</span>
            </div>
        </footer>
    );
};

export default Footer;