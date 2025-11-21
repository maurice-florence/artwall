const VersionTag = styled.div.attrs({
  'data-testid': 'version-tag'
})`
  position: fixed;
  bottom: 12px;
  right: 16px;
  background: #eee;
  color: #333;
  font-size: 0.75rem;
  border-radius: 6px;
  padding: 0.4em 0.8em;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  opacity: 0.95;
  z-index: 2000;
  border: 2px solid #0b8783;
`;
const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || 'dev';
const gitCommit = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || '';
import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { useArtworks } from '@/context/ArtworksContext';
// 👇 FIX: Import your Realtime Database instance, not the Firestore one.
import { realtimeDb } from '@/firebase/client';

// SECTION: Styled Components (no changes needed here)

const FooterWrapper = styled.footer`
  text-align: center;
  padding: 3rem 2rem 2rem;
  margin-top: 4rem;
  border-top: 1px solid #dddddd;
  background-color: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.cardText};
`;

const AddArtworkButton = styled.button`
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.accentText};
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
`;

const LastUpdatedText = styled.p`
  font-size: 0.8rem;
  color: #999;
`;

const DebugWrapper = styled.div`
  margin-top: 16px;
  font-size: 0.9rem;
  color: #888;
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  a {
    color: #E07A5F;
    font-weight: bold;
    margin: 0 8px;
  }
`;

// !SECTION

interface FooterProps {
  onAddNewArtwork?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAddNewArtwork }) => {
  const { artworks: appArtworks } = useArtworks();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dbCounts, setDbCounts] = useState<Record<string, number>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ IMPROVEMENT: Calculate derived data with useMemo to avoid extra re-renders.
  const appCounts = useMemo(() => {
    return appArtworks.reduce((acc, art) => {
      const medium = art.medium || 'onbekend';
      acc[medium] = (acc[medium] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [appArtworks]);

  const formattedDate = useMemo(() => {
    if (!lastUpdated) return '';
    // Use modern Intl API for robust, localized date formatting.
    return new Intl.DateTimeFormat('nl-NL', { dateStyle: 'long' }).format(lastUpdated);
  }, [lastUpdated]);

  // ✅ IMPROVEMENT: Consolidate all side effects into a single useEffect hook.
  useEffect(() => {
    // 👇 FIX: Use the correct database instance and path.
    const artwallRef = ref(realtimeDb, 'artwall');

    // 1. Set up the database listener
    const unsubscribeDb = onValue(artwallRef, (snapshot) => {
      const data = snapshot.val();
      const counts: Record<string, number> = {};
      if (data) {
        // Correctly count items within each medium category.
        Object.entries(data).forEach(([medium, artworks]) => {
          counts[medium] = artworks ? Object.keys(artworks).length : 0;
        });
      }
      setDbCounts(counts);
      setLastUpdated(new Date());
    });

    // 2. Set up the authentication listener
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user: User | null) => {
      setIsLoggedIn(!!user); // Set to true if user exists, false otherwise.
    });

    // 3. Return a cleanup function to unsubscribe from both listeners.
    return () => {
      unsubscribeDb();
      unsubscribeAuth();
    };
  }, []); // Empty dependency array means this runs only once on mount.

  return (
    <>
      <FooterWrapper>
        {isLoggedIn && onAddNewArtwork && (
          <AddArtworkButton onClick={onAddNewArtwork}>
            + Nieuw kunstwerk toevoegen
          </AddArtworkButton>
        )}

        {formattedDate && <LastUpdatedText>Laatst bijgewerkt: {formattedDate}</LastUpdatedText>}

        {/* Conditionally render debug info only in development environment */}
        {process.env.NODE_ENV === 'development' && (
          <DebugInfo dbCounts={dbCounts} appCounts={appCounts} />
        )}
      </FooterWrapper>
      <VersionTag>
        v{appVersion}{gitCommit ? ` (${gitCommit.slice(0,7)})` : ' (no commit)'}
      </VersionTag>
    </>
  );
};

// ✅ IMPROVEMENT: Extracted the debug UI into its own clean component.
const DebugInfo: React.FC<{
  dbCounts: Record<string, number>;
  appCounts: Record<string, number>;
}> = ({ dbCounts, appCounts }) => {
  const allKeys = Array.from(new Set([...Object.keys(dbCounts), ...Object.keys(appCounts)]));

  return (
    <DebugWrapper>
      <strong>Database vs. App (per categorie):</strong>
      <ul>
        {allKeys.map((key) => {
          const dbCount = dbCounts[key] || 0;
          const appCount = appCounts[key] || 0;
          return (
            <li key={key}>
              {key}: database={dbCount}, app={appCount}, verschil={dbCount - appCount}
            </li>
          );
        })}
      </ul>
      <div style={{ marginTop: 12 }}>
        <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
          Firebase Database
        </a>
        <a href="https://console.firebase.google.com/storage/" target="_blank" rel="noopener noreferrer">
          Firebase Storage
        </a>
      </div>
    </DebugWrapper>
  );
};

export default Footer;