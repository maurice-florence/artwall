import os
import pathlib
import xml.etree.ElementTree as ET
import re
import sys
import yaml  # Vereist: pip install pyyaml
import base64
import time
from typing import Dict, Any, List, Tuple

# --- CONFIGURATIE ---
SOURCE_ENEX_FOLDER = pathlib.Path('G:/Mijn Drive/Creatief/Kunstmuur')
DESTINATION_MEDIA_FOLDER = pathlib.Path('G:/Mijn Drive/Creatief/Kunstmuur')

# --- VALIDATIE REGELS ---
"""
VERPLICHTE METADATA VELDEN VOOR ALLE NOTITIES:
- title: moet ingevuld zijn (niet leeg)
- year: moet een geldig jaar zijn (4 cijfers)
- month: moet een geldige maand zijn (1-12)
- day: moet een geldige dag zijn (1-31)
- category: moet een van de toegestane categorieën zijn
- version: moet ingevuld zijn (meestal '01')

TOEGESTANE CATEGORIEËN:
- poetry: gedichten (tekst met vertalingen)
- prosepoetry: proza-poëzie (tekst met vertalingen)
- music: muziek/songteksten (tekst met vertalingen)
- drawing: tekeningen (media + metadata)
- sculpture: beeldhouwwerk (media + metadata)
- prose: proza/verhalen (media + metadata)

EXTRA VALIDATIE VOOR TEKST CATEGORIEËN (poetry, prosepoetry, music):
- language1: moet ingevuld zijn (primaire taal)
- Als er meerdere talen zijn: language2, language3 moeten overeenkomen met het aantal tekstblokken
- Elk tekstblok moet gescheiden zijn door ---TRANSLATION_xx--- markers

EXTRA VALIDATIE VOOR MEDIA CATEGORIEËN (drawing, sculpture, prose):
- Er moet minstens één bijgevoegd bestand (resource) zijn
- Bijgevoegde bestanden moeten een geldig MIME-type hebben

OPTIONELE VELDEN (mogen leeg zijn):
- description, location1, location2, tags, url1, url2, url3
- language2, language3 (als er geen extra vertalingen zijn)
"""

# --- SCRIPT LOGICA ---

def clean_metadata_for_yaml(html_block: str) -> str:
    """Verwijdert HTML-tags uit de metadata-tekst veel robuuster."""
    text_with_newlines = re.sub(r'</div>', '\n', html_block, flags=re.IGNORECASE)
    cleaned_text = re.sub(r'<[^>]+>', '', text_with_newlines)
    lines = [line.strip() for line in cleaned_text.split('\n') if line.strip()]
    return '\n'.join(lines)

def extract_metadata_and_content(note_content: str) -> Tuple[Dict[str, Any] | None, str]:
    """Extraheert metadata en de hoofdcontent (alles voor de metadata)."""
    meta_match = re.search(r'---META_BEGIN---(.*?)---META_END---', note_content, re.DOTALL)
    if not meta_match:
        return None, "Geen ---META_BEGIN---/---META_END--- blok gevonden."
    
    meta_block_html = meta_match.group(1)
    meta_block_cleaned = clean_metadata_for_yaml(meta_block_html)
    
    try:
        metadata = yaml.safe_load(meta_block_cleaned) or {}
        main_content = note_content.split('---META_BEGIN---', 1)[0].strip()
        return {str(k).lower(): v for k, v in metadata.items()}, main_content
    except yaml.YAMLError as e:
        error_message = f"YAML FOUT: {e}\n--- Problematische Metadata ---\n{meta_block_cleaned}"
        return None, error_message

def clean_html_content(html: str) -> str:
    """Cleans up Evernote HTML content for display."""
    clean_html = html
    
    # Remove XML declaration and ENML wrapper
    clean_html = re.sub(r'<\?xml[^>]*\?>', '', clean_html)
    clean_html = re.sub(r'<!DOCTYPE[^>]*>', '', clean_html)
    clean_html = re.sub(r'<en-note[^>]*>', '', clean_html)
    clean_html = re.sub(r'</en-note>', '', clean_html)
    
    # First, normalize all <br> variants to <br>
    clean_html = re.sub(r'<br\s*/?>', '<br>', clean_html, flags=re.IGNORECASE)
    
    # Handle special case: <div><br></div> should become just <br> (one empty line)
    clean_html = re.sub(r'<div><br></div>', '<br>', clean_html, flags=re.IGNORECASE)
    
    # Convert remaining Evernote formatting to standard HTML
    clean_html = re.sub(r'<div>', '', clean_html, flags=re.IGNORECASE)
    clean_html = re.sub(r'</div>', '<br>', clean_html, flags=re.IGNORECASE)
    
    # Only remove leading and trailing <br> tags, preserve all internal spacing
    clean_html = re.sub(r'^(<br>\s*)+', '', clean_html, flags=re.IGNORECASE)  # Remove leading br
    clean_html = re.sub(r'(<br>\s*)+$', '', clean_html, flags=re.IGNORECASE)  # Remove trailing br
    
    # Clean up whitespace but preserve all line breaks
    clean_html = clean_html.strip()
    
    return clean_html

def generate_html_file(meta: Dict[str, Any], content_html: str, file_path: pathlib.Path) -> None:
    """Generates an HTML file with metadata and content."""
    yaml_content = yaml.dump(meta, allow_unicode=True, default_flow_style=False, sort_keys=False)
    clean_html = clean_html_content(content_html)
    
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{meta.get('title', 'Untitled')}</title>
    <style>
        body {{ font-family: Georgia, serif; max-width: 600px; margin: 40px auto; padding: 20px; line-height: 1.6; }}
        .metadata {{ background: #f5f5f5; padding: 15px; border-left: 4px solid #ddd; margin-bottom: 30px; font-size: 0.9em; }}
        .metadata pre {{ margin: 0; white-space: pre-wrap; }}
        .content {{ margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="metadata">
        <pre>{yaml_content.strip()}</pre>
    </div>
    <div class="content">
        {clean_html}
    </div>
</body>
</html>"""
    file_path.write_text(html_content, encoding='utf-8')

def generate_filename(meta: Dict[str, Any], lang: str = None, version: Any = None) -> str:
    """Genereert een gestandaardiseerde bestandsnaam."""
    date = f"{meta.get('year', '0000')}{str(meta.get('month', '00')).zfill(2)}{str(meta.get('day', '00')).zfill(2)}"
    category = meta.get('category', 'unknown')
    title = str(meta.get('title', 'untitled')).lower()
    safe_title = re.sub(r'[^a-z0-9]+', '-', title).strip('-')
    
    filename = f"{date}_{category}_{safe_title}"
    
    version_int = None
    if version is not None:
        try:
            version_int = int(version)
        except (ValueError, TypeError):
            pass

    if version_int:
        filename += f"_{str(version_int).zfill(2)}"
        
    if lang:
        filename += f"_{lang.lower()}"

    return filename

def process_enex_files(source_dir: pathlib.Path, dest_dir: pathlib.Path):
    """Valideert en verwerkt alle .enex bestanden in een enkele, efficiënte pass."""
    enex_files = list(source_dir.glob('*.enex'))
    if not enex_files:
        print("⚠️  Geen .enex bestanden gevonden om te verwerken.")
        return

    report = {'success': [], 'failed': []}
    category_counts = {}  # Track notes per category
    
    print("\n--- Starten van Conversie & Generatie ---")
    for enex_file in enex_files:
        print(f"\n🔄 Verwerken van {enex_file.name} ({enex_file.stat().st_size / (1024*1024):.1f} MB)...")
        
        # Check if file is stable (fully written)
        if not wait_for_file_stability(enex_file, max_wait_seconds=120):
            print(f"  ❌ Bestand {enex_file.name} is nog niet stabiel - overslaan")
            report['failed'].append({'title': f"Bestand: {enex_file.name}", 'reason': "Bestand was nog niet volledig geschreven"})
            continue
        
        try:
            enex_content = enex_file.read_text('utf-8')
            note_contents = re.findall(r'<note>(.*?)</note>', enex_content, re.DOTALL)
            print(f"  Gevonden {len(note_contents)} notities in bestand.")
        except Exception as e:
            report['failed'].append({'title': f"Bestand: {enex_file.name}", 'reason': f"Kon bestand niet lezen. Fout: {e}"})
            continue

        for note_index, note_str in enumerate(note_contents, 1):
            note_title_raw = "Onbekende Notitie"
            try:
                note_xml = f"<note>{note_str}</note>"
                note = ET.fromstring(note_xml)
                
                note_title_raw = note.findtext('title', 'Onbekende Titel')

                content_xml = note.findtext('content', '')
                meta, main_content_html = extract_metadata_and_content(content_xml)
                
                # --- Basis validatie ---
                if meta is None:
                    raise ValueError(main_content_html)

                category = meta.get('category', 'unknown')
                
                # --- Pre-processing voor validatie ---
                # Check for translations
                translation_delimiter = r'---TRANSLATION_([a-z]{2})---'
                split_result = re.split(translation_delimiter, main_content_html, flags=re.IGNORECASE)
                parts = [split_result[i] for i in range(0, len(split_result), 2)]
                has_translations = len(parts) > 1
                num_translation_parts = len(parts)
                
                # Check for resources
                resources = note.findall('resource')
                has_resources = len(resources) > 0
                
                # --- Uitgebreide validatie ---
                validation_errors = validate_note_metadata(
                    meta, 
                    category, 
                    has_translations=has_translations, 
                    num_translation_parts=num_translation_parts,
                    has_resources=has_resources
                )
                
                if validation_errors:
                    error_msg = "Validatiefouten: " + "; ".join(validation_errors)
                    raise ValueError(error_msg)
                
                # Count notes per category
                category_counts[category] = category_counts.get(category, 0) + 1
                
                # --- Verwerking ---
                category_folder = dest_dir / category
                category_folder.mkdir(parents=True, exist_ok=True)
                
                created_files_log = []

                # --- Logica voor vertalingen en tekstbestanden ---
                if category in ['poetry', 'prosepoetry', 'music']:
                    translation_delimiter = r'---TRANSLATION_([a-z]{2})---'
                    split_result = re.split(translation_delimiter, main_content_html, flags=re.IGNORECASE)
                    
                    # re.split with capturing groups returns: [text1, captured_group1, text2, captured_group2, ...]
                    # We only want the actual text parts (even indices)
                    parts = [split_result[i] for i in range(0, len(split_result), 2)]
                    
                    languages_from_meta = [l for l in [meta.get('language1'), meta.get('language2'), meta.get('language3')] if l]
                    
                    if len(parts) != len(languages_from_meta):
                        raise ValueError(f"Aantal tekstblokken ({len(parts)}) komt niet overeen met het aantal talen in metadata ({len(languages_from_meta)}). Gevonden delen: {len(parts)}, verwachte talen: {len(languages_from_meta)}")

                    for i, lang_code in enumerate(languages_from_meta):
                        content_html = parts[i]
                        
                        # Create ordered metadata with 'language' placed before other language fields
                        meta_lang = {}
                        for key, value in meta.items():
                            meta_lang[key] = value
                            # Insert 'language' right after 'version' and before 'language1'
                            if key == 'version':
                                meta_lang['language'] = lang_code
                        
                        filename_lang = generate_filename(meta, lang=lang_code)
                        file_path = category_folder / f"{filename_lang}.html"
                        
                        # Generate HTML file for all text categories
                        generate_html_file(meta_lang, content_html, file_path)
                        
                        # Check if file exists to determine if we're overwriting
                        file_status = "Overschreven" if file_path.exists() else "Nieuw"
                        created_files_log.append(f"{file_path.name} ({file_status})")

                # --- Logica voor media-bestanden ---
                elif category in ['drawing', 'sculpture', 'prose']:
                    base_filename = generate_filename(meta)
                    html_path = category_folder / f"{base_filename}.html"
                    
                    # Check if file exists to determine if we're overwriting
                    html_file_status = "Overschreven" if html_path.exists() else "Nieuw"
                    
                    # Generate HTML file for media categories
                    generate_html_file(meta, main_content_html, html_path)
                    created_files_log.append(f"{html_path.name} ({html_file_status})")

                    resources = note.findall('resource')
                    if not resources:
                        raise ValueError(f"Categorie is '{category}' maar er is geen afbeelding/bestand bijgevoegd.")
                        
                    for idx, resource in enumerate(resources):
                        mime = resource.findtext('mime', '')
                        ext = '.jpg' if 'jpeg' in mime else '.png' if 'png' in mime else '.mp4' if 'mp4' in mime else '.pdf' if 'pdf' in mime else ''
                        data_b64 = resource.findtext('data')
                        if not data_b64: continue

                        version = idx + 1
                        media_filename = generate_filename(meta, version=version)
                        media_path = category_folder / f"{media_filename}{ext}"
                        
                        # Check if media file exists to determine if we're overwriting
                        media_file_status = "Overschreven" if media_path.exists() else "Nieuw"
                        
                        media_path.write_bytes(base64.b64decode(data_b64))
                        created_files_log.append(f"{media_path.name} ({media_file_status})")
                
                report['success'].append({'title': meta.get('title', note_title_raw), 'files': created_files_log})

            except Exception as e:
                report['failed'].append({'title': note_title_raw, 'reason': str(e)})

    # --- Rapportage ---
    print("\n" + "="*50)
    print("📊 OVERZICHT GEVONDEN NOTITIES PER CATEGORIE")
    print("="*50)
    if category_counts:
        for category, count in sorted(category_counts.items()):
            print(f"  {category:15} : {count:3} notities")
        print(f"\n  {'TOTAAL':15} : {sum(category_counts.values()):3} notities")
    else:
        print("  Geen notities gevonden.")
    
    print("\n" + "="*50)
    print("✅ SUCCESVOL VERWERKTE NOTITIES")
    print("="*50)
    if report['success']:
        for item in report['success']:
            print(f"✅ {item['title']}")
            for file_info in item['files']:
                print(f"    📄 {file_info}")
    else:
        print("  Geen notities succesvol verwerkt.")
    
    if report['failed']:
        print("\n" + "="*50)
        print("❌ NIET VERWERKTE NOTITIES")
        print("="*50)
        for item in report['failed']:
            print(f"❌ {item['title']}")
            print(f"    💬 Reden: {item['reason']}")
    
    print("\n" + "="*50)

def validate_note_metadata(meta: Dict[str, Any], category: str, has_translations: bool = False, num_translation_parts: int = 0, has_resources: bool = False) -> List[str]:
    """
    Valideert metadata van een notitie volgens de gedefinieerde regels.
    Retourneert een lijst van validatiefouten (lege lijst = geen fouten).
    """
    errors = []
    
    # Define allowed categories and required fields
    ALLOWED_CATEGORIES = ['poetry', 'prosepoetry', 'music', 'drawing', 'sculpture', 'prose']
    REQUIRED_FIELDS = ['title', 'year', 'month', 'day', 'category', 'version']
    TEXT_CATEGORIES = ['poetry', 'prosepoetry', 'music']
    MEDIA_CATEGORIES = ['drawing', 'sculpture', 'prose']
    
    # Check required fields exist and are not empty
    for field in REQUIRED_FIELDS:
        if field not in meta or not str(meta[field]).strip():
            errors.append(f"Verplicht veld '{field}' ontbreekt of is leeg")
    
    # Validate category
    if category not in ALLOWED_CATEGORIES:
        errors.append(f"Onbekende categorie '{category}'. Toegestaan: {', '.join(ALLOWED_CATEGORIES)}")
    
    # Validate year (should be 4 digits)
    try:
        year = int(meta.get('year', 0))
        if year < 1000 or year > 9999:
            errors.append(f"Jaar '{year}' moet een 4-cijferig getal zijn")
    except (ValueError, TypeError):
        errors.append(f"Jaar '{meta.get('year')}' is geen geldig getal")
    
    # Validate month (1-12)
    try:
        month = int(meta.get('month', 0))
        if month < 1 or month > 12:
            errors.append(f"Maand '{month}' moet tussen 1 en 12 liggen")
    except (ValueError, TypeError):
        errors.append(f"Maand '{meta.get('month')}' is geen geldig getal")
    
    # Validate day (1-31, basic check)
    try:
        day = int(meta.get('day', 0))
        if day < 1 or day > 31:
            errors.append(f"Dag '{day}' moet tussen 1 en 31 liggen")
    except (ValueError, TypeError):
        errors.append(f"Dag '{meta.get('day')}' is geen geldig getal")
    
    # Category-specific validation
    if category in TEXT_CATEGORIES:
        # Text categories need language fields
        if not meta.get('language1'):
            errors.append(f"Tekst categorie '{category}' vereist een ingevulde 'language1'")
        
        # If there are translations, validate language mapping
        if has_translations:
            languages = [meta.get('language1'), meta.get('language2'), meta.get('language3')]
            filled_languages = [lang for lang in languages if lang and str(lang).strip()]
            
            if len(filled_languages) != num_translation_parts:
                errors.append(f"Aantal ingevulde talen ({len(filled_languages)}) komt niet overeen met aantal tekstblokken ({num_translation_parts})")
            
            # Check for duplicate languages
            if len(filled_languages) != len(set(filled_languages)):
                errors.append("Taalcodes mogen niet dubbel voorkomen")
    
    elif category in MEDIA_CATEGORIES:
        # Media categories need attached resources
        if not has_resources:
            errors.append(f"Media categorie '{category}' vereist minstens één bijgevoegd bestand")
    
    return errors

def is_file_stable(file_path: pathlib.Path, check_duration: int = 10) -> bool:
    """
    Controleert of een bestand stabiel is (niet in gebruik door een ander proces).
    Het bestand wordt als stabiel beschouwd als het gedurende de opgegeven duur niet is gewijzigd.
    
    :param file_path: Het pad naar het bestand dat gecontroleerd moet worden.
    :param check_duration: De duur (in seconden) waarover het bestand niet gewijzigd mag zijn.
    :return: True als het bestand stabiel is, anders False.
    """
    if not file_path.exists():
        return False

    # Get the initial modification time
    initial_mtime = file_path.stat().st_mtime

    # Wait for the specified duration
    time.sleep(check_duration)

    # Check the modification time again
    final_mtime = file_path.stat().st_mtime

    # If the modification time hasn't changed, the file is stable
    return initial_mtime == final_mtime

def wait_for_file_stability(file_path: pathlib.Path, max_wait_seconds: int = 60) -> bool:
    """
    Wacht tot een bestand stabiel is (niet meer groeit in grootte).
    Controleert elke 2 seconden of de bestandsgrootte hetzelfde blijft.
    Retourneert True als bestand stabiel is, False als timeout bereikt.
    """
    print(f"  🔍 Controleren of bestand volledig is geschreven...")
    
    stable_checks_needed = 3  # Aantal opeenvolgende controles met zelfde grootte
    check_interval = 2  # Seconden tussen controles
    stable_count = 0
    last_size = -1
    start_time = time.time()
    
    while time.time() - start_time < max_wait_seconds:
        try:
            current_size = file_path.stat().st_size
            
            if current_size == last_size:
                stable_count += 1
                if stable_count >= stable_checks_needed:
                    print(f"  ✅ Bestand is stabiel ({current_size} bytes)")
                    return True
            else:
                stable_count = 0  # Reset teller als grootte verandert
                if last_size != -1:
                    print(f"  📈 Bestand groeit nog... ({current_size} bytes)")
            
            last_size = current_size
            time.sleep(check_interval)
            
        except (OSError, IOError) as e:
            print(f"  ⚠️  Fout bij lezen bestandsinfo: {e}")
            time.sleep(check_interval)
    
    print(f"  ⏰ Timeout bereikt na {max_wait_seconds} seconden")
    return False

if __name__ == "__main__":
    print("========================================")
    print(" Evernote .enex Converter & Generator")
    print("========================================")
    process_enex_files(SOURCE_ENEX_FOLDER, DESTINATION_MEDIA_FOLDER)
    print("\n🎉 Alle .enex bestanden zijn verwerkt.")
