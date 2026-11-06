import { execFileSync } from "node:child_process";

// why: a windows-origin repo (C:\…) must run git natively over interop — the WSL process can't chdir into a Windows path, so it would otherwise derive a different origin than the Windows host and its backlog queries would find no items
function runGit(cwd: string, args: string[]): { ok: boolean; out: string } {
	const windows = /^[A-Za-z]:[\\/]/.test(cwd);
	const file = windows ? "git.exe" : "git";
	const argv = windows ? ["-C", cwd, ...args] : args;
	try {
		const out = execFileSync(file, argv, {
			encoding: "utf8",
			windowsHide: true,
			stdio: ["ignore", "pipe", "pipe"],
			...(windows ? {} : { cwd }),
		}).trim();
		return { ok: true, out };
	} catch {
		return { ok: false, out: "" };
	}
}

export function tryGit(cwd: string, args: string[]): string | null {
	return runGit(cwd, args).out || null;
}

/**
 * Read a remote URL for the repository at `cwd`, preferring `origin` and
 * falling back to any other remote.
 *
 * `ok` is false only when a git call itself failed, which is what separates a
 * repository that genuinely has no remotes from one whose remote we merely
 * failed to read this time.
 */
export function remoteUrl(cwd: string): { url: string | null; ok: boolean } {
	const origin = runGit(cwd, ["remote", "get-url", "origin"]);
	if (origin.out) return { url: origin.out, ok: true };
	const remotes = runGit(cwd, ["remote"]);
	if (!remotes.ok) return { url: null, ok: false };
	let failed = false;
	for (const remote of remotes.out
		.split("\n")
		.map((r) => r.trim())
		.filter(Boolean)) {
		const url = runGit(cwd, ["remote", "get-url", remote]);
		if (url.out) return { url: url.out, ok: true };
		if (!url.ok) failed = true;
	}
	return { url: null, ok: !failed };
}

export function getRemoteOriginUrl(cwd: string): string | null {
	return remoteUrl(cwd).url;
}
