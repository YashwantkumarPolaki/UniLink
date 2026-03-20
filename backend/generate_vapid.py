"""
One-time script to generate a VAPID key pair for Web Push Notifications.
Run: python generate_vapid.py

Then copy the output into your backend .env file:
  VAPID_PUBLIC_KEY=...
  VAPID_PRIVATE_KEY=...
  VAPID_CLAIMS_EMAIL=mailto:your@email.com
"""
from py_vapid import Vapid01 as Vapid

vapid = Vapid()
vapid.generate_keys()

private_key = vapid.private_key_urlsafe
public_key = vapid.public_key_urlsafe

print("=" * 60)
print("Copy these into your backend .env file:")
print("=" * 60)
print(f"VAPID_PUBLIC_KEY={public_key}")
print(f"VAPID_PRIVATE_KEY={private_key}")
print(f'VAPID_CLAIMS_EMAIL=mailto:admin@unilink.com')
print("=" * 60)
