import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getResizedImageUrl } from '@/utils/image-urls';

const TestContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ImageTestCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: white;
`;

const TestImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const InfoText = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const LoadTime = styled.div<{ $fast?: boolean }>`
  font-weight: bold;
  color: ${props => props.$fast ? '#4CAF50' : '#FF9800'};
`;

interface ImageTest {
  url: string;
  size: string;
  loadTime?: number;
  error?: boolean;
}

const ImagePerformanceTestPage: React.FC = () => {
  const [testImages, setTestImages] = useState<ImageTest[]>([]);
  const [loading, setLoading] = useState(true);

  // Sample test URLs - replace these with actual image URLs from your Firebase Storage
  const sampleOriginalUrl = 'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2Ftest-image.jpg?alt=media';

  useEffect(() => {
    const tests: ImageTest[] = [
      { url: sampleOriginalUrl, size: 'original' },
      { url: getResizedImageUrl(sampleOriginalUrl, 'thumbnail'), size: 'thumbnail (200x200)' },
      { url: getResizedImageUrl(sampleOriginalUrl, 'card'), size: 'card (400x400)' },
      { url: getResizedImageUrl(sampleOriginalUrl, 'full'), size: 'full (1200x1200)' },
    ];
    setTestImages(tests);
    setLoading(false);
  }, []);

  const handleImageLoad = (index: number, startTime: number) => {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    setTestImages(prev => prev.map((img, i) => 
      i === index ? { ...img, loadTime } : img
    ));
  };

  const handleImageError = (index: number) => {
    setTestImages(prev => prev.map((img, i) => 
      i === index ? { ...img, error: true } : img
    ));
  };

  if (loading) return <div>Loading test...</div>;

  return (
    <TestContainer>
      <h1>Image Performance Test</h1>
      <p>This page tests whether the Firebase Storage image resizing extension is working properly.</p>
      <p>If resized images exist, they should load faster than the original. If they don't exist, you'll see 404 errors.</p>
      
      <ImageGrid>
        {testImages.map((test, index) => {
          const startTime = performance.now();
          
          return (
            <ImageTestCard key={index}>
              <InfoText>Size: {test.size}</InfoText>
              <InfoText>URL: {test.url.substring(0, 80)}...</InfoText>
              
              <TestImage
                src={test.url}
                alt={`Test image - ${test.size}`}
                onLoad={() => handleImageLoad(index, startTime)}
                onError={() => handleImageError(index)}
              />
              
              {test.loadTime && (
                <LoadTime $fast={test.loadTime < 500}>
                  Load time: {test.loadTime.toFixed(0)}ms
                </LoadTime>
              )}
              
              {test.error && (
                <LoadTime>❌ Failed to load - Image variant doesn't exist</LoadTime>
              )}
            </ImageTestCard>
          );
        })}
      </ImageGrid>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Analysis</h3>
        <p>✅ <strong>Extension Working</strong>: If thumbnail and card variants load successfully with reasonable load times</p>
        <p>❌ <strong>Extension Not Working</strong>: If only the original loads and resized variants show 404 errors</p>
        <p>⚠️ <strong>Performance Issue</strong>: If all variants load but card images still take too long ({'>'}1000ms)</p>
      </div>
    </TestContainer>
  );
};

export default ImagePerformanceTestPage;