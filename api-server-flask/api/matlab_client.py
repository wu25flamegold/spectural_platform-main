import numpy as np
import mmap
import time
import os
import struct
import matplotlib.pyplot as plt
from mpl_toolkits.axes_grid1 import make_axes_locatable
import pickle
import base64
import matplotlib.cm as cm
import matplotlib.colors as colors
from io import BytesIO
import matplotlib
import subprocess
import plotly.graph_objs as go
from flask import jsonify
import psutil
import ctypes
import pygetwindow as gw
from .config import BaseConfig
import tempfile
from datetime import datetime

matplotlib.use('Agg') 


class HoloVisualizer:
    def __init__(self, result):
        """
        初始化可視化類別。
        :param result: 來自 MATLAB 的數據，包括 FMscale, AMscale, SquareIdx, CLIM, HOLO, figureTitle1。
        """
        self.FMscale = result["FMscale"]
        self.AMscale = result["AMscale"]
        self.SquareIdx = result["SquareIdx"]
        self.CLIM = result["CLIM"]
        self.HOLO = result["HOLO"]
        self.figureTitle = result["figureTitle1"]


    def convert_numpy_types(self, obj):
        if isinstance(obj, dict):
            return {k: self.convert_numpy_types(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self.convert_numpy_types(i) for i in obj]
        elif isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        else:
            return obj

    def holo_show_with_dc(self, save_path=None):
        xmin = np.min(self.FMscale)
        xmax = np.max(self.FMscale)
        ymin = np.min(self.AMscale)
        ymax = np.max(self.AMscale)
        
        if self.AMscale.ndim == 1:
            AMscale_DC = np.insert(self.AMscale, 0, [self.AMscale[0] - 0.35, self.AMscale[0] - 0.1])
        else:
            AMscale_DC = np.insert(self.AMscale, 0, [self.AMscale[0] - 0.35, self.AMscale[0] - 0.1], axis=0)
        
        HOLO_DC = np.zeros((self.HOLO.shape[0] + 1, self.HOLO.shape[1]))
        HOLO_DC[1:, :] = self.HOLO
        HOLO_DC[0, :] = HOLO_DC[1, :] / 4
        HOLO_DC[1, :] = HOLO_DC[1, :] / 10
        
        ytickmin = np.ceil(ymin)
        ytickmax = np.floor(ymax)
        ytick_value = np.arange(ytickmin, ytickmax + 1)
        ytick_VALUE = 2 ** np.abs(ytick_value)
        ytick_value_with_dc = np.insert(ytick_value, 0, ytick_value[0] - 0.35)

        yLABEL = ['DC']
        for idx, ytick in enumerate(ytick_value):
            if ytick < 0:
                yLABEL.append(f'1/{ytick_VALUE[idx]}')
            else:
                yLABEL.append(str(ytick_VALUE[idx]))
        
        xtickmin = np.ceil(xmin)
        xtickmax = np.floor(xmax)
        xtick_value = np.arange(xtickmin, xtickmax + 1)
        xtick_VALUE = 2 ** np.abs(xtick_value)
        xLABEL = []
        for idx, xtick in enumerate(xtick_value):
            if xtick < 0:
                xLABEL.append(f'1/{xtick_VALUE[idx]}')
            else:
                xLABEL.append(str(xtick_VALUE[idx]))
        
        print("self.SquareIdx", self.SquareIdx)
        Z = HOLO_DC**self.SquareIdx

        custom_colorscale = [
            [0.00, 'white'],
            [0.001, 'rgb(0, 0, 127)'],
            [0.125, 'rgb(0, 0, 255)'],
            [0.25, 'rgb(0, 127, 255)'],
            [0.375, 'rgb(0, 255, 255)'],
            [0.5, 'rgb(127, 255, 127)'],
            [0.625, 'rgb(255, 255, 0)'],
            [0.75, 'rgb(255, 127, 0)'],
            [0.875, 'rgb(255, 0, 0)'],
            [1.0, 'rgb(127, 0, 0)']
        ]

        diag_line = dict(
            type='line',
            x0=xmin, x1=ymax,
            y0=xmin, y1=ymax,
            line=dict(color='black', width=1.8, dash='dot'),
        )

        horizontal_line = dict(
            type='line',
            x0=xmin,
            x1=xmax,
            y0=self.AMscale[0],
            y1=self.AMscale[0],
            line=dict(color='black', width=1.8, dash='dot'),
        )


        fig = go.Figure(
            data=[
                    go.Contour(
                        z=Z,
                        x=self.FMscale.tolist(),
                        y=AMscale_DC.tolist(),
                        zmin=0,
                        zmax=80,
                        colorscale=custom_colorscale,
                        contours=dict(
                            start=0,
                            end=80,
                            size=10,
                            coloring='heatmap'
                        ),
                        showscale=True, 
                        line=dict(width=0), 
                        opacity=0,
                        xaxis='x',  
                        yaxis='y' 
                    ),

                    go.Contour(
                        z=Z,
                        x=self.FMscale.tolist(),
                        y=AMscale_DC.tolist(),
                        zmin=0,
                        zmax=80,
                        colorscale=custom_colorscale,
                        contours=dict(
                            start=0,
                            end=900,
                            size=4,
                            coloring="lines",
                            showlines=True
                        ),
                        line=dict(width=1, color='black'),
                        showscale=False,  
                        hovertemplate='Holo: %{z:.2f} <extra></extra>'
                    )
                
            ],
            layout=go.Layout(
                title=dict(
                    text=save_path,
                    x=0.5,
                    xanchor='center',
                    yanchor='top'
                ),
                xaxis=dict(
                    title="FM (Hz)",
                    tickvals=xtick_value.tolist(), 
                    ticktext=xLABEL,               
                    showgrid=False,
                    zeroline=False,
                    range=[-3, 6], 
                    constrain='range',
                    constraintoward='center',      
                ),
                yaxis=dict(
                    title="AM (Hz)",
                    tickvals=ytick_value_with_dc.tolist(),
                    ticktext=yLABEL,
                    showgrid=False,
                    zeroline=False,
                    constraintoward='center',
                ),
                width=510,
                height=480,
                shapes=[diag_line, horizontal_line],
                plot_bgcolor='white',
                paper_bgcolor='white',
                margin=dict(
                    l=70,  
                    r=0,   
                    t=50,  
                    b=50   
                )
            )
        )

        fig.update_xaxes(range=[-3, 6])
        fig.update_yaxes(range=[-5, 5])  
        fig_json = fig.to_plotly_json()
        fig_json = self.convert_numpy_types(fig_json)

        return fig_json

    def hhsa_data(self, roi_coords):
        log_x1 = np.log2(roi_coords['x1'])
        log_x2 = np.log2(roi_coords['x2'])
        log_y1 = np.log2(roi_coords['y1'])
        log_y2 = np.log2(roi_coords['y2'])

        x_mask = (self.FMscale >= log_x1) & (self.FMscale <= log_x2)
        y_mask = (self.AMscale >= log_y1) & (self.AMscale <= log_y2)

        roi_z = self.HOLO[np.ix_(y_mask, x_mask)]



class MATLABSharedMemoryClient:
    def __init__(self, user_id):
        self.user_id = user_id
        self.buffer_size = 1024000
        self.file_path = rf"C:\HHSA_shared\buffer_{user_id}.dat"
        self.timeout = 120
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)

        if not os.path.exists(self.file_path):
            with open(self.file_path, "wb") as f:
                f.write(b"\x00" * self.buffer_size)

        # Open memory-mapped file
        self.mm = None
        self._open_memory_map()

    def _open_memory_map(self):
        with open(self.file_path, "r+b") as f:
            self.mm = mmap.mmap(f.fileno(), self.buffer_size)

    
    def send_request(self,  UserId, edf_filename="fa0019r0.edf", fs=200, n=10, start_index=220, end_index=240):
        """發送 EDF 文件名稱到 MATLAB 端並觸發計算"""
        self.mm[5] = 200
        while struct.unpack("B", self.mm[5:6])[0] != 200:
            print("Wait MATLAB server init...")
            time.sleep(0.2)
        edf_filename = os.path.abspath(edf_filename) 

        fs_bytes = struct.pack("<I", int(fs))
        n_bytes = struct.pack("<I", int(n))
        start_idx_bytes = struct.pack("<I", int(start_index))
        end_idx_bytes = struct.pack("<I", int(end_index))
        print("USERID")
        print(UserId)
        user_id_bytes = UserId.encode("utf-8")  
        user_id_bytes = user_id_bytes.ljust(8, b"\x00")  # use NULL (\x00) fill 8 bytes

        self.mm[5:] = b"\x00" * (self.buffer_size - 5)  # clean buffer

        offset = 6 
        self.mm[offset : offset + len(user_id_bytes)] = user_id_bytes
        offset += len(user_id_bytes)

        self.mm[offset : offset + len(fs_bytes)] = fs_bytes
        offset += len(fs_bytes)

        self.mm[offset : offset + len(n_bytes)] = n_bytes
        offset += len(n_bytes)

        self.mm[offset : offset + len(start_idx_bytes)] = start_idx_bytes
        offset += len(start_idx_bytes)

        self.mm[offset : offset + len(end_idx_bytes)] = end_idx_bytes
        offset += len(end_idx_bytes)

        self.mm[offset : offset + len(edf_filename)] = edf_filename.encode("utf-8")
        self.mm[0:4] = struct.pack("I", 1) 

        
        def debug_mm_buffer(mm):
            print("\n🧪 Debugging shared memory buffer...")

            offset = 6  

            user_id = mm[offset : offset + 8].decode("utf-8", errors="ignore").rstrip("\x00")
            print("UserId:", user_id)
            offset += 8

            fs = struct.unpack("<I", mm[offset : offset + 4])[0]
            offset += 4
            print("Sampling Rate (fs):", fs)

            n = struct.unpack("<I", mm[offset : offset + 4])[0]
            offset += 4
            print("Channel Index (n):", n)

            start_time = struct.unpack("<I", mm[offset : offset + 4])[0]
            offset += 4
            print("Start Time:", start_time)

            end_time = struct.unpack("<I", mm[offset : offset + 4])[0]
            offset += 4
            print("End Time:", end_time)

            filename = mm[offset :].split(b"\x00", 1)[0].decode("utf-8", errors="ignore")
            print("EDF Filename:", filename)

        debug_mm_buffer(self.mm)


    def wait_for_matlab(self):
        """等待 MATLAB 完成計算"""
        start_time = time.time()
        while struct.unpack("I", self.mm[0:4])[0] != 2:
            time.sleep(0.1)
            if time.time() - start_time > self.timeout:
                raise TimeoutError("MATLAB processing timeout!")
        print("Python: MATLAB buffer ready, reading data...")

    def read_data(self):
        """讀取 MATLAB 寫入的數據"""
        offset = 5

        num_fm = 80
        FMscale = np.frombuffer(self.mm[offset : offset + num_fm * 4], dtype=np.float32)
        offset += num_fm * 4

        num_am = 80
        AMscale = np.frombuffer(self.mm[offset : offset + num_am * 4], dtype=np.float32)
        offset += num_am * 4

        SquareIdx = struct.unpack("B", self.mm[offset : offset + 1])[0]
        offset += 1

        CLIM = np.frombuffer(self.mm[offset : offset + 2], dtype=np.uint8)
        offset += 2

        HOLO_size = (81, 80)  
        HOLO = np.frombuffer(
            self.mm[offset : offset + HOLO_size[0] * HOLO_size[1] * 8],
            dtype=np.float64,
        ).reshape(HOLO_size, order="F")
        offset += HOLO_size[0] * HOLO_size[1] * 8

        figureTitle_bytes = bytearray()
        while self.mm[offset] != 0: 
            figureTitle_bytes.append(self.mm[offset])
            offset += 1

        figureTitle1 = figureTitle_bytes.decode("utf-8")

        print("Python: 解析完成！")
        print(f"FMscale: {FMscale[:5]} ...") 
        print(f"AMscale: {AMscale[:5]} ...")
        print(f"SquareIdx: {SquareIdx}")
        print(f"CLIM: {CLIM}")
        print(f"HOLO shape: {HOLO.shape}")
        print(f"figureTitle1: {figureTitle1}")

        self.mm[0:4] = struct.pack("I", 0)
        print("Python: Data processed, buffer cleared.")

        return {
            "FMscale": FMscale,
            "AMscale": AMscale,
            "SquareIdx": SquareIdx,
            "CLIM": CLIM,
            "HOLO": HOLO,
            "figureTitle1": figureTitle1,
        }

    def plot_holo_contour(HOLO):
        fig, ax = plt.subplots(figsize=(10, 6))
        levels = np.linspace(np.min(HOLO), np.max(HOLO), 35)  
        HOLO = HOLO + 0.001
        contour = ax.contour(HOLO, levels=levels, cmap="jet")
        fig.colorbar(contour, ax=ax, label="Intensity")
        ax.set_xlabel("X-axis (Frequency)")
        ax.set_ylabel("Y-axis (Amplitude)")
        ax.set_title("HOLO Contour Plot")
        plt.show()
    
    def process_request(self, UserId, edf_filename="fa0019r0.edf", fs=200, n=10, start_index=220, end_index=240):
        """完整流程：發送請求 -> 等待 MATLAB -> 讀取數據"""
        self.send_request(UserId, edf_filename, fs, n, start_index, end_index)
        try:
            self.wait_for_matlab()
            return self.read_data()
        except TimeoutError:
            print("Timeout: MATLAB did not respond in time.")
            print("Restarting MATLAB Runtime...")
            return 0   
    
    def process_request_restart(self, UserId, edf_filename="fa0019r0.edf", fs=200, n=10, start_index=220, end_index=240):
        """完整流程：發送請求 -> 等待 MATLAB -> 讀取數據"""
        self.restart_tmapi_window(UserId)
        self.send_request(UserId, edf_filename, fs, n, start_index, end_index)
        try:
            self.wait_for_matlab()
            return self.read_data()
        except TimeoutError:
            print("Timeout: MATLAB did not respond in time.")
            return 0   

    def restart_tmapi_window(self, UserId):
        exe_path = r"C:\\Users\\admin\\Documents\\2024.0\\matlab_edf_server_for_json.exe"
        user32 = ctypes.WinDLL('user32', use_last_error=True)
        if BaseConfig.PROCESSING_MODE == "process_request":
            new_title = f"MATLAB_Server_{UserId}"
            windows = gw.getWindowsWithTitle(new_title)
            if windows:
                try:
                    # 取得舊視窗的 process id
                    hwnd = windows[0]._hWnd
                    pid = ctypes.c_ulong()
                    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
                    p = psutil.Process(pid.value)
                    p.kill()
                    print(f"✅ Killed old MATLAB process for {UserId}")
                    time.sleep(1)  # 稍等一下釋放資源
                except Exception as e:
                    print(f"⚠️ Failed to kill old MATLAB: {e}")
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
            else:
                return True, f"Analysis tool launched.", None




           
def split_specific_time_range():
    UserId = "0"
    exe_path = r"C:\Users\admin\Documents\2024\matlab_edf_server_for_json.exe"
    waitlist = [f for f in os.listdir("C:\\HhsaData\\tao_s\\") if f.endswith(".edf")]
    waitlisth = [f for f in os.listdir("C:\\HhsaData\\tao_h\\") if f.endswith(".edf")]

    for i in waitlist:
        print(i)
        process = subprocess.Popen(
            f'start cmd /k "title MATLAB_Server_{UserId} & {exe_path} {UserId}"',
            shell=True,
        )
        time.sleep(5)
        client = MATLABSharedMemoryClient('0')
        ff = "C:\\HhsaData\\tao_s\\" + i
        result = client.process_request('0', ff, fs=200, n=10, start_index=180, end_index=200)
        rr = "180result_" + i +".pkl"
        with open(rr, "wb") as f:
            pickle.dump(result, f)
        subprocess.run('taskkill /IM matlab_edf_server_for_json.exe /T /F', shell=True)

    for i in waitlisth:
        print(i)
        process = subprocess.Popen(
            f'start cmd /k "title MATLAB_Server_{UserId} & {exe_path} {UserId}"',
            shell=True,
        )
        time.sleep(5)
        client = MATLABSharedMemoryClient('0')
        ff = "C:\\HhsaData\\tao_h\\" + i
        result = client.process_request('0', ff, fs=200, n=10, start_index=180, end_index=200)
        rr = "180result_" + i +".pkl"
        with open(rr, "wb") as f:
            pickle.dump(result, f)
        subprocess.run('taskkill /IM matlab_edf_server_for_json.exe /T /F', shell=True)
    #########
    for i in waitlist:
        print(i)
        process = subprocess.Popen(
            f'start cmd /k "title MATLAB_Server_{UserId} & {exe_path} {UserId}"',
            shell=True,
        )
        time.sleep(5)
        client = MATLABSharedMemoryClient('0')
        ff = "C:\\HhsaData\\tao_s\\" + i
        result = client.process_request('0', ff, fs=200, n=10, start_index=300, end_index=320)
        rr = "300result_" + i +".pkl"
        with open(rr, "wb") as f:
            pickle.dump(result, f)
        subprocess.run('taskkill /IM matlab_edf_server_for_json.exe /T /F', shell=True)

    for i in waitlisth:
        print(i)
        process = subprocess.Popen(
            f'start cmd /k "title MATLAB_Server_{UserId} & {exe_path} {UserId}"',
            shell=True,
        )
        time.sleep(5)
        client = MATLABSharedMemoryClient('0')
        ff = "C:\\HhsaData\\tao_h\\" + i
        result = client.process_request('0', ff, fs=200, n=10, start_index=300, end_index=320)
        rr = "300result_" + i +".pkl"
        with open(rr, "wb") as f:
            pickle.dump(result, f)
        subprocess.run('taskkill /IM matlab_edf_server_for_json.exe /T /F', shell=True)
    #########
    for i in waitlist:
        print(i)
        process = subprocess.Popen(
            f'start cmd /k "title MATLAB_Server_{UserId} & {exe_path} {UserId}"',
            shell=True,
        )
        time.sleep(5)
        client = MATLABSharedMemoryClient('0')
        ff = "C:\\HhsaData\\tao_s\\" + i
        result = client.process_request('0', ff, fs=200, n=10, start_index=360, end_index=380)
        rr = "360result_" + i +".pkl"
        with open(rr, "wb") as f:
            pickle.dump(result, f)
        subprocess.run('taskkill /IM matlab_edf_server_for_json.exe /T /F', shell=True)

    for i in waitlisth:
        print(i)
        process = subprocess.Popen(
            f'start cmd /k "title MATLAB_Server_{UserId} & {exe_path} {UserId}"',
            shell=True,
        )
        time.sleep(5)
        client = MATLABSharedMemoryClient('0')
        ff = "C:\\HhsaData\\tao_h\\" + i
        result = client.process_request('0', ff, fs=200, n=10, start_index=360, end_index=380)
        rr = "360result_" + i +".pkl"
        with open(rr, "wb") as f:
            pickle.dump(result, f)
        subprocess.run('taskkill /IM matlab_edf_server_for_json.exe /T /F', shell=True)
    

if __name__ == "__main__":
    split_specific_time_range()
    