import type { ConfigHelpEntry } from "../../shared/configHelp";

export const sessionsConfigHelp: ConfigHelpEntry[] = [
	{
		key: "sessions.nodeName",
		setter: "assist config set sessions.nodeName <name> --node",
		note: "this install's node label, shown in the web UI hamburger menu and reported by /api/health (default: OS hostname, with -wsl under WSL)",
	},
	{
		key: "sessions.includeCommittedChanges",
		setter: "assist config set sessions.includeCommittedChanges false --node",
		note: "default on: session card counts, /diff and the diff scope picker span the commits recorded against the session's backlog item as well as uncommitted work, so they survive the agent committing. Set false to show only uncommitted changes",
	},
	{
		key: "sessions.maxLive",
		setter: "assist config set sessions.maxLive 24 --node",
		note: "ceiling on concurrent live sessions one daemon holds; spawning past it is refused, and restore respawns at most this many persisted sessions (default: 24)",
	},
	{
		key: "sessions.newSessionMode",
		setter: "assist config set sessions.newSessionMode bug --node",
		note: "default mode pre-selected in the Ctrl+N new session dialog: draft | bug | prompt | design (default: draft)",
	},
	{
		key: "worktree.enabled",
		setter: "assist config set worktree.enabled true --repo",
		note: "opt in per repo: every session spills into a fresh adjacent <clone>-N worktree and the clone itself is never allocated; only inPlace launches (e.g. PR Review) and agents joining a stream stay in their tree (default off)",
	},
	{
		key: "worktree.trunk",
		setter: "assist config set worktree.trunk true --repo",
		note: "trunk-based: a worktree's branch tracks origin/<the clone's branch> so commits land on the mainline (default off: a worktree starts off the remote default with no mainline tracking, so the session raises its own branch and PR)",
	},
	{
		key: "worktree.root",
		setter: "assist config set worktree.root ~/git --repo",
		note: "optional; parent dir for <clone>-N worktrees (default: the clone's parent)",
	},
	{
		key: "worktree.install",
		setter: "assist config set worktree.install true --repo",
		note: 'per-worktree dep install: true auto-detects the package manager (npm ci when a package-lock.json exists), or give an explicit command; false to skip; or a JSON list of paths (e.g. \'[".","packages/ui"]\') to auto-detect and install in each, in order, stopping at the first failure',
	},
	{
		key: "worktree.commitBeforePhaseEnd",
		setter: "assist config set worktree.commitBeforePhaseEnd true --repo",
		note: "phase prompts run /commit once verify passes — before asking the user to perform manual checks, or before phase-done when the phase has none — so work is not left uncommitted in a reapable worktree (default off)",
	},
	{
		key: "worktree.copy",
		setter:
			"assist config set worktree.copy .env,.claude/settings.local.json --repo",
		note: "gitignored files copied into a new worktree so it can build/run",
	},
];
