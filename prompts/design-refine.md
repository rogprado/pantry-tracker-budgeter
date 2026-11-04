# Design refinement

## 2026-11-03

Can we adjust teh login screen as well? It is too bare at the moment. Can it not be inserted in the regular layout? Also, the design feels a bit childshish - are we using comics sans? Can we ajust the feeling? I trust you to take references from well designed websites
Wait, let me merge the PR first

merged, work in the changes

### Summary
Made the look more refined and less playful: Inter for body text and Newsreader (an editorial serif) for titles and big numbers instead of Nunito and soft Fraunces; 12px radius instead of 20px; hairline borders instead of shadows; semibold/medium instead of bold; no tinted boxes behind icons; a deeper plum for the one main button; a white sidebar with a soft active tint; small uppercase labels above page titles; chart bars in plum. Login and sign-up now sit in the regular layout: the same left column shows the logo and three lines on what Pantry does, and the main area has the form beside the kitchen photo.
Most of it went through the shared tokens and components, plus one scripted sweep of page classes (bold to semibold, rounded-xl to rounded-lg, removing shadows and tinted icon boxes). Checked with screenshots of every page and the 14-step click-through on a temporary account (all passed); contrast measured (button text 9.6:1, muted text 6.6:1). No behavior, data or route changes.
