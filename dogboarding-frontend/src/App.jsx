import { useState, useEffect, createContext } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Cookies from 'universal-cookie'
import axios from 'axios'
import Home from './Home.jsx'
import Profile from './Profile.jsx'
import BeADogSitter from './BeADogSitter.jsx'
import CompleteProfile from './CompleteProfile.jsx'
import Login from './Login.jsx'
import LoginEmail from './LoginEmail.jsx'
import Signup from './Signup.jsx'
import SignupEmail from './SignupEmail.jsx'
import List from './List.jsx'
import SitterLogin from './SitterLogin.jsx'
import SitterProfile from './SitterProfile.jsx'
import EditSitterProfile from './EditSitterProfile.jsx'
import Messages from './Messages.jsx'
import MessageSitter from './MessageSitter.jsx'
import MessageClient from './MessageClient.jsx'
import PrivateRoute from './PrivateRoute.jsx'
import PrivateSitterRoute from './PrivateSitterRoute.jsx'
import PublicRoute from './PublicRoute.jsx'
import PublicSitterRoute from './PublicSitterRoute.jsx'
import LinkExclusiveRoute from './LinkExclusiveRoute.jsx'
import './App.css'
import './Auth.css'

export const IsAuthContext = createContext();
export const IsSitterAuthContext = createContext();
export const GlobalStatesContext = createContext();

function App() {
  // GLOBAL AUTH CONTEXT FOR USERS
  const [ isAuthenticated, setIsAuthenticated ] = useState(null);
  const [ userData, setUserData ] = useState(null);

  // GLOBAL AUTH CONTEXT FOR DOG SITTERS
  const [ isEmailLinkAuthenticated, setIsEmailLinkAuthenticated ] = useState(null);
  const [ isSitterAuthenticated, setIsSitterAuthenticated ] = useState(null);
  const [ sitterData, setSitterData ] = useState(null);

  // GLOBAL STATES
  const [ sittersList, setSittersList ] = useState([]); // array of listed sitters
  

  // LOCAL LOADING STATE FOR CERTAIN COMPONENTS
  const [ isLoading, setIsLoading ] = useState(true);

  // app setups
  const cookies = new Cookies();
  const navigate = useNavigate();
  
  
  useEffect(() => {
    checkUserLogin();
    checkSitterLogin();
  }, []);

  // check if user is logged in or not upon app mount
  const checkUserLogin = async () => {
    const userToken = cookies.get('jwt_authorization');
    
    if ( userToken ) {
      try {
        // verify the token
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/users/current`, { 
          headers: {
              Authorization: `Bearer ${userToken}`
          },
        });

        // if verifying succeeds, set as authenticated and set user data
        setIsAuthenticated(true);
        setUserData(response.data);
        setIsLoading(false);
        console.log('Logged in user:', response.data);
      } catch (err) {

        // if verifying fails, remove the cookies and set user as unauthenticated
        cookies.remove('jwt_authorization', {
          path: '/',
          secure: true,
          sameSite: 'Strict',
        });
        setIsAuthenticated(false);
        setIsLoading(false);
      };
    } else {
      // if no token found, set as unauthenticated
      setIsAuthenticated(false);
      setIsLoading(false);
    };
  };

  // check if sitter is logged in or not upon app mount
  const checkSitterLogin = async () => {
    const sitterToken = cookies.get('jwt_sitter_authorization');
    
    if ( sitterToken ) {
      try {
        // verify the token
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/sitters/current`, {
          headers: {
            Authorization: `Bearer ${sitterToken}`
          },
        });
        
        // if verifying succeeds, set as authenticated and set sitter data
        setIsSitterAuthenticated(true);
        setSitterData(response.data);
        setIsLoading(false);
        console.log('Logged in sitter:', response.data);
      } catch (err) {

        // if verifying fails, remove the cookies and set sitter as unauthenticated
        cookies.remove('jwt_sitter_authorization', {
          path: '/',
          secure: true,
          sameSite: 'Strict',
        });
        setIsSitterAuthenticated(false);
        setIsLoading(false);
      };
    } else {
      // if no token found, set sitter as unauthenticated
      setIsSitterAuthenticated(false);
      setIsLoading(false);
    };
  };

  // logout user function
  const logout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    cookies.remove('jwt_authorization', {
      path: '/',
      secure: true,
      sameSite: 'Strict',
    });
    console.log('User logged out.');
    navigate('/');
  };

  // logout sitter function 
  const logoutSitter = () => {
    setIsSitterAuthenticated(false);
    setSitterData(null);
    cookies.remove('jwt_sitter_authorization', {
      path: '/',
      secure: true,
      sameSite: 'Strict',
    });
    console.log('Sitter logged out.');
    navigate('/');
  };

  return (
    <>
      <IsAuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, userData, setUserData, logout }} >
        <IsSitterAuthContext.Provider value={{ isSitterAuthenticated, setIsSitterAuthenticated, isEmailLinkAuthenticated, setIsEmailLinkAuthenticated, sitterData, setSitterData, logoutSitter }}>
          <GlobalStatesContext.Provider value={{ sittersList, setSittersList }}>
            <Routes>

              {/* Routes (Private & Public) */}
              <Route path='/' element={<Home />} />
              <Route path='/be-a-dog-sitter' element={<BeADogSitter />} />
              <Route path='/list' element={<List />} />
              <Route path='/sitter-profile/:sitterId' element={<SitterProfile />} />


              {/* USER-END */}
              {/* Private Routes */}
              <Route path='/profile' element={<PrivateRoute />}>
                <Route index element={<Profile isLoading={isLoading} />} />
              </Route>
              <Route path='/messages' element={<PrivateRoute />}>
                <Route index element={<Messages />} />
              </Route>
              <Route path='/message/sitter/:sitterId' element={<PrivateRoute />}>
                <Route index element={<MessageSitter />} />
              </Route>
              
              {/* Public Routes */}
              <Route path='/login' element={<PublicRoute />}>
                <Route index element={<Login />} />
              </Route>
              <Route path='/login/email' element={<PublicRoute />}>
                <Route index element={<LoginEmail />} />
              </Route>
              <Route path='/signup' element={<PublicRoute />}>
                <Route index element={<Signup />} />
              </Route>
              <Route path='/signup/email' element={<PublicRoute />}>
                <Route index element={<SignupEmail />} />
              </Route>

              {/* DOG SITTER-END */}
              {/* Link exclusive routes */}
              <Route path='/complete-profile/:token' element={<LinkExclusiveRoute />}>
                <Route index element={<CompleteProfile />} />
              </Route>
              
              {/* Private Routes */}
              <Route path='/sitter/messages' element={<PrivateSitterRoute />}>
                <Route index element={<Messages />} />
              </Route>
              <Route path='/message/client/:clientId' element={<PrivateSitterRoute />}>
                <Route index element={<MessageClient />} />
              </Route>
              <Route path='/edit/sitter-profile' element={<PrivateSitterRoute />}>
                <Route index element={<EditSitterProfile />} />
              </Route>
              
              {/* Public Routes */}
              <Route path='/sitter/login' element={<PublicSitterRoute />}>
                <Route index element={<SitterLogin />} />
              </Route>

            </Routes>
          </GlobalStatesContext.Provider>
        </IsSitterAuthContext.Provider>
      </IsAuthContext.Provider>
    </>
  )
}

export default App
