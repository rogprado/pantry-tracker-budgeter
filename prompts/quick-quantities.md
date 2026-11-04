# Stranger-test fix: quick quantity updates

## 2026-11-04

Stranger-test fix. Follow CLAUDE.md (issue, branch, prompt log, PR).
A first-time user said updating quantities is slow: they had to type new
amounts by hand every time they used something.
- On each item in the pantry list, add quick controls without opening the
  item: "−" and "+" buttons that change the quantity by a sensible step
  for its unit (1 for whole/can/pack, 100 g, 0.1 kg, 100 ml, 1 cup), plus
  "Used half" and "Used all" (marks it out of stock).
- Each change records a 'use' or 'purchase' movement through the existing
  logic, so tracking and the dashboard stay correct.
- Show a small "Updated" confirmation with Undo.
- In "I cooked this", remember the last amount I used per item and
  prefill it next time.
Keep the change small. In the PR description, describe what the user did,
the fix, and why it addresses the problem. Leave room for before/after
screenshots.
Done when: I can use half a bag of rice from the pantry list in one click,
and Undo restores it.

(Answers to my questions, since no movements log or "I cooked this" existed yet: "Add a movements log"; "Build a minimal version".)

### Summary
Before building I checked the code: there was no movements log and no "I cooked this", so I asked; the answers were to add a movements log and a minimal "I cooked this". Added migration `20261104000000_stock_movements.sql` (a `stock_movements` table with RLS, plus `record_movement` and `undo_movement` functions that change the item and write or remove the log row in one transaction, as the signed-in user). Each pantry row now has −/+ by a unit-based step (`lib/quantity.ts`: 100 g, 0.1 kg, 100 ml, 0.1 L, 1 cup, otherwise 1), "Used half" and "Used all" (0 = out of stock; + brings it back in stock), and a bottom toast with Undo. Saved recipes get "I cooked this": items named in the recipe are pre-ticked and amounts prefill from the last 'use' movement, and one click subtracts them all (with Undo).
Tested end to end on a temporary account (8 checks, including the done-when: 1 kg rice → 0.5 kg in one click, Undo → 1 kg with the movement removed), the 14-step regression click-through, and a new unit test for the steps. Known quirk: after "Used all", the remembered amount is the whole amount that was left. Dashboard spending still comes from item price and purchase date, so "+" doesn't count as spending; in-stock counts update.
