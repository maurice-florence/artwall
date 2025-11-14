#!/usr/bin/env python3

"""
Script to make all resized images in Firebase Storage publicly readable.
The Firebase Storage Resize Images extension creates resized variants but they 
are not public by default, causing 403 Forbidden errors.
"""

from firebase_admin import credentials, initialize_app, storage
import firebase_admin
import pathlib

SERVICE_ACCOUNT_KEY_PATH = pathlib.Path('./serviceAccountKey_artwall.json')
STORAGE_BUCKET = 'artwall-by-jr.firebasestorage.app'

def make_resized_images_public():
    """Make all resized images in Firebase Storage publicly readable."""
    print("🔧 Making resized images public...")
    
    # Initialize Firebase if not already done
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        initialize_app(cred, {'storageBucket': STORAGE_BUCKET})

    bucket = storage.bucket()
    
    # Patterns that indicate resized images
    resize_patterns = ['_200x200', '_400x400', '_480x480', '_1200x1200']
    
    count = 0
    made_public = 0
    errors = 0
    
    print(f"📂 Scanning bucket: {STORAGE_BUCKET}")
    
    # Iterate through all blobs in the bucket
    for blob in bucket.list_blobs():
        count += 1
        
        # Check if this is a resized image
        is_resized = any(pattern in blob.name for pattern in resize_patterns)
        
        if is_resized:
            try:
                # Make the blob publicly readable
                blob.make_public()
                made_public += 1
                print(f"  ✅ Made public: {blob.name}")
            except Exception as e:
                errors += 1
                print(f"  ❌ Error making public: {blob.name} - {e}")
        
        # Progress indicator
        if count % 50 == 0:
            print(f"  📊 Processed {count} files, made {made_public} public...")
    
    print(f"\n🎉 Completed!")
    print(f"  📄 Total files scanned: {count}")
    print(f"  ✅ Made public: {made_public}")
    print(f"  ❌ Errors: {errors}")

if __name__ == '__main__':
    make_resized_images_public()