import React, { useState, useEffect } from 'react';
import { XYPlot, LineSeries, XAxis, YAxis, HorizontalGridLines, VerticalGridLines } from 'react-vis';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const Waveform = ({ data, title }) => {
  const [viewWindow, setViewWindow] = useState([0, data.length*0.2]);
  const [plotSize, setPlotSize] = useState({ width: window.innerWidth*0.6, height: window.innerHeight*0.25 });

  useEffect(() => {
    const handleResize = () => {
      setPlotSize({ width: window.innerWidth*0.6, height: window.innerHeight*0.25 });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSliderChange = (value) => {
    const [start, end] = value;
    const minGap = 4;
  
    if (end - start < minGap) {
      const mid = (start + end) / 2;
      setViewWindow([Math.max(0, mid - minGap / 2), Math.min(data.length, mid + minGap / 2)]);
    } else {
      setViewWindow(value);
    }
  };
  

  const chartData = data.slice(viewWindow[0], viewWindow[1]).map((y, x) => ({ x: x + viewWindow[0], y }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <XYPlot height={plotSize.height} width={plotSize.width} margin={{ left: 50, right: 40, top: 5, bottom: 30 }}>
        <HorizontalGridLines />
        <VerticalGridLines />
        <XAxis tickTotal={6} />
        <YAxis tickTotal={6}/>
        <LineSeries
          data={chartData}
          style={{
            stroke: 'blue',
            fill: 'none',
            strokeOpacity: 0.8
          }}
        />

      </XYPlot>
      <Slider
        range
        min={0}
        max={data.length}
        defaultValue={[0, Math.floor(data.length*0.2)]}
        onChange={handleSliderChange}
        style={{ width: plotSize.width }}
      />
    </div>
  );
};

export default Waveform;
