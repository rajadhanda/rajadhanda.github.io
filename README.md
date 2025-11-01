# rajadhanda.me

Personal website showcasing projects, blog posts, and photographs.

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, animations, and responsive design
- **Vanilla JavaScript** - No framework dependencies
- **Font Awesome 6.5.2** - Icon library (CDN)
- **Google Fonts** - Typography (Crimson Text, Inter)
- **GitHub Pages** - Static hosting

## Design Philosophy

- **Minimalism First** - Clean, uncluttered interface
- **Subtle Interactions** - Elegant micro-animations that enhance without distracting
- **Performance** - 60fps animations, optimized rendering
- **Accessibility** - Full keyboard navigation, prefers-reduced-motion support
- **Consistency** - Unified design language across all pages

## Features

- Interactive homepage with physics-based bubble navigation
- Smooth page transitions
- Blog with card-based layout
- Photo gallery with lazy loading
- Responsive design (mobile-first approach)
- Lightbox for images
- Reading progress indicators
- Dark mode ready (structure in place)

## Setup

This is a static website that can be:

1. **Viewed directly** - Open HTML files in a browser
2. **Served locally** - Use any static file server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (http-server)
   npx http-server
   
   # PHP
   php -S localhost:8000
   ```
3. **Deployed to GitHub Pages** - Automatically deployed from the `main` branch

## Structure

```
rajadhanda.me/
├── index.html              # Homepage
├── about/
│   └── index.html          # About page
├── blog/
│   ├── index.html          # Blog listing
│   └── posts/               # Blog posts
├── projects/
│   └── index.html          # Projects page
├── photographs/
│   ├── index.html          # Photo gallery
│   └── images/             # Photo assets
└── assets/
    └── images/              # Site assets
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- Responsive design for mobile devices

## Performance

- Minimal JavaScript (vanilla JS only)
- CSS-based animations for performance
- Lazy loading for images
- Optimized animations with `will-change` and `transform`
- Respects `prefers-reduced-motion` for accessibility

## License

© 2025 Raja Dhanda – All rights reserved