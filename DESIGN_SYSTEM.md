# AnPortafolioIA Design System

## 1. Core Principles
*   **Accessibility First:** We comply with WCAG 2.1 AA. If it's not accessible, it's not done. Focus states and semantic HTML are mandatory.
*   **Material Inspired, Custom Built:** We follow Material Design 3 logic (tokens, elevation, states) but apply our own visual identity.
*   **Predictable Interactivity:** Micro-interactions (hover, active, focus) must be consistent across all elements.

## 2. Design Tokens

### Colors (Semantic)
*   **Primary (`#0B57D0`):** Main actions, active states, focus rings.
*   **Surface (`#FFFFFF` / `#F0F4F9`):** Backgrounds and cards.
*   **Outline (`#747775`):** Borders, secondary text, inactive icons.
*   **Error (`#B3261E`):** Validation failures, destructive actions.

### Typography
*   **Display:** `Google Sans` - Used for Headings (H1-H3).
*   **Body:** `Roboto` - Used for long-form text, inputs, and buttons.

### Spacing & Radius
*   **Base Unit:** 4px.
*   **Container Radius:** 24px (Large), 16px (Medium), 12px (Small).
*   **Button Radius:** Full pill (9999px).

## 3. Component Usage Rules

### Buttons (`<Button />`)
*   **Filled:** Primary action on the screen (Submit, Save). Max 1 per view container.
*   **Outlined:** Secondary actions (Cancel, Back, filters).
*   **Text:** Low priority actions (See more, navigational links).
*   **Danger:** Destructive actions. Always requires confirmation context.

### Inputs (`<Input />`)
*   Labels must always be visible (we use floating labels).
*   Error messages appear below the input with an icon.
*   `aria-invalid` is managed automatically by the component.

### Cards (`<Card />`)
*   **Elevated:** Default for content groups on the main background.
*   **Filled:** Used for distinct sections within a larger surface.
*   **Outlined:** Used when visual weight needs to be minimized.

## 4. Definition of Done (DoD) Checklist
Before merging any UI change, verify:

- [ ] **Keyboard Nav:** Can I reach and activate the element using only Tab/Enter/Space?
- [ ] **Focus Ring:** Is the focus ring visible and not cut off?
- [ ] **Contrast:** Does text meet 4.5:1 contrast ratio?
- [ ] **Responsiveness:** Does it break on 320px width?
- [ ] **Loading State:** Is there visual feedback while processing?
- [ ] **Error State:** Is the error clear and accessible (not just color)?
- [ ] **Dark Mode:** Does it look correct in dark theme (if applicable)?
