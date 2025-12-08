# SoulSeer Design Guidelines

## Design Approach
**Aesthetic Direction**: Celestial, mystical, and ethereal with a premium spiritual guidance platform feel. Dark-mode default embodying the mystical nature of psychic services.

## Color Palette
- **Primary**: Mystical pink (#FF69B4 or similar)
- **Secondary**: Black for backgrounds and depth
- **Accents**: Gold for premium touches and highlights
- **Neutral**: White for contrast and readability
- **Background**: Dark ethereal cosmic theme with strategically placed gold accents
- **Color Philosophy**: Variety of pinks and black as the main scheme, creating a spiritual and mystical atmosphere

## Typography

### Font Families
- **Display/Headings**: Alex Brush (mystical, elegant script)
- **Body Text**: Playfair Display (refined serif for readability)

### Typography Hierarchy
- **Main Header "SoulSeer"**: Alex Brush, pink (#FF69B4), prominent sizing
- **Tagline "A Community of Gifted Psychics"**: Playfair Display
- **Headings**: Alex Brush in pink
- **Body Text**: Playfair Display
  - White (#FFFFFF) on dark backgrounds
  - Black (#000000) on light backgrounds for optimal visibility
- **UI Elements**: Maintain font consistency across buttons, menus, interactive elements
- **Accessibility**: Ensure sufficient contrast ratios for WCAG compliance

## Layout System

### Spacing
Use Tailwind spacing units: 2, 4, 8, 12, 16, 20, 24 for consistency
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-20
- Card spacing: p-6
- Generous whitespace to let mystical elements breathe

### Homepage Structure
1. **Header**: "SoulSeer" in Alex Brush (pink) at top
2. **Hero Image**: https://i.postimg.cc/tRLSgCPb/HERO-IMAGE-1.jpg (placed directly below header)
3. **Tagline**: "A Community of Gifted Psychics" in Playfair Display (below hero image)
4. **Online Readers Section**: Display currently online readers with availability
5. **Active Live Streams**: Highlight with viewer counts
6. **Featured Services**: Showcase spiritual services
7. **Special Offers**: New products and announcements

## Visual Design Elements

### Cosmic & Mystical Elements
- Stars, moons, celestial patterns throughout
- Background image: https://i.postimg.cc/sXdsKGTK/DALL-E-2025-06-06-14-36-29-A-vivid-ethereal-background-image-designed-for-a-psychic-reading-app.webp
- Ethereal glows and subtle gradient overlays
- Cosmic textures for depth

### Animations
- Smooth, subtle transitions for interactive elements
- Gentle fade-ins for content loading
- Celestial particle effects (stars twinkling, subtle movements)
- Minimize distracting animations - keep mystical without being overwhelming

## Component Library

### Cards
- Dark backgrounds with pink/gold borders
- Subtle shadow/glow effects
- Rounded corners for softness
- Reader cards: profile image, name (Alex Brush pink), specialties, availability status, per-minute rates

### Buttons
- Primary: Pink background with white text
- Secondary: Outlined pink with pink text on dark background
- When on images: Blurred background for visibility
- No custom hover states (Button component handles this)

### Navigation
- Dark background with pink active states
- Clear visual hierarchy
- Icons with celestial theme
- Mobile-first responsive design

### Forms & Inputs
- Dark backgrounds with pink focus states
- Clear labels in Playfair Display
- Accessible contrast throughout
- Consistent padding and spacing

### Status Indicators
- Online/Offline toggles with visual glow effects
- Availability badges in pink/gold
- Session timers prominently displayed
- Real-time updates with smooth transitions

### Dashboards
- Grid-based layout for metrics
- Dark cards with pink/gold accents for data
- Clear visual separation between sections
- Earnings displayed prominently with gold highlighting

## Images

### Hero Section
- **Hero Image**: https://i.postimg.cc/tRLSgCPb/HERO-IMAGE-1.jpg
- Full-width placement between header and tagline
- Mystical, professional aesthetic

### About Page
- **Founder Image**: https://i.postimg.cc/s2ds9RtC/FOUNDER.jpg
- Positioned alongside founder story
- Professional presentation with mystical framing

### Reader Profiles
- Profile pictures with circular frames
- Pink/gold border treatments
- Consistent sizing across platform

### Product Images
- High-quality photography for marketplace items
- Consistent aspect ratios
- Mystical styling to match brand

## Iconography
- Use Heroicons via CDN for interface icons
- Celestial-themed custom icons where needed (stars, moons, crystals)
- Consistent stroke weight
- Pink coloring for primary icons

## Responsive Design
- **Mobile-first approach** (critical requirement)
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Stack columns on mobile, expand on desktop
- Touch-friendly tap targets (minimum 44px)
- Readable text sizes on all devices

## Accessibility
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Colorblind-friendly mode options
- Text size adjustment capabilities
- Sufficient contrast ratios throughout
- Keyboard navigation support

## Special Considerations
- **PWA capabilities** for offline functionality
- Performance optimization for lower-end devices
- Consistent spacing and alignment
- Intuitive iconography blending with celestial theme
- Visual emphasis on mystical nature while maintaining professionalism
- End-to-end encrypted communication indicators
- Real-time status updates with smooth visual feedback