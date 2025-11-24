# Card Sizing and Responsive Layout Guide

## Overview

This guide documents how artwork cards are sized, scaled, and laid out responsively using a masonry grid with fixed aspect ratios. This implementation ensures consistent card dimensions across all devices while allowing dynamic column counts based on viewport width.

## Core Concept: Fixed Aspect Ratio Cards

### Aspect Ratio: 3:4

All artwork cards use a **3:4 aspect ratio** (width:height), which creates portrait-oriented cards that work well for displaying artwork with metadata.

```css
.card-container {
  aspect-ratio: 3 / 4;
  width: 100%;
  max-width: 150px; /* Desktop only */
}
```

### Why 3:4?

- **Portrait orientation**: Natural fit for artwork display
- **Consistent sizing**: All cards have the same proportions
- **Predictable layout**: Easy to calculate grid layouts
- **Mobile-friendly**: Works well in narrow columns

## Desktop Implementation

### Card Sizing

On desktop viewports (≥1200px), cards have a **maximum width of 150px**:

```css
@media (min-width: 1200px) {
  .card-container {
    max-width: 150px;
    aspect-ratio: 3 / 4;
  }
}
```

With aspect ratio 3:4:

- Width: 150px
- Height: 200px (calculated automatically)

### Grid Layout

Uses **8-column masonry grid** at desktop widths with **8px gutters**:

```text
Column count: 8
Gutter: 8px
Card width: 150px max
Card height: 200px (auto from aspect ratio)
```

## Mobile Implementation

### Key Difference: No Max-Width

On mobile, the `max-width: 150px` constraint is **removed**, allowing cards to scale fluidly:

```css
@media (max-width: 1199px) {
  .card-container {
    max-width: none; /* Cards fill column width */
    aspect-ratio: 3 / 4;
  }
}
```

### Responsive Breakpoints

The grid adapts to viewport width with different column counts:

| Viewport Width | Columns | Card Behavior |
|----------------|---------|---------------|
| 0-349px | 2 | Cards scale to fit, maintain 3:4 ratio |
| 350-749px | 3 | Cards scale to fit, maintain 3:4 ratio |
| 750-899px | 4 | Cards scale to fit, maintain 3:4 ratio |
| 900-1199px | 6 | Cards scale to fit, maintain 3:4 ratio |
| 1200px+ | 8 | Cards capped at 150px width |

### Mobile Calculation Example

#### Example: 350px viewport with 3 columns

```text
Viewport width: 350px
Gutter count: 2 (between 3 columns)
Gutter width: 8px × 2 = 16px
Padding: 24px × 2 = 48px (left + right)

Available width: 350px - 16px - 48px = 286px
Card width: 286px ÷ 3 = ~95px
Card height: 95px × (4/3) = ~127px
```

## Implementation Details

### 1. Masonry Grid Configuration

```javascript
// React implementation with react-responsive-masonry
const breakpoints = {
  350: 3,   // 3 columns at 350px+
  750: 4,   // 4 columns at 750px+
  900: 6,   // 6 columns at 900px+
  1200: 8   // 8 columns at 1200px+
};

<Masonry 
  columnsCount={breakpoints} 
  gutter="8px"
>
  {/* Cards */}
</Masonry>
```

**Flask/Jinja2 equivalent:**

```python
# In your Flask route
def get_column_count(viewport_width):
    if viewport_width >= 1200:
        return 8
    elif viewport_width >= 900:
        return 6
    elif viewport_width >= 750:
        return 4
    elif viewport_width >= 350:
        return 3
    else:
        return 2
```

### 2. Card Container CSS

```css
.card-container {
  /* Core sizing */
  aspect-ratio: 3 / 4;
  width: 100%;
  
  /* 3D flip effect */
  perspective: 1000px;
  position: relative;
  
  /* Desktop constraint */
  max-width: 150px;
}

/* Remove constraint on mobile */
@media (max-width: 1199px) {
  .card-container {
    max-width: none;
  }
}
```

### 3. Card Inner Structure

```css
.card-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  
  /* 3D flip animation */
  transform-style: preserve-3d;
  transition: transform 0.6s;
  transform-origin: center;
}

.card-container:hover .card-inner {
  transform: rotateY(180deg);
}
```

### 4. Card Face (Front/Back)

```css
.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
}

.card-front {
  /* Gradient background only */
  background: var(--unique-gradient);
}

.card-back {
  /* Content side */
  transform: rotateY(180deg);
  background: var(--category-color);
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
```

## Year Marker Cards

Year markers match artwork card dimensions exactly:

```css
.year-marker {
  aspect-ratio: 3 / 4;
  max-width: 150px; /* Desktop */
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1199px) {
  .year-marker {
    max-width: none; /* Mobile */
  }
}
```

## Spacing and Padding

### Grid Gutter

Consistent **8px gutter** between all cards:

```css
.masonry-grid {
  column-gap: 8px;
  row-gap: 8px;
}
```

### Container Padding

Equal horizontal padding on main content container:

```css
.main-content {
  padding: 0 24px; /* Left and right equal */
}
```

## Flask Implementation Guide

### 1. Template Structure (Jinja2)

```html
<div class="main-content">
  <div class="masonry-grid" data-columns="{{ column_count }}">
    {% for item in items %}
      {% if item.type == 'year' %}
        <div class="year-marker">
          <h2>{{ item.year }}</h2>
        </div>
      {% else %}
        <div class="card-container">
          <div class="card-inner">
            <div class="card-front" style="background: {{ item.gradient }};">
            </div>
            <div class="card-back" style="background: {{ item.category_color }};">
              <h3>{{ item.title }}</h3>
              <p>{{ item.date }}</p>
              <p>{{ item.location }}</p>
            </div>
          </div>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</div>
```

### 2. CSS File (styles.css)

```css
/* Main content container */
.main-content {
  padding: 0 24px;
  max-width: 100%;
}

/* Masonry grid */
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
  gap: 8px;
}

/* Responsive grid columns */
@media (min-width: 350px) {
  .masonry-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 750px) {
  .masonry-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 900px) {
  .masonry-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (min-width: 1200px) {
  .masonry-grid {
    grid-template-columns: repeat(8, 1fr);
  }
}

/* Card container */
.card-container {
  aspect-ratio: 3 / 4;
  width: 100%;
  perspective: 1000px;
  position: relative;
}

@media (min-width: 1200px) {
  .card-container {
    max-width: 150px;
  }
}

/* Card flip mechanics */
.card-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  transform-origin: center;
}

.card-container:hover .card-inner {
  transform: rotateY(180deg);
}

/* Card faces */
.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
}

.card-back {
  transform: rotateY(180deg);
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
}

/* Year markers */
.year-marker {
  aspect-ratio: 3 / 4;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 1200px) {
  .year-marker {
    max-width: 150px;
  }
}
```

### 3. Python Flask Route

```python
from flask import render_template

@app.route('/')
def index():
    artworks = get_artworks()  # Your data fetching logic
    
    # Add year markers
    items = []
    current_year = None
    
    for artwork in sorted(artworks, key=lambda x: x['date'], reverse=True):
        year = artwork['date'].year
        
        if year != current_year:
            items.append({'type': 'year', 'year': year})
            current_year = year
        
        items.append({
            'type': 'artwork',
            'title': artwork['title'],
            'date': artwork['date'].strftime('%Y-%m-%d'),
            'location': artwork.get('location', ''),
            'gradient': generate_gradient(artwork),
            'category_color': get_category_color(artwork['medium'])
        })
    
    return render_template('index.html', items=items)
```

## Key Principles Summary

1. **Fixed Aspect Ratio**: Always 3:4 for consistency
2. **Fluid Width**: Cards scale to fit columns (except desktop max-width)
3. **Responsive Columns**: 2-8 columns based on viewport
4. **Equal Spacing**: 8px gutter throughout
5. **Equal Padding**: 24px horizontal padding on container
6. **Mobile First**: Remove desktop constraints on mobile

## Testing Checklist

- [ ] Cards maintain 3:4 aspect ratio at all viewport widths
- [ ] Mobile (350px): 3 cards per row
- [ ] Tablet (750px): 4 cards per row
- [ ] Desktop (1200px): 8 cards per row with 150px max-width
- [ ] Gutter spacing is consistent (8px)
- [ ] Year markers match card dimensions
- [ ] Flip animation works at all sizes
- [ ] No horizontal scroll at any viewport width
- [ ] Equal padding left and right

## Common Pitfalls

1. **Forgetting to remove max-width on mobile**: Cards will be too small
2. **Using fixed heights**: Breaks aspect ratio scaling
3. **Inconsistent gutters**: Use same value for column-gap and row-gap
4. **Wrong aspect ratio calculation**: Height = Width × (4/3), not Width × (3/4)
5. **Not accounting for padding**: Reduces available width for cards

## Performance Notes

- **CSS aspect-ratio** is widely supported (97%+ browsers)
- **Fallback for old browsers**: Use `padding-bottom: 133.33%` hack
- **Masonry library alternatives**: CSS Grid, Flexbox, or vanilla JS
- **Image loading**: Use lazy loading for card backgrounds/gradients
