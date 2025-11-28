import unittest
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../scripts')))
import enex_to_artwall_files

class TestEnexToArtwallFiles(unittest.TestCase):
    def test_get_medium_subtype_from_category(self):
        self.assertEqual(enex_to_artwall_files.get_medium_subtype_from_category('poetry'), ('writing', 'poem'))
        self.assertEqual(enex_to_artwall_files.get_medium_subtype_from_category('unknown'), ('other', 'other'))

    def test_validate_medium_subtype(self):
        # Should be True for valid, False for invalid
        self.assertTrue(enex_to_artwall_files.validate_medium_subtype('drawing', 'marker'))
        self.assertFalse(enex_to_artwall_files.validate_medium_subtype('drawing', 'invalid'))

    def test_normalize_subtype(self):
        self.assertEqual(enex_to_artwall_files.normalize_subtype('drawing', 'marker'), 'marker')
        self.assertEqual(enex_to_artwall_files.normalize_subtype('drawing', 'invalid'), 'other')

    def test_auto_detect_medium_subtype_from_content(self):
        self.assertEqual(enex_to_artwall_files.auto_detect_medium_subtype_from_content('Dit is een lied met akkoord'), ('music', 'vocal'))
        self.assertEqual(enex_to_artwall_files.auto_detect_medium_subtype_from_content('Dit is een lang verhaal ' * 100), ('writing', 'prose'))

    def test_clean_metadata_for_yaml(self):
        html = '<div>Test</div>'
        cleaned = enex_to_artwall_files.clean_metadata_for_yaml(html)
        self.assertIn('Test', cleaned)

    def test_safe_yaml_value(self):
        self.assertTrue(isinstance(enex_to_artwall_files.safe_yaml_value("test's"), str))

    def test_extract_metadata_and_content(self):
        note = '---META_BEGIN---title: Test\n---META_END---Content'
        meta, content = enex_to_artwall_files.extract_metadata_and_content(note)
        self.assertTrue(isinstance(content, str))

    def test_clean_html_content(self):
        html = '<div>Test</div>'
        cleaned = enex_to_artwall_files.clean_html_content(html)
        self.assertIn('Test', cleaned)

    def test_generate_filename(self):
        meta = {'year': 2022, 'month': 1, 'day': 1, 'medium': 'drawing', 'subtype': 'marker', 'title': 'Test'}
        filename = enex_to_artwall_files.generate_filename(meta)
        self.assertIn('drawing_marker', filename)

if __name__ == '__main__':
    unittest.main()
