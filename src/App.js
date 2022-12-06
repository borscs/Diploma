import React from 'react'
import {Route, BrowserRouter as Router, Routes} from 'react-router-dom'
import "firebase/auth";

import Home from './pages/Authed/Home/Home'
import Yoga from './pages/Authed/Yoga/Yoga'
import NotRegisterUser from "./pages/NotAuthed/NotRegisterUser";
import './App.css'
import PrivateRoute from "./components/Auth/PrivateRoute";
import {AuthProvider, useAuth} from "./contexts/AuthContext";
import UserData from "./pages/Authed/UserData/UserData";

export default function App() {
    const currentUser = useAuth();
    return (
        <React.Fragment>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route exact path='/' element={currentUser ? <Home/> : <NotRegisterUser/>}/>
                        <Route path='/home' element={<PrivateRoute><Home/></PrivateRoute>}/>
                        <Route path='/start' element={<PrivateRoute><Yoga/></PrivateRoute>}/>
                        <Route path='/UserData' element={<PrivateRoute><UserData/></PrivateRoute>}/>
                    </Routes>
                </Router>
            </AuthProvider>
        </React.Fragment>
    )
}


