# Backlog Orchestration

## Workflow Contract

This is the core workflow that drives backlog item execution. Each item is broken into **phases**, and each phase runs in its own Claude subprocess.

```mermaid
flowchart TD
    subgraph "Agent (Claude subprocess)"
        A1[Read phase tasks from prompt]
        A2[Implement code changes]
        A3[Run /verify inside session]
        A4{Phase has manual checks?}
        A4 -- yes --> A5[List manual checks and wait for user confirmation]
        A4 -- no --> A6{Last phase?}
        A6 -- yes --> A7[Ask user to verify end-to-end and confirm]
        A6 -- no --> A8["Call: assist backlog phase-done id phase"]
        A5 --> A8
        A7 --> A8
    end

    subgraph "Orchestrator (run.ts)"
        O1[Detect marker file]
        O2[SIGTERM Claude]
        O3["Run assist verify (independent check)"]
        O4{Verify passed?}
        O5[Advance to next phase]
        O6{User: continue or abort?}
    end

    A1 --> A2 --> A3 --> A4
    A8 -.->|writes .assist-signal.json| O1
    O1 --> O2 --> O3 --> O4
    O4 -- yes --> O5
    O4 -- no --> O6
    O6 -- continue --> O5
    O6 -- abort --> END[Exit]
```

### What the agent is told to do (per phase)

These instructions come from `buildPhasePrompt.ts`:

1. **Implement the phase tasks** — the prompt lists specific tasks, each with an optional `verify` hint
2. **Run `/verify`** — the prompt tells the agent to verify its own work before signalling completion
3. **Pause for manual checks** (if any) — the agent lists the manual checks and waits for the user to confirm they pass
4. **Pause on last phase** (always) — even without explicit manual checks, the last phase always asks the user to verify end-to-end before proceeding
5. **Signal done** — only after verify passes and user confirms (if required), the agent calls `assist backlog phase-done <id> <phase>`

### Manual checks

Most phases should NOT have manual checks — prefer automated verification. Manual checks are for things that are genuinely difficult to automate (visual appearance, UX flow, hardware interaction, etc.).

The **last phase always requires user confirmation**, even if it has no explicit `manualChecks`. This is the gate that determines whether the story is actually finished.

Phases define manual checks via the `manualChecks` field:

```yaml
plan:
  - name: Add search UI
    tasks:
      - task: Add search input component
      - task: Wire up to API
    manualChecks:
      - Verify search results appear within 200ms
      - Check that empty state shows placeholder text
  - name: Polish and edge cases    # last phase — always pauses for user
    tasks:
      - task: Handle network errors gracefully
```

### What the agent is NOT told to do

- **Write tests** — not explicitly required in the prompt. It only happens if `/draft` included a test task in the plan, or the agent decides to on its own.
- **Commit** — the agent is never told to commit. After all phases complete, `run.ts` prints "use /commit when ready" and the user takes over.

### Quality gates

```mermaid
flowchart LR
    subgraph "During phase (agent-side)"
        V1["/verify — agent runs voluntarily"]
        V2["Manual checks — agent pauses for user"]
    end
    subgraph "Between phases (orchestrator-side)"
        V3["assist verify — orchestrator runs automatically"]
    end
    subgraph "After all phases (user-side)"
        V4["/verify — user runs before /commit"]
    end

    V1 --> V2 --> V3 --> V4
```

| Gate | Who runs it | When | What happens on failure |
|---|---|---|---|
| Agent `/verify` | Claude subprocess | Before calling phase-done | Agent should fix and retry (prompt says "once verify passes") |
| Manual checks | User, prompted by agent | After /verify passes, before phase-done | Agent waits for user confirmation |
| Last-phase confirmation | User, prompted by agent | Always on the final phase | Agent waits — this is the "is the story done?" gate |
| Orchestrator `assist verify` | `resolvePhaseResult.ts` | After phase-done marker detected | User prompted: continue or abort |
| Final `/verify` | User | Before committing | User decides |

### What `/draft` controls

The `/draft` skill (`claude/commands/draft.md`) is where the workflow is authored. It defines:

- **Acceptance criteria** — shown to the agent in every phase prompt
- **Phase names and tasks** — the specific work the agent will do
- **Verify hints** — optional per-task verification instructions (e.g. "run the test suite", "check the output")
- **Manual checks** — optional per-phase checks the user must perform (keep these rare)

If you want the agent to write tests, add it as an explicit task in the plan. If you want a specific verification step, add a `verify` field to the task. The agent only reliably does what the plan tells it to do.

## Item Lifecycle

```mermaid
stateDiagram-v2
    [*] --> todo: assist backlog add
    todo --> in_progress: assist backlog run / next
    in_progress --> in_progress: resume after interruption
    in_progress --> done: all phases complete
    done --> [*]
```

## `assist backlog next`

```mermaid
flowchart TD
    A[next] --> B{in-progress item exists?}
    B -- yes --> C[resume run]
    B -- no --> D{todo items exist?}
    D -- no --> E[spawn claude /draft]
    D -- yes --> F[prompt user to pick item]
    F --> C
```

## `assist backlog run` — Phase Loop

```mermaid
flowchart TD
    A[run id] --> B[load item + validate plan]
    B --> C[set status in-progress]
    C --> D[phaseIndex = currentPhase ?? 0]
    D --> E{phaseIndex < plan.length?}
    E -- no --> F[All phases complete]
    E -- yes --> G[executePhase]
    G --> H{delta}
    H -- advance --> I[phaseIndex + 1]
    H -- retry --> J[phaseIndex unchanged]
    H -- abort --> K[exit]
    I --> E
    J --> E
```

## `executePhase` — Single Phase

```mermaid
sequenceDiagram
    participant run as run.ts
    participant ep as executePhase
    participant bp as buildPhasePrompt
    participant sc as spawnClaude
    participant wm as watchForMarker
    participant claude as Claude subprocess
    participant rp as resolvePhaseResult

    run->>ep: executePhase(item, phaseIndex, phases)
    ep->>bp: buildPhasePrompt(item, phaseIndex, phase, totalPhases)
    bp-->>ep: prompt string
    ep->>sc: spawnClaude(prompt)
    sc-->>ep: { child, done }
    ep->>wm: watchForMarker(child)

    Note over claude: Claude works on tasks...
    alt Phase has manual checks
        Note over claude: Agent pauses, lists checks, waits for user
        claude->>claude: User confirms
    end
    alt Last phase (always)
        Note over claude: Agent asks user to verify end-to-end
        claude->>claude: User confirms
    end
    claude->>claude: assist backlog phase-done id phase
    Note over claude: writes .assist-signal.json
    wm->>claude: SIGTERM (marker detected)

    ep->>wm: stopWatching()
    ep->>rp: resolvePhaseResult(phaseIndex)
    rp-->>ep: delta (-1 / 0 / 1)
    ep-->>run: next phaseIndex or -1
```

## `resolvePhaseResult` — Post-Phase Decision

```mermaid
flowchart TD
    A[resolvePhaseResult] --> B{marker file exists?}
    B -- yes --> C[cleanup marker]
    C --> D[run assist verify]
    D --> E{verify passed?}
    E -- yes --> F[return 1 — advance]
    E -- no --> G{user prompt}
    G -- continue --> F
    G -- abort --> H[return -1 — abort]
    B -- no --> I{user prompt}
    I -- retry --> J[return 0 — retry]
    I -- skip --> F
    I -- abort --> H
```

## Phase-Done Handshake

```mermaid
sequenceDiagram
    participant claude as Claude subprocess
    participant pd as phaseDone.ts
    participant fs as .assist-signal.json
    participant wm as watchForMarker
    participant shared as shared.ts (YAML)

    claude->>pd: assist backlog phase-done <id> <phase>
    pd->>fs: write { event, itemId, phaseIndex, completedAt }
    pd->>shared: setCurrentPhase(id, phase + 1)
    wm->>fs: poll detects file (1s interval)
    wm->>claude: SIGTERM
```

## Prompt Template

`buildPhasePrompt.ts` produces the following structure (shown for a mid-phase with manual checks):

```
You are implementing phase {N} of backlog item #{id}: {name}

Description: {description}

Acceptance criteria:
- {criterion 1}
- {criterion 2}

Phase {N}: {phase name}
Tasks:
- {task} (verify: {optional verify step})
- {task}

Focus ONLY on this phase. Do not work on other phases.
When you have completed all tasks for this phase, run /verify to check your work.

Before marking this phase as done, ask the user to perform these manual checks:
- {check 1}
- {check 2}

Wait for the user to confirm all manual checks pass before proceeding.

Once verify passes and the user confirms, run: assist backlog phase-done {id} {phase}
```

For the **last phase** without explicit manual checks, the prompt instead includes:

```
This is the final phase. Before marking it as done, ask the user to manually verify
that the feature works end-to-end and all acceptance criteria are met.
Wait for the user to confirm before proceeding.
```

## File Map

| File | Role |
|---|---|
| `run.ts` | Entry point — phase loop |
| `next.ts` | Pick or resume an item |
| `executePhase.ts` | Orchestrate a single phase |
| `buildPhasePrompt.ts` | Generate the agent prompt |
| `spawnClaude.ts` | Spawn `claude` subprocess with stdio |
| `watchForMarker.ts` | Poll for `.assist-signal.json`, kill on detect |
| `phaseDone.ts` | Write marker + advance `currentPhase` |
| `resolvePhaseResult.ts` | Post-phase decision (advance / retry / abort) |
| `shared.ts` | SQLite persistence with JSONL sync |
| `types.ts` | Zod schemas for `BacklogItem`, `PlanPhase` |
