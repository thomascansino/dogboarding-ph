import { useState, useContext } from 'react'
import { IsAuthContext, IsSitterAuthContext } from './App.jsx' 
import { Link, useNavigate } from 'react-router-dom'
import './App.css'
import './Header.css'

function NavModal() {

    const { isAuthenticated } = useContext(IsAuthContext);
    const { isSitterAuthenticated, logoutSitter } = useContext(IsSitterAuthContext);

    return (
        <div className='nav-modal-container'>
            { isAuthenticated ? // if user is logged in (sitter automatically logs out)
                (
                    <>
                        <Link to='/' className='nav-link'>Home</Link>
                        <Link to='/' className='nav-link'>About</Link>
                        <Link to='/be-a-dog-sitter' className='nav-link'>Be A Dog Sitter</Link>
                        <Link to='/messages' className='nav-link'>Messages</Link>
                        <Link to='/profile' className='nav-link'>Profile</Link>
                    </>
                ) : isSitterAuthenticated ? // if sitter is logged in (user automatically logs out)
                (
                    <>
                        <Link to='/' className='nav-link'>Home</Link>
                        <Link to='/' className='nav-link'>About</Link>
                        <Link to='/login' className='nav-link'>Login</Link>
                        <Link to='/sitter/messages' className='nav-link'>Messages</Link>
                        <Link to='/edit/sitter-profile' className='nav-link'>Profile</Link>
                        <Link to='/' onClick={logoutSitter} className='nav-link'>Logout</Link>
                    </>
                ) :
                (
                    <>
                        <Link to='/' className='nav-link'>Home</Link>
                        <Link to='/' className='nav-link'>About</Link>
                        <Link to='/be-a-dog-sitter' className='nav-link'>Be A Dog Sitter</Link>
                        <Link to='/login' className='nav-link'>Login</Link>
                    </>
                )
            }
        </div>
    );
};

export default NavModal;