import { useState, useContext } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import { IsAuthContext } from './App.jsx';
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import './App.css'
import './Profile.css'

function Profile({ isLoading }) {
    
    const { userData, logout } = useContext(IsAuthContext);

    return (
        <div className='document-container'>
            <Header />
            <main className='content'>
                <div className='profile-main-container'>
                    { isLoading ?
                    <ClipLoader
                    color='#5E3104'
                    loading={isLoading}
                    size={25}
                    /> :
                    <div className='profile-main-image-container'>
                        <img 
                        src={userData.profilePicture.includes('googleusercontent') ?
                            userData.profilePicture :
                            `https://drive.google.com/thumbnail?id=${userData.profilePicture}`
                            }
                        alt='profile pic' 
                        className='profile-main-image'
                        />
                    </div>}
                    <div className='profile-main-divider'>
                        <hr></hr>
                    </div>
                    <div className='profile-main-info'>
                        <span className='profile-main-info-name'>Hey, I'm <span className='bold'>{userData.username}</span></span>
                        <span className='profile-main-info-email'>{userData.email}</span>
                        <div className='profile-main-info-button-container'>
                            <button onClick={logout} className='profile-main-info-button-container-logout'>Sign out</button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Profile;
