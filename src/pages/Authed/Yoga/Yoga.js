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
let poseList = [
    'Tree', 'Chair', 'Cobra', 'Warrior', 'Dog',
    'Shoulderstand', 'Traingle'
]

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
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const [startingTime, setStartingTime] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [poseTime, setPoseTime] = useState(0);
    const [bestPerform, setBestPerform] = useState(0);
    const [calorie, setCalorie] = useState(0);
    const [currentPose, setCurrentPose] = useState('Tree');
    const [isStartPose, setIsStartPose] = useState(false);
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
        if (poseTime > bestPerform) {
            setBestPerform(timeDiff);
        }
    }, [currentTime]);

    useEffect(() => {
        setCurrentTime(0);
        setPoseTime(0);
        setBestPerform(0);
    }, [currentPose])

    const CLASS_NO = {
        Chair: 0,
        Cobra: 1,
        Dog: 2,
        No_Pose: 3,
        Shoulderstand: 4,
        Traingle: 5,
        Tree: 6,
        Warrior: 7,
    }

    function getCenterPoint(landmarks, left_bodypart, right_bodypart) {
        let left = tf.gather(landmarks, left_bodypart, 1);
        let right = tf.gather(landmarks, right_bodypart, 1);
        const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5));
        return center;

    }

    function getPoseSize(landmarks, torso_size_multiplier = 2.5) {
        let hips_center = getCenterPoint(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
        let shoulders_center = getCenterPoint(landmarks, POINTS.LEFT_SHOULDER, POINTS.RIGHT_SHOULDER)
        let torso_size = tf.norm(tf.sub(shoulders_center, hips_center))
        let pose_center_new = getCenterPoint(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
        pose_center_new = tf.expandDims(pose_center_new, 1)

        pose_center_new = tf.broadcastTo(pose_center_new, [1, 17, 2])

        let gather = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0)
        let max_dist = tf.max(tf.norm(gather, 'euclidean', 0))

        let pose_size = tf.maximum(tf.mul(torso_size, torso_size_multiplier), max_dist)
        return pose_size
    }

    function normalizePoseLandmarks(landmarks) {
        let pose_center = getCenterPoint(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
        pose_center = tf.expandDims(pose_center, 1)
        pose_center = tf.broadcastTo(pose_center, [1, 17, 2])
        landmarks = tf.sub(landmarks, pose_center)

        let pose_size = getPoseSize(landmarks)
        landmarks = tf.div(landmarks, pose_size)

        return landmarks
    }

    function landmarksToEmbedding(landmarks) {
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
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4
        ) {
            let notDetected = 0
            const video = webcamRef.current.video
            const pose = await detector.estimatePoses(video)
            const context = canvasRef.current.getContext('2d');

            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            try {
                const keypoints = pose[0].keypoints
                let input = keypoints.map((keypoint) => {
                    if (keypoint.score > 0.4) {
                        if (!(keypoint.name === 'left_eye' || keypoint.name === 'right_eye')) {
                            drawPoint(context, keypoint.x, keypoint.y, 8, 'rgb(255,255,255)')
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
                    const classNo = CLASS_NO[currentPose]
                    console.log("User pose: " + dataPose[0][classNo])
                    if (dataPose[0][classNo] > 0.97) {
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

    async function sentData() {
        await updateDoc(doc(db, "Users", currentUser.uid.toString()), {
            data: [...userData.data, {
                time: poseTime,
                best: bestPerform,
                cal: calorie,
                pose: currentPose
            }]
        })
    }

    function startYoga() {
        setIsStartPose(true);
        runMoveNet().catch(e => {
        });
    }

    function stopPose() {
        sentData().then((e) => {
        });
        setIsStartPose(false);
        clearInterval(interval);
    }

    const setCurrentPOseHandler = (pose) => {
        setCurrentPose(pose);
    }

    if (isStartPose) {
        return (
            <div className="yoga-container">
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
                            ref={webcamRef}
                            style={{
                                position: 'absolute',
                                right: 120,
                                top: 250,
                                padding: '0px',
                            }}
                        />
                        <canvas
                            ref={canvasRef}
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
                        <h4>Best: {bestPerform} s</h4>
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
                    poseList={poseList}
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
