# ⌨️ Keyboard Shortcuts Reference

Quick reference guide for all keyboard shortcuts in the Finloom Trading Terminal.

---

## Trading Shortcuts

| Key | Action | Description |
|-----|--------|-------------|
| **B** | Quick Buy | Focus on Buy action / Quick buy flow |
| **S** | Quick Sell | Focus on Sell action / Quick sell flow |
| **ESC** | Close | Close all open modals and dialogs |
| **Ctrl+Q** | Square Off All | Emergency close all open positions |
| **R** | Refresh | Refresh all trading data |

---

## Detailed Actions

### B - Quick Buy
- **When:** Anytime on trading page
- **Action:** Triggers quick buy notification
- **Use Case:** Fast entry for buy orders
- **Note:** Won't trigger if typing in input fields

### S - Quick Sell
- **When:** Anytime on trading page
- **Action:** Triggers quick sell notification
- **Use Case:** Fast entry for sell orders
- **Note:** Won't trigger if typing in input fields

### ESC - Close Modals
- **When:** Any modal is open
- **Action:** Closes:
  - Risk Guardrails modal
  - My Open Trades modal
  - Order Confirmation dialog
- **Use Case:** Quick exit from dialogs
- **Note:** Standard escape behavior

### Ctrl+Q - Square Off All
- **When:** Have open positions
- **Action:** Closes all open trades
- **Use Case:** Emergency exit / End of day
- **Note:** Shows confirmation before executing
- **Warning:** ⚠️ Use with caution!

### R - Refresh Data
- **When:** Anytime on trading page
- **Action:** Refreshes:
  - Trading summary
  - Open positions
  - Chart data
  - Account metrics
- **Use Case:** Get latest data
- **Note:** Shows loading indicator

---

## Smart Features

### Input Detection
- ✅ Shortcuts disabled when typing in:
  - Order quantity input
  - Search scrip input
  - Any text field or textarea

### Active Indicator
- Visual chip in header shows "⌨️ Shortcuts Active"
- Tooltip on hover shows all available shortcuts

### Conditional Activation
- Shortcuts only work when challenge is ACTIVE
- Disabled during loading states
- Disabled when submitting orders

---

## Usage Tips

### For Speed Trading
1. Use **B** / **S** for quick order entry
2. Use preset quantity buttons (10, 25, 50, 100)
3. Confirm with Enter or click

### For Risk Management
1. Monitor Risk Dashboard (always visible)
2. Use **Ctrl+Q** for emergency exits
3. Individual square off from "My Open Trades"

### For Data Freshness
1. Use **R** frequently for latest prices
2. Chart auto-refreshes every 5 seconds
3. Manual refresh when needed

---

## Keyboard Shortcut Comparison

### Traditional Trading Platforms
```
Bloomberg Terminal:
- F1-F12: Various functions
- Ctrl+S: Save
- Complex multi-key combinations

Zerodha Kite:
- B: Buy
- S: Sell
- X: Exit position
- H: Holdings
```

### Finloom (Our Platform)
```
✨ Simplified & Intuitive:
- B: Buy (same as Kite)
- S: Sell (same as Kite)  
- ESC: Close (universal)
- Ctrl+Q: Square Off All (emergency)
- R: Refresh (common pattern)
```

**Philosophy:** Keep it simple, keep it familiar

---

## Future Enhancements (Planned)

### Coming Soon
- [ ] **Ctrl+B** - Buy market order instantly
- [ ] **Ctrl+S** - Sell market order instantly
- [ ] **Shift+B** - Buy limit order
- [ ] **Shift+S** - Sell limit order
- [ ] **Ctrl+H** - Toggle holdings view
- [ ] **Ctrl+P** - Toggle positions view
- [ ] **Ctrl+O** - Toggle orders view
- [ ] **Ctrl+M** - Toggle market watch
- [ ] **Ctrl+,** - Open settings
- [ ] **Ctrl+/** - Show all shortcuts

### Advanced Features (Future)
- [ ] Number keys for quick quantity (1-9)
- [ ] Arrow keys for scrip navigation
- [ ] Tab for focus management
- [ ] Custom shortcut configuration

---

## Accessibility

### Keyboard-Only Navigation
- All shortcuts work without mouse
- Modal dialogs have keyboard focus
- Tab order is logical
- Enter confirms, ESC cancels

### Screen Reader Support
- All shortcuts announced
- Button labels clear
- Status updates communicated

---

## Troubleshooting

### Shortcuts Not Working?

**Check:**
1. ✅ Challenge is ACTIVE (not PENDING/FAILED)
2. ✅ Not typing in input field
3. ✅ No other modals blocking
4. ✅ Browser window is focused
5. ✅ No browser extension conflicts

**Common Issues:**
- **Ctrl+Q blocked:** Browser may intercept (try Cmd+Q on Mac)
- **R not working:** Browser might refresh page (working on fix)
- **ESC doesn't close:** Check if nested modals exist

**Solutions:**
- Clear browser cache
- Disable conflicting extensions
- Use latest Chrome/Firefox/Edge
- Check console for errors

---

## Platform-Specific Notes

### Windows
- Use **Ctrl** key for combinations
- All shortcuts work as documented

### Mac
- Use **Cmd** instead of **Ctrl** for Mac
- **Cmd+Q** for Square Off All
- Native shortcuts still work (Cmd+R, Cmd+W)

### Linux
- Use **Ctrl** key (same as Windows)
- Most distros supported
- Check for window manager conflicts

---

## Best Practices

### DO:
✅ Learn shortcuts gradually  
✅ Use for frequent actions  
✅ Combine with mouse when needed  
✅ Check active indicator  
✅ Practice in demo mode first  

### DON'T:
❌ Spam shortcuts rapidly  
❌ Use Ctrl+Q without thinking  
❌ Ignore confirmation dialogs  
❌ Forget about mouse users  
❌ Assume all shortcuts work globally  

---

## Quick Reference Card

```
┌─────────────────────────────────────┐
│   FINLOOM TRADING SHORTCUTS        │
├─────────────────────────────────────┤
│                                     │
│  B         →  Quick Buy            │
│  S         →  Quick Sell           │
│  ESC       →  Close Modals         │
│  Ctrl+Q    →  Square Off All ⚠️    │
│  R         →  Refresh Data         │
│                                     │
│  Pro Tip: Watch the ⌨️ indicator   │
│                                     │
└─────────────────────────────────────┘
```

---

## Integration Details

### Implementation
- **File:** `src/hooks/useKeyboardShortcuts.ts`
- **Used In:** `src/app/dashboard/user/trading/page.tsx`
- **Dependencies:** None (pure React)
- **Size:** <2KB

### Technical Details
```typescript
// Hook signature
useKeyboardShortcuts({
  onBuy: () => void,
  onSell: () => void,
  onEscape: () => void,
  onSquareOffAll: () => void,
  onRefresh: () => void,
  enabled: boolean,
});
```

### Event Handling
- Uses `keydown` events
- Cleans up on unmount
- Prevents event bubbling
- Respects form inputs

---

## Feedback

Found a shortcut conflict or have suggestions?
- Check if it's a browser conflict first
- Test in incognito mode
- Report via support with:
  - Operating System
  - Browser version
  - Conflicting key
  - Expected behavior

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Supported Browsers:** Chrome, Firefox, Edge, Safari  
**Status:** ✅ Production Ready
