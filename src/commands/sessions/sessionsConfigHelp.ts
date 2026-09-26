import type { ConfigHelpEntry } from "../../shared/configHelp";

export const sessionsConfigHelp: ConfigHelpEntry[] = [
	{
		key: "sessions.nodeName",
		setter: "assist config set sessions.nodeName <name> -g",
		note: "this install's node label, shown in the web UI hamburger menu and reported by /api/health (default: OS hostname, with -wsl under WSL)",
	},
	{
		key: "sessions.includeCommittedChanges",
		setter: "assist config set sessions.includeCommittedChanges false -g",
		note: "default on: session card counts, /diff and the diff scope picker span the commits recorded against the session's backlog item as well as uncommitted work, so they survive the agent committing. Set false to show only uncommitted changes",
	},
	{
		key: "sessions.topBar",
		setter: "assist config set sessions.topBar false -g",
		note: "set false to keep the active session's phase, elapsed, restored indicator, toggles and actions on its card instead of a sticky top bar above the terminal (default on)",
	},
	{
		key: "sessions.floatWaiting",
		setter: "assist config set sessions.floatWaiting false -g",
		note: "set false to stop the sidebar floating sessions that have been waiting on input for a few seconds above the other unstarred cards (default on)",
	},
	{
		key: "sessions.floatWaitingAfterMs",
		setter: "assist config set sessions.floatWaitingAfterMs 15000 -g",
		note: "how long a session must have been waiting on input before it floats (default: 5000ms)",
	},
	{
		key: "sessions.maxLive",
		setter: "assist config set sessions.maxLive 24 -g",
		note: "ceiling on concurrent live sessions one daemon holds; spawning past it is refused, and restore respawns at most this many persisted sessions (default: 24)",
	},
	{
		key: "sessions.newSessionMode",
		setter: "assist config set sessions.newSessionMode bug -g",
		note: "mode pre-selected in the Ctrl+N new session dialog: draft | bug | prompt | design (default: draft)",
	},
	{
		key: "worktree.enabled",
		setter: "assist config set worktree.enabled true -g --repo",
		note: "opt in per repo: spill concurrent sessions into adjacent <clone>-N worktrees (default off)",
	},
	{
		key: "worktree.watcher",
		setter: "assist config set worktree.watcher true -g --repo",
		note: "a backlog run also starts one starred claude session in the clone running /watch, so the built version stays current while the run works in its worktree; requires worktree.enabled, a /watch command in the repo and an auto-build run entry (default off)",
	},
	{
		key: "worktree.trunk",
		setter: "assist config set worktree.trunk true -g --repo",
		note: "trunk-based: a spilled worktree lands on the mainline, and committing jobs (backlog run <id>, review/review-pr-comments) never run in the clone — they always get a <clone>-N (default off: a worktree starts off the remote default with no mainline tracking, so the session raises its own branch and PR)",
	},
	{
		key: "worktree.includeDrafts",
		setter: "assist config set worktree.includeDrafts true -g --repo",
		note: "draft/bug/refine sessions get their own <clone>-N too (default off: they run in the clone, since they change no code)",
	},
	{
		key: "worktree.root",
		setter: "assist config set worktree.root ~/git -g --repo",
		note: "optional; parent dir for <clone>-N worktrees (default: the clone's parent)",
	},
	{
		key: "worktree.install",
		setter: "assist config set worktree.install true -g --repo",
		note: "per-worktree dep install: true auto-detects the package manager, or give an explicit command; false to skip",
	},
	{
		key: "worktree.commitBeforePhaseEnd",
		setter: "assist config set worktree.commitBeforePhaseEnd true -g --repo",
		note: "phase prompts run /commit once verify passes — before asking the user to perform manual checks, or before phase-done when the phase has none — so work is not left uncommitted in a reapable worktree (default off)",
	},
	{
		key: "worktree.copy",
		setter:
			"assist config set worktree.copy .env,.claude/settings.local.json -g --repo",
		note: "gitignored files copied into a new worktree so it can build/run",
	},
];
