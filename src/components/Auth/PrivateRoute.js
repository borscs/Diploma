import React from "react"
import { Route, Navigate } from "react-router-dom"
import {getAuth}from "firebase/auth";
import {useAuth} from "../../contexts/AuthContext";

export default function PrivateRoute({ children }) {

  const { currentUser } = useAuth()
  // const history = useNavigate()

  return currentUser ? children : <Navigate to="/" />;
}
