import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '@/firebase';
import { ref, onValue } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useArtworks } from '@/context/ArtworksContext';

const FooterWrapper = styled.footer`
  text-align: center;
  padding: 3rem 2rem 2rem;
  margin-top: 4rem;
  border-top: 1px solid #dddddd;
  background-color: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.cardText};
`;

const LastUpdatedText = styled.p`
  font-size: 0.8rem;
  color: #999;
`;

const Footer: React.FC = () => {
  const { artworks: appArtworks } = useArtworks();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>("");
  const [dbCounts, setDbCounts] = useState<Record<string, number>>({});
  const [appCounts, setAppCounts] = useState<Record<string, number>>({});
  const [diff, setDiff] = useState<Record<string, number>>({});

  useEffect(() => {
    const artworksRef = ref(db, 'artworks');
    onValue(artworksRef, (snapshot) => {
      setLastUpdated(new Date());
      const data = snapshot.val();
      const dbCount: Record<string, number> = {};
      if (data) {
        Object.values(data).forEach((art: any) => {
          const cat = art.category || 'onbekend';
          dbCount[cat] = (dbCount[cat] || 0) + 1;
        });
      }
      setDbCounts(dbCount);
    });
    // Optionally, you could fetch storage info here as well
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {});
    return () => unsubscribe();
  }, []);

  // Get app counts from context
  useEffect(() => {
    // Use artworks from context for appCounts
    const appCount: Record<string, number> = {};
    appArtworks.forEach((art: any) => {
      const cat = art.category || 'onbekend';
      appCount[cat] = (appCount[cat] || 0) + 1;
    });
    setAppCounts(appCount);
  }, [appArtworks]);

  useEffect(() => {
    // Compare dbCounts and appCounts
    const d: Record<string, number> = {};
    Object.keys(dbCounts).forEach(cat => {
      d[cat] = (dbCounts[cat] || 0) - (appCounts[cat] || 0);
    });
    setDiff(d);
  }, [dbCounts, appCounts]);

  useEffect(() => {
    if (lastUpdated) {
      setLastUpdatedText(
        lastUpdated.getFullYear() + '-' +
        String(lastUpdated.getMonth() + 1).padStart(2, '0') + '-' +
        String(lastUpdated.getDate()).padStart(2, '0')
      );
    }
  }, [lastUpdated]);

  return (
    <FooterWrapper>
      {lastUpdated && (
        <LastUpdatedText>
          Laatst bijgewerkt: {lastUpdatedText}
        </LastUpdatedText>
      )}
      {/* Database/App comparison */}
      <div style={{ marginTop: 16, fontSize: '0.9rem', color: '#888' }}>
        <strong>Database vs App (per categorie):</strong>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {Object.keys(dbCounts).map(cat => (
            <li key={cat}>
              {cat}: database={dbCounts[cat] || 0}, app={appCounts[cat] || 0}, verschil={diff[cat] || 0}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 12 }}>
          <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#E07A5F', fontWeight: 'bold', marginRight: 16 }}>
            Firebase Database
          </a>
          <a href="https://console.firebase.google.com/storage/" target="_blank" rel="noopener noreferrer" style={{ color: '#E07A5F', fontWeight: 'bold' }}>
            Firebase Storage
          </a>
        </div>
      </div>
    </FooterWrapper>
  );
};

export default Footer;
