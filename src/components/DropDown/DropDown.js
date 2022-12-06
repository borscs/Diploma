import React from 'react'

import {poseImages} from '../../utils/pose_images'

import './DropDown.css'
import Grid from "@mui/material/Grid";
import GridItem from "./GridItem";

const DropDown =(props)  =>{
    const setCurrentPoseHandler = (pose) => {
      props.setCurrentPose(pose);
    }
    return (
        <Grid container justifyContent="center" spacing={10}>
            {props.poseList.map((pose) => (
               <GridItem pose={pose} setCurrentPoseHandler={setCurrentPoseHandler}/>
            ))}
        </Grid>
    )
};

export default DropDown;
