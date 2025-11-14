// Test with exact file names from sync output

const testExactFiles = async () => {
  console.log('=== Testing Exact Files from Sync Output ===\n');

  // Files that were shown as uploaded in the sync output
  const exactFiles = [
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20191029_drawing_marker_faces-1_01.jpg?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20200326_drawing_marker_disgust_01.jpg?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20191204_drawing_marker_cracks_01.jpg?alt=media'
  ];

  // Also test with the resized patterns shown in the status checker
  const resizedFiles = [
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20191029_drawing_marker_faces-1_01_480x480.jpg?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20200326_drawing_marker_disgust_01_480x480.jpg?alt=media'
  ];

  console.log('Testing original files from sync output:');
  for (const url of exactFiles) {
    console.log(`\nTesting: ${url.split('o/')[1].split('?')[0]}`);
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`Status: ${response.status} ${response.statusText}`);
      if (response.status === 200) {
        console.log('✅ Original file exists!');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\nTesting resized files:');
  for (const url of resizedFiles) {
    console.log(`\nTesting: ${url.split('o/')[1].split('?')[0]}`);
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`Status: ${response.status} ${response.statusText}`);
      if (response.status === 200) {
        console.log('✅ Resized file exists!');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
};

// Run test
testExactFiles().catch(console.error);