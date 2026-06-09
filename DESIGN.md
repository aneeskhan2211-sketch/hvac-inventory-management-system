# Design Brief

## Direction

Professional Industrial Dark — disciplined, content-first productivity interface for HVAC inventory management with reliable clarity and engineered precision.

## Tone

Refined minimalism with industrial precision — conveys trust and efficiency without coldness, engineered for field technicians and office staff.

## Differentiation

Semantic status indicator badges using sharp color hierarchy (destructive red, warning amber, success green) paired with slate-dark interface for long-session comfort.

## Color Palette

| Token      | OKLCH         | Role                              |
| ---------- | ------------- | --------------------------------- |
| background | 0.145 0.014 260 | Primary dark surface (slate-tint) |
| foreground | 0.95 0.01 260 | Bright text on dark               |
| card       | 0.18 0.014 260 | Elevated card surface             |
| primary    | 0.65 0.18 200 | Cool cyan/blue primary actions    |
| accent     | 0.72 0.18 60  | Warm amber for secondary actions  |
| success    | 0.62 0.18 140 | Natural green for operational     |
| warning    | 0.72 0.18 60  | Warm amber for caution            |
| destructive| 0.55 0.25 20  | Sharp red for alerts              |
| muted      | 0.22 0.02 260 | Subtle backgrounds & borders      |
| border     | 0.28 0.02 260 | 1px card/input borders            |

## Typography

- Display: Space Grotesk — technical, professional headings & hero text
- Body: Figtree — modern sans-serif for readable paragraphs, labels, UI text
- Mono: Geist Mono — SKU codes, barcodes, serial numbers
- Scale: h1 text-5xl font-bold tracking-tight, h2 text-3xl font-bold, body text-base, labels text-sm

## Elevation & Depth

Layered depth through subtle elevation: cards with 1px borders and soft shadows (0 4px 6px -1px), sidebar darker than content, header provides spatial separation.

## Structural Zones

| Zone    | Background              | Border                    | Notes                          |
| ------- | ----------------------- | ------------------------- | ------------------------------ |
| Header  | card (0.18)             | 1px border-b muted        | Thin divider, integrated top   |
| Sidebar | sidebar (0.125 darker)  | 1px border-r muted        | Navigation focal point         |
| Content | background (0.145)      | —                         | Alternates muted/card per row  |
| Footer  | muted (0.22)            | 1px border-t muted        | Legal/metadata area            |

## Spacing & Rhythm

Consistent 8px baseline grid; section gaps 24px, card padding 24px, micro-spacing 8px/12px for form groups; loose density suits information-dense dashboards.

## Component Patterns

- Buttons: primary (blue fill, no border), secondary (border only, transparent), destructive (red, bold)
- Cards: rounded-md (8px), 1px border, subtle shadow, padding 24px
- Badges: status-good (green bg/fg), status-warning (amber bg/fg), status-danger (red bg/fg)
- Inputs: 1px border-input, focus:ring-primary, rounded-md

## Motion

- Entrance: fade-in 0.3s ease-out for modals, slide-up for toasts
- Hover: button opacity 0.9, card scale-[1.01] with shadow elevation
- Decorative: none (function-first)

## Constraints

- No color values outside OKLCH palette; every element via semantic token
- No gradients, no opacity effects except for focus/hover states
- Minimum 1.5 unit shadow, maximum md (0 4px 6px); elevated only for modals
- Mobile-first responsive (sm: 640px, md: 768px, lg: 1024px)
- Dark mode as primary; light mode optional future

## Signature Detail

Semantic status badge system using sharp, industry-standard color codes (red=critical, amber=warning, green=operational) embedded in every card/row for at-a-glance inventory health assessment.
