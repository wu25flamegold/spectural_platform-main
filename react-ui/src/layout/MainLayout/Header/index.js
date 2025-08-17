import PropTypes from 'prop-types';
import React from 'react';
import LogoSection from '../LogoSection';
import ProfileSection from './ProfileSection';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Avatar, Box, ButtonBase } from '@material-ui/core';

// assets
import { IconMenu2 } from '@tabler/icons';

// style constant
const useStyles = makeStyles((theme) => ({
    grow: {
        flexGrow: 1
    },
    headerAvatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        transition: 'all .2s ease-in-out',
        background: theme.palette.secondary.light,
        color: theme.palette.secondary.dark,
        '&:hover': {
            background: theme.palette.secondary.dark,
            color: theme.palette.secondary.light
        }
    },
    boxContainer: {
        width: '228px',
        display: 'flex',
        [theme.breakpoints.down('md')]: {
            width: 'auto'
        }
    }
}));

//-----------------------|| MAIN NAVBAR / HEADER ||-----------------------//

const Header = ({ handleLeftDrawerToggle }) => {
    const classes = useStyles();

    return (
        <React.Fragment>
            {/* logo & toggler button */}
            <div className={classes.boxContainer}>
                <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <Avatar variant="rounded" className={classes.headerAvatar} onClick={handleLeftDrawerToggle} color="inherit">
                        <IconMenu2 stroke={1.5} size="1.3rem" />
                    </Avatar>
                </ButtonBase>
                <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 , ml: 20}}>
                    <LogoSection />
                </Box>
            </div>
            <div className={classes.grow} />
            <ProfileSection />
        </React.Fragment>
    );
};

Header.propTypes = {
    handleLeftDrawerToggle: PropTypes.func
};

export default Header;
