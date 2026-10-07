---
name: FocusFlow Technical Instrument
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4ee'
  surface-container: '#efeee9'
  surface-container-high: '#e9e8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#404943'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#296a4e'
  primary: '#296a4e'
  on-primary: '#ffffff'
  primary-container: '#6faf8f'
  on-primary-container: '#00412b'
  inverse-primary: '#93d4b2'
  secondary: '#ac3224'
  on-secondary: '#ffffff'
  secondary-container: '#fe6d59'
  on-secondary-container: '#6d0100'
  tertiary: '#835500'
  on-tertiary: '#ffffff'
  tertiary-container: '#d19742'
  on-tertiary-container: '#503200'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#aef1ce'
  primary-fixed-dim: '#93d4b2'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#085137'
  secondary-fixed: '#ffdad4'
  secondary-fixed-dim: '#ffb4a8'
  on-secondary-fixed: '#410000'
  on-secondary-fixed-variant: '#8b190f'
  tertiary-fixed: '#ffddb4'
  tertiary-fixed-dim: '#fabb62'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#633f00'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
typography:
  display-timer:
    fontFamily: JetBrains Mono
    fontSize: 56px
    fontWeight: '600'
    lineHeight: 64px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-xs:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.5rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system models an ultra-focused, tactile technical instrument calibrated specifically for deep knowledge work and cognitive stamina within a compact viewport (400x600 browser extension environment). The brand voice balances utilitarian laboratory precision with an organic, calming mindfulness anchor. 

Visual characteristics borrow from high-grade physical timepieces, laboratory metric displays, and Japanese industrial stationery. By paring back decorative visual noise and leaning into mono-spaced tabular metrics set against a muted sage atmosphere, the UI establishes an intentional, distraction-free sanctuary. Every element appears engineered rather than decorated, fostering calm concentration without inducing sterile coldness.

Tone keywords:
- **Calculated**: Rigid baseline grids, explicit boundary lines, micro-instrumentation.
- **Organic Precision**: Grounded botanical tones tempering technical severity.
- **Focused Simplicity**: Minimal visual interference, rapid readability, purposeful feedback.

## Colors

The palette operates under a strict hierarchy designed to maintain baseline emotional equilibrium while signaling state transitions through intentional phase accents.

- **Primary Anchor (`#6FAF8F` - Short Break / Sage Calibrate)**: Serves as the primary operational hue, driving calm cognitive grounding, progress meters, and primary active states.
- **Secondary Phase (`#E85D4A` - Focus Red / Coral Pulse)**: Dedicated strictly to deep work intervals and high-priority action states requiring immediate user commitment.
- **Tertiary Phase (`#D59A45` - Long Break / Amber Recalibration)**: Applied to reflective extended intervals, streak counters, and contextual warnings.
- **Base Surfaces & Neutrals**:
  - `Canvas / Shell`: `#F8F7F3` (warm bone porcelain backdrop)
  - `Surface Container`: `#FFFFFF` (isolated instrument card planes)
  - `Structural Border`: `#E7E5DE` (delicate hairline dividers)
  - `Text Primary`: `#242522` (deep muted obsidian, never absolute `#000000`)
  - `Text Secondary`: `#777A72` (subdued technical notation grey)
  - `Text Dimmed / Inactive`: `#A7AAA0`

## Typography

Typography acts as a direct technical instrument. Numerical countdown displays and telemetry data rely exclusively on `JetBrains Mono` with activated tabular lining figures (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter during rapid countdown tick events.

`Space Grotesk` introduces geometric mechanical structure to headers and module titles, balancing the monospaced body rhythm with contemporary editorial precision. Vietnamese diacritics maintain strict line-height clearances to prevent vertical clipping across tightly constrained popup card layouts. Micro-labels and telemetry keys feature subtle uppercase tracking to reinforce physical dial and readout aesthetics.

## Layout & Spacing

The layout is tailored strictly for a non-resizable 400px by 600px Chrome extension viewport popup shell.

- **Grid Architecture**: Fixed 1-column modular stack bounded by a fixed 16px (`1rem`) outer canvas perimeter margin. Internally, a strict 8-point base module governs all component paddings, card partitions, and stacked widgets.
- **Vertical Budgeting (600px constraint)**:
  - Header Frame: 48px fixed height.
  - Timer Core Area: 220px dedicated visual stage.
  - Primary Action Cluster: 64px interactive zone.
  - Contextual Task & Daily Metrics Shelf: 180px scrollable/collapsible drawer container.
  - Utility Footer: 40px pinned baseline.
- **Scroll Rules**: Overflow content strictly uses concealed, hairline-styled custom scrollbars without displacing content bounds.

## Elevation & Depth

Depth is defined primarily through crisp structural contours, subtle tonal shifts, and low-contrast hairline outlines rather than aggressive drop shadows.

- **Level 0 (Canvas Base)**: `#F8F7F3` raw foundation plane.
- **Level 1 (Instrument Containers & Cards)**: `#FFFFFF` panels reinforced by a 1px solid `#E7E5DE` border.
- **Level 2 (Active Controls & Modals)**: Lifted using a diffuse, micro-ambient contact shadow: `0 2px 6px rgba(36, 37, 34, 0.05), 0 1px 2px rgba(36, 37, 34, 0.03)`.
- **Level 3 (Tactile Depressed States)**: Buttons and toggle switches translate -1px on the Y-axis with inset micro-tinting `inset 0 1px 2px rgba(0, 0, 0, 0.06)` to emulate tactile mechanical switches.

## Shapes

The shape system employs deliberate, low-radius curvature to project industrial rigor:

- **Base Radius (`0.25rem` / 4px)**: Data tags, micro-badges, checkbox frames, and telemetry chips.
- **Medium Radius (`0.5rem` / 8px - 10px)**: Primary command buttons, inputs, segmented mode switch bars.
- **Container Radius (`0.75rem` / 12px - 16px)**: Core timer display module, task cards, analytics summaries.
- **Pill Form (`9999px`)**: Session status indicators (e.g., phase tags) and circular iconography buttons.

## Components

### Action Buttons
- **Primary Stage Button ("Bắt đầu tập trung" / "Tạm dừng")**:
  - Full-width or dominant centered pill/rounded-box (10px border radius).
  - Background keyed to current mode: `#6FAF8F` (Sage), `#E85D4A` (Coral), or `#D59A45` (Amber).
  - Text: `#FFFFFF`, bold `Space Grotesk` or `JetBrains Mono` label-md.
  - Height: 44px for immediate hit-target discovery.
- **Secondary / Tertiary Buttons ("Bỏ qua", "Cài đặt")**:
  - Outlined 1px `#E7E5DE`, background `#FFFFFF`, text `#242522`. Hover shift: `#F2EFE9`.

### Segmented Phase Controller
- A 3-way toggle capsule spanning the width of the display for rapid mode switches: `Tập trung` | `Nghỉ ngắn` | `Nghỉ dài`.
- Inactive segments: Clear text (`#777A72`) over translucent backing.
- Active segment: Recessed container with active phase dot and high-contrast text label.

### Timer Display Instrumentation
- Prominent tabular countdown counter flanked by circular micro-progress tracks or horizontal 2px tick-stroke gauges.
- Phase metadata displayed above the digits using `label-xs` tracked typography (e.g., `PHIÊN LÀM VIỆC #03`).

### Task & Metric Cards ("Thống kê hôm nay", "Mục tiêu hiện tại")
- Enclosed in Level 1 surfaces with 1px hairline perimeter borders.
- Checkboxes: 16px squares with soft 4px corners; active state filled with current mode tint.
- Metric indicators: Split tabular counters (e.g., `04/08 POMO`) rendered in monospaced font.