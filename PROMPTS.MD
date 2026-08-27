# Prompts

Working prompts used with Claude Code for this assessment, in order.

## Session 1 — planning

> `/plan using the CLAUDE.MD file in the directory`

Follow-up: answered the plan's clarifying questions (Go stdlib `net/http`, Vite + React +
TypeScript with Vitest/RTL, a single multi-stage Dockerfile, and `percentage(a, b) = (a/100)*b`)
via the tool's own question prompts — plan was written to
`~/.claude/plans/declarative-petting-kahn.md` and approved. Go 1.22.9 was installed locally
(`~/.local/go`) to prepare for implementation, then the session's connection dropped before
any project code was written.

## Session 2 — implementation (this session)

> `continue the plan from the previous sessions`

> `Install Docker via Snap please`

Everything up through the Dockerfile and initial README/PROMPTS.MD was built by following
the approved plan mechanically rather than from further free-form prompting.

> `I need some to add more features. should I do it directly to claude md?`

Answered: yes, CLAUDE.MD is the spec of record — added directly there.

CLAUDE.MD was then updated with new usability requirements:

```
# Usability Features
- Numeric keyboard for entry
- One number comes from keyboard and the other comes from memory starting with 0
- The confirmation of the first number imputed should be the click of any operator by the user
```

This drove a redesign of the frontend interaction model: a digit `Keypad` component
replaced the two free-text operand inputs, and `Calculator.tsx` now holds a running
`memory` accumulator (starting at 0) plus a `pendingOp`, confirming the typed number into
memory when any operator is pressed — matching a physical/iOS calculator's sequential
entry rather than "fill in two fields and submit."

Along the way, debugging a Docker `docker run` showing only a `.gitkeep` link (a stale
local `go run` process left over from manual testing, unrelated to the Dockerfile itself)
and getting the snap-packaged Docker daemon usable (`removable-media` interface,
`docker` group, socket ownership) needed a few back-and-forth troubleshooting prompts —
not reproduced verbatim here since they were session-specific debugging rather than
reusable working prompts.

> `/frontend-design Improve the layout design and the usability of the calculator`

This drove a visual/usability pass on the frontend only (backend untouched): the digit
keypad and operator keys were merged into one `CalculatorPad` grid laid out like Apple's
own scientific-calculator keyboard (a muted top row for `AC`/`xʸ`/`√`/`%`, an orange column
for the four chainable arithmetic operators, and a full-width `=` bar); a small "expression
line" above the display now shows the confirmed operand and operator (e.g. `4 +`); the
keypad gained physical-keyboard support (digits, operators, Enter, Escape); and
`:focus-visible` rings plus a reduced-motion-aware error transition were added for
accessibility.

> `where is the theme switch?`

Answered: there wasn't one — the app followed `prefers-color-scheme` only, matching how
native system-following apps behave, per the original CLAUDE.MD wording ("for both light
and dark theme" didn't originally ask for an in-app switch).

CLAUDE.MD was updated again, adding:

```
# Math Operations
- User needs to able to oprate with decimal postive and negative nubers
...
# Visuals
Need a toggle switch to change between the both teams but use the default theme as innitial state for it.
```

Implemented: a `±` sign-toggle key (decimals already worked via `.`; there was previously
no way to enter a negative number at all) added to the top row of `CalculatorPad`, and an
explicit `ThemeToggle` switch in the top-right corner that initializes from the OS's
`prefers-color-scheme` and then behaves as a manual override from there (`data-theme` on
`<html>`, with a CSS override block that wins over the `prefers-color-scheme` query in
either direction).
