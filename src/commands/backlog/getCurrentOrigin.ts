import { findRepoRoot } from "../../shared/findRepoRoot";
import { remoteUrl, tryGit } from "./remoteUrl";

const WINDOWS_PATH = /^[A-Za-z]:[\\/]/;

function isReadableFromThisProcess(cwd: string): boolean {
	return process.platform === "win32" || !WINDOWS_PATH.test(cwd);
}

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

export type OriginResolution = {
	origin: string;
	/**
	 * False when the `local:<root>` fallback was reached because a git call
	 * failed rather than because the repository has no remotes. Such a result can
	 * resolve differently on the next attempt, so callers must not memoise it — a
	 * transient failure would otherwise pin the wrong key for the whole process
	 * lifetime.
	 */
	stable: boolean;
};

/**
 * Resolve the normalized origin key for the repository at `cwd`. Prefers the
 * `origin` remote, falling back to any other remote. Repositories with no remote
 * resolve to `local:<repo-root>` so they still get a stable per-checkout key
 * (note: separate clones without a shared remote do NOT share a backlog).
 */
export function resolveCurrentOrigin(cwd: string): OriginResolution {
	if (isReadableFromThisProcess(cwd) && findRepoRoot(cwd) === null)
		return { origin: `local:${cwd}`, stable: false };
	const remote = remoteUrl(cwd);
	if (remote.url) return { origin: normalizeOrigin(remote.url), stable: true };
	const root = tryGit(cwd, ["rev-parse", "--show-toplevel"]);
	return { origin: `local:${root ?? cwd}`, stable: remote.ok };
}

export function getCurrentOrigin(cwd: string): string {
	return resolveCurrentOrigin(cwd).origin;
}
