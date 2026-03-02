# Specification

## Summary
**Goal:** Revert the opening loading screen to its original Bond-themed animation and add a controls reference panel to the start/mission screen.

**Planned changes:**
- Restore the `InitialLoadingScreen` component to the original gun barrel Bond-themed animation, removing any extended timing or duration modifications from recent versions
- Restore the original minimum display time, scan-line overlay, progress bar, and corner accent decorations
- Restore the original transition behavior from the loading screen to the start/mission page
- Add a controls reference panel to the start/mission screen listing all player keybindings (WASD movement, mouse aim/shoot, Space to jump/interact, and other relevant bindings)
- Style the controls panel consistently with the existing black, charcoal, and gold James Bond / Die Hard theme
- Ensure the controls panel does not obstruct the "Begin Mission" button and remains readable at desktop resolutions

**User-visible outcome:** Players will see the original Bond-themed gun barrel loading animation on startup, then land on the start screen where a clearly styled controls panel shows all keybindings before they begin the mission.
