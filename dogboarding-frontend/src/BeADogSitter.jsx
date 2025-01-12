import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import ClipLoader from 'react-spinners/ClipLoader'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import BeADogSitterModal from './BeADogSitterModal.jsx'
import './App.css'
import './BeADogSitter.css'

function BeADogSitter() {    
    const [ firstName, setFirstName ] = useState('');
    const [ lastName, setLastName ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ contact, setContact ] = useState('');
    const [ id, setId ] = useState(null);
    const [ isModalOpen, setIsModalOpen ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
        document.body.classList.add('blocked');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        document.body.classList.remove('blocked');
    };

    const handleIdUpload = (e) => {
        const file = e.target.files[0];
        setId(file);
        console.log(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if ( !firstName || !lastName || !email || !contact || !id ) {
            alert('Fill up all the fields required');
            return;
        };

        const formData = new FormData();

        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('email', email);
        formData.append('contact', contact);
        formData.append('id', id);

        try {
            setIsLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/applications`, formData);
            console.log(response.data);
            setIsLoading(false);
            openModal();
        } catch (err) {
            setIsLoading(false);
            console.error('Failed to submit form:', err.response?.data?.message || err.message || err);
            alert('Failed to submit form.');
        };
        
    };

    return (
        <div className='document-container'>
            <Header />
            <main className='content'>
                <div className='be-a-dog-sitter-main-container'>
                    <form onSubmit={handleSubmit} className='be-a-dog-sitter-form-container'>
                        <div className='be-a-dog-sitter-form-headline'>
                            <span className='be-a-dog-sitter-form-title'>Welcome!</span>
                            <span className='be-a-dog-sitter-form-text'>To begin your application to become a dog sitter, please fill in the basic details below. This will help us verify your information and get you set up for the next steps! 🐾</span>
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>First Name</span>
                            <input 
                            type='text' 
                            placeholder='e.g. Juan Dela' 
                            className='be-a-dog-sitter-form-input-container-input' 
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>Last Name</span>
                            <input 
                            type='text' 
                            placeholder='e.g. Cruz' 
                            className='be-a-dog-sitter-form-input-container-input' 
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>Email Address</span>
                            <input 
                            type='email' 
                            placeholder='e.g. juandela_cruz@gmail.com' 
                            className='be-a-dog-sitter-form-input-container-input' 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>Contact Info</span>
                            <input 
                            type='tel' 
                            placeholder='e.g. 0912-345-6789' 
                            pattern='^09\d{2}-\d{3}-\d{4}$' 
                            className='be-a-dog-sitter-form-input-container-input' 
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            />
                        </div>

                        <div className='be-a-dog-sitter-form-input-container'>
                            <span className='be-a-dog-sitter-form-input-container-title'>Any valid/secondary/student ID (passport, driver’s license, etc.)</span>
                            <input 
                            type='file' 
                            accept='image/*, .pdf' 
                            className='be-a-dog-sitter-form-input-container-upload' 
                            onChange={handleIdUpload}
                            />
                        </div>

                        <div className='be-a-dog-sitter-form-submit-container'>
                            <div className='be-a-dog-sitter-form-submit-auth-container'>
                                <span className='be-a-dog-sitter-form-submit-auth-container-text'>Already a dog sitter? </span>
                                <Link to='/sitter/login' className='be-a-dog-sitter-form-submit-auth-container-link'><span>Login</span></Link>
                            </div>

                            {isLoading ? 
                            <ClipLoader
                            color='#5E3104'
                            loading={isLoading}
                            size={25}
                            /> :
                            <button type='submit' className='be-a-dog-sitter-form-submit shadow'>Submit</button>
                            }
                        </div>
                    </form>
                </div>
            </main>
            <Footer />

            {isModalOpen &&
            <BeADogSitterModal 
            closeModal={closeModal}
            />}
        </div>
    );
};

export default BeADogSitter;