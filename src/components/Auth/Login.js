import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import * as React from "react";
import Copyright from "../CopyRight/Copyright";

import {useAuth} from "../../contexts/AuthContext";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";



const Login = (props) => {
    const { currentUser, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate("/home");
        }
    }, [currentUser, navigate]);

    const LoginPageHandler = () => {
        props.setLoginPage(false);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        try {
            await login(data.get('email'), data.get('password'));
            navigate("/home");
        } catch {
            console.log("Failed to login");
        }
    };

    return (
    <React.Fragment>
    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
    </Avatar>
    <Typography component="h1" variant="h5">
        Sign in
    </Typography>
    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
        <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
        />
        <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
        />
        <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
        />
        <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
        >
            Sign In
        </Button>
        <Grid container>
            <Grid item xs>
                <Link href="#" variant="body2">
                    Forgot password?
                </Link>
            </Grid>
            <Grid item>
                <Link onClick={LoginPageHandler} variant="body2">
                    {"Don't have an account? Sign Up"}
                </Link>
            </Grid>
        </Grid>
        <Copyright sx={{ mt: 5 }} />
    </Box>
        </React.Fragment>
    );
};

export default Login;
