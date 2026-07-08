# Tirbeo Design Patterns & Inspiration

A curated collection of design prompts, patterns, and ideas for Tirbeo's landing page and ecosystem.

---

## Table of Contents
1. [Hero & Background Patterns](#1-hero--background-patterns)
2. [Scroll Animations & Parallax](#2-scroll-animations--parallax)
3. [3D & Scene Effects](#3-3d--scene-effects)
4. [Glassmorphism & Modern UI](#4-glassmorphism--modern-ui)
5. [Typography & Text Effects](#5-typography--text-effects)
6. [Interactive Elements](#6-interactive-elements)
7. [Navigation & Headers](#7-navigation--headers)
8. [Sections & Layouts](#8-sections--layouts)
9. [Colors & Gradients](#9-colors--gradients)
10. [Micro-interactions & Particles](#10-micro-interactions--particles)

---

## 1. Hero & Background Patterns

### 1.1 Interactive Hero Background
- Background image (bgpc.png) with mouse-tracking parallax
- On hover: subtle zoom + pan in direction of cursor
- Smooth GSAP-powered transitions
- No floating icons/shapes in front of the hero image
- Clean, minimal overlay with gradient orbs only

### 1.2 Gradient Mesh Hero
```css
background: radial-gradient(ellipse at 20% 50%, #0A2472 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, #7A3EF2 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, #F25604 0%, transparent 50%),
            #00072D;
```

### 1.3 Noise Texture Overlay
```css
background-image: url("data:image/svg+xml,...");
background-size: 200px 200px;
opacity: 0.03;
mix-blend-mode: overlay;
pointer-events: none;
```

### 1.4 Grid Background
```css
background-image: 
  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
background-size: 60px 60px;
```

---

## 2. Scroll Animations & Parallax

### 2.1 Section Reveal (GSAP)
- Elements fade in + slide up when scrolled into view
- `gsap.fromTo()` with `scrollTrigger` and `once: true`
- Stagger for multiple items: 0.15–0.2s delay
- Easing: `power3.out` or `back.out(1.4)`

### 2.2 Parallax Scrolling
- Background moves slower than foreground
- `data-speed` attribute for configurable speed (0.05–0.15)
- Implemented via GSAP ScrollTrigger scrub

### 2.3 Pin & Reveal Sections
- Section pinned while content scrolls through
- Used for "About" multi-paragraph reveal
- Each paragraph fades in at center, blurs out at edges

### 2.4 Horizontal Scroll
```js
// Horizontal scroll for gallery/cards section
gsap.to('.track', {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: '.section',
    start: 'top top',
    end: () => `+=${track.scrollWidth}`,
    pin: true,
    scrub: 1,
  },
});
```

### 2.5 Number Counter Animation
```js
// Count up on scroll
gsap.fromTo('.counter', 
  { textContent: 0 },
  {
    textContent: 100,
    duration: 2,
    ease: 'power2.out',
    snap: { textContent: 1 },
    scrollTrigger: { trigger: '.counter', start: 'top 80%' },
  }
);
```

### 2.6 Reveal Text Character by Character
```js
// Split text into spans, animate each
const chars = text.split('').map(c => `<span>${c}</span>`).join('');
tl.fromTo('span', 
  { opacity: 0, y: 20, rotateX: -90 },
  { opacity: 1, y: 0, rotateX: 0, stagger: 0.02 }
);
```

---

## 3. 3D & Scene Effects

### 3.1 Three.js Scene Integration
- Full-screen 3D scene with camera parallax on scroll
- Post-processing: bloom, color grading, glitch effects
- Used in StackedSection for the tower/bridge scene

### 3.2 3D Tilt Card (Vanilla JS)
```js
card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  card.style.transform = `
    perspective(800px)
    rotateY(${x * 10}deg)
    rotateX(${-y * 10}deg)
  `;
});
card.addEventListener('mouseleave', () => {
  card.style.transform = 'perspective(800px) rotateY(0) rotateX(0)';
});
```

### 3.3 Parallax Tilt on Scroll
- Different layers move at different speeds
- Creates 3D depth illusion without WebGL
- Controlled via CSS transforms + JS scroll listener

### 3.4 Glow & Bloom Effects
- CSS: `box-shadow` with large blur radius + color
- Three.js: UnrealBloomPass for emissive materials
- SVG: `feGaussianBlur` filter for glow

---

## 4. Glassmorphism & Modern UI

### 4.1 Glass Card
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
```

### 4.2 Glass Button Variants
- **Primary**: Gradient from `#F25604` to `#F97316`, hover lift
- **Secondary**: Glass with border, hover fills in
- **Ghost**: Transparent, underline on hover

### 4.3 Frosted Glass Navbar
```css
nav {
  background: rgba(1, 0, 6, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
```

### 4.4 Border Glow Effect
```css
.glow-border {
  position: relative;
}
.glow-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(135deg, #F25604, #7A3EF2);
  z-index: -1;
  opacity: 0.5;
}
```

---

## 5. Typography & Text Effects

### 5.1 Gradient Text
```css
.gradient-text {
  background: linear-gradient(to right, #fff, #F97316, #F25604);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 5.2 Text Reveal Animation
- Each word/character animates in sequentially
- Options: fade-up, slide-up, clip-path reveal, blur-in

### 5.3 Typewriter Effect
```js
// Type out text character by character
let i = 0;
const speed = 50;
function typeWriter() {
  if (i < txt.length) {
    el.innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}
```

### 5.4 Glitch Text Effect
```css
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-1px, 1px); }
  80% { transform: translate(1px, -1px); }
  100% { transform: translate(0); }
}
```

### 5.5 Shimmer Text Animation
```css
.shimmer {
  background: linear-gradient(
    90deg, #fff 0%, #F97316 50%, #fff 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  animation: shimmer 3s ease-in-out infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 6. Interactive Elements

### 6.1 Magnetic Button
- Button follows cursor slightly when hovered
- Returns to original position on mouse leave
- Smooth GSAP animation

### 6.2 Custom Cursor
- Round, blur-backed cursor following mouse
- Changes size/color on hover over interactive elements
- Subtle breathing animation (pulsing scale)
- Color shift based on position/time

### 6.3 Image Hover Effects
- **Zoom**: Scale image on hover
- **Reveal**: Clip-path or mask reveal on hover
- **Tilt**: 3D perspective tilt on mouse move
- **Glow**: Overlay glow on hover

### 6.4 Scroll-Triggered Reveals
- Elements hidden initially, revealed on scroll
- Options: fade, slide, scale, blur, clip-path

### 6.5 Button Hover States
- Arrow slides right on hover
- Background gradient flips
- Glow expands outward
- Scale up slightly (105%)

---

## 7. Navigation & Headers

### 7.1 Floating Navbar
- Fixed position at top
- Background becomes opaque on scroll
- Links have underline hover effect
- Mobile: hamburger with slide-out menu

### 7.2 Section Navigation
- Dots on the side indicating current section
- Smooth scroll to section on click
- Active dot highlighted

### 7.3 Mega Menu
- Expandable dropdown with columns
- Glass background
- Animated open/close

---

## 8. Sections & Layouts

### 8.1 About Section (Vertical Carousel)
- Multiple paragraphs stacked vertically
- Auto-scrolls on scroll (GSAP pin + translate)
- Center paragraph is focused (opaque, sharp)
- Outer paragraphs fade + blur out
- Creates reading experience

### 8.2 Feature Grid
- 3-column grid of feature cards
- Each card has icon, title, description
- Cards stagger in on scroll
- Hover: slight lift + border glow

### 8.3 Pricing Section
- 3-tier pricing cards (Free, Pro, Enterprise)
- Center card highlighted/promoted
- Checkmark lists for features
- CTA button per card
- Glass card styling

### 8.4 Stats Counter Section
- Row of stat numbers (users, messages, etc.)
- Numbers count up from 0 on scroll
- Label underneath each stat

### 8.5 Marquee / Infinite Scroll
- Horizontal scrolling text/logos
- Duplicated content for seamless loop
- CSS or GSAP powered
- Pause on hover

### 8.6 Stacked Cards
- Cards stacked vertically with sticky positioning
- Each card reveals on scroll
- Image + text content

### 8.7 Testimonials Carousel
- Rotating quotes from users
- Auto-advance with manual controls
- Avatar + name + role

---

## 9. Colors & Gradients

### 9.1 Tirbeo Brand Palette
| Name | Hex | Usage |
|------|-----|-------|
| Rich Black | `#00072D` | Deep backgrounds |
| Dark Navy | `#051650` | Section gradients |
| Deep Blue | `#0A2472` | Mid-blue surfaces |
| Mid Blue | `#123499` | Accent overlays |
| Orange Primary | `#F25604` | CTAs, highlights |
| Orange Light | `#F97316` | Secondary accent |
| Purple Accent | `#7A3EF2` | Creative elements |
| Blue Accent | `#2F4FC4` | UI accents |
| Off White | `#EAF3F3` | Typography on dark |
| Text Light | `#CBD5E1` | Secondary text |
| Text Muted | `#94A3B8` | Muted text |

### 9.2 Background Gradient
```css
background: linear-gradient(
  135deg,
  #00072D 0%,
  #051650 25%,
  #0A2472 50%,
  #051650 75%,
  #00072D 100%
);
```

### 9.3 Button Gradient
```css
background: linear-gradient(135deg, #F25604, #F97316);
```

### 9.4 Glow Colors
```css
/* Orange glow */
box-shadow: 0 0 40px rgba(242, 86, 4, 0.3);
/* Purple glow */
box-shadow: 0 0 40px rgba(122, 62, 242, 0.2);
/* Blue glow */
box-shadow: 0 0 40px rgba(47, 79, 196, 0.2);
```

---

## 10. Micro-interactions & Particles

### 10.1 Particle Background
- Canvas-based particle system
- Floating dots/shapes
- Mouse interaction (particles move away from cursor)
- Subtle, doesn't overwhelm content

### 10.2 Scroll Progress Indicator
- Top-of-page progress bar
- Fills from 0% to 100% as user scrolls
- Thin (2-3px height)
- Colored gradient

### 10.3 Smooth Anchor Scrolling
```js
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
```

### 10.4 Loading / Preloader Animation
- Full-screen overlay on initial load
- Logo or spinner animation
- Progress bar or percentage
- Fades out after load

### 10.5 Hover Ripple Effect
```js
button.addEventListener('click', (e) => {
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  ripple.style.left = `${e.clientX - rect.left}px`;
  ripple.style.top = `${e.clientY - rect.top}px`;
  ripple.classList.add('ripple');
  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});
```

### 10.6 Intersection Observer for Analytics
```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Track section view, load lazy content, etc.
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
```

---

## Implementation Priority

### P0 (Must Have)
- Hero with interactive background image (mouse parallax)
- About section with scroll-triggered paragraph reveals
- Glassmorphism cards and buttons
- Gradient text for headlines
- Smooth scroll animations

### P1 (Should Have)
- Custom cursor with color shift
- 3D tilt hover on cards
- Marquee for logos
- Number counters for stats
- Preloader animation

### P2 (Nice to Have)
- Three.js scenes with post-processing
- Typewriter effect
- Particle background
- Glitch text effects
- Ripple button effects

### P3 (Future)
- Full 3D interactive scenes
- WebGL particle systems
- VR/AR components
- AI-generated visuals
- Real-time data visualizations

---

*This document serves as the design system reference for Tirbeo page development. Patterns should be applied consistently across all sections.*
