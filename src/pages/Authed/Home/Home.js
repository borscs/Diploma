import React from 'react'
import {Link, useNavigate, useNavigation} from 'react-router-dom'

import './Home.css'
import {useAuth} from "../../../contexts/AuthContext";

export default function Home() {
    const {logout} = useAuth();
    const navigation = useNavigate();
    const logOutHandler = () => {
        logout();
        navigation('/');
    }
    return (
        <div className='home-container'>
            <div className='home-header'>
                <h1 className='home-heading'>Yoga Correct Position Helper</h1>
                <div>
                    <Link to='/userData'>
                        <button
                            className="btn btn-secondary"
                            id="about-btn"
                        >
                            UserData
                        </button>
                    </Link>
                    <button
                        className="btn btn-secondary"
                        id="about-btn"
                        onClick={logOutHandler}
                    >
                        LogOut
                    </button>
                </div>
            </div>

            <h1 className="description">A Yoga AI Helper</h1>
            <div className="home-main">
                <div className="btn-section">
                    <Link to='/start'>
                        <button
                            className="btn start-btn"
                        >Let's Start
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
