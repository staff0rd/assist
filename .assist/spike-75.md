# Spike: Auto-generate skills from session data (#75)

## Session Transcript Storage & Format

**Location:** `~/.claude/projects/<sanitized-path>/<session-uuid>.jsonl`
**Format:** JSONL — one JSON object per line. Key entry types:

- `type: "user"` → `message.role: "user"`, `message.content: string`
- `type: "assistant"` → `message.role: "assistant"`, `message.content: [{type: "text", text: "..."}, {type: "tool_use", ...}]`
- Also: `permission-mode`, `file-history-snapshot`, `attachment` (metadata-only)

**Metadata per entry:** `uuid`, `parentUuid`, `timestamp`, `sessionId`, `cwd`, `gitBranch`, `version`
**Token usage:** `message.usage.{input_tokens, output_tokens, cache_*}` on assistant entries
**Session index:** `~/.claude/sessions/<pid>.json` maps running PID → sessionId

**Volume (this project):** 87 sessions, ~2–4K tokens of text content each (tool call JSON is the bulk of file size). All sessions for one project fit easily in a 1M context window.

## AutoSkill Analysis

**Repo:** https://github.com/ECNU-ICALK/AutoSkill (cloned to ~/git/AutoSkill)
**Architecture:** Python SDK, zero core dependencies, pluggable LLM/embedding/storage providers.

**Pipeline:** 3-stage extraction:

1. **Plan** — LLM estimates skill count/names from conversation window
2. **Expand** — LLM generates full skill spec per planned skill (name, description, prompt, triggers, tags, examples, confidence)
3. **Compile** — Normalize, dedupe via hybrid embedding+BM25 search, version (add/merge/discard)

**Input:** OpenAI message format `[{role, content}]`. Flexible loader handles various JSON structures.
**Output:** `SKILL.md` files with YAML frontmatter (id, name, description, version, tags, triggers) + prompt body.

**Extraction philosophy (from prompt analysis):**

- Only extract when user provides **concrete, reusable execution requirements**
- Single explicit constraint can be sufficient signal
- Must be traceable to USER evidence only — assistant replies are never direct skill evidence
- Conservative: better to miss a one-off than incorrectly save a generic task as a skill
- Future reuse test: "Would this be useful on similar inputs after removing case-specific facts?"

**Blocker:** Requires external LLM API key for all extraction. No API-key-free mode (mock provider produces no real output).

## Integration Approach Evaluation

### A) Standalone AutoSkill — RULED OUT

- Requires Python runtime + external LLM API key
- Adds heavy dependency for extraction that could be done natively
- Output format (SKILL.md) doesn't match assist skill format anyway

### B) AutoSkill as subprocess/wrapper — RULED OUT

- Same API key requirement
- IPC complexity for no real benefit over (A)

### C) Hybrid: AutoSkill storage + Claude Code extraction — RULED OUT

- AutoSkill's storage is just filesystem .md files — no value over writing our own
- Embedding-based dedupe is overkill for <100 skill files

### D) Port extraction prompts, implement natively — RECOMMENDED

Use Claude Code itself as the extraction LLM. No external API key needed.

**Implementation:**

1. `assist skill extract` CLI command that:
   - Reads session JSONL files for the current project
   - Strips metadata/tool-calls, keeps user+assistant text
   - Outputs a compact transcript summary to stdout
2. A Claude Code skill (`/skill-extract`) that:
   - Calls `assist skill extract` to get session summaries
   - Feeds them to Claude Code (the current session) with an extraction prompt adapted from AutoSkill's approach
   - Proposes skill candidates with name, description, content
   - Shows candidates for user approval
   - Writes approved skills as `.md` files to `claude/commands/`

**Why this wins:**

- Zero external dependencies (no Python, no API key)
- Claude Code IS the LLM — already running, already has project context
- Session data is small enough to process in batches within context
- Skill output format matches assist's existing `.md` + frontmatter convention
- AutoSkill's prompt engineering concepts (user-evidence-only, reuse test, conservative extraction) are portable as prompt instructions

**What to port from AutoSkill:**

- Extraction criteria: reusable policy detection, confidence scoring, user-evidence-only rule
- Anti-patterns: skip generic tasks, one-off content, assistant-invented structures
- Output structure: name, description, triggers/tags for discoverability
- Dedupe concept: compare against existing skills in `claude/commands/` before proposing

**What NOT to port:**

- Embedding-based retrieval (overkill at this scale)
- Version/provenance tracking (git handles this)
- Concurrent extraction workers (single-session processing is fast enough)
- JSON repair prompts (Claude Code outputs markdown, not JSON)

## Token Cost & Latency Estimates

**Input cost per session:** ~2–4K tokens of text content
**Batch of 10 sessions:** ~20–40K tokens input
**Extraction prompt overhead:** ~2K tokens (system instructions)
**Expected output per batch:** ~1–3 skill candidates, ~500 tokens each

**Total per batch:** ~25–45K input tokens + ~1.5K output tokens
**At Opus pricing ($15/M input, $75/M output):** ~$0.35–0.70 per batch of 10 sessions
**Latency:** Single LLM call, expect 10–30s

For 87 sessions processed in ~9 batches: ~$3–6 total, ~2–5 minutes wall time.
Note: this cost is already incurred within the Claude Code session — no additional API spend.

## Recommendation

**Approach D: Port extraction prompts, implement natively in assist CLI + Claude Code skill.**

Phase 2 should:

1. Add `assist skill extract [--sessions N] [--project PATH]` command that reads and summarizes session transcripts
2. Create a `/skill-extract` Claude Code skill with adapted AutoSkill extraction prompt
3. Implement approval flow and `.md` file generation
