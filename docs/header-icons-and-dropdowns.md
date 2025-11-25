# Header Icons and Dropdown Menus Implementation Guide

## Overview

This document explains how to implement the Artwall header with its icon-based navigation, dropdown menus, and theme selector with gradient swatches. This guide is tailored for a Flask implementation but the concepts apply universally.

## Architecture Overview

The header consists of:

1. **Medium filter icons** (Globe, Pen, Paintbrush, Music, Cube, Ellipsis)
2. **Evaluation/Rating dropdown filters** (Certificate and Star icons)
3. **Theme selector with gradient swatches** (Palette icon)
4. **Info button** (Info circle icon)
5. **Search bar** with icon

## Icon System

### Icon Library Choice

**React version uses:** `react-icons/fa` (Font Awesome)

**Flask equivalent options:**

1. **Font Awesome CDN** (Recommended)
2. **Bootstrap Icons**
3. **Material Icons**
4. **Inline SVG**

### Font Awesome Implementation (Flask)

#### 1. Add Font Awesome to HTML Template

```html
<!-- In your base template head -->
<link rel="stylesheet" 
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" 
      crossorigin="anonymous" 
      referrerpolicy="no-referrer" />
```

#### 2. Icon Mapping

| Medium | Icon Class | HTML |
|--------|-----------|------|
| All | Globe | `<i class="fa-solid fa-globe"></i>` |
| Writing | Pen Nib | `<i class="fa-solid fa-pen-nib"></i>` |
| Drawing | Paintbrush | `<i class="fa-solid fa-paintbrush"></i>` |
| Audio | Music | `<i class="fa-solid fa-music"></i>` |
| Sculpture | Cube | `<i class="fa-solid fa-cube"></i>` |
| Other | Ellipsis | `<i class="fa-solid fa-ellipsis-h"></i>` |
| Evaluation | Certificate | `<i class="fa-solid fa-certificate"></i>` |
| Rating | Star | `<i class="fa-solid fa-star"></i>` |
| Theme | Palette | `<i class="fa-solid fa-palette"></i>` |
| Search | Magnifying Glass | `<i class="fa-solid fa-magnifying-glass"></i>` |
| Info | Info Circle | `<i class="fa-solid fa-circle-info"></i>` |

## Icon Button Styling

### CSS for Icon Buttons

```css
/* Base icon button style */
.icon-btn {
  background: none;
  border: none;
  color: #E85D4F; /* secondary color */
  font-size: 1.2rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  height: calc(1rem + 0.8rem);
  opacity: 0.7;
  transition: color 0.2s, opacity 0.2s, transform 0.2s;
}

.icon-btn:hover {
  color: #0b8783; /* primary color */
  opacity: 1;
}

/* Active state */
.icon-btn.active {
  color: #0b8783; /* primary color */
  opacity: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06));
}

/* Icon container wrapper */
.icons-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .icons-wrapper {
    flex-wrap: wrap;
    width: 100%;
  }
}
```

### HTML Structure

```html
<div class="icons-wrapper">
  <!-- All mediums button -->
  <button class="icon-btn active" 
          title="All mediums" 
          onclick="filterMedium('all')">
    <i class="fa-solid fa-globe"></i>
  </button>
  
  <!-- Writing button -->
  <button class="icon-btn" 
          title="Writing" 
          onclick="filterMedium('writing')">
    <i class="fa-solid fa-pen-nib"></i>
  </button>
  
  <!-- Drawing button -->
  <button class="icon-btn" 
          title="Drawing" 
          onclick="filterMedium('drawing')">
    <i class="fa-solid fa-paintbrush"></i>
  </button>
  
  <!-- Audio button -->
  <button class="icon-btn" 
          title="Audio" 
          onclick="filterMedium('audio')">
    <i class="fa-solid fa-music"></i>
  </button>
  
  <!-- Sculpture button -->
  <button class="icon-btn" 
          title="Sculpture" 
          onclick="filterMedium('sculpture')">
    <i class="fa-solid fa-cube"></i>
  </button>
  
  <!-- Other button -->
  <button class="icon-btn" 
          title="Other" 
          onclick="filterMedium('other')">
    <i class="fa-solid fa-ellipsis-h"></i>
  </button>
</div>
```

## Dropdown Menu System

### Core Dropdown Mechanism

Dropdowns use a three-state system:

1. **Hidden** - Not in DOM
2. **Opening** - Fade-in animation
3. **Closing** - Fade-out animation, then removed from DOM

### Dropdown CSS

```css
/* Dropdown wrapper for positioning */
.dropdown-wrapper {
  position: relative;
}

/* Dropdown container */
.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0.4rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  z-index: 200;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  min-width: 150px;
  
  /* Initial state for animation */
  opacity: 0;
  transform: translateY(-6px) scale(0.99);
  animation: fadeInUp 160ms ease forwards;
}

/* Closing animation */
.dropdown.closing {
  animation: fadeOutDown 140ms ease forwards;
}

/* Animation keyframes */
@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeOutDown {
  to {
    opacity: 0;
    transform: translateY(-6px) scale(0.99);
  }
}

/* Mobile responsive positioning */
@media (max-width: 768px) {
  .dropdown {
    /* Center dropdown on mobile to prevent off-screen issues */
    right: auto;
    left: 50%;
    transform: translateX(-50%) translateY(-6px) scale(0.99);
    max-width: calc(100vw - 2rem); /* Prevent overflow */
  }
  
  /* Adjust animations for centered positioning */
  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }
  
  @keyframes fadeOutDown {
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-6px) scale(0.99);
    }
  }
}

/* Dropdown button style */
.dropdown-btn {
  background: none;
  border: none;
  color: #3D405B; /* text color */
  padding: 0.35rem 0.5rem;
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: color 0.2s, background 0.2s;
  width: 100%;
  text-align: left;
}

.dropdown-btn:hover {
  color: #0b8783; /* primary color */
  background: rgba(0, 0, 0, 0.02);
}

.dropdown-btn.active {
  color: #0b8783; /* primary color */
  opacity: 1;
}

/* Icon group inside dropdown button */
.icon-group {
  display: inline-flex;
  gap: 4px;
}

/* Count badge */
.count-badge {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}
```

### Evaluation Dropdown HTML (Flask/Jinja2)

```html
<div class="dropdown-wrapper" id="eval-dropdown-wrapper">
  <!-- Trigger button -->
  <button class="icon-btn {{ 'active' if selected_evaluation != 'all' else '' }}" 
          title="Filter by evaluation"
          onclick="toggleDropdown('eval-dropdown')">
    <i class="fa-solid fa-certificate"></i>
  </button>
  
  <!-- Dropdown menu (hidden by default) -->
  <div id="eval-dropdown" class="dropdown" style="display: none;">
    {% for n in [5, 4, 3, 2, 1] %}
    <button class="dropdown-btn {{ 'active' if selected_evaluation == n else '' }}"
            onclick="filterEvaluation({{ n }})">
      <span class="icon-group">
        {% for i in range(n) %}
        <i class="fa-solid fa-certificate"></i>
        {% endfor %}
      </span>
      <span class="count-badge">{{ eval_counts.get(n, 0) }}</span>
    </button>
    {% endfor %}
    
    <button class="dropdown-btn {{ 'active' if selected_evaluation == 'all' else '' }}"
            onclick="filterEvaluation('all')">
      All
    </button>
  </div>
</div>
```

### Dropdown JavaScript

```javascript
// Global state for tracking open dropdowns
let openDropdown = null;

function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  
  // Close any other open dropdown
  if (openDropdown && openDropdown !== dropdown) {
    closeDropdown(openDropdown);
  }
  
  if (dropdown.style.display === 'none') {
    // Open dropdown
    dropdown.style.display = 'flex';
    dropdown.classList.remove('closing');
    openDropdown = dropdown;
  } else {
    // Close dropdown
    closeDropdown(dropdown);
  }
}

function closeDropdown(dropdown) {
  if (!dropdown || dropdown.style.display === 'none') return;
  
  dropdown.classList.add('closing');
  
  // Wait for animation to complete
  setTimeout(() => {
    dropdown.style.display = 'none';
    dropdown.classList.remove('closing');
    if (openDropdown === dropdown) {
      openDropdown = null;
    }
  }, 140); // Match animation duration
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  if (!openDropdown) return;
  
  const wrapper = openDropdown.closest('.dropdown-wrapper');
  if (wrapper && !wrapper.contains(event.target)) {
    closeDropdown(openDropdown);
  }
});

// Close dropdown when pressing Escape
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && openDropdown) {
    closeDropdown(openDropdown);
  }
});
```

## Theme Selector with Gradient Swatches

### The Challenge

Create circular or square buttons that display a gradient preview of the theme colors (primary → secondary → tertiary).

### Theme Palette Data Structure

```python
# In your Flask app (e.g., config.py or models.py)
THEME_PALETTES = [
    {
        'name': 'Teal',
        'primary': '#0b8783',
        'secondary': '#E85D4F',
        'tertiary': '#F4A742',
        'inactive': '#94A3A8',
        'body': '#ffffff'
    },
    {
        'name': 'Blue',
        'primary': '#2563EB',
        'secondary': '#DC2626',
        'tertiary': '#F59E0B',
        'inactive': '#9CA3AF',
        'body': '#ffffff'
    },
    {
        'name': 'Purple',
        'primary': '#7C3AED',
        'secondary': '#059669',
        'tertiary': '#EA580C',
        'inactive': '#A78BFA',
        'body': '#ffffff'
    },
    {
        'name': 'Indigo',
        'primary': '#4F46E5',
        'secondary': '#EAB308',
        'tertiary': '#EC4899',
        'inactive': '#818CF8',
        'body': '#ffffff'
    },
    {
        'name': 'Green',
        'primary': '#059669',
        'secondary': '#7C3AED',
        'tertiary': '#DC2626',
        'inactive': '#6EE7B7',
        'body': '#ffffff'
    },
    {
        'name': 'Rose',
        'primary': '#E11D48',
        'secondary': '#3B82F6',
        'tertiary': '#10B981',
        'inactive': '#FDA4AF',
        'body': '#ffffff'
    },
    {
        'name': 'Amber',
        'primary': '#D97706',
        'secondary': '#8B5CF6',
        'tertiary': '#06B6D4',
        'inactive': '#FCD34D',
        'body': '#ffffff'
    },
    {
        'name': 'Cyan',
        'primary': '#0891B2',
        'secondary': '#F97316',
        'tertiary': '#A855F7',
        'inactive': '#67E8F9',
        'body': '#ffffff'
    }
]
```

### Gradient Swatch CSS

```css
/* Palette swatch button */
.palette-swatch {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0;
  cursor: pointer;
  background-size: cover;
  display: inline-block;
  transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
}

.palette-swatch:hover {
  transform: scale(1.06);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.palette-swatch:active {
  transform: scale(0.98);
}

/* Active swatch (current theme) */
.palette-swatch.active {
  border: 2px solid #0b8783; /* primary color */
}

/* Grid layout for swatches */
.palette-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(34px, 1fr));
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}
```

### Theme Dropdown HTML (Flask/Jinja2)

```html
<div class="dropdown-wrapper" id="theme-dropdown-wrapper">
  <!-- Theme trigger button -->
  <button class="icon-btn {{ 'active' if theme_dropdown_open else '' }}" 
          title="Choose theme colors"
          onclick="toggleDropdown('theme-dropdown')">
    <i class="fa-solid fa-palette"></i>
  </button>
  
  <!-- Theme dropdown -->
  <div id="theme-dropdown" class="dropdown" style="display: none; min-width: 200px;">
    <!-- Header with advanced toggle -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding: 0 0.2rem;">
      <span style="font-size: 0.8rem; font-weight: 500; color: #E85D4F;">Theme Colors</span>
      <button class="icon-btn" 
              style="font-size: 0.9rem;" 
              onclick="toggleAdvancedTheme()"
              title="Advanced options">
        <i class="fa-solid fa-cog"></i>
      </button>
    </div>
    
    <!-- Gradient swatches grid -->
    <div class="palette-grid">
      {% for palette in theme_palettes %}
      <button class="palette-swatch {{ 'active' if current_theme == palette.name else '' }}"
              title="{{ palette.name }}"
              onclick="applyTheme('{{ palette.name }}')"
              style="background: linear-gradient(135deg, {{ palette.primary }} 0%, {{ palette.secondary }} 50%, {{ palette.tertiary }} 100%);">
      </button>
      {% endfor %}
    </div>
    
    <!-- Advanced color pickers (initially hidden) -->
    <div id="advanced-theme-controls" style="display: none; border-top: 1px solid rgba(0, 0, 0, 0.08); margin-top: 0.75rem; padding-top: 0.75rem;">
      <!-- Primary color -->
      <div style="display: flex; gap: 0.4rem; align-items: center; margin-bottom: 0.5rem;">
        <label for="primary-color" class="color-circle" 
               style="background-color: {{ current_primary }};">
          <input type="color" 
                 id="primary-color" 
                 value="{{ current_primary }}"
                 onchange="updateThemeColor('primary', this.value)"
                 style="display: none;">
        </label>
        <span style="font-size: 0.9rem; color: rgba(0, 0, 0, 0.7);">Primary</span>
      </div>
      
      <!-- Secondary color -->
      <div style="display: flex; gap: 0.4rem; align-items: center; margin-bottom: 0.5rem;">
        <label for="secondary-color" class="color-circle" 
               style="background-color: {{ current_secondary }};">
          <input type="color" 
                 id="secondary-color" 
                 value="{{ current_secondary }}"
                 onchange="updateThemeColor('secondary', this.value)"
                 style="display: none;">
        </label>
        <span style="font-size: 0.9rem; color: rgba(0, 0, 0, 0.7);">Secondary</span>
      </div>
      
      <!-- Tertiary color -->
      <div style="display: flex; gap: 0.4rem; align-items: center; margin-bottom: 0.5rem;">
        <label for="tertiary-color" class="color-circle" 
               style="background-color: {{ current_tertiary }};">
          <input type="color" 
                 id="tertiary-color" 
                 value="{{ current_tertiary }}"
                 onchange="updateThemeColor('tertiary', this.value)"
                 style="display: none;">
        </label>
        <span style="font-size: 0.9rem; color: rgba(0, 0, 0, 0.7);">Tertiary</span>
      </div>
      
      <!-- Inactive color -->
      <div style="display: flex; gap: 0.4rem; align-items: center; margin-bottom: 0.5rem;">
        <label for="inactive-color" class="color-circle" 
               style="background-color: {{ current_inactive }};">
          <input type="color" 
                 id="inactive-color" 
                 value="{{ current_inactive }}"
                 onchange="updateThemeColor('inactive', this.value)"
                 style="display: none;">
        </label>
        <span style="font-size: 0.9rem; color: rgba(0, 0, 0, 0.7);">Inactive</span>
      </div>
      
      <!-- Background color -->
      <div style="display: flex; gap: 0.4rem; align-items: center;">
        <label for="background-color" class="color-circle" 
               style="background-color: {{ current_body }};">
          <input type="color" 
                 id="background-color" 
                 value="{{ current_body }}"
                 onchange="updateThemeColor('body', this.value)"
                 style="display: none;">
        </label>
        <span style="font-size: 0.9rem; color: rgba(0, 0, 0, 0.7);">Background</span>
      </div>
    </div>
  </div>
</div>
```

### Color Circle Label CSS

```css
/* Color picker circle that displays current color */
.color-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.color-circle:hover {
  transform: scale(1.05);
}
```

### Theme JavaScript Functions

```javascript
// Toggle advanced theme controls
function toggleAdvancedTheme() {
  const advancedDiv = document.getElementById('advanced-theme-controls');
  if (advancedDiv.style.display === 'none') {
    advancedDiv.style.display = 'flex';
    advancedDiv.style.flexDirection = 'column';
    advancedDiv.style.gap = '0.5rem';
  } else {
    advancedDiv.style.display = 'none';
  }
}

// Apply predefined theme palette
function applyTheme(themeName) {
  fetch('/api/theme/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ theme: themeName })
  })
  .then(response => response.json())
  .then(data => {
    // Update CSS variables
    document.documentElement.style.setProperty('--primary', data.primary);
    document.documentElement.style.setProperty('--secondary', data.secondary);
    document.documentElement.style.setProperty('--tertiary', data.tertiary);
    document.documentElement.style.setProperty('--inactive', data.inactive);
    document.documentElement.style.setProperty('--body', data.body);
    
    // Close dropdown
    closeDropdown(document.getElementById('theme-dropdown'));
    
    // Optional: Reload page to apply theme fully
    // window.location.reload();
  });
}

// Update individual theme color
function updateThemeColor(colorName, colorValue) {
  fetch('/api/theme/color', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      color: colorName, 
      value: colorValue 
    })
  })
  .then(response => response.json())
  .then(data => {
    // Update CSS variable
    document.documentElement.style.setProperty(`--${colorName}`, colorValue);
    
    // Update the color circle background
    document.querySelector(`label[for="${colorName}-color"]`).style.backgroundColor = colorValue;
  });
}
```

## Flask Backend Implementation

### Route Handlers

```python
from flask import Flask, render_template, request, jsonify, session
import json

app = Flask(__name__)
app.secret_key = 'your-secret-key'

# Theme palettes (from earlier)
from .config import THEME_PALETTES

@app.route('/')
def index():
    # Get current theme from session or use default
    current_theme = session.get('theme', 'Teal')
    theme_data = next((p for p in THEME_PALETTES if p['name'] == current_theme), THEME_PALETTES[0])
    
    return render_template('index.html',
                         theme_palettes=THEME_PALETTES,
                         current_theme=current_theme,
                         current_primary=theme_data['primary'],
                         current_secondary=theme_data['secondary'],
                         current_tertiary=theme_data['tertiary'],
                         current_inactive=theme_data['inactive'],
                         current_body=theme_data['body'])

@app.route('/api/theme/apply', methods=['POST'])
def apply_theme():
    data = request.json
    theme_name = data.get('theme')
    
    # Find theme palette
    theme_data = next((p for p in THEME_PALETTES if p['name'] == theme_name), None)
    
    if theme_data:
        # Store in session
        session['theme'] = theme_name
        session['theme_colors'] = theme_data
        
        return jsonify(theme_data)
    
    return jsonify({'error': 'Theme not found'}), 404

@app.route('/api/theme/color', methods=['POST'])
def update_theme_color():
    data = request.json
    color_name = data.get('color')
    color_value = data.get('value')
    
    # Get current theme colors from session
    theme_colors = session.get('theme_colors', THEME_PALETTES[0].copy())
    
    # Update the specific color
    theme_colors[color_name] = color_value
    
    # Store back in session
    session['theme_colors'] = theme_colors
    session['theme'] = 'Custom'
    
    return jsonify({'success': True, 'color': color_name, 'value': color_value})
```

### CSS Variables in Base Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Artwall</title>
  
  <!-- CSS variables for theme colors -->
  <style>
    :root {
      --primary: {{ current_primary }};
      --secondary: {{ current_secondary }};
      --tertiary: {{ current_tertiary }};
      --inactive: {{ current_inactive }};
      --body: {{ current_body }};
      --text: #3D405B;
      --border: #d1d5db;
    }
    
    body {
      background-color: var(--body);
      color: var(--text);
    }
    
    /* Use CSS variables throughout your styles */
    .icon-btn {
      color: var(--secondary);
    }
    
    .icon-btn:hover,
    .icon-btn.active {
      color: var(--primary);
    }
    
    /* ... etc */
  </style>
  
  <link rel="stylesheet" href="{{ url_for('static', filename='css/main.css') }}">
</head>
<body>
  {% block content %}{% endblock %}
</body>
</html>
```

## Search Bar with Icon

### HTML Structure

```html
<div class="search-wrapper">
  <i class="fa-solid fa-magnifying-glass search-icon"></i>
  <input type="text" 
         class="search-input" 
         placeholder="Search..." 
         oninput="handleSearch(this.value)">
</div>
```

### Search CSS

```css
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #E85D4F; /* secondary color */
  pointer-events: none;
  font-size: 0.9rem;
}

.search-input {
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border-radius: 20px;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  background-color: #ffffff;
  color: #3D405B;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 200px;
}

.search-input:focus {
  outline: none;
  border-color: #0b8783; /* primary color */
  box-shadow: 0 0 0 2px rgba(11, 135, 131, 0.3);
}

@media (max-width: 768px) {
  .search-wrapper {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
}
```

## Complete Header Structure

### Full HTML Template

```html
<header class="header">
  <!-- Title row -->
  <div class="title-row">
    <h1 class="title">Artwall</h1>
  </div>
  
  <!-- Controls row -->
  <div class="controls-row">
    <!-- Medium filter icons -->
    <div class="icons-wrapper">
      <button class="icon-btn active" title="All mediums" onclick="filterMedium('all')">
        <i class="fa-solid fa-globe"></i>
      </button>
      <button class="icon-btn" title="Writing" onclick="filterMedium('writing')">
        <i class="fa-solid fa-pen-nib"></i>
      </button>
      <button class="icon-btn" title="Drawing" onclick="filterMedium('drawing')">
        <i class="fa-solid fa-paintbrush"></i>
      </button>
      <button class="icon-btn" title="Audio" onclick="filterMedium('audio')">
        <i class="fa-solid fa-music"></i>
      </button>
      <button class="icon-btn" title="Sculpture" onclick="filterMedium('sculpture')">
        <i class="fa-solid fa-cube"></i>
      </button>
      <button class="icon-btn" title="Other" onclick="filterMedium('other')">
        <i class="fa-solid fa-ellipsis-h"></i>
      </button>
    </div>
    
    <!-- Search bar -->
    <div class="search-wrapper">
      <i class="fa-solid fa-magnifying-glass search-icon"></i>
      <input type="text" class="search-input" placeholder="Search..." oninput="handleSearch(this.value)">
    </div>
    
    <!-- Right section: filters & theme -->
    <div class="right-section">
      <!-- Evaluation dropdown -->
      <div class="dropdown-wrapper" id="eval-dropdown-wrapper">
        <button class="icon-btn" title="Filter by evaluation" onclick="toggleDropdown('eval-dropdown')">
          <i class="fa-solid fa-certificate"></i>
        </button>
        <div id="eval-dropdown" class="dropdown" style="display: none;">
          <!-- Dropdown content here -->
        </div>
      </div>
      
      <!-- Rating dropdown -->
      <div class="dropdown-wrapper" id="rating-dropdown-wrapper">
        <button class="icon-btn" title="Filter by rating" onclick="toggleDropdown('rating-dropdown')">
          <i class="fa-solid fa-star"></i>
        </button>
        <div id="rating-dropdown" class="dropdown" style="display: none;">
          <!-- Dropdown content here -->
        </div>
      </div>
      
      <!-- Theme selector -->
      <div class="dropdown-wrapper" id="theme-dropdown-wrapper">
        <button class="icon-btn" title="Choose theme" onclick="toggleDropdown('theme-dropdown')">
          <i class="fa-solid fa-palette"></i>
        </button>
        <div id="theme-dropdown" class="dropdown" style="display: none;">
          <!-- Theme dropdown content here -->
        </div>
      </div>
      
      <!-- Info button -->
      <button class="icon-btn" title="App info" onclick="showAppInfo()">
        <i class="fa-solid fa-circle-info"></i>
      </button>
    </div>
  </div>
</header>
```

### Complete Header CSS

```css
.header {
  background: var(--body);
  color: var(--text);
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--border);
}

.title-row {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 0.5rem;
}

.title {
  font-size: 2.4rem;
  font-weight: bold;
  color: var(--primary);
  margin: 0;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .header {
    padding: 0.5rem 0.75rem;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .controls-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .right-section {
    justify-content: flex-start;
    flex-wrap: wrap;
    width: 100%;
  }
}
```

## Key Concepts Summary

1. **Icon System**: Font Awesome provides consistent, scalable icons
2. **Active State**: Icons change color and opacity when active
3. **Dropdowns**: Use absolute positioning with smooth animations
4. **Click Outside**: Event listener closes dropdowns when clicking elsewhere
5. **Gradient Swatches**: CSS linear-gradient creates theme preview
6. **Color Pickers**: Hidden `<input type="color">` wrapped in styled `<label>`
7. **CSS Variables**: Enable dynamic theme switching without page reload
8. **Session Storage**: Persist theme choices across requests
9. **Mobile Responsive**: Flexbox with wrap and order properties

## Testing Checklist

- [ ] All icons display correctly
- [ ] Icon hover states work
- [ ] Active icon state visually distinct
- [ ] Dropdown opens on click
- [ ] Dropdown closes on outside click
- [ ] Dropdown closes on Escape key
- [ ] Gradient swatches show correct colors
- [ ] Theme selection updates colors immediately
- [ ] Advanced color pickers work
- [ ] Search icon positioned correctly
- [ ] Mobile layout stacks properly
- [ ] All buttons have proper titles/aria-labels

## Related Documentation

- [Card Sizing and Responsive Layout](./card-sizing-and-responsive-layout.md)
- [Progressive Image Loading](./progressive-image-loading.md)
- [Gradient Generation Guide](./gradient-generation-guide.md)
