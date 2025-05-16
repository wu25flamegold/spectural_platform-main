import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@material-ui/core';

// project imports
import MainCard from './../../../ui-component/cards/MainCard';
import TotalIncomeCard from './../../../ui-component/cards/Skeleton/TotalIncomeCard';

// assets
import StorefrontTwoToneIcon from '@material-ui/icons/StorefrontTwoTone';


// style constant
const useStyles = makeStyles((theme) => ({
    card: {
        backgroundColor: theme.palette.primary.dark,
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
        '&:after': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: theme.palette.primary[800],
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
            background: theme.palette.primary[800],
            borderRadius: '50%',
            top: '-125px',
            right: '-15px',
            opacity: 0.5,
            [theme.breakpoints.only('xs')]: {
                width: '0px !important',
                top: '0px !important'
            }
        }
    },
    content: {
        padding: '16px !important'
    },
    avatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.largeAvatar,
        backgroundColor: theme.palette.primary[800],
        color: '#fff'
    },
    primary: {
        color: '#fff'
    },
    secondary: {
        color: theme.palette.primary.light,
        marginTop: '5px'
    },
    padding: {
        paddingTop: 0,
        paddingBottom: 0
    }
}));

//-----------------------|| DASHBOARD - TOTAL INCOME LIGHT CARD ||-----------------------//

const TotalIncomeLightCard = ({ isLoading }) => {
    const classes = useStyles();
    const account = useSelector((state) => state.account);
    console.log(account.user);

    return (
        <React.Fragment>
            {isLoading ? (
                <TotalIncomeCard />
            ) : (
                <MainCard className={classes.card} contentClass={classes.content}>
                    <List className={classes.padding}>
                        <ListItem alignItems="center" disableGutters className={classes.padding}>
                            <ListItemAvatar>
                                <Avatar variant="rounded" className={classes.avatar}>
                                    <StorefrontTwoToneIcon fontSize="inherit" />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                sx={{
                                    mt: 0.45,
                                    mb: 0.45,
                                    zIndex: 1
                                }}
                                className={classes.padding}
                                primary={
                                    <Typography variant="h4" className={classes.primary}>
                                        {account.user?.usage}
                                    </Typography>
                                }                                
                                secondary={
                                    <Typography variant="subtitle2" className={classes.secondary}>
                                        Total Usage
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </List>
                </MainCard>
            )}
        </React.Fragment>
    );
};

TotalIncomeLightCard.propTypes = {
    isLoading: PropTypes.bool
};

export default TotalIncomeLightCard;
