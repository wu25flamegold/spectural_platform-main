import React from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Button, Card, CardContent, Grid, Link, Stack, Typography } from '@material-ui/core';

// project imports
import AnimateButton from './../../../../ui-component/extended/AnimateButton';

// style constant
const useStyles = makeStyles((theme) => ({
    card: {
        background: '#e0f7fa',
        marginTop: '12px',
        marginBottom: '12px',
        overflow: 'hidden',
        position: 'relative',
        height:'18%',
        '&:after': {
            content: '""',
            position: 'absolute',
            width: '200px',
            height: '200px',
            border: '19px solid ',
            borderColor: '#bbeff5',
            borderRadius: '50%',
            top: '45px',
            right: '-150px'
        },
        '&:before': {
            content: '""',
            position: 'absolute',
            width: '200px',
            height: '200px',
            border: '3px solid ',
            borderColor: '#bbeff5',
            borderRadius: '50%',
            top: '145px',
            right: '-70px'
        }
    },
    tagLine: {
        color: theme.palette.grey[700],
        opacity: 0.6
    },
    button: {
        color: theme.palette.grey[800],
        backgroundColor: '#b8ecf2',
        textTransform: 'capitalize',
        boxShadow: 'none',
        '&:hover': {
            backgroundColor:'#91d8e1'
        }
    }
}));

//-----------------------|| PROFILE MENU - UPGRADE PLAN CARD ||-----------------------//

const UpgradePlanCard = () => {
    const classes = useStyles();

    return (
        <Card className={classes.card}>
            <CardContent>
                <Grid container direction="column" spacing={2}>
                    <Grid item>
                        <Typography sx={{fontSize:'0.8rem', fontWeight:'500', marginTop:'-4px'}}>
                            Consult NYCU KY Lab if required.
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Stack direction="row">
                            <AnimateButton>
                                <Button
                                    component={Link}
                                    href="https://ibs.nycu.edu.tw/Home.html"
                                    target="_blank"
                                    variant="h6"
                                    className={classes.button}
                                    sx={{fontSize:'0.8rem', fontWeight:'500', marginTop:'-3px'}}
                                >
                                    Contact Us
                                </Button>
                            </AnimateButton>
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default UpgradePlanCard;
