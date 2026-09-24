# Form 9 — Digital Statutory Medical Examination Record

A static, dependency-free digital replica of **Form IX** (Report of Medical
Examination for mine employees), prescribed under Rules 109, 113(1), 119(1)
and 142 of the Mines Rules, 1955. Built per the scope defined in the Sandur
Group &times; Enaviya Techno-Commercial Proposal (Form 9 Digitization).

## What it does

The form preserves the exact three-sheet structure and field content of the
government-prescribed Form IX, while digitizing the workflow:

- **Sheet 1 — Certificate**: employee identity, photo, and the fitness
  outcome (a/b/c) with conditional sub-fields.
- **Sheet 2 — Report of the Examining Authority**: general & systemic
  examination (items 1–15), each captured as a WNL / Abnormal toggle instead
  of free text, plus candidate signature and left-thumb-impression capture.
- **Sheet 3 — Investigations & Sign-off**: pathological investigations,
  ILO chest radiograph classification, supporting diagnostic attachments,
  and final certification.

Other digitization requirements from the proposal are reflected in the UI:
mandatory 12-digit Aadhaar validation that blocks save, auto-generated
sequential certificate numbers, Employee vs. Contractor personnel-type
toggle (contractors search by Aadhaar only), signature/thumb capture pads,
and non-editable attachment upload tiles.

## Running it

No build step — open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Structure

```
index.html            Markup for all three sheets, header, stepper, footer
assets/css/styles.css Design system (light/dark themes, responsive, print)
assets/js/app.js      Stepper navigation, validation, signature pads, tables
```

## Notes

This is a front-end prototype for review — it has no backend, so data is
not persisted server-side (certificate numbering and drafts use
`localStorage` for demo purposes only). It is intended as the visual/UX
reference for the SPFx form described in the proposal.
