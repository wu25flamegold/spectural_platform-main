import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Button, Typography, Grid } from '@material-ui/core';
import { Player } from '@lottiefiles/react-lottie-player';
import { motion } from 'framer-motion';
import MainCard from './../../../ui-component/cards/MainCard';
import backgroundAnimation from './../../../assets/lottie/Animation0.json';
import circlebackground from './../../../assets/images/circle-background.png';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import OndemandVideoIcon from '@material-ui/icons/OndemandVideo'; // ⭐ 加播放小icon
import { IconApiApp } from '@tabler/icons';
import { Modal } from '@material-ui/core';

const NotLoginCard = ({ isLoading }) => {
    const history = useHistory();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = useState(false);

    const particlesInit = useCallback(async (engine) => {
        await loadFull(engine);
    }, []);

    const handleLogin = () => {
        history.push('/login');
    };

    return (
        <MainCard style={{
            marginBottom: isMobile ? '0px' : '-10px',
            background: `
            radial-gradient(ellipse at top left, rgba(146, 163, 238, 0.25) 0%, transparent 40%),
            radial-gradient(ellipse at top right, rgba(255,255,255,0.15) 0%, transparent 30%),
            radial-gradient(ellipse at bottom right, rgba(152, 203, 245, 0.2) 0%, transparent 40%),
            linear-gradient(135deg, #0D47A1 0%, #1976D2 70%, rgb(66, 138, 245) 100%)
            `,
            boxShadow: 'none',
            borderColor: 'transparent',
            borderRadius: '20px',
            padding: '18px 12px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <Grid container alignItems="center" spacing={2}>
                {/* 動畫區 */}
                <Grid item xs={12} sm={5} md={4}>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
                            {/* 背景圖片 */}
                            <img 
                                src={circlebackground} 
                                alt="background" 
                                style={{
                                    position: 'absolute',
                                    top: '0%',
                                    left: '31%',
                                    width: '92%',
                                    height: '100%',
                                    transform: 'translate(-30%, 0%) scale(1.2)',
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

                {/* 文字 + 按鈕區 */}
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
                            px={3}
                        >
                            <Typography
                                variant="h3"
                                style={{
                                    fontWeight: 500,
                                    marginBottom: 8,
                                    color: '#FFFFFF'
                                }}
                            >
                                Explore your brainwaves with HHSA
                            </Typography>

                            <Typography
                                variant="body2"
                                style={{
                                    color: '#fff',
                                    fontSize: '1rem',
                                    marginBottom: '12px'
                                }}
                            >
                                Only one step: Sign in and click{' '}
                                <Box component="span" display="inline-flex" style={{ verticalAlign: 'middle' }}  alignItems="center">
                                    <IconApiApp size={16} strokeWidth={2.2} style={{ marginRight: '0px', verticalAlign: 'middle' , marginBottom:'3px' , marginLeft:'1px'}} />
                                </Box>{' '}
                                <Box component="span" sx={{ fontWeight: 450 }}>
                                    Analyze EEG File
                                </Box>{' '} to upload your EEG.
                            </Typography>

                            <Box
                                display="flex"
                                flexDirection={isMobile ? 'column' : 'row'}
                                gap={isMobile ? '10px' : '12px'}
                                mb={2}
                                >
                                <Button
                                    variant="contained"
                                    onClick={handleLogin}
                                    size="medium"
                                    style={{
                                    backgroundColor: '#0058bc',
                                    color: '#ffffff',
                                    fontWeight: 500,
                                    fontSize: '1rem',
                                    padding: '6px 20px',
                                    borderRadius: '12px',
                                    transition: 'all 0.3s ease'
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

                                <Button
                                    variant="contained"
                                    onClick={() => window.open(
                                        'https://docs.google.com/forms/d/e/1FAIpQLScIpheg36UVkEw9nRU__cTLikHDF4fyU0BRf57bzBTZbNW6Jg/viewform',
                                        '_blank'
                                      )}
                                    size="medium"
                                    style={{
                                    backgroundColor: '#0058bc',
                                    color: '#ffffff',
                                    fontWeight: 500,
                                    fontSize: '1rem',
                                    padding: '6px 20px',
                                    borderRadius: '12px',
                                    transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#014797';
                                    }}
                                    onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#0058bc';
                                    }}
                                >
                                    Take Survey
                                </Button>
                                </Box>

                            {/* Watch tutorial 區塊 */}
                            <Box
                                display="flex"
                                alignItems="center"
                                style={{
                                    color: '#c1cce3',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => setOpen(true)} // ✅ 開啟 Modal
                                onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                                >
                                <OndemandVideoIcon style={{ fontSize: '1rem', marginRight: '6px' }} />
                                Watch tutorial
                            </Box>


                        </Box>
                    </motion.div>
                </Grid>
            </Grid>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                <Box
                    bgcolor="background.paper"
                    p={2}
                    style={{
                    width: '80%',
                    maxWidth: '800px',
                    outline: 'none',
                    borderRadius: '8px',
                    }}
                >
                    <video controls autoPlay style={{ width: '100%' }}>
                    <source src="/video/new_guide.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                    </video>
                </Box>
            </Modal>

        </MainCard>
    );
};

NotLoginCard.propTypes = {
    isLoading: PropTypes.bool
};

export default NotLoginCard;
