// Test actual naming patterns found in Firebase Storage

const testActualPatterns = async () => {
  console.log('=== Testing Actual Firebase Storage Image Patterns ===\n');

  // Based on the Firebase status checker output, try the _480x480 pattern
  const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20191029_drawing_marker_faces-1_01';
  
  const patterns = [
    '.jpg?alt=media',                    // original
    '__card.jpg?alt=media',              // expected by our code
    '__thumbnail.jpg?alt=media',         // expected by our code
    '__full.jpg?alt=media',              // expected by our code
    '_480x480.jpg?alt=media',           // pattern seen in status check
    '_200x200.jpg?alt=media',           // potential thumbnail pattern
    '_1200x1200.jpg?alt=media'          // potential full pattern
  ];

  console.log('Testing different naming patterns for faces-1_01.jpg:');
  
  for (const pattern of patterns) {
    const testUrl = baseUrl + pattern;
    console.log(`\nTesting: ${pattern}`);
    console.log(`URL: ${testUrl}`);
    
    try {
      const response = await fetch(testUrl, { method: 'HEAD' });
      console.log(`✅ Status: ${response.status} ${response.statusText}`);
      if (response.status === 200) {
        console.log('🎉 This pattern works!');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
};

// Run test
testActualPatterns().catch(console.error);