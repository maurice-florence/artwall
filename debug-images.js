// Debug script to test image resizing functionality
// Inline implementation to avoid module issues

function getResizedImageUrl(originalUrl, size = 'original') {
  if (!originalUrl || size === 'original') return originalUrl;

  // Only process URLs from Firebase Storage
  if (!originalUrl.includes('firebasestorage.googleapis.com')) {
    return originalUrl;
  }

  // Extract the path part from the URL (everything after /o/)
  const pathMatch = originalUrl.match(/\/o\/(.*?)\?/);
  if (!pathMatch) return originalUrl;

  const path = decodeURIComponent(pathMatch[1]);
  
  // Construct the resized image URL
  // The extension creates files in the format: {path}__{size}.{ext}
  const extension = path.split('.').pop();
  const basePath = path.slice(0, -(extension?.length || 0) - 1);
  const resizedPath = `${basePath}__${size}.${extension}`;
  
  // Replace the path in the original URL
  return originalUrl.replace(
    encodeURIComponent(path),
    encodeURIComponent(resizedPath)
  );
}

// Test with a sample Firebase Storage URL
const originalUrl = 'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2Fexample.jpg?alt=media&token=abc123';

console.log('=== Testing Image URL Transformation ===');
console.log('Original URL:', originalUrl);
console.log('Thumbnail URL:', getResizedImageUrl(originalUrl, 'thumbnail'));
console.log('Card URL:', getResizedImageUrl(originalUrl, 'card'));
console.log('Full URL:', getResizedImageUrl(originalUrl, 'full'));

// Test URL construction with a real artwork
console.log('\n--- Testing URL Construction ---');
const testOriginal = 'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2Ftest-image.jpg?alt=media&token=xyz789';
const cardUrl = getResizedImageUrl(testOriginal, 'card');
console.log('Expected card URL:', cardUrl);

// Check if the utility correctly extracts path
const pathMatch = testOriginal.match(/\/o\/(.*?)\?/);
if (pathMatch) {
  const path = decodeURIComponent(pathMatch[1]);
  console.log('Extracted path:', path);
  
  const extension = path.split('.').pop();
  const basePath = path.slice(0, -(extension?.length || 0) - 1);
  const expectedResizedPath = `${basePath}__card.${extension}`;
  console.log('Expected resized path:', expectedResizedPath);
}

console.log('\n--- Testing various formats ---');
const urls = [
  'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2Fsketch1.jpeg?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/sculpture%2Fpiece-2023.png?alt=media&token=abc',
  'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/other%2Fsome%20image%20with%20spaces.jpg?alt=media'
];

urls.forEach(url => {
  console.log(`\nOriginal: ${url}`);
  console.log(`Card size: ${getResizedImageUrl(url, 'card')}`);
});