// Simple script to check what image URLs are actually stored in the database
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, child } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Environment variables for testing
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "AIzaSyBEJdcFNKGUIx8JKCevY0pY6aTqRHTLVzs";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "artwall-by-jr.firebaseapp.com";
process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL = "https://artwall-by-jr-default-rtdb.europe-west1.firebasedatabase.app";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "artwall-by-jr";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "artwall-by-jr.appspot.com";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "965847404036";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "1:965847404036:web:0a7a1e53e1ae1b1d745e66";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function checkDatabaseUrls() {
  console.log('=== Checking Image URLs in Database ===\n');
  
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, 'artwall'));
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      let count = 0;
      let urlsFound = [];
      
      // Look through all mediums
      for (const [medium, artworks] of Object.entries(data)) {
        if (artworks && typeof artworks === 'object') {
          for (const [artworkId, artwork] of Object.entries(artworks)) {
            count++;
            
            // Check for image URLs
            if (artwork.coverImageUrl) {
              urlsFound.push({
                id: artworkId,
                medium: medium,
                title: artwork.title,
                url: artwork.coverImageUrl
              });
            }
            
            if (artwork.mediaUrl && typeof artwork.mediaUrl === 'string' && artwork.mediaUrl.includes('firebasestorage')) {
              urlsFound.push({
                id: artworkId,
                medium: medium,
                title: artwork.title,
                url: artwork.mediaUrl
              });
            }

            if (artwork.mediaUrls && Array.isArray(artwork.mediaUrls)) {
              artwork.mediaUrls.forEach(url => {
                if (url && url.includes('firebasestorage')) {
                  urlsFound.push({
                    id: artworkId,
                    medium: medium,
                    title: artwork.title,
                    url: url
                  });
                }
              });
            }

            // Only check first few to avoid spam
            if (count >= 10) break;
          }
          if (count >= 10) break;
        }
      }
      
      console.log(`Found ${urlsFound.length} image URLs in first 10 artworks:`);
      
      // Test first few URLs
      for (let i = 0; i < Math.min(5, urlsFound.length); i++) {
        const item = urlsFound[i];
        console.log(`\n${i + 1}. ${item.title} (${item.medium})`);
        console.log(`URL: ${item.url}`);
        
        try {
          const response = await fetch(item.url, { method: 'HEAD' });
          console.log(`Status: ${response.status} ${response.statusText}`);
          
          if (response.status === 200) {
            console.log('✅ Image accessible!');
          }
        } catch (error) {
          console.log(`❌ Error: ${error.message}`);
        }
      }
      
    } else {
      console.log('No data found in database');
    }
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabaseUrls();