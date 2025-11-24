# Gradient Generation Guide

## Overview

This guide explains how to generate unique, theme-aware gradients for artwork cards using both Python (for metadata generation) and CSS/TypeScript (for runtime rendering).

## Concept

Each artwork card gets a unique gradient based on:

1. **Artwork ID** - ensures consistency (same card = same gradient)
2. **Medium type** - writing, audio, drawing, sculpture have different color ranges
3. **Active theme** - gradients adapt to the current color theme

## Implementation

### 1. Python: Metadata Preparation (Optional)

If you want to pre-calculate gradient colors during the sync process:

```python
import hashlib

def hash_string_to_number(text: str) -> int:
    """Convert string to a consistent numeric hash."""
    return int(hashlib.md5(text.encode()).hexdigest(), 16)

def number_to_hue(num: int) -> int:
    """Convert number to hue value (0-360)."""
    return num % 360

def hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hsl(r: int, g: int, b: int) -> tuple:
    """Convert RGB to HSL."""
    r, g, b = r / 255.0, g / 255.0, b / 255.0
    max_c = max(r, g, b)
    min_c = min(r, g, b)
    l = (max_c + min_c) / 2.0
    
    if max_c == min_c:
        h = s = 0.0
    else:
        diff = max_c - min_c
        s = diff / (2.0 - max_c - min_c) if l > 0.5 else diff / (max_c + min_c)
        
        if max_c == r:
            h = (g - b) / diff + (6 if g < b else 0)
        elif max_c == g:
            h = (b - r) / diff + 2
        else:
            h = (r - g) / diff + 4
        h /= 6.0
    
    return (int(h * 360), int(s * 100), int(l * 100))

def generate_gradient_for_medium(artwork_id: str, medium: str, theme_colors: dict) -> str:
    """
    Generate a unique gradient for an artwork.
    
    Args:
        artwork_id: Unique identifier for the artwork
        medium: Type of artwork (writing, audio, drawing, sculpture, other)
        theme_colors: Dict with 'primary', 'secondary', 'tertiary' hex colors
    
    Returns:
        CSS linear-gradient string
    """
    # Configuration
    HUE_VARIATIONS = {
        'writing': 15,
        'poetry': 15,
        'audio': 30,
        'music': 30,
        'drawing': 45,
        'sculpture': 45,
        'other': 45
    }
    
    SATURATION_BOOSTS = {
        'writing': 25,
        'poetry': 25,
        'audio': 20,
        'music': 20,
        'other': 15
    }
    
    # Get base hue from artwork ID
    hash_value = hash_string_to_number(artwork_id)
    base_hue = number_to_hue(hash_value)
    
    # Select theme color based on medium
    if medium in ['writing', 'poetry']:
        base_color = theme_colors['primary']
    elif medium in ['audio', 'music']:
        base_color = theme_colors['secondary']
    else:
        base_color = theme_colors.get('tertiary', theme_colors['primary'])
    
    # Convert to HSL
    r, g, b = hex_to_rgb(base_color)
    theme_h, theme_s, theme_l = rgb_to_hsl(r, g, b)
    
    # Apply variation
    hue_variation = HUE_VARIATIONS.get(medium, 45)
    saturation_boost = SATURATION_BOOSTS.get(medium, 15)
    
    # Generate three color stops
    hue1 = (theme_h + (base_hue % hue_variation)) % 360
    hue2 = (hue1 + 30) % 360
    hue3 = (hue2 + 30) % 360
    
    # Adjust saturation and lightness
    sat1 = min(100, theme_s + saturation_boost)
    sat2 = min(100, theme_s + saturation_boost + 5)
    sat3 = min(100, theme_s + saturation_boost)
    
    light1 = max(40, theme_l + 5)
    light2 = max(45, theme_l + 10)
    light3 = max(50, theme_l + 15)
    
    # Darken writing gradients for better text contrast
    if medium in ['writing', 'poetry']:
        light1 = max(35, min(55, light1 - 10))
        light2 = max(40, min(60, light2 - 10))
        light3 = max(45, min(65, light3 - 10))
    
    # Calculate angle
    angle = (hash_value % 45) + 135
    
    # Generate gradient string
    color1 = f"hsl({hue1}, {sat1}%, {light1}%)"
    color2 = f"hsl({hue2}, {sat2}%, {light2}%)"
    color3 = f"hsl({hue3}, {sat3}%, {light3}%)"
    
    return f"linear-gradient({angle}deg, {color1} 0%, {color2} 50%, {color3} 100%)"


# Example usage
if __name__ == "__main__":
    theme = {
        'primary': '#0b8783',    # Teal for writing
        'secondary': '#E85D4F',  # Coral-red for audio
        'tertiary': '#F4A742'    # Amber for drawing
    }
    
    # Generate gradients for different mediums
    artworks = [
        ('artwork-123', 'writing'),
        ('artwork-456', 'audio'),
        ('artwork-789', 'drawing'),
    ]
    
    for artwork_id, medium in artworks:
        gradient = generate_gradient_for_medium(artwork_id, medium, theme)
        print(f"{medium}: {gradient}")
```

### 2. TypeScript/CSS: Runtime Generation

The actual implementation uses TypeScript for real-time gradient generation. See `src/utils/gradient-generator.ts`.

Key features:

- **Caching**: Gradients are cached by theme + artwork ID to avoid recalculation
- **Theme awareness**: Automatically adapts to theme changes
- **Performance tracking**: Logs generation time in development mode

```typescript
import { generateUniqueGradient } from '@/utils/gradient-generator';

// In your component
const gradient = generateUniqueGradient(artwork.id, theme, artwork.medium);
```

### 3. CSS Application

Apply the gradient to your card background:

```typescript
import styled from 'styled-components';

const CardFront = styled.div<{ $gradient: string }>`
  background: ${props => props.$gradient};
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
`;

// Usage
<CardFront $gradient={uniqueGradient} />
```

## Configuration

Fine-tune gradient behavior in `src/config/gradient-settings.ts`:

```typescript
export const GRADIENT_SATURATION = {
  poetry: 25,      // Saturation boost for writing/poetry
  audio: 20,       // Saturation boost for audio/music
  other: 15,       // Saturation boost for other mediums
  baseBoost: 10    // Base saturation increase
};

export const HUE_VARIATION = {
  poetry: 15,      // Small variation for consistent branding
  audio: 30,       // Moderate variation
  other: 45        // Larger variation for visual interest
};

export const GRADIENT_ANGLE = {
  baseAngle: 135,        // Starting angle in degrees
  variationRange: 45     // Random variation range
};
```

## Testing

Test gradient generation with different inputs:

```typescript
// Test consistency - same ID should produce same gradient
const gradient1 = generateUniqueGradient('test-123', theme, 'writing');
const gradient2 = generateUniqueGradient('test-123', theme, 'writing');
console.assert(gradient1 === gradient2, 'Gradients should match');

// Test variation - different IDs should produce different gradients
const gradient3 = generateUniqueGradient('test-456', theme, 'writing');
console.assert(gradient1 !== gradient3, 'Gradients should differ');

// Test theme awareness - different themes should produce different gradients
const gradient4 = generateUniqueGradient('test-123', darkTheme, 'writing');
console.assert(gradient1 !== gradient4, 'Theme should affect gradient');
```

## Performance Optimization

1. **Enable caching**: Cache is automatically enabled and cleared on theme change
2. **Limit calculations**: Only generate gradients for visible cards
3. **Profile in development**: Check console for timing stats every 500 generations

```typescript
// Development output example:
// gradient-generator: 500 calls, avg 0.23 ms/call
// 🎨 Gradient cache cleared - new saturation settings: { poetry: 25, audio: 20, other: 15 }
```

## Color Psychology

Medium-specific color choices:

- **Writing/Poetry** (Teal/Primary): Calm, intellectual, creative
- **Audio/Music** (Coral-red/Secondary): Energetic, passionate, vibrant  
- **Drawing/Sculpture** (Amber/Tertiary): Warm, artistic, earthy
- **Other**: Blended approach using category colors

## Troubleshooting

**Gradients look too similar:**

- Increase `HUE_VARIATION` values in config
- Check that artwork IDs are truly unique

**Gradients clash with theme:**

- Reduce `GRADIENT_SATURATION` values
- Adjust `BASE_LIGHTNESS` multipliers

**Performance issues:**

- Verify cache is working (check clear events in console)
- Consider virtualizing long lists of cards

**Text unreadable on gradients:**

- Adjust `WRITING_ADJUSTMENTS.lightnessDarken` to darken backgrounds
- Increase `BASE_LIGHTNESS.otherMax` cap for lighter gradients

## Examples

### Writing Card Gradient

```css
linear-gradient(157deg, 
  hsl(178, 85%, 45%) 0%, 
  hsl(208, 90%, 55%) 50%, 
  hsl(238, 85%, 65%) 100%)
```

### Audio Card Gradient

```css
linear-gradient(142deg, 
  hsl(12, 80%, 50%) 0%, 
  hsl(42, 85%, 60%) 50%, 
  hsl(72, 80%, 70%) 100%)
```

### Drawing Card Gradient

```css
linear-gradient(168deg, 
  hsl(38, 85%, 55%) 0%, 
  hsl(68, 90%, 65%) 50%, 
  hsl(98, 85%, 75%) 100%)
```
