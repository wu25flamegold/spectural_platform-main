import ctypes
import os
import subprocess
import time
from ctypes import WinDLL, c_wchar_p
from api.config import BaseConfig
import os
from api.models import Users, Patients
from datetime import datetime
import pygetwindow as gw
import tempfile
from EDFlib import EDFwriter
import numpy as np
import os
from datetime import datetime
import numpy as np
import psutil

SAVE_EDF_DIR = r"C:\EDFData"
def is_valid_edf(file_stream):
    file_stream.seek(0)
    header = file_stream.read(8)
    file_stream.seek(0) 
    return header.strip() in [b'0', b'EDF', b'EDF+C', b'EDF+D']

def run_tmapi_processing(instance, selectedFunction, file_path, cmd, sampling_rate,
                         chn, d_start, d_stop, UserId, fname, timestamp):
    print('BaseConfig.PROCESSING_MODE', BaseConfig.PROCESSING_MODE)
    if BaseConfig.PROCESSING_MODE == "TMAPI":
        buf, buf_n = prepare_tmapi_data(
            instance, selectedFunction,
            fname if file_path else "",
            cmd, sampling_rate, chn, d_start, d_stop
        )
        result = instance.send_message(buf, buf_n, UserId)

    elif BaseConfig.PROCESSING_MODE == "process_request":
        result = instance.process_request(UserId, file_path, fs=sampling_rate, n=chn, start_index=d_start, end_index=d_stop)
        if result == 0:
            result = instance.process_request_restart(UserId, file_path, fs=sampling_rate, n=chn, start_index=d_start, end_index=d_stop)
    else:
        raise ValueError(f"Unknown PROCESSING_MODE: {BaseConfig.PROCESSING_MODE}")

    return result

def generate_result_image(result, tmapi, fname, timestamp, UserId):
    if BaseConfig.PROCESSING_MODE == "TMAPI":
        return tmapi.process_queue(fname, timestamp)

    elif BaseConfig.PROCESSING_MODE == "process_request":
        from api.matlab_client import HoloVisualizer
        visualizer = HoloVisualizer(result)
        return visualizer.holo_show_with_dc()

    else:
        return None

def create_patient_record(form, user_id, file_path, sampling_rate, d_start, d_stop,
                          hhsa_path, formatted_timestamp, chn):
    return Patients(
        age=int(form['age']),
        gender=form['gender'],
        edf_file_path=file_path,
        sample_rate=sampling_rate,
        start_time=d_start,
        end_time=d_stop,
        clinical_diagnosis_code=form['clinical_diagnosis_code'],
        picture_path=hhsa_path,
        create_user=user_id,
        uploaded_at=formatted_timestamp,
        channel=chn
    )

def prepare_tmapi_data(tmapi, selectedFunction, file_name, cmd, sampling_rate, chn, d_start, d_stop):
    if selectedFunction == "":
        return tmapi.prepare_data(file_name, cmd, sampling_rate, chn, d_start, d_stop)
    else:
        return tmapi.prepare_data("", cmd, sampling_rate, chn, d_start, d_stop, 1000, selectedFunction)

def open_tmapi_window(UserId):
    exe_path = r"C:\\Users\\admin\\Documents\\2024.0\\matlab_edf_server_for_json.exe"
    tmapiPath = r"C:\\Users\\admin\\Desktop\\v026\\TMAPI.exe"
    user32 = WinDLL('user32', use_last_error=True)
    if BaseConfig.PROCESSING_MODE == "TMAPI":
        new_title = f"TMAP_{UserId}"

        try:
            hwnd_existed = user32.FindWindowW(None, new_title)
            if hwnd_existed:
                return True, "TMAPI opened successfully", None

            process = subprocess.Popen(
                tmapiPath,
                shell=True,
                creationflags=subprocess.CREATE_NEW_CONSOLE
            )
            time.sleep(1)
            hwnd = user32.FindWindowW(None, "TMAPI")
            if hwnd:
                user32.SetWindowTextW(hwnd, c_wchar_p(new_title))
                return True, f"TMAPI opened successfully as {new_title}", process
            else:
                return False, "TMAPI window not found after launching", None
        except Exception as e:
            return False, f"Failed to open TMAPI: {e}", None
    elif BaseConfig.PROCESSING_MODE == "process_request":
        new_title = f"MATLAB_Server_{UserId}"
        windows = gw.getWindowsWithTitle(new_title)
        if windows:
            return True, f"Analysis tool launched.", None
        else:
            try:
                unique_cache_path = os.path.join(
                    tempfile.gettempdir(),
                    f"mcrCache_{UserId}_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
                )
                os.makedirs(unique_cache_path, exist_ok=True)

                env = os.environ.copy()
                env["MCR_CACHE_ROOT"] = unique_cache_path

                process = subprocess.Popen(
                    f'start cmd /k "title {new_title} & {exe_path} {UserId}"',
                    shell=True,
                    env=env
                )

                time.sleep(1)

                window_str = r"C:\WINDOWS\system32\cmd.exe - " + exe_path
                hwnd_cmd = user32.FindWindowW("ConsoleWindowClass", window_str)
                hwnd_child = user32.FindWindowExW(hwnd_cmd, 0, None, None)
                if hwnd_child:
                    user32.SetWindowTextW(hwnd_child, new_title)

                return True, f"Analysis tool launched.", process

            except Exception as e:
                return False, f"Oops! Something went wrong: {e}", None



def write_signal_to_edf(selectedFunction, fs, UserId):
    fs = int(fs)
    generator_map = {
        'f1': generate_f1_signal,
        'f2': generate_f2_signal,
        'f3': generate_f3_signal,
        'f4': generate_f4_signal,
        'f5': generate_f5_signal,
        'f6': generate_f6_signal,
    }

    if selectedFunction not in generator_map:
        raise ValueError(f"Unknown function: {selectedFunction}")

    signal = generator_map[selectedFunction](fs=200, signal_size=4000).astype(np.float64)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{selectedFunction}_{timestamp}.edf"
    file_path = os.path.join(SAVE_EDF_DIR, filename)

    writer = EDFwriter(file_path, 1, 1)
    writer.setSignalLabel(0, selectedFunction)
    writer.setPhysicalDimension(0, 'uV')
    writer.setSampleFrequency(0, fs)               
    writer.setDataRecordDuration(1000000)      
    writer.setPhysicalMinimum(0, -1.0)
    writer.setPhysicalMaximum(0, 1.0)
    writer.setDigitalMinimum(0, -32768)
    writer.setDigitalMaximum(0, 32767)
    writer.setTransducer(0, '')
    writer.setPreFilter(0, '')
    
    now = datetime.now()
    writer.setStartDateTime(now.year, now.month, now.day, now.hour, now.minute, now.second, 0)
    print(f"[INFO] Signal length: {len(signal)} samples")
    
    #writer.writeSamples(signal)
    for i in range(20):
        writer.writeSamples(signal[i*fs:(i+1)*fs])
    writer.close()
    return timestamp, filename, file_path 


def generate_f1_signal(fs=200, signal_size=400000):
    t = np.arange(signal_size) / fs
    return (np.sin(8.0 * np.pi * t / fs) ** 2) * np.cos(1.0 * 2 * np.pi * t)


def generate_f2_signal(fs=200, signal_size=400000):
    t = np.arange(signal_size) / fs
    return np.sin(4 * np.pi * t)

def generate_f3_signal(fs=200, signal_size=400000):
    t = np.arange(signal_size) / fs
    return 0.5 * (np.sin(1.0 * 2 * np.pi * t) + 1) / 2 * np.sin(8.0 * 2 * np.pi * t)

def generate_f4_signal(fs=200, signal_size=400000):
    t = np.arange(signal_size) / fs
    return (np.sin(1.0 * 2 * np.pi * t) + 1) / 2 * np.sin(8.0 * 2 * np.pi * t)

def generate_f5_signal(fs=200, signal_size=400000):
    t = np.arange(signal_size) / fs
    return (np.sin(0.25 * 2 * np.pi * t) + 1) / 2 * np.sin(2 * 2 * np.pi * t)

def generate_f6_signal(fs=200, signal_size=400000):
    return generate_f4_signal(fs, signal_size) + generate_f5_signal(fs, signal_size)


def generate_f7_signal(fs=200, signal_size=400000):
    t = np.arange(signal_size) / fs
    return 0.5 * np.sin(2 * np.pi * 2 * t) + np.sin(2 * np.pi * 1.5 * t) * np.sin(2 * np.pi * 14 * t)
