import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { updateUsage } from './../../store/actions';
import Waveform from './Waveform';
import { CircularProgress } from '@material-ui/core';
import '../../assets/scss/style.scss';
import FadeMessage from './../hhsa/FadeMessage';

const SimulateSignalPage = () => {
    const [remoteWndName, setRemoteWndName] = useState("");
    const [selectedTab, setSelectedTab] = useState(0);
    const [cmd, setCmd] = useState("");
    const [file, setFile] = useState(null);
    const [chn, setChn] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [diagnosisCodes, setDiagnosisCodes] = useState("");
    const [signalSize, setSignalSize] = useState(4000);
    const [samplingRate, setSamplingRate] = useState(200.0);
    const [message, setMessage] = useState(null);
    const [dStart, setDStart] = useState(0.0);
    const [dStop, setDStop] = useState(0.0);
    const [image, setImage] = useState(null);
    const [selectedFunction, setSelectedFunction] = useState('f2');
    const [waveform, setWaveform] = useState(null);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const account = useSelector((state) => state.account);

    const handleFileChange = (e) => {
        setErrors(prev => ({ ...prev, file: "" }));
        setFile(e.target.files[0]);
    };

    const handleFunctionChange = (event) => {
        setSelectedFunction(event.target.value);
    };

    const generateWaveform = () => {
        const functions = {
            f2: (i) => 1 * Math.sin(8 * 2 * Math.PI * i / samplingRate),
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
            formData.append('sampling_rate', samplingRate);
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
        if (!samplingRate || isNaN(samplingRate) || samplingRate <= 0 || !/^(0|[1-9]\d*)(\.\d+)?$/.test(samplingRate)) errors.samplingRate = "Sampling Rate must be a positive number.";
        if (!dStart || isNaN(dStart) || dStart < 0 || !/^(0|[1-9]\d*)(\.\d+)?$/.test(dStart)) errors.dStart = "Start Time must be a non-negative number.";
        if (!dStop || isNaN(dStop) || dStop <= 0 || dStop <= dStart || !/^(0|[1-9]\d*)(\.\d+)?$/.test(dStop)) errors.dStop = "Stop Time must be greater than Start Time.";
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
                
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex flex-col gap-4">
                            <label>Signal Size:</label>
                            <input type="number" className="border p-2 rounded" value={signalSize} onChange={(e) => setSignalSize(e.target.value)} />
                            <label>Sampling Rate:</label>
                            <input type="number" className="border p-2 rounded" value={samplingRate} onChange={(e) => setSamplingRate(e.target.value)} />
                            <div>
                                <label className="font-semibold">Functions</label>
                                <div className="flex flex-col gap-2 mt-2">
                                    {["f2", "f3", "f4", "f5", "f6"].map(f => (
                                        <label key={f} className="flex items-center gap-2">
                                            <input type="radio" name="function" value={f} checked={selectedFunction === f} onChange={handleFunctionChange} /> {f}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleUpload}>Generate Signal</button>
                        </div>
                        <div className="flex-[3]">
                            {waveform && <Waveform data={waveform.data} title={waveform.title} />}
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default SimulateSignalPage;
