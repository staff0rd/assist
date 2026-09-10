import { parseGitHubUrl } from "./parseGitHubUrl";

export type ReadTimeTarget =
	| { kind: "stdin" }
	| { kind: "file"; path: string }
	| { kind: "pr"; number: number; repo: { org: string; repo: string } | null };

const PR_URL_PATTERN =
	/^(https:\/\/github\.com\/[^/\s]+\/[^/\s]+)\/pull\/(\d+)(?:[/?#].*)?$/;

export function resolveReadTimeTarget(target: string): ReadTimeTarget {
	const trimmed = target.trim();

	if (trimmed === "-") return { kind: "stdin" };

	if (/^\d+$/.test(trimmed)) {
		return { kind: "pr", number: Number(trimmed), repo: null };
	}

	const url = PR_URL_PATTERN.exec(trimmed);
	if (url) {
		const repo = parseGitHubUrl(url[1]);
		if (repo) return { kind: "pr", number: Number(url[2]), repo };
	}

	return { kind: "file", path: target };
}
