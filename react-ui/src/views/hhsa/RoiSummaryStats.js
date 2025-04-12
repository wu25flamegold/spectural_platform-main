import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
} from '@material-ui/core';
import { useSelector } from 'react-redux';

// 計算 max / mean / std
const getStats = (arr) => {
  if (!arr || arr.length === 0) return { max: 0, mean: 0, std: 0 };
  const max = Math.max(...arr);
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const std = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length);
  return {
    max: max.toFixed(2),
    mean: mean.toFixed(2),
    std: std.toFixed(2),
  };
};

const RoiSummaryStats = () => {
  const result = useSelector((state) => state.roi.result);

  if (!result) return null;

  const fmStats = getStats(result.marginal_fm);
  const amStats = getStats(result.marginal_am);

  return (
    <Card variant="outlined" style={{ marginTop: 16 }}>
      <CardContent style={{ padding: '16px 20px' }}>
        <Typography variant="subtitle1" gutterBottom>
          Dominant Modulation Summary
        </Typography>

        {result.roi_coords && (() => {
          const { x1, x2, y1, y2 } = result.roi_coords;
          const fmRange = [Math.pow(2, x1), Math.pow(2, x2)];
          const amRange = [Math.pow(2, y1), Math.pow(2, y2)];

          return (
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                ROI Selected:
              </Typography>
              <Typography variant="body2" color="textSecondary">
                FM Range: [{fmRange[0].toFixed(2)} ~ {fmRange[1].toFixed(2)}] Hz
              </Typography>
              <Typography variant="body2" color="textSecondary">
                AM Range: [{amRange[0].toFixed(2)} ~ {amRange[1].toFixed(2)}] Hz
              </Typography>
            </Box>
          );
        })()}

        <Divider style={{ margin: '12px 0' }} />

        {[
          ['Dominant Modulation Frequency', result.dominant_fm],
          ['Dominant Modulation Amplitude', result.dominant_am],
        ].map(([label, val]) => (
          <Box key={label} display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography fontWeight="bold">{label}</Typography>
            <Typography>
              {val?.toFixed(2)} <span style={{ color: '#888', fontSize: '0.85em' }}>Hz</span>
            </Typography>
          </Box>
        ))}

        {/* 👉 如果想加入能量分佈統計，建議獨立卡片更乾淨 */}
      </CardContent>
    </Card>
  );
};

export default RoiSummaryStats;
