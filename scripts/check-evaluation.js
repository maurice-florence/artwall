const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey_artwall.json');

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://artwall-by-jr-default-rtdb.europe-west1.firebasedatabase.app/'
  });
}

const db = admin.database();

db.ref('/artworks').limitToFirst(3).once('value').then(snapshot => {
  const data = snapshot.val();
  if (data) {
    Object.keys(data).forEach(mediumKey => {
      console.log('\n=== Medium:', mediumKey, '===');
      const items = data[mediumKey];
      Object.keys(items).slice(0, 2).forEach(id => {
        const item = items[id];
        console.log('\nItem ID:', id);
        console.log('  Title:', item.title);
        console.log('  Evaluation (direct):', item.evaluation);
        console.log('  EvaluationNum (direct):', item.evaluationNum);
        console.log('  Rating (direct):', item.rating);
        console.log('  RatingNum (direct):', item.ratingNum);
        
        // Check if it's in metadata
        if (item.metadata) {
          console.log('  Metadata.evaluation:', item.metadata.evaluation);
          console.log('  Metadata.rating:', item.metadata.rating);
        }
        
        // Show all keys
        console.log('  All keys:', Object.keys(item).join(', '));
      });
    });
  }
  process.exit(0);
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
