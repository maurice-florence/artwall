#!/usr/bin/env python3
"""
Script to upload an image to Firebase Storage with aggressive cache control for cost optimization.

IMPORTANT: Use this script for ALL image uploads to Firebase Storage to ensure
the correct Cache-Control header is set (public, max-age=31536000, immutable).
This is required for optimal CDN caching and to minimize Vercel image optimization costs.
"""
from firebase_admin import credentials, initialize_app, storage
import firebase_admin
import pathlib

SERVICE_ACCOUNT_KEY_PATH = pathlib.Path('./serviceAccountKey_artwall.json')
STORAGE_BUCKET = 'artwall-by-jr.firebasestorage.app'

# Set cache control for 1 year, immutable
CACHE_CONTROL = 'public, max-age=31536000, immutable'

def upload_image_with_cache_control(local_path, dest_path):
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        initialize_app(cred, {'storageBucket': STORAGE_BUCKET})
    bucket = storage.bucket()
    blob = bucket.blob(dest_path)
    blob.upload_from_filename(local_path)
    blob.cache_control = CACHE_CONTROL
    blob.patch()  # Save metadata
    blob.make_public()
    print(f"✅ Uploaded and set cache-control: {dest_path}")

if __name__ == '__main__':
    import sys
    if len(sys.argv) != 3:
        print("Usage: python upload_with_cache_control.py <local_path> <dest_path>")
        exit(1)
    upload_image_with_cache_control(sys.argv[1], sys.argv[2])
