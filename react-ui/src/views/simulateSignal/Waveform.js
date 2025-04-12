import React, { useState, useEffect } from 'react';
import { XYPlot, LineSeries, XAxis, YAxis, HorizontalGridLines, VerticalGridLines } from 'react-vis';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const Waveform = ({ data, title }) => {
  const [viewWindow, setViewWindow] = useState([data.length*0.4, data.length*0.6]);
  const [plotSize, setPlotSize] = useState({ width: window.innerWidth*0.5, height: window.innerHeight*0.4 });

  useEffect(() => {
    const handleResize = () => {
      setPlotSize({ width: window.innerWidth*0.5, height: window.innerHeight*0.4 });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSliderChange = (value) => {
    setViewWindow(value);
  };

  const chartData = data.slice(viewWindow[0], viewWindow[1]).map((y, x) => ({ x: x + viewWindow[0], y }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <XYPlot height={plotSize.height} width={plotSize.width}>
        <HorizontalGridLines />
        <VerticalGridLines />
        <XAxis />
        <YAxis />
        <LineSeries data={chartData} />
      </XYPlot>
      <Slider
        range
        min={0}
        max={data.length - 1}
        defaultValue={[data.length*0.4, data.length*0.6]}
        onChange={handleSliderChange}
        trackStyle={[{ backgroundColor: 'blue' }]}
        handleStyle={[{ borderColor: 'blue' }, { borderColor: 'blue' }]}
        railStyle={{ backgroundColor: 'grey' }}
        style={{ width: plotSize.width }}
      />
    </div>
  );
};

export default Waveform;
