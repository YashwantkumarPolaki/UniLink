from dotenv import load_dotenv
import os

# Load from root .env (D:\Unilink\.env) first
root_env = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(root_env)

# Also try backend/.env as fallback
backend_env = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(backend_env)

SECRET_KEY = os.getenv("SECRET_KEY", "unilink-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 43200))  # 30 days

SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
