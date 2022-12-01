import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {useState} from "react";
import Login from "../../components/Auth/Login";
import SingUp from "../../components/Auth/SingUp";



const theme = createTheme();


const NotRegisterUser = () => {
    const [loginPage, setLoginPage] = useState(true);


    return (
        <ThemeProvider theme={theme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: 'url(https://mobidev.biz/wp-content/uploads/2020/07/2400-human-pose-estimation-ai-fitness-1920x1080.jpg)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        {loginPage && <Login setLoginPage={setLoginPage}/>}
                        {!loginPage && <SingUp setLoginPage={setLoginPage}/>}
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}

export default NotRegisterUser;
