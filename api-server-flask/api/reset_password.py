from itsdangerous import URLSafeTimedSerializer
import os

def get_serializer():
    secret_key = os.getenv('SECRET_KEY')
    if not secret_key:
        raise ValueError("SECRET_KEY is not set in environment variables.")
    return URLSafeTimedSerializer(secret_key)


def generate_reset_token(user_id):
    s = get_serializer()
    return s.dumps({'user_id': user_id})


def verify_reset_token(token, expiration=3600):
    s = get_serializer()
    try:
        data = s.loads(token, max_age=expiration)
        return data['user_id']
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None
