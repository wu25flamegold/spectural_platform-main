import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react'; // ⭐ 加 useState
import { useSelector } from 'react-redux';
// material-ui
import { makeStyles } from '@material-ui/styles';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Typography, Modal, Box } from '@material-ui/core'; // ⭐ 加 Modal, Box
import OndemandVideoIcon from '@material-ui/icons/OndemandVideo'; // 播放小icon

// project imports
import MainCard from './../../../ui-component/cards/MainCard';
import TotalIncomeCard from './../../../ui-component/cards/Skeleton/TotalIncomeCard';

// assets
import BadgeOutlined from '@material-ui/icons/BadgeOutlined';

// style constant
const useStyles = makeStyles((theme) => ({
    card: {
        backgroundColor: '#2494f7',
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
        '&:after': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: '#1565c0',
            borderRadius: '50%',
            top: '-85px',
            right: '-95px',
            [theme.breakpoints.only('xs')]: {
                width: '0px !important',
                top: '0px !important'
            }
        },
        '&:before': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: '#1565c0',
            borderRadius: '50%',
            top: '-125px',
            right: '-15px',
            opacity: 0.5,
            [theme.breakpoints.down('xs')]: {
                width: '0px',
                top: '0px',
            }
        }
    },
    content: {
        padding: '16px !important'
    },
    avatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.largeAvatar,
        backgroundColor: '#1565c0',
        color: '#fff'
    },
    primary: {
        color: '#fff'
    },
    secondary: {
        color: '#e3effd',
        marginTop: '5px'
    },
    padding: {
        paddingTop: 0,
        paddingBottom: 0
    }
}));

//-----------------------|| DASHBOARD - TOTAL INCOME DARK CARD ||-----------------------//

const WatchVideoCard = ({ isLoading }) => {
    const classes = useStyles();
    const account = useSelector((state) => state.account);

    const [open, setOpen] = useState(false); // ⭐ 控制 Modal 開關
    const videoRef = useRef(null); // ⭐ 新增：建立 video 的 ref

    const handleOpen = () => {
        setOpen(true);

        // ⭐ 每次打開 Modal，讓影片從頭播放
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.currentTime = 0; // 撥回0秒
                videoRef.current.play(); // 播放
            }
        }, 100); // 小延遲，等 Modal 打開
    };
    const handleClose = () => setOpen(false);

    return (
        <React.Fragment>
            {isLoading ? (
                <TotalIncomeCard />
            ) : (
                <>
                    <MainCard border={false} className={classes.card} contentClass={classes.content}>
                        <List className={classes.padding}>
                            <ListItem alignItems="center" disableGutters className={classes.padding}>
                                <ListItemAvatar>
                                    <Avatar variant="rounded" className={classes.avatar}>
                                        <OndemandVideoIcon fontSize="inherit" />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    className={classes.padding}
                                    sx={{
                                        mt: 0.45,
                                        mb: 0.45,
                                        zIndex: 1
                                    }}
                                    primary={
                                        <Typography 
                                            variant="h4" 
                                            style={{ cursor: 'pointer' }}
                                            onClick={handleOpen} // ⭐ 改成開 Modal
                                            className={classes.primary}
                                        >
                                            Watch Tutorial
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="subtitle2" className={classes.secondary}>
                                            User Guide
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        </List>
                    </MainCard>

                    {/* ⭐ Modal 播影片 */}
                    <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="video-modal-title"
                        aria-describedby="video-modal-description"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Box
                            bgcolor="background.paper"
                            p={2}
                            style={{
                                width: '80%',
                                maxWidth: '800px',
                                outline: 'none'
                            }}
                        >
                            <video
                                width="100%"
                                height="auto"
                                controls
                                autoPlay
                            >
                                <source src="/video/new_guide.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </Box>
                    </Modal>
                </>
            )}
        </React.Fragment>
    );
};

WatchVideoCard.propTypes = {
    isLoading: PropTypes.bool
};

export default WatchVideoCard;
