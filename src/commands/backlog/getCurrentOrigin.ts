import { execFileSync } from "node:child_process";

function stripLeadingSlashes(path: string): string {
	return path.replace(/^\/+/, "");
}

/**
 * Canonicalise a git remote URL so any clone of the same repository resolves to
 * one key, regardless of protocol (ssh/https) or checkout path.
 *
 * - strips a trailing `.git` and trailing slashes
 * - drops any userinfo (`git@`, `user:pass@`) and port
 * - lowercases the host (paths are left as-is, since some hosts are
 *   case-sensitive)
 * - represents both `git@host:org/repo` and `https://host/org/repo` as
 *   `host/org/repo`
 */
export function normalizeOrigin(raw: string): string {
	const trimmed = raw
		.trim()
		.replace(/\.git$/i, "")
		.replace(/\/+$/, "");

	// scheme://[user@]host[:port]/path
	const url = trimmed.match(
		/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/(?:[^@/]+@)?([^/:]+)(?::\d+)?\/(.+)$/,
	);
	if (url) {
		return `${url[1].toLowerCase()}/${stripLeadingSlashes(url[2])}`;
	}

	// scp-like: [user@]host:path (no scheme)
	if (!trimmed.includes("://")) {
		const scp = trimmed.match(/^(?:[^@/]+@)?([^/:]+):(.+)$/);
		if (scp) {
			return `${scp[1].toLowerCase()}/${stripLeadingSlashes(scp[2])}`;
		}
	}

	return trimmed.toLowerCase();
}

// why: a windows-origin repo (C:\…) must run git natively over interop — the WSL process can't chdir into a Windows path, so it would otherwise derive a different origin than the Windows host and its backlog queries would find no items
function tryGit(cwd: string, args: string[]): string | null {
	const windows = /^[A-Za-z]:[\\/]/.test(cwd);
	const file = windows ? "git.exe" : "git";
	const argv = windows ? ["-C", cwd, ...args] : args;
	try {
		const out = execFileSync(file, argv, {
			encoding: "utf8",
			stdio: ["pipe", "pipe", "pipe"],
			...(windows ? {} : { cwd }),
		}).trim();
		return out || null;
	} catch {
		return null;
	}
}

function firstRemoteUrl(cwd: string): string | null {
	const remotes = tryGit(cwd, ["remote"]);
	if (!remotes) return null;
	for (const remote of remotes
		.split("\n")
		.map((r) => r.trim())
		.filter(Boolean)) {
		const url = tryGit(cwd, ["remote", "get-url", remote]);
		if (url) return url;
	}
	return null;
}

export function getRemoteOriginUrl(cwd: string): string | null {
	return tryGit(cwd, ["remote", "get-url", "origin"]) ?? firstRemoteUrl(cwd);
}

/**
 * Resolve the normalized origin key for the repository at `cwd`. Prefers the
 * `origin` remote, falling back to any other remote. Repositories with no remote
 * resolve to `local:<repo-root>` so they still get a stable per-checkout key
 * (note: separate clones without a shared remote do NOT share a backlog).
 */
export function getCurrentOrigin(cwd: string): string {
	const url = getRemoteOriginUrl(cwd);
	if (url) return normalizeOrigin(url);
	const root = tryGit(cwd, ["rev-parse", "--show-toplevel"]);
	return `local:${root ?? cwd}`;
}
