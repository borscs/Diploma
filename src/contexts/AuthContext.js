import React, {useContext, useEffect, useState} from "react";
import {auth, db} from "../utils/firebase/firebase";
import {setDoc, doc, getDoc} from "firebase/firestore";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";


const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({children}) {
    const [currentUser, setCurrentUser] = useState({});
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(true);

    const signup = async (user) => {
        createUserWithEmailAndPassword(auth, user.email, user.password)
            .then((userCredential) => {
                // Signed in
                const userSaved = userCredential.user;
                // ...
                const dockRef = setDoc(doc(db, "Users", userSaved.uid), {
                    uid: userSaved.uid,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    weight: user.weight,
                    height: user.height,
                    year: user.year,
                });
                setUserData({
                    uid: userSaved.uid,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    weight: user.weight,
                    height: user.height,
                    year: user.year,
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // ..
            });

    };

    const login = async (email, password) => {
        console.log(password + "   " + email);
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                // ...
            }).catch((error) => {
            const errorMessage = error.message;
            throw new Error(errorMessage);
        });
    };

    const logout = () => {
        return auth.signOut()
    }

    const resetPassword = (email) => {
        return auth.sendPasswordResetEmail(email)
    }

    const updateEmail = (email) => {
        return currentUser.updateEmail(email)
    }

    const updatePassword = (password) => {
        return currentUser.updatePassword(password)
    }

     const getUserData = async () => {
        const docRef = doc(db, "Users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setUserData(docSnap.data());
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
        return userData;
    }

    useEffect(() => {
        auth.onAuthStateChanged(user => {
            setCurrentUser(user);

            setLoading(false)
        });
        getUserData().catch(e => console.log(e));
    }, []);

    const value = {
        currentUser,
        userData,
        login,
        signup,
        logout,
        resetPassword,
        updateEmail,
        updatePassword,
        getUserData
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
