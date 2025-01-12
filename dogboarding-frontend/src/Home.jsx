import { useNavigate } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import dogImages from './assets/Frame 46.png'
import './App.css'
import './Home.css'

function Home() {
    const navigate = useNavigate();

    return (
        <div className='document-container'>
            <Header /> 
            <main className='content'>
                <div className='home-main-container'>
                    <div className='home-left-container'>
                        <span className='home-headline'>Board Your Dog With Trusted Dog Sitters Around Metro Manila</span>
                        <div onClick={() => navigate('/list')} className='home-button shadow'>
                            <span className='home-button-text'>Board Your Dog</span>
                            <span className='home-button-text'>→</span>
                        </div>
                    </div>
                    <div className='home-right-container'>
                        <img className='home-images' alt='dog images' src={dogImages} />
                    </div>
                </div>
            </main>
           <Footer />
        </div>
    );
};

export default Home;