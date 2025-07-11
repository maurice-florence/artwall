import os
import pathlib
from collections import defaultdict
from firebase_admin import credentials, initialize_app, db, storage

# --- CONFIGURATION ---
SERVICE_ACCOUNT_KEY_PATH = pathlib.Path(__file__).parent / 'serviceAccountKey.json'
DATABASE_URL = "https://creatieve-tijdlijn-default-rtdb.europe-west1.firebasedatabase.app/"
STORAGE_BUCKET = "creatieve-tijdlijn.firebasestorage.app"
LOCAL_FOLDER = pathlib.Path('G:/Mijn Drive/Creatief/Kunstmuur')

# --- INITIALIZE FIREBASE ---
def initialize_firebase():
    try:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        import firebase_admin
        if not firebase_admin._apps:
            initialize_app(cred, {
                'databaseURL': DATABASE_URL,
                'storageBucket': STORAGE_BUCKET
            })
        print("✅ Firebase successfully initialized")
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        exit(1)

# --- CHECK DATABASE STATUS ---
def check_database():
    print("\n🔍 Checking Firebase Database...")
    try:
        artworks_ref = db.reference('artworks')
        artworks = artworks_ref.get() or {}
        print(f"📊 Total artworks in database: {len(artworks)}")
        return artworks
    except Exception as e:
        print(f"❌ Error accessing database: {e}")
        return {}

# --- CHECK STORAGE STATUS ---
def check_storage():
    print("\n🔍 Checking Firebase Storage...")
    try:
        bucket = storage.bucket()
        blobs = list(bucket.list_blobs())
        print(f"📂 Total files in storage: {len(blobs)}")
        return [blob.name for blob in blobs]
    except Exception as e:
        print(f"❌ Error accessing storage: {e}")
        return []

# --- CHECK LOCAL FOLDER ---
def check_local_folder():
    print("\n🔍 Checking Local Folder...")
    local_artworks = defaultdict(list)
    local_media_files = []
    for category_dir in LOCAL_FOLDER.iterdir():
        if category_dir.is_dir():
            for file in category_dir.iterdir():
                relative_path = str(file.relative_to(LOCAL_FOLDER)).replace('\\', '/')
                if file.suffix == '.html':
                    # Group artworks by their base name (excluding language suffix)
                    base_name = '_'.join(relative_path.split('_')[:-1])
                    local_artworks[base_name].append(relative_path)
                else:
                    local_media_files.append(relative_path)
    print(f"📊 Total artworks in local folder: {len(local_artworks)}")
    print(f"📂 Total media files in local folder: {len(local_media_files)}")
    return local_artworks, local_media_files

# --- COMPARE CONTENTS ---
def compare_contents(database_artworks, storage_files, local_artworks, local_media_files):
    print("\n🔄 Comparing Contents...")
    
    # Normalize local artwork keys (strip category prefix and include full filenames)
    local_artwork_keys = {key.split('/')[-1].replace('.html', '') for key in local_artworks.keys()}
    database_keys = set(database_artworks.keys())

    # Compare database entries with local artworks
    missing_in_database = local_artwork_keys - database_keys
    extra_in_database = database_keys - local_artwork_keys

    # Handle extended database keys (substring matching)
    missing_in_database = {
        key for key in missing_in_database
        if not any(key in db_key for db_key in database_keys)
    }
    extra_in_database = {
        key for key in extra_in_database
        if not any(db_key.startswith(key) for db_key in database_keys)
    }

    print("\n📊 Database vs Local Artworks:")
    print(f"  🔸 Missing in database: {len(missing_in_database)}")
    for key in missing_in_database:
        print(f"    • {key}")
    print(f"  🔸 Extra in database: {len(extra_in_database)}")
    for key in extra_in_database:
        print(f"    • {key}")

    # Compare storage files with local media files
    storage_files_set = set(storage_files)
    local_media_files_set = set(local_media_files)
    missing_in_storage = local_media_files_set - storage_files_set
    extra_in_storage = storage_files_set - local_media_files_set

    print("\n📊 Storage vs Local Media Files:")
    print(f"  🔸 Missing in storage: {len(missing_in_storage)}")
    for file in missing_in_storage:
        print(f"    • {file}")
    print(f"  🔸 Extra in storage: {len(extra_in_storage)}")
    for file in extra_in_storage:
        print(f"    • {file}")

# --- MAIN FUNCTION ---
if __name__ == "__main__":
    print("\n🚀 Firebase and Local Folder Comparison")
    print("=" * 50)
    initialize_firebase()
    database_artworks = check_database()
    storage_files = check_storage()
    local_artworks, local_media_files = check_local_folder()
    compare_contents(database_artworks, storage_files, local_artworks, local_media_files)
    print("\n🎉 Comparison complete!")