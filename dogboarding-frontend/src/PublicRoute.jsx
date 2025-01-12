import { useContext } from 'react'
import { IsAuthContext } from './App';
import { Navigate, Outlet } from 'react-router-dom'
import './App.css'

function PublicRoute() {

    const { isAuthenticated } = useContext(IsAuthContext);

    if ( isAuthenticated ) {
        console.log('User is already logged in');
        return <Navigate to='/' />
    } else {
        return <Outlet />
    };

};

export default PublicRoute;