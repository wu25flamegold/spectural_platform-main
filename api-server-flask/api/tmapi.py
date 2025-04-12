from ctypes import WinDLL
from ctypes import WINFUNCTYPE, c_long, Structure, c_void_p, wintypes, c_int, c_wchar_p, c_ulong, byref
import asyncio
from .models import db, Users, JWTTokenBlocklist
from .config import BaseConfig
import os
import ctypes
import threading
import queue
import time
import struct
from PIL import Image
import numpy as np
import base64
from io import BytesIO

"""
    TMAPI routes
"""

console_hwnd = None
process = None
WM_COPYDATA = 0x004A
API_ID = 0x50414D54
API_VER = 0x0001
cmd_16 = 16
WNDPROC = WINFUNCTYPE(c_long, wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM)
kernel32 = WinDLL('kernel32', use_last_error=True)
user32 = WinDLL('user32', use_last_error=True)
gdi32 = WinDLL('gdi32', use_last_error=True)

class COPYDATASTRUCT(Structure):
    _fields_ = [
        ("dwData", c_void_p),
        ("cbData", c_ulong),
        ("lpData", c_void_p)
    ]

class WNDCLASS(Structure):
    _fields_ = [("style", wintypes.UINT),
                ("lpfnWndProc", WNDPROC),
                ("cbClsExtra", wintypes.INT),
                ("cbWndExtra", wintypes.INT),
                ("hInstance", wintypes.HINSTANCE),
                ("hIcon", wintypes.HICON),
                ("hCursor", wintypes.HICON),
                ("hbrBackground", wintypes.HBRUSH),
                ("lpszMenuName", wintypes.LPCWSTR),
                ("lpszClassName", wintypes.LPCWSTR)]
class TMAPI:
    def __init__(self, UserId):
        self.hwnd = None
        self.userId = UserId
        self.queue = queue.Queue()
        self.gra_buf = None
        self.gra_n = 0
        self.class_atom = None
        self.bm_result = None
        self.message_thread = threading.Thread(target=self.message_loop, daemon=True)
        self.message_thread.start()
        self.x_size=1024
        self.y_size=768
        self.stop_event = threading.Event()
        self.count = 0

    def cleanup(self):
        if self.hwnd:
            user32.DestroyWindow(self.hwnd)
            self.hwnd = None

    def __del__(self):
        self.cleanup()
    
    def message_loop(self):

        wc = WNDCLASS()
        wc.lpfnWndProc = WNDPROC(self.wnd_proc)
        wc.lpszClassName = "TMAPIReceiverWindow"
        hInstance0 = kernel32.GetModuleHandleW(None)
        if not hInstance0:
            error_code = kernel32.GetLastError()
            print(f"Failed to get Module Handle, error code: {error_code} - {ctypes.FormatError(error_code)}")
            return
        wc.hInstance = ctypes.c_void_p(hInstance0)

        if not wc.hInstance:
            raise ctypes.WinError(ctypes.get_last_error())
        wc.hCursor = user32.LoadCursorW(None, ctypes.c_int(32512))

        if not wc.hCursor:
            raise ctypes.WinError(ctypes.get_last_error())

        wc.hbrBackground = gdi32.GetStockObject(0)
        wc.cbClsExtra = 0
        wc.cbWndExtra = 0
        wc.hIcon = None
        wc.lpszMenuName = None
        hInstance_int = ctypes.c_ulong(ctypes.cast(wc.hInstance, ctypes.c_void_p).value)
        hInstance_int = ctypes.c_int(wc.hInstance)
        class_name = "TMAPIReceiverWindow"
        wc.style = 0x0001 | 0x0002
        
        if user32.FindWindowW(class_name, None):
            user32.UnregisterClassW(ctypes.c_wchar_p(class_name), hInstance_int)
        self.class_atom = user32.RegisterClassW(byref(wc))    
        
        self.create_window(wc)
        time.sleep(1)

        print(f"Window created with handle: {self.hwnd} \n Starting message loop...")
        msg = wintypes.MSG()
        while not self.stop_event.is_set():
            ret = user32.GetMessageW(byref(msg), self.hwnd, 0, 0)
            if ret == 0:
                break
            if ret == -1:
                break
            print(f"Message received: {msg.message} from hwnd: {self.hwnd}")
            user32.TranslateMessage(byref(msg))
            user32.DispatchMessageW(byref(msg))

    def create_window(self, wc):
        hInstance_ptr = ctypes.c_void_p(wc.hInstance)
        re_str = "TMAPIReceiverWindow_" + self.userId
        self.hwnd = user32.CreateWindowExW(
            0,
            wc.lpszClassName,
            re_str,
            0x00CF0000,
            1, 1, 1, 1,
            None,
            None,
            hInstance_ptr,
            None
        )

        if not self.hwnd:
            error_code = kernel32.GetLastError()
            print(f"[First] Failed to create window, error code: {error_code}")
            os._exit(0)
        else:
            print(f"Window created with handle: {self.hwnd}")

    def wnd_proc(self, hwnd, msg, wparam, lparam):
        print(f"Received message: {msg} from hwnd: {hwnd}, lparam:{lparam}")
        if msg == WM_COPYDATA:
            pcds = ctypes.cast(lparam, ctypes.POINTER(COPYDATASTRUCT)).contents
            print(f"WM_COPYDATA received with dwData: {pcds.dwData}, cbData: {pcds.cbData}, pcds.lpData: {pcds.lpData}")
            if pcds.lpData and pcds.cbData > 0:
                self.save_graph(pcds.lpData, pcds.cbData)
            return 202400
        if msg == 0x0010:
            print("WM_CLOSE received, preventing window from being closed.")
            return 0
        elif msg == 0x0002:
            print("WM_DESTROY received, preventing destruction., lparam:{lparam}", lparam)
            return 0
        elif msg == 130:
            print("WM_NCDESTROY received, lparam:", lparam)
            return 0
        else:
            return user32.DefWindowProcW(
                wintypes.HWND(hwnd),
                wintypes.UINT(msg),
                wintypes.WPARAM(wparam),
                wintypes.LPARAM(lparam)
            )

    def save_graph(self, buf, n):
        if n > 0:
            print(f"Saving graph: buf={buf}, n={n}")
            self.gra_n = 2359296
            self.gra_buf = ctypes.create_string_buffer(n)
            try:
                ctypes.memmove(self.gra_buf, buf, n)
                self.queue.put((self.gra_buf, self.gra_n))
            except Exception as e:
                print(f"Error in root.after: {e}")
    
    def process_queue(self, fname, timestamp):
        try:
            buf, buf_n = self.queue.get_nowait()
            img_str = self.show_graph(buf, buf_n, fname, timestamp)
            return img_str
        except queue.Empty:
            return None

    def show_graph(self, buf, n, fname, timestamp):
        try:
            print("BUF", len(buf), self.y_size, self.x_size)
            img_array = np.frombuffer(buf, dtype=np.uint8).reshape((self.y_size, self.x_size, 3))
            str_fname = fname + ".npy"
            dataset_array = np.load(str_fname)
            if np.allclose(img_array, dataset_array):
                print(fname + ": The arrays are close enough!!")
            else:
                print(fname + ": The arrays are not close enough??")
            px = ctypes.cast(buf, ctypes.POINTER(ctypes.c_ubyte * n))
            self.bm_result = Image.new('RGB', (self.x_size, self.y_size))

            for y in range(self.y_size):
                for x in range(self.x_size):
                    r = px.contents[y + x * self.y_size]
                    g = px.contents[y + x * self.y_size + self.x_size * self.y_size]
                    b = px.contents[y + x * self.y_size + self.x_size * self.y_size * 2]
                    self.bm_result.putpixel((x, y), (r, g, b))

            img_array = np.array(self.bm_result)
            img_array = img_array.transpose(1, 0, 2)
            img_array = img_array[:, :, [2, 1, 0]]
            resized_image = self.bm_result.resize((480, 360), Image.Resampling.LANCZOS)
            bigger_image = self.bm_result.resize((4800, 3600), Image.Resampling.LANCZOS)

            directory = r"C:\HhsaData"
            file_path = os.path.join(directory, f"{fname}_{timestamp}.png")
            bigger_image.save(file_path)

            buffered = BytesIO()
            resized_image.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            return img_str
        except Exception as e:
            print(f"[show_graph] Error displaying image: {e}")
            return None
    

    def prepare_data(self, fn_s, cmd_s, sampling_rate, chn, d_start, d_stop, signal_size=None, op=None):
        if fn_s != "":
            fn_s = (fn_s or '') + '\0'
            cmd_s = (cmd_s or '') + '\0'
            fn_len = len(fn_s) 
            cmd_len = len(cmd_s) 
            buf_n = 82
            buf = ctypes.create_string_buffer(buf_n)

            struct.pack_into('I', buf, 0, API_ID)
            struct.pack_into('H', buf, 4, API_VER)
            cs = sum(buf[:6]) & 0xFFFF
            struct.pack_into('H', buf, 6, cs)

            offset = 8
            struct.pack_into('H', buf, offset, fn_len)
            offset += 2
            struct.pack_into(f'{fn_len}s', buf, offset, fn_s.encode('ascii'))
            offset += fn_len

            struct.pack_into('H', buf, offset, cmd_len)
            offset += 2
            struct.pack_into(f'{cmd_len}s', buf, offset, cmd_s.encode('ascii'))
            offset += cmd_len

            struct.pack_into('d', buf, offset, 1 + 4)
            offset += 8
            struct.pack_into('d', buf, offset, 1024)
            offset += 8
            struct.pack_into('d', buf, offset, 768)
            offset += 8
            struct.pack_into('d', buf, offset, sampling_rate)
            offset += 8
            struct.pack_into('d', buf, offset, chn)
            offset += 8
            struct.pack_into('d', buf, offset, d_start)
            offset += 8
            struct.pack_into('d', buf, offset, d_stop)
            
        else:
            d_start = 0
            d_stop = 0
            chn = 0
            #buf_n = 32054
            API_header_size = 8  # API header
            sizeof_fn_len = 2  # length of file name 字段 = 2字節
            sizeof_cmd_len = 2  # length of cmd 字段 = 2字節
            data_header_size = 5  # data header = 56字節
            sizeof_double = 8  # double 大小 = 8字節
            fn_len = len(fn_s) + 1  # length of file name 加上 NULL 终止符
            cmd_len = len(cmd_s) + 1 if cmd_s else 1  # length of cmd 加上 NULL 终止符

            buf_n = API_header_size + sizeof_fn_len + fn_len + sizeof_cmd_len + cmd_len + (data_header_size + signal_size) * sizeof_double 
            buf = ctypes.create_string_buffer(buf_n)
            #####
            fn_len = len(fn_s) + 1
            cmd_len = len(cmd_s) + 1
            print(cmd_len, fn_len)

            struct.pack_into('I', buf, 0, API_ID)
            struct.pack_into('H', buf, 4, API_VER)
            cs = sum(buf[:6])
            struct.pack_into('H', buf, 6, cs)

            offset = 8
            struct.pack_into('H', buf, offset, fn_len)
            offset += 2
            struct.pack_into(f'{fn_len}s', buf, offset, fn_s.encode('ascii'))
            offset += fn_len
                        
            struct.pack_into('H', buf, offset, cmd_len)
            offset += 2
            struct.pack_into(f'{cmd_len}s', buf, offset, cmd_s.encode('ascii'))
            offset += cmd_len
            struct.pack_into('d', buf, offset, 1+4)
            offset += 8
            struct.pack_into('d', buf, offset, 1024)
            offset += 8
            struct.pack_into('d', buf, offset, 768)
            offset += 8
            struct.pack_into('d', buf, offset, sampling_rate)
            offset += 8
            struct.pack_into('d', buf, offset, signal_size)
            offset += 8

            for i in range(signal_size):
                if op == "f2":
                    value = self.f2(i, sampling_rate)
                elif op == "f3":
                    value = self.f3(i, sampling_rate)
                elif op == "f4":
                    value = self.f4(i, sampling_rate)
                elif op == "f5":
                    value = self.f5(i, sampling_rate)
                elif op == "f6":
                    value = self.f6(i, sampling_rate)
                struct.pack_into('d', buf, offset, value)
                offset += 8
        
        return buf, buf_n

    def send_message(self, buf, buf_n, UserId):
        cds = COPYDATASTRUCT()
        cds.dwData = cmd_16
        cds.cbData = buf_n
        cds.lpData = ctypes.cast(buf, ctypes.c_void_p)
        print("buf, buf_n", buf, buf_n)
        receiver_name = 'TMAP_' + UserId
        print("A", receiver_name)
        receiver_handle = user32.FindWindowW(None, receiver_name)
        if receiver_handle == 0:
            print("No receiver_handle")
            return -1
        print("CB", cds.dwData, cds.cbData, cds.lpData, receiver_handle, self.hwnd)
        time.sleep(1)
        result = user32.SendMessageW(receiver_handle, WM_COPYDATA, self.hwnd, byref(cds))
        return result


    def stop(self):
        self.stop_event.set()
        self.message_thread.join()
        hInstance_int = c_ulong(ctypes.cast(kernel32.GetModuleHandleW(None), ctypes.c_void_p).value)
        if self.hwnd:
            user32.DestroyWindow(self.hwnd)
            self.hwnd = None
        if self.class_atom:
            user32.UnregisterClassW(ctypes.c_wchar_p("TMAPIReceiverWindow"), hInstance_int)
            self.class_atom = None