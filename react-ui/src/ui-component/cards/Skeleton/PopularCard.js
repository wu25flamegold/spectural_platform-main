import React from 'react';
// material-ui
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Skeleton, Typography  } from '@material-ui/core';

// project imports
import { gridSpacing } from './../../../store/constant';

// style constant
const useStyles = makeStyles({
    cardAction: {
        padding: '10px',
        display: 'flex',
        paddingTop: 0,
        justifyContent: 'center'
    }
});

//-----------------------|| SKELETON - POPULAR CARD ||-----------------------//

const PopularCard = () => {
    const classes = useStyles();

    const hhsaDescription = `
        Hilbert-Huang Spectral Analysis (HHSA) 是一種用於非線性和非穩態信號處理的技術。
        它結合了經驗模態分解（EMD）和希爾伯特變換，以提取瞬時頻率和瞬時能量，
        從而提供信號的精細頻譜資訊。HHSA 對於生物醫學數據處理特別有用，
        尤其在分析大腦波動和診斷腦部疾病方面表現出色。
    `;
    return (
        <Card>
            <CardContent>
                <Typography variant="body1">
                    {hhsaDescription}
                </Typography>
            </CardContent>
            <CardContent className={classes.cardAction}>
                <Typography variant="caption">
                    {/* Additional content or action button can go here */}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default PopularCard;
