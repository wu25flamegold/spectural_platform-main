# -*- encoding: utf-8 -*-
from datetime import datetime, timezone, timedelta
from functools import wraps
import tempfile
import time
import psutil
from flask import current_app
import pygetwindow as gw
from werkzeug.utils import secure_filename

from ctypes import WinDLL
from ctypes import WINFUNCTYPE, c_long, Structure, c_void_p, wintypes, c_int, c_wchar_p, c_ulong, byref
import ctypes
from flask import request, jsonify, send_file
from flask_restx import Api, Resource, fields
import jwt
from scipy.fft import fft, fftfreq
from scipy.signal import hilbert, savgol_filter
import mne
from utils.upload_utils import generate_result_image, run_tmapi_processing, save_uploaded_file, prepare_tmapi_data, open_tmapi_window, create_patient_record
from .models import db, Users, JWTTokenBlocklist
from .config import BaseConfig
import requests
import os
import subprocess
import time
from PIL import Image
import numpy as np
from io import BytesIO
from .tmapi import TMAPI
import api.matlab_client

rest_api = Api(version="1.0", title="Users API")
IMAGE_SAVE_PATH = 'saved_images'
UPLOAD_FOLDER = "C:/HHSA_shared/uploads"
SAVE_DIR = r"C:\HhsaData"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
process = None
if not os.path.exists(IMAGE_SAVE_PATH):
    os.makedirs(IMAGE_SAVE_PATH)

signup_model = rest_api.model('SignUpModel', {"username": fields.String(required=True, min_length=2, max_length=32),
                                              "email": fields.String(required=True, min_length=4, max_length=64),
                                              "password": fields.String(required=True, min_length=4, max_length=16)
                                              })

login_model = rest_api.model('LoginModel', {"email": fields.String(required=True, min_length=4, max_length=64),
                                            "password": fields.String(required=True, min_length=4, max_length=16)
                                            })

user_edit_model = rest_api.model('UserEditModel', {"userID": fields.String(required=True, min_length=1, max_length=32),
                                                   "username": fields.String(required=True, min_length=2, max_length=32),
                                                   "email": fields.String(required=True, min_length=4, max_length=64)
                                                   })

def token_required(f):
    """
    Helper function for JWT token required
    """
    @wraps(f)
    def decorator(*args, **kwargs):

        token = None

        if "authorization" in request.headers:
            token = request.headers["authorization"]
        elif request.is_json:
            token = request.get_json().get("token")

        if not token:
            return {"success": False, "msg": "Valid JWT token is missing"}, 400
        try:
            data = jwt.decode(token, BaseConfig.SECRET_KEY, algorithms=["HS256"])
            current_user = Users.get_by_email(data["email"])

            if not current_user:
                return {"success": False,
                        "msg": "Sorry. Wrong auth token. This user does not exist."}, 400

            token_expired = db.session.query(JWTTokenBlocklist.id).filter_by(jwt_token=token).scalar()

            if token_expired is not None:
                return {"success": False, "msg": "Token revoked."}, 400

            if not current_user.check_jwt_auth_active():
                return {"success": False, "msg": "Token expired."}, 400

        except:
            return {"success": False, "msg": "Token is invalid"}, 400

        return f(current_user, *args, **kwargs)

    return decorator


"""
    Flask-Restx routes
"""
@rest_api.route('/api/users/register')
class Register(Resource):
    """
       Creates a new user by taking 'signup_model' input
    """
    @rest_api.expect(signup_model, validate=True)
    def post(self):
        req_data = request.get_json()
        _username = req_data.get("username")
        _email = req_data.get("email")
        _password = req_data.get("password")
        user_exists = Users.get_by_email(_email)
        if user_exists:
            return {"success": False,
                    "msg": "Email already taken"}, 400

        new_user = Users(username=_username, email=_email)
        new_user.set_password(_password)
        new_user.save()

        return {"success": True,
                "userID": new_user.id,
                "msg": "The user was successfully registered"}, 200


@rest_api.route('/api/users/login')
class Login(Resource):
    """
       Login user by taking 'login_model' input and return JWT token
    """
    @rest_api.expect(login_model, validate=True)
    def post(self):
        req_data = request.get_json()
        _email = req_data.get("email")
        _password = req_data.get("password")
        user_exists = Users.get_by_email(_email)

        if not user_exists:
            return {"success": False,
                    "msg": "This email does not exist."}, 400

        if not user_exists.check_password(_password):
            return {"success": False,
                    "msg": "Wrong credentials."}, 400

        # create access token uwing JWT
        token = jwt.encode({'email': _email, 'exp': datetime.utcnow() + timedelta(minutes=30)}, BaseConfig.SECRET_KEY)
        user_exists.set_jwt_auth_active(True)
        user_exists.save()

        return {"success": True,
                "token": token,
                "user": user_exists.toJSON()}, 200


@rest_api.route('/api/users/edit')
class EditUser(Resource):
    """
       Edits User's username or password or both using 'user_edit_model' input
    """
    @rest_api.expect(user_edit_model)
    @token_required
    def post(self, current_user):
        req_data = request.get_json()
        _new_username = req_data.get("username")
        _new_email = req_data.get("email")
        if _new_username:
            self.update_username(_new_username)
        if _new_email:
            self.update_email(_new_email)
        self.save()
        return {"success": True}, 200


@rest_api.route('/api/users/logout')
class LogoutUser(Resource):
    """
       Logs out User using 'logout_model' input
    """
    @token_required
    def post(self, current_user):
        _jwt_token = request.headers["authorization"]
        existing = JWTTokenBlocklist.query.filter_by(jwt_token=_jwt_token).first()
        if not existing:
            jwt_block = JWTTokenBlocklist(jwt_token=_jwt_token, created_at=datetime.now(timezone.utc))
            jwt_block.save()

        # 正確對 current_user 設定登出狀態
        self.set_jwt_auth_active(False)
        self.save()

        return {"success": True}, 200


@rest_api.route('/api/sessions/oauth/github/')
class GitHubLogin(Resource):
    def get(self):
        code = request.args.get('code')
        client_id = BaseConfig.GITHUB_CLIENT_ID
        client_secret = BaseConfig.GITHUB_CLIENT_SECRET
        root_url = 'https://github.com/login/oauth/access_token'
        params = { 'client_id': client_id, 'client_secret': client_secret, 'code': code }
        data = requests.post(root_url, params=params, headers={
            'Content-Type': 'application/x-www-form-urlencoded',
        })
        response = data._content.decode('utf-8')
        access_token = response.split('&')[0].split('=')[1]
        user_data = requests.get('https://api.github.com/user', headers={
            "Authorization": "Bearer " + access_token
        }).json()
        
        user_exists = Users.get_by_username(user_data['login'])
        if user_exists:
            user = user_exists
        else:
            try:
                user = Users(username=user_data['login'], email=user_data['email'])
                user.save()
            except:
                user = Users(username=user_data['login'])
                user.save()
        
        user_json = user.toJSON()
        token = jwt.encode({"username": user_json['username'], 'exp': datetime.utcnow() + timedelta(minutes=30)}, BaseConfig.SECRET_KEY)
        user.set_jwt_auth_active(True)
        user.save()

        return {"success": True,
                "user": {
                    "_id": user_json['_id'],
                    "email": user_json['email'],
                    "username": user_json['username'],
                    "token": token,
                }}, 200
    
@rest_api.route('/tmapi/open_matlab', endpoint='tmapi_open_matlab')
class OpenMatlab(Resource):
    def post(self):
        global process
        UserId = request.headers.get('UserId')
        success, message, process = open_tmapi_window(UserId)
        return jsonify({"success": success, "message": message})
        # exe_path = r"C:\Users\admin\Documents\2024\matlab_edf_server_for_json.exe"
        # expected_cmdline = f"{exe_path} {UserId}"
        # user32 = WinDLL('user32', use_last_error=True)
        # new_title = f"MATLAB_Server_{UserId}"
        # find_existed = user32.FindWindowW( new_title, None)  # 找到 CMD
        # try:
        #     hwnd_existed = user32.FindWindowW(None, f"TMAP_{UserId}")
        #     print(hwnd_existed, "hwnd_existed")
        #     if hwnd_existed:
        #         tmapi = get_tmapi(UserId)
        #         return jsonify({"success": True, "message": "MATLAB opened successfully."})
        #     else:
        #         tmapiPath = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'Desktop', 'v026', 'TMAPI.exe')
        #         tmapiPath = r"C:\Users\admin\Desktop\v026\TMAPI.exe"

        #         process = subprocess.Popen(
        #             tmapiPath,
        #             shell=True,
        #             creationflags=subprocess.CREATE_NEW_CONSOLE
        #         )
        #         time.sleep(1)
        #         hwnd = user32.FindWindowW(None, "TMAPI")
        #         if hwnd:
        #             new_title = f"TMAP_{UserId}"
        #             user32.SetWindowTextW(hwnd, c_wchar_p(new_title))
        #             print(f"Window title changed to: {new_title}")
        #             from api import get_tmapi

        #             tmapi = get_tmapi(UserId)
        #             return jsonify({"success": True, "message": "MATLAB opened successfully."})
        #         else:
        #             return jsonify({"success": False, "message": "MATLAB opened successfully."})
        # except Exception as e:
        #     return jsonify({"success": False, "message": f"Failed to open MATLAB: {e}"})

           
@rest_api.route('/tmapi/send_command', endpoint='tmapi_send_command')
class SendCommand(Resource):
    def post(self):
        UserId = request.headers.get('UserId')
        from api import get_process_instance
        instance = get_process_instance(UserId)
        if 'file' in request.files:
            file = request.files['file']
            selectedFunction = ''
            file_path, fname, timestamp = save_uploaded_file(file, SAVE_DIR)
        else:
            selectedFunction = request.form['selectedFunction']
            file_path, fname, timestamp = "", "", datetime.now().strftime("%Y%m%d_%H%M%S")
            
        chn = int(request.form['chn'])
        d_start = int(request.form['d_start'])
        d_stop = int(request.form['d_stop'])
        sampling_rate = float(request.form['sampling_rate'])
        email = request.form['email']
        usage = int(request.form['usage'])
        cmd=""
        # buf, buf_n = prepare_tmapi_data(
        #     tmapi, selectedFunction, file.filename if file_path else "",
        #     cmd, sampling_rate, chn, d_start, d_stop
        # )
        
        # result = tmapi.send_message(buf, buf_n, UserId)
        # #result = tmapi.process_request(UserId, file_path, fs=sampling_rate, n=chn, start_index=d_start, end_index=d_stop)
        valid, err_msg = validate_edf_by_header_only(file_path, n=chn, start_index=d_start, end_index=d_stop, fs=sampling_rate)
        if not valid:
            print(f"[ERROR] {err_msg}")
            return jsonify({
                "success": False,
                "message": f"{err_msg}"
            })
        result = run_tmapi_processing(instance, selectedFunction, file, file_path, cmd, sampling_rate,
                                      chn, d_start, d_stop, UserId, fname, timestamp)
        if result == -1:
            return jsonify({"success": False, "message": "Send Msg fail: no handle"})
        elif result == 0:
            return jsonify({"success": False, "message": "Send Msg fail: no response"})
        else:
            # img_str = tmapi.process_queue(fname, timestamp)
            # #visualizer = api.matlab_client.HoloVisualizer(result)
            # #img_str = visualizer.holo_show_with_dc()
            if "HOLO_INSTANCES" not in current_app.config:
                current_app.config["HOLO_INSTANCES"] = {}

            current_app.config["HOLO_INSTANCES"][UserId] = result
            print('hhsa', UserId)
            img_str = generate_result_image(result, instance, fname, timestamp, UserId)
            if img_str:
                user = Users.get_by_email(email)
                user.update_usage(usage)
                user.save()

                parsed_time = datetime.strptime(timestamp, "%Y%m%d_%H%M%S")
                formatted_timestamp = parsed_time.strftime("%Y-%m-%d %H:%M:%S")
                hhsa_filename = f"{timestamp}.png"
                hhsa_path = os.path.join(SAVE_DIR, hhsa_filename)

                new_patient = create_patient_record(request.form, user.id, file_path, sampling_rate, d_start, d_stop, hhsa_path, formatted_timestamp, chn)
                new_patient.save()
                
                return jsonify({"success": True, "image": img_str, "usage": user.usage})
            else:
                return jsonify({"success": False, "message": result})

@rest_api.route('/tmapi/close_matlab', endpoint='tmapi_close_matlab')
class CloseMatlab(Resource):
    def post(self):
        global process
        if process:
            parent = psutil.Process(process.pid)
            for child in parent.children(recursive=True):
                child.kill() 
            parent.kill()
            process.terminate()
            process.wait()
            process.kill()
            process = None
            return jsonify({"success": True, "message": "MATLAB closed successfully."})
        else:
            return jsonify({"success": False, "message": "MATLAB is not opened yet."})

@rest_api.route('/tmapi/analyze_roi', endpoint='analyze_roi')
class AnalyzeROI(Resource):
    def post(self):
        UserId = request.headers.get('UserId')
        roi_coords = request.json.get('roi_coords') 
        print('analyze_roi', roi_coords)

        hhsa_data = current_app.config["HOLO_INSTANCES"].get(UserId)
        if not hhsa_data:
            raise ValueError("No HOLO found for this user.")
        print("hhsa_data",hhsa_data )
        roi_data = request.get_json()
        roi_coords = roi_data.get('roi_coords')

        # 取出 HOLO 與座標軸
        FMscale = np.array(hhsa_data["FMscale"])
        AMscale = np.array(hhsa_data["AMscale"])
        HOLO = np.array(hhsa_data["HOLO"])

        x1, x2 = roi_coords["x1"], roi_coords["x2"]
        y1, y2 = roi_coords["y1"], roi_coords["y2"]

        # 🔁 ROI 座標 → Index 範圍
        x_idx = np.where((FMscale >= x1) & (FMscale <= x2))[0]
        y_idx = np.where((AMscale >= y1) & (AMscale <= y2))[0]

        if len(x_idx) == 0 or len(y_idx) == 0:
            return {"error": "ROI範圍不在 HOLO 範圍內"}, 400

        roi_holo = HOLO[np.ix_(y_idx, x_idx)]

        # ✅ 1. Marginal Spectrum
        marginal_fm = np.sum(roi_holo, axis=0).tolist()
        marginal_am = np.sum(roi_holo, axis=1).tolist()

        # ✅ 2. Dominant Frequencies
        dominant_fm = float(FMscale[x_idx[np.argmax(marginal_fm)]])
        dominant_am = float(AMscale[y_idx[np.argmax(marginal_am)]])

        # ✅ 3. Modulation Profile
        modulation_profile = roi_holo.tolist()
        fm_axis = FMscale[x_idx].tolist()
        am_axis = AMscale[y_idx].tolist()

        return jsonify({
            "success": True,
            "dominant_fm": dominant_fm,
            "dominant_am": dominant_am,
            "marginal_fm": marginal_fm,
            "marginal_am": marginal_am,
            "modulation_profile": modulation_profile,
            "fm_axis": fm_axis,
            "am_axis": am_axis,
            "roi_coords": roi_coords
        })

@rest_api.route('/tmapi/validate_edf_metadata', endpoint='validate_edf_metadata')
class ValidatEdfMetadata(Resource):
    def post(self):
        file = request.files.get('file')
        if not file:
            return jsonify({"message": "❌ No file uploaded"}), 400

        
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        original_filename = secure_filename(file.filename)
        filename = f"{timestamp}_{original_filename}"
        save_dir = "C:\\HHSA_shared\\Temp"
        os.makedirs(save_dir, exist_ok=True)  # 若資料夾不存在就自動建立
        save_path = f"{save_dir}\\{filename}"

        file.save(save_path)

        try:
            with open(save_path, 'rb') as f:
                f.seek(252)
                num_signals = int(f.read(4).decode().strip())
                f.seek(244)
                duration_str = f.read(8).decode().strip()
                f.seek(236)
                num_records_str = f.read(8).decode().strip()
                f.seek(256 + num_signals * 216)
                samples_per_record_all = [int(f.read(8).decode().strip()) for _ in range(num_signals)]
                fs_detected = samples_per_record_all[0] / float(duration_str)
                duration_per_record = float(duration_str)
                num_records = int(num_records_str)
            total_duration = duration_per_record * num_records

            return jsonify({
                "message": "Header parsed successfully",
                "num_signals": num_signals,
                "fs_detected": fs_detected,
                "duration_str": total_duration,
                "num_records_str": num_records_str
            })
        except Exception as e:
            return jsonify({"message": f"❌ Failed to parse EDF: {str(e)}"}), 500

@rest_api.route('/upload_for_fft', endpoint='upload_for_fft')
class UploadFFT(Resource):
    def post(self):
        if 'file' not in request.files:
            return jsonify({"success": False, "message": 'No file'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "message": 'No selected file'})
        
        if file:
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix='.edf') as tmp:
                    file.save(tmp.name)
                    tmp_path = tmp.name
                raw = mne.io.read_raw_edf(tmp_path, preload=True)
                os.remove(tmp_path)
                data, times = raw[:]
                signal = data[0] 
                fs = raw.info['sfreq']
                N = len(signal)
                yf = fft(signal)
                xf = fftfreq(N, 1/fs)
                fft_result = {
                    'frequency': xf.tolist(),
                    'amplitude': np.abs(yf).tolist()
                }
                return jsonify({"success": True, "message": fft_result})
            except Exception as e:
                return jsonify({"success": False, "message": str(e)})

@rest_api.route('/upload_for_hht', endpoint='upload_for_hht')
class UploadHHT(Resource):
    def post(self):
        if 'file' not in request.files:
            return jsonify({"success": False, "message": 'No file'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "message": 'No selected file'})
        
        if file:
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix='.edf') as tmp:
                    file.save(tmp.name)
                    tmp_path = tmp.name
                
                raw = mne.io.read_raw_edf(tmp_path, preload=True)
                os.remove(tmp_path) 
                data, times = raw[:]
                signal = data[0] 
                
                emd = EMD()
                print("EMDstart")
                imfs = emd(signal, max_imf=1)
                print("get IMFS")
                hht_results = []
                print("start", len(imfs))
                for imf in imfs:
                    print("F")
                    analytic_signal = hilbert(imf)
                    print("G")
                    amplitude_envelope = np.abs(analytic_signal)
                    instantaneous_phase = np.unwrap(np.angle(analytic_signal))
                    print("H")
                    instantaneous_frequency = np.diff(instantaneous_phase) / (2.0 * np.pi  * np.diff(times))
                    print("I")
                    instantaneous_frequency_smoothed = savgol_filter(instantaneous_frequency, window_length=200, polyorder=3)
                    hht_results.append({
                        'imf': imf.tolist(),
                        'amplitude_envelope': amplitude_envelope.tolist(),
                        'instantaneous_frequency': instantaneous_frequency_smoothed.tolist()
                    })
                print("level-1", len(hht_results))
                amplitude_envelope_signal = np.array(hht_results[0]['amplitude_envelope'])
                new_imfs = emd(amplitude_envelope_signal, max_imf=2)

                for imf in new_imfs:
                    analytic_signal = hilbert(imf)
                    amplitude_envelope = np.abs(analytic_signal)
                    instantaneous_phase = np.unwrap(np.angle(analytic_signal))
                    instantaneous_frequency = np.diff(instantaneous_phase) / (2.0 * np.pi * np.diff(times))
                    instantaneous_frequency_smoothed = savgol_filter(instantaneous_frequency, window_length=200, polyorder=3)
                    hht_results.append({
                        'imf': imf.tolist(),
                        'amplitude_envelope': amplitude_envelope.tolist(),
                        'instantaneous_frequency': instantaneous_frequency_smoothed.tolist()
                    })
                print("level-2", len(hht_results))
                amplitude_envelope_signal = np.array(hht_results[1]['amplitude_envelope'])

                new_imfs = emd(amplitude_envelope_signal, max_imf=2)

                for imf in new_imfs:
                    analytic_signal = hilbert(imf)
                    amplitude_envelope = np.abs(analytic_signal)
                    instantaneous_phase = np.unwrap(np.angle(analytic_signal))
                    instantaneous_frequency = np.diff(instantaneous_phase) / (2.0 * np.pi * np.diff(times))
                    instantaneous_frequency_smoothed = savgol_filter(instantaneous_frequency, window_length=200, polyorder=3)
                    hht_results.append({
                        'imf': imf.tolist(),
                        'amplitude_envelope': amplitude_envelope.tolist(),
                        'instantaneous_frequency': instantaneous_frequency_smoothed.tolist()
                    })
                print("level-2", len(hht_results))
                return jsonify({"success": True, "message": hht_results})
            except Exception as e:
                return jsonify({"success": False, "message": str(e)})

def validate_edf_by_header_only(edf_path, n, start_index, end_index, fs):
        if not os.path.exists(edf_path):
            return False, f"❌ 找不到檔案：{edf_path}"
        try:
            # 取得檔案大小
            filesize = os.path.getsize(edf_path)

            with open(edf_path, 'rb') as f:
                # 通道數
                f.seek(252)
                num_signals = int(f.read(4).decode().strip())

                # 每段紀錄時間
                f.seek(244)
                duration_str = f.read(8).decode().strip()

                # 紀錄段數
                f.seek(236)
                num_records_str = f.read(8).decode().strip()

                if not duration_str or not num_records_str:
                    return False, "❌ EDF 檔案缺少紀錄段資訊（duration 或 record 數）"

                duration_per_record = float(duration_str)
                num_records = int(num_records_str)

            total_duration = duration_per_record * num_records


            # 計算可用長度（秒）
            header_size = 256 + num_signals * 256
            bytes_per_sample = 2
            bytes_per_second = fs * num_signals * bytes_per_sample
            data_bytes = filesize - header_size

            print(f"📊 通道數：{num_signals}")
            print(f"⏱️ 檔案總長：約 {total_duration:.2f} 秒")

            if n < 1 or n > num_signals:
                return False, f"❌ 通道 index ({n}) 超出範圍，僅有 {num_signals} 通道"

            if start_index < 0 or end_index <= start_index:
                return False, "❌ 時間區間無效，start_index 必須小於 end_index 且皆為正整數"

            if end_index > total_duration:
                return False, f"❌ 結束時間 {end_index}s 超出檔案總長 {total_duration:.2f}s"

            return True, None  # ✅ 驗證成功
        except Exception as e:
            return False, f"❌ 驗證時發生錯誤：{str(e)}"
