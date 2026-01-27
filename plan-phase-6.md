# Phase 6: UI Component Library

> **Status Legend:** ⬜ Pending | 🔄 In Progress | ✅ Done | ⏸️ Blocked

**Context:** Build a reusable UI component library using Radix Primitives with custom Tailwind styling. These components will be used across the dashboard, editor, and public blog. The library follows the PRD's design philosophy: minimalist, accessible, with micro-interactions.

**Dependencies:** Phase 5 Complete
**Branch:** `feature/ui-components`

---

## Overview

### Design Philosophy (from PRD)
- Custom Pint aesthetic with Linear-level design ideology
- Radix Primitives for accessible, unstyled base components
- Fully custom styling with Tailwind CSS
- Micro-interactions and animations (Framer Motion)
- Nothing hardcoded - everything is a reusable component

### Existing Setup
- Tailwind CSS configured with CSS variables
- Design tokens defined in `globals.css` (colors, fonts, border radius)
- React Hook Form already installed
- Vitest testing framework configured

---

## Task 6.0: Install Dependencies

**Status:** ⬜ Pending

**Description:**
Install Radix UI primitives, class-variance-authority for component variants, clsx/tailwind-merge for className utilities, and Framer Motion for animations.

**Commands:**
```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-avatar @radix-ui/react-separator @radix-ui/react-switch @radix-ui/react-label @radix-ui/react-slot @radix-ui/react-checkbox @radix-ui/react-popover @radix-ui/react-alert-dialog
npm install class-variance-authority clsx tailwind-merge
npm install framer-motion
npm install lucide-react
```

**Verification:**
- [ ] All packages installed without errors
- [ ] `npm run typecheck` passes
- [ ] `npm run dev` still works

---

## Task 6.1: Create Utility Functions

**Status:** ⬜ Pending

**Description:**
Create utility functions for merging Tailwind classes and common component patterns.

**Files to Create:**
- `src/lib/utils/cn.ts` - Class name utility
- `src/lib/utils/cn.test.ts` - Tests

**Implementation:**
```typescript
// src/lib/utils/cn.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Verification:**
- [ ] `cn` function correctly merges classes
- [ ] Tests pass for various class combinations

---

## Task 6.2: Button Component

**Status:** ⬜ Pending

**Description:**
Create a versatile Button component with multiple variants (default, destructive, outline, secondary, ghost, link) and sizes (sm, default, lg, icon).

**Files to Create:**
- `src/components/ui/button.tsx`
- `src/components/ui/__tests__/button.test.tsx`

**Features:**
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: sm, default, lg, icon
- Loading state with spinner
- Disabled state
- Icon support (left and right)
- `asChild` prop using Radix Slot for composition

**Verification:**
- [ ] All variants render correctly
- [ ] Loading state shows spinner and disables button
- [ ] Keyboard accessibility works
- [ ] Tests pass

---

## Task 6.3: Input Component

**Status:** ⬜ Pending

**Description:**
Create an Input component with proper styling, focus states, error states, and icon support.

**Files to Create:**
- `src/components/ui/input.tsx`
- `src/components/ui/__tests__/input.test.tsx`

**Features:**
- Text, email, password, number, search types
- Error state styling
- Disabled state
- Icon prefix/suffix support
- Proper focus ring
- Forwarded ref

**Verification:**
- [ ] Input renders with all types
- [ ] Error state shows red border
- [ ] Focus ring visible on keyboard focus
- [ ] Tests pass

---

## Task 6.4: Textarea Component

**Status:** ⬜ Pending

**Description:**
Create a Textarea component with auto-resize option and character count.

**Files to Create:**
- `src/components/ui/textarea.tsx`
- `src/components/ui/__tests__/textarea.test.tsx`

**Features:**
- Auto-resize based on content (optional)
- Character count display (optional)
- Error state
- Disabled state
- Proper focus ring

**Verification:**
- [ ] Textarea renders correctly
- [ ] Auto-resize works when enabled
- [ ] Character count displays when enabled
- [ ] Tests pass

---

## Task 6.5: Label Component

**Status:** ⬜ Pending

**Description:**
Create a Label component using Radix Label primitive with proper styling.

**Files to Create:**
- `src/components/ui/label.tsx`
- `src/components/ui/__tests__/label.test.tsx`

**Features:**
- Associated with form controls via `htmlFor`
- Required indicator (asterisk)
- Optional indicator
- Error state styling

**Verification:**
- [ ] Label associates correctly with inputs
- [ ] Required indicator shows when needed
- [ ] Tests pass

---

## Task 6.6: Select Component

**Status:** ⬜ Pending

**Description:**
Create a Select component using Radix Select primitive with custom styling.

**Files to Create:**
- `src/components/ui/select.tsx`
- `src/components/ui/__tests__/select.test.tsx`

**Exports:**
- `Select` (root)
- `SelectTrigger`
- `SelectValue`
- `SelectContent`
- `SelectItem`
- `SelectGroup`
- `SelectLabel`
- `SelectSeparator`

**Features:**
- Custom trigger styling
- Animated dropdown with Framer Motion
- Scroll indicators for long lists
- Disabled items
- Groups with labels

**Verification:**
- [ ] Select opens/closes correctly
- [ ] Keyboard navigation works (arrow keys, type-ahead)
- [ ] Selected value displays in trigger
- [ ] Tests pass

---

## Task 6.7: Checkbox Component

**Status:** ⬜ Pending

**Description:**
Create a Checkbox component using Radix Checkbox primitive.

**Files to Create:**
- `src/components/ui/checkbox.tsx`
- `src/components/ui/__tests__/checkbox.test.tsx`

**Features:**
- Checked, unchecked, indeterminate states
- Custom check icon animation
- Disabled state
- Error state

**Verification:**
- [ ] Checkbox toggles on click
- [ ] Indeterminate state works
- [ ] Animation on state change
- [ ] Tests pass

---

## Task 6.8: Switch Component

**Status:** ⬜ Pending

**Description:**
Create a Switch (toggle) component using Radix Switch primitive.

**Files to Create:**
- `src/components/ui/switch.tsx`
- `src/components/ui/__tests__/switch.test.tsx`

**Features:**
- Smooth thumb animation
- Disabled state
- Size variants (sm, default)
- Label integration

**Verification:**
- [ ] Switch toggles on click
- [ ] Animation is smooth
- [ ] Keyboard accessible
- [ ] Tests pass

---

## Task 6.9: Dialog Component

**Status:** ⬜ Pending

**Description:**
Create a Dialog (modal) component using Radix Dialog primitive with animations.

**Files to Create:**
- `src/components/ui/dialog.tsx`
- `src/components/ui/__tests__/dialog.test.tsx`

**Exports:**
- `Dialog` (root)
- `DialogTrigger`
- `DialogContent`
- `DialogHeader`
- `DialogFooter`
- `DialogTitle`
- `DialogDescription`
- `DialogClose`

**Features:**
- Animated overlay (fade)
- Animated content (scale + fade)
- Close on overlay click
- Close on Escape key
- Focus trap
- Scroll lock on body
- Responsive sizing

**Verification:**
- [ ] Dialog opens/closes with animation
- [ ] Focus trapped inside dialog
- [ ] Closes on Escape and overlay click
- [ ] Tests pass

---

## Task 6.10: Alert Dialog Component

**Status:** ⬜ Pending

**Description:**
Create an Alert Dialog component for destructive confirmations using Radix AlertDialog.

**Files to Create:**
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/__tests__/alert-dialog.test.tsx`

**Exports:**
- `AlertDialog` (root)
- `AlertDialogTrigger`
- `AlertDialogContent`
- `AlertDialogHeader`
- `AlertDialogFooter`
- `AlertDialogTitle`
- `AlertDialogDescription`
- `AlertDialogAction`
- `AlertDialogCancel`

**Features:**
- Same animations as Dialog
- Cancel/Action button styling
- No close on overlay click (requires explicit action)

**Verification:**
- [ ] Alert dialog requires explicit action
- [ ] Cancel button has secondary styling
- [ ] Action button can be destructive
- [ ] Tests pass

---

## Task 6.11: Dropdown Menu Component

**Status:** ⬜ Pending

**Description:**
Create a Dropdown Menu component using Radix DropdownMenu primitive.

**Files to Create:**
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/__tests__/dropdown-menu.test.tsx`

**Exports:**
- `DropdownMenu`
- `DropdownMenuTrigger`
- `DropdownMenuContent`
- `DropdownMenuItem`
- `DropdownMenuCheckboxItem`
- `DropdownMenuRadioItem`
- `DropdownMenuRadioGroup`
- `DropdownMenuLabel`
- `DropdownMenuSeparator`
- `DropdownMenuShortcut`
- `DropdownMenuSub`
- `DropdownMenuSubTrigger`
- `DropdownMenuSubContent`

**Features:**
- Animated open/close
- Keyboard navigation
- Checkbox and radio items
- Submenus
- Shortcut display
- Icons support

**Verification:**
- [ ] Menu opens on trigger click
- [ ] Keyboard navigation works
- [ ] Submenus work correctly
- [ ] Tests pass

---

## Task 6.12: Popover Component

**Status:** ⬜ Pending

**Description:**
Create a Popover component using Radix Popover primitive for tooltips and floating content.

**Files to Create:**
- `src/components/ui/popover.tsx`
- `src/components/ui/__tests__/popover.test.tsx`

**Exports:**
- `Popover`
- `PopoverTrigger`
- `PopoverContent`
- `PopoverAnchor`

**Features:**
- Positioning (top, right, bottom, left)
- Alignment (start, center, end)
- Arrow
- Animated open/close
- Close on outside click

**Verification:**
- [ ] Popover positions correctly
- [ ] Animation works
- [ ] Closes on outside click
- [ ] Tests pass

---

## Task 6.13: Tooltip Component

**Status:** ⬜ Pending

**Description:**
Create a Tooltip component using Radix Tooltip primitive.

**Files to Create:**
- `src/components/ui/tooltip.tsx`
- `src/components/ui/__tests__/tooltip.test.tsx`

**Exports:**
- `TooltipProvider`
- `Tooltip`
- `TooltipTrigger`
- `TooltipContent`

**Features:**
- Delay before show (default 200ms)
- Positioning
- Animated fade in/out
- Skip delay on sequential tooltips

**Verification:**
- [ ] Tooltip shows on hover after delay
- [ ] Positions correctly
- [ ] Works with keyboard focus
- [ ] Tests pass

---

## Task 6.14: Tabs Component

**Status:** ⬜ Pending

**Description:**
Create a Tabs component using Radix Tabs primitive.

**Files to Create:**
- `src/components/ui/tabs.tsx`
- `src/components/ui/__tests__/tabs.test.tsx`

**Exports:**
- `Tabs`
- `TabsList`
- `TabsTrigger`
- `TabsContent`

**Features:**
- Underline style tabs
- Animated indicator
- Keyboard navigation
- Disabled tabs

**Verification:**
- [ ] Tab switching works
- [ ] Keyboard navigation (arrow keys)
- [ ] Content changes on tab switch
- [ ] Tests pass

---

## Task 6.15: Card Component

**Status:** ⬜ Pending

**Description:**
Create a Card component for containing related content.

**Files to Create:**
- `src/components/ui/card.tsx`
- `src/components/ui/__tests__/card.test.tsx`

**Exports:**
- `Card`
- `CardHeader`
- `CardTitle`
- `CardDescription`
- `CardContent`
- `CardFooter`

**Features:**
- Border and shadow variants
- Hover state (optional)
- Clickable card variant

**Verification:**
- [ ] Card renders with proper spacing
- [ ] All subcomponents compose correctly
- [ ] Tests pass

---

## Task 6.16: Badge Component

**Status:** ⬜ Pending

**Description:**
Create a Badge component for status indicators and tags.

**Files to Create:**
- `src/components/ui/badge.tsx`
- `src/components/ui/__tests__/badge.test.tsx`

**Features:**
- Variants: default, secondary, destructive, outline, success, warning
- Sizes: sm, default
- Dot indicator (optional)
- Removable (with X button)

**Verification:**
- [ ] All variants render correctly
- [ ] Removable badge shows X and fires callback
- [ ] Tests pass

---

## Task 6.17: Avatar Component

**Status:** ⬜ Pending

**Description:**
Create an Avatar component using Radix Avatar primitive.

**Files to Create:**
- `src/components/ui/avatar.tsx`
- `src/components/ui/__tests__/avatar.test.tsx`

**Exports:**
- `Avatar`
- `AvatarImage`
- `AvatarFallback`

**Features:**
- Image with fallback
- Fallback shows initials or icon
- Size variants (sm, default, lg)
- Border/ring option

**Verification:**
- [ ] Image loads correctly
- [ ] Fallback shows when image fails
- [ ] Tests pass

---

## Task 6.18: Separator Component

**Status:** ⬜ Pending

**Description:**
Create a Separator component using Radix Separator primitive.

**Files to Create:**
- `src/components/ui/separator.tsx`
- `src/components/ui/__tests__/separator.test.tsx`

**Features:**
- Horizontal and vertical orientations
- Decorative (visual only) by default
- Optional label in center

**Verification:**
- [ ] Both orientations work
- [ ] Proper ARIA role
- [ ] Tests pass

---

## Task 6.19: Spinner & Skeleton Components

**Status:** ⬜ Pending

**Description:**
Create loading state components: Spinner (animated) and Skeleton (placeholder).

**Files to Create:**
- `src/components/ui/spinner.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/__tests__/spinner.test.tsx`
- `src/components/ui/__tests__/skeleton.test.tsx`

**Spinner Features:**
- Size variants (sm, default, lg)
- Color variants (default, primary, muted)
- CSS animation (no Framer Motion dependency)

**Skeleton Features:**
- Pulse animation
- Various shapes (text, circle, rectangle)
- Customizable dimensions

**Verification:**
- [ ] Spinner animates
- [ ] Skeleton has pulse effect
- [ ] Tests pass

---

## Task 6.20: Toast Component

**Status:** ⬜ Pending

**Description:**
Create a Toast notification system for success/error/info messages.

**Files to Create:**
- `src/components/ui/toast.tsx`
- `src/components/ui/toaster.tsx`
- `src/components/ui/use-toast.ts`
- `src/components/ui/__tests__/toast.test.tsx`

**Features:**
- Variants: default, success, error, warning
- Auto-dismiss with configurable duration
- Manual dismiss with X button
- Stack multiple toasts
- Slide in animation
- Action button (optional)
- Hook: `useToast()` for triggering toasts

**Exports:**
- `Toast`
- `ToastProvider`
- `Toaster`
- `useToast` hook
- `toast` function

**Verification:**
- [ ] Toast appears and auto-dismisses
- [ ] Multiple toasts stack
- [ ] Manual dismiss works
- [ ] Tests pass

---

## Task 6.21: Form Components Integration

**Status:** ⬜ Pending

**Description:**
Create form wrapper components that integrate with React Hook Form.

**Files to Create:**
- `src/components/ui/form.tsx`
- `src/components/ui/__tests__/form.test.tsx`

**Exports:**
- `Form` (FormProvider wrapper)
- `FormField`
- `FormItem`
- `FormLabel`
- `FormControl`
- `FormDescription`
- `FormMessage`
- `useFormField` hook

**Features:**
- Connects to React Hook Form context
- Automatic error message display
- Proper ARIA attributes for accessibility
- Works with all input components

**Verification:**
- [ ] Form fields connect to React Hook Form
- [ ] Validation errors display
- [ ] Accessibility attributes present
- [ ] Tests pass

---

## Task 6.22: Component Index & Documentation

**Status:** ⬜ Pending

**Description:**
Create barrel exports and basic usage documentation.

**Files to Create:**
- `src/components/ui/index.ts` - Barrel exports for all components
- `src/components/ui/README.md` - Component documentation

**Index Contents:**
Export all components from single entry point for clean imports:
```typescript
export * from './button'
export * from './input'
export * from './textarea'
// ... etc
```

**Documentation:**
- List of all components
- Basic usage examples
- Available props/variants for each

**Verification:**
- [ ] All components exportable from `@/components/ui`
- [ ] No circular dependencies
- [ ] TypeScript types work correctly

---

## Task 6.23: Visual Testing & Polish

**Status:** ⬜ Pending

**Description:**
Create a component showcase page (dev only) and ensure all components work together.

**Files to Create:**
- `src/app/(dashboard)/dev/components/page.tsx` - Component showcase (dev only)

**Features:**
- Display all components with variants
- Test dark/light mode
- Test keyboard navigation
- Verify animations are smooth

**Verification:**
- [ ] All components visible on showcase page
- [ ] Dark mode works correctly
- [ ] Animations are smooth
- [ ] No visual regressions

---

## Task 6.24: Final Testing & Cleanup

**Status:** ⬜ Pending

**Description:**
Run full test suite, fix any issues, and prepare for PR.

**Verification:**
- [ ] `npm run test:run` - All tests pass
- [ ] `npm run typecheck` - No TypeScript errors
- [ ] `npm run lint` - No ESLint errors
- [ ] `npm run build` - Build succeeds
- [ ] Remove dev-only showcase page or guard with env check
- [ ] Update `session-summary.md` with Phase 6 completion
- [ ] Update `changelog.md` with Phase 6 changes
- [ ] Update `plan.md` to mark Phase 6 as complete

---

## Summary

### Components to Create (23 total)

| Category | Components |
|----------|------------|
| **Primitives** | Button, Input, Textarea, Label, Checkbox, Switch, Separator |
| **Selection** | Select, Dropdown Menu |
| **Overlays** | Dialog, Alert Dialog, Popover, Tooltip |
| **Navigation** | Tabs |
| **Display** | Card, Badge, Avatar |
| **Feedback** | Spinner, Skeleton, Toast |
| **Forms** | Form (RHF integration) |
| **Utilities** | cn() helper |

### Dependencies to Install

```bash
# Radix UI Primitives
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
@radix-ui/react-select
@radix-ui/react-tabs
@radix-ui/react-tooltip
@radix-ui/react-avatar
@radix-ui/react-separator
@radix-ui/react-switch
@radix-ui/react-label
@radix-ui/react-slot
@radix-ui/react-checkbox
@radix-ui/react-popover
@radix-ui/react-alert-dialog

# Utilities
class-variance-authority
clsx
tailwind-merge

# Animations
framer-motion

# Icons
lucide-react
```

### Estimated Test Count

- ~5-10 tests per component
- ~25 components
- **Estimated: 150-250 new tests**

---

## Commands Reference

```bash
npm run dev          # Start dev server
npm run test         # Run tests (watch mode)
npm run test:run     # Run tests (single)
npm run typecheck    # TypeScript check
npm run lint         # ESLint check
npm run build        # Production build
```

---

*Last Updated: January 2026*
