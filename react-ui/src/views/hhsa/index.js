import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { updateUsage } from './../../store/actions';
import clsx from 'clsx';
import HoloPlot from './Holoplot';
import FadeMessage from './FadeMessage';
import ROICoordsDisplay from './ROICoordsDisplay';
import { useRef } from 'react';

import {
    Card,
    CardContent,
    Typography,
    Divider,
    IconButton,
    CircularProgress,
    Collapse,
  } from '@material-ui/core';
import '../../assets/scss/style.scss';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const SamplePage = () => {
    const [remoteWndName, setRemoteWndName] = useState("");
    const [selectedTab, setSelectedTab] = useState(0);
    const [cmd, setCmd] = useState("");
    const [file, setFile] = useState(null);
    const [chn, setChn] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [diagnosisCodes, setDiagnosisCodes] = useState("");
    const [signalSize, setSignalSize] = useState(1000);
    const [samplingRate, setSamplingRate] = useState(200.0);
    const [dStart, setDStart] = useState(0.0);
    const [dStop, setDStop] = useState(0.0);
    const [image, setImage] = useState(null);
    const [selectedFunction, setSelectedFunction] = useState('f2');
    const [waveform, setWaveform] = useState(null);
    const dispatch = useDispatch();
    const [showInputs, setShowInputs] = useState(true);
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const account = useSelector((state) => state.account);

    const [edfMeta, setEdfMeta] = useState({
        num_signals: null,
        fs: null,
        duration: null,
        records: null
    });

    const parseTimeout = useRef(null);
    const handleFileChange = (e) => {
        
        const selectedFile = e.target.files[0];
        const maxSizeMB = 50;
    
        if (selectedFile && selectedFile.size > maxSizeMB * 1024 * 1024) {
            setErrors(prev => ({ ...prev, file: `File size exceeds ${maxSizeMB}MB limit.` }));
            setFile(null);
            return;
        }
    
        setFile(selectedFile);
        setErrors(prev => ({ ...prev, file: "" }));
    
        clearTimeout(parseTimeout.current);

        parseTimeout.current = setTimeout(async () => {
            try {
                console.log('selectedFile', selectedFile)
                const formData = new FormData();
                formData.append('file', selectedFile);
    
                const response = await axios.post(
                    'http://xds3.cmbm.idv.tw:81/tmapi/validate_edf_metadata',
                    formData,
                    {
                        headers: {
                            Authorization: `${account.token}`,
                            UserId: `${account.user._id}`
                        }
                    }
                );
                console.log('selectedFile', selectedFile)
                // ✅ 顯示來自後端的 fs/duration/records 等資訊
                const { num_signals, fs_detected, duration_str, num_records_str, message } = response.data;
                console.log("num_signals:", num_signals);
                console.log("fs_detected:", fs_detected);
                console.log("duration_str:", duration_str);
                console.log("num_records_str:", num_records_str);
    
                //setMessage(`✅ ${message} (fs: ${fs_detected}, duration: ${duration_str}, records: ${num_records_str})`);
                setEdfMeta({
                    num_signals: num_signals,
                    fs: fs_detected,
                    duration: duration_str,
                    records: num_records_str,
                    
                });
                // 如果你有狀態欄位也可以 setFS(fs_detected) 之類
            } catch (error) {
                const errMsg = error?.response?.data?.message || error.message;
                console.error("❌ EDF 驗證失敗", errMsg);
                setMessage(`❌ ${errMsg}`);
            }
        }, 500); // 0.5 秒延遲

    };
    


    useEffect(() => {
        handleOpenMatlab();
    }, []);

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
            // alert(response.data.message);
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error?.response?.data?.message || error);
        }
    };

    const handleUpload = async () => {
        const errors = validateInputs();
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }
        setErrors({});
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('remote_wnd_name', remoteWndName);
            formData.append('cmd', cmd);
            formData.append('chn', chn);
            formData.append('signal_size', signalSize);
            formData.append('sampling_rate', '');
            formData.append('d_start', dStart);
            formData.append('d_stop', dStop);
            formData.append('selectedFunction', selectedFunction);
            formData.append('email', account.user.email);
            formData.append('usage', account.user.usage);
            formData.append('age', age);
            formData.append('gender', gender);
            formData.append('clinical_diagnosis_code', diagnosisCodes);
            const response = await axios.post('http://xds3.cmbm.idv.tw:81/tmapi/send_command', formData, {
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
            setImage(null);
            alert(error?.response?.data?.message || error);
        } finally {
            setIsLoading(false);
            
        }
    };

    const toFreqLabel = (val) => {
        const floatVal = parseFloat(val);
        if (isNaN(floatVal)) return '';
        const freq = Math.pow(2, Math.abs(floatVal)).toFixed(3);
        if (floatVal < 0) return `≈ 1/${freq} (${(1 / freq).toFixed(3)} Hz)`;
        return `${freq} Hz`;
    };
    
      
    const handleAnalyzeROI = async (coords) => {
          // 安全地轉成 log2（避免 0 或 NaN）
        const safeLog2 = (val) => {
            const parsed = parseFloat(val);
            return parsed > 0 ? Math.log2(parsed) : null; // 避免 log2(0) or 負值
        };

        const logCoords = {
            x1: safeLog2(coords.x1),
            x2: safeLog2(coords.x2),
            y1: safeLog2(coords.y1),
            y2: safeLog2(coords.y2),
        };

        console.log("分析 ROI 區域（對數座標）:", logCoords);
        console.log("分析 ROI 區域:", coords);
        try {
            const response = await axios.post('http://xds3.cmbm.idv.tw:81/tmapi/analyze_roi', 
                { roi_coords: logCoords },
                {
                  headers: {
                    Authorization: `${account.token}`,
                    UserId: `${account.user._id}`
                  }
                }
              );
          
              const data = response.data;
              console.log("ROI 分析結果：", data);
        } catch (error) {
            console.error('分析 ROI 時發生錯誤:', error);
        }
      };

    const validateInputs = () => {
        const errors = {};
        if (!gender) errors.gender = "Gender is required.";
        if (!age || isNaN(age) || age <= 0 || !/^\d+$/.test(age)) errors.age = "Age must be a positive number.";
        if (!file) errors.file = "Please upload a file.";
        else {
            const fileExtension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
            if (fileExtension !== ".edf") errors.file = "Only .edf files are allowed.";
        }
        if (!chn || isNaN(chn) || chn <= 0 || !/^\d+$/.test(chn)) errors.chn = "Channel must be a positive number.";
        if (dStart === "" || dStart === null || dStart === undefined || isNaN(dStart) || dStart < 0 || !/^(0|[1-9]\d*)(\.\d+)?$/.test(dStart)) {
            errors.dStart = "Start Time must be a non-negative number.";
        }
        if (
            isNaN(+dStop) ||
            +dStop <= 0 ||
            +dStop <= +dStart ||
            !/^(0|[1-9]\d*)(\.\d+)?$/.test(dStop)
          ) {
            errors.dStop = "Stop Time must be greater than Start Time.";
          } else if (+dStop - +dStart > 30) {
            errors.dStop = "Time range must be no more than 30 seconds.";
        }
                  return errors;
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
            <div className="p-4">
                <div className="bg-white rounded-lg shadow p-1">
                    <Card elevation={0} className="rounded-lg">
                        <CardContent>
                            {/* Header with toggle */}
                            <div className="flex justify-between items-center mb-2 h-6">
                                <Typography variant="h6" className="text-gray-800">
                                    Upload & Parameters
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
                                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                            showInputs ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                            {/* Left: Upload UI */}
                                            <div className="col-span-1 bg-white border rounded p-4 flex flex-col items-center justify-center">
                                                {file ? (
                                                    <div className="flex flex-col items-center gap-4">
                                                    <div className="bg-blue-200 p-3 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2l4-4M6 2a2 2 0 00-2 2v16c0 1.1.9 2 2 2h12a2 2 0 002-2V8l-6-6H6z" />
                                                    </svg>
                                                    </div>
                                                
                                                    <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16V4a1 1 0 011-1h7l5 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1z" />
                                                    </svg>
                                                    <span className="truncate max-w-[120px] text-sm font-medium text-gray-800 font-sans font-semibold">{file.name}</span>
                                                    <button onClick={() => {
                                                        setFile(null);
                                                        setEdfMeta({ num_signals: null, fs: null, duration: null, records: null });
                                                    }} className="hover:text-red-500 text-gray-400 transition">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                    </div>
                                                    <div className="text-xs text-gray-600 -mt-1 text-left leading-snug">
                                                        {edfMeta.fs && (
                                                            <>
                                                            <div>
                                                                <span className="font-medium font-sans font-semibold">Sample Rate:</span>{' '}
                                                                <span className="text-blue-600 font-semibold font-sans">{edfMeta.fs} Hz</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium font-sans font-semibold">Total Duration:</span>{' '}
                                                                <span className="text-blue-600 font-semibold font-sans">{edfMeta.duration} s</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium font-sans font-semibold">Channel Counts:</span>{' '}
                                                                <span className="text-blue-600 font-semibold font-sans">{edfMeta.num_signals}</span>
                                                            </div>
                                                            </>
                                                        )}
                                                        </div>





                                                </div>
                                                
                                                ) : (
                                                    <label
                                                        htmlFor="fileUpload"
                                                        className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition duration-200"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m5 4v12m0 0l4-4m-4 4l-4-4" />
                                                        </svg>
                                                        <span className="text-sm">Click or drag file to upload</span>
                                                        <span className="text-xs text-gray-400 mt-1">(Max file size: 50MB)</span>

                                                    </label>
                                                )}

                                                <input
                                                    id="fileUpload"
                                                    type="file"
                                                    className="hidden"
                                                    onClick={(e) => (e.target.value = null)}
                                                    onChange={handleFileChange}
                                                />
                                                {errors.file && (
                                                    <span className="text-red-500 text-xs italic mt-2 block">{errors.file}</span>
                                                )}
                                            </div>

                                            {/* Right: Other inputs and submit */}
                                            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 -translate-x-1">
                                                {/* Gender */}
                                                <div className="flex flex-col">
                                                    <label className="mb-1">Gender:</label>
                                                    <div className="flex gap-4">
                                                        <label><input type="radio" name="gender" value="M" checked={gender === "M"} onChange={(e) => setGender(e.target.value)} /> Male</label>
                                                        <label><input type="radio" name="gender" value="F" checked={gender === "F"} onChange={(e) => setGender(e.target.value)} /> Female</label>
                                                    </div>
                                                    {errors.gender && <span className="text-red-500 text-xs italic">{errors.gender}</span>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <label>Age:</label>
                                                    <input type="text" className="border p-2 rounded" value={age} onChange={(e) => setAge(e.target.value)} />
                                                    {errors.age && <span className="text-red-500 text-xs italic">{errors.age}</span>}
                                                </div>
                                                
                                                {/* <div className="flex flex-col">
                                                    <label>Sampling Rate:</label>
                                                    <input type="number" className="border p-2 rounded" value={samplingRate} onChange={(e) => setSamplingRate(e.target.value)} />
                                                    {errors.samplingRate && <span className="text-red-500 text-xs italic">{errors.samplingRate}</span>}
                                                </div> */}
                                                <div className="flex flex-col">
                                                    <label>Start Time:</label>
                                                    <input type="number" className="border p-2 rounded" value={dStart} onChange={(e) => setDStart(e.target.value)} />
                                                    {errors.dStart && <span className="text-red-500 text-xs italic">{errors.dStart}</span>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <label>Stop Time:</label>
                                                    <input type="number" className="border p-2 rounded" value={dStop} onChange={(e) => setDStop(e.target.value)} />
                                                    {errors.dStop && <span className="text-red-500 text-xs italic">{errors.dStop}</span>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <label>Channel:</label>
                                                    <input type="text" className="border p-2 rounded" value={chn} onChange={(e) => setChn(e.target.value)} />
                                                    {errors.chn && <span className="text-red-500 text-xs italic">{errors.chn}</span>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <label>Clinical Diagnosis Codes (Optional):</label>
                                                    <input type="text" className="border p-2 rounded w-full" value={diagnosisCodes} onChange={(e) => setDiagnosisCodes(e.target.value)} placeholder="Enter codes separated by commas" />
                                                </div>
                                                
                                                <div className="md:col-span-2">
                                                    <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded w-full" 
                                                            onClick={handleUpload}
                                                            disabled={isLoading}>
                                                        {isLoading ? 'Analyzing...' : 'Upload and Analyze'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        </div>
                                </div>
                            </Collapse>
                            
                        </CardContent>
                    </Card>
                    <Card className="-mt-4">
                        <CardContent>
                            <Typography  variant="h6" className="text-gray-800 mb-2 h-6">
                                HHSA Spectrum Result
                            </Typography>
                            <Divider className="mb-4" />
                            
                            <HoloPlot holoData={image} isLoading={isLoading} userid={`${account.user._id}`} token={`${account.token}`}/>
    {/* 
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                <div className="md:col-span-2 w-full">
                                    {isLoading ? (
                                    <CircularProgress />
                                    ) : image ? (
                                    <HoloPlot holoData={image} onROISelected={setRoiCoords}/>
                                    ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        No result yet.
                                    </Typography>
                                    )}
                                </div>

                                <div className="w-full">
                                {image && (
                                    <div className="w-full max-w-md rounded-xl p-4 bg-gray-50 border border-gray-300 shadow-sm text-sm text-gray-800 space-y-2">
                                    <div className="font-semibold mb-2">Selected ROI</div>
                                
                                    <div className="space-y-2 text-sm text-gray-800">
                                    <div>
                                        <div className="text-gray-700 mb-1">FM Range:</div>
                                        <div className="flex flex-col space-y-1">
                                        {['x1', 'x2'].map((key) => (
                                            <div key={key} className="flex items-center space-x-1">
                                            <label className="w-8 capitalize text-gray-600">{key}:</label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={!isNaN(parseFloat(roiCoords?.[key])) ? parseFloat(roiCoords[key]).toFixed(2) : ''}
                                                onChange={(e) =>
                                                setRoiCoords({ ...roiCoords, [key]: parseFloat(e.target.value) || 0 })
                                                }
                                                className="w-16 border border-gray-300 rounded px-1 py-0.5 text-sm"
                                            />
                                            <span className="text-xs text-gray-500">
                                                ⇄ {isNaN(roiCoords?.[key]) ? '–' : toFreqLabel(roiCoords[key])}
                                            </span>
                                            </div>
                                        ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-gray-700 mb-1">AM Range:</div>
                                        <div className="flex flex-col space-y-1">
                                        {['y1', 'y2'].map((key) => (
                                            <div key={key} className="flex items-center space-x-1">
                                            <label className="w-8 capitalize text-gray-600">{key}:</label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={!isNaN(parseFloat(roiCoords?.[key])) ? parseFloat(roiCoords[key]).toFixed(2) : ''}
                                                onChange={(e) =>
                                                setRoiCoords({ ...roiCoords, [key]: parseFloat(e.target.value) || 0 })
                                                }
                                                className="w-16 border border-gray-300 rounded px-1 py-0.5 text-sm"
                                            />
                                            <span className="text-xs text-gray-500">
                                                ⇄ {isNaN(roiCoords?.[key]) ? '–' : toFreqLabel(roiCoords[key])}
                                            </span>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                    </div>

                                
                                    <div className="pt-2">
                                    <button
                                        onClick={() => handleAnalyzeROI(roiCoords)}
                                        disabled={!roiCoords?.x1}
                                        className={`w-full mt-2 px-3 py-1 rounded-md font-medium text-sm whitespace-nowrap ${
                                        roiCoords?.x1
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        }`}
                                    >
                                        Analyze ROI
                                    </button>
                                    </div>
                                </div>
                                
                                    )}

                                </div>
                            </div> */}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default SamplePage;
