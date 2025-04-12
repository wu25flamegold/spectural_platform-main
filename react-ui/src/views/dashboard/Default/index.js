import React, { useEffect, useState } from 'react';

// material-ui
import { Grid } from '@material-ui/core';

// project imports
import EarningCard from './EarningCard';
import PopularCard from './PopularCard';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import TotalIncomeDarkCard from './TotalIncomeDarkCard';
import TotalIncomeLightCard from './TotalIncomeLightCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import { gridSpacing } from './../../../store/constant';

//-----------------------|| DEFAULT DASHBOARD ||-----------------------//

const Dashboard = () => {
    const [isLoading, setLoading] = useState(true);
    const hhsaDescription = `
        Hilbert-Huang Spectral Analysis (HHSA) 是一種用於非線性和非穩態信號處理的技術。
        它結合了經驗模態分解（EMD）和希爾伯特變換，以提取瞬時頻率和瞬時能量，
        從而提供信號的精細頻譜資訊。HHSA 對於生物醫學數據處理特別有用，
        尤其在分析大腦波動和診斷腦部疾病方面表現出色。
    `;

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    {/* <Grid item lg={6} md={12} sm={6} xs={12}>
                        <EarningCard isLoading={isLoading} />
                    </Grid>
                    <Grid item lg={6} md={12} sm={6} xs={12}>
                        <TotalOrderLineChartCard isLoading={isLoading} />
                    </Grid> */}
                    
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                        <Grid container spacing={gridSpacing}>
                            <Grid item sm={6} xs={6} md={6} lg={6}>
                                <TotalIncomeDarkCard isLoading={isLoading} />
                            </Grid>
                            <Grid item sm={6} xs={6} md={6} lg={6}>
                                <TotalIncomeLightCard isLoading={isLoading} />
                            </Grid>
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
