// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
    apiKey: "AIzaSyAtlAO5XTns7-Dmy41jncYF4UB7vSf59WI",
    authDomain: "pannon-diploma-msc.firebaseapp.com",
    projectId: "pannon-diploma-msc",
    storageBucket: "pannon-diploma-msc.appspot.com",
    messagingSenderId: "476696576032",
    appId: "1:476696576032:web:f66e17c905fc1af1a1bc45",
    measurementId: "G-CXRW1SJXME"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const  auth = getAuth();
export const db = getFirestore(app);



