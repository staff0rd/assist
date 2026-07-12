import { execSync } from "node:child_process";
import { loadConfig } from "../../../shared/loadConfig";

function refExists(ref: string): boolean {
	try {
		execSync(`git rev-parse --verify --quiet "${ref}"`, {
			stdio: ["pipe", "pipe", "pipe"],
		});
		return true;
	} catch {
		return false;
	}
}

export function resolveBaselineRef(): string | null {
	let configured: string | undefined;
	try {
		configured = loadConfig().branch?.defaultBranch;
	} catch {}

	const candidates = [
		configured && `origin/${configured}`,
		configured,
		"origin/main",
		"origin/master",
		"main",
		"master",
	].filter((candidate): candidate is string => Boolean(candidate));

	for (const candidate of candidates)
		if (refExists(candidate)) return candidate;
	return null;
}
