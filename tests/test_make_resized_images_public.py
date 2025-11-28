import unittest
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../scripts')))
import make_resized_images_public

class TestMakeResizedImagesPublic(unittest.TestCase):
    def test_module_imports(self):
        self.assertIsNotNone(make_resized_images_public)

if __name__ == '__main__':
    unittest.main()
