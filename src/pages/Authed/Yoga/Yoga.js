import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import React, {useRef, useState, useEffect, Fragment} from 'react'
import Webcam from 'react-webcam'
import {count} from '../../../utils/music';
import {useAuth} from "../../../contexts/AuthContext";
import Instructions from '../../../components/Instrctions/Instructions';

import './Yoga.css'

import ListPose from '../../../components/DropDown/DropDown';
import {poseImages} from '../../../utils/pose_images';
import {POINTS, keypointConnections} from '../../../utils/data';
import {drawPoint, drawSegment} from '../../../utils/helper'
import {Link} from "react-router-dom";
import {getDoc, doc, updateDoc} from 'firebase/firestore'
import {db} from "../../../utils/firebase/firebase";
import Grid from "@mui/material/Grid";


let skeletonColor = 'rgb(255,255,255)'

const POSELIST = [
    'Tree', 'Chair', 'Cobra', 'Warrior', 'Dog',
    'Shoulderstand', 'Traingle'
]

const POSES = {
    Chair: 0,
    Cobra: 1,
    Dog: 2,
    No_Pose: 3,
    Shoulderstand: 4,
    Traingle: 5,
    Tree: 6,
    Warrior: 7,
}

let interval;
let flag = false;

const YogaHeader = () => {
    return (
        <div className='home-header'>
            <h1 className='home-heading'>Yoga Correct Position Helper</h1>
            <div>
                <Link to='/UserData'>
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
    )
};

const Yoga = () => {
    const webcam = useRef(null);
    const canvas = useRef(null);

    const [startingTime, setStartingTime] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [poseTime, setPoseTime] = useState(0);
    const [bestTime, setBestTime] = useState(0);
    const [calorie, setCalorie] = useState(0);
    const [currentPose, setCurrentPose] = useState('Tree');
    const [startPose, setStartPose] = useState(false);
    const [userData, setUserData] = useState('');
    const {currentUser} = useAuth();

    let cal = ((2.5 * 0.999619048 * 3.5) / 200) / userData.height;

    useEffect(async () => {
        const docRef = doc(db, "Users", currentUser.uid.toString());
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setUserData(docSnap.data());
            console.log(docSnap.data());
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }

    }, []);

    useEffect(() => {
        const timeDiff = (currentTime - startingTime) / 1000;
        if (flag) {
            setPoseTime(timeDiff);
            if (poseTime !== 0 || !isNaN) {
                setCalorie(calorie + cal * userData.weight);
                console.log("caloria egetes: " + calorie);
            }

        }
        if (bestTime < poseTime) {
            setBestTime(timeDiff);
        }
    }, [currentTime]);

    useEffect(() => {
        setCurrentTime(0);
        setPoseTime(0);
        setBestTime(0);
    }, [currentPose])

    const  getCenterPoint = (landmarks, left_bodypart, right_bodypart) => {
        const left = tf.gather(landmarks, left_bodypart, 1);
        const right = tf.gather(landmarks, right_bodypart, 1);
        const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5));

        return center;

    }

    const  getPoseSize = (landmarks, torso_size_multiplier = 2.5) => {
        const hipsCenter = getCenterPoint(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
        const shouldersCenter = getCenterPoint(landmarks, POINTS.LEFT_SHOULDER, POINTS.RIGHT_SHOULDER)
        const torsoSize = tf.norm(tf.sub(shouldersCenter, hipsCenter))

        let poseCenterNew = getCenterPoint(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
        poseCenterNew = tf.expandDims(poseCenterNew, 1)
        poseCenterNew = tf.broadcastTo(poseCenterNew, [1, 17, 2])

        const gather = tf.gather(tf.sub(landmarks, poseCenterNew), 0, 0)
        const maxDist = tf.max(tf.norm(gather, 'euclidean', 0))
        const poseSize = tf.maximum(tf.mul(torsoSize, torso_size_multiplier), maxDist)

        return poseSize
    }

    const normalizePoseLandmarks = (landmarks) => {
        let poseCenter = getCenterPoint(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
        poseCenter = tf.expandDims(poseCenter, 1)
        poseCenter = tf.broadcastTo(poseCenter, [1, 17, 2])
        landmarks = tf.sub(landmarks, poseCenter)

        let poseSize = getPoseSize(landmarks)
        landmarks = tf.div(landmarks, poseSize)

        return landmarks
    }

    const landmarksToEmbedding = (landmarks) => {
        landmarks = normalizePoseLandmarks(tf.expandDims(landmarks, 0))
        let embedding = tf.reshape(landmarks, [1, 34])

        return embedding
    }

    const runMoveNet = async () => {
        const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER};
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
        const poseClassifier = await tf.loadLayersModel('https://models.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json');
        const countAudio = new Audio(count);
        countAudio.loop = true;
        interval = setInterval(() => {
            detectPose(detector, poseClassifier, countAudio)
        }, 100);
    }

    const detectPose = async (detector, poseClassifier, countAudio) => {
        if (
            typeof webcam.current !== "undefined" &&
            webcam.current !== null &&
            webcam.current.video.readyState === 4
        ) {
            let notDetected = 0

            const pose = await detector.estimatePoses( webcam.current.video)
            const context = canvas.current.getContext('2d');

            context.clearRect(0, 0, canvas.current.width, canvas.current.height);
            try {
                const keypoints = pose[0].keypoints
                let input = keypoints.map((keypoint) => {
                    if (keypoint.score > 0.5) {
                        if (!(keypoint.name === 'left_eye' || keypoint.name === 'right_eye')) {
                            drawPoint(context, keypoint.x, keypoint.y, 8, skeletonColor)
                            let connections = keypointConnections[keypoint.name]
                            try {
                                connections.forEach((connection) => {
                                    let conName = connection.toUpperCase()
                                    drawSegment(context, [keypoint.x, keypoint.y],
                                        [keypoints[POINTS[conName]].x,
                                            keypoints[POINTS[conName]].y]
                                        , skeletonColor)
                                })
                            } catch (error) {
                            }
                        }
                    } else {
                        notDetected += 1
                    }
                    return [keypoint.x, keypoint.y]
                })
                if (notDetected > 4) {
                    skeletonColor = 'rgb(255,255,255)'
                    return
                }
                const processedInput = landmarksToEmbedding(input)
                const classification = poseClassifier.predict(processedInput)

                classification.array().then((dataPose) => {
                    const poses = POSES[currentPose]
                    if (dataPose[0][poses] > 0.97) {
                        if (!flag) {
                            countAudio.play()
                            setStartingTime(new Date(Date()).getTime())
                            flag = true
                        }
                        setCurrentTime(new Date(Date()).getTime())
                        skeletonColor = 'rgb(0,255,0)'
                    } else {
                        flag = false
                        skeletonColor = 'rgb(255,255,255)'
                        countAudio.pause()
                        countAudio.currentTime = 0
                    }
                });
            } catch (err) {
            }
        }
    }

     const  sentData = async() =>{
        await updateDoc(doc(db, "Users", currentUser.uid.toString()), {
            data: [...userData.data, {
                time: poseTime,
                best: bestTime,
                cal: calorie,
                pose: currentPose
            }]
        })
    }

    const startYoga = () =>{
        setStartPose(true);
        runMoveNet().catch(e => {
        });
    }

    const stopPose = () => {
        setStartPose(false);
        sentData().then((e) => {
        });
        clearInterval(interval);
    }

    const setCurrentPOseHandler = (pose) => {
        setCurrentPose(pose);
    }

    if (startPose) {
        return (
            <div className="yoga-container">
                <YogaHeader/>
                <Grid container>
                    <Grid item>
                        <img
                            src={poseImages[currentPose]}
                            className="pose-img"
                        />
                    </Grid>
                    <Grid item>
                        <Webcam
                            width='640px'
                            height='480px'
                            id="webcam"
                            ref={webcam}
                            style={{
                                position: 'absolute',
                                right: 120,
                                top: 250,
                                padding: '0px',
                            }}
                        />
                        <canvas
                            ref={canvas}
                            id="my-canvas"
                            width='640px'
                            height='480px'
                            style={{
                                position: 'absolute',
                                right: 120,
                                top: 250,
                                zIndex: 1
                            }}
                        >
                        </canvas>
                    </Grid>
                </Grid>
                <div className="performance-container">
                    <div className="pose-performance">
                        <h4>Pose Time: {poseTime} s</h4>
                    </div>
                    <div className="pose-performance">
                        <h4>Best: {bestTime} s</h4>
                    </div>
                    <div className="pose-performance">
                        {!isNaN(calorie) && <h4>Calorie burned: {calorie.toFixed(4)} cal</h4>}
                    </div>
                </div>

                <button
                    onClick={stopPose}
                    className="secondary-btn"
                >Stop Pose
                </button>
            </div>
        )
    }

    return (
        <div className="yoga-container">
            <YogaHeader/>
            <div
                className="yoga-container"
                style={{marginTop: "5%"}}
            >
                <ListPose
                    poseList={POSELIST}
                    currentPose={currentPose}
                    setCurrentPose={setCurrentPOseHandler}
                />
                <Instructions
                    currentPose={currentPose}
                />
                <button
                    onClick={startYoga}
                    className="secondary-btn"
                >Start Pose
                </button>
            </div>
        </div>
    );
};

export default Yoga;
