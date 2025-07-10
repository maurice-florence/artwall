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
                            # Include all fields, even empty ones (convert empty string to null)
                            metadata[key] = value if value else None
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

def sync_to_firebase():
    """
    Scant de lokale media map, leest metadata uit .html bestanden,
    vergelijkt met Firebase, en uploadt/update nieuwe of gewijzigde items.
    """
    print("\n--- Starten van Firebase Synchronisatie ---")
    
    try:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        # Correct way to check if Firebase is already initialized
        import firebase_admin
        if not firebase_admin._apps:
            initialize_app(cred, {
                'databaseURL': DATABASE_URL,
                'storageBucket': STORAGE_BUCKET
            })
        print("✅ Firebase succesvol geïnitialiseerd.")
    except Exception as e:
        print(f"❌ Fout bij initialiseren Firebase: {e}")
        return

    print("🔄 Ophalen van bestaande data uit de database...")
    artworks_ref = db.reference('artworks')
    existing_artworks = artworks_ref.get() or {}
    # Maak een set van unieke identifiers (bv. titel + datum + taal)
    existing_identifiers = {}  # Changed to dict to store Firebase keys
    for firebase_key, art in existing_artworks.items():
        lang = art.get('language', 'en')
        identifier = f"{art.get('title')}_{art.get('year')}{art.get('month'):02d}{art.get('day'):02d}_{lang}"
        existing_identifiers[identifier] = {
            'firebase_key': firebase_key,
            'has_media': bool(art.get('mediaUrl') or art.get('mediaUrls'))
        }
    print(f"ℹ️  {len(existing_identifiers)} bestaande items gevonden.")

    bucket = storage.bucket()
    items_to_process: Dict[str, Dict[str, Any]] = {}

    print("\n--- Scannen van lokale bestanden en metadata ---")
    for category_dir in SOURCE_MEDIA_FOLDER.iterdir():
        if not category_dir.is_dir():
            continue
        
        category = category_dir.name
        print(f"\n📁 Scannen van map: '{category}'...")
        
        all_files = list(category_dir.iterdir())
        html_files = {f.stem: f for f in all_files if f.suffix == '.html'}

        for file_path in all_files:
            if file_path.suffix == '.html':
                # Verwerk HTML bestanden
                try:
                    html_content = file_path.read_text('utf-8')
                    metadata = parse_html_metadata(html_content)
                    
                    if not metadata.get('title'):
                        metadata = parse_metadata_from_filename(file_path.name)
                    
                    if metadata.get('title'):
                        # Gebruik taal in identifier voor meertalige content
                        lang = metadata.get('language', 'en')
                        identifier = f"{metadata['title']}_{metadata['year']}{metadata['month']:02d}{metadata['day']:02d}_{lang}"
                        
                        if identifier not in items_to_process:
                            items_to_process[identifier] = {'metadata': metadata, 'files': []}
                        
                        items_to_process[identifier]['files'].append(file_path)
                        print(f"  - HTML metadata gevonden: {file_path.name}")
                        
                except Exception as e:
                    print(f"⚠️ Kon HTML niet lezen uit {file_path.name}: {e}")
                    
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
                            lang = metadata.get('language', 'en')
                            identifier = f"{metadata['title']}_{metadata['year']}{metadata['month']:02d}{metadata['day']:02d}_{lang}"
                            
                            if identifier not in items_to_process:
                                items_to_process[identifier] = {'metadata': metadata, 'files': []}
                            
                            items_to_process[identifier]['files'].append(file_path)
                            
                    except Exception as e:
                        print(f"⚠️ Kon bijbehorend HTML niet lezen voor {file_path.name}: {e}")

    print("\n--- Verwerken en uploaden van nieuwe items ---")
    for identifier, item_data in items_to_process.items():
        if identifier in existing_identifiers:
            existing_item = existing_identifiers[identifier]
            
            # Check if existing item has media files
            if existing_item['has_media']:
                print(f"⏭️  Item overgeslagen (bestaat al met media): {item_data['metadata']['title']}")
                continue
            else:
                print(f"🔄 Item bestaat al maar mist media bestanden: {item_data['metadata']['title']}")
                # Upload media files and update existing entry
                artwork_payload = {**item_data['metadata']}
                media_urls = []
                
                for file_path in item_data['files']:
                    if file_path.suffix == '.html':
                        continue  # HTML bestanden niet uploaden naar storage
                        
                    try:
                        blob = bucket.blob(f"{artwork_payload['category']}/{file_path.name}")
                        blob.upload_from_filename(str(file_path))
                        blob.make_public() # Maak het bestand publiek toegankelijk
                        media_urls.append(blob.public_url)
                        print(f"  ☁️ Bestand geüpload: {file_path.name}")
                    except Exception as e:
                        print(f"❌ Fout bij uploaden van {file_path.name}: {e}")
                
                # Update existing entry with media URLs
                if media_urls:
                    update_data = {}
                    if len(media_urls) > 1:
                        update_data['mediaUrls'] = media_urls
                    elif len(media_urls) == 1:
                        update_data['mediaUrl'] = media_urls[0]
                    
                    try:
                        artworks_ref.child(existing_item['firebase_key']).update(update_data)
                        print(f"✅ Media toegevoegd aan bestaand item: {artwork_payload['title']}\n")
                    except Exception as e:
                        print(f"❌ Fout bij updaten van {artwork_payload['title']}: {e}\n")
                continue

        # Create new entry
        artwork_payload = {**item_data['metadata']}
        media_urls = []
        
        for file_path in item_data['files']:
            if file_path.suffix == '.html':
                continue  # HTML bestanden niet uploaden naar storage
                
            try:
                blob = bucket.blob(f"{artwork_payload['category']}/{file_path.name}")
                blob.upload_from_filename(str(file_path))
                blob.make_public() # Maak het bestand publiek toegankelijk
                media_urls.append(blob.public_url)
                print(f"  ☁️ Bestand geüpload: {file_path.name}")
            except Exception as e:
                print(f"❌ Fout bij uploaden van {file_path.name}: {e}")
        
        # Wijs URL's toe aan het payload object
        if len(media_urls) > 1:
            artwork_payload['mediaUrls'] = media_urls
        elif len(media_urls) == 1:
            artwork_payload['mediaUrl'] = media_urls[0]

        # Gebruik HTML bestand voor creation date
        html_files = [f for f in item_data['files'] if f.suffix == '.html']
        if html_files:
            artwork_payload['recordCreationDate'] = int(html_files[0].stat().st_ctime * 1000)
        else:
            artwork_payload['recordCreationDate'] = int(item_data['files'][0].stat().st_ctime * 1000)

        # Push naar de database
        try:
            artworks_ref.push(artwork_payload)
            print(f"✅ Database entry aangemaakt voor: {artwork_payload['title']} ({artwork_payload.get('language', 'en')})\n")
        except Exception as e:
            print(f"❌ Fout bij schrijven naar database voor {artwork_payload['title']}: {e}\n")

    print("🎉 Synchronisatie voltooid!")


# --- SCRIPT UITVOEREN ---
if __name__ == "__main__":
    sync_to_firebase()
