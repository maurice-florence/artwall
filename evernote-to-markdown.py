import os
import pathlib
import xml.etree.ElementTree as ET
import re
import sys
import yaml  # Vereist: pip install pyyaml
import base64
from typing import Dict, Any, List, Tuple

# Probeer html2text te importeren voor betere Markdown-conversie
try:
    import html2text
    HTML2TEXT_AVAILABLE = True
except ImportError:
    HTML2TEXT_AVAILABLE = False
    print("[INFO] 'html2text' not found. Markdown conversion will be basic. For best results, run: pip install html2text")

# --- CONFIGURATIE ---
# De map waar uw .enex exportbestanden van Evernote staan.
SOURCE_ENEX_FOLDER = pathlib.Path('G:/Mijn Drive/Creatief/Kunstmuur/kunstmuur_export')
# De hoofdmap waar de uiteindelijke categorie-mappen (music, drawing, etc.) worden aangemaakt.
DESTINATION_MEDIA_FOLDER = pathlib.Path('G:/Mijn Drive/Creatief/Kunstmuur/media_export')

# --- SCRIPT LOGICA ---

def extract_metadata_and_content(note_content: str) -> Tuple[Dict[str, Any], str, str]:
    """
    Extraheert metadata en content uit een Evernote-notitie.
    Retourneert (metadata_dict, hoofd_content, kladblok_content).
    """
    metadata = {}
    main_content = note_content
    ignored_content = ""

    meta_match = re.search(r'---META_BEGIN---(.*?)---META_END---', note_content, re.DOTALL)
    
    if meta_match:
        meta_block = meta_match.group(1)
        try:
            metadata = yaml.safe_load(meta_block) or {}
            # Splits de content op basis van het hele meta-blok
            parts = note_content.split(meta_match.group(0), 1)
            main_content = parts[0].strip()
            if len(parts) > 1:
                ignored_content = parts[1].strip()
        except yaml.YAMLError as e:
            print(f"  - ⚠️  YAML parsing error: {e}")
            
    return {k.lower(): v for k, v in metadata.items()}, main_content, ignored_content

def html_to_markdown(html: str) -> str:
    """Converteert Evernote's HTML (ENML) naar schone Markdown."""
    if HTML2TEXT_AVAILABLE:
        h = html2text.HTML2Text()
        h.body_width = 0 # Geen automatische regeleindes
        return h.handle(html).strip()
    else:
        # Basis conversie als html2text niet beschikbaar is
        text = re.sub(r'<div><br\s*/?></div>', '\n', html)
        text = re.sub(r'<(div|p)>(.*?)</(div|p)>', r'\2\n', text)
        text = re.sub(r'<br\s*/?>', '\n', text)
        text = re.sub(r'<[^>]+>', '', text) # Strip alle overgebleven tags
        return text.strip()

def generate_filename(meta: Dict[str, Any], lang: str = None, version: int = None) -> str:
    """Genereert een gestandaardiseerde bestandsnaam."""
    date = f"{meta.get('year', '0000')}{str(meta.get('month', '00')).zfill(2)}{str(meta.get('day', '00')).zfill(2)}"
    category = meta.get('category', 'unknown')
    title = meta.get('title', 'untitled').lower()
    safe_title = re.sub(r'[^a-z0-9]+', '-', title).strip('-')
    
    filename = f"{date}_{category}_{safe_title}"
    if lang:
        filename += f"_{lang}"
    if version:
        filename += f"_{str(version).zfill(2)}"
        
    return filename

def validate_notes(enex_files: List[pathlib.Path]) -> bool:
    """
    Voert een pre-flight check uit op alle notities.
    Retourneert True als alles geldig is, anders False.
    """
    print("\n--- Starten van Validatie ---")
    all_valid = True
    total_notes_checked = 0
    
    required_fields = ['title', 'year', 'month', 'day', 'category']

    for enex_file in enex_files:
        print(f"🔍 Valideren van {enex_file.name}...")
        try:
            tree = ET.parse(enex_file)
            root = tree.getroot()
            notes = root.findall('.//note')
            for note in notes:
                total_notes_checked += 1
                title = note.findtext('title', 'Untitled')
                content = note.findtext('content', '')
                meta, _, _ = extract_metadata_and_content(content)
                
                missing_fields = [field for field in required_fields if not meta.get(field)]
                if missing_fields:
                    print(f"  - ❌ FOUT in notitie '{title}': Ontbrekende verplichte velden: {', '.join(missing_fields)}")
                    all_valid = False
        except Exception as e:
            print(f"  - ❌ FOUT bij lezen van {enex_file.name}: {e}")
            all_valid = False
            
    if all_valid:
        print(f"✅ Validatie succesvol. {total_notes_checked} notities gecontroleerd.")
    else:
        print("\n❌ Validatie mislukt. Corrigeer de bovenstaande fouten en probeer het opnieuw.")
        
    return all_valid

def process_enex_files(source_dir: pathlib.Path, dest_dir: pathlib.Path):
    """
    Converteert alle .enex bestanden naar de juiste output-bestanden op basis van categorie.
    """
    enex_files = list(source_dir.glob('*.enex'))
    if not enex_files:
        print("⚠️  Geen .enex bestanden gevonden om te verwerken.")
        return

    if not validate_notes(enex_files):
        sys.exit(1) # Stop het script als de validatie mislukt

    print("\n--- Starten van Conversie & Generatie ---")
    for enex_file in enex_files:
        print(f"\n🔄 Verwerken van {enex_file.name}...")
        tree = ET.parse(enex_file)
        root = tree.getroot()
        notes = root.findall('.//note')

        for note in notes:
            note_title = note.findtext('title', 'Untitled')
            content_xml = note.findtext('content', '')
            meta, main_content_html, _ = extract_metadata_and_content(content_xml)
            
            category = meta.get('category')
            if not category:
                print(f"  - ⏭️  Overslaan van '{note_title}': geen categorie gevonden in metadata.")
                continue

            # Maak de doelmap voor de categorie aan
            category_folder = dest_dir / category
            category_folder.mkdir(parents=True, exist_ok=True)

            # --- Categorie-specifieke logica ---
            
            if category in ['poetry', 'prosepoetry', 'music']:
                # Verwerk tekst en vertalingen
                # ... (logica om vertalingen te splitsen en aparte .md bestanden te maken) ...
                base_filename = generate_filename(meta, lang=meta.get('language', 'nl'))
                md_path = category_folder / f"{base_name}.md"
                
                # Creëer YAML content
                yaml_content = yaml.dump(meta, allow_unicode=True, default_flow_style=False)
                md_body = html_to_markdown(main_content_html)
                
                md_path.write_text(f"---\n{yaml_content}---\n\n{md_body}", encoding='utf-8')
                print(f"  - ✅ Tekstbestand aangemaakt: {md_path.name}")

            elif category in ['drawing', 'sculpture', 'beeld', 'proza']:
                # Verwerk afbeeldingen
                resources = note.findall('resource')
                if not resources:
                    print(f"  - ⚠️  Waarschuwing in '{note_title}': Categorie is '{category}', maar geen afbeelding gevonden.")
                    continue

                for idx, resource in enumerate(resources):
                    mime = resource.findtext('mime')
                    ext = '.jpg' if 'jpeg' in mime else '.png' if 'png' in mime else ''
                    data_b64 = resource.findtext('data')
                    
                    if not data_b64: continue

                    # Genereer bestandsnaam
                    version = idx + 1 if len(resources) > 1 else None
                    base_filename = generate_filename(meta, version=version)
                    image_path = category_folder / f"{base_filename}{ext}"
                    md_path = category_folder / f"{base_filename}.md"
                    
                    # Sla afbeelding op
                    with open(image_path, 'wb') as f:
                        f.write(base64.b64decode(data_b64))
                    print(f"  - ✅ Afbeelding opgeslagen: {image_path.name}")

                    # Sla companion .md file op
                    yaml_content = yaml.dump(meta, allow_unicode=True, default_flow_style=False)
                    # Voor proza, voeg de synopsis toe als body
                    body = html_to_markdown(main_content_html) if category == 'proza' else ''
                    md_path.write_text(f"---\n{yaml_content}---\n\n{body}", encoding='utf-8')
                    print(f"  - ✅ Metadata bestand aangemaakt: {md_path.name}")


# --- SCRIPT UITVOEREN ---
if __name__ == "__main__":
    print("========================================")
    print(" Evernote .enex Converter & Generator")
    print("========================================")
    process_enex_files(SOURCE_ENEX_FOLDER, DESTINATION_MEDIA_FOLDER)
    print("\n🎉 Alle .enex bestanden zijn verwerkt.")

