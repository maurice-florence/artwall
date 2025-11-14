// Test updated image URL function with correct patterns

// Copy the updated function
function getResizedImageUrl(originalUrl, size = 'original') {
  if (!originalUrl || size === 'original') return originalUrl;

  // Handle both storage.googleapis.com and firebasestorage.googleapis.com URLs
  if (!originalUrl.includes('storage.googleapis.com') && !originalUrl.includes('firebasestorage.googleapis.com')) {
    return originalUrl;
  }

  // Map size to dimensions based on firebase.json configuration
  const sizeMap = {
    thumbnail: '200x200',
    card: '400x400', 
    full: '1200x1200'
  };

  const dimensions = sizeMap[size];
  if (!dimensions) return originalUrl;

  // Extract the path part from the URL
  let pathMatch = null;
  let baseDomain = '';

  if (originalUrl.includes('firebasestorage.googleapis.com')) {
    // Format: https://firebasestorage.googleapis.com/v0/b/bucket/o/path?params
    pathMatch = originalUrl.match(/\/o\/(.*?)\?/);
    baseDomain = 'firebasestorage.googleapis.com/v0/b/';
  } else if (originalUrl.includes('storage.googleapis.com')) {
    // Format: https://storage.googleapis.com/bucket/path
    pathMatch = originalUrl.match(/storage\.googleapis\.com\/[^\/]+\/(.*?)(?:\?|$)/);
    baseDomain = 'storage.googleapis.com/';
  }

  if (!pathMatch) return originalUrl;

  const path = decodeURIComponent(pathMatch[1]);
  
  // Create the resized image path
  // Firebase extension format: {filename}_{dimensions}.{ext}
  const extension = path.split('.').pop();
  const basePath = path.slice(0, -(extension?.length || 0) - 1);
  const resizedPath = `${basePath}_${dimensions}.${extension}`;
  
  // Reconstruct URL based on original format
  if (originalUrl.includes('firebasestorage.googleapis.com')) {
    const bucketMatch = originalUrl.match(/\/b\/([^\/]+)\/o\//);
    const bucket = bucketMatch ? bucketMatch[1] : 'artwall-by-jr.appspot.com';
    const params = originalUrl.includes('?') ? originalUrl.split('?')[1] : 'alt=media';
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(resizedPath)}?${params}`;
  } else {
    const bucketMatch = originalUrl.match(/storage\.googleapis\.com\/([^\/]+)\//);
    const bucket = bucketMatch ? bucketMatch[1] : 'artwall-by-jr.firebasestorage.app';
    return `https://storage.googleapis.com/${bucket}/${resizedPath}`;
  }
}

// Test with actual URLs from Firebase Storage
const testUrls = [
  'https://storage.googleapis.com/artwall-by-jr.firebasestorage.app/drawing/20050101_drawing_pencil_uit_01.jpg',
  'https://storage.googleapis.com/artwall-by-jr.firebasestorage.app/drawing/20080101_drawing_marker_bjork_01.jpg'
];

console.log('=== Testing Updated Image URL Function ===\n');

for (const url of testUrls) {
  console.log(`Original: ${url}`);
  console.log(`Card: ${getResizedImageUrl(url, 'card')}`);
  console.log(`Thumbnail: ${getResizedImageUrl(url, 'thumbnail')}`);
  console.log(`Full: ${getResizedImageUrl(url, 'full')}`);
  console.log('');
}

// Test actual availability
async function testResizedUrls() {
  console.log('Testing actual URL availability:');
  
  const url = 'https://storage.googleapis.com/artwall-by-jr.firebasestorage.app/drawing/20050101_drawing_pencil_uit_01.jpg';
  const cardUrl = getResizedImageUrl(url, 'card');
  
  try {
    const response = await fetch(cardUrl, { method: 'HEAD' });
    console.log(`Card URL: ${response.status} ${response.statusText}`);
    if (response.status === 200) {
      console.log('✅ Resized image is accessible!');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

testResizedUrls();