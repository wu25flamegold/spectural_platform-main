import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const HHTPage = () => {
  const [file, setFile] = useState(null);
  const [hhtData, setHhtData] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(4000);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://127.0.0.1:5000/upload_for_hht', formData);
      console.log(response.data.message)
      setHhtData(response.data.message);
      updateViewData(response.data.message, startIndex, endIndex);
    } catch (error) {
      console.error('There was an error uploading the file!', error);
    }
  };

  const updateViewData = (data, start, end) => {
    if (data) {
      console.log(data, start, end)
      setViewData(data.map((result, index) => ({
        imf: result.imf.slice(start, end),
        amplitude_envelope: result.amplitude_envelope.slice(start, end),
        instantaneous_frequency: result.instantaneous_frequency.slice(start, end)
      })));
    }
  };

  useEffect(() => {
    if (hhtData) {
      updateViewData(hhtData, startIndex, endIndex);
    }
  }, [hhtData, startIndex, endIndex]);

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload and Analyze</button>
      <div>
        <label>Start Index:</label>
        <input
          type="number"
          value={startIndex}
          onChange={(e) => setStartIndex(Math.max(0, Math.min(Number(e.target.value), (hhtData ? hhtData[0].imf.length - 1 : 0))))}
          disabled={!hhtData}
        />
        <label>End Index:</label>
        <input
          type="number"
          value={endIndex}
          onChange={(e) => setEndIndex(Math.max(startIndex, Math.min(Number(e.target.value), (hhtData ? hhtData[0].imf.length : 4000))))}
          disabled={!hhtData}
        />
      </div>

      {viewData && viewData.map((result, index) => (
        <div key={index}>
          <h3>IMF {index + 1}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={result.imf.map((value, idx) => ({
                index: idx,
                imf: value,
                amplitude_envelope: result.amplitude_envelope[idx]
              }))}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" type="number" domain={['auto', 'auto']} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="imf" stroke="#8884d8" dot={false} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="amplitude_envelope" dot={false} stroke="#82ca9d" activeDot={{ r: 8 }}/>
            </LineChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={result.instantaneous_frequency.map((value, idx) => ({
                index: idx,
                instantaneous_frequency: value
              }))}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" type="number" domain={['auto', 'auto']} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="instantaneous_frequency" stroke="#ffc658" dot={false} activeDot={{ r: 8 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};

export default HHTPage;
