import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// material-ui
import { Grid } from '@material-ui/core';

// project imports
import IntroCard from './IntroCard';
import WatchVideoCard from './WatchVideoCard';
import RoleCard from './RoleCard';
import TotalUsageCard from './TotalUsageCard';
import NotLoginCard from './NotLoginCard';
import { gridSpacing } from './../../../store/constant';

//-----------------------|| DEFAULT DASHBOARD ||-----------------------//

const Dashboard = () => {
    const [isLoading, setLoading] = useState(true);
    const account = useSelector((state) => state.account);
    const { isLoggedIn } = account;

    useEffect(() => {
        setLoading(false);
        console.log(account);
    }, []);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                        <Grid container spacing={gridSpacing}>
                            {isLoggedIn ? (
                            <>
                                <Grid item sm={12} xs={12} md={4} lg={4}>
                                    <RoleCard isLoading={isLoading} />
                                </Grid>
                                <Grid item sm={12} xs={12} md={4} lg={4}>
                                    <TotalUsageCard isLoading={isLoading} />
                                </Grid>
                                <Grid item sm={12} xs={12} md={4} lg={4}>
                                    <WatchVideoCard isLoading={isLoading} />
                                </Grid>
                            </>
                            ) : (
                            <Grid item sm={12} xs={12} md={12} lg={12}>
                                <NotLoginCard isLoading={isLoading} />
                            </Grid>
                            )}
                        </Grid>
                    </Grid>


                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} md={12}>
                        <IntroCard isLoading={isLoading} />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Dashboard;
