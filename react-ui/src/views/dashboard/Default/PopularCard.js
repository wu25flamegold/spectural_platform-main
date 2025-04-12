import PropTypes from 'prop-types';
import React from 'react';
import HHSAIntro from './HHSAIntro';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Avatar, Button, CardActions, CardContent, Divider, Grid, Menu, MenuItem, Typography } from '@material-ui/core';

// project imports
import MainCard from './../../../ui-component/cards/MainCard';
import SkeletonPopularCard from './../../../ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from './../../../store/constant';

// assets
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import MoreHorizOutlinedIcon from '@material-ui/icons/MoreHorizOutlined';
import KeyboardArrowUpOutlinedIcon from '@material-ui/icons/KeyboardArrowUpOutlined';
import KeyboardArrowDownOutlinedIcon from '@material-ui/icons/KeyboardArrowDownOutlined';

// style constant
const useStyles = makeStyles((theme) => ({
    card: {
        overflow: 'hidden',
        position: 'relative',
        '&:after': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: 'linear-gradient(210.04deg, ' + theme.palette.warning.dark + ' -50.94%, rgba(144, 202, 249, 0) 83.49%)',
            borderRadius: '50%',
            top: '-30px',
            right: '-180px'
        },
        '&:before': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: 'linear-gradient(140.9deg, ' + theme.palette.warning.dark + ' -14.02%, rgba(144, 202, 249, 0) 70.50%)',
            borderRadius: '50%',
            top: '-160px',
            right: '-130px'
        }
    },
    cardAction: {
        padding: '10px',
        paddingTop: 0,
        justifyContent: 'center'
    },
    primaryLight: {
        color: theme.palette.primary[200],
        cursor: 'pointer'
    },
    divider: {
        marginTop: '12px',
        marginBottom: '12px'
    },
    avatarSuccess: {
        width: '16px',
        height: '16px',
        borderRadius: '5px',
        backgroundColor: theme.palette.success.light,
        color: theme.palette.success.dark,
        marginLeft: '15px'
    },
    successDark: {
        color: theme.palette.success.dark
    },
    avatarError: {
        width: '16px',
        height: '16px',
        borderRadius: '5px',
        backgroundColor: theme.palette.orange.light,
        color: theme.palette.orange.dark,
        marginLeft: '15px'
    },
    errorDark: {
        color: theme.palette.orange.dark
    }
}));

//-----------------------|| DASHBOARD DEFAULT - POPULAR CARD ||-----------------------//

const PopularCard = ({ isLoading }) => {
    const classes = useStyles();
    const platformDescription0 = `
        隨著神經科學研究逐步揭示大腦神經振盪在感知和認知功能中的關鍵作用，
        對精確且快速的腦波數據分析需求日益增長。
        其中，全息希爾伯特頻譜分析（Holo-Hilbert Spectral Analysis, HHSA）
        是一種強大的非線性信號分析工具，
        有效地解析腦波中的非線性和非穩態特性，特別適用於生物醫學數據處理，
        尤其在分析大腦波動和診斷腦部疾病方面顯示出卓越的效能。
        然而，由於 HHSA 的研究門檻較高且 Matlab 程式碼尚未公開，
        使用者缺少便捷的操作工具和介面，難以有效運行程式並深入熟悉 HHSA。    
    `
    const platformDescription1 = `
        因此，我們與黃鍔院士合作，獲得了 HHSA 的原始碼授權，
        開發了一個網頁應用程式，讓使用者可以在線上操作，並輕鬆引用 HHSA 分析技術。 
        該工具顯著降低了自動化 HHSA 分析的技術門檻。使用者不僅可以便捷地使用 HHSA，
        且不受裝置限制，同時還提供了 EEG 時間區段和通道的前處理功能，大大簡化了分析流程。
        最終，藉由成功開發了這樣一個 HHSA應用，
        不僅能加速研究進程，還有助於推動非線性信號分析在神經科學領域的進步。  
    `
    
    const hhsaDescription0 = `
        在 2016 年，黃鍔等人提出了一種名為全息希爾伯特頻譜分析
        （Holo-Hilbert Spectral Analysis，HHSA）的新方法，
        引入額外維度來表示調幅（Amplitude Modulation, AM）與
        調頻（Frequency Modulation, FM）特徵，
        有效解析腦波中的非線性與非穩態特性。
    `;

    const hhsaDescription1 = `
        HHSA 從兩層經驗模態分解（EMD）開始，第一層 EMD 將信號分解成多個本質模態函數（Intrinsic Mode Functions, IMF），
        提取出振盪成分，並使用直接正交法計算其瞬時頻率與振幅函數。
        接著，將其進行第二層EMD分解，每個 IMF 的瞬時頻率和振幅函數分別
        在二次分解後獲得了調頻（FM）和調幅（AM）的模態函數。
        最終，HHSA 把兩層 EMD 所產生的所有振盪信息整合成一個三維空間的功率分布，該分布基於時間、載波頻率以及 AM/FM 頻率，
        形成了 3D 全息希爾伯特頻譜，展示了信號的 AM/FM 特性。
    `;
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <React.Fragment>
            <MainCard content={false} className={classes.card}>
                <HHSAIntro />
            </MainCard>
        </React.Fragment>
    );
};

PopularCard.propTypes = {
    isLoading: PropTypes.bool
};

export default PopularCard;
