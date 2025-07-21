import unittest
import pathlib
import tempfile
import shutil
from evernote_to_files import (
    get_medium_subtype_from_category,
    validate_medium_subtype,
    normalize_subtype,
    auto_detect_medium_subtype_from_content,
    clean_metadata_for_yaml,
    safe_yaml_value,
    extract_metadata_and_content,
    clean_html_content,
    generate_html_file,
    generate_filename,
    process_enex_files,
    validate_note_metadata,
    is_file_stable,
    wait_for_file_stability
)

class TestEvernoteToFiles(unittest.TestCase):
    def test_medium_subtype(self):
        result = get_medium_subtype_from_category('painting')
        self.assertIsInstance(result, tuple)
        self.assertEqual(len(result), 2)
        self.assertIsInstance(result[0], str)
        self.assertIsInstance(result[1], (str, type(None)))
        self.assertIsInstance(normalize_subtype('painting', 'other'), str)

    def test_auto_detect_medium(self):
        content = '<div>Test</div>'
        medium, subtype = auto_detect_medium_subtype_from_content(content)
        self.assertIsInstance(medium, str)

    def test_metadata_and_content(self):
        note = '<div>meta</div>'
        meta, content = extract_metadata_and_content(note)
        self.assertTrue(isinstance(content, str))

    def test_html_cleaning(self):
        html = '<div>Test</div>'
        cleaned = clean_html_content(html)
        self.assertIn('Test', cleaned)

    def test_file_stability(self):
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp.write(b'test')
            tmp.flush()
            self.assertIsInstance(is_file_stable(pathlib.Path(tmp.name), 2), bool)
            self.assertIsInstance(wait_for_file_stability(pathlib.Path(tmp.name), 2), bool)

    def test_process_enex_files(self):
        src = pathlib.Path(tempfile.mkdtemp())
        dst = pathlib.Path(tempfile.mkdtemp())
        try:
            process_enex_files(src, dst)
        finally:
            shutil.rmtree(src)
            shutil.rmtree(dst)

if __name__ == '__main__':
    unittest.main()
