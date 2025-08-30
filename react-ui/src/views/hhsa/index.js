import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { updateUsage } from './../../store/actions';
import clsx from 'clsx';
import HoloPlot from './Holoplot';
import FadeMessage from './FadeMessage';
import UsageTooltip from './UsageTooltip';
import HistoryFileSelector from './HistoryFileSelector';
import { clearRoiResult } from './../../store/roiSlice';
import { useRef } from 'react';
import { format } from 'date-fns';
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
    const [selectedHistoryFile, setSelectedHistoryFile] = useState("");
    const [cmd, setCmd] = useState("");
    const [file, setFile] = useState(null);
    const [chn, setChn] = useState(1);
    const [age, setAge] = useState(30);
    const [gender, setGender] = useState("M");
    const [diagnosisCodes, setDiagnosisCodes] = useState("");
    const [dStart, setDStart] = useState(0.0);
    const [dStop, setDStop] = useState(30.0);
    const [image, setImage] = useState(null);
    const [filePath, setFilePath] = useState("");
    const [historyFiles, setHistoryFiles] = useState([]);
    const [selectedFunction, setSelectedFunction] = useState('f2');
    const [showInputs, setShowInputs] = useState(true);
    const [finalFilename, setFinalFilename] = useState('');
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [edfMeta, setEdfMeta] = useState({
                                    num_signals: null,
                                    fs: null,
                                    duration: null,
                                    records: null
                                  });
    const historySelectorRef = useRef();
    const dispatch = useDispatch();
    const account = useSelector((state) => state.account);
    const parseTimeout = useRef(null);

    const handleFileChange = (e) => {  
        const selectedFile = e.target.files[0];
        const maxSizeMB = 1000;
    
        console.log('selectedFile', selectedFile)
        const isEDF = selectedFile.name.toLowerCase().endsWith('.edf');
        if (!isEDF) {
            setErrors(prev => ({ ...prev, file: "Only .EDF files are allowed." }));
            setFile(null);
            return;
        }

        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            setErrors(prev => ({ ...prev, file: `File size exceeds ${maxSizeMB}MB limit.` }));
            setFile(null);
            return;
        }
        console.log('AselectedFile', selectedFile)

        setFile(selectedFile);
        setErrors(prev => ({ ...prev, file: "" }));
    
        clearTimeout(parseTimeout.current);
        console.log('BselectedFile', selectedFile)

        parseTimeout.current = setTimeout(async () => {
            try {
                const sliceSize = 8192; 
                const headerSlice = selectedFile.slice(0, sliceSize);
                const arrayBuffer = await headerSlice.arrayBuffer();
                const decoder = new TextDecoder("ascii");

                const numSignalsStr = decoder.decode(arrayBuffer.slice(252, 256)).trim();
                const numSignals = parseInt(numSignalsStr);

                const durationStr = decoder.decode(arrayBuffer.slice(244, 252)).trim();
                const durationPerRecord = parseFloat(durationStr);

                const numRecordsStr = decoder.decode(arrayBuffer.slice(236, 244)).trim();
                const numRecords = parseInt(numRecordsStr);

                let signalHeaderBytesGuess = 256; 
                const possibleOffsets = [256, 216, 192, 200];

                let fs = null;
                let samplesPerRecord = [];

                for (const guess of possibleOffsets) {
                try {
                    const samplesStart = 256 + numSignals * guess;
                    samplesPerRecord = [];
                    for (let i = 0; i < numSignals; i++) {
                    const start = samplesStart + i * 8;
                    const val = decoder.decode(arrayBuffer.slice(start, start + 8)).trim();
                    samplesPerRecord.push(parseInt(val));
                    }

                    fs = samplesPerRecord[0] / durationPerRecord;
                    if (!isNaN(fs) && fs > 0 && fs < 10000) {
                    signalHeaderBytesGuess = guess;
                    break;
                    }
                } catch (e) {
                    continue;
                }
                }

                if (fs === null) throw new Error("Cannot determine EDF signal header structure.");

                const totalDuration = durationPerRecord * numRecords;


                console.log("samplesPerRecord[0]:", samplesPerRecord[0], "durationPerRecord:", durationPerRecord);
                console.log(numSignals, fs, totalDuration, numRecordsStr)
                setEdfMeta({
                    num_signals: numSignals,
                    fs: fs,
                    duration: totalDuration,
                    records: numRecordsStr
                });
                setMessage("Upload file successfully");
            } catch (error) {
                console.error("Failed to parse EDF header:", error);
                setMessage("Failed to parse EDF header");
            }
        }, 500);
    };
    
    useEffect(() => {
        handleOpenMatlab();
    }, []);

    useEffect(() => {
        const fetchHistoryFiles = async () => {
            setIsHistoryLoading(true);
            try {
                const response = await axios.post('http://xds3.cmbm.idv.tw:81/tmapi/list_history_files', {
                    token: `${account.token}`
                }, {
                    headers: {
                        Authorization: `${account.token}`,
                        UserId: `${account.user._id}`
                    }
                });
                setHistoryFiles(response.data.files);
            } catch (error) {
                console.error('Failed to load history files:', error?.response?.data?.message || error);
            } finally {
                setIsHistoryLoading(false);
            }
        };
    
        fetchHistoryFiles();
    }, []);
    

    const handleSelectHistoryFile = async (selectedFileName) => {
        try {
            const selected = historyFiles.find(f => f.stored_name === selectedFileName);
            if (!selected) return;
    
            const response = await axios.post(
                'http://xds3.cmbm.idv.tw:81/tmapi/get-history-file',
                { filename: selectedFileName },
                {
                    headers: {
                        Authorization: `${account.token}`,
                        UserId: `${account.user._id}`
                    }
                }
            );
    
            const filePath = response.data.file_path;
            setFilePath(filePath);
        } catch (error) {
            console.error('Failed to retrieve file path:', error?.response?.data?.message || error);
        }
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
            setMessage(error?.response?.data?.message || error.message || 'Unknown error');
        }
    };

    useEffect(() => {
        if (file) {
            setFilePath(null);            
            historySelectorRef.current?.reset();
          }
    }, [file]);
    
    useEffect(() => {
        if (filePath) setFile(null);
    }, [filePath]);

    const handleUpload = async () => {
        const errors = validateInputs();
        const CHUNK_SIZE = 20 * 1024 * 1024;
        const MAX_CONCURRENT_UPLOADS = 2;
    
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }
    
        if (!file && !filePath) {
            alert("Please upload a file or select from history.");
            return;
        }
    
        setErrors({});
        setIsLoading(true);
        dispatch(clearRoiResult());
    
        try {
            let filename = "";
            let totalChunks = 0;
            if (file) {
                totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                filename = `${Date.now()}_${file.name}`;
    
                let currentChunk = 0;
                const uploadChunk = async (i) => {
                    const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                    const formData = new FormData();
                    formData.append("chunk", chunk);
                    formData.append("filename", filename);
                    formData.append("chunkIndex", i);
                    formData.append("totalChunks", totalChunks);
                    await axios.post("http://xds3.cmbm.idv.tw:81/tmapi/upload_chunk", formData, {
                        headers: {
                            Authorization: `${account.token}`,
                            UserId: `${account.user._id}`
                        }
                    });
                };
    
                const parallelUploads = async () => {
                    while (currentChunk < totalChunks) {
                        const uploads = [];
                        for (let i = 0; i < MAX_CONCURRENT_UPLOADS && currentChunk < totalChunks; i++, currentChunk++) {
                            uploads.push(uploadChunk(currentChunk));
                        }
                        await Promise.all(uploads);
                    }
                };
    
                await parallelUploads();
            }
    
            const sendFormData = new FormData();
            if (file) {
                sendFormData.append("filename", filename);
                sendFormData.append("totalChunks", totalChunks);
            } else if (filePath) {
                sendFormData.append("history_file_path", filePath);
            }
    
            sendFormData.append("remote_wnd_name", remoteWndName);
            sendFormData.append("cmd", cmd);
            sendFormData.append("chn", chn.toString());
            sendFormData.append("sampling_rate", edfMeta.fs);
            sendFormData.append("d_start", dStart);
            sendFormData.append("d_stop", dStop);
            sendFormData.append("selectedFunction", selectedFunction);
            sendFormData.append("email", account.user.email);
            sendFormData.append("usage", account.user.usage);
            sendFormData.append("age", age.toString());
            sendFormData.append("gender", gender);
            sendFormData.append("clinical_diagnosis_code", diagnosisCodes);
    
            const response = await axios.post("http://xds3.cmbm.idv.tw:81/tmapi/send_command", sendFormData, {
                headers: {
                    Authorization: `${account.token}`,
                    UserId: `${account.user._id}`
                }
            });
    
            if (response.data.success) {
                setShowInputs(false);
                setImage(response.data.image);
                dispatch(updateUsage(response.data.usage));
                let lebal_name = response.data.label
                console.log("LABEL", lebal_name)
                console.log("LABELNAME", lebal_name[chn - 1])

                let finalFileName = "";
                if (file) {
                    finalFileName = filename;
                } else if (filePath) {
                    const parts = filePath.split(/[\\/]/).filter(Boolean);
                    finalFileName = parts[parts.length - 1] || "";
                }
                const cleanedFileName = finalFileName.includes('_') ? finalFileName.split('_').slice(1).join('_') : finalFileName;
                const plotTitle = `${cleanedFileName} (${lebal_name[chn - 1]}) [${Number(dStart).toFixed(1)}s–${Number(dStop).toFixed(1)}s]`;
                setFinalFilename(plotTitle); 

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
    

    const validateInputs = () => {
        const errors = {};
        if (!gender) errors.gender = "Gender is required.";
        if (!age || isNaN(age) || age <= 0 || !/^\d+$/.test(age)) errors.age = "Age must be a positive number.";
        if (!file && !filePath) {
            errors.file = "Please upload a file or select a previous file.";
          }
        
          if (file) {
            const fileExtension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
            if (fileExtension !== ".edf") {
              errors.file = "Only .edf files are allowed.";
            }
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
            <div className="px-1 sm:px-4">
                <div className="bg-white rounded-lg shadow px-0 py-2 flex flex-col gap-6">
                    <Card elevation={0} className="rounded-lg relative overflow-visible z-10">
                        <CardContent>
                            {/* Header with toggle */}
                            <div className="flex justify-between items-center mb-2 h-6">
                                <Typography variant="h6" className="text-gray-800">
                                    Upload file for Analyzing
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
                                <div className="flex flex-col gap-6 ">
                                    <div
                                        className={`transition-all duration-500 ease-in-out overflow-visible ${
                                            showInputs ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >

                                        <UsageTooltip />

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                            {/* Left: Upload UI */}
                                            <div className="col-span-1 bg-white border rounded p-4 flex flex-col items-center justify-center">
                                                {file ? (
                                                    <div className="flex flex-col items-center gap-4">
                                                    <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 20 20" stroke="currentColor">
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
                                                                <span className="font-sans">Sample Rate:</span>{' '}
                                                                <span className="text-blue-600 font-sans">{edfMeta.fs} Hz</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-sans">Total Duration:</span>{' '}
                                                                <span className="text-blue-600 font-sans">{edfMeta.duration} s</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-sans">Channel Counts:</span>{' '}
                                                                <span className="text-blue-600 font-sans">{edfMeta.num_signals}</span>
                                                            </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                ) : (
                                                    <label
                                                        htmlFor="fileUpload"
                                                        className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition duration-200"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m5 4v12m0 0l4-4m-4 4l-4-4" />
                                                        </svg>
                                                        <span className="text-xs mt-1">Upload .EDF file</span>
                                                        <span className="text-xs text-gray-400">(Max file size: 50MB)</span>

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
                                                {/* Divider and dropdown selector for history */}
                                                <div className="relative overflow-visible z-0 w-full mt-2">
                                                <div className="relative overflow-visible z-0 flex items-center justify-center text-sm text-gray-400 my-2">
                                                    <div className="flex-grow border-t border-gray-200" />
                                                        <span className="px-3 text-gray-500">OR</span>
                                                    <div className="flex-grow border-t border-gray-200" />
                                                    </div>
                                                    
                                                    <div className="relative overflow-visible z-0 w-full px-2 pt-2">
                                                        <HistoryFileSelector
                                                            ref={historySelectorRef}
                                                            historyFiles={historyFiles}
                                                            onSelect={(filename) => {
                                                                if (filename === null) {
                                                                setFilePath(null);
                                                                } else {
                                                                handleSelectHistoryFile(filename);
                                                                }
                                                            }}
                                                            onDelete={async (filename) => {
                                                                await axios.post("/tmapi/delete_history_file", {
                                                                filename,
                                                                }, {
                                                                headers: {
                                                                    Authorization: account.token,
                                                                    UserId: account.user._id,
                                                                }
                                                                });
                                                                setHistoryFiles(prev => prev.filter(f => f.stored_name !== filename));
                                                            }}
                                                            />


                                                    </div>



                                                </div>

                                            </div>

                                            {/* Right: Other inputs and submit */}
                                            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pl-1 md:pl-0">
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
                                                        {isLoading ? 'Analyzing...' : 'Run Analysis'}
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
                            <HoloPlot holoData={image} isLoading={isLoading} userid={`${account.user._id}`} token={`${account.token}`} fileName={finalFilename}/>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default SamplePage;
