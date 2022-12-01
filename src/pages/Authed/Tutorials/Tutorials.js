import React from 'react'

import './Tutorials.css'

import {tutorials, fixCamera} from '../../../utils/data'
import {Link} from "react-router-dom";

export default function Tutorials() {
    return (
        <div className="yoga-container">
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
                    <Link to='/home'>
                        <button
                            className="btn btn-secondary"
                            id="about-btn"
                        >
                            Home
                        </button>
                    </Link>
                </div>
            </div>
            <div className="tutorials-container">
                <h1 className="tutorials-heading">Basic Tutorials</h1>
                <div className="tutorials-content-container">
                    {tutorials.map((tutorial) => (
                        <p className="tutorials-content">{tutorial}</p>
                    ))}
                </div>
                <h1 className="tutorials-heading">Camera Not Working?</h1>
                <div className="tutorials-content-container">
                    {fixCamera.map((points) => (
                        <p className="tutorials-content">{points}</p>
                    ))}
                </div>
            </div>
        </div>
    )
}
