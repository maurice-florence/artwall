import React from 'react';
import { FaBookOpen, FaPaintBrush, FaMusic, FaAlignLeft, FaEllipsisH, FaPenNib, FaCube } from 'react-icons/fa';
import { ArtworkMedium } from '@/types';

const iconMap: { [key: string]: React.JSX.Element } = {
  poetry: <FaPenNib />,
  prose: <FaBookOpen />,
  prosepoetry: <FaAlignLeft />,
  writing: <FaPenNib />,
  audio: <FaMusic />,
  song: <FaMusic />,
  drawing: <FaPaintBrush />,
  sculpture: <FaCube />,
  other: <FaEllipsisH />,
};

const getArtworkIcon = (medium: ArtworkMedium) => {
    return iconMap[medium] || iconMap['other'];
};

interface GeneratedImageProps {
    title: string;
    medium: ArtworkMedium;
    width?: string | number;
    height?: string | number;
}

const GeneratedImage: React.FC<GeneratedImageProps> = ({ title, medium, width = '100%', height = '100%' }) => {
    const icon = getArtworkIcon(medium);

    // A simple hash function to get a color from the title
    const stringToColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            let value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }

    const bgColor = stringToColor(title);

    // Function to wrap text
    const wrapText = (text: string, maxWidth: number, fontSize: number) => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + word + ' ';
            // This is a rough estimation of text width. For more accuracy, one would need to measure text with canvas.
            const testWidth = testLine.length * fontSize * 0.6;
            if (testWidth > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
        lines.push(currentLine);
        return lines;
    };

    const lines = wrapText(title, 180, 16);


    return (
        <svg width={width} height={height} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="120" rx="12" fill={bgColor} />
            <foreignObject x="10" y="10" width="180" height="100">
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    textAlign: 'center',
                    color: 'white',
                    fontFamily: 'sans-serif',
                    fontSize: '16px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    <div style={{ marginBottom: '8px' }}>
                        {React.cloneElement(icon, { size: 24 })}
                    </div>
                    <div>
                        {lines.map((line, index) => (
                            <div key={index}>{line.trim()}</div>
                        ))}
                    </div>
                </div>
            </foreignObject>
        </svg>
    );
};

export default GeneratedImage;
