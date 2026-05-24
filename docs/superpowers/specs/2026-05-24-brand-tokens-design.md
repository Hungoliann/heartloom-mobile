# Design: Shared Brand Token File

**Date:** 2026-05-24  
**Scope:** Bullet 1 of codebase cleanup — eliminate duplicated hex constants  
**Status:** Approved

## Problem

Every screen in the app declares the same ~8–12 hex color constants at the top of the file:

```ts
const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
const INK = "#2D241A";
// ...repeated in 8+ files
```

This means a single color change requires editing every screen. There is no single source of truth.

## Solution

Extract all shared brand constants into `src/constants/colors.ts`. Screens import from this file instead of declaring their own.

## New File: `src/constants/colors.ts`

```ts
export const Colors = {
  amber:     "#D27F14",
  amberDeep: "#B06600",
  ink:       "#2D241A",
  inkSoft:   "#4A3D2E",
  inkMuted:  "#8A7A66",
  cream:     "#FAF3E2",
  paper:     "#FBF4DC",
  sageDeep:  "#6F8564",
  sage:      "#9CAF88",
  terra:     "#B86241",
  rule:      "rgba(74,47,24,0.14)",
  bg:        "#F5EDDF",
} as const;
```

`as const` ensures TypeScript infers literal types (e.g. `"#D27F14"` not `string`), which satisfies React Native's style type system without casting.

## Files to Update

| File | Local constants to remove |
|------|--------------------------|
| `app/(tabs)/index.tsx` | AMBER, AMBER_DEEP, INK, INK_SOFT, INK_MUTED, CREAM, PAPER, SAGE_DEEP, RULE |
| `app/(tabs)/timeline.tsx` | Same set |
| `app/(tabs)/concierge.tsx` | BG, INK, INK_SOFT, INK_MUTED, AMBER, AMBER_DEEP, CREAM_PAPER, SAGE, SAGE_DEEP, RULE |
| `app/(tabs)/chat.tsx` | BG, INK, INK_SOFT, INK_MUTED, AMBER, AMBER_DEEP, CREAM_PAPER, RULE |
| `app/(tabs)/profile.tsx` | AMBER, AMBER_DEEP, INK, INK_SOFT, INK_MUTED, CREAM, PAPER, TERRA |
| `app/record.tsx` | BG, CREAM, TEXT(=INK), INK_SOFT, MUTED(=INK_MUTED), AMBER, AMBER_DEEP, RULE, TERRA |
| `app/(auth)/sign-in.tsx` | AMBER, CREAM, RULE |
| `app/(auth)/sign-up.tsx` | AMBER, CREAM, RULE (to verify on read) |

## Import Pattern

```ts
import { Colors } from "@/src/constants/colors";
// Usage:
backgroundColor: Colors.amber
```

## Constraints

- Zero behavior change — pure constant extraction
- No Tailwind config changes
- Screen-unique one-off values (e.g. `BG = "#1A1108"` on sign-in dark screen) stay local
- `record.tsx` uses `TEXT` as an alias for ink — map to `Colors.ink`

## Out of Scope

- NativeWind / Tailwind alignment (separate bullet)
- Typography tokens
- Spacing tokens
