import React from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { ButtonBase } from '@material-ui/core';

// project imports
import config from './../../../config';
import Logo from './../../../ui-component/Logo';

//-----------------------|| MAIN LOGO ||-----------------------//

const LogoSection = () => {
    const handleClick = () => {
        window.location.href = '/dashboard/default';
    };
    return (
        <ButtonBase disableRipple onClick={handleClick}>
            <Logo />
        </ButtonBase>
    );
};

export default LogoSection;
