import { useNavigate } from 'react-router-dom'
import './App.css'
import './BeADogSitterModal.css'

function BeADogSitterModal({ closeModal }) {
    const navigate = useNavigate();

    const handleHomeBtn = () => {
        navigate('/')
        closeModal();
    };

    return (
        <div className='modal'>
            <div className='overlay' onClick={handleHomeBtn}></div>
            <div className='modal-form'>
                <div className='be-a-dog-sitter-modal-main-container'>
                    <div className='be-a-dog-sitter-modal-main-text'>
                        Thank you for completing your application!
                    </div>
                    <div className='be-a-dog-sitter-modal-main-text'>
                        We’re excited to review your information and learn more about you as a potential dog sitter with us. Our team will carefully review your application to ensure a safe and positive experience for pet owners and their furry friends.
                    </div>
                    <div className='be-a-dog-sitter-modal-main-text'>
                        You can expect to hear back from us via email <span className='bold'>within 1-2 business days</span>. Once approved, you'll receive instructions on setting up your profile and showcasing your unique services.
                    </div>
                    <div className='be-a-dog-sitter-modal-main-text'>
                        Thank you for your interest in joining our trusted community of sitters! 🐾
                    </div>
                    
                    <div className='be-a-dog-sitter-modal-main-button-container'>
                        <button onClick={handleHomeBtn} className='be-a-dog-sitter-modal-main-button shadow'>Home</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BeADogSitterModal;