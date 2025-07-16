import os
import pathlib
import re
import json
import os
import pathlib
import re
import sys
import time
import base64
import firebase_admin
from firebase_admin import credentials, initialize_app, db, storage
from typing import Dict, Any, List
import xml.etree.ElementTree as ET

# --- CONFIGURATIE ---
# De bronmap met al uw categorie-submappen (poetry, music, etc.)
SOURCE_MEDIA_FOLDER = pathlib.Path('G:/Mijn Drive/Creatief/Kunstmuur')

# Pad naar uw Firebase service account sleutel
SERVICE_ACCOUNT_KEY_PATH = pathlib.Path(__file__).parent / 'serviceAccountKey_artwall.json'
DATABASE_URL = "https://artwall-by-jr-default-rtdb.europe-west1.firebasedatabase.app/"
STORAGE_BUCKET = "artwall-by-jr.firebasestorage.app"  # Remove the gs:// prefix

# --- SCRIPT LOGICA ---

# Medium and subtype constants (matching the TypeScript definitions)
MEDIUMS = ['drawing', 'writing', 'music', 'sculpture', 'other']

SUBTYPES = {
    'drawing': ['marker', 'pencil', 'digital', 'ink', 'charcoal', 'other'],
    'writing': ['poem', 'prose', 'prosepoetry', 'story', 'essay', 'other'],
    'music': ['song', 'instrumental', 'vocal', 'electronic', 'acoustic', 'other'],
    'sculpture': ['clay', 'wood', 'metal', 'stone', 'other'],
    'other': ['other']
}

# Legacy category to medium/subtype mapping
CATEGORY_TO_MEDIUM_SUBTYPE = {
    'poetry': ('writing', 'poem'),
    'prosepoetry': ('writing', 'prosepoetry'),
    'prose': ('writing', 'story'),
    'music': ('music', 'song'),
    'drawing': ('drawing', 'marker'),
    'sculpture': ('sculpture', 'clay'),
    'image': ('drawing', 'digital'),
    'other': ('other', 'other')
}

# Backwards compatibility: medium to category mapping
MEDIUM_TO_CATEGORY = {
    'drawing': 'drawing',
    'writing': 'poetry',  # Default to poetry for writing
    'music': 'music',
    'sculpture': 'sculpture',
    'other': 'other'
}

def get_medium_subtype_from_category(category: str) -> tuple:
    """Convert legacy category to medium/subtype pair."""
    return CATEGORY_TO_MEDIUM_SUBTYPE.get(category, ('other', 'other'))

def validate_medium_subtype(medium: str, subtype: str) -> bool:
    """Validate that subtype is valid for the given medium."""
    if medium not in MEDIUMS:
        return False
    if subtype not in SUBTYPES.get(medium, []):
        return False
    return True

def normalize_metadata_fields(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize metadata to include both legacy and new fields.
    Handles medium/subtype mapping and backwards compatibility.
    """
    # Handle medium/subtype mapping
    if 'medium' in metadata and 'subtype' in metadata:
        # New format: medium and subtype are explicitly provided
        medium = metadata['medium']
        subtype = metadata['subtype']
        
        # Validate medium/subtype combination
        if not validate_medium_subtype(medium, subtype):
            print(f"    ⚠️ Invalid medium/subtype combination: {medium}/{subtype}, using defaults")
            medium, subtype = ('other', 'other')
            metadata['medium'] = medium
            metadata['subtype'] = subtype
        
        # Set legacy category for backwards compatibility
        if 'category' not in metadata:
            metadata['category'] = MEDIUM_TO_CATEGORY.get(medium, 'other')
            
    elif 'category' in metadata:
        # Legacy format: only category is provided, derive medium/subtype
        category = metadata['category']
        medium, subtype = get_medium_subtype_from_category(category)
        metadata['medium'] = medium
        metadata['subtype'] = subtype
        
    else:
        # Neither medium nor category provided, use defaults
        metadata['medium'] = 'other'
        metadata['subtype'] = 'other'
        metadata['category'] = 'other'
    
    # Validate evaluation and rating fields
    for field in ['evaluation', 'rating']:
        if field in metadata and metadata[field]:
            try:
                value = int(metadata[field])
                if value < 1 or value > 5:
                    print(f"    ⚠️ {field} '{value}' out of range (1-5), removing field")
                    del metadata[field]
            except (ValueError, TypeError):
                print(f"    ⚠️ {field} '{metadata[field]}' is not a number, removing field")
                del metadata[field]
    
    return metadata

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
                        if key in ['year', 'month', 'day', 'evaluation', 'rating'] or (value.isdigit() and len(value) == 4 and key.endswith('year')):
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
        
        # Normalize metadata fields (handle medium/subtype mapping)
        metadata = normalize_metadata_fields(metadata)
        
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

def normalize_artwork_payload(artwork_payload: Dict[str, Any], media_urls: List[str], html_key: str) -> Dict[str, Any]:
    """
    Normalizes the artwork payload to match Next.js app expectations
    """
    category = artwork_payload.get('category', 'other')
    medium = artwork_payload.get('medium', 'other')
    
    # Add required fields
    artwork_payload['id'] = html_key
    artwork_payload['isHidden'] = False
    
    # Convert tags string to array
    if 'tags' in artwork_payload and artwork_payload['tags']:
        artwork_payload['tags'] = [tag.strip() for tag in artwork_payload['tags'].split(',') if tag.strip()]
    else:
        artwork_payload['tags'] = []
    
    # Map media URLs to category-specific fields (enhanced for new mediums)
    if media_urls:
        if category == 'prose' or (medium == 'writing' and artwork_payload.get('subtype') == 'story'):
            # For prose/stories: first image is coverImageUrl, first PDF is pdfUrl
            for url in media_urls:
                if any(ext in url.lower() for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']):
                    artwork_payload['coverImageUrl'] = url
                elif '.pdf' in url.lower():
                    artwork_payload['pdfUrl'] = url
        
        elif category == 'music' or medium == 'music':
            # For music: first audio file is audioUrl
            for url in media_urls:
                if any(ext in url.lower() for ext in ['.mp3', '.wav', '.m4a', '.flac', '.ogg']):
                    artwork_payload['audioUrl'] = url
                    break
        
        elif category in ['sculpture', 'drawing'] or medium in ['sculpture', 'drawing']:
            # For visual art: first image is coverImageUrl
            for url in media_urls:
                if any(ext in url.lower() for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']):
                    artwork_payload['coverImageUrl'] = url
                    break
        
        elif category == 'image' or medium == 'photography':
            # For photography: first image is coverImageUrl
            for url in media_urls:
                if any(ext in url.lower() for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.raw']):
                    artwork_payload['coverImageUrl'] = url
                    break
        
        elif category == 'video' or medium == 'video':
            # For video: first video file is mediaUrl
            for url in media_urls:
                if any(ext in url.lower() for ext in ['.mp4', '.mov', '.avi', '.webm', '.mkv']):
                    artwork_payload['mediaUrl'] = url
                    break
        
        # Keep original mediaUrl/mediaUrls for backwards compatibility
        if len(media_urls) > 1:
            artwork_payload['mediaUrls'] = media_urls
        elif len(media_urls) == 1:
            artwork_payload['mediaUrl'] = media_urls[0]
    
    return artwork_payload

def group_artworks_by_base_key(items_to_process: Dict[str, Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """
    Groups artworks by their base key (without language suffix) and combines language versions
    """
    grouped_items = {}
    
    for html_key, item_data in items_to_process.items():
        # Extract base key by removing language suffix
        base_key = html_key
        if re.search(r'_[a-z]{2}$', html_key):  # Ends with _xx (language code)
            base_key = html_key[:-3]
        
        if base_key not in grouped_items:
            grouped_items[base_key] = {
                'metadata': item_data['metadata'].copy(),
                'files': item_data['files'].copy(),
                'last_modified': item_data.get('last_modified', 0),
                'languages': {},
                'primary_language': None  # Will be determined later
            }
        
        # Determine language from filename
        language = 'en'  # Default fallback
        if html_key.endswith('_en'):
            language = 'en'
        elif html_key.endswith('_nl'):
            language = 'nl'
        elif html_key.endswith('_it'):
            language = 'it'
        elif html_key.endswith('_de'):
            language = 'de'
        elif html_key.endswith('_fr'):
            language = 'fr'
        elif html_key.endswith('_es'):
            language = 'es'
        # Add more language codes as needed
        
        # Store language-specific data
        grouped_items[base_key]['languages'][language] = {
            'title': item_data['metadata'].get('title', ''),
            'description': item_data['metadata'].get('description', ''),
            'content': item_data['metadata'].get('content', ''),
            'lyrics': item_data['metadata'].get('lyrics', ''),
            'html_key': html_key
        }
        
        # 🔥 IMPORTANT: Check if this is the original language by looking at language1 field
        original_language = item_data['metadata'].get('language1', item_data['metadata'].get('language', 'en'))
        
        # If this language matches the original language, or if we haven't set a primary yet
        if (original_language == language) or (grouped_items[base_key]['primary_language'] is None):
            if original_language == language:
                # This is definitely the original language
                grouped_items[base_key]['primary_language'] = language
                grouped_items[base_key]['metadata'] = item_data['metadata'].copy()
                grouped_items[base_key]['metadata']['language1'] = language
                print(f"    🎯 Originele taal gevonden: {language} voor {base_key}")
            elif grouped_items[base_key]['primary_language'] is None:
                # Fallback: use first language encountered if no original found yet
                grouped_items[base_key]['primary_language'] = language
                grouped_items[base_key]['metadata']['language1'] = language
    
    # Final check: ensure all items have a primary language
    for base_key, grouped_item in grouped_items.items():
        if grouped_item['primary_language'] is None:
            # Use the first available language as fallback
            first_lang = list(grouped_item['languages'].keys())[0]
            grouped_item['primary_language'] = first_lang
            grouped_item['metadata']['language1'] = first_lang
            print(f"    ⚠️ Geen originele taal gevonden, gebruik {first_lang} als primair voor {base_key}")
    
    return grouped_items

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

    # **🔥 HERE'S THE KEY CHANGE: Group items by base key to combine languages**
    print(f"\n🔄 Groeperen van taalversies...")
    grouped_items = group_artworks_by_base_key(items_to_process)
    print(f"📊 {len(items_to_process)} individuele items gecombineerd tot {len(grouped_items)} unieke kunstwerken")

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

    print(f"\n🔄 Verwerken van gecombineerde items...")
    print("=" * 50)
    
    # **🔥 PROCESS GROUPED ITEMS INSTEAD OF INDIVIDUAL ITEMS**
    for base_key, grouped_item in grouped_items.items():
        primary_lang = grouped_item['primary_language']
        metadata = grouped_item['metadata']
        title = metadata['title']
        local_modified = grouped_item.get('last_modified', 0)
        
        # Show which languages are being combined
        available_languages = list(grouped_item['languages'].keys())
        lang_display = f"({', '.join(available_languages)})"
        
        if base_key in existing_keys and not force_update:
            existing_item = existing_artworks[base_key]
            firebase_modified = existing_item.get('recordCreationDate', 0)
            
            # Check if local files are newer than Firebase data
            if local_modified > firebase_modified:
                print(f"🔄 {title} {lang_display} - Lokale bestanden zijn nieuwer, bijwerken...")
                needs_update = True
            else:
                print(f"⏭️  {title} {lang_display} - Geen wijzigingen gedetecteerd")
                database_operations['skipped'].append(f"{title} {lang_display}")
                continue
        else:
            if base_key in existing_keys:
                print(f"🔄 {title} {lang_display} - FORCE UPDATE actief, overschrijven...")
                needs_update = True
            else:
                print(f"🆕 {title} {lang_display} - Nieuw gecombineerd item aanmaken...")
                needs_update = False  # It's a new item

        # **🔥 CREATE COMBINED ARTWORK WITH TRANSLATIONS**
        artwork_payload = create_combined_artwork(base_key, grouped_item)
        media_urls = []
        
        # Upload media files from all language versions
        for file_path in grouped_item['files']:
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
        
        # Apply media URL normalization
        artwork_payload = normalize_artwork_payload(artwork_payload, media_urls, base_key)

        # Set record creation/update date
        artwork_payload['recordCreationDate'] = local_modified

        # Save to Firebase
        try:
            artworks_ref.child(base_key).set(artwork_payload)
            if needs_update:
                print(f"  ✅ Database bijgewerkt")
                database_operations['updated'].append(f"{title} {lang_display}")
            else:
                print(f"  ✅ Database entry aangemaakt")
                database_operations['created'].append(f"{title} {lang_display}")
        except Exception as e:
            print(f"  ❌ Database operatie mislukt: {e}")
            database_operations['failed'].append(f"{title} {lang_display}: {e}")
            
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

# In your sync function, modify the artwork creation
def create_combined_artwork(base_key: str, grouped_item: Dict[str, Any]) -> Dict[str, Any]:
    """Creates a combined artwork record with translations and new metadata fields"""
    primary_lang = grouped_item['primary_language']
    metadata = grouped_item['metadata']
    
    # Get the original language content
    original_content = grouped_item['languages'].get(primary_lang, {})
    
    # Create the base artwork with primary language content
    artwork_payload = {
        'id': base_key,
        'title': original_content.get('title', metadata.get('title', '')),
        'description': original_content.get('description', metadata.get('description', '')),
        'content': original_content.get('content', metadata.get('content', '')),
        'lyrics': original_content.get('lyrics', metadata.get('lyrics', '')),
        'language1': primary_lang,
        'translations': {},
        'isHidden': False,
        # NEW: Include medium and subtype fields
        'medium': metadata.get('medium', 'other'),
        'subtype': metadata.get('subtype', 'other'),
        # NEW: Include evaluation and rating fields
        'evaluation': metadata.get('evaluation', ''),
        'rating': metadata.get('rating', ''),
    }
    
    # Add all language versions to translations
    for lang_code, lang_data in grouped_item['languages'].items():
        artwork_payload['translations'][lang_code] = {
            'title': lang_data['title'],
            'description': lang_data['description'],
            'content': lang_data.get('content', ''),
            'lyrics': lang_data.get('lyrics', '')
        }
    
    # Add secondary languages if available (excluding the primary language)
    lang_codes = [lang for lang in grouped_item['languages'].keys() if lang != primary_lang]
    if len(lang_codes) > 0:
        artwork_payload['language2'] = lang_codes[0]
    if len(lang_codes) > 1:
        artwork_payload['language3'] = lang_codes[1]
    
    # Add other metadata (category, year, etc.)
    for key, value in metadata.items():
        if key not in ['title', 'description', 'content', 'lyrics', 'medium', 'subtype', 'evaluation', 'rating']:
            artwork_payload[key] = value
    
    return artwork_payload


# --- SCRIPT UITVOEREN ---
if __name__ == "__main__":
    import sys
    
    # Check for command line arguments
    force_update = '--force' in sys.argv or '-f' in sys.argv
    
    if force_update:
        print("⚠️  FORCE UPDATE mode geactiveerd via command line argument")
    
    sync_to_firebase(force_update=force_update)
