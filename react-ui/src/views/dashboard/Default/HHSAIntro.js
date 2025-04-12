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

      {/* Section: Title */}
      <Typography variant="h5" gutterBottom>
        平台緣起
      </Typography>

      {/* Section: 引導句 */}
      <Typography variant="body1" paragraph>
        本系統設計初衷旨在讓使用者以最直覺的方式操作 HHSA，探索腦波中的非線性奧秘。
      </Typography>

      {/* Section: 為什麼需要 HHSA */}
      <Typography variant="subtitle1" gutterBottom>
        為什麼需要 HHSA？
      </Typography>
      <Typography variant="body1" paragraph>
        隨著神經科學研究逐步揭示大腦神經振盪在感知和認知功能中的關鍵作用，
        對精確且快速的腦波數據分析需求日益增長。
        其中，全息希爾伯特頻譜分析（Holo-Hilbert Spectral Analysis, HHSA）是一種強大的非線性信號分析工具，
        有效地解析腦波中的非線性和非穩態特性，特別適用於生物醫學數據處理，
        尤其在分析大腦波動和診斷腦部疾病方面顯示出卓越的效能。
      </Typography>

      {/* Section: 面臨的挑戰 */}
      <Typography variant="subtitle1" gutterBottom>
        使用 HHSA 的挑戰
      </Typography>
      <Typography variant="body1" paragraph>
        然而，由於 HHSA 的研究門檻較高且 Matlab 程式碼尚未公開，
        使用者缺少便捷的操作工具和介面，難以有效運行程式並深入熟悉 HHSA。
      </Typography>

      {/* Section: 平台解法 */}
      <Typography variant="subtitle1" gutterBottom>
        解決方案：一鍵上手 HHSA 分析
      </Typography>
      <Typography variant="body1" paragraph>
        為了解決 HHSA 應用門檻高、缺乏操作介面的問題，我們與 HHSA 方法的原創者——中央研究院黃鍔院士合作，
        獲得其原始演算法授權，並由黃鍔院士團隊提供技術支援，
        共同開發出一個可在線操作的 HHSA 應用平台。
        此平台大幅降低了 HHSA 在研究與臨床應用上的技術門檻，
        使用者無需安裝複雜環境，即可跨裝置完成分析流程。
        此外，平台亦整合 EEG 資料的區段與通道前處理功能，進一步提升分析效率與使用體驗。
      </Typography>

      {/* Section: 亮點 */}
      <Box
        bgcolor="#fff"
        boxShadow={1}
        p={2}
        borderRadius={4}
        border="0.5px solid #e0e0e0"
        >
        <Typography variant="subtitle1" gutterBottom>
            🧠 平台亮點
        </Typography>
        <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
            <Typography variant="body2">✔️ 免安裝、免寫程式，一鍵操作 HHSA</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
            <Typography variant="body2">✔️ EEG 時段/通道前處理功能整合</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
            <Typography variant="body2">✔️ 支援跨裝置操作，自由靈活</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
            <Typography variant="body2">✔️ 與黃鍔院士團隊正式授權合作與技術支援</Typography>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Box mt={2}>
              <Typography variant="body2">
                💡 相較於傳統需安裝 Matlab 的方式，若使用官方授權的 Matlab 軟體，商業標準版售價為 2,535 美元（約新台幣 83,790 元），
                學術版亦需 550 美元（約新台幣 18,179 元）。本平台提供免授權費、即時操作的替代方案，
                有效降低研究或臨床應用的技術與財務門檻。
              </Typography>
              </Box>
            </Grid>
        </Grid>
        </Box>



      <Divider style={{ margin: '24px 0' }} />

      {/* Section: 技術細節 */}
      <Typography variant="h5" gutterBottom>
        什麼是 HHSA？
      </Typography>

      <Typography variant="body1" paragraph>
        全息希爾伯特頻譜分析（Holo-Hilbert Spectral Analysis, HHSA）是由黃鍔教授等人在 2016 年提出的一種創新頻譜分析方法（Huang et al., 2016）。
        這項技術特別適用於處理像腦波這樣 <strong>非線性、非穩態</strong> 的訊號。
      </Typography>

      <Typography variant="body1" paragraph>
        HHSA 的核心理念是同時揭露信號中的 <strong>調幅（AM）</strong> 與 <strong>調頻（FM）</strong> 特徵。
        它透過兩層的經驗模態分解（EMD）來達成這個目的：
      </Typography>

      <Typography variant="body1" paragraph>
        - <strong>第一層 EMD</strong>：將原始訊號拆解成多個振盪組件（IMF），並計算出每個 IMF 的瞬時頻率與振幅。<br />
        - <strong>第二層 EMD</strong>：進一步分析這些頻率與振幅，萃取出 AM/FM 的調變模式。
      </Typography>

      <Typography variant="body1" paragraph>
        最後，HHSA 將所有資訊整合為一個三維頻譜，從時間、載波頻率到 AM/FM 頻率，完整展現信號的動態變化與能量分佈。
      </Typography>

      <Typography variant="body1" paragraph>
        這種方法不僅提供比傳統頻譜更細膩的結構分析，也讓我們更深入理解大腦訊號中的隱含規律。
      </Typography>

      <Divider style={{ margin: '24px 0' }} />

      {/* Section: Citation Badge */}
      <Typography variant="subtitle1" gutterBottom>
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
    </CardContent>
  );
};

export default HHSAIntro;
