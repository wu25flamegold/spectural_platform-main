

import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';
import React, { useRef, useEffect, useState } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import './hhsa.css'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import RoiSummaryStats from './RoiSummaryStats';
import ROITooltip from './ROITooltip';

import { setRoiResult } from './../../store/roiSlice';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
} from '@material-ui/core';
const Plot = createPlotlyComponent(Plotly);



const HoloPlot = ({ holoData, isLoading, userid, token, fileName }) => {
  const plotRef = useRef(null);
  const roiCoordsRef = useRef({x1: null, x2: null, y1: null, y2: null});
  const [inputError, setInputError] = React.useState(false);
  const roiResult = useSelector((state) => state.roi.result);
  const dispatch = useDispatch();
  const [plotKey, setPlotKey] = useState(0);


  useEffect(() => {
    if (holoData?.data?.length) {
      // 每次 holoData 改變時更新 key 強制重新 render Plot
      setPlotKey((prev) => prev + 1);
    }
  }, [holoData]);

  const inputRefs = {
    x1: useRef(null),
    x2: useRef(null),
    y1: useRef(null),
    y2: useRef(null)
  };

  const handleAnalyzeROI = async () => {
    const roiCoords = roiCoordsRef.current;
    console.log('分析 ROI:', roiCoordsRef.current);
    const { x1, x2, y1, y2 } = roiCoordsRef.current;

    // 檢查數值是否有效
    if (
      !Number.isFinite(x1) ||
      !Number.isFinite(x2) ||
      !Number.isFinite(y1) ||
      !Number.isFinite(y2)
    ) {
      setInputError("Please fill in all fields.");
      return;
    }

    // 檢查數值是否符合邏輯（不應相等）
    if (x1 === x2 || y1 === y2) {
      setInputError("X or Y axis values should not be the same.");
      return;
    }

    if (x1 === y1 || x2 === y2) {
      setInputError("X or Y axis values should not be the same.");
      return;
    }

    if (x2 <= x1 || y2 <= y1) {
      setInputError("Ensure that right > left and top > bottom.");
      return;
    }
  
    setInputError(false); // 清除錯誤狀態
    try {
      const response = await axios.post('http://xds3.cmbm.idv.tw:81/tmapi/analyze_roi',{ roi_coords: roiCoords }, {
        method: 'POST',
        headers: {
          Authorization: token,
          UserId: userid
        }
      });
  
      if (response.data) {
        console.log("ROI analysis result:", response.data);
        dispatch(setRoiResult(response.data));
        setTimeout(() => {updateSelectionBox(roiCoords)}, 0); // 用 0ms 確保在下一輪事件循環後執行
      } else {
        setInputError("Analysis failed. Try expanding your selection or regenerating the spectrum.");
      }
  
    } catch (error) {
      console.error('Error during ROI analysis:', error);
    }


  };
  

  // 當 plot 上選取 ROI，更新 roiCoordsRef 和 input 的值
  const updateInputs = (coords) => {
    roiCoordsRef.current = coords;

    Object.entries(coords).forEach(([key, val]) => {
      if (inputRefs[key]?.current) {
        inputRefs[key].current.value = parseFloat(val).toFixed(1);
      }
    });

    
  };

  useEffect(() => {
    const adjustYAxisTitle = () => {
      const yTitle = document.querySelector('.ytitle');
      if (yTitle) {
        const parentG = yTitle.parentElement;
        if (parentG && parentG.tagName === 'g') {
          parentG.setAttribute('transform', 'translate(-15,0)');
          console.log('✅ ytitle transform updated');
        }
      }
    };
  
    // 等待 Plotly 完全渲染後再執行（微 delay）
    const timeout = setTimeout(adjustYAxisTitle, 300);
  
    return () => clearTimeout(timeout);
  }, [holoData]);
  
  const zoomout_fixed = {
    name: 'Zoom out',
    icon: Plotly.Icons.zoom_minus,
    click: function(gd) {
      const zoomFactor = 1.5;

      const fullLayout = gd._fullLayout;
      const xaxis = fullLayout.xaxis;
      const yaxis = fullLayout.yaxis;

      const xRange = xaxis.range;
      const yRange = yaxis.range;

      const xMid = (xRange[0] + xRange[1]) / 2;
      const yMid = (yRange[0] + yRange[1]) / 2;

      const xHalf = (xRange[1] - xRange[0]) / 2 * zoomFactor;
      const yHalf = (yRange[1] - yRange[0]) / 2 * zoomFactor;

      let newX = [xMid - xHalf, xMid + xHalf];
      let newY = [yMid - yHalf, yMid + yHalf];

      const xMinLimit = -4;
      const xMaxLimit = 7;
      const yMinLimit = -6;
      const yMaxLimit = 6;

      // 修正不能超出邊界
      if (newX[0] < xMinLimit) newX[0] = xMinLimit;
      if (newX[1] > xMaxLimit) newX[1] = xMaxLimit;

      if (newY[0] < yMinLimit) newY[0] = yMinLimit;
      if (newY[1] > yMaxLimit) newY[1] = yMaxLimit;

      // 再次檢查寬度是否已經到極限，不再 zoom out
      const maxXSpan = xMaxLimit - xMinLimit;
      const maxYSpan = yMaxLimit - yMinLimit;

      if ((newX[1] - newX[0]) >= maxXSpan) newX = [xMinLimit, xMaxLimit];
      if ((newY[1] - newY[0]) >= maxYSpan) newY = [yMinLimit, yMaxLimit];

      Plotly.relayout(gd, {
        'xaxis.range': newX,
        'yaxis.range': newY
      });
    }}
      
  const remove_selected = {
    'width': 22,
    'height': 22,
    'path': "M21 20C21 20.55 20.55 21 20 21H19V19H21V20M15 21V19H17V21H15M11 21V19H13V21H11M7 21V19H9V21H7M4 21C3.45 21 3 20.55 3 20V19H5V21H4M3 15H5V17H3V15M21 15V17H19V15H21M14.59 8L12 10.59L9.41 8L8 9.41L10.59 12L8 14.59L9.41 16L12 13.41L14.59 16L16 14.59L13.41 12L16 9.41L14.59 8M3 11H5V13H3V11M21 11V13H19V11H21M3 7H5V9H3V7M21 7V9H19V7H21M4 3H5V5H3V4C3 3.45 3.45 3 4 3M20 3C20.55 3 21 3.45 21 4V5H19V3H20M15 5V3H17V5H15M11 5V3H13V5H11M7 5V3H9V5H7Z",
    'transform': "translate(-3, -2.5) scale(1.2)"
  }
  
  const updateSelectionBox = (coords) => {
    const gd = plotRef.current?.el;
    if (!gd || !gd._fullLayout) return;

    const selection = {
      x0: coords.x1,
      x1: coords.x2,
      y0: coords.y1,
      y1: coords.y2,
      type: 'rect',
      xref: 'x',
      yref: 'y',
      line: { color: 'gray', width: 2 },
      opacity: 0.3
    };

    Plotly.relayout(gd, { selections: [selection] });
  };
  
  const clean_selected = {
    name: 'Clean Selected',
    icon: remove_selected,
    //icon: Plotly.Icons.eraseshape,
    direction: 'up',
    click: function(gd) {if (!gd || !holoData) return;
      Plotly.relayout(gd, { selections: null });
  }} 

  const labelMap = {
    x1: 'Left',
    x2: 'Right',
    y1: 'Bottom',
    y2: 'Top'
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      
      
      {/* Plot 區域 */}
      <div className="md:col-span-2 w-full">
        {isLoading ? (
          <CircularProgress />
        ) : holoData?.data?.length && holoData?.layout ? (
          <div className="w-full h-full">
            <ROITooltip />
            <div className="w-full bg-transparent" style={{ height: '10px' }} />
            <div className="overflow-x-auto whitespace-nowrap">
              <Plot
                key={plotKey}
                ref={plotRef}
                data={holoData.data}
                layout={{
                  ...holoData.layout,
                  plot_bgcolor: 'white',
                  paper_bgcolor: 'white',
                  template: 'plotly_white',
                  dragmode: 'pan',
                  selections: undefined,
                  fixedrange: true,
                  annotations: [
                    {
                      text: "Powered by Lab 906",
                      font: {
                        size: 10,
                        color: "gray"
                      },
                      x: 1.2,
                      y: -0.135,
                      xref: "paper",
                      yref: "paper",
                      xanchor: "right",
                      yanchor: "bottom",
                      showarrow: false
                    }
                  ],
                  title: {
                    text: fileName,
                    x: 0.5,
                    xanchor: 'center',
                    yanchor: 'top',
                    font: {
                      size: 12
                    }
                  },
                }}
                config={{
                  responsive: true,
                  scrollZoom: false,
                  displaylogo: false,
                  modeBarButtons: [[
                    'pan2d', clean_selected,'select2d', 'zoomIn2d', zoomout_fixed, 'autoScale2d', 'toImage']],
                  displayModeBar: true
                }}
                onSelected={(eventData) => {  
                  if (!eventData?.range) return;

                  const { x, y } = eventData.range;
                  console.log('xyxy', x);
                  console.log('xyxy', y);
                  const pos = {
                    x1: Math.max(x[0], -3),
                    x2: Math.min(x[1], 6),
                    y1: Math.max(y[0], -5),
                    y2: Math.min(y[1], 5)
                  };
                  
                  
                
                  updateInputs(pos);
                }}
                
                style={{ width: '70%', height: '60%' }}
              />
            </div>
          </div>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No result yet.
          </Typography>
        )}
      </div>

      {/* ROI 面板 */}
      <div className="w-full">
      {holoData && (
        <Card variant="outlined" style={{ maxWidth: 420, marginTop: 16 }}>
          <CardContent className="space-y-3 text-sm text-gray-800"  style={{ padding: 16 }}>
          <Typography variant="subtitle1" gutterBottom>
            Modulation Peaks Analysis
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Modulation components with the highest energy are extracted from the selected region of interest (ROI).
          </Typography>
{/* 
          <Typography variant="subtitle1" gutterBottom>
            ROI Selection
          </Typography> */}
          <p className="text-sm text-gray-400">
            Use the <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
              Box Select
              <svg
                viewBox="0 0 1000 1000"
                className="w-3.5 h-3.5"
                fill="currentColor"
              >
                <path
                  d="m0 850l0-143 143 0 0 143-143 0z m286 0l0-143 143 0 0 143-143 0z m285 0l0-143 143 0 0 143-143 0z m286 0l0-143 143 0 0 143-143 0z m-857-286l0-143 143 0 0 143-143 0z m857 0l0-143 143 0 0 143-143 0z m-857-285l0-143 143 0 0 143-143 0z m857 0l0-143 143 0 0 143-143 0z m-857-286l0-143 143 0 0 143-143 0z m286 0l0-143 143 0 0 143-143 0z m285 0l0-143 143 0 0 143-143 0z m286 0l0-143 143 0 0 143-143 0z"
                  transform="matrix(1 0 0 -1 0 850)"
                />
              </svg>            </span>{' '}
            tool to select Region of Interest (ROI) on the HHSA Spectrum.
          </p>

          <div className="pl-1 space-y-2">
            {/* FM 區 */}
            <div>
              <div className="text-gray-700 mb-1">X axis:</div>
              <div className="flex flex-wrap gap-4">
                {['x1', 'x2'].map((key) => (
                  <div key={key} className="flex flex-row items-center gap-2">
                    <label className="text-gray-600">{labelMap[key]}:</label>
                    <input
                      type="number"
                      step="0.5"
                      ref={inputRefs[key]}
                      onChange={(e) => {
                        roiCoordsRef.current[key] = parseFloat(e.target.value) || 0;
                        updateSelectionBox(roiCoordsRef.current);
                        setInputError(false);
                      }}
                      className="w-14 border border-gray-300 rounded px-1 py-0.5 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* AM 區 */}
            <div>
              <div className="text-gray-700 mb-1 mt-2">Y axis:</div>
              <div className="flex flex-wrap gap-2">
                {['y1', 'y2'].map((key) => (
                  <div
                    key={key}
                    className={`flex flex-row items-center ${key === 'y1' ? 'gap-2' : 'gap-1'}`}
                  >
                    <label className="text-gray-600">{labelMap[key]}:</label>
                    <input
                      type="number"
                      step="0.5"
                      ref={inputRefs[key]}
                      onChange={(e) => {
                        roiCoordsRef.current[key] = parseFloat(e.target.value) || 0;
                        updateSelectionBox(roiCoordsRef.current);
                        setInputError(false);
                      }}
                      className="w-14 border border-gray-300 rounded px-1 py-0.5 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 分析按鈕
            <div className="flex justify-end mt-2">

              <button
                onClick={handleAnalyzeROI}
                class="px-3 py-1 mt-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm"                >
                Find Peaks	
              </button>
              {inputError && (
                <div className="text-red-500 text-xs mt-2">{inputError}</div>
              )}
            </div> */}
          </div>
          {/* 分析按鈕 */}
          <div className="flex justify-end mt-2">
            <button
              onClick={handleAnalyzeROI}
              className="w-full px-3 py-1.5 mt-1 text-sm border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-md"
            >
              Find Dominant Peaks
            </button>
          </div>

          {/* 錯誤提示 */}
          {inputError && (
            <div className="text-red-500 text-xs mt-2">{inputError}</div>
          )}

          {/* ↓ 箭頭指引區塊 */}
          <div className="w-full flex justify-center mt-1 mb-1">
            <div className="w-2 h-2 rotate-45 bg-blue-200" />
          </div>

          {/* ROI 統計結果，無卡片包裹 */}
          {roiResult && (
            <div className="mt-4 text-sm text-gray-800 space-y-1">

              {/* <div className="text-gray-500">
                FM Range:{" "}
                <span className="text-gray-600">
                  [{Math.pow(2, roiResult.roi_coords?.x1).toFixed(2)} ~{" "}
                  {Math.pow(2, roiResult.roi_coords?.x2).toFixed(2)}] Hz
                </span>
              </div>

              <div className="text-gray-500">
                AM Range:{" "}
                <span className="text-gray-600">
                  [{Math.pow(2, roiResult.roi_coords?.y1).toFixed(2)} ~{" "}
                  {Math.pow(2, roiResult.roi_coords?.y2).toFixed(2)}] Hz
                </span>
              </div> */}

              <div className="flex justify-between mt-2">
                <div>
                  <div className="text-xs text-gray-500">Peak Frequency</div>
                  <div className="text-blue-600 text-xl font-bold">
                    {roiResult.dominant_fm?.toFixed(2)} Hz
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Peak Amplitude</div>
                  <div className="text-blue-600 text-xl font-bold">
                    {roiResult.dominant_am?.toFixed(2)} Hz
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 mt-1">
                💡 Indicates the most energetic modulation frequency within the selected region.
              </div>
            </div>
          )}


            {/* 顯示 ROI 統計結果
            {roiResult && (
              <>
                <div className="w-full bg-transparent" />
                <div className="mt-4 text-sm  text-gray-800">
                  <Typography variant="subtitle1" gutterBottom>
                    🎯 Dominant Peaks from Selected ROI
                  </Typography>
                  <div class="mb-1">
                      <span className="text-sm text-gray-400">FM Range:</span>
                      <span className="text-sm text-gray-400 pl-1">
                        [{Math.pow(2, roiResult.roi_coords?.x1).toFixed(2)} ~ {Math.pow(2, roiResult.roi_coords?.x2).toFixed(2)}] Hz
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">AM Range:</span>{' '}
                      <span className="text-sm text-gray-400">
                        [{Math.pow(2, roiResult.roi_coords?.y1).toFixed(2)} ~ {Math.pow(2, roiResult.roi_coords?.y2).toFixed(2)}] Hz
                      </span>
                    </div>
                
                  <div className="pl-3">
                    
                    <div className="w-full bg-transparent" style={{ height: '6px' }} />
                    <div className="pb-1">
                      <span>Peak Frequency:</span>{' '}
                      <span className="text-blue-600">{roiResult.dominant_fm?.toFixed(2)} Hz</span>
                    </div>
                    <div>
                      <span>Peak Amplitude:</span>{' '}
                      <span className="text-blue-600">{roiResult.dominant_am?.toFixed(2)} Hz</span>
                    </div>

                    <span className="text-xs text-gray-400 mt-1 block">💡 Indicates the most energetic modulation frequency within the selected region.</span>

                  </div>
                </div>
              </>
            )} */}

          </CardContent>
        </Card>
      )}

        {/* <RoiSummaryStats /> */}

      </div>
    </div>
  );
};

export default HoloPlot;
