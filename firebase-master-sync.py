import os
import pathlib
import re
import yaml  # Vereist: pip install pyyaml
from firebase_admin import credentials, initialize_app, db, storage
from typing import Dict, Any

# --- CONFIGURATIE ---
# De bronmap met al uw categorie-submappen (poetry, music, etc.)
SOURCE_MEDIA_FOLDER = pathlib.Path('G:/Mijn Drive/Creatief/Kunstmuur')

# Pad naar uw Firebase service account sleutel
SERVICE_ACCOUNT_KEY_PATH = pathlib.Path(__file__).parent / 'serviceAccountKey.json'
DATABASE_URL = "https://creatieve-tijdlijn-default-rtdb.europe-west1.firebasedatabase.app/"
STORAGE_BUCKET = "creatieve-tijdlijn.appspot.com"

# --- SCRIPT LOGICA ---

def parse_metadata_from_filename(filename: str) -> Dict[str, Any]:
    """
    Fallback functie: Extraheert basis-metadata uit een bestandsnaam 
    als er geen .md-bestand wordt gevonden.
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

def sync_to_firebase():
    """
    Scant de lokale media map, leest metadata uit .md bestanden (YAML frontmatter),
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
    # Maak een set van unieke identifiers (bv. titel + datum)
    existing_identifiers = set(f"{art.get('title')}_{art.get('year')}{art.get('month')}{art.get('day')}" for art in existing_artworks.values())
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
        md_files = {f.stem: f for f in all_files if f.suffix == '.md'}

        for file_path in all_files:
            if file_path.suffix == '.md':
                continue # Sla .md bestanden over in de hoofdloop

            base_name = file_path.stem
            metadata = {}
            
            # Zoek naar een bijbehorend .md bestand
            if base_name in md_files:
                md_path = md_files[base_name]
                try:
                    file_content = md_path.read_text('utf-8')
                    # Gebruik een veilige lader voor YAML
                    frontmatter = next(yaml.safe_load_all(file_content.split('---')[1]))
                    metadata = {k.lower(): v for k, v in frontmatter.items()}
                    content = file_content.split('---', 2)[-1].strip()
                    print(f"  - Metadata gevonden in {md_path.name} voor {file_path.name}")
                except Exception as e:
                    print(f"⚠️ Kon YAML niet lezen uit {md_path.name}, valt terug op bestandsnaam: {e}")
                    metadata = parse_metadata_from_filename(file_path.name)
            else:
                # Prioriteit 2: Fallback naar metadata uit bestandsnaam
                metadata = parse_metadata_from_filename(file_path.name)

            if not metadata.get('title'):
                continue

            identifier = f"{metadata['title']}_{metadata['year']}{metadata['month']}{metadata['day']}"
            
            # Groepeer bestanden op basis van hun identifier
            if identifier not in items_to_process:
                items_to_process[identifier] = {'metadata': metadata, 'files': []}
            
            items_to_process[identifier]['files'].append(file_path)
            if content:
                items_to_process[identifier]['metadata']['content'] = content


    print("\n--- Verwerken en uploaden van nieuwe items ---")
    for identifier, item_data in items_to_process.items():
        if identifier in existing_identifiers:
            print(f"⏭️  Item overgeslagen (bestaat al): {item_data['metadata']['title']}")
            continue

        artwork_payload = {**item_data['metadata']}
        media_urls = []
        
        for file_path in item_data['files']:
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

        artwork_payload['recordCreationDate'] = int(pathlib.Path(item_data['files'][0]).stat().st_ctime * 1000)

        # Push naar de database
        try:
            artworks_ref.push(artwork_payload)
            print(f"✅ Database entry aangemaakt voor: {artwork_payload['title']}\n")
        except Exception as e:
            print(f"❌ Fout bij schrijven naar database voor {artwork_payload['title']}: {e}\n")

    print("🎉 Synchronisatie voltooid!")


# --- SCRIPT UITVOEREN ---
if __name__ == "__main__":
    sync_to_firebase()
