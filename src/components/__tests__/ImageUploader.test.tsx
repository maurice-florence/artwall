import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import ImageUploader from '../ImageUploader';

// This is an integration test skeleton for the ImageUploader component.
// It assumes you have Firebase emulators or a test bucket set up for safe testing.
describe('ImageUploader', () => {
  it('uploads an image and checks for resized versions', async () => {
    render(<ImageUploader />);

    // Simulate file selection
    const file = new File([new Uint8Array([137,80,78,71])], 'test-image.png', { type: 'image/png' });
    const input = screen.getByLabelText(/upload/i) || screen.getByRole('textbox', { hidden: true });
    fireEvent.change(input, { target: { files: [file] } });

    // Simulate upload button click
    const button = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(button);

    // Wait for upload and resizing
    await waitFor(() => screen.getByText(/waiting for resized versions/i), { timeout: 10000 });
  });
});