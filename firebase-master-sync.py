import os
import pathlib
import re
import json
from firebase_admin import credentials, initialize_app, db, storage
from typing import Dict, Any
import xml.etree.ElementTree as ET

# --- CONFIGURATIE ---
# De bronmap met al uw categorie-submappen (poetry, music, etc.)
SOURCE_MEDIA_FOLDER = pathlib.Path('G:/Mijn Drive/Creatief/Kunstmuur_testing')

# Pad naar uw Firebase service account sleutel
SERVICE_ACCOUNT_KEY_PATH = pathlib.Path(__file__).parent / 'serviceAccountKey.json'
DATABASE_URL = "https://creatieve-tijdlijn-default-rtdb.europe-west1.firebasedatabase.app/"
STORAGE_BUCKET = "creatieve-tijdlijn.firebasestorage.app"  # Remove the gs:// prefix

# --- SCRIPT LOGICA ---

def parse_metadata_from_filename(filename: str) -> Dict[str, Any]:
    """
    Fallback functie: Extraheert basis-metadata uit een bestandsnaam 
    als er geen .html-bestand wordt gevonden.
    """
    parts = filename.split('_')
    if len(parts) < 3:
        return {}
    
    date_str, category, title_part = parts[0], parts[1], '_'.join(parts[2:])
    title = re.sub(r'\.\w+$', '', title_part).replace('-', ' ').capitalize()

    return {
        'year': int(date_str[0:4]),
        'month': int(date_str[4:6]),
        'day': int(date_str[6:8]),
        'category': category,
        'title': title
    }

def parse_html_metadata(html_content: str) -> Dict[str, Any]:
    """
    Extraheert metadata uit HTML bestanden die gegenereerd zijn door evernote-to-files.py
    Flexibel genoeg om verschillende HTML structuren te hanteren.
    """
    metadata = {}
    content = ""
    
    try:
        # Method 1: Try exact structure first (most reliable)
        metadata_match = re.search(r'<div class="metadata">\s*<pre>(.*?)</pre>', html_content, re.DOTALL)
        
        # Method 2: Fallback - look for any <pre> tag with metadata-like content
        if not metadata_match:
            metadata_match = re.search(r'<pre[^>]*>(.*?)</pre>', html_content, re.DOTALL)
            # Only use if it contains typical metadata keys
            if metadata_match and any(key in metadata_match.group(1).lower() for key in ['title:', 'year:', 'category:']):
                pass  # Use this match
            else:
                metadata_match = None
        
        # Method 3: Final fallback - look for key-value pairs anywhere in HTML
        if not metadata_match:
            # Look for YAML-style patterns anywhere in the HTML
            yaml_pattern = r'(?:^|\n)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.+?)(?=\n\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:|$)'
            yaml_matches = re.findall(yaml_pattern, html_content, re.MULTILINE)
            if yaml_matches:
                metadata_text = '\n'.join([f"{key}: {value}" for key, value in yaml_matches])
                # Create a fake match object for consistent processing
                class FakeMatch:
                    def __init__(self, text):
                        self.text = text
                    def group(self, n):
                        return self.text
                metadata_match = FakeMatch(metadata_text)
        
        if metadata_match:
            metadata_text = metadata_match.group(1).strip()
            
            # Parse key-value pairs (flexible parsing)
            for line in metadata_text.split('\n'):
                line = line.strip()
                if ':' in line and not line.startswith('#'):  # Skip comments
                    try:
                        key, value = line.split(':', 1)
                        key = key.strip()
                        value = value.strip()
                        
                        # Remove quotes from values
                        if value.startswith("'") and value.endswith("'"):
                            value = value[1:-1]
                        elif value.startswith('"') and value.endswith('"'):
                            value = value[1:-1]
                        
                        # Convert numeric values (flexible - any field that looks numeric)
                        if key in ['year', 'month', 'day'] or (value.isdigit() and len(value) == 4 and key.endswith('year')):
                            try:
                                metadata[key] = int(value)
                            except ValueError:
                                metadata[key] = value
                        else:
                            # Include all fields, convert empty values to empty string instead of null
                            # This ensures Firebase stores the field even when empty
                            metadata[key] = value if value else ""
                    except Exception as e:
                        print(f"⚠️ Kon regel niet parsen: '{line}' - {e}")
                        continue
        
        # Extract content (flexible content extraction)
        content = extract_content_flexible(html_content)
        metadata['content'] = content
        
    except Exception as e:
        print(f"⚠️ Fout bij parsen van HTML metadata: {e}")
        return {}
    
    return metadata

def extract_content_flexible(html_content: str) -> str:
    """
    Extraheert content uit HTML op een flexibele manier.
    """
    content = ""
    
    # Method 1: Look for explicit content div
    content_match = re.search(r'<div class="content"[^>]*>(.*?)</div>', html_content, re.DOTALL)
    if content_match:
        content = content_match.group(1).strip()
    
    # Method 2: Look for content after metadata but before closing body
    elif 'class="metadata"' in html_content:
        parts = html_content.split('</div>', 1)  # Split after first metadata div
        if len(parts) > 1:
            remaining = parts[1]
            # Extract everything until metadata appears again or body ends
            body_content = re.search(r'(.*?)(?:<div[^>]*class="metadata"|</body>)', remaining, re.DOTALL)
            if body_content:
                content = body_content.group(1).strip()
    
    # Method 3: Fallback - extract body content and remove metadata
    else:
        body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.DOTALL)
        if body_match:
            body_content = body_match.group(1)
            # Remove metadata sections
            content = re.sub(r'<div[^>]*class="metadata"[^>]*>.*?</div>', '', body_content, flags=re.DOTALL)
            content = content.strip()
    
    # Clean up common HTML artifacts
    content = re.sub(r'<style[^>]*>.*?</style>', '', content, flags=re.DOTALL)
    content = re.sub(r'^\s*<div[^>]*>\s*', '', content)  # Remove opening div
    content = re.sub(r'\s*</div>\s*$', '', content)     # Remove closing div
    
    return content.strip()

def sync_to_firebase(force_update: bool = False):
    """
    Scant de lokale media map, leest metadata uit .html bestanden,
    vergelijkt met Firebase, en uploadt/update nieuwe of gewijzigde items.
    
    :param force_update: Als True, overschrijft alle bestaande items
    """
    print("\n🚀 Firebase Synchronisatie Gestart")
    if force_update:
        print("🔄 FORCE UPDATE MODE - Alle bestanden worden overschreven")
    print("=" * 50)
    
    try:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        # Correct way to check if Firebase is already initialized
        import firebase_admin
        if not firebase_admin._apps:
            initialize_app(cred, {
                'databaseURL': DATABASE_URL,
                'storageBucket': STORAGE_BUCKET
            })
        print("✅ Firebase succesvol geïnitialiseerd")
    except Exception as e:
        print(f"❌ Fout bij initialiseren Firebase: {e}")
        return

    print("\n🔍 Ophalen van bestaande data uit de database...")
    artworks_ref = db.reference('artworks')
    existing_artworks = artworks_ref.get() or {}
    existing_keys = set(existing_artworks.keys())
    print(f"ℹ️  {len(existing_keys)} bestaande items gevonden")

    bucket = storage.bucket()
    items_to_process: Dict[str, Dict[str, Any]] = {}

    print(f"\n📁 Scannen van lokale bestanden en metadata...")
    print(f"📂 Bron: {SOURCE_MEDIA_FOLDER}")
    
    total_html_files = 0
    total_media_files = 0
    
    for category_dir in SOURCE_MEDIA_FOLDER.iterdir():
        if not category_dir.is_dir():
            continue
        
        category = category_dir.name
        print(f"\n  📁 {category}/")
        
        all_files = list(category_dir.iterdir())
        html_files = {f.stem: f for f in all_files if f.suffix == '.html'}
        media_files = [f for f in all_files if f.suffix != '.html']
        
        print(f"    📄 {len(html_files)} HTML bestanden")
        print(f"    🎨 {len(media_files)} media bestanden")
        
        total_html_files += len(html_files)
        total_media_files += len(media_files)

        for file_path in all_files:
            if file_path.suffix == '.html':
                # Verwerk HTML bestanden
                try:
                    html_content = file_path.read_text('utf-8')
                    metadata = parse_html_metadata(html_content)
                    
                    if not metadata.get('title'):
                        metadata = parse_metadata_from_filename(file_path.name)
                    
                    if metadata.get('title'):
                        # Use HTML filename (without extension) as key
                        html_key = file_path.stem
                        
                        if html_key not in items_to_process:
                            items_to_process[html_key] = {'metadata': metadata, 'files': []}
                        
                        items_to_process[html_key]['files'].append(file_path)
                        # Store last modification time
                        items_to_process[html_key]['last_modified'] = int(file_path.stat().st_mtime * 1000)
                        
                except Exception as e:
                    print(f"    ⚠️ Kon HTML niet lezen: {file_path.name} - {e}")
                    
            else:
                # Verwerk media bestanden (zoek naar bijbehorend HTML bestand)
                base_name = file_path.stem
                # Verwijder versie nummer (_01, _02, etc.) voor matching
                base_name_clean = re.sub(r'_\d+$', '', base_name)
                
                # Zoek naar bijbehorend HTML bestand
                matching_html = None
                for html_name, html_path in html_files.items():
                    if html_name.startswith(base_name_clean):
                        matching_html = html_path
                        break
                
                if matching_html:
                    try:
                        html_content = matching_html.read_text('utf-8')
                        metadata = parse_html_metadata(html_content)
                        
                        if metadata.get('title'):
                            # Use HTML filename (without extension) as key
                            html_key = matching_html.stem
                            
                            if html_key not in items_to_process:
                                items_to_process[html_key] = {'metadata': metadata, 'files': []}
                            
                            items_to_process[html_key]['files'].append(file_path)
                            # Update last modification time if media file is newer
                            media_modified = int(file_path.stat().st_mtime * 1000)
                            if 'last_modified' not in items_to_process[html_key] or media_modified > items_to_process[html_key]['last_modified']:
                                items_to_process[html_key]['last_modified'] = media_modified
                            
                    except Exception as e:
                        print(f"    ⚠️ Kon bijbehorend HTML niet lezen voor {file_path.name}: {e}")

    print(f"\n📊 Scan resultaten:")
    print(f"  📄 Totaal HTML bestanden: {total_html_files}")
    print(f"  🎨 Totaal media bestanden: {total_media_files}")
    print(f"  🔗 Items om te verwerken: {len(items_to_process)}")

    # Tracking variables
    database_operations = {
        'created': [],
        'updated': [],
        'skipped': [],
        'failed': []
    }
    
    storage_operations = {
        'uploaded': [],
        'failed': []
    }

    print(f"\n🔄 Verwerken van items...")
    print("=" * 50)
    
    for html_key, item_data in items_to_process.items():
        title = item_data['metadata']['title']
        language = item_data['metadata'].get('language', 'en')
        local_modified = item_data.get('last_modified', 0)
        
        if html_key in existing_keys and not force_update:
            existing_item = existing_artworks[html_key]
            firebase_modified = existing_item.get('recordCreationDate', 0)
            
            # Check if local files are newer than Firebase data
            if local_modified > firebase_modified:
                print(f"🔄 {title} ({language}) - Lokale bestanden zijn nieuwer, bijwerken...")
                needs_update = True
            else:
                print(f"⏭️  {title} ({language}) - Geen wijzigingen gedetecteerd")
                database_operations['skipped'].append(f"{title} ({language})")
                continue
        else:
            if html_key in existing_keys:
                print(f"🔄 {title} ({language}) - FORCE UPDATE actief, overschrijven...")
                needs_update = True
            else:
                print(f"🆕 {title} ({language}) - Nieuw item aanmaken...")
                needs_update = False  # It's a new item

        # Process the item (create new or update existing)
        artwork_payload = {**item_data['metadata']}
        media_urls = []
        
        # Upload media files
        for file_path in item_data['files']:
            if file_path.suffix == '.html':
                continue  # HTML bestanden niet uploaden naar storage
                
            try:
                blob = bucket.blob(f"{artwork_payload['category']}/{file_path.name}")
                blob.upload_from_filename(str(file_path))
                blob.make_public() # Maak het bestand publiek toegankelijk
                media_urls.append(blob.public_url)
                print(f"  ☁️ {file_path.name}")
                storage_operations['uploaded'].append(file_path.name)
            except Exception as e:
                print(f"  ❌ {file_path.name} - {e}")
                storage_operations['failed'].append(f"{file_path.name}: {e}")
        
        # Assign URLs to payload
        if len(media_urls) > 1:
            artwork_payload['mediaUrls'] = media_urls
        elif len(media_urls) == 1:
            artwork_payload['mediaUrl'] = media_urls[0]

        # Set record creation/update date
        artwork_payload['recordCreationDate'] = local_modified

        # Save to Firebase
        try:
            artworks_ref.child(html_key).set(artwork_payload)
            if needs_update:
                print(f"  ✅ Database bijgewerkt")
                database_operations['updated'].append(f"{title} ({language})")
            else:
                print(f"  ✅ Database entry aangemaakt")
                database_operations['created'].append(f"{title} ({language})")
        except Exception as e:
            print(f"  ❌ Database operatie mislukt: {e}")
            database_operations['failed'].append(f"{title} ({language}): {e}")
            
        print()  # Empty line for spacing

    # Summary report
    print("🎉 Synchronisatie voltooid!")
    print("=" * 50)
    
    print(f"\n📊 DATABASE OPERATIES:")
    print(f"  ✅ Nieuw aangemaakt: {len(database_operations['created'])}")
    for item in database_operations['created']:
        print(f"    • {item}")
    
    print(f"  🔄 Bijgewerkt: {len(database_operations['updated'])}")
    for item in database_operations['updated']:
        print(f"    • {item}")
    
    print(f"  ⏭️  Overgeslagen: {len(database_operations['skipped'])}")
    for item in database_operations['skipped']:
        print(f"    • {item}")
    
    if database_operations['failed']:
        print(f"  ❌ Mislukt: {len(database_operations['failed'])}")
        for item in database_operations['failed']:
            print(f"    • {item}")
    
    print(f"\n☁️  STORAGE OPERATIES:")
    print(f"  ✅ Geüpload: {len(storage_operations['uploaded'])}")
    for item in storage_operations['uploaded']:
        print(f"    • {item}")
    
    if storage_operations['failed']:
        print(f"  ❌ Mislukt: {len(storage_operations['failed'])}")
        for item in storage_operations['failed']:
            print(f"    • {item}")
    
    print(f"\n🏁 TOTAAL OVERZICHT:")
    print(f"  📄 HTML bestanden verwerkt: {total_html_files}")
    print(f"  🎨 Media bestanden verwerkt: {total_media_files}")
    print(f"  🗃️  Database items: {len(database_operations['created']) + len(database_operations['updated'])} actief")
    print(f"  ☁️  Storage bestanden: {len(storage_operations['uploaded'])} geüpload")
    
    if database_operations['failed'] or storage_operations['failed']:
        print(f"  ⚠️  Fouten: {len(database_operations['failed']) + len(storage_operations['failed'])}")
    else:
        print(f"  🎯 Geen fouten!")


# --- SCRIPT UITVOEREN ---
if __name__ == "__main__":
    import sys
    
    # Check for command line arguments
    force_update = '--force' in sys.argv or '-f' in sys.argv
    
    if force_update:
        print("⚠️  FORCE UPDATE mode geactiveerd via command line argument")
    
    sync_to_firebase(force_update=force_update)
