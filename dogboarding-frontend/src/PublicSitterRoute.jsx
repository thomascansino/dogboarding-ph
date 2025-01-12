import { useContext } from 'react'
import { IsSitterAuthContext } from './App';
import { Navigate, Outlet } from 'react-router-dom'
import './App.css'

function PublicSitterRoute() {

    const { isSitterAuthenticated, sitterData } = useContext(IsSitterAuthContext);

    if ( isSitterAuthenticated ) {
        console.log('Sitter is already logged in');
        return <Navigate to={`/sitter-profile/${sitterData._id}`} />
    } else {
        return <Outlet />
    };

};

export default PublicSitterRoute;