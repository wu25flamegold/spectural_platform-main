import os
import subprocess
import time
from ctypes import WinDLL, c_wchar_p
from api.config import BaseConfig
from datetime import datetime
import os
from api.models import Users, Patients
from datetime import datetime
import pygetwindow as gw
import tempfile

def is_valid_edf(file_stream):
    file_stream.seek(0)  # 確保從開頭讀取
    header = file_stream.read(8)
    file_stream.seek(0)  # 讀完後重置位置以免影響後續儲存
    return header.strip() in [b'0', b'EDF', b'EDF+C', b'EDF+D']

def save_uploaded_file(file, save_dir):
    if not is_valid_edf(file.stream):
        raise ValueError("Invalid EDF file: Not a valid EDF header.")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    fname = file.filename[:-4]
    custom_filename = f"{fname}_{timestamp}.edf"
    file_path = os.path.join(save_dir, custom_filename)
    file.save(file_path)
    return file_path, fname, timestamp

def run_tmapi_processing(instance, selectedFunction, file, file_path, cmd, sampling_rate,
                         chn, d_start, d_stop, UserId, fname, timestamp):
    print('BaseConfig.PROCESSING_MODE', BaseConfig.PROCESSING_MODE)
    if BaseConfig.PROCESSING_MODE == "TMAPI":
        buf, buf_n = prepare_tmapi_data(
            instance, selectedFunction,
            file.filename if file_path else "",
            cmd, sampling_rate, chn, d_start, d_stop
        )
        result = instance.send_message(buf, buf_n, UserId)

    elif BaseConfig.PROCESSING_MODE == "process_request":
        result = instance.process_request(UserId, file_path, fs=sampling_rate, n=chn, start_index=d_start, end_index=d_stop)

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
        return tmapi.prepare_data("", cmd, sampling_rate, chn, d_start, d_stop, 4000, selectedFunction)

def open_tmapi_window(UserId):
    exe_path = r"C:\\Users\\admin\\Documents\\2024\\matlab_edf_server_for_json.exe"
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
                # 建立唯一 cache 資料夾
                unique_cache_path = os.path.join(
                    tempfile.gettempdir(),
                    f"mcrCache_{UserId}_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
                )
                os.makedirs(unique_cache_path, exist_ok=True)

                # 設定環境變數
                env = os.environ.copy()
                env["MCR_CACHE_ROOT"] = unique_cache_path

                # 啟動 MATLAB .exe 並給 cmd window 設標題
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
