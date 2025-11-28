import unittest
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../scripts')))
import firebase_status_checker

class TestFirebaseStatusChecker(unittest.TestCase):
    def test_initialize_firebase_exists(self):
        self.assertTrue(callable(getattr(firebase_status_checker, 'initialize_firebase', None)))
    def test_check_database_exists(self):
        self.assertTrue(callable(getattr(firebase_status_checker, 'check_database', None)))
    def test_analyze_metadata_structure_exists(self):
        self.assertTrue(callable(getattr(firebase_status_checker, 'analyze_metadata_structure', None)))
    def test_check_storage_exists(self):
        self.assertTrue(callable(getattr(firebase_status_checker, 'check_storage', None)))
    def test_check_local_folder_exists(self):
        self.assertTrue(callable(getattr(firebase_status_checker, 'check_local_folder', None)))
    def test_compare_contents_exists(self):
        self.assertTrue(callable(getattr(firebase_status_checker, 'compare_contents', None)))

if __name__ == '__main__':
    unittest.main()
