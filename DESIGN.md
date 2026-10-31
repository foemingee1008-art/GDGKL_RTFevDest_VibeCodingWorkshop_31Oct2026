---
name: Log In Sentinel
colors:
  surface: '#0c1322'
  surface-dim: '#0c1322'
  surface-bright: '#323949'
  surface-container-lowest: '#070e1d'
  surface-container-low: '#141b2b'
  surface-container: '#191f2f'
  surface-container-high: '#232a3a'
  surface-container-highest: '#2e3545'
  on-surface: '#dce2f7'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#dce2f7'
  inverse-on-surface: '#293040'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#4cd7f6'
  on-primary: '#003640'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#00687a'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb3ad'
  on-tertiary: '#68000a'
  tertiary-container: '#ff817a'
  on-tertiary-container: '#7e000f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#0c1322'
  on-background: '#dce2f7'
  surface-variant: '#2e3545'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
  code-lg:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '400'
    lineHeight: 0.875rem
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system targets Tier 1–3 Security Operations Center (SOC) analysts, incident responders, and SecOps engineering leads who operate in high-stress, information-dense environments. The core brand attributes are absolute precision, rapid parseability, unyielding vigilance, and surgical control. 

The aesthetic is a high-density, mission-critical interface blending Modern Technical Minimalism with tactical SOC instrumentation. It rejects gratuitous decorative skeuomorphism in favor of high-contrast functional hierarchy, pixel-aligned borders, low-attenuation ambient glows for critical events, and meticulous tabular alignment. Surfaces remain deeply anchored in near-black charcoal tones to alleviate retinal fatigue across continuous monitoring shifts, while vibrant, standardized telemetry signals (cyan, emerald, amber, and crimson) cut through the dark canvas to guide immediate triage actions.

## Colors

The palette operates under an uncompromising dark-first paradigm. Surfaces and data streams are separated via controlled luminance stepping rather than heavy fills:

- **Canvas & Foundations**: The primary canvas background is `#0B0F19` (Obsidian Charcoal). Standard panels, query boards, and card modules utilize `#111827` (Dark Slate). Secondary layered panels, table header tracks, and floating toolbars use `#1F2937` (Layer 2).
- **Structural Outlines**: Default boundaries, structural column dividers, and inactive borders strictly use `#1F2937`. Elevated, hovered, or active surfaces use `#374151`.
- **Primary Signals**: Electric Cyan (`#06B6D4`) serves as the operational focal point—designated for primary CTA actions, active navigation states, interactive node links, and dynamic telemetry filters.
- **Operational Status & Severity Spectrum**:
  - **Safe / Healthy / Resolved**: Emerald Green (`#10B981`) indicates active defensive postures, verified tokens, and normal baseline throughput.
  - **Medium Severity / Warning / Degraded**: Amber (`#F59E0B`) flags anomalous geolocations, policy threshold violations, and suspicious auth patterns.
  - **Critical Alert / Malicious / Emergency**: Crimson Red (`#EF4444`) flags privilege escalations, active brute-force attacks, leaked credentials, and automated kill-switch triggers.
  - **Informational / Auditing**: Deep Sky Slate (`#60A5FA` / `#38BDF8`) reserved for system notifications and non-hazardous configuration updates.
- **Text & Contrast Tiers**: High-contrast Primary Text at `#F9FAFB` (98% contrast against canvas), Secondary Technical Text at `#9CA3AF`, and Disabled/Muted Labels at `#4B5563`.

## Typography

The typographical hierarchy is dual-engine:

1. **Inter** is reserved for human-centric user interface controls, broad analytic descriptions, module headings, and standard navigational controls. Its geometric clarity prevents fatigue while maintaining clear discernment between glyphs at low visual weights.
2. **JetBrains Mono** governs the technical telemetry realm. It is mandatory for all machine variables: IPv4/IPv6 addresses, SHA256 hashes, Unix epoch and UTC timestamps, regex rules, SIEM syntax, CIDR blocks, port identifiers, and high-density log streams.

All labels, counters, and metadata tags set in `JetBrains Mono` leverage tabular numbers (`tnum`) by default, preventing jitter when dynamic live log feeds, bandwidth gauges, or alert countdown counters update in real time. Section tracking tags and metric keys utilize uppercase formatting (`label-caps`) with open tracking (`0.05em`) for immediate perceptual anchor points.

## Layout & Spacing

This design system uses a high-density, fluid-column grid calibrated for widescreen multi-monitor monitoring walls (1440px to 2560px+) while gracefully adapting downwards:

- **Desktop (1200px+)**: 12-column fluid grid, `1.5rem` gutters, `1.5rem` edge margins. Modules favor compact vertical density, allowing up to 24 table rows or multiple auxiliary visual panels above the fold.
- **Tablet / Mid-tier (768px – 1199px)**: 8-column layout, `1rem` gutters, `1rem` edge margins. Auxiliary live telemetry sidecars collapse into sliding drawer sheets.
- **Mobile / On-Call Triage (< 768px)**: 4-column single-stack layout, `0.75rem` gutters, `1rem` margin. Complex multi-column logs transition to expandable cards with fixed-width horizontal scroll viewports for raw strings.

Vertical spacing adheres strictly to a 4px/8px modular cadence. Tight spacing (`space-xs` = 4px, `space-sm` = 8px) is enforced inside data tables, chip matrices, filter bars, and alert clusters to maintain maximum visible telemetry payload without requiring scrolling.

## Elevation & Depth

Depth is established through calibrated tonal layering, sharp micro-borders, and targeted emissive glows rather than traditional diffuse drop shadows.

- **Level 0 (Base Canvas)**: Deep charcoal (`#0B0F19`). No shadow.
- **Level 1 (Panels, Cards, Grid Nodes)**: Slate surface (`#111827`) bound by a 1px border stroke in `#1F2937`.
- **Level 2 (Dropdowns, Popovers, Docked Drawers)**: `#1F2937` surface with a 1px stroke in `#374151`. Supported by a dark directional shadow: `0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)`.
- **Level 3 (Modal Dialogs, Triage Focus Overlays)**: `#111827` surface with a 1px stroke in `#4B5563` and a backdrop blur filter (`backdrop-filter: blur(8px)`) across an underlying 70% black overlay (`rgba(11, 15, 25, 0.8)`).
- **Emissive Tactical Glows**: For active incidents, surface borders inherit accent-colored micro-glows to command attention:
  - Critical: `box-shadow: 0 0 12px rgba(239, 68, 68, 0.25), inset 0 0 0 1px rgba(239, 68, 68, 0.4)`
  - Active Scan / Focus: `box-shadow: 0 0 12px rgba(6, 182, 212, 0.2), inset 0 0 0 1px rgba(6, 182, 212, 0.4)`
