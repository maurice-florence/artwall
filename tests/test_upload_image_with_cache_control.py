import unittest
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../scripts')))
import upload_image_with_cache_control

class TestUploadImageWithCacheControl(unittest.TestCase):
    def test_module_imports(self):
        self.assertIsNotNone(upload_image_with_cache_control)

if __name__ == '__main__':
    unittest.main()
