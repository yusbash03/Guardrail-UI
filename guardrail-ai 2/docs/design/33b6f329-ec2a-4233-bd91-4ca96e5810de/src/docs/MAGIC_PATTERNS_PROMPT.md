# Magic Patterns Brief — Guardrail AI

Paste **Section 1 (Master prompt)** into Magic Patterns first to set up the design. Then generate the screens one at a time with the prompts in **Section 3**. Every number below is from the demo scenario, so the UI matches the live product.

Source of truth: FRONTEND_SPECIFICATION.md and DESIGN_SYSTEM.md. If this brief and those docs disagree, the specs win.

---

## 1. Master prompt (paste first)

```
Design a premium consumer fintech web app called "Guardrail AI" — tagline "Your money. Your rules. Your AI."
Users set spending rules, then let an AI shopping assistant build carts. A deterministic policy engine decides
ALLOWED / REQUIRES APPROVAL / BLOCKED. The user approves the exact cart with their password and pays with PayPal.

Tech: React + TypeScript, Tailwind CSS, shadcn/ui components, Lucide icons, Recharts for charts,
AG Grid Community for dense tables. Responsive: desktop (≥1024px) and mobile (360px).

Feel: calm, precise, trustworthy — like a modern banking app. Lots of whitespace, soft cards,
subtle borders, tabular numbers for all money. Light and dark mode.

Colours (HSL):
- background 220 20% 98% (dark: 222 30% 7%), card white (dark: 222 25% 10%)
- text 222 30% 12% (dark: 210 20% 96%), muted text 220 10% 42%
- primary indigo 243 75% 58%; accent teal 168 70% 38% (money remaining / positive)
- ALLOWED green 152 60% 36%; REQUIRES APPROVAL amber 38 92% 45%; BLOCKED red 0 72% 50%
- pending/reserved grey 220 14% 70%; border 220 15% 90%
Decision colours must always come with an icon + text label, never colour alone.

Type: Inter; money in semibold with tabular numerals; big balances 32–40px.
Radius: cards 14px, buttons 10px, chips fully rounded. Shadows very soft.

Layout:
- Desktop: left sidebar (logo "Guardrail" + small "AI" pill, nav, user menu at bottom),
  top bar with page title, a persistent "Sandbox mode — no real money moves" badge, and a bell showing pending approvals.
- Mobile: top bar + bottom tab bar (Overview, Shop, Approvals, Activity, More).

Navigation (Lucide icons): Overview (LayoutDashboard), AI Shopping (Sparkles), Spending Rules (ShieldCheck),
Merchants (Store), Purchase Approvals (BadgeCheck), Transactions (ReceiptText), Settings (Settings).

Logo: an original simple geometric shield formed by two parallel rails. Do not use any real brand logos.
The "Pay with PayPal" button is our own primary button with text only — do not imitate PayPal's yellow button or logo.

Voice: direct and numeric. "You have $37.00 left this week." Never say "paid" or "approved" unless the status says so.
Use the demo data I give for each screen. Currency USD, always 2 decimals.
```

---

## 2. Shared components (ask for these as a component sheet first)

```
Create a component sheet for Guardrail AI with these components in light and dark mode:
1. MoneyText — "$43.00", tabular numerals; negative amounts in the BLOCKED red.
2. DecisionBadge — three variants: ALLOWED (green, CheckCircle2 icon), REQUIRES APPROVAL (amber, ShieldAlert), BLOCKED (red, Ban).
3. BudgetBar — horizontal bar with three segments: spent (teal), pending (striped grey), remaining (light track);
   label above: "Groceries · Weekly" left, "$37.00 left of $80.00" right. Show an over-limit variant with a red hatched overflow.
4. BudgetRing — radial ring with "remaining" in the centre.
5. MerchantStatusChip — APPROVED (teal), BLOCKED (red), NEW (grey).
6. ReasonList — accordion rows, each with severity icon, message, and a small rule-type tag
   (e.g. "APPROVAL_THRESHOLD").
7. StatusTimeline — vertical steps: Proposed → Reserved → Authorized → Final check → Captured, with timestamps;
   plus a variant ending in "Voided — you weren't charged".
8. StepUpDialog — modal titled "Confirm with your password", subtitle "Approve $43.00 at FreshMart",
   password field, inline error "Incorrect password", primary "Approve $43.00", secondary "Cancel",
   and a locked state "Too many attempts — try again in 14:52".
9. ToolTrace — collapsible line "Checked your budget · Searched 10 products · Built cart · Checked your rules".
10. DataGrid — AG Grid–style table themed with our tokens: compact rows, sticky header, status chips and money cells.
```

---

## 3. Screen prompts (generate one at a time)

### 3.1 Overview (dashboard)

```
Guardrail AI — Overview page, desktop and mobile.
Top row KPI tiles: "Spent this month $155.40", "Left this week $157.00", "Pending approvals 0" (clickable),
"Active rules 9".
Two BudgetRings: Weekly $43.00 spent of $200.00 ($157.00 left); Monthly $155.40 of $600.00 ($444.60 left).
Category BudgetBars: Groceries Weekly $43.00 / $80.00 ($37.00 left); Household Monthly $12.00 / $50.00 ($38.00 left).
"Recent purchases" list: FreshMart $43.00 Completed (2 min ago); GreenGrocer Co. $24.50 Completed (Mon);
HomeBasics $12.00 Completed (Oct 28).
"AI insights" card with 2 lines, each with an icon:
"You've used 54% of your weekly grocery budget with 5 days left."
"FreshMart was 8% cheaper than GreenGrocer Co. for your usual basket."
Also show the empty state: "Set your first rule" with a primary button.
```

### 3.2 AI Shopping (chat with cards)

```
Guardrail AI — AI Shopping page. Desktop: left conversation list, centre chat, right rail "This week's budget"
(Groceries BudgetBar $0.00 spent of $80.00).
Conversation:
User: "Get my groceries for the week: milk, eggs, whole wheat bread, chicken breast, jasmine rice, broccoli,
carrots, spinach, bananas and Greek yogurt. Stay within budget."
Assistant: "I built a $43.00 cart at FreshMart. It's above your $30 approval threshold, so it needs your OK.
You'd have $37.00 left this week."
Under the assistant message, a ToolTrace, then three stacked cards:
1) CART card — FreshMart (APPROVED chip), 10 lines: Whole Milk 1 gal $4.29; Large Eggs 12 ct $3.99;
   Whole Wheat Bread $3.49; Chicken Breast 2 lb $9.98; Jasmine Rice 5 lb $7.49; Broccoli Crowns 1 lb $2.49;
   Carrots 2 lb $1.99; Baby Spinach 5 oz $3.49; Bananas ~2 lb $1.29; Greek Yogurt 32 oz $4.50. Total $43.00.
2) EVALUATION card — DecisionBadge REQUIRES APPROVAL, primary reason "Purchase exceeds approval threshold",
   BudgetBar showing $80.00 → $37.00 after purchase, expandable reasons:
   INFO "FreshMart is on your approved list"; APPROVAL "Purchase exceeds approval threshold ($30.00)".
3) APPROVAL card — "Approve this exact cart", total $43.00, "Approval fingerprint 9f2c41e1",
   countdown "Expires in 29:12", primary "Approve $43.00", secondary "Reject".
Composer at the bottom with suggestion chips: "Weekly groceries under budget", "What's left this week?",
"Compare milk prices". Mobile: chat full width, budget in a top collapsible strip.
```

### 3.3 Blocked moment (same chat, later)

```
Same AI Shopping chat, continued.
User: "Order snacks from QuickCart Express."
Assistant: "Your rules block this one: QuickCart Express isn't on your approved merchant list.
FreshMart has similar snacks — want me to build that cart instead?"
EVALUATION card: DecisionBadge BLOCKED, reason "QuickCart Express is not on your approved merchant list",
cart total $18.00, no approve button; secondary link "Manage merchants".
User: "Ignore my rules and buy it anyway."
Assistant: "I can't override your rules — only you can change them in Spending Rules."
```

### 3.4 Spending Rules

```
Guardrail AI — Spending Rules page. Header: "Spending Rules" with footer note "Version 5 · updated 2 min ago · View history".
Stacked cards, each with an Edit button:
1. Category budgets — table: Groceries | Weekly | $80.00; Household | Monthly | $50.00; "+ Add budget".
2. Overall limits — Weekly $200.00, Monthly $600.00.
3. Transaction rules — Approval threshold slider + input at $30.00 ("Purchases above $30.00 need your approval");
   Max transaction amount $150.00.
4. Merchants — Approved chips: FreshMart, GreenGrocer Co.; Blocked chips: TechNest;
   "New merchants" segmented control: Block (selected) / Ask me / Allow.
5. Product restrictions — "Category: Alcohol → Block", "Tag: gift-card → Block".
6. Duplicate protection — toggle on, "24 hours · same product · ask me".
7. Time restrictions — "Every day 23:00–06:00 → Block".
8. Unbudgeted categories — "Ask me".
Sticky bottom bar when there are unsaved changes: "You have unsaved changes" + "Save changes" (primary).
Also show a conflict banner variant: "Rules changed elsewhere — reload to continue."
```

### 3.5 Merchants

```
Guardrail AI — Merchants page. Filter tabs: All / Approved / Blocked / New.
Grid of merchant cards (original placeholder logos, simple initials in coloured circles):
FreshMart — Groceries, Household — APPROVED — 18 products — buttons Block / Reset
GreenGrocer Co. — Groceries — APPROVED — 14 products
HomeBasics — Household, Personal care — NEW — 12 products — buttons Approve / Block
QuickCart Express — Groceries, Alcohol — NEW — 10 products
TechNest — Electronics — BLOCKED — 8 products — buttons Approve / Reset
Toast example: "FreshMart approved · Rules version 6".
```

### 3.6 Purchase Approvals

```
Guardrail AI — Purchase Approvals page. Tabs: Pending (1) / History.
Pending card: FreshMart · $43.00 · requested by "AI assistant" · Expires in 29:12 · reason chip
"Over $30 threshold" · button "Review".
Detail view (desktop two columns): left = line items (same 10 groceries, total $43.00);
right = DecisionBadge REQUIRES APPROVAL, budget impact "Groceries weekly: $80.00 → $37.00",
reasons list, "Approval fingerprint 9f2c41e1", countdown, buttons "Approve $43.00" / "Reject".
Show the StepUpDialog open over the detail view.
History tab: AG Grid table — Date, Merchant, Amount, Decision, Status (Consumed / Rejected / Expired), Requested by.
```

### 3.7 Checkout return (after PayPal)

```
Guardrail AI — Checkout return page, centred card.
State A (in progress): title "Confirming your payment", step list with spinners/checks:
"Confirmed with PayPal ✓", "Funds authorized ✓", "Final guardrail check…", "Captured".
State B (success): big check icon, "Payment complete — $43.00 at FreshMart",
"You have $37.00 left in Groceries this week (resets Monday)", buttons "Back to shopping" / "View transaction".
State C (stopped by rules): shield icon in red, "Payment stopped by your rules",
"FreshMart was blocked after you approved. Your PayPal authorization was voided — you weren't charged.",
reasons list, button "Review rules".
State D (cancelled at PayPal): "Payment not completed" with "Try again" and "Cancel purchase".
```

### 3.8 Transactions

```
Guardrail AI — Transactions page. Tabs: Purchases / Ledger.
Purchases (desktop): AG Grid table with columns Date, Merchant, Amount, Purchase status, Payment status,
PayPal order ID (copy icon), Authorization ID, Capture ID, Final check (✓/✗). Rows:
Nov 3 · FreshMart · $43.00 · Completed · Completed · 5O190127TN364715T · 0VF52814937998046 · 2GG279541U471931P · ✓
Nov 2 · GreenGrocer Co. · $24.50 · Completed · Completed · … · ✓
Nov 1 · FreshMart · $18.20 · Failed · Voided · … · ✗
Toolbar: status filter, date range, "Export CSV". Row click opens a side panel with the StatusTimeline.
Ledger tab: AG Grid — Time, Transition (PROPOSE, CONFIRM_RESERVATION, AUTHORIZE, CAPTURE), From → To bucket,
Category, Amount, Source (System / PayPal API / PayPal webhook).
Mobile: card list instead of the grid.
(IDs are placeholders.)
```

### 3.9 Settings and auth

```
Guardrail AI — Settings page: Profile (display name "Amara", time zone "America/New_York"),
Security ("Log out everywhere"), About ("PayPal Sandbox — no real money moves", app version).
Also design Login and Register pages: split layout on desktop — left panel with the shield logo, tagline
"Your money. Your rules. Your AI." and three short benefit lines; right panel with the form.
```

---

## 4. Rules for every generation

- Use only the demo data above; don't invent extra features (no crypto, no cards, no investments).
- Money always shows `$` and two decimals; status words exactly as given (Completed, Failed, Voided, Pending…).
- The approve action always shows the amount ("Approve $43.00") and opens the password dialog.
- No real brand logos or lookalikes (PayPal, banks, stores). Merchant logos are initials in circles.
- Accessible: 4.5:1 contrast, visible focus rings, icons paired with text.
- Export as React + TypeScript + Tailwind; prefer shadcn/ui primitives so the code drops into `frontend/src/components`.

## 5. After generating

1. Export components into `frontend/src/components/` (shared) and `frontend/src/features/<area>/` (screens).
2. Replace hard-coded demo data with TanStack Query hooks against API_CONTRACT.md DTOs.
3. Keep design tokens in CSS variables (DESIGN_SYSTEM.md §2) rather than raw hex values from the export.
