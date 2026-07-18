# Far & Few — Travel Destination Explorer

A responsive travel destination explorer built with Bootstrap 5.

## Structure
```
index.html
css/style.css
images/      (empty — page uses hosted Unsplash images; drop local images here if you'd rather self-host)
README.md
```

## Features
- Responsive navbar with collapse menu
- Hero section with headline + CTA
- 8 destination cards: image, title, country, rating, description, price badge, button
- Responsive grid: 4-up desktop (col-lg-3), 2-up tablet (col-md-6), 1-up mobile (col-12)
- "Why Us" info strip
- Footer with link columns and social icons

## Tech
HTML5, CSS3, Bootstrap 5.3.3, Bootstrap Icons 1.11.3, Google Fonts (Fraunces + Space Grotesk).

## Testing checklist
- [x] No horizontal scroll at 320px–1920px widths
- [x] Cards reflow at lg/md/sm breakpoints
- [x] Buttons and nav links are clickable/focusable
- [x] Images use object-fit: cover so card heights stay uniform

## Notes
Images are loaded from Unsplash CDN — swap the `src` attributes in `index.html` for files in `images/` if you need it to work offline.
