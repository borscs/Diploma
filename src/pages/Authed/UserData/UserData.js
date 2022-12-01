import * as React from 'react';
import Box from '@mui/material/Box';
import {DataGrid} from '@mui/x-data-grid';
import {Link} from "react-router-dom";
import {useAuth} from "../../../contexts/AuthContext";
import {useEffect, useState} from "react";
import {doc, getDoc} from "firebase/firestore";
import {db} from "../../../utils/firebase/firebase";

const columns = [
    {field: 'id', headerName: 'ID', width: 90},
    {
        field: 'pose',
        headerName: 'Pose',
        width: 150,
        editable: true,
    },
    {
        field: 'time',
        headerName: 'Time',
        width: 150,
        editable: true,
    },
    {
        field: 'best',
        headerName: 'Best',
        width: 150,
        editable: true,
    },
    {
        field: 'cal',
        headerName: 'Calorie',
        width: 150,
        editable: true,
    },
];

const rows = [
    {id: 15, pose: 'Tree', time: 25, best: 35, cal: 0},
    {id: 22, pose: 'Chair', time: 12, best: 42, cal: 0},
    {id: 33, pose: 'Cobra', time: 30, best: 45, cal: 0},
];

export default function UserData() {
    const {currentUser} = useAuth;
    const [userData, setUserData] = useState();

    useEffect(async () => {
        const docRef = doc(db, "Users", currentUser.uid.toString());
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setUserData(docSnap.data());

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }

    }, []);

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
            <Box sx={{height: 400, width: '100%'}}>
                <DataGrid
                    color="white"
                    sx={{
                        color: 'white'
                    }}
                    rows={rows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    checkboxSelection
                    disableSelectionOnClick
                    experimentalFeatures={{newEditingApi: true}}
                />
            </Box>
        </div>
    );
}
