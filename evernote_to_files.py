def get_medium_subtype_from_category(category: str) -> tuple:
    """Map legacy category to new medium/subtype values."""
    category = category.lower()
    mapping = {
        'poetry': ('writing', 'poem'),
        'prosepoetry': ('writing', 'poem'),
        'prose': ('writing', 'prose'),
        'music': ('audio', 'song'),
        'sculpture': ('sculpture', 'clay'),
        'drawing': ('drawing', 'marker'),
        'image': ('drawing', 'digital'),
        'other': ('other', 'other'),
    }
    return mapping.get(category, ('other', 'other'))
"""
Evernote .enex to HTML Converter with Medium/Subtype Support

This script converts Evernote .enex files to HTML files with proper metadata validation.
It supports the new medium/subtype classification system introduced in the artwall app.

NEW FEATURES:
- Medium/Subtype validation and auto-detection
- Backwards compatibility with legacy category system
- Automatic medium/subtype detection from content analysis
- Comprehensive reporting with medium/subtype statistics

SUPPORTED MEDIUMS AND SUBTYPES:
- drawing: marker, pencil, digital, ink, charcoal, other
- writing: poem, prose, story, essay, other
- music: instrumental, vocal, electronic, acoustic, other
- sculpture: clay, wood, metal, stone, other
- other: other

MIGRATION NOTES:
- Legacy category field is still supported for backwards compatibility
- If medium/subtype are not provided, they will be auto-detected
- Category-to-medium mapping is automatic
- New evaluation and rating fields are supported
"""

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
SOURCE_ENEX_FOLDER = pathlib.Path('G:/Mijn Drive/Creatief/Artwall')
DESTINATION_MEDIA_FOLDER = pathlib.Path('G:/Mijn Drive/Creatief/Artwall')

# --- VALIDATIE REGELS ---
"""
VERPLICHTE METADATA VELDEN VOOR ALLE NOTITIES:
- title: moet ingevuld zijn (niet leeg)
- year: moet een geldig jaar zijn (4 cijfers)
- month: moet een geldige maand zijn (1-12)
- day: moet een geldige dag zijn (1-31)
- medium: moet een van de toegestane mediums zijn
- subtype: moet een van de toegestane subtypes zijn voor het gekozen medium
- version: moet ingevuld zijn (meestal '01')

NIEUWE MEDIUM/SUBTYPE STRUCTUUR:
- drawing: marker, pencil, digital, ink, charcoal, other
- writing: poem, prose, story, essay, other
- music: instrumental, vocal, electronic, acoustic, other
- sculpture: clay, wood, metal, stone, other
- other: other

EXTRA VALIDATIE VOOR TEKST CATEGORIEËN (poetry, prosepoetry, music):
- language1: moet ingevuld zijn (primaire taal)
- Als er meerdere talen zijn: language2, language3 moeten overeenkomen met het aantal tekstblokken
- Elk tekstblok moet gescheiden zijn door ---TRANSLATION_xx--- markers

EXTRA VALIDATIE VOOR MEDIA CATEGORIEËN (drawing, sculpture, prose, image):
- Er moet minstens één bijgevoegd bestand (resource) zijn
- Bijgevoegde bestanden moeten een geldig MIME-type hebben

NIEUWE OPTIONELE VELDEN:
- evaluation: persoonlijke beoordeling (1-5)
- rating: publieke/audience rating
- description, location1, location2, tags, url1, url2, url3
- language2, language3 (als er geen extra vertalingen zijn)
"""

# --- SCRIPT LOGICA ---


# Load mediums and subtypes from shared JSON file
import json
MEDIUM_SUBTYPES_PATH = pathlib.Path(__file__).parent / 'src' / 'constants' / 'medium-subtypes.json'
with open(MEDIUM_SUBTYPES_PATH, encoding='utf-8') as f:
    VALID_SUBTYPES = json.load(f)
VALID_MEDIUMS = list(VALID_SUBTYPES.keys())

# Updated metadata validation
REQUIRED_METADATA_FIELDS = [
    'title', 'year', 'month', 'day', 'medium', 'subtype', 'version'
]

# Function to validate medium and subtype
def validate_medium_subtype(medium: str, subtype: str) -> bool:
    return medium in VALID_MEDIUMS and subtype in VALID_SUBTYPES.get(medium, [])

def normalize_subtype(medium: str, subtype: str) -> str:
    """Return the subtype if valid for the medium, else fallback to 'other'."""
    if validate_medium_subtype(medium, subtype):
        return subtype
    else:
        return 'other'

def auto_detect_medium_subtype_from_content(content: str, resources: list = None) -> tuple:
    """
    Automatically detect medium and subtype based on content analysis.
    This is a fallback for when medium/subtype are not explicitly provided.
    """
    content_lower = content.lower()
    
    # Check for music-related keywords
    if any(keyword in content_lower for keyword in ['akkoord', 'chord', 'vers', 'refrein', 'lied', 'muziek', 'melody', 'beat']):
        return ('music', 'vocal')
    
    # Check for poetry-related formatting (short lines, stanzas)
    lines = [line.strip() for line in content.split('\n') if line.strip()]
    if len(lines) > 3:
        avg_line_length = sum(len(line) for line in lines) / len(lines)
        if avg_line_length < 50:  # Short lines suggest poetry
            return ('writing', 'poem')
    
    # Check for prose indicators
    if len(content) > 500:  # Longer content suggests prose
        return ('writing', 'prose')
    
    # Check attached resources for media types
    if resources:
        for resource in resources:
            mime = resource.findtext('mime', '').lower()
            if 'image' in mime or 'jpeg' in mime or 'png' in mime or 'gif' in mime:
                pass
    
    # Default fallback
    return ('writing', 'other')

def clean_metadata_for_yaml(html_block: str) -> str:
    """Verwijdert HTML-tags uit de metadata-tekst veel robuuster."""
    text_with_newlines = re.sub(r'</div>', '\n', html_block, flags=re.IGNORECASE)
    cleaned_text = re.sub(r'<[^>]+>', '', text_with_newlines)
    
    # Clean problematic characters that can cause YAML parsing issues
    # Remove backticks that are often used incorrectly
    cleaned_text = re.sub(r'`(\d+)', r'\1', cleaned_text)  # Remove backticks before numbers
    cleaned_text = cleaned_text.replace('`', '')  # Remove any remaining backticks
    
    lines = [line.strip() for line in cleaned_text.split('\n') if line.strip()]
    return '\n'.join(lines)

def safe_yaml_value(value: str) -> str:
    """Safely format a value for YAML, handling apostrophes and special characters."""
    if not value:
        return "''"
    # Convert to string if not already
    value = str(value)
    # Clean problematic characters that might cause YAML issues
    value = value.replace('`', '').replace('?', '').replace('~', '')
    # Escape internal single quotes as two single quotes
    safe_value = value.replace("'", "''")
    # Always wrap in single quotes, never triple quotes
    return f"'{safe_value}'"

def extract_metadata_and_content(note_content: str) -> Tuple[Dict[str, Any] | None, str]:
    """Extraheert metadata en de hoofdcontent (alles voor de metadata)."""
    meta_match = re.search(r'---META_BEGIN---(.*?)---META_END---', note_content, re.DOTALL)
    if not meta_match:
        return None, "Geen ---META_BEGIN---/---META_END--- blok gevonden."
    
    meta_block_html = meta_match.group(1)
    meta_block_cleaned = clean_metadata_for_yaml(meta_block_html)
    
    try:
        # Try to parse as YAML first
        metadata = yaml.safe_load(meta_block_cleaned) or {}
        main_content = note_content.split('---META_BEGIN---', 1)[0].strip()
        
        # Convert to lowercase keys
        # Remove all empty lines before processing
        # metadata = {str(k).lower(): v for k, v in metadata.items() if v != ''}

        metadata = {str(k).lower(): v for k, v in metadata.items()}
        
        # Handle medium/subtype mapping
        if 'medium' in metadata and 'subtype' in metadata:
            # New format: medium and subtype are explicitly provided
            medium = metadata['medium']
            subtype = normalize_subtype(medium, metadata['subtype'])
            metadata['subtype'] = subtype
            
            # Validate medium/subtype combination
            if not validate_medium_subtype(medium, subtype):
                print(f"    ⚠️ Invalid medium/subtype combination: {medium}/{subtype}, using defaults")
                medium, subtype = ('other', 'other')
                metadata['medium'] = medium
                metadata['subtype'] = subtype
            
        elif 'category' in metadata:
            # Legacy format: only category is provided, derive medium/subtype
            category = metadata['category']
            medium, subtype = get_medium_subtype_from_category(category)
            metadata['medium'] = medium
            metadata['subtype'] = subtype
            
        else:
            # Neither medium nor category provided
            return None, "Noch 'medium' noch 'category' gevonden in metadata"
        
        return metadata, main_content
        
    except yaml.YAMLError as e:
        # If YAML parsing fails, try to manually parse key-value pairs
        try:
            print(f"    ⚠️ YAML parsing failed, trying manual parsing: {e}")
            metadata = {}
            main_content = note_content.split('---META_BEGIN---', 1)[0].strip()
            
            # Parse each line as key: value

            for line in meta_block_cleaned.split('\n'):
                line = line.strip()
                if ':' in line and not line.startswith('#'):
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip()

                    # Remove outer single or double quotes, but preserve inner quotes
                    if (value.startswith("'") and value.endswith("'")) or (value.startswith('"') and value.endswith('"')):
                        value = value[1:-1]

                    # Clean problematic YAML characters inside values
                    if isinstance(value, str):
                        value = value.replace('`', '').replace('~', '')

                    # Convert numeric values
                    if key in ['year', 'month', 'day', 'evaluation', 'rating']:
                        try:
                            if isinstance(value, str):
                                clean_value = value.strip().replace('?', '')
                                match = re.search(r'\d+', clean_value)
                                if match:
                                    value = int(match.group())
                                else:
                                    if key == 'day':
                                        value = 1
                                    else:
                                        value = 0
                            else:
                                value = int(value)
                            metadata[key] = value
                        except (ValueError, TypeError):
                            if key == 'day':
                                metadata[key] = 1
                            elif key in ['year', 'month']:
                                metadata[key] = 0
                            else:
                                metadata[key] = ''
                    else:
                        # Store string values as-is (no extra wrapping)
                        metadata[key] = value
            
            # Apply medium/subtype normalization
            if 'medium' in metadata and 'subtype' in metadata:
                medium = metadata['medium']
                subtype = normalize_subtype(medium, metadata['subtype'])
                metadata['subtype'] = subtype
                
                # Validate medium/subtype combination
                if not validate_medium_subtype(medium, subtype):
                    print(f"    ⚠️ Invalid medium/subtype combination: {medium}/{subtype}, using defaults")
                    medium, subtype = ('other', 'other')
                    metadata['medium'] = medium
                    metadata['subtype'] = subtype
                
            elif 'category' in metadata:
                category = metadata['category']
                medium, subtype = get_medium_subtype_from_category(category)
                metadata['medium'] = medium
                metadata['subtype'] = subtype
            
            return metadata, main_content
            
        except Exception as manual_error:
            error_message = f"YAML FOUT: {e}\nManual parsing error: {manual_error}\n--- Problematische Metadata ---\n{meta_block_cleaned}"
            return None, error_message

def clean_html_content(html: str) -> str:
    """Cleans up Evernote HTML content for display."""
    clean_html = html
    
    # Remove XML declaration and ENML wrapper
    clean_html = re.sub(r'<\?xml[^>]*\?>', '', clean_html)
    clean_html = re.sub(r'<!DOCTYPE[^>]*>', '', clean_html)
    clean_html = re.sub(r'<en-note[^>]*>', '', clean_html)
    clean_html = re.sub(r'</en-note>', '', clean_html)
    
    # Remove Evernote styling and hidden elements
    clean_html = re.sub(r'<div style="display:none;[^"]*"[^>]*>.*?</div>', '', clean_html, flags=re.DOTALL)
    clean_html = re.sub(r'<div[^>]*style="[^"]*display:\s*none[^"]*"[^>]*>.*?</div>', '', clean_html, flags=re.DOTALL)
    
    # Remove all style attributes but keep the content
    clean_html = re.sub(r'\s*style="[^"]*"', '', clean_html)
    
    # First, normalize all <br> variants to <br>
    clean_html = re.sub(r'<br\s*/?>', '<br>', clean_html, flags=re.IGNORECASE)
    
    # Handle special case: <div><br></div> should become just <br> (one empty line)
    clean_html = re.sub(r'<div><br></div>', '<br>', clean_html, flags=re.IGNORECASE)
    
    # Convert remaining Evernote formatting to standard HTML
    clean_html = re.sub(r'<div[^>]*>', '', clean_html, flags=re.IGNORECASE)
    clean_html = re.sub(r'</div>', '<br>', clean_html, flags=re.IGNORECASE)
    
    # Only remove leading and trailing <br> tags, preserve all internal spacing
    clean_html = re.sub(r'^(<br>\s*)+', '', clean_html, flags=re.IGNORECASE)  # Remove leading br
    clean_html = re.sub(r'(<br>\s*)+$', '', clean_html, flags=re.IGNORECASE)  # Remove trailing br
    
    # Clean up whitespace but preserve all line breaks
    clean_html = clean_html.strip()
    
    return clean_html

def generate_html_file(meta: Dict[str, Any], content_html: str, file_path: pathlib.Path) -> None:
    """Generates an HTML file with metadata and content."""
    # Manually write YAML metadata block to avoid triple single quotes
    yaml_lines = []
    for key, value in meta.items():
        if isinstance(value, str):
            yaml_lines.append(f"{key}: {safe_yaml_value(value)}")
        else:
            yaml_lines.append(f"{key}: {value}")
    yaml_content = '\n'.join(yaml_lines)
    clean_html = clean_html_content(content_html)

    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset=\"UTF-8\">
    <title>{meta.get('title', 'Untitled')}</title>
    <style>
        body {{ font-family: Georgia, serif; max-width: 600px; margin: 40px auto; padding: 20px; line-height: 1.6; }}
        .metadata {{ background: #f5f5f5; padding: 15px; border-left: 4px solid #ddd; margin-bottom: 30px; font-size: 0.9em; }}
        .metadata pre {{ margin: 0; white-space: pre-wrap; }}
        .content {{ margin-top: 20px; }}
    </style>
</head>
<body>
    <div class=\"metadata\">
        <pre>{yaml_content.strip()}</pre>
    </div>
    <div class=\"content\">
        {clean_html}
    </div>
</body>
</html>"""
    file_path.write_text(html_content, encoding='utf-8')

def generate_filename(meta: Dict[str, Any], lang: str = None, version: Any = None) -> str:
    date = f"{meta.get('year', '0000')}{str(meta.get('month', '00')).zfill(2)}{str(meta.get('day', '00')).zfill(2)}"
    medium = meta.get('medium', 'unknown')
    subtype = meta.get('subtype', 'unknown')
    title = str(meta.get('title', 'untitled')).lower()
    safe_title = re.sub(r'[^a-z0-9]+', '-', title).strip('-')

    # Prevent duplicate subtype in filename (e.g., ..._poem_poem-...)
    # If safe_title starts with subtype, remove it
    if safe_title.startswith(subtype + '-'):  # e.g. poem-afronden
        safe_title = safe_title[len(subtype)+1:]

    filename = f"{date}_{medium}_{subtype}"
    if safe_title:
        filename += f"_{safe_title}"

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

def extract_auto_description(content_html: str, max_length: int = 100, category: str = None) -> str:
    """
    Extracts the first sentence or row of content to use as description.
    Excludes the title (first row) and looks for the next meaningful text.
    For poetry and music: combines first two content lines into one string.
    
    :param content_html: The HTML content of the note
    :param max_length: Maximum length for the description
    :param category: The category of the note (poetry, music, etc.)
    :return: Extracted description text
    """
    # First, let's work with the original HTML structure to better identify lines
    html_lines = content_html.replace('<br>', '\n').replace('<br/>', '\n').replace('<br />', '\n')
    html_lines = re.sub(r'</div>', '\n', html_lines, flags=re.IGNORECASE)
    html_lines = re.sub(r'<div[^>]*>', '', html_lines, flags=re.IGNORECASE)
    
    # Now clean remaining HTML tags but preserve basic formatting markers
    text_content = re.sub(r'<[^>]+>', '', html_lines)
    lines = [line.strip() for line in text_content.split('\n') if line.strip()]
    
    if not lines:
        return ""
    
    # Skip the title (first line) if it's short and looks like a title
    start_index = 0
    if len(lines) > 1 and len(lines[0]) <= 100:
        # First line is likely the title, skip it
        start_index = 1
    
    # Get content lines after the title
    available_lines = lines[start_index:]
    if not available_lines:
        return ""
    
    # For poetry and music: combine first two lines
    if category in ['poetry', 'music'] and len(available_lines) >= 2:
        description_text = f"{available_lines[0]} {available_lines[1]}"
    else:
        # For other mediums or when only one line available: use first line
        description_text = available_lines[0]
        
        # Try to extract first sentence if the line contains sentence-ending punctuation
        sentence_match = re.match(r'^([^.!?]+[.!?])', description_text)
        if sentence_match:
            description_text = sentence_match.group(1).strip()
    
    # Truncate if too long (reserve 3 characters for the "...")
    if len(description_text) > max_length - 3:
        # Try to cut at word boundary
        truncated = description_text[:max_length - 3]
        last_space = truncated.rfind(' ')
        if last_space > (max_length - 3) * 0.7:  # Only cut at space if it's not too early
            description_text = truncated[:last_space]
        else:
            description_text = truncated
    
    # Remove trailing comma if present
    description_text = description_text.rstrip(',').strip()
    
    # Always add "..." at the end
    description_text += "..."
    
    return description_text

def process_enex_files(source_dir: pathlib.Path, dest_dir: pathlib.Path):
    """Valideert en verwerkt alle .enex bestanden in een enkele, efficiënte pass."""
    enex_files = list(source_dir.glob('*.enex'))
    if not enex_files:
        print("⚠️  Geen .enex bestanden gevonden om te verwerken.")
        return

    report = {'success': [], 'failed': [], 'warnings': []}
    category_counts = {}  # Track notes per category
    medium_counts = {}   # Track notes per medium
    subtype_counts = {}  # Track notes per medium/subtype combination
    
    print("\n--- Starten van Conversie & Generatie ---")

    # --- Duplicate title detection ---
    all_titles = []
    title_counts = {}
    for enex_file in enex_files:
        try:
            enex_content = enex_file.read_text('utf-8')
            note_contents = re.findall(r'<note>(.*?)</note>', enex_content, re.DOTALL)
        except Exception:
            continue
        for note_str in note_contents:
            try:
                note_xml = f"<note>{note_str}</note>"
                note = ET.fromstring(note_xml)
                note_title_raw = note.findtext('title', 'Onbekende Titel')
                all_titles.append(note_title_raw)
                title_counts[note_title_raw] = title_counts.get(note_title_raw, 0) + 1
            except Exception:
                continue

    duplicate_title_next_number = {}
    for title, count in title_counts.items():
        if count > 1:
            print(f"⚠️  Dubbele titel gevonden: '{title}' komt {count} keer voor. Titels worden genummerd.")
            duplicate_title_next_number[title] = 1

    for enex_file in enex_files:
        print(f"\n🔄 Verwerken van {enex_file.name} ({enex_file.stat().st_size / (1024*1024):.1f} MB)...")
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
                # Collect warnings for apostrophe in title
                if "'" in note_title_raw:
                    report['warnings'].append(f"⚠️  Titel bevat een apostrof: '{note_title_raw}'. Overweeg deze titel aan te passen.")
                # Collect warnings for duplicate title renaming
                original_title = note_title_raw
                if title_counts.get(original_title, 0) > 1:
                    if duplicate_title_next_number[original_title] == 1:
                        new_title = original_title
                    else:
                        new_title = f"{original_title} {duplicate_title_next_number[original_title]}"
                        report['warnings'].append(f"⚠️  Titel '{original_title}' hernoemd naar '{new_title}' vanwege duplicaat.")
                    duplicate_title_next_number[original_title] += 1
                    note_title_raw = new_title
                content_xml = note.findtext('content', '')
                meta, main_content_html = extract_metadata_and_content(content_xml)
                if meta is not None:
                    # Always strip everything before and including the first colon and space (': ') in the note title
                    title_clean = note_title_raw
                    colon_pos = title_clean.find(': ')
                    if colon_pos != -1:
                        title_clean = title_clean[colon_pos + 2:].lstrip()
                    meta['title'] = title_clean
                if meta is None:
                    raise ValueError(main_content_html)
                resources = note.findall('resource')
                if 'medium' not in meta or 'subtype' not in meta:
                    detected_medium, detected_subtype = auto_detect_medium_subtype_from_content(main_content_html, resources)
                    if 'medium' not in meta:
                        meta['medium'] = detected_medium
                        report['warnings'].append(f"🔍 Auto-detected medium: {detected_medium} for '{note_title_raw}'")
                    if 'subtype' not in meta:
                        meta['subtype'] = detected_subtype
                        report['warnings'].append(f"🔍 Auto-detected subtype: {detected_subtype} for '{note_title_raw}'")
                    if 'category' not in meta:
                        meta['category'] = 'other'
                medium = meta.get('medium', 'other')
                subtype = meta.get('subtype', 'other')
                translation_delimiter = r'---TRANSLATION_([a-z]{2})---'
                split_result = re.split(translation_delimiter, main_content_html, flags=re.IGNORECASE)
                parts = [split_result[i] for i in range(0, len(split_result), 2)]
                has_translations = len(parts) > 1
                num_translation_parts = len(parts)
                has_resources = len(resources) > 0
                validation_errors = validate_note_metadata(
                    meta,
                    medium,
                    has_translations=has_translations,
                    num_translation_parts=num_translation_parts,
                    has_resources=has_resources
                )
                if validation_errors:
                    error_msg = "Validatiefouten: " + "; ".join(validation_errors)
                    raise ValueError(error_msg)
                medium_counts[medium] = medium_counts.get(medium, 0) + 1
                subtype_key = f"{medium}/{subtype}"
                subtype_counts[subtype_key] = subtype_counts.get(subtype_key, 0) + 1
                medium_folder = dest_dir / medium
                medium_folder.mkdir(parents=True, exist_ok=True)
                created_files_count = 0
                if medium in ['writing', 'audio']:
                    translation_delimiter = r'---TRANSLATION_([a-z]{2})---'
                    split_result = re.split(translation_delimiter, main_content_html, flags=re.IGNORECASE)
                    parts = [split_result[i] for i in range(0, len(split_result), 2)]
                    languages_from_meta = [l for l in [meta.get('language1'), meta.get('language2'), meta.get('language3')] if l]
                    if len(parts) != len(languages_from_meta):
                        raise ValueError(f"Aantal tekstblokken ({len(parts)}) komt niet overeen met het aantal talen in metadata ({len(languages_from_meta)}). Gevonden delen: {len(parts)}, verwachte talen: {len(languages_from_meta)}")
                    for i, lang_code in enumerate(languages_from_meta):
                        content_html = parts[i]
                        meta_lang = {}
                        for key, value in meta.items():
                            meta_lang[key] = value
                            if key == 'version':
                                meta_lang['language'] = lang_code
                        filename_lang = generate_filename(meta, lang=lang_code)
                        file_path = medium_folder / f"{filename_lang}.html"
                        generate_html_file(meta_lang, content_html, file_path)
                        created_files_count += 1
                if resources:
                    meta_begin_pos = content_xml.find('---META_BEGIN---')
                    meta_end_pos = content_xml.find('---META_END---')
                    before_meta = content_xml[:meta_begin_pos] if meta_begin_pos != -1 else content_xml
                    after_meta = content_xml[meta_end_pos + len('---META_END---'):] if meta_end_pos != -1 else ''
                    for idx, resource in enumerate(resources):
                        data_b64 = resource.findtext('data')
                        if not data_b64:
                            continue
                        in_before = before_meta.find(data_b64) != -1
                        in_meta_block = False
                        in_after = after_meta.find(data_b64) != -1
                        if meta_begin_pos != -1 and meta_end_pos != -1:
                            meta_block = content_xml[meta_begin_pos:meta_end_pos + len('---META_END---')]
                            in_meta_block = meta_block.find(data_b64) != -1
                        if not in_before or in_meta_block or in_after:
                            continue
                        mime = resource.findtext('mime', '')
                        file_name = resource.findtext('file-name', '')
                        ext = ''
                        data_bytes = base64.b64decode(data_b64)
                        if medium == 'audio':
                            if data_bytes[:4] == b'MThd':
                                ext = '.midi'
                            elif data_bytes[:3] == b'ID3' or (len(data_bytes) > 1 and data_bytes[0] == 0xFF and data_bytes[1] in [0xFB, 0xF3, 0xFA]):
                                ext = '.mp3'
                            elif data_bytes[:4] == b'RIFF' and data_bytes[8:12] == b'WAVE':
                                ext = '.wav'
                            elif data_bytes[:4] == b'OggS':
                                ext = '.ogg'
                            elif data_bytes[:4] == b'fLaC':
                                ext = '.flac'
                            elif len(data_bytes) > 1 and data_bytes[0] == 0xFF and data_bytes[1] in [0xF1, 0xF9]:
                                ext = '.aac'
                            elif data_bytes[4:11] == b'ftypM4A':
                                ext = '.m4a'
                            else:
                                ext = '.dat'
                        else:
                            if file_name and '.' in file_name:
                                ext = os.path.splitext(file_name)[1].lower()
                        if not ext:
                            if 'jpeg' in mime or 'jpg' in mime:
                                ext = '.jpg'
                            elif 'png' in mime:
                                ext = '.png'
                            elif 'gif' in mime:
                                ext = '.gif'
                            elif 'webp' in mime:
                                ext = '.webp'
                            elif 'mp3' in mime:
                                ext = '.mp3'
                            elif 'wav' in mime:
                                ext = '.wav'
                            elif 'ogg' in mime:
                                ext = '.ogg'
                            elif 'flac' in mime:
                                ext = '.flac'
                            elif 'aac' in mime:
                                ext = '.aac'
                            elif 'm4a' in mime:
                                ext = '.m4a'
                            elif 'mp4' in mime:
                                ext = '.mp4'
                            elif 'webm' in mime:
                                ext = '.webm'
                            elif 'mov' in mime:
                                ext = '.mov'
                            elif 'pdf' in mime:
                                ext = '.pdf'
                            elif 'svg' in mime:
                                ext = '.svg'
                            elif 'audio' in mime:
                                ext = '.mp3'
                            else:
                                ext = '.dat'
                        version = idx + 1
                        media_filename = generate_filename(meta, version=version)
                        media_path = medium_folder / f"{media_filename}{ext}"
                        media_path.write_bytes(data_bytes)
                        created_files_count += 1
                    created_files_log = []
                    if medium not in ['writing', 'audio']:
                        meta_with_lang = {}
                        for key, value in meta.items():
                            meta_with_lang[key] = value
                            if key == 'version':
                                primary_lang = meta.get('language1', 'en')
                                meta_with_lang['language'] = primary_lang
                        base_filename = generate_filename(meta)
                        html_path = medium_folder / f"{base_filename}.html"
                        generate_html_file(meta_with_lang, main_content_html, html_path)
                        created_files_count += 1
                    if not resources:
                        raise ValueError(f"Medium is '{medium}' maar er is geen afbeelding/bestand bijgevoegd.")

                    # Process media files
                    for idx, resource in enumerate(resources):
                        mime = resource.findtext('mime', '')
                        file_name = resource.findtext('file-name', '')
                        ext = ''
                        data_b64 = resource.findtext('data')
                        if not data_b64:
                            continue
                        data_bytes = base64.b64decode(data_b64)
                        if not ext:
                            if 'jpeg' in mime or 'jpg' in mime:
                                ext = '.jpg'
                            elif 'png' in mime:
                                ext = '.png'
                            elif 'gif' in mime:
                                ext = '.gif'
                            elif 'webp' in mime:
                                ext = '.webp'
                            elif 'mp3' in mime:
                                ext = '.mp3'
                            elif 'wav' in mime:
                                ext = '.wav'
                            elif 'ogg' in mime:
                                ext = '.ogg'
                            elif 'flac' in mime:
                                ext = '.flac'
                            elif 'aac' in mime:
                                ext = '.aac'
                            elif 'm4a' in mime:
                                ext = '.m4a'
                            elif 'mp4' in mime:
                                ext = '.mp4'
                            elif 'webm' in mime:
                                ext = '.webm'
                            elif 'mov' in mime:
                                ext = '.mov'
                            elif 'pdf' in mime:
                                ext = '.pdf'
                            elif 'svg' in mime:
                                ext = '.svg'
                            elif 'audio' in mime:
                                ext = '.mp3'
                            else:
                                ext = '.dat'
                        version = idx + 1
                        media_filename = generate_filename(meta, version=version)
                        media_path = medium_folder / f"{media_filename}{ext}"
                        media_path.write_bytes(data_bytes)
                        # print(f"    📄 File saved: {media_path}")  # Verbose output removed
                        # media_file_status = "Overschreven" if media_path.exists() else "Nieuw"
                        # created_files_log.append(f"{media_path.name} ({media_file_status})")

                    report['success'].append({'title': meta.get('title', note_title_raw), 'files': created_files_log})

            except Exception as e:
                report['failed'].append({'title': note_title_raw, 'reason': str(e)})

    # --- Rapportage ---
    # Legacy category summary removed

    print("\n" + "="*50)
    print("🎨 OVERZICHT GEVONDEN NOTITIES PER MEDIUM")
    print("="*50)
    if medium_counts:
        for medium, count in sorted(medium_counts.items()):
            print(f"  {medium:15} : {count:3} notities")
        print(f"\n  {'TOTAAL':15} : {sum(medium_counts.values()):3} notities")
    else:
        print("  Geen notities gevonden.")

    print("\n" + "="*50)
    print("🔧 OVERZICHT GEVONDEN NOTITIES PER MEDIUM/SUBTYPE")
    print("="*50)
    if subtype_counts:
        for subtype_key, count in sorted(subtype_counts.items()):
            print(f"  {subtype_key:20} : {count:3} notities")
        print(f"\n  {'TOTAAL':20} : {sum(subtype_counts.values()):3} notities")
    else:
        print("  Geen notities gevonden.")

    # print("\n" + "="*50)
    # print("✅ SUCCESVOL VERWERKTE NOTITIES")
    # print("="*50)
    # if report['success']:
    #     for item in report['success']:
    #         print(f"✅ {item['title']} ({len(item['files'])} bestanden aangemaakt)")
    # else:
    #     print("  Geen notities succesvol verwerkt.")

    if report['failed']:
        print("\n" + "="*50)
        print("❌ NIET VERWERKTE NOTITIES")
        print("="*50)
        for item in report['failed']:
            print(f"❌ {item['title']}")
            print(f"    💬 Reden: {item['reason']}")

    if report['warnings']:
        print("\n" + "="*50)
        print("⚠️  WAARSCHUWINGEN & PARSING ISSUES")
        print("="*50)
        for warning in report['warnings']:
            print(warning)

    print("\n" + "="*50)

def validate_note_metadata(meta: Dict[str, Any], category: str, has_translations: bool = False, num_translation_parts: int = 0, has_resources: bool = False) -> List[str]:
    """
    Valideert metadata van een notitie volgens de nieuwe medium/subtype regels.
    Retourneert een lijst van validatiefouten (lege lijst = geen fouten).
    """
    errors = []
    
    # Check required fields exist and are not empty
    for field in REQUIRED_METADATA_FIELDS:
        if field not in meta or not str(meta[field]).strip():
            errors.append(f"Verplicht veld '{field}' ontbreekt of is leeg")
    
    # Validate medium/subtype
    medium = meta.get('medium')
    subtype = meta.get('subtype')
    
    if medium and medium not in VALID_MEDIUMS:
        errors.append(f"Onbekend medium '{medium}'. Toegestaan: {', '.join(VALID_MEDIUMS)}")
    
    if medium and subtype and not validate_medium_subtype(medium, subtype):
        allowed_subtypes = VALID_SUBTYPES.get(medium, [])
        errors.append(f"Onbekend subtype '{subtype}' voor medium '{medium}'. Toegestaan: {', '.join(allowed_subtypes)}")
    
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
        day_value = meta.get('day', 0)
        if isinstance(day_value, str):
            # Clean problematic characters from day string
            day_str = day_value.strip().replace('`', '').replace('?', '').replace('~', '')
            # Extract just the number
            match = re.search(r'\d+', day_str)
            if match:
                day = int(match.group())
            else:
                day = 0
        else:
            day = int(day_value)
        
        if day < 1 or day > 31:
            errors.append(f"Dag '{day}' moet tussen 1 en 31 liggen")
    except (ValueError, TypeError):
        errors.append(f"Dag '{meta.get('day')}' is geen geldig getal")
    
    # Validate evaluation (1-5)
    if 'evaluation' in meta and meta['evaluation']:
        try:
            evaluation = int(meta['evaluation'])
            if evaluation < 1 or evaluation > 5:
                errors.append(f"Evaluatie '{evaluation}' moet tussen 1 en 5 liggen")
        except (ValueError, TypeError):
            errors.append(f"Evaluatie '{meta.get('evaluation')}' is geen geldig getal")
    
    # Validate rating (1-5)
    if 'rating' in meta and meta['rating']:
        try:
            rating = int(meta['rating'])
            if rating < 1 or rating > 5:
                errors.append(f"Rating '{rating}' moet tussen 1 en 5 liggen")
        except (ValueError, TypeError):
            errors.append(f"Rating '{meta.get('rating')}' is geen geldig getal")
    
    # Medium-specific validation (replace legacy category logic)
    if meta.get('medium') in ['writing', 'audio']:
        # Text/audio mediums need language fields
        if not meta.get('language1'):
            errors.append(f"Medium '{meta.get('medium')}' vereist een ingevulde 'language1'")
        if has_translations:
            languages = [meta.get('language1'), meta.get('language2'), meta.get('language3')]
            filled_languages = [lang for lang in languages if lang and str(lang).strip()]
            if len(filled_languages) != num_translation_parts:
                errors.append(f"Aantal ingevulde talen ({len(filled_languages)}) komt niet overeen met aantal tekstblokken ({num_translation_parts})")
            if len(filled_languages) != len(set(filled_languages)):
                errors.append("Taalcodes mogen niet dubbel voorkomen")
    elif meta.get('medium') in ['drawing', 'sculpture', 'other']:
        # Media mediums need attached resources
        if not has_resources:
            errors.append(f"Medium '{meta.get('medium')}' vereist minstens één bijgevoegd bestand")
    
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
