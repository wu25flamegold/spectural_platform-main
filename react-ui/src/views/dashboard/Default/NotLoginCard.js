import PropTypes from 'prop-types';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Button, Typography, Grid } from '@material-ui/core';
import { Player } from '@lottiefiles/react-lottie-player';
import { motion } from 'framer-motion';
import MainCard from './../../../ui-component/cards/MainCard';
import backgroundAnimation from './../../../assets/lottie/Animation0.json';
import circlebackground from './../../../assets/images/circle-background.png';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const NotLoginCard = ({ isLoading }) => {
    const history = useHistory();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


    const handleLogin = () => {
        history.push('/login');
    };

    return (
        <MainCard style={{
            marginBottom: isMobile ? '0px' : '-18px',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            borderColor: 'transparent',
          }}>
            <Grid container alignItems="center" spacing={2}>
                {/* 動畫區 */}
                {/* 動畫區 */}
                <Grid item xs={12} sm={5} md={4}>
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* 包一個外層 */}
                    <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
                    
                    {/* 背景圖片 */}
                    <img 
                        src={circlebackground} 
                        alt="background" 
                        style={{
                        position: 'absolute',
                        top: '0%',
                        left: '28%',
                        width: '100%',    // 👉 圖片整體放大，原本是120%，現在改200%
                        height: '100%',
                        transform: 'translate(-30%, 0%)', // 👉 水平垂直都居中
                        zIndex: 1
                        }}
                    />

                    {/* 前景動畫 */}
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <Player
                        autoplay
                        loop
                        src={backgroundAnimation}
                        style={{ width: '90%', height: '90%' }}
                        />
                    </div>

                    </div>
                </motion.div>
                </Grid>


                {/* 文字 + 按鈕 */}
                <Grid item xs={12} sm={7} md={8}>
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    justifyContent="center"
                    height="100%"
                    px={2}
                    >
                    <Typography
                        variant="h3" // <-- 字體大一階
                        style={{
                        fontWeight: 500,
                        marginBottom: 12,
                        color: '#013d8b' // 深藍色一點點（清楚層次）
                        }}
                    >
                        Explore your brainwaves with HHSA
                    </Typography>

                    <Typography
                        variant="h4" // <-- body1 換成 h6，看起來更飽滿
                        color="textSecondary"
                        style={{ marginBottom: 20, fontWeight: 400, color: '#506186' }}
                    >
                        Your journey with HHSA starts here. Please sign in to continue.
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={handleLogin}
                        size="medium"
                        style={{
                            backgroundColor: '#0058bc',
                            color: '#ffffff',
                            fontWeight: 500,
                            fontSize: '1rem',
                            padding: '6px 24px',
                            borderRadius: '12px',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#014797';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#0058bc';
                        }}
                        >
                        Sign In to Analyze
                        </Button>


                    </Box>
                </motion.div>
                </Grid>

            </Grid>
        </MainCard>
    );
};

NotLoginCard.propTypes = {
    isLoading: PropTypes.bool
};

export default NotLoginCard;
