// Test script to validate image URL generation and check resized image availability

const testImageUrls = async () => {
  console.log('=== Testing Image URL Generation and Availability ===\n');

  // Sample original URLs from Firebase Storage (based on sync output)
  const sampleUrls = [
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20191029_drawing_marker_faces-1_01.jpg?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20200326_drawing_marker_disgust_01.jpg?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/sculpture%2F20230812_sculpture_clay_sebastian_01.jpg?alt=media'
  ];

  // Function to get resized URL (inline version)
  function getResizedImageUrl(originalUrl, size = 'original') {
    if (!originalUrl || size === 'original') return originalUrl;

    if (!originalUrl.includes('firebasestorage.googleapis.com')) {
      return originalUrl;
    }

    const pathMatch = originalUrl.match(/\/o\/(.*?)\?/);
    if (!pathMatch) return originalUrl;

    const path = decodeURIComponent(pathMatch[1]);
    const extension = path.split('.').pop();
    const basePath = path.slice(0, -(extension?.length || 0) - 1);
    const resizedPath = `${basePath}__${size}.${extension}`;
    
    return originalUrl.replace(
      encodeURIComponent(path),
      encodeURIComponent(resizedPath)
    );
  }

  // Test URL transformations
  for (const originalUrl of sampleUrls) {
    console.log(`\n--- Testing: ${originalUrl.split('/').pop()?.split('?')[0]} ---`);
    
    const sizes = ['thumbnail', 'card', 'full'];
    for (const size of sizes) {
      const resizedUrl = getResizedImageUrl(originalUrl, size);
      console.log(`${size} (${getSizeSpec(size)}): ${resizedUrl}`);
      
      // Test if URL is accessible (basic check)
      try {
        const response = await fetch(resizedUrl, { method: 'HEAD' });
        console.log(`  ✅ ${size}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`  ❌ ${size}: Error - ${error.message}`);
      }
    }
  }

  function getSizeSpec(size) {
    switch (size) {
      case 'thumbnail': return '200x200';
      case 'card': return '400x400';
      case 'full': return '1200x1200';
      default: return 'original';
    }
  }
};

// Run tests
testImageUrls().catch(console.error);