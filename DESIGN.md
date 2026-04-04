# Kinetic Cobalt Design System

### 1. Overview & Creative North Star
**Creative North Star: "Precision Velocity"**
Kinetic Cobalt is a high-performance design system engineered for the intersection of artificial intelligence and human outreach. It rejects the standard "SaaS-template" look in favor of a crisp, editorial experience that values clarity, momentum, and technical sophistication. By utilizing high-contrast typography scales and intentional depth, the system directs focus toward action while maintaining an atmosphere of professional reliability.

### 2. Colors
The palette is built on a foundation of tech-focused blues and sophisticated slates, punctuated by vibrant violet accents for specialized AI-driven features.

- **The "No-Line" Rule:** Sectioning is achieved through color blocks and tonal shifts. While the login card uses an outline for focus, internal layout segments should transition from `surface` to `surface-container-low` rather than using horizontal rules.
- **Surface Hierarchy:** 
    - `background`: Used for the main canvas (#f5f7f8).
    - `surface`: Primary content containers.
    - `surface-container-low`: The default for form inputs and inactive states.
- **Signature Textures:** Interactive elements use the `primary` blue with soft glows (shadows) to simulate a "kinetic" energy.

### 3. Typography
Kinetic Cobalt uses a unified "Inter" scale that leverages extreme weight variance to create hierarchy.

- **Display & Headlines:** The system uses `2.25rem` (36px) and `1.875rem` (30px) for high-impact brand moments. These are set with `font-extrabold` and `tracking-tight` to create a dense, editorial feel.
- **Body & Labels:** Standard body text resides at `0.875rem` (14px). Labels use the same size but with `font-semibold` to ensure they are distinct from input text.
- **Iconography:** Icons are treated as typographic elements, fixed at `20px` for inline use to maintain a tight rhythmic alignment with text.

### 4. Elevation & Depth
Depth is used to signify "active" vs "passive" layers. 

- **Ambient Shadows:** The system employs a multi-tiered shadow strategy:
    - **Shadow-LG:** Used for brand identifiers (e.g., the logo icon), often paired with a color-matched tint (Primary/20%).
    - **Shadow-XL:** Reserved for the main focus container (the Login card) to lift it significantly off the background.
    - **Shadow-MD:** Used for primary call-to-action buttons to suggest tactile pressability.
- **Layering Principle:** Interactive inputs are recessed (using `surface-container-low`) while the parent container is elevated, creating a clear "field of work."

### 5. Components
- **Buttons:** Primary buttons use `primary` fill with `font-bold` and an trailing icon for directional momentum. Secondary buttons use the `surface` background with an `outline`.
- **Inputs:** Fields utilize `surface-container-low` background and an `outline` border. On focus, they transition to a 2px `primary` ring.
- **Identity Blocks:** Brand icons should be encased in a `rounded-xl` container with a color-matched glow to emphasize the "Forge" aspect of the brand.

### 6. Do's and Don'ts
- **Do:** Use tight letter-spacing on bold headlines to create a modern, high-end feel.
- **Do:** Ensure all action buttons include a subtle `active:scale-[0.98]` transition to provide tactile feedback.
- **Don't:** Use standard 1px borders to separate list items; use `surface-container` shifts instead.
- **Don't:** Mix font families. The system relies entirely on weight and size modulation within the "Inter" family to maintain a sleek, technical appearance.