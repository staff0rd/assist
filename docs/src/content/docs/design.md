---
id: design
title: Design
group: Integrations
order: 7
covers:
  - claude:design
  - skill:discovery-questions
  - skill:frontend-aesthetic-direction
  - skill:wireframe
  - skill:make-a-deck
  - skill:make-a-prototype
  - skill:make-tweakable
  - skill:generate-variations
  - skill:design-system-extract
  - skill:component-extract
  - skill:accessibility-audit
  - skill:ai-slop-check
  - skill:hierarchy-rhythm-review
  - skill:interaction-states-pass
  - skill:polish-pass
---

Run `/design` with a design task, and the agent works on it as a designer: it asks about the audience and constraints first, settles on a look, then builds in HTML. It works from the Claude Design system prompt and its design skills, taken from [claude-design-system-prompt](https://github.com/Trystan-SA/claude-design-system-prompt).

```text
/design a pricing page for the three plans in PLANS.md
```

## Design skills

The agent follows one of these procedures when your task calls for it. Name one to ask for it, such as "do a polish pass".

| Skill                          | Does                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `discovery-questions`          | Asks a round of questions before starting new or vague work                             |
| `frontend-aesthetic-direction` | Commits to typography, colour and mood when there's no brand to follow                  |
| `wireframe`                    | Sketches several low-fidelity layouts or flows to choose from                           |
| `make-a-deck`                  | Builds a slide deck as one HTML file                                                    |
| `make-a-prototype`             | Builds a clickable prototype with real state                                            |
| `make-tweakable`               | Adds a panel of live controls for colours, fonts, spacing and copy to a finished design |
| `generate-variations`          | Produces three or more distinct takes on a screen or component                          |
| `design-system-extract`        | Pulls colour, type and spacing tokens from a codebase, site or brand guide              |
| `component-extract`            | Lists the reusable components in a finished design                                      |
| `accessibility-audit`          | Checks contrast, structure, keyboard use and motion, and fixes what it finds            |
| `ai-slop-check`                | Finds and replaces the generic look of AI-made templates                                |
| `hierarchy-rhythm-review`      | Fixes what the eye reads first and the spacing between elements                         |
| `interaction-states-pass`      | Adds missing hover, focus, disabled and loading states                                  |
| `polish-pass`                  | Runs the four reviews above as a final check before you share a design                  |
