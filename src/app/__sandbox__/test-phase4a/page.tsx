// relocated from src/app/test-phase4a/page.tsx into sandbox
"use client";

import React, { useState } from 'react';
import AdminModal from '@/components/AdminModal';
import styled from 'styled-components';

const TestPageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  padding: 2rem;
`;

const TestHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const TestTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.primary};
`;

const TestDescription = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.textSecondary};
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
`;

const TestActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
`;

const TestButton = styled.button`
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.8;
    transform: translateY(-2px);
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.border};
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.primary};
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  padding: 0.25rem 0;
  color: ${({ theme }) => theme.text};
  
  &:before {
    content: "✨";
    margin-right: 0.5rem;
  }
`;

const TestPhase4APage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testMode, setTestMode] = useState<'new' | 'edit'>('new');

  const openModal = (mode: 'new' | 'edit') => {
    setTestMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const mockArtwork = {
    id: 'test-artwork',
    title: 'Test Compositie',
    medium: 'audio' as const,
    year: 2025,
    month: 7,
    day: 16,
    description: 'Een test compositie voor smart form logic',
    content: 'Dit is de inhoud van een test compositie',
    isHidden: false,
    language1: 'nl',
    language2: 'en',
    language3: '',
    translations: {},
    version: '01',
    location1: 'Amsterdam',
    location2: 'Nederland',
    tags: ['test', 'compositie'],
    url1: 'https://example.com',
    url2: '',
    url3: '',
    coverImageUrl: '',
    audioUrl: '',
    pdfUrl: '',
    mediaUrl: '',
    mediaUrls: [],
    lyrics: 'Test lyrics voor deze compositie',
    chords: 'C - Am - F - G',
    soundcloudEmbedUrl: '',
    soundcloudTrackUrl: '',
    mediaType: 'audio' as const,
    recordCreationDate: new Date(),
    recordLastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  } as any; // bypass strict types for sandbox

  return (
    <TestPageContainer>
      <TestHeader>
        <TestTitle>Phase 4A: Smart Form Logic Test</TestTitle>
        <TestDescription>
          Test the new smart form logic with conditional field display, intelligent defaults, 
          field dependencies, and context-aware validation. The form now adapts dynamically 
          based on category selection and field values.
        </TestDescription>
      </TestHeader>

      <TestActions>
        <TestButton onClick={() => openModal('new')}>
          🆕 Test New Artwork (Smart Logic)
        </TestButton>
        <TestButton onClick={() => openModal('edit')}>
          ✏️ Test Edit Artwork (Smart Logic)
        </TestButton>
      </TestActions>

      <FeatureGrid>
        <FeatureCard>
          <FeatureTitle>🧠 Smart Form Logic</FeatureTitle>
          <FeatureDescription>
            The form now includes intelligent behavior that adapts to user input:
          </FeatureDescription>
          <FeatureList>
            <FeatureItem>Conditional field display based on category</FeatureItem>
            <FeatureItem>Progressive field disclosure (language2 → language3)</FeatureItem>
            <FeatureItem>Smart form indicator with progress tracking</FeatureItem>
            <FeatureItem>Context-aware help text and suggestions</FeatureItem>
          </FeatureList>
        </FeatureCard>

        <FeatureCard>
          <FeatureTitle>🔗 Field Dependencies</FeatureTitle>
          <FeatureDescription>
            Fields now auto-populate based on other field values:
          </FeatureDescription>
          <FeatureList>
            <FeatureItem>Media type set automatically based on category</FeatureItem>
            <FeatureItem>Title suggestions generated from category + year</FeatureItem>
            <FeatureItem>Language detection from content</FeatureItem>
            <FeatureItem>Smart defaults for date fields</FeatureItem>
          </FeatureList>
        </FeatureCard>

        <FeatureCard>
          <FeatureTitle>✅ Smart Validation</FeatureTitle>
          <FeatureDescription>
            Enhanced validation with contextual feedback:
          </FeatureDescription>
          <FeatureList>
            <FeatureItem>Category-specific required fields</FeatureItem>
            <FeatureItem>Smart warnings for missing complementary fields</FeatureItem>
            <FeatureItem>Future date detection</FeatureItem>
            <FeatureItem>Real-time validation feedback</FeatureItem>
          </FeatureList>
        </FeatureCard>

        <FeatureCard>
          <FeatureTitle>🎨 Enhanced UX</FeatureTitle>
          <FeatureDescription>
            Improved user experience with smart interactions:
          </FeatureDescription>
          <FeatureList>
            <FeatureItem>Animated field transitions</FeatureItem>
            <FeatureItem>Progress indicator with field count</FeatureItem>
            <FeatureItem>Next suggested field hints</FeatureItem>
            <FeatureItem>Contextual help text</FeatureItem>
          </FeatureList>
        </FeatureCard>

        <FeatureCard>
          <FeatureTitle>🔄 Try These Tests</FeatureTitle>
          <FeatureDescription>
            Test the smart form logic with these scenarios:
          </FeatureDescription>
          <FeatureList>
            <FeatureItem>Change category to see different fields</FeatureItem>
            <FeatureItem>Fill language1 to reveal language2</FeatureItem>
            <FeatureItem>Try music category for lyrics/chords</FeatureItem>
            <FeatureItem>Watch auto-populated media type</FeatureItem>
          </FeatureList>
        </FeatureCard>

        <FeatureCard>
          <FeatureTitle>⚡ Performance</FeatureTitle>
          <FeatureDescription>
            Smart form logic is optimized for performance:
          </FeatureDescription>
          <FeatureList>
            <FeatureItem>Memoized field visibility calculations</FeatureItem>
            <FeatureItem>Efficient dependency tracking</FeatureItem>
            <FeatureItem>Minimal re-renders with smart state</FeatureItem>
            <FeatureItem>Optimized validation logic</FeatureItem>
          </FeatureList>
        </FeatureCard>
      </FeatureGrid>

      <AdminModal
        isOpen={isModalOpen}
        onClose={closeModal}
        artworkToEdit={testMode === 'edit' ? mockArtwork : undefined}
      />
    </TestPageContainer>
  );
};

export default TestPhase4APage;
