import React, { useState } from 'react';

// Minimal ImageUploader component for integration test
const ImageUploader: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'waiting' | 'done'>('idle');
  const [resized, setResized] = useState(false);

  const handleUpload = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setStatus('uploading');
    // Simulate upload delay
    setTimeout(() => {
      setStatus('waiting');
      // Simulate resize delay
      setTimeout(() => {
        setResized(true);
        setStatus('done');
      }, 1000);
    }, 1000);
  };

  return (
    <form onSubmit={handleUpload}>
      <label htmlFor="file-input">Upload</label>
      <input id="file-input" type="file" aria-label="upload" />
      <button type="submit">Upload</button>
      {status === 'waiting' && <div>Waiting for resized versions...</div>}
      {resized && (
        <div>
          <div>Resized images:</div>
          <div>200x200</div>
          <div>640x640</div>
          <div>1280x1280</div>
        </div>
      )}
    </form>
  );
};

export default ImageUploader;
