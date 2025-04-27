import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// material-ui
import { Grid } from '@material-ui/core';

// project imports
import EarningCard from './EarningCard';
import PopularCard from './PopularCard';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import TotalIncomeDarkCard from './TotalIncomeDarkCard';
import TotalIncomeLightCard from './TotalIncomeLightCard';
import NotLoginCard from './NotLoginCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
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
                                <Grid item sm={6} xs={6} md={6} lg={6}>
                                <TotalIncomeDarkCard isLoading={isLoading} />
                                </Grid>
                                <Grid item sm={6} xs={6} md={6} lg={6}>
                                <TotalIncomeLightCard isLoading={isLoading} />
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
                        <PopularCard isLoading={isLoading} />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Dashboard;
