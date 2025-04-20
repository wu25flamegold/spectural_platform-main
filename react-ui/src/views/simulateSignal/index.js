import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { updateUsage } from './../../store/actions';
import Waveform from './Waveform';
import '../../assets/scss/style.scss';
import FadeMessage from './../hhsa/FadeMessage';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import HoloPlot from './../hhsa/Holoplot';
import clsx from 'clsx';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import {
    Card,
    CardContent,
    Typography,
    Divider,
    IconButton,
    CircularProgress,
    Collapse,
  } from '@material-ui/core';

const SimulateSignalPage = () => {
    const [signalSize, setSignalSize] = useState(1000);
    const [samplingRate, setSamplingRate] = useState(200.0);
    const [message, setMessage] = useState(null);
    const [image, setImage] = useState(null);
    const [selectedFunction, setSelectedFunction] = useState('f1');
    const [waveform, setWaveform] = useState(null);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const account = useSelector((state) => state.account);
    const [showInputs, setShowInputs] = useState(true);


    const handleFunctionChange = (event) => {
        setSelectedFunction(event.target.value);
    };


    const functionLatex = {
        f1: String.raw`F_1(t) = \sin^2(8t) \cdot \cos(t)`,
        f2: String.raw`F_2(t) = \sin(2t)`,
        f3: String.raw`F_3(t) = 0.5 \cdot \frac{\sin(t) + 1}{2} \cdot \sin(8t)`,
        f4: String.raw`F_4(t) = \frac{\sin(t) + 1}{2} \cdot \sin(8t)`,
        f5: String.raw`F_5(t) = \frac{\sin(0.25t) + 1}{2} \cdot \sin(2t)`,
        f6: String.raw`F_6(t) = F_4(t) + F_5(t)`,
      };
      
      
    const generateWaveform = () => {
        const functions = {
            f1: (i) => Math.pow(Math.sin(8 * Math.PI * i / samplingRate), 2) * Math.cos( Math.PI * i / samplingRate),
            f2: (i) => 1 * Math.sin(2 * 2 * Math.PI * i / samplingRate),
            f3: (i) => 0.5 * (Math.sin(1.0 * 2 * Math.PI * i / samplingRate) + 1) / 2 * Math.sin(8.0 * 2 * Math.PI * i / samplingRate),
            f4: (i) => (Math.sin(1.0 * 2 * Math.PI * i / samplingRate) + 1) / 2 * Math.sin(8.0 * 2 * Math.PI * i / samplingRate),
            f5: (i) => (Math.sin(0.25 * 2 * Math.PI * i / samplingRate) + 1) / 2 * Math.sin(2 * 2 * Math.PI * i / samplingRate),
            f6: (i) => functions.f4(i) + functions.f5(i),
        };
        const data = Array.from({ length: signalSize }, (_, i) => functions[selectedFunction](i));
        setWaveform({ title: selectedFunction, data });
    };

    useEffect(() => {
        generateWaveform();
    }, [selectedFunction, signalSize, samplingRate]);

    useEffect(() => {
        handleOpenMatlab();
    }, []);
    const functionNames = {
        f1: "Function 1",
        f2: "Function 2",
        f3: "Function 3",
        f4: "Function 4",
        f5: "Function 5",
        f6: "Function 6",
      };
      
    const handleOpenMatlab = async () => {
        try {
            const response = await axios.post('http://xds3.cmbm.idv.tw:81/tmapi/open_matlab', {
                token: `${account.token}`
            }, {
                headers: {
                    Authorization: `${account.token}`,
                    UserId: `${account.user._id}`
                }
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error?.response?.data?.message || error);
        }
    };

    const handleUpload = async () => {
        
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('sampling_rate', samplingRate);
            formData.append('selectedFunction', selectedFunction);
            formData.append('email', account.user.email);
            formData.append('usage', account.user.usage);
            const response = await axios.post('http://xds3.cmbm.idv.tw:81/tmapi/send_simulate', formData, {
                headers: {
                    Authorization: `${account.token}`,
                    UserId: `${account.user._id}`
                }
            });
            if (response.data.success) {
                setShowInputs(false);
                setImage(response.data.image);
                dispatch(updateUsage(response.data.usage));
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error?.response?.data?.message || error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {message && (
            <FadeMessage
                message={message}
                duration={2400}
                onClose={() => setMessage(null)}
            />
            )}
            <div className="px-1 sm:px-4 pb-[100px]">
                <div className="bg-white rounded-lg shadow p-3 sm:p-6 flex flex-col gap-6">


                    {/* Header */}
                    <div>
                        {/* <Typography variant="h6" className="text-gray-800 mb-4 transform translate-y-[6px]">Simulated Signal Analyze</Typography> */}
                        {/* Header with toggle */}
                        <div className="flex justify-between items-center mb-2 h-6">
                            <Typography variant="h6" className="text-gray-800">
                            Simulated Signal Analyze
                            </Typography>
                            <IconButton
                                onClick={() => setShowInputs(!showInputs)}
                                className={clsx('transition-transform p-1', {
                                'transform rotate-180': showInputs,
                                })}
                            >
                                <ExpandMoreIcon />
                            </IconButton>
                        </div>
                        <Divider className="mb-6" />
                        {/* Form content (collapsible) */}
                        <Collapse in={showInputs} timeout="auto">
                            <div className="flex flex-col gap-6">
                                <div
                                    className={`transition-all duration-500 ease-in-out overflow-hidden${
                                        showInputs ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    {waveform && (
                                    <div className="my-6">
                                        <Waveform data={waveform.data} title={waveform.title} />
                                    </div>
                                    )}
                                    <div className="flex flex-wrap gap-6">
                                    {/* 左側：Function 選擇區 */}
                                        <div className="flex-1">
                                            <label variant="subtitle2" className="block font-medium text-xs mb-1">Choose a Signal Pattern (ω in rad/s):
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-2 gap-y-2 min-w-0">
                                                {["f1", "f2", "f3", "f4", "f5", "f6"].map((f) => (
                                                <label key={f} className="border p-3 rounded flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="function"
                                                        value={f}
                                                        checked={selectedFunction === f}
                                                        onChange={handleFunctionChange}
                                                    />
                                                    <span className="font-medium text-xs">{functionNames[f]}</span>
                                                    </div>
                                                    <BlockMath math={functionLatex[f]} />
                                                </label>
                                                ))}
                                            </div>
                                        </div>


                                        {/* 右側：固定說明 + 按鈕 */}
                                        {/* 右側：固定說明 + 按鈕 */}
                                        <div className="w-full lg:w-[160px] flex flex-col gap-4 pt-1">
                                        <div>
                                            <label className="block font-medium text-xs mb-1">Signal Configuration:</label>
                                            <div className="text-sm space-y-1">
                                            <div>
                                                <span className="font-medium font-sans text-xs font-semibold">Duration:</span>{' '}
                                                <span className="text-blue-600 font-semibold text-xs font-sans">20 s</span>
                                            </div>
                                            <div>
                                                <span className="font-medium font-sans text-xs font-semibold">Sampling Rate:</span>{' '}
                                                <span className="text-blue-600 font-semibold text-xs font-sans">200 Hz</span>
                                            </div>
                                            </div>
                                        </div>

                                        <div>
                                            <button
                                            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded w-full"
                                            onClick={handleUpload}
                                            disabled={isLoading}
                                            >
                                            {isLoading ? 'Analyzing...' : 'Run Analysis'}
                                            </button>
                                        </div>
                                        </div>



                                    </div>
                                 </div>
                            </div>
                        </Collapse>
                    </div>

                    
                    <div>
                        <Typography  variant="h6" className="text-gray-800 mb-2 h-6">
                                HHSA Spectrum Result
                            </Typography>
                            <Divider className="mb-4" />
                            
                            <HoloPlot holoData={image} isLoading={isLoading} userid={`${account.user._id}`} token={`${account.token}`}/>
                    </div>
                </div>
                </div>



        </>
    );
};

export default SimulateSignalPage;
