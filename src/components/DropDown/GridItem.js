import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import {poseImages} from "../../utils/pose_images";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import React from "react";

const GirdItem = (props) => {
    const setCurrentPoseHandler = () => {
        props.setCurrentPoseHandler(props.pose);
    }
    return(
        <Grid item  style={{paddingTop: "0%"}} key={props.pose} onClick={setCurrentPoseHandler}>
            <Card sx={{maxWidth: 200}}>
                <CardMedia
                    component="img"
                    sx={{maxHeight: 150}}
                    image={poseImages[props.pose]}
                    alt={props.pose}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {props.pose}
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
    )
};

export default GirdItem;
