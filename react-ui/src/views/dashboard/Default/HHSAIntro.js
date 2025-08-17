import React from 'react';
import {
  Typography,
  Divider,
  CardContent,
  Box,
  Grid,
  Chip,
  Tooltip,
} from '@material-ui/core';
import SchoolIcon from '@material-ui/icons/School'; // citation badge icon

const HHSAIntro = () => {
  return (
    <CardContent>
      <Box fontSize="2rem" lineHeight={1.6}>

        <Typography variant="h3" gutterBottom>
          平台緣起
        </Typography>

        <Typography variant="body1" paragraph sx={{  mb: 3 , fontSize: '1.1rem' }}>
          本系統設計初衷旨在讓使用者以最直覺的方式操作 HHSA，探索腦波中的非線性奧秘。
        </Typography>

        <Typography variant="h3" gutterBottom>
          為什麼需要 HHSA？
        </Typography>
        <Typography variant="body1" paragraph sx={{   mb: 3 , fontSize: '1.1rem' }}>
          隨著神經科學研究逐步揭示大腦神經振盪在感知和認知功能中的關鍵作用，
          對精確且快速的腦波數據分析需求日益增長。
          其中，全息希爾伯特頻譜分析（Holo-Hilbert Spectral Analysis, HHSA）是一種強大的非線性信號分析工具，
          有效地解析腦波中的非線性和非穩態特性，特別適用於生物醫學數據處理，
          尤其在分析大腦波動和診斷腦部疾病方面顯示出卓越的效能。
        </Typography>

        <Typography variant="h3" gutterBottom>
          使用 HHSA 的挑戰
        </Typography>
        <Typography variant="body1" paragraph sx={{  mb: 3 ,  fontSize: '1.1rem' }}>
          然而，由於 HHSA 的研究門檻較高且 Matlab 程式碼尚未公開，
          使用者缺少便捷的操作工具和介面，難以有效運行程式並深入熟悉 HHSA。
        </Typography>

        <Typography variant="h3" gutterBottom>
          解決方案：一鍵上手 HHSA 分析
        </Typography>
        <Typography variant="body1" paragraph sx={{  mb: 3 ,  fontSize:'1.1rem' }}>
          為了解決 HHSA 應用門檻高、缺乏操作介面的問題，我們與 HHSA 方法的原創者——中央研究院黃鍔院士合作，
          獲得其原始演算法授權，
          共同開發出一個可在線操作的 HHSA 應用平台。
          此平台大幅降低了 HHSA 在研究與臨床應用上的技術門檻，
          使用者無需安裝複雜環境，即可跨裝置完成分析流程。
          此外，平台亦整合 EEG 資料的區段與通道前處理功能，進一步提升分析效率與使用體驗。
        </Typography>

        <Box
          bgcolor="#fff"
          boxShadow={1}
          p={2}
          borderRadius={4}
          border="0.5px solid #e0e0e0"
        >
          <Typography variant="h3" gutterBottom sx={{ mb: 2 }}>
            🧠 平台亮點
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontSize: '1.1rem' }}>✔️ 免安裝、免寫程式，一鍵操作 HHSA</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontSize: '1.1rem' }}>✔️ EEG 時段/通道前處理功能整合</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontSize: '1.1rem' }}>✔️ 支援跨裝置操作，自由靈活</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontSize: '1.1rem' }}>✔️ 黃鍔院士授權</Typography>
            </Grid>
            
          </Grid>
        </Box>

        <Divider style={{ margin: '24px 0' }} />

        <Typography variant="h3" gutterBottom sx={{ mb: 1 }}>
          什麼是 HHSA？
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          全息希爾伯特頻譜分析（Holo-Hilbert Spectral Analysis, HHSA）是由黃鍔教授等人在 2016 年提出的一種創新頻譜分析方法（Huang et al., 2016）。
          這項技術特別適用於處理像腦波這樣 <strong>非線性、非穩態</strong> 的訊號。
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          HHSA 的核心理念是同時揭露信號中的 <strong>調幅（Amplitude Modulation, AM）</strong>與<strong>調頻（Frequency Modulation, FM）特徵</strong>。
          它透過兩層的經驗模態分解（Empirical Mode Decomposition, EMD）來達成這個目的：
        </Typography>

        <Box component="div" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
          <Box
            sx={{
              display: 'block',
              paddingLeft: '6.3em',
              textIndent: '-6.3em',
              whiteSpace: 'pre-wrap',
            }}
          >
            <strong>第一層 EMD：</strong>將原始訊號拆解成多個振盪成分（IMF，Intrinsic Mode Functions，內在模態函數），
            每個 IMF 具有明確的頻率特徵可計算其瞬時頻率與瞬時振幅。其中，瞬時頻率對應於訊號的<strong>調頻特徵（Frequency Modulation, FM）</strong>，
            而瞬時振幅則形成包絡（envelope）對應 IMF 的振幅變化。
          </Box>

          <Box
            sx={{
              display: 'block',
              paddingLeft: '6.3em',
              textIndent: '-6.3em',
              whiteSpace: 'pre-wrap',
              mt: 1.5
            }}
          >
            <strong>第二層 EMD：</strong>將每個拆解出的 IMF，其<strong> 包絡 </strong>都再各自進行一次 EMD 分解。換言之，針對每個 IMF 的<strong> 振幅變化曲線 </strong>施以第二層 EMD，計算出的瞬時頻率即對應於訊號的<strong>調幅特徵（Amplitude Modulation, AM）</strong>。
          </Box>
        </Box>

        <Typography variant="body1" paragraph sx={{ mt: 1 , fontSize: '1.1rem' }}>
          最後，HHSA 將訊號中主要振盪成分的振幅變化與頻率變化資訊整合為一個三維頻譜，完整展現信號的動態變化與能量分佈。這種方法不僅提供比傳統頻譜更細膩的結構分析，也讓我們更深入理解大腦訊號中的隱含規律。
        </Typography>

        <Divider style={{ margin: '24px 0' }} />

        <Typography variant="h3" gutterBottom sx={{ mb: 1 }}>
          參考文獻：
        </Typography>

        <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
          <Tooltip title="HHSA 原始論文">
            <Chip
              icon={<SchoolIcon />}
              label="Huang et al. (2016)"
              component="a"
              clickable
              href="https://doi.org/10.1098/rsta.2015.0206"
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              variant="default"
            />
          </Tooltip>
          <Typography variant="body2">
            Huang, N. E., Hu, K., Yang, A. C. C., Chang, H.-C., Jia, D., Liang, W.-K., Yeh, J. R., Kao, C.-L., Juan, C.-H., Peng, C. K., Meijer, J. H., Wang, Y.-H., Long, S. R., & Wu, Z. (2016).{' '}
            <em>On Holo-Hilbert spectral analysis: a full informational spectral representation for nonlinear and non-stationary data.</em>{' '}
            <strong>Philosophical Transactions of the Royal Society A</strong>. Published: 13 April 2016. <br />
          </Typography>
        </Box>

      </Box>
    </CardContent>
  );
};

export default HHSAIntro;
