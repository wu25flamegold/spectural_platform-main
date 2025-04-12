# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from datetime import datetime
import json

from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Users(db.Model):
    __tablename__ = 'users'
    __table_args__ = {'schema': 'public'} 
    id = db.Column(db.Integer(), primary_key=True)
    username = db.Column(db.String(32), nullable=False)
    role = db.Column(db.String(32), nullable=False, default='General User')  # 預設值
    usage = db.Column(db.Integer(), nullable=False, default=0)  # 預設值
    email = db.Column(db.String(64), nullable=True)
    password = db.Column(db.Text())
    jwt_auth_active = db.Column(db.Boolean())
    date_joined = db.Column(db.DateTime(), default=datetime.utcnow)

    def __repr__(self):
        return f"User {self.username}"

    def save(self):
        db.session.add(self)
        db.session.commit()

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def update_email(self, new_email):
        self.email = new_email

    def update_username(self, new_username):
        self.username = new_username

    def update_usage(self, usage):
        self.usage  = usage + 1

    def check_jwt_auth_active(self):
        return self.jwt_auth_active

    def set_jwt_auth_active(self, set_status):
        self.jwt_auth_active = set_status

    @classmethod
    def get_by_id(cls, id):
        return cls.query.get_or_404(id)

    @classmethod
    def get_by_email(cls, email):
        return cls.query.filter_by(email=email).first()
    
    @classmethod
    def get_by_username(cls, username):
        return cls.query.filter_by(username=username).first()

    def toDICT(self):
        cls_dict = {}
        cls_dict['_id'] = self.id
        cls_dict['username'] = self.username
        cls_dict['role'] = self.role
        cls_dict['usage'] = self.usage
        cls_dict['email'] = self.email
        return cls_dict

    def toJSON(self):
        return self.toDICT()


class JWTTokenBlocklist(db.Model):
    __table_args__ = {'schema': 'public'} 
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    jwt_token = db.Column(db.String(), nullable=False)
    created_at = db.Column(db.DateTime(), nullable=False)

    def __repr__(self):
        return f"Expired Token: {self.jwt_token}"

    def save(self):
        db.session.add(self)
        db.session.commit()

class Patients(db.Model):
    __table_args__ = {'schema': 'public'}
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)  # 主鍵，連續遞增
    age = db.Column(db.Integer(), nullable=False)  # 年齡
    gender = db.Column(db.String(1), nullable=False)  # 性別
    edf_file_path = db.Column(db.String(1000), nullable=False)  # EDF 檔案路徑
    sample_rate = db.Column(db.Float(), nullable=False)  # 取樣率
    start_time = db.Column(db.Integer(), nullable=False)  # 開始時間（UNIX 時間戳）
    end_time = db.Column(db.Integer(), nullable=False)  # 結束時間（UNIX 時間戳）
    clinical_diagnosis_code = db.Column(db.String(200), nullable=True)  # 臨床診斷代碼
    picture_path = db.Column(db.String(1000), nullable=False)  # 圖片路徑
    uploaded_at = db.Column(db.DateTime(), default=datetime.utcnow)  # 上傳時間，預設為當前時間
    create_user = db.Column(db.Integer(), nullable=False)  # 關聯的用戶 ID
    channel = db.Column(db.Integer(), nullable=False)  # 添加這行到模型中


    def __repr__(self):
        return f"<Patient id={self.id} age={self.age} gender={self.gender}>"

    def save(self):
        db.session.add(self)
        db.session.commit() 
