import React, { useState, useEffect  } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
  } from 'recharts';
  
const FFTPage = () => {
    const [file, setFile] = useState(null);
    const [fftData, setFftData] = useState(null);
    const [viewData, setViewData] = useState(null);
    const [startIndex, setStartIndex] = useState(44000);
    const [endIndex, setEndIndex] = useState(48000);


    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async() => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.post('http://127.0.0.1:5000/upload_for_fft', formData);
            
            setFftData(response.data.message);
            
            updateViewData(response.data, startIndex, endIndex);
        } catch (error) {
            console.error('There was an error uploading the file!', error);
        }

    };
    const updateViewData = (data, start, end) => {
        if (data) {
          setViewData({
            frequency: data.frequency.slice(start, end),
            amplitude: data.amplitude.slice(start, end)
          });
        }
      };
    
      useEffect(() => {
        if (fftData) {
          updateViewData(fftData, startIndex, endIndex);
        }
      }, [fftData, startIndex, endIndex]);

  
    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload and Analyze</button>
            <div>
                <label>Start Index:</label>
                <input
                type="number"
                value={startIndex}
                onChange={(e) => setStartIndex(Math.max(0, Math.min(Number(e.target.value), (fftData ? fftData.frequency.length - 1 : 0))))}
                disabled={!fftData}
                />
                <label>End Index:</label>
                <input
                type="number"
                value={endIndex}
                onChange={(e) => setEndIndex(Math.max(startIndex, Math.min(Number(e.target.value), (fftData ? fftData.frequency.length : 48000))))}
                disabled={!fftData}
                />
            </div>
            

            {viewData && (
                <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={viewData.frequency.map((freq, index) => ({
                    frequency: freq,
                    amplitude: viewData.amplitude[index]
                    }))}
                    margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="frequency" type="number" domain={['auto', 'auto']} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="amplitude" stroke="#8884d8"  dot={false} activeDot={{ r: 8 }} />
                </LineChart>
                </ResponsiveContainer>
            )}
            </div>
    );
  };



export default FFTPage;
