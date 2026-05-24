# Brand Token Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `src/constants/colors.ts` as the single source of truth for brand hex values and replace duplicated local constants in 7 screen files.

**Architecture:** One new file exports a `Colors` object. Each screen file drops its local color block and imports `Colors` instead. Zero behavior change — pure constant extraction.

**Tech Stack:** TypeScript, React Native, Expo Router

---

## File Map

| Action | File | Change |
|--------|------|--------|
| CREATE | `src/constants/colors.ts` | New shared token file |
| MODIFY | `app/(tabs)/index.tsx` | Remove 9 local constants, import Colors |
| MODIFY | `app/(tabs)/timeline.tsx` | Remove 9 local constants, import Colors |
| MODIFY | `app/(tabs)/concierge.tsx` | Remove 8 local constants, import Colors |
| MODIFY | `app/(tabs)/chat.tsx` | Remove 6 local constants, import Colors |
| MODIFY | `app/(tabs)/profile.tsx` | Remove 6 local constants, import Colors |
| MODIFY | `app/record.tsx` | Remove 6 local constants, import Colors |
| MODIFY | `app/(auth)/sign-in.tsx` | Remove 2 local constants, import Colors |
| SKIP   | `app/(auth)/sign-up.tsx` | Uses different hex values — leave local |

> **Note on sign-up.tsx:** It uses `AMBER = "#D4A853"` and `INK = "#2C1F0E"` which differ from the shared palette. Do not touch it in this task — flag as a design inconsistency to resolve later.

---

## Mapping: local name → Colors key

| Local name (various files) | Colors key | Value |
|---------------------------|-----------|-------|
| AMBER | Colors.amber | `"#D27F14"` |
| AMBER_DEEP | Colors.amberDeep | `"#B06600"` |
| INK / TEXT (record.tsx) | Colors.ink | `"#2D241A"` |
| INK_SOFT | Colors.inkSoft | `"#4A3D2E"` |
| INK_MUTED / MUTED (record.tsx) | Colors.inkMuted | `"#8A7A66"` |
| CREAM / CREAM_PAPER (concierge) | Colors.cream | `"#FAF3E2"` |
| SAGE_DEEP | Colors.sageDeep | `"#6F8564"` |
| SAGE | Colors.sage | `"#9CAF88"` |
| BG (concierge, record, chat) | Colors.bg | `"#F5EDDF"` |
| TERRA (profile) | Colors.terra | `"#B86241"` |
| RULE (index, timeline) | Colors.rule | `"rgba(74,47,24,0.14)"` |

> **Keep local** (screen-specific or inconsistent across files):
> - `RULE` variants in record (`rgba(74,61,46,0.18)`), chat (`rgba(184,132,60,0.22)`), sign-in (`rgba(74,47,24,0.35)`) — keep local
> - `PAPER` in index/timeline (`#FBF4DC`) vs profile (`#FFFAF0`) — keep local
> - `TERRA` / `TERRA_BTN` in record (`#8B4226` / `#6E3218`) — keep local (different from profile's TERRA)
> - `BG = "#1A1108"` in sign-in — keep local (dark screen)
> - `CARD_BG`, `CHIP_ON_BG`, `CHIP_OFF_BG` in record — keep local
> - `WHITE`, `AV_AMBER`, `AV_SAGE`, `AV_INK` in chat — keep local

---

## Task 1: Create `src/constants/colors.ts`

**Files:**
- Create: `src/constants/colors.ts`

- [ ] **Step 1: Create the file**

```ts
export const Colors = {
  amber:     "#D27F14",
  amberDeep: "#B06600",
  ink:       "#2D241A",
  inkSoft:   "#4A3D2E",
  inkMuted:  "#8A7A66",
  cream:     "#FAF3E2",
  sageDeep:  "#6F8564",
  sage:      "#9CAF88",
  bg:        "#F5EDDF",
  terra:     "#B86241",
  rule:      "rgba(74,47,24,0.14)",
} as const;
```

- [ ] **Step 2: Verify TypeScript is happy**

```powershell
npm run typecheck
```
Expected: no errors related to `colors.ts`

- [ ] **Step 3: Commit**

```bash
git add src/constants/colors.ts
git commit -m "feat: add shared brand token file src/constants/colors.ts"
```

---

## Task 2: Update `app/(tabs)/index.tsx`

**Files:**
- Modify: `app/(tabs)/index.tsx` (lines 9–17, remove local constants)

- [ ] **Step 1: Replace local color block with import**

Remove these lines at the top of the file (after the existing imports):
```ts
const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const CREAM = "#FAF3E2";
const PAPER = "#FBF4DC";
const SAGE_DEEP = "#6F8564";
const RULE = "rgba(74,47,24,0.14)";
```

Add this import after the existing import block:
```ts
import { Colors } from "../../src/constants/colors";
```

Then replace all usages in the file:
| Find | Replace |
|------|---------|
| `AMBER` | `Colors.amber` |
| `AMBER_DEEP` | `Colors.amberDeep` |
| `INK` | `Colors.ink` |
| `INK_SOFT` | `Colors.inkSoft` |
| `INK_MUTED` | `Colors.inkMuted` |
| `CREAM` | `Colors.cream` |
| `SAGE_DEEP` | `Colors.sageDeep` |
| `RULE` | `Colors.rule` |

> `PAPER` (`"#FBF4DC"`) is used only in this file's `SuggestRow` background. Keep it as a local constant since it differs from profile's PAPER.

- [ ] **Step 2: Typecheck**

```powershell
npm run typecheck
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "refactor: use Colors tokens in HomeScreen"
```

---

## Task 3: Update `app/(tabs)/timeline.tsx`

**Files:**
- Modify: `app/(tabs)/timeline.tsx` (lines 7–15, remove local constants)

- [ ] **Step 1: Replace local color block with import**

Remove these lines:
```ts
const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const CREAM = "#FAF3E2";
const PAPER = "#FBF4DC";
const SAGE_DEEP = "#6F8564";
const RULE = "rgba(74,47,24,0.14)";
```

Add import:
```ts
import { Colors } from "../../src/constants/colors";
```

Replace all usages:
| Find | Replace |
|------|---------|
| `AMBER` | `Colors.amber` |
| `AMBER_DEEP` | `Colors.amberDeep` |
| `INK` | `Colors.ink` |
| `INK_SOFT` | `Colors.inkSoft` |
| `INK_MUTED` | `Colors.inkMuted` |
| `CREAM` | `Colors.cream` |
| `SAGE_DEEP` | `Colors.sageDeep` |
| `RULE` | `Colors.rule` |

> Keep `PAPER = "#FBF4DC"` as a local const (same reason as index.tsx).

- [ ] **Step 2: Typecheck**

```powershell
npm run typecheck
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/timeline.tsx"
git commit -m "refactor: use Colors tokens in TimelineScreen"
```

---

## Task 4: Update `app/(tabs)/concierge.tsx`

**Files:**
- Modify: `app/(tabs)/concierge.tsx` (lines 13–24, remove local constants)

- [ ] **Step 1: Replace local color block with import**

Remove these lines:
```ts
const BG = "#F5EDDF";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
const CREAM_PAPER = "#FAF3E2";
const SAGE = "#9CAF88";
const SAGE_DEEP = "#6F8564";
const RULE = "rgba(74,47,24,0.14)";
```

Add import:
```ts
import { Colors } from "../../src/constants/colors";
```

Replace all usages:
| Find | Replace |
|------|---------|
| `BG` | `Colors.bg` |
| `INK` | `Colors.ink` |
| `INK_SOFT` | `Colors.inkSoft` |
| `INK_MUTED` | `Colors.inkMuted` |
| `AMBER` | `Colors.amber` |
| `AMBER_DEEP` | `Colors.amberDeep` |
| `CREAM_PAPER` | `Colors.cream` |
| `SAGE` | `Colors.sage` |
| `SAGE_DEEP` | `Colors.sageDeep` |
| `RULE` | `Colors.rule` |

- [ ] **Step 2: Typecheck**

```powershell
npm run typecheck
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/concierge.tsx"
git commit -m "refactor: use Colors tokens in ConciergeScreen"
```

---

## Task 5: Update `app/(tabs)/chat.tsx`

**Files:**
- Modify: `app/(tabs)/chat.tsx` (lines 17–30, remove local constants)

- [ ] **Step 1: Replace local color block with import**

Remove these lines:
```ts
const BG = "#F5EDDF";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
```

Add import:
```ts
import { Colors } from "../../src/constants/colors";
```

Replace usages:
| Find | Replace |
|------|---------|
| `BG` | `Colors.bg` |
| `INK` | `Colors.ink` |
| `INK_SOFT` | `Colors.inkSoft` |
| `INK_MUTED` | `Colors.inkMuted` |
| `AMBER` | `Colors.amber` |
| `AMBER_DEEP` | `Colors.amberDeep` |

> Keep local: `CREAM_PAPER = "rgba(255,250,232,0.85)"` (transparent variant, not the same as Colors.cream), `RULE = "rgba(184,132,60,0.22)"` (amber-tinted, different), `WHITE = "#FFFFFF"`, `AV_AMBER`, `AV_SAGE`, `AV_INK`.

- [ ] **Step 2: Typecheck**

```powershell
npm run typecheck
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/chat.tsx"
git commit -m "refactor: use Colors tokens in ChatScreen"
```

---

## Task 6: Update `app/(tabs)/profile.tsx`

**Files:**
- Modify: `app/(tabs)/profile.tsx` (lines 8–17, remove local constants)

- [ ] **Step 1: Replace local color block with import**

Remove these lines:
```ts
const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const CREAM = "#FAF3E2";
const TERRA = "#B86241";
```

Add import:
```ts
import { Colors } from "../../src/constants/colors";
```

Replace usages:
| Find | Replace |
|------|---------|
| `AMBER` | `Colors.amber` |
| `AMBER_DEEP` | `Colors.amberDeep` |
| `INK` | `Colors.ink` |
| `INK_SOFT` | `Colors.inkSoft` |
| `INK_MUTED` | `Colors.inkMuted` |
| `CREAM` | `Colors.cream` |
| `TERRA` | `Colors.terra` |

> Keep local: `PAPER = "#FFFAF0"` and `PARCHMENT = "#FBF2DD"` (unique to this screen).

- [ ] **Step 2: Typecheck**

```powershell
npm run typecheck
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/profile.tsx"
git commit -m "refactor: use Colors tokens in ProfileScreen"
```

---

## Task 7: Update `app/record.tsx`

**Files:**
- Modify: `app/record.tsx` (lines 29–44, remove local constants)

- [ ] **Step 1: Replace local color block with import**

Remove these lines:
```ts
const BG = "#F5EDDF";
const CREAM = "#FAF3E2";
const TEXT = "#2D241A";
const INK_SOFT = "#4A3D2E";
const MUTED = "#8A7A66";
const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
```

Add import:
```ts
import { Colors } from "../src/constants/colors";
```

Replace usages:
| Find | Replace |
|------|---------|
| `BG` | `Colors.bg` |
| `CREAM` | `Colors.cream` |
| `TEXT` | `Colors.ink` |
| `INK_SOFT` | `Colors.inkSoft` |
| `MUTED` | `Colors.inkMuted` |
| `AMBER` | `Colors.amber` |
| `AMBER_DEEP` | `Colors.amberDeep` |

> Keep local: `RULE = "rgba(74,61,46,0.18)"` (different opacity), `CHIP_ON_BG`, `CHIP_ON_BORDER`, `CHIP_OFF_BG`, `CHIP_OFF_BORDER`, `CARD_BG = "#FFFFFF"`, `TERRA = "#8B4226"`, `TERRA_BTN = "#6E3218"`.

- [ ] **Step 2: Typecheck**

```powershell
npm run typecheck
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/record.tsx
git commit -m "refactor: use Colors tokens in RecordScreen"
```

---

## Task 8: Update `app/(auth)/sign-in.tsx`

**Files:**
- Modify: `app/(auth)/sign-in.tsx` (lines 17–23, remove local constants)

- [ ] **Step 1: Replace local color block with import**

Remove these lines:
```ts
const AMBER = "#D27F14";
const CREAM = "#FAF3E2";
```

Add import:
```ts
import { Colors } from "../../src/constants/colors";
```

Replace usages:
| Find | Replace |
|------|---------|
| `AMBER` | `Colors.amber` |
| `CREAM` | `Colors.cream` |

> Keep local: `BG = "#1A1108"` (dark screen bg), `CREAM_DIM = "rgba(250,243,226,0.78)"` (opacity variant), `RULE = "rgba(74,47,24,0.35)"` (different opacity), `INPUT_BG`, `ERROR`.

- [ ] **Step 2: Typecheck**

```powershell
npm run typecheck
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add "app/(auth)/sign-in.tsx"
git commit -m "refactor: use Colors tokens in SignInScreen"
```

---

## Task 9: Final typecheck and summary commit

- [ ] **Step 1: Full typecheck**

```powershell
npm run typecheck
```
Expected: 0 errors

- [ ] **Step 2: Verify app starts**

```powershell
npm start
```
Open in Expo Go — all screens should look identical to before. No visual changes expected.

- [ ] **Step 3: Note design inconsistency for follow-up**

`app/(auth)/sign-up.tsx` uses `AMBER = "#D4A853"` and `INK = "#2C1F0E"` which are slightly different from the shared palette. This is a design issue to resolve in a later pass — do not change sign-up.tsx in this task.
