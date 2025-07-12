// src/app/admin/page.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\app\admin\page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useArtworks } from '@/context/ArtworksContext';
import AdminModal from '@/components/AdminModal';
import { Artwork } from '@/types';

const AdminContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const AdminHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #E07A5F;
  margin: 0;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: #E07A5F;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background: #d66a4a;
  }
`;

const ArtworkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ArtworkCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #E07A5F;
`;

const ArtworkTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const ArtworkMeta = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EditButton = styled.button`
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    background: #0056b3;
  }
`;

const DeleteButton = styled.button`
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    background: #c82333;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const AdminPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [artworkToEdit, setArtworkToEdit] = useState<Artwork | null>(null);
  const { artworks } = useArtworks();
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
      
      // Redirect to home if not authenticated
      if (!currentUser) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleAddNew = () => {
    setArtworkToEdit(null);
    setIsAdminModalOpen(true);
  };

  const handleEdit = (artwork: Artwork) => {
    setArtworkToEdit(artwork);
    setIsAdminModalOpen(true);
  };

  const handleDelete = async (artwork: Artwork) => {
    if (confirm(`Weet je zeker dat je "${artwork.title}" wilt verwijderen?`)) {
      // TODO: Implement delete functionality
      console.log('Delete artwork:', artwork.id);
    }
  };

  const handleCloseModal = () => {
    setIsAdminModalOpen(false);
    setArtworkToEdit(null);
  };

  if (isLoading) {
    return <LoadingMessage>Laden...</LoadingMessage>;
  }

  if (!user) {
    return <LoadingMessage>Toegang geweigerd. Authenticatie vereist.</LoadingMessage>;
  }

  return (
    <AdminContainer>
      <AdminHeader>
        <Title>Admin Dashboard</Title>
        <Button onClick={handleAddNew}>
          + Nieuw Kunstwerk
        </Button>
      </AdminHeader>

      <ArtworkGrid>
        {artworks.map((artwork) => (
          <ArtworkCard key={artwork.id}>
            <ArtworkTitle>{artwork.title}</ArtworkTitle>
            <ArtworkMeta>
              {artwork.category} • {artwork.year}
              {artwork.month && `/${artwork.month}`}
              {artwork.day && `/${artwork.day}`}
            </ArtworkMeta>
            <ActionButtons>
              <EditButton onClick={() => handleEdit(artwork)}>
                Bewerken
              </EditButton>
              <DeleteButton onClick={() => handleDelete(artwork)}>
                Verwijderen
              </DeleteButton>
            </ActionButtons>
          </ArtworkCard>
        ))}
      </ArtworkGrid>

      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={handleCloseModal}
        artworkToEdit={artworkToEdit}
      />
    </AdminContainer>
  );
};

export default AdminPage;