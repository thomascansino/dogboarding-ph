import { useContext } from 'react'
import { IsSitterAuthContext } from './App';
import { Navigate, Outlet } from 'react-router-dom'
import './App.css'

function PrivateSitterRoute() {

    const { isSitterAuthenticated } = useContext(IsSitterAuthContext);

    if ( isSitterAuthenticated ) {
        return <Outlet />
    } else if ( isSitterAuthenticated === null ) {
        return <div className='center'>Loading...Please wait</div>
    } else {
        alert('Not authorized.');
        return <Navigate to='/sitter/login' />
    };

};

export default PrivateSitterRoute;