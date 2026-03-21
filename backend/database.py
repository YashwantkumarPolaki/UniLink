import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

if not firebase_admin._apps:
    try:
        firebase_creds_json = os.environ.get("FIREBASE_CREDENTIALS")
        if firebase_creds_json:
            print("[DB] Using FIREBASE_CREDENTIALS env var", flush=True)
            cred_dict = json.loads(firebase_creds_json)
            cred = credentials.Certificate(cred_dict)
        else:
            print("[DB] Using local firebase_credentials.json", flush=True)
            cred_path = os.path.join(os.path.dirname(__file__), "firebase_credentials.json")
            cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("[DB] Firebase initialized OK", flush=True)
    except Exception as e:
        print(f"[DB] Firebase init FAILED: {e}", flush=True)
        raise

db = firestore.client()
print("[DB] Firestore client ready", flush=True)