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

matplotlib.use('Agg')  # 使用非 GUI 後端


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
        #HOLO_DC = HOLO_DC + 0.001
        
        # fig, ax = plt.subplots(figsize=(15, 15))
        
        # contour = ax.contour(self.FMscale, AMscale_DC, HOLO_DC**self.SquareIdx, levels=np.linspace(0, 80, 11), cmap='jet', vmin=0, vmax=80)
        # contour.set_clim(self.CLIM**self.SquareIdx)
        # norm = colors.Normalize(vmin=0, vmax=80)
        # sm = cm.ScalarMappable(cmap="jet", norm=norm)
        # sm.set_array([])  # 這是為了讓 `colorbar` 正常顯示

        # divider = make_axes_locatable(ax)
        # cax = divider.append_axes("right", size="5%", pad=0.05)
        # cbar = fig.colorbar(sm, cax=cax)
        # ax.set_xlabel('FM(Hz)', fontname='Times New Roman', fontsize=13)
        # ax.set_ylabel('AM(Hz)', fontname='Times New Roman', fontsize=13)
        # ax.set_title(self.figureTitle, fontname='Times New Roman', fontsize=20, fontweight='bold')
        
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
        # ax.set_yticks(np.insert(ytick_value, 0, ytick_value[0] - 0.35))
        # ax.set_yticklabels(yLABEL, fontsize=12)
        
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
        # ax.set_xticks(xtick_value)
        # ax.set_xticklabels(xLABEL, fontsize=12)
        
        # ssx = np.linspace(xmin, ymax)
        # ssy = ssx
        # contour.set_clim(0, 80)  # 限制 colorbar 數值範圍
        # cbar.mappable.set_clim(0, 80)  # 這會真正限制 colorbar 只顯示 0~100
        # cbar.ax.set_yticks(np.linspace(0, 80, num=11))
        
        # ax.plot(ssx, ssy, ':', color=[0, 0, 0], linewidth=1.8)
        # ax.plot(self.FMscale, self.AMscale[0] * np.ones_like(self.FMscale), ':', color=[0, 0, 0], linewidth=1.8)        
        # img_buffer = BytesIO()
        # fig.savefig(img_buffer, format="png", dpi=300, bbox_inches="tight")
        # plt.close(fig)  # 釋放記憶體
        # img_buffer.seek(0)
        # img_str = base64.b64encode(img_buffer.getvalue()).decode("utf-8")

        # # **如果指定了 save_path，則存為 PNG**
        # if save_path:
        #     with open(save_path, "wb") as f:
        #         f.write(img_buffer.getvalue())
        print("self.SquareIdx", self.SquareIdx)
        Z = HOLO_DC**self.SquareIdx
        #Z = Z - 10
        #Z = np.nan_to_num(HOLO_DC ** self.SquareIdx, nan=0.0, posinf=80.0, neginf=0.0)

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
                    # 底層：Heatmap 隱形但顯示 colorbar
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
                        showscale=True,  # 顯示 colorbar
                        line=dict(width=0),  # 不畫線條
                        opacity=0,
                        xaxis='x',  # 強制綁定 x
                        yaxis='y'   # 強制綁定 y  # 不畫圖，只是為了 colorbar
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
                            end=200,
                            size=4,
                            coloring="lines",
                            showlines=True
                        ),
                        line=dict(width=1, color='black'),
                        showscale=False,  # 第二層不要顯示 colorbar,
                        hovertemplate='Holo: %{z:.2f} <extra></extra>'
                    )
                
            ],
            layout=go.Layout(
                xaxis=dict(
                    title="FM (Hz)",
                    tickvals=xtick_value.tolist(),  # Tick 的實際位置
                    ticktext=xLABEL,                # 顯示的文字（對應 tickvals）
                    showgrid=False,
                    zeroline=False,
                    range=[-3, 6], 
                    constrain='range',
                    constraintoward='center',       # 拖到邊界會怎麼處理（向內保留中心）
                ),
                yaxis=dict(
                    title="AM (Hz)",
                    tickvals=ytick_value_with_dc.tolist(),
                    ticktext=yLABEL,
                    showgrid=False,
                    zeroline=False,
                    constraintoward='center',
                ),
                width=540,
                height=480,
                shapes=[diag_line, horizontal_line],
                plot_bgcolor='white',
                paper_bgcolor='white',
                margin=dict(
                    l=70,   # left
                    r=0,   # right
                    t=30,   # top（這裡設定小一點會往上）
                    b=50    # bottom
                )
            )
        )

        fig.update_xaxes(range=[-3, 6])
        fig.update_yaxes(range=[-5, 5])  
        fig_json = fig.to_plotly_json()
        fig_json = self.convert_numpy_types(fig_json)

        return fig_json

    def hhsa_data(self, roi_coords):
        # 將 Hz 值轉換為對數座標（因為 HOLO 是對數尺度）
        log_x1 = np.log2(roi_coords['x1'])
        log_x2 = np.log2(roi_coords['x2'])
        log_y1 = np.log2(roi_coords['y1'])
        log_y2 = np.log2(roi_coords['y2'])

        # 找出落在 ROI 區間內的索引範圍
        x_mask = (self.FMscale >= log_x1) & (self.FMscale <= log_x2)
        y_mask = (self.AMscale >= log_y1) & (self.AMscale <= log_y2)

        # ROI 對應的 Z 區塊
        roi_z = self.HOLO[np.ix_(y_mask, x_mask)]



class MATLABSharedMemoryClient:
    def __init__(self, user_id):
        self.user_id = user_id
        self.buffer_size = 1024000
        self.file_path = rf"C:\HHSA_shared\buffer_{user_id}.dat"
        self.timeout = 60
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)

        # 初始化共享記憶體文件
        if not os.path.exists(self.file_path):
            with open(self.file_path, "wb") as f:
                f.write(b"\x00" * self.buffer_size)

        # 開啟 memory-mapped file
        self.mm = None
        self._open_memory_map()

    def _open_memory_map(self):
        """開啟 memory-mapped 檔案"""
        with open(self.file_path, "r+b") as f:
            self.mm = mmap.mmap(f.fileno(), self.buffer_size)

    def validate_edf_by_header_only(self, edf_path, n, start_index, end_index, fs):
        if not os.path.exists(edf_path):
            return False, f"❌ 找不到檔案：{edf_path}"
        try:
            # 取得檔案大小
            filesize = os.path.getsize(edf_path)

            # 讀通道數（第 252-255 字元為 ASCII 數字）
            with open(edf_path, 'rb') as f:
                f.seek(252)
                num_signals = int(f.read(4).decode().strip())

            # 計算可用長度（秒）
            header_size = 256 + num_signals * 256
            bytes_per_sample = 2
            bytes_per_second = fs * num_signals * bytes_per_sample
            data_bytes = filesize - header_size
            total_seconds = data_bytes / bytes_per_second

            print(f"📊 通道數：{num_signals}")
            print(f"⏱️ 檔案長度：約 {total_seconds:.2f} 秒")

            if n < 1 or n > num_signals:
                return False, f"❌ 通道 index ({n}) 超出範圍，僅有 {num_signals} 通道"

            if start_index < 0 or end_index <= start_index:
                return False, "❌ 時間區間無效，start_index 必須小於 end_index 且皆為正整數"

            if end_index > total_seconds:
                return False, f"❌ 結束時間 {end_index}s 超出檔案總長 {total_seconds:.2f}s"

            return True, None  # ✅ 驗證成功
        except Exception as e:
            return False, f"❌ 驗證時發生錯誤：{str(e)}"

    def send_request(self,  UserId, edf_filename="fa0019r0.edf", fs=200, n=10, start_index=220, end_index=240):
        """發送 EDF 文件名稱到 MATLAB 端並觸發計算"""
        
        edf_filename = os.path.abspath(edf_filename)  # 取得完整絕對路徑

        #print(f"Python: 發送請求 `{edf_filename}` 給 MATLAB...")
        fs_bytes = struct.pack("<I", int(fs))
        n_bytes = struct.pack("<I", int(n))
        start_idx_bytes = struct.pack("<I", int(start_index))
        end_idx_bytes = struct.pack("<I", int(end_index))
        print("USERID")
        print(UserId)
        user_id_bytes = UserId.encode("utf-8")  # 直接轉 UTF-8
        user_id_bytes = user_id_bytes.ljust(8, b"\x00")  # 使用 NULL (\x00) 補滿 8 bytes
        #user_id_bytes = UserId.ljust(8, b"\x00").encode("utf-8")

       
        # self.mm[5:] = edf_filename.encode("utf-8") + b"\x00" * (
        #     self.buffer_size - len(edf_filename) - 5
        # )
        self.mm[0:4] = struct.pack("I", 1)  # 設定 `uint32` 來觸發 MATLAB
        self.mm[5:] = b"\x00" * (self.buffer_size - 5)  # 清空 buffer

        offset = 6  # 設定偏移量
        self.mm[offset : offset + len(user_id_bytes)] = user_id_bytes
        offset += len(user_id_bytes)

        # **寫入五個參數**
        self.mm[offset : offset + len(fs_bytes)] = fs_bytes
        offset += len(fs_bytes)

        self.mm[offset : offset + len(n_bytes)] = n_bytes
        offset += len(n_bytes)

        self.mm[offset : offset + len(start_idx_bytes)] = start_idx_bytes
        offset += len(start_idx_bytes)

        self.mm[offset : offset + len(end_idx_bytes)] = end_idx_bytes
        offset += len(end_idx_bytes)

        # **寫入 EDF 檔案名稱**
        self.mm[offset : offset + len(edf_filename)] = edf_filename.encode("utf-8")
        
        def debug_mm_buffer(mm):
            print("\n🧪 Debugging shared memory buffer...")

            offset = 6
            user_id = mm[offset:offset + 8].decode("utf-8", errors="ignore").replace("\x00", "")
            print("👤 UserId:", user_id)
            offset += 8

            fs = struct.unpack("<I", mm[offset:offset + 4])[0]
            offset += 4
            print("🧠 Sampling Rate (fs):", fs)

            n = struct.unpack("<I", mm[offset:offset + 4])[0]
            offset += 4
            print("📶 Channel Index (n):", n)

            start_time = struct.unpack("<I", mm[offset:offset + 4])[0]
            offset += 4
            print("⏱️ Start Time:", start_time)

            end_time = struct.unpack("<I", mm[offset:offset + 4])[0]
            offset += 4
            print("⏹️ End Time:", end_time)

            filename = mm[offset:].rstrip(b"\x00").decode("utf-8", errors="ignore")
            print("📂 EDF Filename:", filename)

        
        debug_mm_buffer(self.mm)


    def wait_for_matlab(self):
        """等待 MATLAB 完成計算"""
        print("Python: 等待 MATLAB 處理...")
        start_time = time.time()
        while struct.unpack("I", self.mm[0:4])[0] != 2:
            time.sleep(0.1)
            if time.time() - start_time > self.timeout:
                raise TimeoutError("MATLAB processing timeout!")
        print("Python: MATLAB buffer ready, reading data...")

    def read_data(self):
        """讀取 MATLAB 寫入的數據"""
        offset = 5

        # **讀取 FMscale**
        num_fm = 80
        FMscale = np.frombuffer(self.mm[offset : offset + num_fm * 4], dtype=np.float32)
        offset += num_fm * 4

        # **讀取 AMscale**
        num_am = 80
        AMscale = np.frombuffer(self.mm[offset : offset + num_am * 4], dtype=np.float32)
        offset += num_am * 4

        # **讀取 SquareIdx**
        SquareIdx = struct.unpack("B", self.mm[offset : offset + 1])[0]
        offset += 1

        # **讀取 CLIM**
        CLIM = np.frombuffer(self.mm[offset : offset + 2], dtype=np.uint8)
        offset += 2

        # **讀取 HOLO**
        HOLO_size = (81, 80)  # 確保形狀正確
        HOLO = np.frombuffer(
            self.mm[offset : offset + HOLO_size[0] * HOLO_size[1] * 8],
            dtype=np.float64,
        ).reshape(HOLO_size, order="F")
        offset += HOLO_size[0] * HOLO_size[1] * 8

        figureTitle_bytes = bytearray()
        while self.mm[offset] != 0:  # 遇到 NULL 結束
            figureTitle_bytes.append(self.mm[offset])
            offset += 1

        figureTitle1 = figureTitle_bytes.decode("utf-8")

        print("Python: 解析完成！")
        print(f"FMscale: {FMscale[:5]} ...")  # 測試輸出
        print(f"AMscale: {AMscale[:5]} ...")
        print(f"SquareIdx: {SquareIdx}")
        print(f"CLIM: {CLIM}")
        print(f"HOLO shape: {HOLO.shape}")
        print(f"figureTitle1: {figureTitle1}")

        # **清空 buffer，準備下一次請求**
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
            return 0     


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
    #client = MATLABSharedMemoryClient('0')
    #result = client.process_request('0', r"C:\Users\admin\Documents\react-flask-authentication\api-server-flask\fa0019r0.edf", fs=200, n=10, start_index=220, end_index=240)
    # with open("result.pkl", "wb") as f:
    #     pickle.dump(result, f)
    # with open("result.pkl", "rb") as f:
    #     result = pickle.load(f)
    #plot_holo_contour(result["HOLO"])

    # visualizer = HoloVisualizer(result)
    # visualizer.holo_show_with_dc()
