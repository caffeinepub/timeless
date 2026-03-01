# Specification

## Summary
**Goal:** Fix the infinite game initialization loop, apply a James Bond spy-thriller visual theme across all UI, and set the Die Hard theme as the default background music track.

**Planned changes:**
- Fix `useGameInitialization` hook so all stage callbacks (canvas, physics, arena, player, enemies) fire reliably, progress advances past 20% to 100%, retries are capped, and the error fallback UI is shown on failure instead of spinning forever
- Apply a James Bond visual theme: black/charcoal/deep grey palette with gold/champagne accents, elegant cinematic typography, gold-accented HUD elements, Bond-style loading title card, and gun-sight styled crosshair
- Update `index.css`, `game-theme.css`, and `tailwind.config.js` to use a black/charcoal/gold OKLCH color palette as the sole theme, removing any blue or off-brand colors
- Set the Die Hard synthesized track as the default/primary music in `useBackgroundMusic.ts`; keep the Bond track as an alternate; display the active track name clearly in the HUD mute button

**User-visible outcome:** The game loads fully without getting stuck at 20%, presents a sleek James Bond-inspired UI throughout, and starts playing the Die Hard theme automatically on game start.
