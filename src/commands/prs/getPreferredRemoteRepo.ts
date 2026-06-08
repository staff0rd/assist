import { execSync } from "node:child_process";

const GITHUB_URL_PATTERN =
	/(?:git@github\.com:|https:\/\/github\.com\/)([^/]+)\/([^/]+?)(?:\.git)?\/?$/;

export function parseGitHubUrl(
	url: string,
): { org: string; repo: string } | null {
	const match = url.match(GITHUB_URL_PATTERN);
	if (!match) return null;
	return { org: match[1], repo: match[2] };
}

function tryGetRemoteUrl(remote: string, cwd?: string): string | null {
	try {
		return execSync(`git remote get-url ${remote}`, {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
			cwd,
		}).trim();
	} catch {
		return null;
	}
}

function getCurrentBranchRemote(cwd?: string): string | null {
	try {
		const ref = execSync(
			"git rev-parse --abbrev-ref --symbolic-full-name @{u}",
			{ encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], cwd },
		).trim();
		const [remote] = ref.split("/", 1);
		return remote || null;
	} catch {
		return null;
	}
}

function listRemotes(cwd?: string): string[] {
	try {
		return execSync("git remote", {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
			cwd,
		})
			.trim()
			.split("\n")
			.filter(Boolean);
	} catch {
		return [];
	}
}

export function getPreferredRemoteRepo(cwd?: string): {
	org: string;
	repo: string;
} | null {
	const candidates: string[] = [];
	const tracked = getCurrentBranchRemote(cwd);
	if (tracked) candidates.push(tracked);
	if (!candidates.includes("origin")) candidates.push("origin");
	for (const remote of listRemotes(cwd)) {
		if (remote !== "upstream" && !candidates.includes(remote)) {
			candidates.push(remote);
		}
	}

	for (const remote of candidates) {
		const url = tryGetRemoteUrl(remote, cwd);
		if (!url) continue;
		const parsed = parseGitHubUrl(url);
		if (parsed) return parsed;
	}

	return null;
}
