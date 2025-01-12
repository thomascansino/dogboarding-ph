import { useContext } from 'react'
import { IsAuthContext } from './App';
import { Navigate, Outlet } from 'react-router-dom'
import './App.css'

function PrivateRoute() {

    const { isAuthenticated } = useContext(IsAuthContext);

    if ( isAuthenticated ) {
        return <Outlet />
    } else if ( isAuthenticated === null ) {
        return <div className='center'>Loading...Please wait</div>
    } else {
        alert('User is not authorized');
        return <Navigate to='/login' />
    };

};

export default PrivateRoute;