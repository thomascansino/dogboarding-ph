import { useState, useContext } from 'react'
import { IsAuthContext, IsSitterAuthContext } from './App.jsx' 
import { Link, useNavigate } from 'react-router-dom'
import NavModal from './NavModal.jsx'
import logo from './assets/dogboarding logo.png'
import './App.css'
import './Header.css'

function Header() {

    const { isAuthenticated } = useContext(IsAuthContext);
    const { isSitterAuthenticated, logoutSitter } = useContext(IsSitterAuthContext);

    const navigate = useNavigate();
    
    // local states
    const [ isNavModalOpen, setIsNavModalOpen ] = useState(false);
    

    return (
        <header className='header-container'>
            <div className='header-frame'>
                <div className='header-logo-container'>
                    <img onClick={() => navigate('/')} className='header-logo' alt='dogboarding logo' src={logo} />
                </div>
                
                <nav className='nav-container'>
                    <i onClick={() => setIsNavModalOpen(!isNavModalOpen)} className="fa-solid fa-bars nav-frame-burger-menu"></i>
                    {isNavModalOpen && <NavModal />}
                    <div className='nav-frame'>
                        { isAuthenticated ? // if user is logged in (sitter automatically logs out)
                            (
                                <>
                                    <Link to='/' className='nav-link'>Home</Link>
                                    <Link to='/be-a-dog-sitter' className='nav-link'>Be A Dog Sitter</Link>
                                    <Link to='/messages' className='nav-link'>Messages</Link>
                                    <Link to='/profile' className='nav-link'>Profile</Link>
                                </>
                            ) : isSitterAuthenticated ? // if sitter is logged in (user automatically logs out)
                            (
                                <>
                                    <Link to='/' className='nav-link'>Home</Link>
                                    <Link to='/login' className='nav-link'>Login</Link>
                                    <Link to='/sitter/messages' className='nav-link'>Messages</Link>
                                    <Link to='/edit/sitter-profile' className='nav-link'>Profile</Link>
                                    <Link to='/' onClick={logoutSitter} className='nav-link'>Logout</Link>
                                </>
                            ) :
                            (
                                <>
                                    <Link to='/' className='nav-link'>Home</Link>
                                    <Link to='/be-a-dog-sitter' className='nav-link'>Be A Dog Sitter</Link>
                                    <Link to='/login' className='nav-link'>Login</Link>
                                </>
                            )
                        }
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;