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
STORAGE_BUCKET = "creatieve-tijdlijn.appspot.com"

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
    """
    metadata = {}
    content = ""
    
    try:
        # Zoek naar metadata in de HTML structuur
        # De metadata staat in een div met class="metadata"
        metadata_match = re.search(r'<div class="metadata">(.*?)</div>', html_content, re.DOTALL)
        if metadata_match:
            metadata_html = metadata_match.group(1)
            
            # Parse de metadata regels
            for line in metadata_html.split('\n'):
                line = line.strip()
                if ':' in line:
                    # Verwijder HTML tags
                    clean_line = re.sub(r'<[^>]+>', '', line)
                    if ':' in clean_line:
                        key, value = clean_line.split(':', 1)
                        key = key.strip().lower()
                        value = value.strip()
                        
                        # Converteer numerieke waarden
                        if key in ['year', 'month', 'day']:
                            try:
                                metadata[key] = int(value)
                            except ValueError:
                                metadata[key] = value
                        else:
                            metadata[key] = value
        
        # Extraheer content (alles behalve metadata)
        content_match = re.search(r'<div class="content">(.*?)</div>', html_content, re.DOTALL)
        if content_match:
            content = content_match.group(1).strip()
        else:
            # Fallback: neem alles voor de metadata sectie
            content_parts = html_content.split('<div class="metadata">')
            if len(content_parts) > 1:
                content = content_parts[0].strip()
        
        metadata['content'] = content
        
    except Exception as e:
        print(f"⚠️ Fout bij parsen van HTML metadata: {e}")
        return {}
    
    return metadata

def sync_to_firebase():
    """
    Scant de lokale media map, leest metadata uit .html bestanden,
    vergelijkt met Firebase, en uploadt/update nieuwe of gewijzigde items.
    """
    print("\n--- Starten van Firebase Synchronisatie ---")
    
    try:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        if not initialize_app._apps: # Voorkom her-initialisatie
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
    existing_identifiers = set()
    for art in existing_artworks.values():
        lang = art.get('language', 'en')
        identifier = f"{art.get('title')}_{art.get('year')}{art.get('month'):02d}{art.get('day'):02d}_{lang}"
        existing_identifiers.add(identifier)
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
            print(f"⏭️  Item overgeslagen (bestaat al): {item_data['metadata']['title']}")
            continue

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
