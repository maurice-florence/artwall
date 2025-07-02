import os
import pathlib
import re
from typing import Dict, Any

# --- CONFIGURATIE ---

# 1. Definieer de hoofdmap die u wilt scannen.
#    Dit kan de hoofdmap zijn (met submappen) of een specifieke categorie-map.
MEDIA_SOURCE_FOLDER = pathlib.Path('G:/Mijn Drive/Creatief/Kunstmuur/drawing')

# 2. Definieer de universele template voor de metadata.
METADATA_TEMPLATE = """---META_BEGIN---
title: '{title}'
year: {year}
month: {month}
day: {day}
category: '{category}'
version: '{version}'
language: '{language}'
description: ''
location1: ''
location2: ''
tags: ''
soundcloudEmbedUrl: ''
soundcloudTrackUrl: ''
---META_END---
"""

# --- SCRIPT LOGICA ---

def parse_metadata_from_filename(filename: str, category_from_folder: str) -> Dict[str, Any]:
    """
    Extraheert metadata uit een bestandsnaam.
    Gebruikt de categorie van de map als de primaire bron.
    """
    try:
        # FIX: Maak de bestandsnaam schoon van onzichtbare Unicode-tekens (zoals LRM) en witruimte.
        clean_filename = filename.lstrip('\u200e').strip()
        
        # Verbeterde en robuustere reguliere expressie.
        pattern = re.compile(r"(\d{8})_([^_]+)_(.*?)(?:_([a-z]{2}))?(?:_(\d+))?\.\w+")
        match = pattern.match(clean_filename)
        
        if not match:
            # FIX: Verbeterde foutmelding voor betere diagnose.
            print(f"  - ⚠️  Bestandsnaam '{clean_filename}' (origineel: '{filename}') komt niet overeen met het verwachte format (JJJJMMDD_categorie_titel...).")
            return {}

        date_str, _, title_part, language, version = match.groups()
        
        title = title_part.replace('-', ' ').capitalize()

        return {
            'title': title,
            'year': int(date_str[0:4]),
            'month': int(date_str[4:6]),
            'day': int(date_str[6:8]),
            'category': category_from_folder, # Gebruik altijd de mapnaam als categorie
            'language': language or 'nl',
            'version': version or '1'
        }
    except (IndexError, ValueError) as e:
        print(f"  - ❌ Fout bij parsen van '{filename}': {e}")
        return {}

def generate_metadata_for_folder(folder_to_scan: pathlib.Path):
    """
    Verwerkt een enkele map en genereert de .md bestanden voor de media daarin.
    """
    files_generated = 0
    files_skipped_existing = 0
    files_skipped_error = 0
    
    category = folder_to_scan.name
    print(f"\n📁 Scannen van map: '{category}'...")
    
    for file_path in folder_to_scan.iterdir():
        if file_path.is_file() and file_path.suffix != '.md':
            
            md_path = file_path.with_suffix('.md')
            
            if md_path.exists():
                print(f"  - ⏭️  Overslaan, metadata bestand bestaat al voor: {file_path.name}")
                files_skipped_existing += 1
                continue
            
            metadata = parse_metadata_from_filename(file_path.name, category)
            
            if not metadata:
                files_skipped_error += 1
                continue

            md_content = METADATA_TEMPLATE.format(
                title=metadata.get('title', ''),
                year=metadata.get('year', ''),
                month=metadata.get('month', ''),
                day=metadata.get('day', ''),
                category=metadata.get('category', ''),
                language=metadata.get('language', 'nl'),
                version=metadata.get('version', '1')
            )
            
            try:
                md_path.write_text(md_content, encoding='utf-8')
                print(f"  - ✅ Metadata bestand aangemaakt voor: {file_path.name}")
                files_generated += 1
            except Exception as e:
                print(f"  - ❌ Fout bij schrijven van {md_path.name}: {e}")
                files_skipped_error += 1
    
    return files_generated, files_skipped_existing, files_skipped_error

def main(root_folder: pathlib.Path):
    """
    Hoofdfunctie die bepaalt of er één map of een map met submappen gescand moet worden.
    """
    print(f"--- Starten van Metadata Generator in: '{root_folder}' ---")
    
    if not root_folder.is_dir():
        print(f"❌ Fout: De bronmap '{root_folder}' bestaat niet. Controleer het pad.")
        return

    total_generated = 0
    total_skipped_existing = 0
    total_skipped_error = 0

    subdirs = [d for d in root_folder.iterdir() if d.is_dir()]
    
    if subdirs:
        print(f"ℹ️  Hoofdmap gedetecteerd. Scannen van {len(subdirs)} submappen...")
        for category_dir in subdirs:
            g, se, serr = generate_metadata_for_folder(category_dir)
            total_generated += g
            total_skipped_existing += se
            total_skipped_error += serr
    else:
        print(f"ℹ️  Enkele map gedetecteerd. Direct scannen...")
        g, se, serr = generate_metadata_for_folder(root_folder)
        total_generated += g
        total_skipped_existing += se
        total_skipped_error += serr

    print(f"\n🎉 Proces voltooid.")
    print(f"   Totaal {total_generated} nieuwe metadata bestanden aangemaakt.")
    print(f"   Totaal {total_skipped_existing} bestanden overgeslagen (metadata bestond al).")
    print(f"   Totaal {total_skipped_error} bestanden overgeslagen (ongeldige naam of fout).")


# --- SCRIPT UITVOEREN ---

if __name__ == "__main__":
    main(MEDIA_SOURCE_FOLDER)
