# Logo Setup Instructions

## Logo Files

The KKCW logo is used in:

1. **Dashboard Header** - Small 40x40px logo next to "KKCW" text
2. **Login Screen** - Large 80x80px logo at the top
3. **Browser Favicon** - 32x32px icon in browser tab

## Files

- **`frontend/public/logo.svg`** - SVG template (placeholder, you can customize)
- **`frontend/public/logo.png`** - PNG file (add your custom logo here)

## How to Add Your Logo

### Option 1: Use the SVG Template

The `logo.svg` file is a placeholder. You can:

1. Replace it with your custom SVG
2. Or convert it to PNG using online tools (e.g., CloudConvert, Online-Convert)

### Option 2: Add Your Own PNG

1. Place your `logo.png` file in `frontend/public/`
2. Make sure it's square (e.g., 200x200px or larger)
3. The code will automatically resize it to fit different areas

## Where Logo Appears

### Dashboard Header (Top-Left)

- Size: 40x40px
- Location: Next to "KKCW" text in the blue AppBar
- File: `frontend/src/components/Navigation.js`

### Login Screen

- Size: 80x80px
- Location: Center top of login form
- File: `frontend/src/pages/AuthPage.js`

### Browser Tab (Favicon)

- Size: 32x32px (auto-scaled)
- Location: Browser tab icon
- File: `frontend/public/index.html`

## Testing

After adding your logo:

1. **Dashboard**: Should see logo + "KKCW" in top-left blue bar
2. **Login Page**: Should see larger logo at top of form
3. **Browser Tab**: Should see favicon in browser tab

## Current Logo

A placeholder SVG template is provided at `frontend/public/logo.svg`:

- Blue background circle
- "KKCW" text in white
- Decorative line below

You can:

- Use it as-is (will auto-scale to all sizes)
- Customize the colors and design
- Replace with your own PNG/SVG

## Responsive Sizing

The logo automatically scales:

- Dashboard: 40x40px
- Login: 80x80px
- Favicon: 32x32px (browser handles scaling)

No additional configuration needed!
