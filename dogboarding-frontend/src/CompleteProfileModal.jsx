import { useNavigate } from 'react-router-dom'
import './App.css'
import './CompleteProfileModal.css'

function CompleteProfileModal({ closeModal }) {
    const navigate = useNavigate();

    const handleHomeBtn = () => {
        navigate('/sitter/login')
        closeModal();
    };

    return (
        <div className='modal'>
            <div className='overlay' onClick={handleHomeBtn}></div>
            <div className='modal-form'>
                <div className='complete-profile-modal-main-container'>
                    <div className='complete-profile-modal-main-text'>
                        You’re all set!
                    </div>
                    <div className='complete-profile-modal-main-text'>
                        <span className='bold'>Your profile is now live,</span> and you’re ready to start connecting with pet owners looking for a trusted sitter like you. Pet parents can view your profile, explore your services, and reach out to book with you directly.
                    </div>
                    <div className='complete-profile-modal-main-text'>
                        If you wish to edit your profile, you can do so in your profile section. Thank you for joining us and helping provide a safe, happy place for dogs while their owners are away. We wish you the best as you begin this new journey!
                    </div>
                    <div className='complete-profile-modal-main-text'>
                        Happy pet sitting! 🐾
                    </div>
                    
                    <div className='complete-profile-modal-main-button-container'>
                        <button onClick={handleHomeBtn} className='complete-profile-modal-main-button shadow'>Home</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfileModal;